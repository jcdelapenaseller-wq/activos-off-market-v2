import { AUCTIONS } from '../src/data/auctions';

async function analyzeAuctions() {
  const auctions = Object.values(AUCTIONS);
  const total = auctions.length;
  
  const totalByProvince: Record<string, number> = {};
  const remainingValue: Record<string, number> = {};
  
  for (const a of auctions) {
    const appraisal = a.appraisalValue || a.valorTasacion || a.valorSubasta || 0;
    
    const prov = a.province || 'Unknown';
    totalByProvince[prov] = (totalByProvince[prov] || 0) + 1;
    
    if (appraisal >= 100000) {
      remainingValue[prov] = (remainingValue[prov] || 0) + 1;
    }
  }
  
  const lostValue = Object.keys(totalByProvince).filter(p => !remainingValue[p]);
  
  console.log(`Lost provinces if only value < 100k excluded: ${lostValue.length}`);
  for (const p of lostValue) {
    console.log(`- ${p}: ${totalByProvince[p]} auctions`);
  }
}

analyzeAuctions();
