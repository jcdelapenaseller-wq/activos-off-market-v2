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

  console.log(`📢 Procesando ${pending.length} subastas pendientes...`);

  const processedSlugs = [];

  for (const auction of pending) {
    const message = `🔒 <b>Análisis Premium</b>\n\n🏠 ${auction.propertyType} en ${auction.city} - 📍 ${auction.address}\n📅 Cierre: ${auction.auctionDate}\n\nEste activo acaba de publicarse y puede tener potencial.\n\n🔎 <b>Claves del expediente</b>\n• Procedimiento: ${auction.procedureType}\n• Situación posesoria: No indicada\n\n💰 <b>Escenario orientativo</b>\n• Valor estimado: ${auction.appraisalValue}€\n\n🧮 <a href="https://www.activosoffmarket.es/calculadora-subastas">Simular inversión</a>\n\n🔎 <a href="${CONFIG.BASE_URL}/${auction.slug}">Análisis completo del activo</a>\n\nSi alguien está valorando entrar en esta subasta puedo revisar el expediente completo antes del cierre.\n\n👉 https://calendly.com/activosoffmarket`;

    const success = await sendTelegramMessage(message);
    if (success) {
      console.log(`✅ Notificación premium enviada: ${auction.slug}`);
      processedSlugs.push(auction.slug);
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Remove processed auctions
  const remaining = pending.filter(a => !processedSlugs.includes(a.slug));
  fs.writeFileSync(CONFIG.PENDING_FILE, JSON.stringify(remaining, null, 2));
  console.log(`🏁 Proceso finalizado. ${remaining.length} subastas restantes.`);
}

runNotifier();
