/**
 * Dataset simplificado de precios medios por m2 en España (Marzo 2026)
 * Fuente: Datos agregados de portales inmobiliarios y Ministerio de Vivienda.
 * Se utiliza como base para el cálculo del Valor de Mercado en el plan BASIC.
 */

export interface ProvincePrice {
  province: string;
  avgPrice: number; // Precio medio m2
  cities?: Record<string, number>; // Excepciones por ciudades principales
}

export const MARKET_PRICES: Record<string, ProvincePrice> = {
  'MADRID': {
    province: 'Madrid',
    avgPrice: 3200,
    cities: {
      'MADRID': 4500,
      'ALCOBENDAS': 3800,
      'MOSTOLES': 2100,
      'GETAFE': 2300
    }
  },
  'BARCELONA': {
    province: 'Barcelona',
    avgPrice: 2900,
    cities: {
      'BARCELONA': 4200,
      'SANT CUGAT': 4000,
      'BADALONA': 2300
    }
  },
  'VALENCIA': {
    province: 'Valencia',
    avgPrice: 1600,
    cities: {
      'VALENCIA': 2200,
      'TORRENT': 1400
    }
  },
  'MALAGA': {
    province: 'Málaga',
    avgPrice: 2400,
    cities: {
      'MALAGA': 2600,
      'MARBELLA': 4500,
      'ESTEPONA': 3000
    }
  },
  'ALICANTE': {
    province: 'Alicante',
    avgPrice: 1700,
    cities: {
      'ALICANTE': 1900,
      'BENIDORM': 2800
    }
  },
  'SEVILLA': {
    province: 'Sevilla',
    avgPrice: 1500,
    cities: {
      'SEVILLA': 2100
    }
  },
  'ZAMORA': {
    province: 'Zamora',
    avgPrice: 1100,
    cities: {
      'ZAMORA': 1250
    }
  },
  // Fallback para el resto de España
  'DEFAULT': {
    province: 'España',
    avgPrice: 1450
  }
};

/**
 * Obtiene el precio por m2 recomendado para una ubicación
 */
export const getPricePerM2 = (province?: string, city?: string): number => {
  const normProvince = province?.toUpperCase() || '';
  const normCity = city?.toUpperCase() || '';

  const provinceData = MARKET_PRICES[normProvince] || MARKET_PRICES['DEFAULT'];
  
  if (provinceData.cities && provinceData.cities[normCity]) {
    return provinceData.cities[normCity];
  }

  return provinceData.avgPrice;
};
