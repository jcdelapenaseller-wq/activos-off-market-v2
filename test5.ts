import { AUCTIONS } from './src/data/auctions';
import { getFilteredAuctions } from './src/utils/auctionHelpers';

const activeFiltered = getFilteredAuctions(AUCTIONS, 'active');
console.log('Upcoming in filtered:', Object.values(activeFiltered).filter(a => a.status === 'upcoming').length);
console.log('Suspended in filtered:', Object.values(activeFiltered).filter(a => a.status === 'suspended').length);
