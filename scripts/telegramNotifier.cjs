const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * TELEGRAM NOTIFIER - ActivosOffMarket.es
 * 
 * Envía alertas de nuevas subastas detectadas por el crawler a un canal de Telegram.
 */

const CONFIG = {
  NEW_AUCTIONS_FILE: path.join(__dirname, 'new_auctions.json'),
  BOT_TOKEN: process.env.BOT_TOKEN,
  CHAT_ID: process.env.CHAT_ID,
  BASE_URL: 'https://www.activosoffmarket.es/subasta'
};

const INTROS = [
  "Acaba de aparecer una subasta interesante en el BOE.",
  "Estoy revisando ahora mismo este expediente que acaba de publicarse.",
  "Nueva subasta detectada que puede ser interesante.",
  "Ha salido una subasta curiosa que merece la pena mirar.",
  "Este expediente acaba de publicarse y tiene algunos puntos interesantes.",
  "He visto este nuevo anuncio en el BOE y creo que merece un vistazo."
];

const OUTROS = [
  "Estoy revisando el expediente porque hay un par de puntos que pueden cambiar bastante el riesgo.",
  "Ojo con las cargas de este activo, hay que mirarlas con lupa antes de decidir.",
  "Parece una oportunidad interesante por ubicación, pero falta validar el estado de ocupación.",
  "Voy a profundizar en el análisis de este activo para ver si el descuento es real.",
  "Si buscas algo en esta zona, este expediente es un buen punto de partida para investigar."
];

function formatCurrency(value) {
  if (!value) return 'No indicada';
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function sendTelegramMessage(text) {
  if (!CONFIG.BOT_TOKEN || !CONFIG.CHAT_ID) {
    console.error('❌ Error: BOT_TOKEN o CHAT_ID no configurados en las variables de entorno.');
    return;
  }

  const url = `https://api.telegram.org/bot${CONFIG.BOT_TOKEN}/sendMessage`;
  
  try {
    await axios.post(url, {
      chat_id: CONFIG.CHAT_ID,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: false
    });
    return true;
  } catch (error) {
    console.error('❌ Error enviando mensaje a Telegram:', error.response?.data || error.message);
    return false;
  }
}

async function runNotifier() {
  console.log('🚀 Iniciando notificador de Telegram...');

  // 1. Verificar si existe el archivo de nuevas subastas
  if (!fs.existsSync(CONFIG.NEW_AUCTIONS_FILE)) {
    console.log('ℹ️ No hay subastas nuevas para notificar.');
    return;
  }

  // 2. Leer y parsear el archivo
  let auctions = [];
  try {
    const data = fs.readFileSync(CONFIG.NEW_AUCTIONS_FILE, 'utf8');
    auctions = JSON.parse(data);
  } catch (error) {
    console.error('❌ Error leyendo new_auctions.json:', error.message);
    return;
  }

  if (auctions.length === 0) {
    console.log('ℹ️ El archivo de subastas nuevas está vacío.');
    fs.unlinkSync(CONFIG.NEW_AUCTIONS_FILE);
    return;
  }

  console.log(`📢 Enviando ${auctions.length} notificaciones...`);

  // 3. Procesar cada subasta
  for (const auction of auctions) {
    const intro = getRandom(INTROS);
    const outro = getRandom(OUTROS);
    
    // Construir ubicación
    const location = auction.zone && auction.zone !== 'Desconocida' 
      ? `${auction.city} / ${auction.zone}` 
      : auction.city;

    // Construir mensaje
    let message = `<b>${intro}</b>\n\n`;
    message += `📍 ${location}\n`;
    message += `🏠 ${auction.propertyType}\n\n`;
    message += `💰 <b>Tasación:</b> ${formatCurrency(auction.appraisalValue)}\n`;
    
    if (auction.claimedDebt) {
      message += `🏦 <b>Deuda reclamada:</b> ${formatCurrency(auction.claimedDebt)}\n`;
    }

    if (auction.auctionDate) {
      message += `⏳ <b>Cierre:</b> ${auction.auctionDate}\n`;
    }

    message += `\n<i>${outro}</i>\n\n`;
    message += `${CONFIG.BASE_URL}/${auction.slug}`;

    // Enviar mensaje
    const success = await sendTelegramMessage(message);
    if (success) {
      console.log(`✅ Notificación enviada: ${auction.slug}`);
    }

    // Pequeño delay para evitar rate limits de Telegram si hay muchas
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 4. Eliminar el archivo temporal
  try {
    fs.unlinkSync(CONFIG.NEW_AUCTIONS_FILE);
    console.log('🗑️ Archivo new_auctions.json eliminado.');
  } catch (error) {
    console.error('❌ Error eliminando el archivo temporal:', error.message);
  }

  console.log('🏁 Proceso de notificación finalizado.');
}

runNotifier();
