import { AUCTIONS } from './src/data/auctions';

const upcoming = Object.values(AUCTIONS).filter(a => a.status === 'upcoming');
const suspended = Object.values(AUCTIONS).filter(a => a.status === 'suspended');

console.log(`Upcoming auctionDate: ${upcoming[0]?.auctionDate}`);
console.log(`Suspended auctionDate: ${suspended[0]?.auctionDate}`);
