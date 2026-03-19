import { AUCTIONS } from './src/data/auctions';
import { normalizeStatus, isAuctionFinished } from './src/utils/auctionHelpers';

const auctions = Object.values(AUCTIONS);
const total = auctions.length;
const active = auctions.filter(a => a.status === 'active').length;
const upcoming = auctions.filter(a => a.status === 'upcoming').length;
const suspended = auctions.filter(a => a.status === 'suspended').length;
const closed = auctions.filter(a => a.status === 'closed').length;

console.log(`Total: ${total}`);
console.log(`Active: ${active}`);
console.log(`Upcoming: ${upcoming}`);
console.log(`Suspended: ${suspended}`);
console.log(`Closed: ${closed}`);

const finishedByDate = auctions.filter(a => isAuctionFinished(a.auctionDate)).length;
console.log(`Finished by date: ${finishedByDate}`);
