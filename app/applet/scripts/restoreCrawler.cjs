const fs = require('fs');
let content = fs.readFileSync('./scripts/boeSubastasCrawler.ts', 'utf8');
content = content.replace("const provincesToTest = provinces.filter(p => p.value === '28' || p.value === '08');", "// const provincesToTest = provinces.filter(p => p.value === '28' || p.value === '08');");
content = content.replace("console.log(`Ejecutando prueba para ${provincesToTest.length} provincias: ${provincesToTest.map(p => p.text).join(', ')}`);", "// console.log(`Ejecutando prueba para ${provincesToTest.length} provincias: ${provincesToTest.map(p => p.text).join(', ')}`);");
content = content.replace("for (const province of provincesToTest) {", "for (const province of provinces) {");
fs.writeFileSync('./scripts/boeSubastasCrawler.ts', content);
console.log("Restored crawler to run on all provinces");
