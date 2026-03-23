const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * TELEGRAM NOTIFIER - ActivosOffMarket.es
 * 
 * Envía alertas de nuevas subastas con un tono humano, experto y optimizado para conversión.
 */

const CONFIG = {
  NEW_AUCTIONS_FILE: path.join(__dirname, 'new_auctions.json'),
  SENT_FILE: path.join(__dirname, 'sent_slugs.txt'),
  BOT_TOKEN: process.env.BOT_TOKEN,
  CHAT_ID: process.env.CHAT_ID,
  BASE_URL: 'https://www.activosoffmarket.es/subasta'
};

const TOP_CITIES = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Málaga', 'Bilbao'];
const ALLOWED_TYPES = ['piso', 'vivienda', 'casa', 'chalet'];

const HOOKS = [
  "Ojo con esta subasta. Acaba de entrar.",
  "Revisando el BOE me he cruzado con este expediente.",
  "Acaba de saltar esta alerta. Pinta bien.",
  "Echadle un vistazo a esto."
];

const EMOJI_MAP = {
  'piso': '🏠',
  'vivienda': '🏠',
  'casa': '🏡',
  'chalet': '🏡',
  'local': '🏬',
  'garaje': '🚗',
  'parking': '🚗',
  'solar': '🌍',
  'terreno': '🌍',
  'nave': '🏭',
  'edificio': '🏢'
};

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

/**
 * Formatea la fecha de YYYY-MM-DD a "DD mes"
 */
function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    const [year, month, day] = dateStr.split('-');
    const monthIndex = parseInt(month, 10) - 1;
    return `${parseInt(day, 10)} ${MONTHS[monthIndex]}`;
  } catch (e) {
    return dateStr;
  }
}

/**
 * Formatea moneda
 */
