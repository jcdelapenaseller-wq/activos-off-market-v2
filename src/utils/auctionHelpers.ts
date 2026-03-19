import { AuctionData } from '../data/auctions';
import { AuctionStatus } from '../types';

export function normalizeStatus(boeStatus: string): AuctionStatus {
  const s = boeStatus.toLowerCase();
  if (s.includes('próxima') || s.includes('proxima') || s.includes('próxima apertura')) return 'upcoming';
  if (s.includes('celebrándose') || s.includes('celebrandose') || s.includes('en curso')) return 'active';
  if (s.includes('suspendida') || s.includes('pausada')) return 'suspended';
  if (s.includes('finalizada') || s.includes('cancelada') || s.includes('concluida') || s.includes('adjudicada')) return 'closed';
  return 'active';
}

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

export function getAuctionType(boeId?: string): string {
  if (!boeId) return 'OTRA';
  if (boeId.startsWith('SUB-JA')) return 'JUDICIAL EN VÍA DE APREMIO';
  if (boeId.startsWith('SUB-JV')) return 'JUDICIAL VOLUNTARIA';
  if (boeId.startsWith('SUB-JC')) return 'JUDICIAL CONCURSAL';
  if (boeId.startsWith('SUB-AT')) return 'AGENCIA TRIBUTARIA';
  if (boeId.startsWith('SUB-SS')) return 'SEGURIDAD SOCIAL';
  if (boeId.startsWith('SUB-NV')) return 'NOTARIAL VOLUNTARIA';
  if (boeId.startsWith('SUB-NC')) return 'NOTARIAL';
  return 'OTRA';
}

export function getComputedStatus(data: { status?: string; auctionDate?: string }): string {
  if (data.status === 'closed' || isAuctionFinished(data.auctionDate)) return 'closed';
  if (data.status === 'suspended') return 'suspended';
  if (data.status === 'upcoming') return 'upcoming';
  return 'active';
}

export function sortAuctions(items: [string, AuctionData][]): [string, AuctionData][] {
  return [...items].sort((a, b) => {
    const aData = a[1];
    const bData = b[1];
    
    const aStatus = getComputedStatus(aData);
    const bStatus = getComputedStatus(bData);
    
    const aClosed = aStatus === 'closed';
    const bClosed = bStatus === 'closed';
    
    if (aClosed && !bClosed) return 1;
    if (!aClosed && bClosed) return -1;
    
    const aActive = aStatus === 'active';
    const bActive = bStatus === 'active';
    
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
  return getComputedStatus({ status, auctionDate }) === 'active';
}

export function isAuctionClosed(status?: string, auctionDate?: string): boolean {
  return getComputedStatus({ status, auctionDate }) === 'closed';
}

export function getFilteredAuctions(
  auctions: Record<string, AuctionData>, 
  statusFilter: 'active' | 'closed' | 'all' = 'active'
): Record<string, AuctionData> {
  const filtered: Record<string, AuctionData> = {};
  for (const [slug, data] of Object.entries(auctions)) {
    // 1. Filtro de estado estricto
    const isClosed = isAuctionClosed(data.status, data.auctionDate);
    const isActive = isAuctionActive(data.status, data.auctionDate);

    if (statusFilter === 'active' && !isActive) continue;
    if (statusFilter === 'closed' && !isClosed) continue;

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
