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
 * Infiere la ciudad a partir de la dirección o la autoridad gestora.
 */
export const normalizeCity = (auction: AuctionData): string => {
  if (auction.city && auction.city.trim() !== '' && auction.city !== 'España') return auction.city;
  
  // 1. Intentar extraer de procedureType (ej: "Sección Civil TI Madrid")
  if (auction.procedureType) {
    const match = auction.procedureType.match(/TI\s+([^.]+)/i);
    if (match && match[1]) {
      const city = match[1].trim();
      if (city.length > 2 && !city.includes('AEAT')) return city;
    }
    
    // AEAT
    if (auction.procedureType.includes('MADRID')) return 'Madrid';
    if (auction.procedureType.includes('BARCELONA')) return 'Barcelona';
    if (auction.procedureType.includes('VALENCIA')) return 'Valencia';
    if (auction.procedureType.includes('SEVILLA')) return 'Sevilla';
    if (auction.procedureType.includes('MALAGA')) return 'Málaga';
  }

  // 2. Intentar extraer de la dirección (última parte suele ser la ciudad)
  if (auction.address) {
    const parts = auction.address.split(',');
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1].trim().replace(/\d/g, '').trim();
      if (lastPart.length > 2 && lastPart.length < 30) return lastPart;
    }
  }

  return 'España';
};

/**
 * Genera un título limpio: Tipo + Calle + Número
 */
export const normalizeTitle = (auction: AuctionData): string => {
  const type = normalizePropertyType(auction.propertyType);
  let address = auction.address || 'Ubicación no disponible';
  
  // Limpiar dirección: quedarnos con Calle + Número
  // Ej: "Calle Mayor 1, 2º A" -> "Calle Mayor 1"
  let cleanAddress = address.split(',')[0].trim();
  
  // Eliminar prefijos comunes del BOE si existen
  cleanAddress = cleanAddress.replace(/^(CL|CALLE|AV|AVENIDA|PS|PASEO|CTRA|CARRETERA)\s+/i, '');
  
  const fullTitle = `${type} en ${cleanAddress}`;
  
  // Recortar si es muy largo
  if (fullTitle.length > 45) {
    return fullTitle.substring(0, 42) + '...';
  }
  
  return fullTitle;
};

/**
 * Genera una etiqueta de ubicación limpia para la tarjeta.
 * Formato: "Ciudad" o "Ciudad / Zona"
 */
export const normalizeLocationLabel = (auction: AuctionData): string => {
  let city = normalizeCity(auction);
  const zone = auction.zone && auction.zone.trim() !== '' ? auction.zone : null;
  
  if (city === 'España') {
    // Si no detectamos ciudad, intentar devolver la primera parte de la dirección
    if (auction.address) {
      const firstPart = auction.address.split(',')[0].trim();
      if (firstPart.length > 3) return firstPart;
    }
    return 'Ubicación pendiente';
  }

  if (zone) return `${city} / ${zone}`;
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
