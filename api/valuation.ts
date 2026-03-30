import { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';
import axios from 'axios';

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

// Dataset simplificado de precios medios por m2 en España (Marzo 2026)
const MARKET_PRICES: Record<string, { avgPrice: number, cities?: Record<string, number> }> = {
  'MADRID': { avgPrice: 3200, cities: { 'MADRID': 4500, 'ALCOBENDAS': 3800, 'MOSTOLES': 2100, 'GETAFE': 2300 } },
  'BARCELONA': { avgPrice: 2900, cities: { 'BARCELONA': 4200, 'SANT CUGAT': 4000, 'BADALONA': 2300 } },
  'VALENCIA': { avgPrice: 1600, cities: { 'VALENCIA': 2200, 'TORRENT': 1400 } },
  'MALAGA': { avgPrice: 2400, cities: { 'MALAGA': 2600, 'MARBELLA': 4500, 'ESTEPONA': 3000 } },
  'ALICANTE': { avgPrice: 1700, cities: { 'ALICANTE': 1900, 'BENIDORM': 2800 } },
  'SEVILLA': { avgPrice: 1500, cities: { 'SEVILLA': 2100 } },
  'ZAMORA': { avgPrice: 1100, cities: { 'ZAMORA': 1250 } },
  'DEFAULT': { avgPrice: 1450 }
};

const getPricePerM2 = (province?: string, city?: string): number => {
  const normProvince = province?.toUpperCase() || '';
  const normCity = city?.toUpperCase() || '';
  const provinceData = MARKET_PRICES[normProvince] || MARKET_PRICES['DEFAULT'];
  return (provinceData.cities && provinceData.cities[normCity]) ? provinceData.cities[normCity] : provinceData.avgPrice;
};

/**
 * Consulta a la Sede Electrónica del Catastro (SEC)
 * Utiliza el servicio Consulta_DNPRC para obtener datos no protegidos por Referencia Catastral.
 */
const fetchCatastroSurface = async (refCat: string): Promise<number | null> => {
  try {
    const url = `https://ovc.catastro.meh.es/OVCSWLocalizacionRC/OVCWcfCallejero/COVCCallejero.svc/json/Consulta_DNPRC?RefCat=${refCat}`;
    const response = await axios.get(url, { timeout: 5000 });
    
    if (response.data && response.data.consulta_dnp) {
      const dnp = response.data.consulta_dnp;
      // La superficie suele estar en debi.sfc (urbano) o ssf (finca)
      // Buscamos en diferentes campos según el tipo de inmueble
      const surface = dnp.bico?.bi?.debi?.sfc || // Superficie construida (urbano)
                      dnp.bico?.bi?.dff?.ssf ||  // Superficie de la finca (rústico)
                      dnp.bico?.bi?.dff?.ss;     // Superficie del solar
      
      if (surface) {
        return parseFloat(surface);
      }
    }
    return null;
  } catch (error) {
    console.error('Catastro API Error:', error);
    return null;
  }
};

const extractRefCat = (text?: string): string | null => {
  if (!text) return null;
  const match = text.match(/[A-Z0-9]{20}/i);
  return match ? match[0].toUpperCase() : null;
};

const fetchCatastroSurfaceByAddress = async (province: string, city: string, address: string): Promise<number | null> => {
  try {
    // La API de Catastro por dirección es muy estricta (Requiere Sigla, Calle, Numero exactos).
    // Hacemos un intento básico de extraer la calle y el número.
    const streetMatch = address.match(/([a-zA-Z\s]+)\s+(\d+)/);
    if (!streetMatch) return null;
    
    const calle = streetMatch[1].trim();
    const numero = streetMatch[2];
    
    const url = `https://ovc.catastro.meh.es/OVCSWLocalizacionRC/OVCWcfCallejero/COVCCallejero.svc/json/Consulta_DNPLOC?Provincia=${encodeURIComponent(province)}&Municipio=${encodeURIComponent(city)}&Sigla=&Calle=${encodeURIComponent(calle)}&Numero=${numero}`;
    const response = await axios.get(url, { timeout: 5000 });
    
    if (response.data && response.data.consulta_dnp) {
      const dnp = response.data.consulta_dnp;
      const surface = dnp.bico?.bi?.debi?.sfc || dnp.bico?.bi?.dff?.ssf || dnp.bico?.bi?.dff?.ss;
      if (surface) return parseFloat(surface);
    }
    return null;
  } catch (error) {
    console.error('Catastro Address API Error:', error);
    return null;
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { boeId, address, surface, city, province, appraisalValue, refCat, description } = req.body;

  if (!boeId) {
    return res.status(400).json({ error: 'boeId is required' });
  }

  try {
    // 1. Check Cache in Firestore (only if db is available)
    let valuationRef = null;
    if (db) {
      valuationRef = db.collection('auctions').doc(boeId).collection('valuations').doc('latest');
      try {
        const valuationSnap = await valuationRef.get();
        if (valuationSnap.exists) {
          const data = valuationSnap.data();
          return res.status(200).json({ ...data, metadata: { ...data?.metadata, cached: true } });
        }
      } catch (e) {
        console.error('Firestore Cache Read Error:', e);
        // Continue without cache
      }
    }

    // 2. Obtener superficie (Estrategia Triple: RefCat > Dirección > Estimación)
    let realSurface = surface;
    let sourceSurface = 'auction_data';
    let confidence = 0.75;
    
    const priceM2 = getPricePerM2(province, city);
    const baseValue = appraisalValue || 150000;

    let finalRefCat = refCat || extractRefCat(description);

    if (finalRefCat) {
      const catastroSurface = await fetchCatastroSurface(finalRefCat);
      if (catastroSurface) {
        realSurface = catastroSurface;
        sourceSurface = 'catastro_ref';
        confidence = 0.95; // Alta
      }
    }

    if (!realSurface && address && city && province) {
      const catastroSurface = await fetchCatastroSurfaceByAddress(province, city, address);
      if (catastroSurface) {
        realSurface = catastroSurface;
        sourceSurface = 'catastro_address';
        confidence = 0.80; // Media
      }
    }

    if (!realSurface) {
      realSurface = Math.round(baseValue / priceM2);
      sourceSurface = 'estimada';
      confidence = 0.60; // Baja
    }

    // 4. Calcular Valor de Mercado
    const marketValue = Math.round(realSurface * priceM2);

    // 5. Cálculos de Inversión
    const realDiscount = Math.round(((marketValue - baseValue) / marketValue) * 100);
    const maxBid = Math.round(marketValue * 0.75); // 75% del valor de mercado
    const estimatedProfit = marketValue - maxBid;
    const roi = Math.round((estimatedProfit / maxBid) * 100);

    const result = {
      boeId,
      marketValue,
      confidence,
      calculations: {
        realDiscount,
        maxBid,
        estimatedProfit,
        roi,
        surface: realSurface,
        priceM2
      },
      metadata: {
        source: 'internal_dataset_catastro',
        surfaceSource: sourceSurface,
        cached: false,
        timestamp: new Date().toISOString(),
        refCat: finalRefCat || null
      }
    };

    // 6. Save to Cache (only if db is available)
    if (db && valuationRef) {
      try {
        await valuationRef.set(result);
      } catch (e) {
        console.error('Firestore Cache Write Error:', e);
      }
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('Valuation Error:', error);
    return res.status(500).json({ 
      error: 'Error interno en la valoración',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
