import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUCTIONS_FILE = path.join(__dirname, '../src/data/auctions.ts');

function normalizeStatus(boeStatus: string): string {
  const s = boeStatus.toLowerCase();
  if (s.includes('próxima') || s.includes('proxima')) return 'upcoming';
  if (s.includes('celebrándose') || s.includes('celebrandose')) return 'active';
  if (s.includes('suspendida')) return 'suspended';
  if (s.includes('finalizada') || s.includes('cancelada') || s.includes('concluida')) return 'closed';
  return 'active';
}

function normalizeAuctions() {
  let content = fs.readFileSync(AUCTIONS_FILE, 'utf8');
  
  // Regex to find all status fields
  const statusRegex = /status:\s*"([^"]+)"/g;
  
  const updatedContent = content.replace(statusRegex, (match, p1) => {
    const normalized = normalizeStatus(p1);
    return `status: "${normalized}"`;
  });
  
  fs.writeFileSync(AUCTIONS_FILE, updatedContent);
  console.log('✅ auctions.ts normalizado correctamente.');
}

normalizeAuctions();
