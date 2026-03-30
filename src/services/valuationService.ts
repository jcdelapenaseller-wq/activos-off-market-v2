export interface ValuationResult {
  boeId: string;
  marketValue: number;
  confidence: number;
  calculations: {
    realDiscount: number;
    maxBid: number;
    estimatedProfit: number;
    roi: number;
    surface?: number;
    priceM2?: number;
  };
  metadata: {
    source: string;
    surfaceSource?: string;
    cached: boolean;
    timestamp: string;
    refCat?: string;
    error?: string;
  };
}

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

export const getAuctionValuation = async (auctionData: any): Promise<ValuationResult> => {
  try {
    const response = await fetch('/api/valuation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        boeId: auctionData.boeId,
        address: auctionData.address,
        surface: auctionData.surface,
        propertyType: auctionData.propertyType,
        city: auctionData.city,
        province: auctionData.province,
        appraisalValue: auctionData.appraisalValue || auctionData.valorTasacion || auctionData.valorSubasta,
        refCat: auctionData.refCat,
        description: auctionData.description
      }),
    });

    const responseText = await response.text();
    const trimmedText = responseText.trim();

    if (!response.ok) {
      try {
        if (!trimmedText) {
          throw new Error(`Error ${response.status}: Empty response`);
        }
        const errorData = JSON.parse(trimmedText);
        throw new Error(errorData.error || 'Error al obtener la valoración');
      } catch (e) {
        if (e instanceof Error && e.message !== 'Error al obtener la valoración' && !e.message.startsWith('Unexpected token') && !e.message.includes('JSON')) {
          throw e;
        }
        console.error('Valuation API Error (non-JSON):', responseText);
        throw new Error(`Error ${response.status}: ${responseText || 'Empty response'}`);
      }
    }

    if (!trimmedText) {
      console.error('Valuation API returned empty response');
      throw new Error('La API de valoración devolvió una respuesta vacía');
    }

    try {
      return JSON.parse(trimmedText);
    } catch (e) {
      console.error('Valuation API returned invalid JSON:', responseText);
      throw new Error('La API de valoración devolvió un formato inválido');
    }
  } catch (error) {
    console.error('Error in getAuctionValuation, falling back to local calculation:', error);
    
    // Local Fallback Logic
    const province = auctionData.province || '';
    const city = auctionData.city || '';
    const priceM2 = getPricePerM2(province, city);
    const baseValue = auctionData.appraisalValue || auctionData.valorTasacion || auctionData.valorSubasta || 150000;
    
    // Estimate surface if not provided
    const realSurface = auctionData.surface || Math.round(baseValue / priceM2);
    const marketValue = Math.round(realSurface * priceM2);
    
    const realDiscount = Math.round(((marketValue - baseValue) / marketValue) * 100);
    const maxBid = Math.round(marketValue * 0.75);
    const estimatedProfit = marketValue - maxBid;
    const roi = Math.round((estimatedProfit / maxBid) * 100);

    return {
      boeId: auctionData.boeId || 'unknown',
      marketValue,
      confidence: 0.5, // Lower confidence for local fallback
      calculations: {
        realDiscount,
        maxBid,
        estimatedProfit,
        roi,
        surface: realSurface,
        priceM2
      },
      metadata: {
        source: 'local_fallback',
        surfaceSource: auctionData.surface ? 'auction_data' : 'estimated',
        cached: false,
        timestamp: new Date().toISOString(),
        refCat: auctionData.refCat || null,
        error: error instanceof Error ? error.message : String(error)
      }
    };
  }
};
