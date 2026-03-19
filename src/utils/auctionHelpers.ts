import { AuctionData } from '../data/auctions';

export function formatPublishedDate(dateString?: string) {
  if (!dateString || dateString === 'null' || dateString === 'undefined') return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Publicado hoy";
  } else if (diffDays < 30) {
    return `Publicado hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
  } else {
    return `Publicado el ${date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  }
}

export function getOpportunityThreshold(auctions: Record<string, AuctionData>): number {
  const discounts = Object.values(auctions)
    .map(a => calculateDiscount(a.valorTasacion, a.valorSubasta, a.claimedDebt))
    .filter((d): d is number => d !== null && d > 0)
    .sort((a, b) => b - a);
  
  if (discounts.length === 0) return 0;
  
  const topIndex = Math.floor(discounts.length * 0.3); // Top 30%
  return discounts[topIndex] || 0;
}

export function sortAuctions(items: [string, AuctionData][]): [string, AuctionData][] {
  return [...items].sort((a, b) => {
    const aData = a[1];
    const bData = b[1];
    
    // Priorizar status sobre fecha
    const aClosed = aData.status ? aData.status === 'closed' : isAuctionFinished(aData.auctionDate);
    const bClosed = bData.status ? bData.status === 'closed' : isAuctionFinished(bData.auctionDate);
    
    if (aClosed && !bClosed) return 1;
    if (!aClosed && bClosed) return -1;
    
    // Si no están cerradas, priorizar activas sobre próximas/pausadas
    const aActive = aData.status ? isAuctionActive(aData.status) : !isAuctionFinished(aData.auctionDate);
    const bActive = bData.status ? isAuctionActive(bData.status) : !isAuctionFinished(bData.auctionDate);
    
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;

    const aDiscount = calculateDiscount(aData.valorTasacion, aData.valorSubasta, aData.claimedDebt) || 0;
    const bDiscount = calculateDiscount(bData.valorTasacion, bData.valorSubasta, bData.claimedDebt) || 0;
    return bDiscount - aDiscount;
  });
}

export function calculateDiscount(valorTasacion?: number, valorSubasta?: number, claimedDebt?: number): number | null {
  const valorReferencia = valorTasacion || valorSubasta;

  if (valorReferencia && valorReferencia > 0 && claimedDebt !== undefined && claimedDebt > 0) {
    const discount = ((valorReferencia - claimedDebt) / valorReferencia) * 100;
    return Math.round(discount);
  }
  return null;
}

export function isAuctionFinished(auctionDate?: string): boolean {
  if (!auctionDate) return false;
  
  // Parsear asegurando formato UTC para evitar problemas de timezone
  const endDate = new Date(auctionDate.includes('T') ? auctionDate : `${auctionDate}T00:00:00Z`);
  if (isNaN(endDate.getTime())) return false; // Invalid date

  const now = new Date();
  return now.getTime() > endDate.getTime();
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function isAuctionActive(status?: string, auctionDate?: string): boolean {
  if (status) {
    return status === 'active' || status === 'upcoming' || status === 'suspended';
  }
  // Fallback: si status es missing, incluir si la fecha es futura
  return auctionDate ? !isAuctionFinished(auctionDate) : false;
}

export function isAuctionClosed(status?: string, auctionDate?: string): boolean {
  if (status) {
    return status === 'closed';
  }
  // Fallback: si status es missing, incluir si la fecha es pasada
  return auctionDate ? isAuctionFinished(auctionDate) : false;
}

export function getFilteredAuctions(
  auctions: Record<string, AuctionData>, 
  statusFilter: 'active' | 'closed' | 'all' = 'active'
): Record<string, AuctionData> {
  const filtered: Record<string, AuctionData> = {};
  for (const [slug, data] of Object.entries(auctions)) {
    // 1. Filtro de estado con fallback
    if (statusFilter === 'active' && !isAuctionActive(data.status, data.auctionDate)) continue;
    if (statusFilter === 'closed' && !isAuctionClosed(data.status, data.auctionDate)) continue;

    // 2. Filtro de calidad (valor/deuda)
    const valorTasacion = data.valorTasacion || data.appraisalValue;
    const valorSubasta = data.valorSubasta;
    const claimedDebt = data.claimedDebt;
    
    const valorReferencia = valorTasacion || valorSubasta;
    
    let esValorBajo = false;
    if (valorTasacion !== null && valorTasacion !== undefined && valorTasacion < 100000) {
      esValorBajo = true;
    }
    
    let esDeudaCero = false;
    if (claimedDebt === 0) {
      esDeudaCero = true;
    }
    
    let esRatioExcesivo = false;
    if (valorReferencia && claimedDebt !== null && claimedDebt !== undefined) {
      const ratio = Math.round(((valorReferencia - claimedDebt) / valorReferencia) * 100);
      if (ratio > 85) {
        esRatioExcesivo = true;
      }
    }
    
    if (!esValorBajo && !esDeudaCero && !esRatioExcesivo) {
      filtered[slug] = data;
    }
  }
  return filtered;
}

export function sortActiveFirst<T>(
  items: T[],
  getDate: (item: T) => string | undefined
): T[] {
  return [...items].sort((a, b) => {
    const aFinished = isAuctionFinished(getDate(a));
    const bFinished = isAuctionFinished(getDate(b));
    if (aFinished && !bFinished) return 1;
    if (!aFinished && bFinished) return -1;
    return 0;
  });
}
