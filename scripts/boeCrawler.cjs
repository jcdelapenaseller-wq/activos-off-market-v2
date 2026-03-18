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

const newAuctionsBatch = [];
const auctionsToSave = [];
const premiumAuctions = [];

const CONFIG = {
  AUCTIONS_FILE: path.join(__dirname, '../src/data/auctions.ts'),
  PENDING_PREMIUM_FILE: path.join(__dirname, 'pending_premium.json'),
  MIN_DISCOUNT: 15,
  USER_AGENT: 'ActivosOffMarket-Bot/1.0 (josecpmx@gmail.com)'
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function safeRequest(url, retries = 3) {
  const delay = 1000 + Math.random() * 1000;
  await sleep(delay);
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get(url, { headers: { 'User-Agent': CONFIG.USER_AGENT } });
    } catch (err) {
      if (i === retries - 1) throw err;
      await sleep(2000 * (i + 1));
    }
  }
}

async function runCrawler() {
  // Load existing premium auctions to avoid duplicates
  let existingPremium = [];
  if (fs.existsSync(CONFIG.PENDING_PREMIUM_FILE)) {
    try {
      existingPremium = JSON.parse(fs.readFileSync(CONFIG.PENDING_PREMIUM_FILE, 'utf8'));
    } catch (e) {
      console.error('Error reading pending_premium.json:', e.message);
    }
  }
  premiumAuctions.push(...existingPremium);

  const dates = [];

  for (let i = 0; i < 10; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0,10).replace(/-/g,"");
    dates.push(dateStr);
  }

  for (const dateStr of dates) {
    console.log(`🚀 Iniciando crawler para la fecha: ${dateStr}`);
    await runCrawlerForDate(dateStr);
  }

  // 10. Guardar subastas nuevas en archivo temporal
  if (newAuctionsBatch.length > 0) {
    fs.writeFileSync(path.join(__dirname, 'new_auctions.json'), JSON.stringify(newAuctionsBatch, null, 2));
    console.log(`\n📝 Archivo new_auctions.json generado con ${newAuctionsBatch.length} subastas.`);
  }
  // Guardar en pending_premium.json
  fs.writeFileSync(CONFIG.PENDING_PREMIUM_FILE, JSON.stringify(premiumAuctions, null, 2));
  console.log(`\n📝 Archivo pending_premium.json actualizado con ${premiumAuctions.length} subastas.`);
  
  // Guardar lote final en auctions.ts
  writeAuctionsBatchToFile();
}

