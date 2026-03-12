import { AuctionData } from '../data/auctions';

export function generateDiscoverTitle(slug: string, auction: AuctionData): string {
  const type = auction.propertyType?.toLowerCase() || 'inmueble';
  const location = auction.zone || auction.city || 'España';
  
  const appraisal = auction.appraisalValue;
  const debt = auction.claimedDebt;
  
  const formatCurrency = (value: number) => 
    value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

  const titles: string[] = [];

  if (appraisal && debt && debt < appraisal * 0.6) {
    titles.push(`Un ${type} en ${location} entra en subasta por una deuda de solo ${formatCurrency(debt)}`);
    titles.push(`Una subasta en ${location} llama la atención por su gran diferencia de precio`);
    titles.push(`Este ${type} en ${location} sale a subasta con un valor muy superior a la deuda`);
  }

  if (debt && debt < 150000) {
    titles.push(`Un ${type} en ${location} aparece en subasta por una cantidad inesperadamente baja`);
  }

  if (appraisal && appraisal > 500000) {
    titles.push(`Sale a subasta un exclusivo ${type} en ${location} valorado en ${formatCurrency(appraisal)}`);
  }

  if (appraisal) {
    titles.push(`Sale a subasta un ${type} en ${location} valorado en ${formatCurrency(appraisal)}`);
  }

  titles.push(`Una nueva subasta de ${type} en ${location} genera expectación en el mercado`);
  titles.push(`Oportunidad en ${location}: un ${type} acaba de entrar en subasta pública`);

  // Deterministic selection based on slug
  let seed = 0;
  for (let i = 0; i < slug.length; i++) {
    seed += slug.charCodeAt(i);
  }
  
  // Filter titles to ensure they are <= 90 chars
  const validTitles = titles.filter(t => t.length <= 90);
  
  if (validTitles.length === 0) {
    return `Subasta de ${type} en ${location}`.substring(0, 90);
  }

  return validTitles[seed % validTitles.length];
}
