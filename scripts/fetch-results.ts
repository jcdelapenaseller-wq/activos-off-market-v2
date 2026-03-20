import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { AUCTIONS } from '../src/data/auctions';
import { AUCTION_RESULTS } from '../src/data/auctionResults';

const RESULTS_FILE = path.join(process.cwd(), 'src/data/auctionResults.ts');

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchResults() {
  const closedAuctions = Object.entries(AUCTIONS).filter(
    ([slug, auction]) => auction.status === 'closed' && !AUCTION_RESULTS[slug]
  ).slice(0, 50);

  console.log(`Checking ${closedAuctions.length} closed auctions...`);

  const newResults = { ...AUCTION_RESULTS };

  for (const [slug, auction] of closedAuctions) {
    if (!auction.boeUrl) continue;

    console.log(`Checking ${slug}...`);
    
    try {
      await delay(7000 + Math.random() * 3000); // 7-10s delay

      const response = await fetch(auction.boeUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const html = await response.text();
      const $ = cheerio.load(html);

      // BOE structure analysis (generic selectors)
      // Look for result section
      const resultSection = $('.resultado-subasta, .pujas-subasta');
      
      if (resultSection.length === 0) {
        console.log(`No result section found for ${slug}`);
        continue;
      }

      // Extract status and price
      const statusText = resultSection.text().toLowerCase();
      let auctionResultStatus: 'adjudicated' | 'deserted' | 'suspended' | null = null;
      let finalPrice: number | undefined;

      if (statusText.includes('adjudicada')) {
        auctionResultStatus = 'adjudicated';
        // Extract price (look for currency format)
        const priceText = resultSection.find('.precio-final, .importe').text();
        const priceMatch = priceText.match(/[\d.,]+/);
        if (priceMatch) {
          finalPrice = parseFloat(priceMatch[0].replace(/\./g, '').replace(',', '.'));
        }
      } else if (statusText.includes('desierta')) {
        auctionResultStatus = 'deserted';
      }

      // Validation: Only save if certain
      if (auctionResultStatus && (auctionResultStatus === 'deserted' || finalPrice)) {
        newResults[slug] = { 
          finalPrice, 
          auctionResultStatus, 
          resultCheckedAt: new Date().toISOString() 
        };
        console.log(`Result found for ${slug}: ${auctionResultStatus} ${finalPrice || ''}`);
      } else {
        console.log(`No clear result found for ${slug}`);
      }

    } catch (e) {
      console.error(`Failed to fetch ${slug}:`, e);
    }
  }

  // Save results
  const fileContent = `export const AUCTION_RESULTS: Record<string, { finalPrice?: number; auctionResultStatus?: 'adjudicated' | 'deserted' | 'suspended'; resultCheckedAt?: string; }> = ${JSON.stringify(newResults, null, 2)};`;
  fs.writeFileSync(RESULTS_FILE, fileContent);
  console.log('Results updated.');
}

fetchResults();
