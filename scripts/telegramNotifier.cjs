const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * TELEGRAM NOTIFIER - ActivosOffMarket.es
 * 
 * Envía alertas de nuevas subastas con un tono humano y experto.
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
  "He visto este expediente recién publicado y me ha llamado la atención por la zona.",
  "Acabo de detectar esta oportunidad en el BOE y estoy analizando los detalles.",
  "Ojo a esta subasta que acaba de salir, tiene una pinta interesante para estudiar.",
  "Revisando las novedades del BOE, me he topado con este activo que acaba de publicarse.",
  "Esta oportunidad acaba de saltar en el radar y parece que merece un análisis rápido."
];

const INSIGHTS = [
  "Hay un detalle del expediente que puede influir bastante en el riesgo.",
  "La situación posesoria no está del todo clara.",
  "Este tipo de activos en esta zona suelen atraer bastante interés cuando empiezan a moverse las pujas.",
  "Antes de plantear pujar habría que revisar bien las cargas.",
  "El valor de tasación parece estar algo desfasado, habría que validar precios de mercado.",
  "La ubicación es muy buena, pero el expediente judicial tiene algunos puntos a revisar.",
  "Parece que hay margen, pero hay que confirmar si existen deudas preferentes.",
  "Es un activo con potencial, aunque la clave estará en la estrategia de puja final."
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
    console.error('❌ Error leyendo new_auctions.json:', error.message);
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
      ? `${auction.city} (${auction.zone})` 
      : auction.city;

    // Cálculo de descuento si es posible
    let discountText = "";
    if (auction.appraisalValue && auction.claimedDebt && auction.appraisalValue > auction.claimedDebt) {
      const discount = Math.round(((auction.appraisalValue - auction.claimedDebt) / auction.appraisalValue) * 100);
      if (discount > 0) {
        discountText = `📉 <b>Descuento teórico:</b> ~${discount}%\n`;
      }
    }

    // Construcción del mensaje
    let message = `${hook}\n\n`;
    message += `📍 <b>${location}</b>\n`;
    message += `📊 <b>${auction.propertyType}</b>\n\n`;
    
    const appraisal = formatCurrency(auction.appraisalValue);
    if (appraisal) message += `💰 <b>Valor de subasta:</b> ${appraisal}\n`;
    
    const debt = formatCurrency(auction.claimedDebt);
    if (debt) message += `🏦 <b>Deuda reclamada:</b> ${debt}\n`;
    
    message += discountText;

    if (auction.auctionDate) {
      message += `⏳ <b>Cierre de subasta:</b> ${auction.auctionDate}\n`;
    }

    message += `\n${insight}\n\n`;
    
    message += `🔎 <b>Análisis completo del expediente:</b>\n`;
    message += `${CONFIG.BASE_URL}/${auction.slug}\n\n`;
    
    message += `En el canal premium analizo además:\n`;
    message += `• cargas reales del registro\n`;
    message += `• rango probable de adjudicación\n`;
    message += `• estrategia de puja\n\n`;
    message += `🔒 <a href="https://sublaunch.com/activosoffmarket">Acceso Premium</a>`;

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
}

runNotifier();
