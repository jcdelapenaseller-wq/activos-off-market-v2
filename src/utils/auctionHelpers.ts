import { AuctionData } from '../data/auctions';

export function formatPublishedDate(dateString?: string) {
  if (!dateString) return null;
  const date = new Date(dateString);
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
    .map(a => calculateDiscount(a.valorTasacion, a.valorSubasta))
    .filter((d): d is number => d !== null && d > 0)
    .sort((a, b) => b - a);
  
  if (discounts.length === 0) return 0;
  
  const topIndex = Math.floor(discounts.length * 0.3); // Top 30%
  return discounts[topIndex] || 0;
}

export function sortAuctions(items: [string, AuctionData][]): [string, AuctionData][] {
  return [...items].sort((a, b) => {
    const aFinished = isAuctionFinished(a[1].auctionDate);
    const bFinished = isAuctionFinished(b[1].auctionDate);
    if (aFinished && !bFinished) return 1;
    if (!aFinished && bFinished) return -1;

    const aDiscount = calculateDiscount(a[1].valorTasacion, a[1].valorSubasta) || 0;
    const bDiscount = calculateDiscount(b[1].valorTasacion, b[1].valorSubasta) || 0;
    return bDiscount - aDiscount;
  });
}

export function calculateDiscount(valorTasacion?: number, valorSubasta?: number): number | null {
  if (valorTasacion && valorSubasta && valorTasacion > 0) {
    const discount = ((valorTasacion - valorSubasta) / valorTasacion) * 100;
    return Math.round(discount);
  }
  return null;
}

export function isAuctionFinished(auctionDate?: string): boolean {
  if (!auctionDate) return false;
  
  // Parse date string. If it's a valid date, compare it with now.
  const endDate = new Date(auctionDate);
  if (isNaN(endDate.getTime())) return false; // Invalid date

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  
  return now > endDate;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
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
