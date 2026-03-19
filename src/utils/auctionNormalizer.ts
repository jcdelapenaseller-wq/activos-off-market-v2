import { AuctionData } from '../data/auctions';

/**
 * Normaliza el tipo de propiedad para etiquetas cortas.
 */
export const normalizePropertyType = (type?: string): string => {
  if (!type) return 'Inmueble';
  const t = type.toLowerCase();
  if (t.includes('piso') || t.includes('apartamento') || t.includes('vivienda')) return 'Piso';
  if (t.includes('local') || t.includes('oficina') || t.includes('comercial')) return 'Local';
  if (t.includes('garaje') || t.includes('parking') || t.includes('aparcamiento')) return 'Garaje';
  if (t.includes('nave') || t.includes('industrial')) return 'Nave';
  if (t.includes('chalet') || t.includes('unifamiliar') || t.includes('casa')) return 'Chalet';
  if (t.includes('solar') || t.includes('terreno')) return 'Terreno';
  return 'Inmueble';
};

/**
 * Elimina tildes pero mantiene la ñ.
 */
const removeAccents = (str: string): string => {
  return str
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ÁÀÄÂ]/g, 'A')
    .replace(/[ÉÈËÊ]/g, 'E')
    .replace(/[ÍÌÏÎ]/g, 'I')
    .replace(/[ÓÒÖÔ]/g, 'O')
    .replace(/[ÚÙÜÛ]/g, 'U');
};

/**
 * Limpia y normaliza nombres de localidades y provincias.
 * Elimina tildes, convierte a Title Case, y elimina textos extra entre paréntesis o códigos postales.
 */
