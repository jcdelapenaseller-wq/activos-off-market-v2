import { calculateDiscount } from '../src/utils/auctionHelpers';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Parser } from 'xml2js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * HISTORICAL LOADER - ActivosOffMarket.es
 * 
 * Carga excepcional de subastas de los últimos 30 días.
 * Filtra por residenciales y mantiene coherencia temporal.
 */

const CONFIG = {
  AUCTIONS_FILE: path.join(__dirname, '../src/data/auctions.ts'),
  MIN_DISCOUNT: 15,
  USER_AGENT: 'ActivosOffMarket-Bot/1.0 (josecpmx@gmail.com)',
  DAYS_BACK: 30
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function safeRequest(url: string, retries = 3) {
  const delay = 500 + Math.random() * 500;
  await sleep(delay);
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get(url, { 
        headers: { 'User-Agent': CONFIG.USER_AGENT },
        timeout: 10000
      });
    } catch (err: any) {
      if (i === retries - 1) throw err;
      await sleep(1000 * (i + 1));
    }
  }
}

const auctionsToSave: any[] = [];

async function runHistoricalLoader() {
  console.log(`🚀 Iniciando CARGA HISTÓRICA (${CONFIG.DAYS_BACK} días)...`);
  
  const dates = [];
  for (let i = 0; i <= CONFIG.DAYS_BACK; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10).replace(/-/g, "");
    dates.push({
      dateStr,
      isoDate: d.toISOString()
    });
  }

  // Cargar contenido actual para evitar duplicados en memoria
  const currentContent = fs.readFileSync(CONFIG.AUCTIONS_FILE, 'utf8');

  for (const dateObj of dates) {
    console.log(`\n📅 Procesando BOE del día: ${dateObj.dateStr}`);
    try {
      await processBOEDate(dateObj.dateStr, dateObj.isoDate, currentContent);
    } catch (err: any) {
      console.error(`❌ Error procesando fecha ${dateObj.dateStr}: ${err.message}`);
    }
  }

  console.log(`\n✨ Proceso finalizado. Total subastas a guardar: ${auctionsToSave.length}`);
  writeAuctionsBatchToFile();
}

async function processBOEDate(today: string, isoDate: string, currentContent: string) {
  const summaryUrl = `https://www.boe.es/datosabiertos/api/boe/sumario/${today}`;
  const summaryRes = await safeRequest(summaryUrl);
  if (!summaryRes || !summaryRes.data) return;

  const summaryData = summaryRes.data;
  const diariosList = [].concat(summaryData.data?.sumario?.diario || []);
  let items: any[] = [];

  for (const diario of diariosList as any[]) {
    const secciones = [].concat(diario.seccion || []);
    for (const seccion of secciones as any[]) {
      if (seccion.nombre && seccion.nombre.includes("Anuncios")) {
        const departamentos = [].concat(seccion.departamento || []);
        for (const departamento of departamentos as any[]) {
          const epigrafes = [].concat(departamento.epigrafe || []);
          for (const epigrafe of epigrafes as any[]) {
            const itemsList = [].concat(epigrafe.item || []);
            items = items.concat(itemsList);
          }
        }
      }
    }
  }

  const auctionAds = items.filter(item =>
    item.identificador && item.identificador.startsWith("BOE-B")
  );

  console.log(`  Found ${auctionAds.length} announcements in Section V.`);

  for (const ad of auctionAds) {
    const boeId = ad['@'].id;
    
    // 1. Extraer SUB-IDs
    const adUrl = `https://www.boe.es/datosabiertos/api/boe/anuncio/${boeId}`;
    const adRes = await safeRequest(adUrl);
    if (!adRes || !adRes.data) continue;

    const subIdRegex = /SUB-(JA|AT|SS|NE)-\d{4}-[A-Z0-9]+/g;
    const subIds = [...new Set(adRes.data.match(subIdRegex))];

    for (const subId of subIds as string[]) {
      const slug = generateSlug('subasta', subId); // Temporary slug for check
      if (currentContent.includes(`'${slug}':`) || auctionsToSave.some(a => a.boeId === subId)) {
        // console.log(`  ⏩ Subasta ${subId} ya existe. Saltando...`);
        continue;
      }

      try {
        await processAuction(subId, isoDate);
      } catch (err: any) {
        console.error(`    ❌ Error en ${subId}: ${err.message}`);
      }
    }
  }
}

