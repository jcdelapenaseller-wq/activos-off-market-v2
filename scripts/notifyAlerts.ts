import fs from 'fs';
import path from 'path';
import { AUCTIONS } from '../src/data/auctions';

// Configuración
const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const SENT_ALERTS_FILE = path.join(process.cwd(), 'src/data/sent_alerts.json');

interface SentAlertsData {
  last_run: string;
  sent: Record<string, string[]>; // email -> array of boeIds
}

async function fetchProSubscribers() {
  console.log('🔍 [NOTIFY] Buscando suscriptores PRO en MailerLite...');
  let allProSubscribers: any[] = [];
  let cursor: string | null = null;

  try {
    do {
      const url = new URL('https://connect.mailerlite.com/api/subscribers');
      url.searchParams.append('filter[status]', 'active');
      url.searchParams.append('limit', '100');
      if (cursor) url.searchParams.append('cursor', cursor);

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`MailerLite API error: ${response.status}`);
      
      const data = await response.json();
      const proSubscribers = data.data.filter((s: any) => s.fields?.plan_status === 'pro');
      allProSubscribers = [...allProSubscribers, ...proSubscribers];
      
      cursor = data.meta?.next_cursor || null;
    } while (cursor);

    console.log(`✅ [NOTIFY] Encontrados ${allProSubscribers.length} suscriptores PRO.`);
    return allProSubscribers;
  } catch (error) {
    console.error('❌ [NOTIFY] Error al obtener suscriptores:', error);
    return [];
  }
}

function loadSentAlerts(): SentAlertsData {
  if (fs.existsSync(SENT_ALERTS_FILE)) {
    return JSON.parse(fs.readFileSync(SENT_ALERTS_FILE, 'utf-8'));
  }
  return { last_run: new Date(0).toISOString(), sent: {} };
}

function saveSentAlerts(data: SentAlertsData) {
  fs.writeFileSync(SENT_ALERTS_FILE, JSON.stringify(data, null, 2));
}

async function sendAlertEmail(subscriber: any, auction: any) {
  console.log(`📧 [NOTIFY] Preparando envío MailerLite para: ${subscriber.email}`);

  try {
    // Usamos el endpoint de emails transaccionales de MailerLite
    // Nota: Requiere que tengas un "Transactional Email" configurado en MailerLite
    // o puedes usar el endpoint de "Campaigns" si prefieres ese flujo.
    // Para máxima simplicidad, usamos el envío directo si está disponible o 
    // notificamos que el matching es correcto.
    
    const response = await fetch('https://connect.mailerlite.com/api/emails/transactional', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        subject: `⚠️ Nueva subasta detectada: ${auction.propertyType} en ${auction.city}`,
        from: "alertas@activosoffmarket.es", // Debe ser un dominio verificado en MailerLite
        from_name: "Alertas Off-Market",
        to: subscriber.email,
        // Aquí puedes usar un template_id de MailerLite o contenido HTML directo
        // Si usas un template, puedes pasar variables
        content: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #0f172a;">Nueva oportunidad detectada</h2>
            <p>Hola,</p>
            <p>Hemos encontrado una nueva subasta que coincide con tus filtros de búsqueda:</p>
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Tipo:</strong> ${auction.propertyType}</p>
              <p><strong>Ubicación:</strong> ${auction.address}, ${auction.city} (${auction.province})</p>
              <p><strong>Valor Tasación:</strong> ${auction.appraisalValue ? auction.appraisalValue.toLocaleString('es-ES') + '€' : 'Consultar'}</p>
            </div>
            <a href="https://activosoffmarket.es/subasta/${auction.slug}" 
               style="display: inline-block; background: #1d4ed8; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">
               Ver detalles de la subasta
            </a>
            <p style="margin-top: 30px; font-size: 12px; color: #64748b;">
              Recibes este email porque tienes activo el Radar Premium en Activos Off-Market.
            </p>
          </div>
        `
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ [NOTIFY] Error MailerLite (${response.status}):`, data);
      return false;
    }

    console.log(`✅ [NOTIFY] Email enviado con éxito a ${subscriber.email}`);
    return true;
  } catch (error) {
    console.error(`❌ [NOTIFY] Error en el envío a ${subscriber.email}:`, error);
    return false;
  }
}

async function main() {
  if (!MAILERLITE_API_KEY) {
    console.error('❌ [NOTIFY] MAILERLITE_API_KEY no configurada.');
    return;
  }

  const subscribers = await fetchProSubscribers();
  const sentData = loadSentAlerts();
  const auctions = Object.values(AUCTIONS);
  
  // Solo procesamos subastas nuevas (isNew o publicadas después de la última ejecución)
  const lastRunDate = new Date(sentData.last_run);
  const newAuctions = auctions.filter(a => {
    const pubDate = a.publishedAt ? new Date(a.publishedAt) : new Date(0);
    return a.isNew || pubDate > lastRunDate;
  });

  console.log(`📈 [NOTIFY] Procesando ${newAuctions.length} subastas nuevas.`);

  let sentCount = 0;

  for (const subscriber of subscribers) {
    const userEmail = subscriber.email;
    const userProvincia = subscriber.fields?.alerta_provincia;
    const userTipo = subscriber.fields?.alerta_tipo;
    const userMunicipio = subscriber.fields?.alerta_municipio;

    if (!userProvincia) continue;

    const userSentList = sentData.sent[userEmail] || [];

    for (const auction of newAuctions) {
      const boeId = auction.boeId || auction.slug;
      if (!boeId) continue;

      // Evitar duplicados
      if (userSentList.includes(boeId)) continue;

      // Matching Logic
      const matchProvincia = auction.province?.toLowerCase() === userProvincia.toLowerCase();
      const matchTipo = userTipo === 'Todos' || auction.propertyType?.toLowerCase() === userTipo?.toLowerCase();
      const matchMunicipio = !userMunicipio || auction.municipality?.toLowerCase() === userMunicipio.toLowerCase();

      if (matchProvincia && matchTipo && matchMunicipio) {
        const success = await sendAlertEmail(subscriber, auction);
        if (success) {
          userSentList.push(boeId);
          sentCount++;
        }
      }
    }

    sentData.sent[userEmail] = userSentList;
  }

  sentData.last_run = new Date().toISOString();
  saveSentAlerts(sentData);

  console.log(`🏁 [NOTIFY] Proceso finalizado. Alertas enviadas: ${sentCount}`);
}

main().catch(console.error);
