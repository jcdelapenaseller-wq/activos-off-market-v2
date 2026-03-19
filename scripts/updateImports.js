import fs from 'fs';
import path from 'path';

const files = [
  'src/components/AuctionBarcelonaGuide.tsx',
  'src/components/ZonePropertyAuctions.tsx',
  'src/components/AuctionSevillaGuide.tsx',
  'src/components/AuctionExamplesIndex.tsx',
  'src/components/ProvinceHub.tsx',
  'src/components/AuctionPage.tsx',
  'src/components/StreetAuctions.tsx',
  'src/components/RecentAuctions.tsx',
  'src/components/OpportunityAuctions.tsx',
  'src/components/HighDiscountAuctions.tsx',
  'src/components/RecentAuctionsHome.tsx',
  'src/components/DiscoverProvinceArticle.tsx',
  'src/components/AuctionValenciaGuide.tsx',
  'src/components/DiscoverArticlesIndex.tsx',
  'src/components/AuctionDiscoverArticle.tsx',
  'src/components/AuctionMadridGuide.tsx',
  'src/components/CityPropertyAuctions.tsx',
  'src/components/ZoneAuctions.tsx',
  'src/components/RelatedAuctions.tsx'
];

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  let content = fs.readFileSync(filePath, 'utf-8');
  content = content.replace("import { FILTERED_AUCTIONS as AUCTIONS } from '../data/filteredAuctions';", "import { ACTIVE_AUCTIONS as AUCTIONS } from '../data/filteredAuctions';");
  fs.writeFileSync(filePath, content);
  console.log('Updated', file);
});

const historicalFile = 'src/components/HistoricalAuctions.tsx';
let historicalContent = fs.readFileSync(path.join(process.cwd(), historicalFile), 'utf-8');
historicalContent = historicalContent.replace("import { FILTERED_AUCTIONS as AUCTIONS } from '../data/filteredAuctions';", "import { CLOSED_AUCTIONS as AUCTIONS } from '../data/filteredAuctions';");
// Remove manual filtering logic
historicalContent = historicalContent.replace(/const allAuctionsRaw = Object.entries\(AUCTIONS\);[\s\S]*?const historicalAuctions = sortAuctions\(allAuctionsRaw\.filter\(\(item: \[string, any\]\) => \{[\s\S]*?\}\)\);/, "const historicalAuctions = sortAuctions(Object.entries(AUCTIONS));");
fs.writeFileSync(path.join(process.cwd(), historicalFile), historicalContent);
console.log('Updated HistoricalAuctions.tsx');
