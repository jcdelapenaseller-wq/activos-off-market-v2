import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';
import { AUCTIONS } from '../src/data/auctions';

// Configuración
const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const SENT_ALERTS_FILE = path.join(process.cwd(), 'src/data/sent_alerts.json');

// Initialize Firebase Admin
const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;

if (!admin.apps.length && projectId) {
  try {
    admin.initializeApp({
      projectId: projectId,
    });
  } catch (e) {
    console.error('Firebase Admin Init Error:', e);
  }
}

const db = admin.apps.length ? admin.firestore() : null;

interface SentAlertsData {
  last_run: string;
  sent: Record<string, string[]>; // email -> array of boeIds
}

interface FirestoreAlert {
  id: string;
  uid: string;
  email: string;
  city: string;
  zone?: string;
  propertyType: string;
  minPrice: number;
  maxPrice: number;
  active: boolean;
  plan: 'free' | 'basic' | 'pro';
}

async function fetchFirestoreAlerts(): Promise<FirestoreAlert[]> {
  if (!db) {
    console.error('❌ [NOTIFY] Firestore no inicializado. Verifica PROJECT_ID.');
    return [];
  }

  console.log('🔍 [NOTIFY] Buscando alertas activas en Firestore...');
  const allAlerts: FirestoreAlert[] = [];

  try {
    // Usamos collectionGroup para obtener todas las alertas de todos los usuarios
    const alertsSnapshot = await db.collectionGroup('alerts')
      .where('active', '==', true)
      .get();

    console.log(`✅ [NOTIFY] Encontradas ${alertsSnapshot.size} alertas potenciales.`);

    // Para cada alerta, necesitamos el email y el plan del usuario
    // El email está en el documento del usuario: users/{uid}
    const userCache: Record<string, { email: string, plan: 'free' | 'basic' | 'pro' }> = {};

    for (const doc of alertsSnapshot.docs) {
      const alertData = doc.data();
      const uid = doc.ref.parent.parent?.id;

      if (!uid) continue;

      let userData = userCache[uid];
      if (!userData) {
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists) {
          const data = userDoc.data();
          const email = data?.email;
          const plan = (data?.plan?.toLowerCase() as 'free' | 'basic' | 'pro') || 'free';
          if (email) {
            userData = { email, plan };
            userCache[uid] = userData;
          }
        }
      }

      if (userData) {
        allAlerts.push({
          id: doc.id,
          uid,
          email: userData.email,
          plan: userData.plan,
          city: alertData.city || '',
          zone: alertData.zone || '',
          propertyType: alertData.propertyType || 'Todos',
          minPrice: alertData.minPrice || 0,
          maxPrice: alertData.maxPrice || 10000000,
          active: alertData.active
        });
      }
    }

    console.log(`✅ [NOTIFY] Procesadas ${allAlerts.length} alertas con email válido.`);
    return allAlerts;
  } catch (error) {
    console.error('❌ [NOTIFY] Error al obtener alertas de Firestore:', error);
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

async function sendAlertEmail(email: string, auction: any, plan: string = 'free') {
  console.log(`📧 [NOTIFY] Preparando envío MailerLite para: ${email} (Plan: ${plan})`);

  const isPro = plan.toLowerCase() === 'pro';
  const proBadge = isPro ? `
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 10px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
      <p style="margin: 0; color: #166534; font-size: 13px; font-weight: bold;">⚡ Alerta prioritaria PRO</p>
      <p style="margin: 5px 0 0 0; color: #15803d; font-size: 11px;">Has recibido esta oportunidad antes que otros usuarios</p>
      <p style="margin: 2px 0 0 0; color: #166534; font-size: 10px; font-style: italic;">Gracias a tu acceso prioritario PRO</p>
    </div>
  ` : '';

  const upgradeCTA = !isPro ? `
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
      <p style="margin: 0; color: #475569; font-size: 13px;">¿Quieres recibir estas oportunidades antes?</p>
      <p style="margin: 5px 0 15px 0; color: #1e293b; font-size: 14px; font-weight: bold;">Activa PRO y recibe alertas prioritarias</p>
      <a href="https://activosoffmarket.es/pro" 
         style="display: inline-block; background: #f8fafc; color: #1d4ed8; padding: 8px 20px; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: bold; border: 1px solid #e2e8f0;">
         Ver planes
      </a>
    </div>
  ` : '';

  try {
    const response = await fetch('https://connect.mailerlite.com/api/emails/transactional', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        subject: `⚠️ Nueva subasta detectada: ${auction.propertyType} en ${auction.city}`,
        from: "alertas@activosoffmarket.es",
        from_name: "Alertas Off-Market",
        to: email,
        content: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            ${proBadge}
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
              Recibes este email porque tienes activo el Radar de Alertas en Activos Off-Market.
            </p>
            ${upgradeCTA}
          </div>
        `
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ [NOTIFY] Error MailerLite (${response.status}):`, data);
      return false;
    }

    console.log(`✅ [NOTIFY] Email enviado con éxito a ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ [NOTIFY] Error en el envío a ${email}:`, error);
    return false;
  }
}

async function main() {
  if (!MAILERLITE_API_KEY) {
    console.error('❌ [NOTIFY] MAILERLITE_API_KEY no configurada.');
    return;
  }

  const alerts = await fetchFirestoreAlerts();
  
  // Ordenar alertas por plan: PRO primero, luego BASIC, luego FREE
  const planOrder = { pro: 0, basic: 1, free: 2 };
  alerts.sort((a, b) => planOrder[a.plan] - planOrder[b.plan]);

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

  for (const alert of alerts) {
    const userEmail = alert.email;
    const userProvincia = alert.city;
    const userTipo = alert.propertyType;
    const userMunicipio = alert.zone;

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
      
      // Filtro de precio (si aplica)
      const auctionPrice = auction.appraisalValue || 0;
      const matchPrecio = auctionPrice >= alert.minPrice && auctionPrice <= alert.maxPrice;

      if (matchProvincia && matchTipo && matchMunicipio && matchPrecio) {
        const success = await sendAlertEmail(userEmail, auction, alert.plan);
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
