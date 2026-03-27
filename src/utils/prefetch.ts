import { AUCTIONS } from '../data/auctions';

const prefetchedSlugs = new Set<string>();

export const prefetchAuction = (slug: string) => {
  if (prefetchedSlugs.has(slug)) return;
  
  // 1. Prefetch component chunk
  import('../components/AuctionPage');

  const auction = AUCTIONS[slug as keyof typeof AUCTIONS];
  if (!auction) return;

  // 2. Prefetch main image if exists
  if (auction.imageUrl) {
    const img = new Image();
    img.src = auction.imageUrl;
  }

  // Mark as prefetched to avoid redundant work
  prefetchedSlugs.add(slug);
};
