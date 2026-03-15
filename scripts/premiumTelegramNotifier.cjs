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
  BOT_TOKEN: process.env.BOT_TOKEN,
  PREMIUM_CHAT_ID: process.env.PREMIUM_CHAT_ID,
  BASE_URL: 'https://www.activosoffmarket.es/ejemplo-subasta'
};

const HOOKS = [
  "Ojo a esta subasta que acaba de aparecer en el radar.",
  "Este expediente tiene algunos elementos interesantes.",
  "A primera vista parece una subasta bastante limpia.",
  "Este activo merece mirarlo con calma antes de que empiecen las pujas.",
  "Este tipo de activos en esta zona suelen moverse rápido.",
  "He detectado un nuevo expediente en el BOE que merece una revisión detallada.",
  "Acaba de saltar esta oportunidad al radar y tiene algunos puntos muy interesantes.",
  "Revisando las novedades, este activo destaca por su potencial."
];

const INTERPRETATIONS = [
  "La deuda representa una parte interesante del valor de subasta, lo que a veces deja margen si no aparecen cargas inesperadas.",
  "Cuando la deuda está bastante por debajo del valor de subasta suele haber más recorrido para inversores.",
  "Este tipo de expedientes depende mucho de la situación posesoria, es clave verificarla.",
  "La estructura de deuda frente al valor de subasta sugiere que hay que analizar bien los costes ocultos.",
  "Si el activo acompaña en estado y posesión, el mercado de la zona suele absorber bien este tipo de producto.",
  "En esta zona activos comparables suelen moverse por encima del tipo de subasta."
];

const TRANSITIONS = [
  "Desglosando el expediente, estos son los puntos clave.",
  "Este tipo de operaciones se ganan en los detalles.",
  "Antes de pujar conviene mirar bien estos puntos.",
  "Analizando los números preliminares, esto es lo que tenemos:",
  "Si entramos en detalle, el escenario se ve así:"
];

const FOMO_LINES = [
  "No es un activo para improvisar.",
  "Aquí se gana en el detalle.",
  "Conviene revisar bien el expediente antes de consignar el depósito.",
  "Este tipo de expedientes suele decidirse en la certificación registral.",
  "Una revisión rápida del expediente puede cambiar completamente la estrategia de puja.",
  "En subastas como esta la diferencia suele estar en lo que no aparece en el edicto.",
  "No es el tipo de activo que conviene improvisar."
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

  const processedSlugs = [];

  for (const auction of pending) {
    const hashtags = `${toHashtag(auction.propertyType)} ${toHashtag(auction.city)} ${auction.zone && auction.zone !== 'Desconocida' ? toHashtag(auction.zone) : ''}`;
    const debtRatio = auction.appraisalValue > 0 ? ((auction.claimedDebt / auction.appraisalValue) * 100).toFixed(1) : "N/A";
    
    const message = `🔒 <b>Análisis Premium</b>

🏠 ${hashtags} – 📍 ${auction.address}
📅 <b>Cierre de subasta:</b> ${auction.auctionDate}

${getRandom(HOOKS)}

🔎 <b>Claves del expediente</b>

• Procedimiento: ${auction.procedureType}
• Situación posesoria: ${auction.occupancy || "La clave aquí suele estar en la situación posesoria y el orden de cargas"}
• Posibles cargas a revisar: El margen real dependerá del orden de cargas en la certificación registral, conviene revisarla bien antes de plantear puja.

📊 <b>Lectura rápida</b>

• deuda reclamada: ${formatCurrency(auction.claimedDebt)}
• valor de subasta: ${formatCurrency(auction.appraisalValue)}
• ratio deuda / subasta: ${debtRatio}%
• descuento teórico: ${auction.discount ? auction.discount + '%' : 'A determinar'}

${getRandom(INTERPRETATIONS)}

💰 <b>Escenario orientativo</b>

• rango posible de adjudicación: Estimación inicial basada en tipología
• valor estimado de mercado en la zona: Si el activo acompaña en estado, el mercado suele absorber bien este producto
• margen potencial aproximado: Margen a confirmar tras revisar cargas registrales

${getRandom(TRANSITIONS)}

🧮 <a href="https://www.activosoffmarket.es/calculadora-subastas">Simular inversión</a>

🔎 <a href="${CONFIG.BASE_URL}/${auction.slug}">Análisis completo del activo</a>

${getRandom(FOMO_LINES)}

👉 <a href="https://calendly.com/activosoffmarket">Reservar consultoría</a>`;

    const success = await sendTelegramMessage(message);
    if (success) {
      console.log(`✅ Notificación premium enviada: ${auction.slug}`);
      processedSlugs.push(auction.slug);
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  const remaining = pending.filter(a => !processedSlugs.includes(a.slug));
  fs.writeFileSync(CONFIG.PENDING_FILE, JSON.stringify(remaining, null, 2));
  console.log(`🏁 Proceso finalizado. ${remaining.length} subastas restantes.`);
}

runNotifier();
