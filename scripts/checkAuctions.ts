import { AUCTIONS } from '../src/data/auctions';
import fs from 'fs';
import path from 'path';

console.log('1. Total subastas exactas en src/data/auctions.ts:', Object.keys(AUCTIONS).length);

function findFiles(dir: string, filename: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.git' || file === 'dist') continue;
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findFiles(filePath, filename, fileList);
    } else if (file === filename) {
      fileList.push(filePath);
    }
  }
  return fileList;
}
console.log('3. Archivos auctions.ts encontrados en el repo:', findFiles('.', 'auctions.ts'));
