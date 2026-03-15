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
  BOT_TOKEN: process.env.BOT_TOKEN,
  CHAT_ID: process.env.CHAT_ID,
  BASE_URL: 'https://www.activosoffmarket.es/subasta'
};

const HOOKS = [
  "Acaba de aparecer esta subasta en el BOE y merece una revisión rápida.",
  "Estoy revisando este expediente ahora mismo y tiene algunos puntos interesantes.",
  "Este activo acaba de publicarse y puede tener potencial.",
  "Este expediente acaba de saltar en el radar.",
  "Estoy analizando esta subasta y hay algunos detalles interesantes.",
  "He visto este expediente recién salido del horno y me ha llamado la atención.",
  "Acabo de detectar esta oportunidad en el BOE y estoy analizando los detalles.",
  "Ojo a esta subasta que acaba de publicarse, tiene una pinta interesante para estudiar.",
  "Revisando las novedades del BOE, me he topado con este activo que promete.",
  "Esta oportunidad acaba de saltar en el radar y parece que merece un análisis rápido.",
  "Acaban de publicar este expediente y creo que puede ser una buena oportunidad.",
  "Estoy analizando esta nueva subasta que ha salido hoy, tiene datos curiosos.",
  "He encontrado este activo en el BOE y me parece que tiene bastante juego.",
  "Este anuncio acaba de salir y merece echarle un vistazo antes de que se llene de gente.",
  "Nueva entrada en el BOE que me ha hecho parar un momento a revisar.",
  "Acabo de ver este expediente y por zona podría ser muy interesante.",
  "Mirando las subastas de hoy, esta destaca por encima del resto.",
  "Hay movimiento en el BOE y este activo es de los que hay que seguir.",
  "He detectado este expediente y los números preliminares llaman la atención.",
  "Acaba de entrar esta subasta y ya estoy pidiendo nota simple para ver qué hay.",
  "Acaba de publicarse esta subasta en el BOE y merece una revisión rápida.",
  "Este expediente acaba de aparecer en el BOE y tiene algunos elementos interesantes.",
  "Esta subasta acaba de publicarse y merece una mirada rápida."
];

const INSIGHTS = [
  "Este tipo de activos en zonas céntricas suele generar bastante interés cuando empiezan las pujas.",
  "La clave aquí será revisar bien la situación posesoria.",
  "Habrá que mirar con lupa las cargas registrales.",
  "Este tipo de expedientes a veces se resuelven con bastante competencia.",
  "El valor de tasación parece atractivo, pero hay que validar precios reales de mercado.",
  "La ubicación es estratégica, lo que suele reducir el riesgo de comercialización posterior.",
  "Ojo con los plazos de este juzgado, suelen ser algo lentos en los decretos de adjudicación.",
  "Parece que hay un buen margen de seguridad si la puja no se dispara demasiado.",
  "Es fundamental confirmar si existen deudas de comunidad o IBI pendientes de pago.",
  "Este expediente tiene una deuda reclamada baja respecto a la tasación, lo cual es buena señal.",
  "Activos como este suelen ser ideales para inversores que buscan rentabilidad por alquiler.",
  "La tipología del activo es muy demandada en esta zona concreta.",
  "Hay que verificar si el activo está ocupado o si se puede tomar posesión rápido.",
  "Si el descuento se mantiene, la rentabilidad neta podría ser de dos dígitos.",
  "Recomiendo revisar el edicto para confirmar si hay algún derecho de adquisición preferente."
];

const CURIOSITY_TRIGGERS = [
  "Hay un detalle del expediente que puede cambiar bastante el riesgo real.",
  "Este expediente tiene un matiz interesante que estoy revisando.",
  "Hay un punto del edicto que merece analizarse con calma."
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
  if (!CONFIG.BOT_TOKEN || !CONFIG.CHAT_ID) {
    console.error('❌ Error: BOT_TOKEN o CHAT_ID no configurados.');
    return;
  }

  const url = `https://api.telegram.org/bot${CONFIG.BOT_TOKEN}/sendMessage`;
  
  try {
    console.log("DEBUG CHAT_ID:", process.env.CHAT_ID);
    await axios.post(url, {
      chat_id: process.env.CHAT_ID,
      text: text,
      parse_mode: 'HTML'
    });
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

  console.log(`📢 Procesando ${auctions.length} subastas...`);

  for (const auction of auctions) {
    const hook = getRandom(HOOKS);
    const insight = getRandom(INSIGHTS);
    const curiosity = getRandom(CURIOSITY_TRIGGERS);
    
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
    const closingDate = formatDate(auction.auctionDate);

    // Construcción del mensaje
    let message = `${emoji} ${hashtags}\n\n`;
    message += `${hook}\n\n`;
    
    // Línea de ubicación
    const location = auction.zone && auction.zone !== 'Desconocida' 
      ? `📍 ${auction.city} (${auction.zone})` 
      : `📍 ${auction.city}`;
    message += `${location}\n\n`;
    
    message += `📊 <b>Datos del expediente</b>\n\n`;
    
    if (appraisal) message += `💰 <b>Valor de subasta:</b> ${appraisal}\n`;
    if (debt) message += `🏦 <b>Deuda reclamada:</b> ${debt}\n`;
    if (auction.discount) message += `📉 <b>Descuento teórico:</b> ${auction.discount}%\n`;
    if (auction.auctionType) message += `⚖️ <b>Tipo de subasta:</b> ${auction.auctionType}\n`;
    
    if (closingDate) {
      message += `\n📅 <b>Cierre de subasta:</b> ${closingDate}\n`;
    }

    message += `\n${insight}\n\n`;
    
    message += `🔎 <a href="${CONFIG.BASE_URL}/${auction.slug}">Ver ficha completa</a>\n\n`;
    
    message += `${curiosity}\n\n`;
    
    message += `En el canal premium analizo además:\n\n`;
    message += `• cargas reales del registro\n`;
    message += `• rango probable de adjudicación\n`;
    message += `• estrategia de puja\n\n`;
    message += `🔒 <a href="https://sublaunch.com/activosoffmarket">Acceso al análisis premium</a>`;

    // Enviar mensaje
    const success = await sendTelegramMessage(message);
    if (success) {
      console.log(`✅ Notificación enviada: ${auction.slug}`);
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
