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
  BASE_URL: 'https://www.activosoffmarket.es/ejemplo-subasta'
};

const HOOKS = [
  "Ojo con esta. Acaba de entrar.",
  "Esto no se ve todos los días.",
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

const FOMO_LINES = [
  "No es para improvisar.",
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

function toHashtag(str) {
  if (!str) return '';
  const clean = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "");
  return '#' + clean.charAt(0).toUpperCase() + clean.slice(1);
}

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

  let sentSlugs = [];
  if (fs.existsSync(CONFIG.SENT_FILE)) {
    sentSlugs = fs.readFileSync(CONFIG.SENT_FILE, 'utf8').split('\n').filter(Boolean);
  }

  const processedSlugs = [];

  for (const auction of pending) {
    if (sentSlugs.includes(auction.slug)) {
      console.log(`⏭️ Saltando duplicado: ${auction.slug}`);
      processedSlugs.push(auction.slug);
      continue;
    }

    const hashtags = `${toHashtag(auction.propertyType)} ${toHashtag(auction.city)} ${auction.zone && auction.zone !== 'Desconocida' ? toHashtag(auction.zone) : ''}`;
    const debtRatio = auction.appraisalValue > 0 ? ((auction.claimedDebt / auction.appraisalValue) * 100).toFixed(1) : "N/A";
    
    // FOMO Logic
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
      if (diffDays > 0 && diffDays < 7) {
        daysLeft = diffDays;
      }
    }

    const similarCount = pending.filter(a => a.city === auction.city && a.propertyType === auction.propertyType).length;
    const isScarce = similarCount < 5;

    const sqm = auction.squareMeters || auction.surface || 0;
    let pricePerSqm = null;
    if (sqm > 0 && auction.appraisalValue > 0) {
      pricePerSqm = Math.round(auction.appraisalValue / sqm);
    }

    const propertyType = auction.propertyType ? auction.propertyType.charAt(0).toUpperCase() + auction.propertyType.slice(1) : 'Activo';
    const location = auction.zone && auction.zone !== 'Desconocida' 
      ? `${auction.city} (${auction.zone})` 
      : `${auction.city}`;

    let message = `🔒 <b>Análisis Premium</b>\n\n`;
    const typeAndLocation = `🏠 <b>${propertyType} en ${location}</b>\n📍 ${auction.address}`;
    const discountText = isHighDiscount ? (Math.random() > 0.5 ? `🔥 <b>¡OPORTUNIDAD: ${discountVal}% por debajo de tasación!</b>` : `🔥 <b>Descuento del ${discountVal}% detectado</b>`) : '';
    const urgencyText = daysLeft ? `⏳ <b>¡Cierra en solo ${daysLeft} días!</b>` : '';
    const hook = getRandom(HOOKS);
    const introType = Math.floor(Math.random() * 3);

    if (introType === 0 && isHighDiscount) {
      message += `${discountText}\n\n${typeAndLocation}\n\n${hook}\n\n`;
    } else if (introType === 1) {
      message += `${hook}\n\n${typeAndLocation}\n\n`;
      if (discountText) message += `${discountText}\n\n`;
    } else if (introType === 2 && daysLeft) {
      message += `${urgencyText}\n\n${typeAndLocation}\n\n${hook}\n\n`;
      if (discountText) message += `${discountText}\n\n`;
    } else {
      if (discountText) message += `${discountText}\n\n`;
      message += `${typeAndLocation}\n\n${hook}\n\n`;
    }

    if (daysLeft && introType !== 2) {
      message += `⏳ <b>Quedan ${daysLeft} días</b>\n`;
    }
    if (isScarce) {
      message += `📉 <b>Pocas oportunidades así en esta zona</b>\n`;
    }
    message += `\n🔎 <b>Claves del expediente</b>\n\n`;
    message += `• Procedimiento: ${auction.procedureType}\n`;
    message += `• Situación posesoria: ${auction.occupancy || "La clave aquí suele estar en la situación posesoria y el orden de cargas"}\n`;
    message += `• Posibles cargas a revisar: El margen real dependerá del orden de cargas en la certificación registral, conviene revisarla bien antes de plantear puja.\n\n`;
    message += `📊 <b>Lectura rápida</b>\n\n`;
    message += `• deuda reclamada: ${formatCurrency(auction.claimedDebt)}\n`;
    message += `• valor de subasta: ${formatCurrency(auction.appraisalValue)}\n`;
    if (pricePerSqm) message += `• ref. tasación m²: ${pricePerSqm} €/m²\n`;
    message += `• ratio deuda / subasta: ${debtRatio}%\n`;
    message += `• descuento teórico: ${auction.discount ? auction.discount + '%' : 'A determinar'}\n\n`;
    message += `${getRandom(INTERPRETATIONS)}\n\n`;
    message += `💰 <b>Escenario orientativo</b>\n\n`;
    message += `• rango posible de adjudicación: Estimación inicial basada en tipología\n`;
    message += `• valor estimado de mercado en la zona: Si el activo acompaña en estado, el mercado suele absorber bien este producto\n`;
    message += `• margen potencial aproximado: Margen a confirmar tras revisar cargas registrales\n\n`;
    message += `${getRandom(TRANSITIONS)}\n\n`;
    message += `🧮 <a href="https://www.activosoffmarket.es/calculadora-subastas">Simular inversión</a>\n\n`;
    message += `👉 <a href="${CONFIG.BASE_URL}/${auction.slug}">Ver fotos, cargas registrales y rentabilidad estimada</a>\n\n`;
    message += `${getRandom(FOMO_LINES)}\n\n`;
    message += `👉 <a href="https://calendly.com/activosoffmarket">Reservar consultoría</a>\n\n`;
    message += `${hashtags}`;

    const success = await sendTelegramMessage(message);
    if (success) {
      console.log(`✅ Notificación premium enviada: ${auction.slug}`);
      fs.appendFileSync(CONFIG.SENT_FILE, auction.slug + '\n');
      sentSlugs.push(auction.slug);
      processedSlugs.push(auction.slug);
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  const remaining = pending.filter(a => !processedSlugs.includes(a.slug));
  fs.writeFileSync(CONFIG.PENDING_FILE, JSON.stringify(remaining, null, 2));
  console.log(`🏁 Proceso finalizado. ${remaining.length} subastas restantes.`);
}

runNotifier();
