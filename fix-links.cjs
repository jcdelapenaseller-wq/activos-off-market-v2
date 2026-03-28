const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('./src/components', function(filePath) {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Process <Link> tags
    content = content.replace(/<Link([^>]+)>/g, (match, p1) => {
      let newP1 = p1
        .replace(/\s*target="_blank"\s*/g, ' ')
        .replace(/\s*rel="noopener noreferrer"\s*/g, ' ')
        .replace(/\s*rel="nofollow noopener noreferrer"\s*/g, ' ');
      return `<Link${newP1}>`;
    });
    
    // Also process <a> tags that point to internal routes (starting with /)
    content = content.replace(/<a([^>]+)>/g, (match, p1) => {
      if (p1.includes('href="/') && !p1.includes('href="//')) {
        let newP1 = p1
          .replace(/\s*target="_blank"\s*/g, ' ')
          .replace(/\s*rel="noopener noreferrer"\s*/g, ' ')
          .replace(/\s*rel="nofollow noopener noreferrer"\s*/g, ' ');
        return `<a${newP1}>`;
      }
      return match;
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed:', filePath);
    }
  }
});

