import fs from 'fs';

const path = 'src/components/AuctionDiscoverArticle.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'const cityName = useMemo(() => auction ? (cityName || \'España\') : \'España\', [auction]);',
  'const cityName = useMemo(() => auction ? (normalizeCity(auction) || \'España\') : \'España\', [auction]);'
);

fs.writeFileSync(path, content);
console.log('Done');
