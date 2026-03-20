const { spawnSync } = require('child_process');
const path = require('path');

/**
 * Wrapper for boeSubastasCrawler.ts
 * This file is executed by the workflow and delegates to the TypeScript crawler.
 */
function runCrawler() {
  const crawlerPath = path.join(__dirname, 'boeSubastasCrawler.ts');
  
  console.log(`🚀 Starting BOE Crawler from wrapper: ${crawlerPath}`);
  
  const result = spawnSync('npx', ['tsx', crawlerPath], { 
    stdio: 'inherit',
    shell: true 
  });

  if (result.error) {
    console.error('❌ Error executing crawler:', result.error);
    process.exit(1);
  }

  process.exit(result.status || 0);
}

runCrawler();
