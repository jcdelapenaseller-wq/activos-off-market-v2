const fs = require('fs');
const path = 'src/components/AuctionDiscoverArticle.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add cityName definition
content = content.replace(
  '  const formattedCurrency = (value: number | undefined) => {',
  '  const cityName = useMemo(() => auction ? (normalizeCity(auction) || \'España\') : \'España\', [auction]);\n\n  const formattedCurrency = (value: number | undefined) => {'
);

// Replace all normalizeCity(auction) with cityName
content = content.replace(/normalizeCity\(auction\)/g, 'cityName');

fs.writeFileSync(path, content);
console.log('Done');
