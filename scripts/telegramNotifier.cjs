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
function toHashtag(str) {
  if (!str) return '';
  // Elimina acentos, espacios y caracteres especiales, capitaliza la primera letra
  const clean = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "");
  return '#' + clean.charAt(0).toUpperCase() + clean.slice(1);
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
    fs.unlinkSync(CONFIG.NEW_AUCTIONS_FILE);
    return;
  }

  let sentSlugs = [];
  if (fs.existsSync(CONFIG.SENT_FILE)) {
    sentSlugs = fs.readFileSync(CONFIG.SENT_FILE, 'utf8').split('\n').filter(Boolean);
  }

  console.log(`📢 Procesando ${auctions.length} subastas...`);

  // Filtrar por tipos permitidos (solo vivienda)
  auctions = auctions.filter(a => ALLOWED_TYPES.includes((a.propertyType || '').toLowerCase()));

  // Calcular score y filtrar por calidad/ubicación
  auctions = auctions.map(a => {
    let discountVal = a.discount;
    if (!discountVal && a.appraisalValue && a.claimedDebt) {
      discountVal = Math.round(((a.appraisalValue - a.claimedDebt) / a.appraisalValue) * 100);
    }
    return { ...a, calculatedScore: discountVal || 0 };
  }).filter(a => {
    const isTop = TOP_CITIES.includes(a.city);
    // Prioridad TOP o score > 30
    return isTop || a.calculatedScore > 30;
  });

  // Priorizar ciudades TOP y luego por score
  auctions.sort((a, b) => {
    const aIsTop = TOP_CITIES.includes(a.city);
    const bIsTop = TOP_CITIES.includes(b.city);
    if (aIsTop && !bIsTop) return -1;
    if (!aIsTop && bIsTop) return 1;
    return b.calculatedScore - a.calculatedScore;
  });

  // Limitar a 1 alerta por ejecución en el canal gratuito
  const toProcess = auctions.slice(0, 1);

  for (const auction of toProcess) {
    if (sentSlugs.includes(auction.slug)) {
      console.log(`⏭️ Saltando duplicado: ${auction.slug}`);
      continue;
    }

    // Selección de emoji
    const typeLower = (auction.propertyType || '').toLowerCase();
    const emoji = EMOJI_MAP[typeLower] || '🏢';

    // Construcción de hashtags
    const hashtags = [
      toHashtag(auction.propertyType),
      toHashtag(auction.city),
      auction.zone && auction.zone !== 'Desconocida' ? toHashtag(auction.zone) : ''
    ].filter(Boolean).join(' ');

    // Formateo de datos
    const appraisal = formatCurrency(auction.appraisalValue);
    const debt = formatCurrency(auction.claimedDebt);
    const discountVal = auction.calculatedScore;

    // Línea de ubicación y tipo
    const location = auction.zone && auction.zone !== 'Desconocida' 
      ? `${auction.city} (${auction.zone})` 
      : `${auction.city}`;
    const propertyType = auction.propertyType ? auction.propertyType.charAt(0).toUpperCase() + auction.propertyType.slice(1) : 'Activo';

    // Construcción del mensaje (DIETA: Corto, preciso, 1 CTA)
    let message = `${hashtags}\n\n`;
    message += `${emoji} <b>${propertyType} en ${location}</b>\n`;
    if (discountVal > 0) {
      message += `🔥 <b>${discountVal}% descuento</b>\n\n`;
    } else {
      message += `\n`;
    }
    
    if (appraisal) message += `💰 Tasación: ${appraisal}\n`;
    if (debt) message += `🏦 Deuda: ${debt}\n\n`;
    
    message += `⚠️ <b>Hay un detalle clave en el expediente que cambia el escenario.</b>\n\n`;
    
    message += `👉 <a href="${CONFIG.BASE_URL}/${auction.slug}">Ver oportunidad</a>\n\n`;
    
    message += `🔒 <b>En premium: análisis completo + estrategia</b>\n`;
    message += `👉 <a href="https://sublaunch.com/activosoffmarket">Acceso premium</a>`;

    // Enviar mensaje
    const success = await sendTelegramMessage(message);
    if (success) {
      console.log(`✅ Notificación enviada: ${auction.slug}`);
      fs.appendFileSync(CONFIG.SENT_FILE, auction.slug + '\n');
      sentSlugs.push(auction.slug);
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
