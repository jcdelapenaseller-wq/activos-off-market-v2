const axios = require('axios');
const cheerio = require('cheerio');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');

/**
 * BOE CRAWLER - ActivosOffMarket.es
 * 
 * Pipeline completo para la detección, extracción y enriquecimiento de subastas.
 */

const CONFIG = {
  AUCTIONS_FILE: path.join(__dirname, '../src/data/auctions.ts'),
  MIN_DISCOUNT: 30,
  USER_AGENT: 'ActivosOffMarket-Bot/1.0 (josecpmx@gmail.com)'
};

async function runCrawler() {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  console.log(`\n🚀 Iniciando crawler para la fecha: ${today}\n`);

  try {
    // 1. Obtener sumario del día
    const summaryUrl = `https://www.boe.es/datosabiertos/api/boe/sumario/${today}`;
    const summaryRes = await axios.get(summaryUrl);
    const parser = new xml2js.Parser({ explicitArray: false });
    const summaryData = await parser.parseStringPromise(summaryRes.data);

    // 2. Filtrar anuncios de subastas (Sección V)
    const items = summaryData.sumario.diario.seccion[4].item; // Sección V suele ser el índice 4
    const auctionAds = (Array.isArray(items) ? items : [items]).filter(item => 
      item.titulo.toLowerCase().includes('subasta')
    );

    console.log(`Found ${auctionAds.length} potential auction announcements.`);

    for (const ad of auctionAds) {
      const boeId = ad['@'].id;
      console.log(`\n🔍 Procesando anuncio BOE: ${boeId}`);

      // 3. Extraer SUB-IDs del contenido del anuncio
      const adUrl = `https://www.boe.es/datosabiertos/api/boe/anuncio/${boeId}`;
      const adRes = await axios.get(adUrl);
      const subIdRegex = /SUB-(JA|AT|SS|NE)-\d{4}-[A-Z0-9]+/g;
      const subIds = [...new Set(adRes.data.match(subIdRegex))];

      for (const subId of subIds) {
        try {
          await processAuction(subId, boeId);
        } catch (err) {
          console.error(`  ❌ Error procesando subasta ${subId}: ${err.message}`);
        }
      }
    }

  } catch (error) {
    console.error(`❌ Error general en el crawler: ${error.message}`);
  }
}

async function processAuction(subId, boeId) {
  console.log(`  📦 Extrayendo datos de subasta: ${subId}`);

  // 4. Scraping Portal de Subastas
  const data = await scrapePortal(subId);
  if (!data) return;

  // 5. Cálculos de oportunidad
  const discount = ((data.appraisalValue - data.claimedDebt) / data.appraisalValue) * 100;
  
  if (discount < CONFIG.MIN_DISCOUNT) {
    console.log(`  ⚠️ Descuento insuficiente (${discount.toFixed(2)}%). Saltando...`);
    return;
  }

  // 6. Enriquecimiento con Catastro
  let physicalData = {};
  if (data.referenceCadastral) {
    physicalData = await getCatastroData(data.referenceCadastral);
  }

  // 7. Geocodificación Inversa para Zona
  let zone = 'Desconocida';
  if (physicalData.lat && physicalData.lon) {
    zone = await getZoneFromCoords(physicalData.lat, physicalData.lon);
  }

  // Mapeo de propertyType
  const rawType = physicalData.use || data.description || "";
  const mappedType = mapPropertyType(rawType);

  if (!mappedType) {
    console.log(`  ⚠️ Tipo de propiedad no admitido o desconocido. Saltando...`);
    return;
  }

  // 8. Generar objeto AuctionData
  const auctionEntry = {
    propertyType: mappedType,
    city: physicalData.municipality || "Desconocida",
    zone: zone,
    address: data.address || physicalData.municipality,
    appraisalValue: data.appraisalValue,
    claimedDebt: data.claimedDebt,
    procedureType: "Subasta Pública",
    surface: physicalData.surface || 0,
    occupancy: "No indicada",
    description: data.description,
    boeId: subId,
    boeUrl: `https://subastas.boe.es/reg/detalleSubasta.php?idSub=${subId}`,
    publishedAt: new Date().toISOString(),
    slug: generateSlug(physicalData.municipality || 'subasta', zone, subId),
    auctionDate: data.auctionEnd,
    discount: parseFloat(discount.toFixed(2)),
    pricePerM2: physicalData.surface ? Math.round(data.appraisalValue / physicalData.surface) : 0
  };

  // 9. Guardar en auctions.ts
  saveAuction(auctionEntry);
  console.log(`  ✅ Subasta guardada con éxito: ${auctionEntry.slug}`);
}

