import { AUCTIONS } from './src/data/auctions';
import { getFilteredAuctions } from './src/utils/auctionHelpers';

const upcoming = Object.values(AUCTIONS).filter(a => a.status === 'upcoming');
const suspended = Object.values(AUCTIONS).filter(a => a.status === 'suspended');

console.log(`Upcoming raw: ${upcoming.length}`);
console.log(`Suspended raw: ${suspended.length}`);

const activeFiltered = getFilteredAuctions(AUCTIONS, 'active');
const upcomingFiltered = Object.values(activeFiltered).filter(a => a.status === 'upcoming');
const suspendedFiltered = Object.values(activeFiltered).filter(a => a.status === 'suspended');

console.log(`Upcoming filtered: ${upcomingFiltered.length}`);
console.log(`Suspended filtered: ${suspendedFiltered.length}`);
