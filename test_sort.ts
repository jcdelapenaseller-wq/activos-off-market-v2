import { CLOSED_AUCTIONS } from './src/data/filteredAuctions';
import { sortAuctions } from './src/utils/auctionHelpers';

const sorted = sortAuctions(Object.entries(CLOSED_AUCTIONS));
console.log(`Sorted count: ${sorted.length}`);