function formatCurrency(value) {
  if (!value) return null;
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

/**
 * Obtiene un elemento aleatorio de un array
 */
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Limpia strings para hashtags
 */
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

/**
 * Envía el mensaje a la API de Telegram
 */
async function sendTelegramMessage(text) {
  if (!process.env.BOT_TOKEN || !process.env.CHAT_ID) {
    console.error('❌ Error: BOT_TOKEN o CHAT_ID no configurados.');
    return;
  }

  const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;
  
  try {
    await axios.post(
      url,
      {
        chat_id: process.env.CHAT_ID,
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

/**
 * Proceso principal
 */
async function runNotifier() {
  console.log('🚀 Iniciando notificador humano de Telegram...');
  console.log("TEST_MODE:", process.env.TEST_MODE);

  // Forzado a false para producción
  const isTestMode = false; // process.env.TEST_MODE === "true";

  if (isTestMode) {
    console.log('🧪 Ejecutando en MODO TEST (Desactivado)...');
    return;
  }

  if (!fs.existsSync(CONFIG.NEW_AUCTIONS_FILE)) {
    console.log('ℹ️ No hay subastas nuevas para notificar.');
    return;
  }

  let auctions = [];
  try {
    const data = fs.readFileSync(CONFIG.NEW_AUCTIONS_FILE, 'utf8');
    auctions = JSON.parse(data);
  } catch (error) {
    console.error('❌ Error leyendo new_auctions.json:', error.message);
    return;
  }

  if (auctions.length === 0) {
    try { fs.unlinkSync(CONFIG.NEW_AUCTIONS_FILE); } catch (e) {}
    return;
  }

  const MAX_FREE = 1;
  console.log(`Found auctions: ${auctions.length}`);

  // 4) Filtrado obligatorio y Seguridad extra
  auctions = auctions.filter(a => {
    if (!a.slug) return false;
    if (!a.appraisalValue || a.appraisalValue <= 0) return false;
    if (!a.claimedDebt || a.claimedDebt <= 0) return false;
    
    const typeLower = (a.propertyType || '').toLowerCase();
    if (!ALLOWED_TYPES.includes(typeLower)) return false;
    
    return true;
  });
  console.log(`After type filter: ${auctions.length}`);

  // 3) Evitar duplicados dentro del mismo run
  const uniqueAuctions = [];
  const seenSlugs = new Set();
  for (const a of auctions) {
    if (!seenSlugs.has(a.slug)) {
      seenSlugs.add(a.slug);
      uniqueAuctions.push(a);
    }
  }
  auctions = uniqueAuctions;
  console.log(`After dedupe: ${auctions.length}`);

  // 2) Evitar duplicados históricos
  let sentSlugs = [];
  if (fs.existsSync(CONFIG.SENT_FILE)) {
    sentSlugs = fs.readFileSync(CONFIG.SENT_FILE, 'utf8').split('\n').filter(Boolean);
  }
  const sentSlugsSet = new Set(sentSlugs);

  auctions = auctions.filter(a => !sentSlugsSet.has(a.slug));
  console.log(`After sent filter: ${auctions.length}`);

  // 5) Prioridad de envío
  auctions.sort((a, b) => {
    const scoreA = a.opportunityScore || 0;
    const scoreB = b.opportunityScore || 0;
    if (scoreA !== scoreB) return scoreB - scoreA;

    const aIsTop = TOP_CITIES.includes(a.city) ? 1 : 0;
    const bIsTop = TOP_CITIES.includes(b.city) ? 1 : 0;
    if (aIsTop !== bIsTop) return bIsTop - aIsTop;

    const discountA = a.discount || (a.appraisalValue ? Math.round(((a.appraisalValue - a.claimedDebt) / a.appraisalValue) * 100) : 0);
    const discountB = b.discount || (b.appraisalValue ? Math.round(((b.appraisalValue - b.claimedDebt) / b.appraisalValue) * 100) : 0);
    if (discountA !== discountB) return discountB - discountA;

    const ratioA = a.appraisalValue ? (a.claimedDebt / a.appraisalValue) : 1;
    const ratioB = b.appraisalValue ? (b.claimedDebt / b.appraisalValue) : 1;
    return ratioA - ratioB;
  });

  // 1) Límite por ejecución
  const toProcess = auctions.slice(0, MAX_FREE);
  console.log(`Sending FREE: ${toProcess.length}`);

  for (const auction of toProcess) {
    // Selección de emoji
    const typeLower = (auction.propertyType || '').toLowerCase();
    const emoji = EMOJI_MAP[typeLower] || '🏢';

    // Construcción de hashtags
    const hashtags = generateHashtags(auction);

    // Formateo de datos
    const appraisal = formatCurrency(auction.appraisalValue);
    const debt = formatCurrency(auction.claimedDebt);
    const discountVal = auction.discount || (auction.appraisalValue ? Math.round(((auction.appraisalValue - auction.claimedDebt) / auction.appraisalValue) * 100) : 0);

    // Construcción del mensaje (DIETA: Corto, preciso, 1 CTA)
    let message = `${emoji} <b>${hashtags}</b>\n`;
    message += `📍 ${auction.address}\n\n`;

    if (discountVal > 0) {
      message += `🔥 <b>${discountVal}% descuento teórico</b>\n\n`;
    }
    
    if (appraisal) message += `💰 Tasación: ${appraisal}\n`;
    if (debt) message += `🏦 Deuda: ${debt}\n\n`;
    
    message += `⚠️ <b>Hay un detalle clave en el expediente que cambia el escenario.</b>\n\n`;
    
    message += `👉 <a href="${CONFIG.BASE_URL}/${auction.slug}">Ver oportunidad</a>\n\n`;
    
    message += `🔒 <a href="https://sublaunch.com/activosoffmarket">Análisis completo + estrategia en Premium</a>`;

    // Enviar mensaje
    const success = await sendTelegramMessage(message);
    if (success) {
      console.log(`✅ Notificación enviada: ${auction.slug}`);
      fs.appendFileSync(CONFIG.SENT_FILE, auction.slug + '\n');
      sentSlugsSet.add(auction.slug);
    }

    // Delay para evitar rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Eliminar el archivo temporal
  try {
    fs.unlinkSync(CONFIG.NEW_AUCTIONS_FILE);
    console.log('🗑️ Archivo new_auctions.json eliminado.');
  } catch (error) {
    console.error('❌ Error eliminando el archivo temporal:', error.message);
  }

  console.log('🏁 Proceso finalizado.');
}

runNotifier();
