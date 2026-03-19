import { AUCTIONS } from './src/data/auctions';
import { getFilteredAuctions, sortAuctions } from './src/utils/auctionHelpers';
const closed = getFilteredAuctions(AUCTIONS, 'closed');
console.log('Closed count:', Object.keys(closed).length);
const sorted = sortAuctions(Object.entries(closed));
console.log('Sorted count:', sorted.length);
