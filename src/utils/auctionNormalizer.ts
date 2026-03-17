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
  if (auction.city && auction.city.trim() !== '') return auction.city;
  return 'España';
};

/**
 * Genera una etiqueta de ubicación limpia para la tarjeta.
 * Formato: "Ciudad" o "Ciudad / Zona"
 */
export const normalizeLocationLabel = (auction: AuctionData): string => {
  const city = normalizeCity(auction);
  const zone = auction.zone && auction.zone.trim() !== '' ? auction.zone : null;
  
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
 * Intenta extraer importes de cargas (para uso futuro en ficha).
 */
export const extractEstimatedCharges = (description?: string): number => {
  if (!description) return 0;
  // Regex para buscar importes seguidos de € o euros
  const regex = /(\d+(?:\.\d{3})*(?:,\d{2})?)\s*(?:€|euros)/gi;
  let total = 0;
  let match;
  while ((match = regex.exec(description)) !== null) {
    const value = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
    if (!isNaN(value)) total += value;
  }
  return total;
};
