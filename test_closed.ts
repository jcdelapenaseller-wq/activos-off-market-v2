import { AUCTIONS } from './src/data/auctions';
import { getFilteredAuctions } from './src/utils/auctionHelpers';

const closedRaw = Object.values(AUCTIONS).filter(a => a.status === 'closed');
console.log('Closed raw:', closedRaw.length);

const closedFiltered = getFilteredAuctions(AUCTIONS, 'closed');
const closedFilteredWithStatusClosed = Object.values(closedFiltered).filter(a => a.status === 'closed');
console.log('Closed filtered with status closed:', closedFilteredWithStatusClosed.length);
