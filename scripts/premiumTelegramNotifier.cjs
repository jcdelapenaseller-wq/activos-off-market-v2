const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * PREMIUM TELEGRAM NOTIFIER - ActivosOffMarket.es
 * 
 * Envía alertas al canal Premium con datos detallados y análisis.
 */

const CONFIG = {
  PENDING_FILE: path.join(__dirname, 'pending_premium.json'),
  SENT_FILE: path.join(__dirname, 'sent_slugs_premium.txt'),
  BOT_TOKEN: process.env.BOT_TOKEN,
  PREMIUM_CHAT_ID: process.env.PREMIUM_CHAT_ID,
  BASE_URL: 'https://www.activosoffmarket.es/subasta'
};

const TOP_CITIES = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Málaga', 'Bilbao'];
const ALLOWED_TYPES = ['piso', 'vivienda', 'casa', 'chalet'];

const HOOKS = [
  "Ojo con esta. Acaba de entrar.",
  "Expediente interesante para revisar con calma.",
  "Acaba de saltar. Pinta bien.",
  "Atentos a los números de este activo."
];

const INTERPRETATIONS = [
  "La deuda deja margen, pero hay que cruzar con cargas previas.",
  "Si la posesión acompaña, los números cuadran.",
  "El descuento es bueno, la clave será la competencia.",
  "Parece limpio, pero el edicto manda.",
  "Valor de tasación en línea con mercado, hay recorrido."
];

const TRANSITIONS = [
  "Desglosando el expediente:",
  "Los números preliminares son estos:",
  "Entrando al detalle:"
];

const TEST_SCENARIOS = [
  {
    name: 'chollo',
    data: {
      slug: 'test-chollo-retiro',
      propertyType: 'Piso',
      city: 'Madrid',
      province: 'Madrid',
      zone: 'Retiro',
      address: 'Calle de Alfonso XII, 20',
      appraisalValue: 850000,
      claimedDebt: 320000,
      procedureType: 'JUDICIAL EN VIA DE APREMIO',
      occupancy: 'Vacío',
      auctionDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      discount: 62,
      squareMeters: 110
    }
  },
  {
    name: 'urgencia',
    data: {
      slug: 'test-urgencia-pozuelo',
      propertyType: 'Chalet',
      city: 'Pozuelo de Alarcón',
      province: 'Madrid',
      zone: 'Somosaguas',
      address: 'Avenida de Europa, 10',
      appraisalValue: 1200000,
      claimedDebt: 950000,
      procedureType: 'SEGURIDAD SOCIAL',
      occupancy: 'Ocupado por el deudor',
      auctionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      discount: 21,
      surface: 250
    }
  },
  {
    name: 'escasa',
    data: {
      slug: 'test-escasa-soria',
      propertyType: 'Nave',
      city: 'Soria',
      province: 'Soria',
      zone: 'Polígono Industrial',
      address: 'Calle C, Parcela 42',
      appraisalValue: 300000,
      claimedDebt: 120000,
      procedureType: 'NOTARIAL',
      occupancy: 'Sin datos',
      auctionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      discount: 60,
      squareMeters: 500
    }
  }
];

const FOMO_LINES = [
  "Aquí se gana en el detalle.",
  "Revisad bien antes de consignar.",
  "La diferencia está en lo que no sale en el edicto.",
  "Ojo a las cargas ocultas."
];

function formatCurrency(value) {
  if (!value) return "Pendiente";
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isValuable(val) {
  if (!val) return false;
  const forbidden = ['null', 'undefined', 'vacio', 'sin datos', 'desconocida', '—', '-', 'none'];
  const normalized = val.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  return !forbidden.includes(normalized);
}

function toHashtag(str) {
  if (!isValuable(str)) return null;
  // Elimina acentos, espacios y caracteres especiales, capitaliza la primera letra
  const clean = str.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "");
  if (!clean) return null;
  return '#' + clean.charAt(0).toUpperCase() + clean.slice(1);
}

function generateHashtags(auction) {
  const tags = [
    toHashtag(auction.propertyType),
    toHashtag(auction.city),
    toHashtag(auction.province),
    toHashtag(auction.zone)
  ].filter(Boolean);
  
  // Eliminar duplicados manteniendo el orden
  return [...new Set(tags)].join(' ');
}

