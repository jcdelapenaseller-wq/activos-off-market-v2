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

const HOOKS = [
  "Ojo con esta subasta. Acaba de entrar.",
  "Esto no se ve todos los días por aquí.",
  "Revisando el BOE me he cruzado con este expediente.",
  "Acaba de saltar esta alerta. Pinta bien.",
  "Echadle un vistazo a esto antes de que se llene de gente."
];

const INSIGHTS = [
  "La clave va a estar en revisar bien las cargas previas.",
  "Habrá que confirmar si hay ocupantes, pero los números iniciales cuadran.",
  "Si el descuento aguanta, hay margen real.",
  "Suele haber competencia en esta zona, mejor ir con los deberes hechos.",
  "El valor de tasación parece razonable, pero hay que cruzarlo con mercado real."
];

const CTAS = [
  "👉 Ver fotos, cargas y rentabilidad estimada",
  "👉 Analizar expediente completo aquí",
  "👉 Echar un ojo a los números al detalle"
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

  for (const auction of auctions) {
    if (sentSlugs.includes(auction.slug)) {
      console.log(`⏭️ Saltando duplicado: ${auction.slug}`);
      continue;
    }

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

    const similarCount = auctions.filter(a => a.city === auction.city && a.propertyType === auction.propertyType).length;
    const isScarce = similarCount < 5;

    const sqm = auction.squareMeters || auction.surface || 0;
    let pricePerSqm = null;
    if (sqm > 0 && auction.appraisalValue > 0) {
      pricePerSqm = Math.round(auction.appraisalValue / sqm);
    }

    // Línea de ubicación y tipo
    const location = auction.zone && auction.zone !== 'Desconocida' 
      ? `${auction.city} (${auction.zone})` 
      : `${auction.city}`;
    const propertyType = auction.propertyType ? auction.propertyType.charAt(0).toUpperCase() + auction.propertyType.slice(1) : 'Activo';

    // Construcción del mensaje
    let message = '';
    const typeAndLocation = `${emoji} <b>${propertyType} en ${location}</b>`;
    const discountText = isHighDiscount ? (Math.random() > 0.5 ? `🔥 <b>¡OPORTUNIDAD: ${discountVal}% por debajo de tasación!</b>` : `🔥 <b>Descuento del ${discountVal}% detectado</b>`) : '';
    const urgencyText = daysLeft ? `⏳ <b>¡Cierra en solo ${daysLeft} días!</b>` : '';
    const introType = Math.floor(Math.random() * 3); // 0: Dato, 1: Contexto, 2: Urgencia

    if (introType === 0 && isHighDiscount) {
      message += `${discountText}\n\n${typeAndLocation}\n\n${hook}\n\n`;
    } else if (introType === 1 || (!isHighDiscount && !daysLeft)) {
      message += `${hook}\n\n${typeAndLocation}\n\n`;
      if (discountText) message += `${discountText}\n\n`;
    } else if (introType === 2 && daysLeft) {
      message += `${urgencyText}\n\n${typeAndLocation}\n\n${hook}\n\n`;
      if (discountText) message += `${discountText}\n\n`;
    } else {
      if (discountText) message += `${discountText}\n\n`;
      message += `${typeAndLocation}\n\n${hook}\n\n`;
    }
    
    message += `📊 <b>Datos rápidos</b>\n\n`;
    
    if (appraisal) message += `💰 Tasación: ${appraisal}\n`;
    if (debt) message += `🏦 Deuda: ${debt}\n`;
    if (pricePerSqm) message += `💸 Ref: ${pricePerSqm} €/m²\n`;
    if (auction.discount) message += `📉 Dto teórico: ${auction.discount}%\n`;
    if (auction.auctionType) message += `⚖️ Tipo: ${auction.auctionType}\n`;
    
    if (closingDate) {
      message += `\n📅 Cierre: ${closingDate}\n`;
      if (daysLeft && introType !== 2) {
        message += `⏳ Quedan ${daysLeft} días\n`;
      }
    }
    if (isScarce) {
      message += `📉 Pocas oportunidades así en la zona\n`;
    }

    message += `\n${insight}\n\n`;
    
    message += `⚠️ <b>Hay un detalle clave en el expediente que cambia el escenario</b>\n\n`;
    
    const cta = getRandom(CTAS);
    message += `<a href="${CONFIG.BASE_URL}/${auction.slug}">${cta}</a>\n\n`;
    
    message += `🔒 <b>En premium: análisis completo + riesgos reales + estrategia</b>\n`;
    message += `👉 <a href="https://sublaunch.com/activosoffmarket">Acceso premium</a>\n\n`;
    
    message += `${hashtags}`;

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
