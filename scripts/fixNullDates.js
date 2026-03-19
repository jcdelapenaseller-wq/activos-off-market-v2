import fs from 'fs';
import path from 'path';

const auctionsFilePath = path.join(process.cwd(), 'src/data/auctions.ts');
let content = fs.readFileSync(auctionsFilePath, 'utf-8');

const now = new Date().toISOString();
content = content.replace(/publishedAt:\s*"null"/g, `publishedAt: "${now}"`);
content = content.replace(/startDate:\s*"null"/g, `startDate: "${now}"`);
content = content.replace(/auctionDate:\s*"null"/g, `auctionDate: "${now}"`);

fs.writeFileSync(auctionsFilePath, content);
console.log('Fixed null dates.');
