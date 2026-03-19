import fs from 'fs';
import path from 'path';

function replaceCity(filePath) {
  const file = path.join(process.cwd(), filePath);
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/auction\.city\?\./g, 'normalizeCity(auction).');
  content = content.replace(/auction\.city/g, 'normalizeCity(auction)');
  fs.writeFileSync(file, content);
  console.log('Fixed', filePath);
}

replaceCity('src/components/AuctionPage.tsx');
replaceCity('src/utils/discoverTitles.ts');
