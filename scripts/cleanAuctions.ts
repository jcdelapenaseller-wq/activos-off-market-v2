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

// Extract entries
const entryRegex = /'([^']+)':\s*\{([\s\S]*?)\}(?=,\n\s*'[a-zA-Z0-9-]+':|\n\};)/g;
const entries = [];
let match;
const seenIds = new Set();
let removedCount = 0;

while ((match = entryRegex.exec(body)) !== null) {
  const id = match[1];
  const dataStr = match[2];
  
  if (!seenIds.has(id)) {
    seenIds.add(id);
    
    // Parse values to apply filters
    const getVal = (key: string) => {
      const m = new RegExp(`${key}:\\s*([0-9.]+)`).exec(dataStr);
      return m ? parseFloat(m[1]) : null;
    };
    
    const valorTasacion = getVal('valorTasacion') || getVal('appraisalValue');
    const valorSubasta = getVal('valorSubasta');
    const claimedDebt = getVal('claimedDebt');
    
    const valorReferencia = valorTasacion || valorSubasta;
    
    let esValorBajo = false;
    if (valorTasacion !== null && valorTasacion < 100000) {
      esValorBajo = true;
    }
    
    let esDeudaCero = false;
    if (claimedDebt === 0) {
      esDeudaCero = true;
    }
    
    let esRatioExcesivo = false;
    if (valorReferencia && claimedDebt !== null && claimedDebt !== undefined) {
      const ratio = Math.round(((valorReferencia - claimedDebt) / valorReferencia) * 100);
      if (ratio > 85) {
        esRatioExcesivo = true;
      }
    }
    
    if (!esValorBajo && !esDeudaCero && !esRatioExcesivo) {
      entries.push(`  '${id}': {${dataStr}}`);
    } else {
      removedCount++;
    }
  }
}

const footer = '\n};\n';
const newContent = header + '\n' + entries.join(',\n') + footer;

fs.writeFileSync(auctionsFilePath, newContent);
console.log(`Filtered auctions.ts. Kept ${entries.length} entries. Removed ${removedCount} entries.`);

