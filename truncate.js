import fs from 'fs';
const lines = fs.readFileSync('src/data/auctions.ts', 'utf-8').split('\n');
const newLines = lines.slice(0, 1351);
newLines.push('};');
fs.writeFileSync('src/data/auctions.ts', newLines.join('\n'));
console.log('File truncated successfully.');
