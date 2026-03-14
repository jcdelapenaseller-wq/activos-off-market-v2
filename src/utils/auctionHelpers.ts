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