export const normalizeLocationName = (name?: string): string => {
  if (!name) return '';
  
  let clean = name.toLowerCase().trim();
  
  // Si hay una barra (ej: "Alicante/Alacant"), tomar solo la primera parte
  if (clean.includes('/')) {
    clean = clean.split('/')[0].trim();
  }
  
  // Eliminar textos entre paréntesis (ej: "Madrid (Capital)")
  clean = clean.replace(/\([^)]*\)/g, '').trim();
  
  // Eliminar códigos postales o números sueltos (ej: "Móstoles, 28932" o "Móstoles 28932")
  clean = clean.replace(/,?\s*\d{5}\b/g, '').trim();
  
  // Eliminar tildes
  clean = removeAccents(clean);
  
  // Title Case
  clean = clean.split(/[\s-]+/).map(word => {
    if (['de', 'del', 'la', 'las', 'el', 'los', 'y', 'en', 'l'].includes(word)) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
  
  // Correcciones específicas comunes
  const corrections: Record<string, string> = {
    'Alacant': 'Alicante',
    'Castello': 'Castellon',
    'Girona': 'Gerona',
    'Lleida': 'Lerida',
    'Ourense': 'Orense',
    'A Coruna': 'A Coruña',
    'Donostia': 'San Sebastian',
    'Gasteiz': 'Vitoria',
    'Bilbo': 'Bilbao'
  };
  
  return corrections[clean] || clean;
};

/**
 * Limpia y normaliza nombres de provincias.
 * Usa la misma lógica que las localidades.
 */
export const normalizeProvince = (name?: string): string => {
  return normalizeLocationName(name);
};

/**
 * Obtiene la ciudad a partir de los campos oficiales del BOE.
 * No infiere desde la dirección para evitar falsos positivos.
 */
export const normalizeCity = (auction: AuctionData): string | undefined => {
  // 1. Usar municipality si existe (campo oficial más preciso)
  if (auction.municipality && auction.municipality.trim() !== '') {
    return normalizeLocationName(auction.municipality);
  }
  
  // 2. Usar city si existe (retrocompatibilidad)
  if (auction.city && auction.city.trim() !== '' && auction.city !== 'España') {
    return normalizeLocationName(auction.city);
  }
  
  return undefined;
};

/**
 * Limpia y normaliza la dirección para mostrar Calle + Número.
 */
export const formatAddress = (rawAddress: string | undefined): string => {
  if (!rawAddress) return '';
  
  // 1. Basic cleanup: split by comma (often contains extra info like floor, door)
  let address = rawAddress.split(',')[0].trim();
  
  // 2. Normalize common street types and remove "DEL", "DE LA", etc. immediately after
  const streetTypes = [
    { raw: /^CALLE (?:DEL? |DE LA |DE LOS |DE LAS )?/i, clean: 'Calle ' },
    { raw: /^AVENIDA (?:DEL? |DE LA |DE LOS |DE LAS )?/i, clean: 'Av. ' },
    { raw: /^AV\.? (?:DEL? |DE LA |DE LOS |DE LAS )?/i, clean: 'Av. ' },
    { raw: /^CARRER (?:DEL? |DE LA |DE LOS |DE LAS )?/i, clean: 'Carrer ' },
    { raw: /^PLAZA (?:DEL? |DE LA |DE LOS |DE LAS )?/i, clean: 'Plaza ' },
    { raw: /^PZ\.? (?:DEL? |DE LA |DE LOS |DE LAS )?/i, clean: 'Plaza ' },
    { raw: /^PASEO (?:DEL? |DE LA |DE LOS |DE LAS )?/i, clean: 'Paseo ' },
    { raw: /^PS\.? (?:DEL? |DE LA |DE LOS |DE LAS )?/i, clean: 'Paseo ' },
    { raw: /^URBANIZACI[ÓO]N (?:DEL? |DE LA |DE LOS |DE LAS )?/i, clean: 'Urb. ' },
    { raw: /^URB\.? (?:DEL? |DE LA |DE LOS |DE LAS )?/i, clean: 'Urb. ' },
  ];

  for (const type of streetTypes) {
    if (type.raw.test(address)) {
      address = address.replace(type.raw, type.clean);
      break;
    }
  }

  // 3. Title Case
  const toTitleCase = (str: string) => {
    const lowercaseWords = ['de', 'del', 'la', 'el', 'los', 'las', 'en', 'y'];
    return str.toLowerCase().split(' ').map((word, index) => {
      if (lowercaseWords.includes(word) && index !== 0) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  };

  address = toTitleCase(address);

  // 4. Handle number at the end
  const numberRegex = /(?:\s+N[º°.]?\s*|\s+NUMERO\s+|\s+)(\d+[A-Z]?)$/i;
  if (numberRegex.test(address)) {
    address = address.replace(numberRegex, ', $1');
  }

  return address.trim();
};

/**
 * Genera un título limpio: Tipo + Calle + Número
 */
export const normalizeTitle = (auction: AuctionData): string => {
  const type = normalizePropertyType(auction.propertyType);
  const cleanAddress = formatAddress(auction.address);
  
  if (!cleanAddress) return `${type} en subasta`;
  
  const fullTitle = `${type} en ${cleanAddress}`;
  
  // Recortar si es muy largo
  if (fullTitle.length > 45) {
    return fullTitle.substring(0, 42) + '...';
  }
  
  return fullTitle;
};

/**
 * Genera una etiqueta de ubicación limpia para la tarjeta y ficha.
 * Formato: "Municipio / Provincia"
 */
export const normalizeLocationLabel = (auction: AuctionData): string => {
  const city = normalizeCity(auction);
  const province = normalizeProvince(auction.province || auction.city);
  
  if (city === 'España' || !city) {
    if (province && province !== 'España') return province;
    return 'Ubicación pendiente';
  }

  // Si la ciudad y la provincia son lo mismo (ej: Madrid / Madrid), solo mostrar una
  if (province && province !== 'España' && province.toLowerCase() !== city.toLowerCase()) {
    return `${city} · ${province}`;
  }
  
  return city;
};

/**
 * Detecta el estado de ocupación (para uso futuro en ficha).
 */
export const getOccupancyStatus = (description?: string): 'ocupado' | 'libre' | 'arrendado' | 'desconocido' => {
  if (!description) return 'desconocido';
  const d = description.toLowerCase();
  if (d.includes('sin ocupantes') || d.includes('vacio') || d.includes('libre de ocupantes')) return 'libre';
  if (d.includes('vivienda habitual') || d.includes('residencia del ejecutado') || d.includes('ocupado')) return 'ocupado';
  if (d.includes('arrendamiento') || d.includes('alquilado') || d.includes('inquilino')) return 'arrendado';
  return 'desconocido';
};

/**
 * Intenta extraer importes de cargas de la descripción.
 */
export const extractEstimatedCharges = (description?: string): number | null => {
  if (!description) return null;
  
  // 1. Buscar específicamente "Cargas: X,XX €" o "Cargas: X,XX euros"
  const cargasMatch = description.match(/Cargas:.*?([\d.,]+)\s*(?:€|euros)/i);
  if (cargasMatch) {
    const val = parseFloat(cargasMatch[1].replace(/\./g, '').replace(',', '.'));
    return isNaN(val) ? null : val;
  }

  // 2. Buscar "préstamo de X,XX euros" (común en descripciones largas)
  const prestamoMatch = description.match(/préstamo de\s*([\d.,]+)\s*(?:€|euros)/i);
  if (prestamoMatch) {
    const val = parseFloat(prestamoMatch[1].replace(/\./g, '').replace(',', '.'));
    return isNaN(val) ? null : val;
  }

  // 3. Si dice "Cargas: 0,00" o similar
  if (description.includes('Cargas: 0,00') || description.includes('Cargas: 0 €')) {
    return 0;
  }

  return null;
};
