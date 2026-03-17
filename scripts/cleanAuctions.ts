import fs from 'fs';
import path from 'path';

const auctionsFilePath = path.join(process.cwd(), 'src/data/auctions.ts');
const content = fs.readFileSync(auctionsFilePath, 'utf-8');

const startMarker = 'export const AUCTIONS: Record<string, AuctionData> = {';
const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
  console.error('Start marker not found');
  process.exit(1);
}

const header = content.slice(0, startIndex + startMarker.length);
const body = content.slice(startIndex + startMarker.length);

// Extract entries
const entryRegex = /'([^']+)':\s*\{[\s\S]*?\},/g;
const entries = [];
let match;
const seenIds = new Set();

while ((match = entryRegex.exec(body)) !== null) {
  const id = match[1];
  if (!seenIds.has(id)) {
    seenIds.add(id);
    entries.push(match[0]);
  }
}

const footer = '\n};';
const newContent = header + '\n' + entries.join('\n') + footer;

fs.writeFileSync(auctionsFilePath, newContent);
console.log(`Deduplicated auctions.ts. Kept ${entries.length} unique entries.`);
