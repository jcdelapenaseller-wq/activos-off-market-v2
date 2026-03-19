import { AUCTIONS } from './src/data/auctions';

const dates = Object.values(AUCTIONS).map(a => a.auctionDate);
const counts = dates.reduce((acc, date) => {
  const d = date || 'undefined';
  acc[d] = (acc[d] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

console.log(counts);
