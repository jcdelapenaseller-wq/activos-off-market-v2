import fs from 'fs';
import path from 'path';

const auctionsFilePath = path.join(process.cwd(), 'src/data/auctions.ts');
let content = fs.readFileSync(auctionsFilePath, 'utf-8');

const startMarker = 'export const AUCTIONS: Record<string, AuctionData> = {';
const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
  console.error('Start marker not found');
  process.exit(1);
}

const header = content.slice(0, startIndex + startMarker.length);
const body = content.slice(startIndex + startMarker.length);

const entryRegex = /'([^']+)':\s*\{([\s\S]*?)\}(?=,\n\s*'[a-zA-Z0-9-]+':|\n\};)/g;
const entries = [];
let match;
let updatedCount = 0;

while ((match = entryRegex.exec(body)) !== null) {
  const id = match[1];
  let dataStr = match[2];
  
  const getVal = (key) => {
    const m = new RegExp(`${key}:\\s*"([^"]+)"`).exec(dataStr);
    return m ? m[1] : null;
  };
  
  const publishedAt = getVal('publishedAt');
  const startDate = getVal('startDate');
  const auctionDate = getVal('auctionDate');
  
  if (publishedAt) {
    // If publishedAt is a recent timestamp (e.g. 2026-03-17 or 2026-03-18) and we have startDate or auctionDate
    // We replace it with startDate or auctionDate
    if (publishedAt.includes('T') && (startDate || auctionDate)) {
      const newPublishedAt = startDate || auctionDate;
      if (newPublishedAt && newPublishedAt !== 'undefined' && newPublishedAt !== '') {
        dataStr = dataStr.replace(new RegExp(`publishedAt:\\s*"${publishedAt}"`), `publishedAt: "${newPublishedAt}"`);
        updatedCount++;
      }
    }
  }
  
  entries.push(`  '${id}': {${dataStr}}`);
}

const footer = '\n};\n';
const newContent = header + '\n' + entries.join(',\n') + footer;

fs.writeFileSync(auctionsFilePath, newContent);
console.log(`Updated publishedAt for ${updatedCount} entries.`);
