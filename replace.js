const fs = require('fs');
let content = fs.readFileSync('./scripts/boeSubastasCrawler.ts', 'utf8');
const oldStr = 'isActive: ${isActive}\n  },`;';
const newStr = 'isActive: ${isActive},\n    isNew: true\n  },`;';
content = content.replace(oldStr, newStr);
fs.writeFileSync('./scripts/boeSubastasCrawler.ts', content);
console.log('Replaced:', content.includes('isNew: true'));