async function processAuction(subId: string, publishedAt: string) {
  const data = await scrapePortal(subId);
  if (!data) return;

  // Filtro de Calidad (Residencial)
  const mappedType = mapPropertyType(data.description || "");
  const residentialTypes = ['Pisos', 'Chalets', 'Viviendas'];
  
  if (!residentialTypes.includes(mappedType)) {
    // console.log(`  ⚠️ Tipo ${mappedType} no residencial. Saltando...`);
    return;
  }

  // Filtros de Calidad (Valor y Deuda)
  if (data.appraisalValue < 100000) {
    // console.log(`  ⚠️ Valor tasación bajo (${data.appraisalValue}). Saltando...`);
    return;
  }

  if (data.claimedDebt === 0) {
    // console.log(`  ⚠️ Deuda cero. Saltando...`);
    return;
  }

  // Filtro de Descuento (Ratio <= 85%)
  const discount = calculateDiscount(data.appraisalValue, undefined, data.claimedDebt);
  if (discount === null || discount < CONFIG.MIN_DISCOUNT || discount > 85) {
    return;
  }

  // Enriquecimiento básico (sin Catastro para velocidad en carga masiva, o limitado)
  // Usamos los datos del BOE directamente
  const city = extractCityFromDescription(data.description || "") || "Desconocida";
  const slug = generateSlug(city, subId);

  const status = mapStatus(data.status);
  const isActive = status === 'active' || status === 'upcoming';

  const auctionEntry = {
    propertyType: mappedType,
    city: city,
    province: "Desconocida", // Se podría mejorar con más regex
    municipality: city.toUpperCase(),
    zone: "",
    address: data.address || "Ver descripción",
    appraisalValue: data.appraisalValue,
    claimedDebt: data.claimedDebt,
    procedureType: "Subasta Pública",
    surface: 0,
    occupancy: "No indicada",
    description: data.description,
    boeId: subId,
    boeUrl: `https://subastas.boe.es/reg/detalleSubasta.php?idSub=${subId}`,
    publishedAt: publishedAt,
    lastCheckedAt: new Date().toISOString(),
    auctionDate: data.auctionEnd,
    status: status,
    isActive: isActive,
    discount: discount,
    pricePerM2: 0
  };

  auctionsToSave.push(auctionEntry);
  console.log(`  ✅ Añadida: ${subId} (${mappedType} en ${city}) - Status: ${status}`);
}

async function scrapePortal(subId: string) {
  try {
    const urls = [
      `https://subastas.boe.es/reg/detalleSubasta.php?idSub=${subId}&ver=1`,
      `https://subastas.boe.es/reg/detalleSubasta.php?idSub=${subId}&ver=2`,
      `https://subastas.boe.es/reg/detalleSubasta.php?idSub=${subId}&ver=3`
    ];

    const results: any = {};
    
    // Tab 1: General
    const res1 = await safeRequest(urls[0]);
    if (!res1) return null;
    const $1 = cheerio.load(res1.data);
    results.auctionEnd = extractTableValue($1, 'Fecha de conclusión');
    results.status = extractTableValue($1, 'Estado');

    // Tab 2: Económica
    const res2 = await safeRequest(urls[1]);
    if (!res2) return null;
    const $2 = cheerio.load(res2.data);
    results.appraisalValue = parseCurrency(extractTableValue($2, 'Valor de subasta'));
    results.claimedDebt = parseCurrency(extractTableValue($2, 'Cantidad reclamada'));

    // Tab 3: Bien
    const res3 = await safeRequest(urls[2]);
    if (!res3) return null;
    const $3 = cheerio.load(res3.data);
    results.address = extractTableValue($3, 'Dirección');
    results.description = extractTableValue($3, 'Descripción');

    if (!results.appraisalValue || !results.claimedDebt) return null;
    return results;
  } catch (e) {
    return null;
  }
}

function extractTableValue($: any, label: string) {
  let val: string | null = null;
  $('th').each((i: number, el: any) => {
    if ($(el).text().trim().toLowerCase().includes(label.toLowerCase())) {
      val = $(el).next('td').text().trim();
      return false;
    }
  });
  return val;
}

function parseCurrency(str: string | null) {
  if (!str) return 0;
  const cleaned = str.replace(/[^\d,]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

function generateSlug(city: string, id: string) {
  return `subasta-${city}-${id}`.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
}

function mapPropertyType(description: string) {
  const text = description.toLowerCase();
  if (text.includes('piso') || text.includes('apartamento')) return 'Pisos';
  if (text.includes('chalet') || text.includes('unifamiliar')) return 'Chalets';
  if (text.includes('residencial') || text.includes('vivienda')) return 'Viviendas';
  return 'Inmueble';
}

function mapStatus(rawStatus: string | null): string {
  if (!rawStatus) return 'active';
  const s = rawStatus.toLowerCase();
  if (s.includes('próxima') || s.includes('proxima')) return 'upcoming';
  if (s.includes('celebrándose') || s.includes('celebrandose')) return 'active';
  if (s.includes('suspendida')) return 'suspended';
  if (s.includes('finalizada') || s.includes('cancelada') || s.includes('concluida')) return 'closed';
  return 'active';
}

function extractCityFromDescription(description: string) {
  // Intento básico de extraer ciudad si aparece tras "en" o similar
  const match = description.match(/en\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*)/);
  return match ? match[1] : null;
}

function writeAuctionsBatchToFile() {
  if (auctionsToSave.length === 0) return;
  
  let content = fs.readFileSync(CONFIG.AUCTIONS_FILE, 'utf8');
  
  const newEntries = auctionsToSave.map(a => {
    const slug = a.slug || generateSlug(a.city, a.boeId);
    return `  '${slug}': ${JSON.stringify(a, null, 2)},\n`;
  }).join('');
  
  const insertionPoint = content.indexOf('export const AUCTIONS: Record<string, AuctionData> = {');
  if (insertionPoint === -1) return;

  const openBraceIndex = content.indexOf('{', insertionPoint);
  const updatedContent = content.slice(0, openBraceIndex + 1) + '\n' + newEntries + content.slice(openBraceIndex + 1);
  
  fs.writeFileSync(CONFIG.AUCTIONS_FILE, updatedContent);
  console.log(`  ✅ ${auctionsToSave.length} subastas históricas guardadas en auctions.ts`);
}

runHistoricalLoader();