async function scrapePortal(subId) {
  const urls = [
    `https://subastas.boe.es/reg/detalleSubasta.php?idSub=${subId}&ver=1`,
    `https://subastas.boe.es/reg/detalleSubasta.php?idSub=${subId}&ver=2`,
    `https://subastas.boe.es/reg/detalleSubasta.php?idSub=${subId}&ver=3`
  ];

  const results = {};
  
  // Tab 1: General
  const res1 = await axios.get(urls[0]);
  const $1 = cheerio.load(res1.data);
  results.auctionEnd = extractTableValue($1, 'Fecha de conclusión');

  // Tab 2: Económica
  const res2 = await axios.get(urls[1]);
  const $2 = cheerio.load(res2.data);
  results.appraisalValue = parseCurrency(extractTableValue($2, 'Valor de subasta'));
  results.claimedDebt = parseCurrency(extractTableValue($2, 'Cantidad reclamada'));

  // Tab 3: Bien
  const res3 = await axios.get(urls[2]);
  const $3 = cheerio.load(res3.data);
  results.address = extractTableValue($3, 'Dirección');
  results.referenceCadastral = extractTableValue($3, 'Referencia catastral');
  results.description = extractTableValue($3, 'Descripción');

  if (!results.appraisalValue || !results.claimedDebt) return null;
  return results;
}

async function getCatastroData(rc) {
  try {
    const url = `http://ovc.catastro.minhap.es/ovcservweb/ovcalllejer/ovccallejer.asmx/Consulta_DNPRC?RC=${rc}&Provincia=&Municipio=`;
    const res = await axios.get(url);
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(res.data);
    
    if (result.consulta_dnprc.lerr) return {};

    const bico = result.consulta_dnprc.bico;
    
    // Obtener Coordenadas
    const coordUrl = `http://ovc.catastro.minhap.es/ovcservweb/ovccoord/ovccoord.asmx/Consulta_CPMRC?Provincia=&Municipio=&RC=${rc}`;
    const coordRes = await axios.get(coordUrl);
    const coordData = await parser.parseStringPromise(coordRes.data);
    
    let lat = null, lon = null;
    if (!coordData.consulta_cpmrc.lerr) {
      lat = parseFloat(coordData.consulta_cpmrc.coordenadas.coord.geo.ycen);
      lon = parseFloat(coordData.consulta_cpmrc.coordenadas.coord.geo.xcen);
    }

    return {
      surface: parseInt(bico.bi.inf.sfc),
      use: bico.bi.inf.dest,
      municipality: bico.bi.dt.nm,
      lat,
      lon
    };
  } catch (e) {
    return {};
  }
}

async function getZoneFromCoords(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&accept-language=es`;
    const res = await axios.get(url, { headers: { 'User-Agent': CONFIG.USER_AGENT } });
    const addr = res.data.address;
    return addr.neighbourhood || addr.suburb || addr.city_district || 'Desconocida';
  } catch (e) {
    return 'Desconocida';
  }
}

function extractTableValue($, label) {
  let val = null;
  $('th').each((i, el) => {
    if ($(el).text().trim().toLowerCase().includes(label.toLowerCase())) {
      val = $(el).next('td').text().trim();
      return false;
    }
  });
  return val;
}

function parseCurrency(str) {
  if (!str) return 0;
  const cleaned = str.replace(/[^\d,]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

function generateSlug(city, zone, id) {
  return `${city}-${zone}-${id}`.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar acentos
    .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
}

function mapPropertyType(rawType) {
  if (!rawType) return null;
  const t = rawType.toLowerCase();

  // Orden de precedencia: más específico primero
  if (t.includes('piso') || t.includes('apartamento')) return 'Pisos';
  if (t.includes('chalet') || t.includes('unifamiliar')) return 'Chalets';
  if (t.includes('residencial') || t.includes('vivienda')) return 'Viviendas';
  if (t.includes('comercial') || t.includes('oficina') || t.includes('local')) return 'Locales';
  if (t.includes('garaje') || t.includes('estacionamiento') || t.includes('aparcamiento') || t.includes('plaza')) return 'Garajes';
  if (t.includes('industrial') || t.includes('nave')) return 'Naves';

  return null;
}

function saveAuction(auction) {
  const content = fs.readFileSync(CONFIG.AUCTIONS_FILE, 'utf8');
  
  // Evitar duplicados comprobando si el slug ya existe
  if (content.includes(`'${auction.slug}':`)) {
    console.log(`  ⚠️ Subasta ya existente: ${auction.slug}`);
    return;
  }

  // Encontrar el cierre del objeto AUCTIONS
  const lastBraceIndex = content.lastIndexOf('};');
  if (lastBraceIndex === -1) return;

  const newEntry = `  '${auction.slug}': ${JSON.stringify(auction, null, 2)},\n`;
  
  const updatedContent = content.slice(0, lastBraceIndex) + newEntry + content.slice(lastBraceIndex);
  fs.writeFileSync(CONFIG.AUCTIONS_FILE, updatedContent);
}

// Ejecutar
runCrawler();
