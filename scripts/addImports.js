import fs from 'fs';
import path from 'path';

function addImport(filePath, importStatement) {
  const file = path.join(process.cwd(), filePath);
  let content = fs.readFileSync(file, 'utf-8');
  if (!content.includes('normalizeCity')) {
    content = importStatement + '\n' + content;
  } else if (!content.includes(importStatement)) {
    // If normalizeCity is used but not imported
    const importRegex = /import\s+{[^}]*}\s+from\s+['"]\.\.\/utils\/auctionNormalizer['"];/;
    if (importRegex.test(content)) {
      content = content.replace(importRegex, (match) => {
        if (!match.includes('normalizeCity')) {
          return match.replace('{', '{ normalizeCity,');
        }
        return match;
      });
    } else {
      content = importStatement + '\n' + content;
    }
  }
  fs.writeFileSync(file, content);
  console.log('Added import to', filePath);
}

addImport('src/components/AuctionDiscoverArticle.tsx', "import { normalizeCity } from '../utils/auctionNormalizer';");
addImport('src/utils/discoverTitles.ts', "import { normalizeCity } from './auctionNormalizer';");
