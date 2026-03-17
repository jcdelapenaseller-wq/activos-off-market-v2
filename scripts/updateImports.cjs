const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../src/components');
const files = fs.readdirSync(componentsDir);

files.forEach(file => {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(componentsDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    if (content.includes("from '../routes'")) {
      content = content.replace("from '../routes'", "from '../constants/routes'");
      fs.writeFileSync(filePath, content);
      console.log(`Updated ${file}`);
    }
  }
});
