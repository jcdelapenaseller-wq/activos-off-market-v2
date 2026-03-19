import { AUCTIONS } from './src/data/auctions';
import { getFilteredAuctions } from './src/utils/auctionHelpers';

const active = getFilteredAuctions(AUCTIONS, 'active');
const closed = getFilteredAuctions(AUCTIONS, 'closed');

console.log('Active:', Object.keys(active).length);
console.log('Closed:', Object.keys(closed).length);
