import { isAuctionActive, isAuctionClosed, isAuctionFinished } from './src/utils/auctionHelpers';

const status = 'active';
const auctionDate = '2026-03-09';

console.log(`isAuctionFinished: ${isAuctionFinished(auctionDate)}`);
console.log(`isAuctionClosed: ${isAuctionClosed(status, auctionDate)}`);
console.log(`isAuctionActive: ${isAuctionActive(status, auctionDate)}`);
