import { AUCTIONS } from './src/data/auctions';
import { getFilteredAuctions } from './src/utils/auctionHelpers';

const total = Object.keys(AUCTIONS).length;
const active = Object.values(AUCTIONS).filter(a => a.status === 'active').length;
const upcoming = Object.values(AUCTIONS).filter(a => a.status === 'upcoming').length;
const suspended = Object.values(AUCTIONS).filter(a => a.status === 'suspended').length;
const closed = Object.values(AUCTIONS).filter(a => a.status === 'closed').length;

console.log(`Total: ${total}`);
console.log(`Active: ${active}`);
console.log(`Upcoming: ${upcoming}`);
console.log(`Suspended: ${suspended}`);
console.log(`Closed: ${closed}`);

const ACTIVE_AUCTIONS = getFilteredAuctions(AUCTIONS, 'active');
const CLOSED_AUCTIONS = getFilteredAuctions(AUCTIONS, 'closed');

console.log(`ACTIVE_AUCTIONS count: ${Object.keys(ACTIVE_AUCTIONS).length}`);
console.log(`CLOSED_AUCTIONS count: ${Object.keys(CLOSED_AUCTIONS).length}`);
