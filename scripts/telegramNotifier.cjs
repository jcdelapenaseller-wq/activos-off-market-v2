const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * TELEGRAM NOTIFIER - ActivosOffMarket.es
 * 
 * Envía alertas de nuevas subastas detectadas por el crawler a un canal de Telegram.
 * Estilo: Analista experto humano.
 */

const CONFIG = {
  NEW_AUCTIONS_FILE: path.join(__dirname, 'new_auctions.json'),
  BOT_TOKEN: process.env.BOT_TOKEN,
  CHAT_ID: process.env.CHAT_ID,
  BASE_URL: 'https://www.activosoffmarket.es/subasta'
};

const HOOKS = [
  "Acaba de aparecer en el BOE una subasta interesante que estoy revisando ahora mismo.",
  "Revisando el BOE ha salido este expediente que puede tener algo de margen.",
  "Esta subasta acaba de publicarse y tiene algunos puntos curiosos.",
  "Estoy mirando este expediente ahora mismo porque puede tener bastante juego.",
  "Este anuncio acaba de salir en el BOE y merece echarle un vistazo.",
  "He detectado este nuevo expediente en el BOE y las cifras iniciales llaman la atención.",
  "Acaban de publicar esta subasta y por ubicación podría ser una oportunidad a seguir.",
  "Dando una vuelta por las novedades del BOE me he topado con este expediente.",
  "Ojo a esta subasta que acaba de salir; tiene pinta de que habrá movimiento.",
  "Acabo de ver este anuncio y ya estoy descargando la certificación de cargas."
];

const INSIGHTS = [
  "Hay un detalle del expediente que puede influir bastante en el riesgo.",
  "La situación posesoria no está del todo clara.",
  "Este tipo de activos en esta zona suelen atraer bastante interés cuando empiezan a moverse las pujas.",
  "Antes de plantear pujar habría que revisar bien las cargas.",
  "El valor de tasación parece algo desajustado, habría que validar precios de mercado.",
  "Es un expediente con miga; la clave estará en el análisis del edicto."
];

function formatCurrency(value) {
  if (!value) return null;
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function sendTelegramMessage(text) {
  if (!CONFIG.BOT_TOKEN || !CONFIG.CHAT_ID) {
    console.error('❌ Error: BOT_TOKEN o CHAT_ID no configurados.');
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
    console.error('❌ Error enviando a Telegram:', error.response?.data || error.message);
    return false;
  }
}

async function runNotifier() {
  console.log('🚀 Iniciando notificador experto de Telegram...');

  if (!fs.existsSync(CONFIG.NEW_AUCTIONS_FILE)) {
    console.log('ℹ️ No hay subastas nuevas.');
    return;
  }

  let auctions = [];
  try {
    const data = fs.readFileSync(CONFIG.NEW_AUCTIONS_FILE, 'utf8');
    auctions = JSON.parse(data);
  } catch (error) {
    console.error('❌ Error leyendo JSON:', error.message);
    return;
  }

  if (auctions.length === 0) {
    fs.unlinkSync(CONFIG.NEW_AUCTIONS_FILE);
    return;
  }

  for (const auction of auctions) {
    const hook = getRandom(HOOKS);
    const insight = getRandom(INSIGHTS);
    
    // Ubicación inteligente
    const location = auction.zone && auction.zone !== 'Desconocida' 
      ? `📍 ${auction.city} / ${auction.zone}` 
      : `📍 ${auction.city}`;

    // Construcción del mensaje
    let message = `${hook}\n\n`;
    message += `${location}\n\n`;
    message += `📊 <b>Datos rápidos del expediente</b>\n\n`;
    
    const appraisal = formatCurrency(auction.appraisalValue);
    if (appraisal) {
      message += `💰 <b>Valor de subasta:</b> ${appraisal}\n`;
    }

    if (auction.claimedDebt) {
      const debt = formatCurrency(auction.claimedDebt);
      if (debt) message += `🏦 <b>Deuda reclamada:</b> ${debt}\n`;
    }

    if (auction.discount && auction.discount > 0) {
      message += `📉 <b>Descuento teórico:</b> ${auction.discount}%\n`;
    }

    if (auction.auctionDate) {
      message += `\n⏳ <b>Cierre de subasta:</b> ${auction.auctionDate}\n`;
    }

    message += `\n${insight}\n\n`;
    
    message += `🔎 <b>Análisis completo del expediente:</b>\n`;
    message += `${CONFIG.BASE_URL}/${auction.slug}\n\n`;

    message += `En el canal premium analizo además:\n`;
    message += `• cargas reales del registro\n`;
    message += `• rango probable de adjudicación\n`;
    message += `• estrategia de puja\n\n`;
    message += `🔒 https://sublaunch.com/activosoffmarket`;

    const success = await sendTelegramMessage(message);
    if (success) {
      console.log(`✅ Enviada: ${auction.slug}`);
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  try {
    fs.unlinkSync(CONFIG.NEW_AUCTIONS_FILE);
    console.log('🗑️ Archivo temporal eliminado.');
  } catch (error) {
    console.error('❌ Error eliminando archivo:', error.message);
  }

  console.log('🏁 Notificaciones finalizadas.');
}

runNotifier();
