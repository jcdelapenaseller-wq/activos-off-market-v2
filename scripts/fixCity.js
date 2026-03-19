import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'src/components/AuctionDiscoverArticle.tsx');
let content = fs.readFileSync(file, 'utf-8');

// We need to be careful with optional chaining like auction.city?.toLowerCase()
content = content.replace(/auction\.city\?\./g, 'normalizeCity(auction).');
content = content.replace(/auction\.city/g, 'normalizeCity(auction)');

fs.writeFileSync(file, content);
console.log('Fixed AuctionDiscoverArticle.tsx');
