import { ACTIVE_AUCTIONS } from './src/data/filteredAuctions';
import { isAuctionFinished } from './src/utils/auctionHelpers';

const active = Object.values(ACTIVE_AUCTIONS);
const finishedInActive = active.filter(a => isAuctionFinished(a.auctionDate));
console.log(`Active total: ${active.length}`);
console.log(`Finished in active: ${finishedInActive.length}`);
