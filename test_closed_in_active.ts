import { ACTIVE_AUCTIONS } from './src/data/filteredAuctions';

const active = Object.values(ACTIVE_AUCTIONS);
const closedInActive = active.filter(a => a.status === 'closed');
console.log(`Closed in active: ${closedInActive.length}`);
