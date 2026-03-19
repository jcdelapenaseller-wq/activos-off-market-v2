import { normalizeCity } from './auctionNormalizer';
import { AuctionData } from '../data/auctions';

export function generateDiscoverTitle(slug: string, auction: AuctionData): string {
  const type = auction.propertyType?.toLowerCase() || 'inmueble';
  const location = auction.zone || normalizeCity(auction) || 'España';
  const city = normalizeCity(auction) || 'España';
  
  const appraisal = auction.appraisalValue || 0;
  const debt = auction.claimedDebt || 0;
  const ratio = appraisal > 0 ? debt / appraisal : 1;
  
  const formatNum = (val: number) => 
    val.toLocaleString('es-ES', { maximumFractionDigits: 0 });

  const titles: string[] = [];

  // 1. SHOCK DE PRECIO (ratio < 0.5)
  if (ratio < 0.5 && appraisal > 0 && debt > 0) {
    titles.push(`Un ${type} en ${location} de ${formatNum(appraisal)} € sale a subasta por una deuda de ${formatNum(debt)} €`);
    titles.push(`Subasta en ${location}: un ${type} de ${formatNum(appraisal)} € con una deuda de solo ${formatNum(debt)} €`);
    titles.push(`${type} en ${location} valorado en ${formatNum(appraisal)} € aparece en subasta por ${formatNum(debt)} €`);
    titles.push(`¿Oportunidad? Un ${type} en ${location} de ${formatNum(appraisal)} € entra en subasta por ${formatNum(debt)} €`);
  } 
  // 2. OPORTUNIDAD (0.5 <= ratio < 0.7)
  else if (ratio < 0.7 && appraisal > 0) {
    titles.push(`Detectan una nueva subasta en ${city} que podría esconder una gran oportunidad`);
    titles.push(`Una subasta en ${location} llama la atención por la diferencia entre tasación y deuda`);
    titles.push(`Oportunidad en ${location}: un ${type} de ${formatNum(appraisal)} € entra en subasta pública`);
    titles.push(`Analizan un ${type} en ${location} que acaba de salir a subasta por debajo de tasación`);
  } 
  // 3. NOTICIA GENERAL (ratio >= 0.7)
  else {
    titles.push(`Este ${type} en ${location} acaba de entrar en subasta pública`);
    titles.push(`Nueva subasta de ${type} en ${location} valorado en ${formatNum(appraisal)} €`);
    titles.push(`Un ${type} en ${location} sale a subasta: todos los detalles del expediente`);
    titles.push(`Detectada subasta de ${type} en ${location} con un valor de ${formatNum(appraisal)} €`);
  }

  // Deterministic selection based on slug
  let seed = 0;
  for (let i = 0; i < slug.length; i++) {
    seed += slug.charCodeAt(i);
  }
  
  // Filter titles to ensure they are <= 90 chars and not empty
  const validTitles = titles.filter(t => t.length <= 90);
  
  if (validTitles.length === 0) {
    // Fallback if all templates failed length check (unlikely with these templates)
    const fallback = `Subasta de ${type} en ${location} de ${formatNum(appraisal)} €`.substring(0, 90);
    return fallback;
  }

  return validTitles[seed % validTitles.length];
}