async function sendTelegramMessage(text, chatId = null) {
  const targetChatId = chatId || process.env.PREMIUM_CHAT_ID;
  if (!process.env.BOT_TOKEN || !targetChatId) {
    console.error('❌ Error: BOT_TOKEN o CHAT_ID no configurados.');
    return;
  }
  const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;
  try {
    await axios.post(
      url,
      {
        chat_id: targetChatId,
        text: text,
        parse_mode: "HTML"
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    return true;
  } catch (error) {
    console.error('❌ Error enviando a Telegram:', error.response?.data || error.message);
    return false;
  }
}

function formatPremiumMessage(auction) {
  const hashtags = generateHashtags(auction);
  const debtRatio = auction.appraisalValue > 0 ? ((auction.claimedDebt / auction.appraisalValue) * 100).toFixed(1) : "N/A";
  
  let discountVal = auction.discount;
  if (!discountVal && auction.appraisalValue && auction.claimedDebt) {
     discountVal = Math.round(((auction.appraisalValue - auction.claimedDebt) / auction.appraisalValue) * 100);
  }
  const isHighDiscount = discountVal && discountVal > 40;

  let daysLeft = null;
  if (auction.auctionDate) {
    const closing = new Date(auction.auctionDate);
    const now = new Date();
    const diffTime = closing - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      daysLeft = diffDays;
    }
  }

  const sqm = auction.squareMeters || auction.surface || 0;
  let pricePerSqm = null;
  if (sqm > 0 && auction.appraisalValue > 0) {
    pricePerSqm = Math.round(auction.appraisalValue / sqm);
  }

  const typeTag = toHashtag(auction.propertyType) || '#Activo';
  const cityTag = toHashtag(auction.city) || '#España';
  const zoneTag = auction.zone && auction.zone !== 'Desconocida' && auction.zone !== 'Sin datos' ? ` (${toHashtag(auction.zone)})` : '';

  const discountText = discountVal ? `🔥 <b>${discountVal}% descuento teórico</b>` : '';
  
  let message = `${hashtags}\n\n`;
  
  message += `🏠 <b>${typeTag} en ${cityTag}${zoneTag}</b>\n`;
  message += `📍 ${auction.address}\n\n`;

  message += `🔒 <b>Análisis Premium</b>\n`;
  if (discountText) message += `${discountText}\n`;
  message += `📉 ratio deuda/tasación: ${debtRatio}%\n\n`;

  if (daysLeft) {
    message += `⏳ <b>Plazos</b>\n`;
    message += `• Cierre: en ${daysLeft} días\n\n`;
  }
  
  message += `📊 <b>Lectura rápida</b>\n`;
  message += `• deuda: ${formatCurrency(auction.claimedDebt)}\n`;
  message += `• tasación: ${formatCurrency(auction.appraisalValue)}\n`;
  if (pricePerSqm) message += `• ref m²: ${pricePerSqm} €/m²\n`;
  message += `• ratio: ${debtRatio}%\n`;
  
  const hasProcedure = isValuable(auction.procedureType);
  const hasOccupancy = isValuable(auction.occupancy);
  const hasCharges = isValuable(auction.charges);

  if (hasProcedure || hasOccupancy || hasCharges) {
    message += `\n🔎 <b>Claves</b>\n`;
    if (hasProcedure) message += `• ${auction.procedureType}\n`;
    if (hasOccupancy) message += `• ${auction.occupancy}\n`;
    if (hasCharges) message += `• ${auction.charges}\n`;
  }

  message += `\n🧮 <a href="https://www.activosoffmarket.es/calculadora-subastas">Simular inversión</a>\n`;
  message += `👉 <a href="${CONFIG.BASE_URL}/${auction.slug}">Ver ficha completa</a>\n\n`;
  
  // Consultoría solo si es oportunidad fuerte (score alto basado en descuento)
  if (isHighDiscount) {
    message += `📞 <a href="https://calendly.com/activosoffmarket">Reservar consultoría</a>\n\n`;
  }
  
  return message;
}

function formatFreeMessage(auction) {
  const typeTag = toHashtag(auction.propertyType) || '#Activo';
  const cityTag = toHashtag(auction.city) || '#España';
  const zoneTag = auction.zone && auction.zone !== 'Desconocida' && auction.zone !== 'Sin datos' ? ` (${toHashtag(auction.zone)})` : '';
  const hashtags = generateHashtags(auction);
  
  let discountVal = auction.discount;
  if (!discountVal && auction.appraisalValue && auction.claimedDebt) {
     discountVal = Math.round(((auction.appraisalValue - auction.claimedDebt) / auction.appraisalValue) * 100);
  }

  let message = `${hashtags}\n\n`;
  message += `🏠 <b>${typeTag} en ${cityTag}${zoneTag}</b>\n`;
  message += `📍 ${auction.address}\n\n`;
  
  if (discountVal) {
    message += `🔥 <b>${discountVal}% descuento teórico</b>\n\n`;
  }
  
  message += `💰 Tasación: ${formatCurrency(auction.appraisalValue)}\n`;
  message += `🏦 Deuda: ${formatCurrency(auction.claimedDebt)}\n\n`;
  
  message += `⚠️ <b>Hay un detalle clave en el expediente que cambia el escenario.</b>\n\n`;
  message += `👉 <a href="${CONFIG.BASE_URL}/${auction.slug}">Ver análisis completo</a>\n\n`;
  
  message += `🔒 <a href="https://sublaunch.com/activosoffmarket">Análisis completo + estrategia en Premium</a>\n\n`;
  
  return message;
}

async function runTestMode() {
  console.log('🧪 Ejecutando en MODO TEST con dataset interno...');
  
  // Seleccionar 2 escenarios aleatorios
  const shuffled = [...TEST_SCENARIOS].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 2);
  
  for (let i = 0; i < selected.length; i++) {
    const scenario = selected[i];
    console.log(`🧪 TEST scenario: ${scenario.name}`);
    
    // El primero lo enviamos como Premium, el segundo como Free (o ambos premium si se prefiere, 
    // pero el usuario pidió probar ambos formatos)
    if (i === 0) {
      console.log('🧪 Generando formato PREMIUM...');
      const msg = formatPremiumMessage(scenario.data);
      await sendTelegramMessage(msg, process.env.PREMIUM_CHAT_ID);
    } else {
      console.log('🧪 Generando formato FREE...');
      const msg = formatFreeMessage(scenario.data);
      // Enviamos al canal free si está configurado, si no al premium para ver el resultado
      const targetId = process.env.CHAT_ID || process.env.PREMIUM_CHAT_ID;
      await sendTelegramMessage(msg, targetId);
    }
    
    if (i === 0) await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('🧪 MODO TEST finalizado.');
}

async function runNotifier() {
  console.log('🚀 Iniciando notificador Premium...');
  console.log("TEST_MODE:", process.env.TEST_MODE);

  const isTestMode = process.env.TEST_MODE === "true";

  if (isTestMode) {
    await runTestMode();
    return;
  }

  if (!fs.existsSync(CONFIG.PENDING_FILE)) {
    console.log('ℹ️ No hay subastas pendientes para el canal Premium.');
    return;
  }

  let pending = [];
  if (fs.existsSync(CONFIG.PENDING_FILE)) {
    try {
      pending = JSON.parse(fs.readFileSync(CONFIG.PENDING_FILE, 'utf8'));
    } catch (error) {
      console.error('❌ Error leyendo pending_premium.json:', error.message);
      return;
    }
  }

  // Filtrar por tipos permitidos
  pending = pending.filter(a => ALLOWED_TYPES.includes((a.propertyType || '').toLowerCase()));

  // Priorizar ciudades TOP
  pending.sort((a, b) => {
    const aIsTop = TOP_CITIES.includes(a.city);
    const bIsTop = TOP_CITIES.includes(b.city);
    if (aIsTop && !bIsTop) return -1;
    if (!aIsTop && bIsTop) return 1;
    return 0;
  });

  // Limitar a 3 alertas por ejecución
  const toProcess = pending.slice(0, 3);

  console.log(`📢 Procesando ${toProcess.length} subastas (filtradas y priorizadas)...`);

  let sentSlugs = [];
  if (fs.existsSync(CONFIG.SENT_FILE)) {
    sentSlugs = fs.readFileSync(CONFIG.SENT_FILE, 'utf8').split('\n').filter(Boolean);
  }

  const processedSlugs = [];

  for (let i = 0; i < toProcess.length; i++) {
    const auction = toProcess[i];
    
    if (sentSlugs.includes(auction.slug)) {
      console.log(`⏭️ Saltando duplicado: ${auction.slug}`);
      processedSlugs.push(auction.slug);
      continue;
    }

    const message = formatPremiumMessage(auction);

    const success = await sendTelegramMessage(message);
    if (success) {
      console.log(`✅ Notificación premium enviada: ${auction.slug}`);
      if (!sentSlugs.includes(auction.slug)) {
        fs.appendFileSync(CONFIG.SENT_FILE, auction.slug + '\n');
        sentSlugs.push(auction.slug);
      }
      processedSlugs.push(auction.slug);
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Eliminar las procesadas de la lista original de pendientes
  const remaining = pending.filter(a => !processedSlugs.includes(a.slug));
  fs.writeFileSync(CONFIG.PENDING_FILE, JSON.stringify(remaining, null, 2));
  console.log(`🏁 Proceso finalizado. ${remaining.length} subastas restantes en cola.`);
}

runNotifier();
