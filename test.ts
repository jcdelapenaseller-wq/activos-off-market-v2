import { AUCTIONS } from './src/data/auctions';
import { getFilteredAuctions } from './src/utils/auctionHelpers';
console.log('Active:', Object.keys(getFilteredAuctions(AUCTIONS, 'active')).length);
console.log('Closed:', Object.keys(getFilteredAuctions(AUCTIONS, 'closed')).length);