async function runCrawlerForDate(today) {
  try {
    // 1. Obtener sumario del día
    const summaryUrl = `https://www.boe.es/datosabiertos/api/boe/sumario/${today}`;
    const summaryRes = await safeRequest(summaryUrl);
    const summaryData = summaryRes.data;

    console.log(JSON.stringify(summaryData, null, 2).substring(0,1000));

    let count = 0;
    try {
      const diarios = [].concat(summaryData.data.sumario.diario || []);
      for (const diario of diarios) {
        const secciones = [].concat(diario.seccion || []);
        for (const seccion of secciones) {
          const departamentos = [].concat(seccion.departamento || []);
          for (const departamento of departamentos) {
            const epigrafes = [].concat(departamento.epigrafe || []);
            for (const epigrafe of epigrafes) {
              const itemsList = [].concat(epigrafe.item || []);
              for (const item of itemsList) {
                if (count < 20) {
                  console.log(item.identificador);
                  console.log(item.titulo);
                  count++;
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.error("Error en diagnóstico:", e.message);
    }

    // 2. Filtrar anuncios de subastas (Sección V)
    const diariosList = [].concat(summaryData.data.sumario.diario || []);
    let items = [];

    for (const diario of diariosList) {
      const secciones = [].concat(diario.seccion || []);
      for (const seccion of secciones) {
        console.log("SECCION:", seccion.nombre);

        if (seccion.nombre && seccion.nombre.includes("Anuncios")) {
          const departamentos = [].concat(seccion.departamento || []);
          for (const departamento of departamentos) {
            const epigrafes = [].concat(departamento.epigrafe || []);
            for (const epigrafe of epigrafes) {
              const itemsList = [].concat(epigrafe.item || []);
              for (const item of itemsList) {
                console.log("ANUNCIO ITEM:", item.identificador);
              }
            }
          }
        }

        const departamentos = [].concat(seccion.departamento || []);
        for (const departamento of departamentos) {
          const epigrafes = [].concat(departamento.epigrafe || []);
          for (const epigrafe of epigrafes) {
            const itemsList = [].concat(epigrafe.item || []);
            items = items.concat(itemsList);
          }
        }
      }
    }

    // DIAGNOSTICO
    let countA = 0;
    let countB = 0;

    for (const item of items) {
      if (item && item.identificador) {
        console.log("ITEM:", item.identificador);

        if (item.identificador.startsWith("BOE-A")) countA++;
        if (item.identificador.startsWith("BOE-B")) countB++;
      }
    }

    console.log("TOTAL BOE-A:", countA);
    console.log("TOTAL BOE-B:", countB);

    const auctionAds = items.filter(item =>
      item.identificador && item.identificador.startsWith("BOE-B")
    );

    console.log(`Found ${auctionAds.length} potential auction announcements.`);

    for (const ad of auctionAds) {
      const boeId = ad['@'].id;
      console.log(`\n🔍 Procesando anuncio BOE: ${boeId}`);

      // 3. Extraer SUB-IDs del contenido del anuncio
      const adUrl = `https://www.boe.es/datosabiertos/api/boe/anuncio/${boeId}`;
      const adRes = await safeRequest(adUrl);
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
    console.error(`❌ Error general en el crawler para ${today}: ${error.message}`);
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
  const mappedType = mapPropertyType(rawType, data.description || "");

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
  bufferAuction(auctionEntry);
  console.log(`  ✅ Subasta bufferizada: ${auctionEntry.slug}`);
  
  // Canal gratuito: Solo subastas con descuento > 35%
  if (auctionEntry.discount > 35) {
    newAuctionsBatch.push({
      slug: auctionEntry.slug,
      city: auctionEntry.city,
      zone: auctionEntry.zone,
      propertyType: auctionEntry.propertyType,
      appraisalValue: auctionEntry.appraisalValue,
      claimedDebt: auctionEntry.claimedDebt,
      discount: auctionEntry.discount,
      auctionDate: auctionEntry.auctionDate,
      address: auctionEntry.address
    });
  }
}

async function scrapePortal(subId) {
  const urls = [
    `https://subastas.boe.es/reg/detalleSubasta.php?idSub=${subId}&ver=1`,
    `https://subastas.boe.es/reg/detalleSubasta.php?idSub=${subId}&ver=2`,
    `https://subastas.boe.es/reg/detalleSubasta.php?idSub=${subId}&ver=3`
  ];

  const results = {};
  
  // Tab 1: General
  const res1 = await safeRequest(urls[0]);
  const $1 = cheerio.load(res1.data);
  results.auctionEnd = extractTableValue($1, 'Fecha de conclusión');

  // Tab 2: Económica
  const res2 = await safeRequest(urls[1]);
  const $2 = cheerio.load(res2.data);
  results.appraisalValue = parseCurrency(extractTableValue($2, 'Valor de subasta'));
  results.claimedDebt = parseCurrency(extractTableValue($2, 'Cantidad reclamada'));

  // Tab 3: Bien
  const res3 = await safeRequest(urls[2]);
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
    const res = await safeRequest(url);
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(res.data);
    
    if (result.consulta_dnprc.lerr) return {};

    const bico = result.consulta_dnprc.bico;
    
    // Obtener Coordenadas
    const coordUrl = `http://ovc.catastro.minhap.es/ovcservweb/ovccoord/ovccoord.asmx/Consulta_CPMRC?Provincia=&Municipio=&RC=${rc}`;
    const coordRes = await safeRequest(coordUrl);
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
    const res = await safeRequest(url);
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

function mapPropertyType(rawType, description) {
  const text = (rawType + " " + description).toLowerCase();

  // Orden de precedencia: más específico primero
  if (text.includes('piso') || text.includes('apartamento')) return 'Pisos';
  if (text.includes('chalet') || text.includes('unifamiliar')) return 'Chalets';
  if (text.includes('residencial') || text.includes('vivienda')) return 'Viviendas';
  if (text.includes('comercial') || text.includes('oficina') || text.includes('local')) return 'Locales';
  if (text.includes('garaje') || text.includes('estacionamiento') || text.includes('aparcamiento') || text.includes('plaza')) return 'Garajes';
  if (text.includes('industrial') || text.includes('nave')) return 'Naves';
  if (text.includes('solar') || text.includes('terreno') || text.includes('parcela') || text.includes('finca rustica')) return 'Terrenos';

  return 'Inmueble';
}

function bufferAuction(auction) {
  auctionsToSave.push(auction);

  // Add to premium queue if not exists
  if (!premiumAuctions.find(a => a.slug === auction.slug)) {
    premiumAuctions.push({
      slug: auction.slug,
      city: auction.city,
      zone: auction.zone,
      propertyType: auction.propertyType,
      address: auction.address,
      appraisalValue: auction.appraisalValue,
      claimedDebt: auction.claimedDebt,
      procedureType: auction.procedureType,
      auctionDate: auction.auctionDate,
      discount: auction.discount,
      detectedAt: new Date().toISOString()
    });
  }
}

function writeAuctionsBatchToFile() {
  if (auctionsToSave.length === 0) return;
  
  const content = fs.readFileSync(CONFIG.AUCTIONS_FILE, 'utf8');
  const finalBatch = auctionsToSave.filter(a => !content.includes(`'${a.slug}':`));
  
  if (finalBatch.length === 0) {
    console.log(`  ℹ️ No hay subastas nuevas para guardar.`);
    return;
  }

  const lastBraceIndex = content.lastIndexOf('};');
  if (lastBraceIndex === -1) return;

  const newEntries = finalBatch.map(a => `  '${a.slug}': ${JSON.stringify(a, null, 2)},\n`).join('');
  
  const updatedContent = content.slice(0, lastBraceIndex) + newEntries + content.slice(lastBraceIndex);
  fs.writeFileSync(CONFIG.AUCTIONS_FILE, updatedContent);
  console.log(`  ✅ ${finalBatch.length} subastas guardadas en auctions.ts`);
}

// Ejecutar
runCrawler();
