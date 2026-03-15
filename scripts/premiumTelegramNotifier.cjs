const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * PREMIUM TELEGRAM NOTIFIER - ActivosOffMarket.es
 * 
 * Envía alertas al canal Premium con un retraso de 30-60 min.
 * Soporta TEST_MODE=true para envío inmediato.
 */

const CONFIG = {
  PENDING_FILE: path.join(__dirname, 'pending_premium.json'),
  BOT_TOKEN: process.env.BOT_TOKEN,
  PREMIUM_CHAT_ID: process.env.PREMIUM_CHAT_ID,
  BASE_URL: 'https://www.activosoffmarket.es/ejemplo-subasta'
};

const HOOKS = [
  "🔒 Análisis Premium",
  "🔒 Oportunidad Premium detectada",
  "🔒 Nuevo análisis exclusivo"
];

const COMMENTARY = [
  "Este activo acaba de publicarse y puede tener un potencial interesante para inversores. He estado revisando los datos preliminares y parece que encaja bien en la estrategia de búsqueda de rentabilidad.",
  "Acabo de detectar esta subasta y me ha llamado la atención por su ubicación. Es un activo que suele tener buena salida en el mercado de alquiler.",
  "Revisando las novedades, este expediente destaca por su precio de salida. Creo que merece un análisis detallado antes de que empiece la puja."
];

const POSSESSION_TEXTS = [
  "Situación posesoria no aclarada en el edicto.",
  "Pendiente de confirmar si el activo está ocupado.",
  "Se recomienda verificar la situación posesoria actual."
];

const CHARGE_TEXTS = [
  "Posible necesidad de revisar cargas registrales.",
  "Es fundamental confirmar si existen deudas de comunidad o IBI pendientes.",
  "Recomiendo un estudio exhaustivo de las cargas que pesan sobre el activo."
];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function sendTelegramMessage(text) {
  if (!process.env.BOT_TOKEN || !process.env.PREMIUM_CHAT_ID) {
    console.error('❌ Error: BOT_TOKEN o PREMIUM_CHAT_ID no configurados.');
    return;
  }
  const url = `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`;
  try {
    await axios.post(
      url,
      {
        chat_id: process.env.PREMIUM_CHAT_ID,
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

async function runNotifier() {
  console.log('🚀 Iniciando notificador Premium...');

  if (!fs.existsSync(CONFIG.PENDING_FILE)) {
    console.log('ℹ️ No hay subastas pendientes para el canal Premium.');
    return;
  }

  let pending = [];
  try {
    pending = JSON.parse(fs.readFileSync(CONFIG.PENDING_FILE, 'utf8'));
  } catch (error) {
    console.error('❌ Error leyendo pending_premium.json:', error.message);
    return;
  }

  const isTestMode = process.env.TEST_MODE === 'true';
  const now = Date.now();
  const delay = 30 * 60 * 1000; // 30 minutos

  const toProcess = pending.filter(item => isTestMode || (now - item.detectedAt) > delay);
  const remaining = pending.filter(item => !toProcess.includes(item));

  console.log(`📢 Procesando ${toProcess.length} subastas (Modo TEST: ${isTestMode})...`);

  for (const item of toProcess) {
    const auction = item.auction;
    
    const hook = getRandom(HOOKS);
    const commentary = getRandom(COMMENTARY);
    const possession = auction.possessionStatus || getRandom(POSSESSION_TEXTS);
    const charges = getRandom(CHARGE_TEXTS);

    const message = `${hook}\n\n` +
      `🏠 #${auction.propertyType} #${auction.city} ${auction.zone ? '#' + auction.zone : ''} – 📍 ${auction.address}\n\n` +
      `📅 Cierre de subasta: ${auction.auctionDate}\n\n` +
      `${commentary}\n\n` +
      `🔎 <b>Claves del expediente</b>\n\n` +
      `• tipo de procedimiento: ${auction.procedureType}\n` +
      `• ${possession}\n` +
      `• ${charges}\n\n` +
      `💰 <b>Escenario orientativo</b>\n\n` +
      `• rango posible de adjudicación: ${auction.estimatedAdjudicationRange || 'Consultar análisis'}\n` +
      `• valor estimado de mercado en la zona: ${auction.marketValue || 'Consultar análisis'}\n` +
      `• margen potencial aproximado: ${auction.estimatedMargin || 'Consultar análisis'}\n\n` +
      `🧮 <b>Simular inversión</b>\nhttps://www.activosoffmarket.es/calculadora-subastas\n\n` +
      `🔎 <b>Análisis completo del activo</b>\n${CONFIG.BASE_URL}/${auction.slug}\n\n` +
      `Si alguien está valorando entrar en esta subasta puedo revisar el expediente completo antes del cierre.\n\n` +
      `👉 https://calendly.com/activosoffmarket`;

    await sendTelegramMessage(message);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  fs.writeFileSync(CONFIG.PENDING_FILE, JSON.stringify(remaining, null, 2));
  console.log('🏁 Proceso finalizado.');
}

runNotifier();
