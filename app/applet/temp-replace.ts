import fs from 'fs';

let content = fs.readFileSync('scripts/boeSubastasCrawler.ts', 'utf8');

content = content.replace('const maxPagesPerProvince = 1;', 'const maxPagesPerProvince = 2;');
content = content.replace('allAuctions.push({ ...res, provinceText: province.text });', 'if (currentPage === 2) { allAuctions.push({ ...res, provinceText: province.text }); }');
content = content.replace('fs.writeFileSync(auctionsFilePath, auctionsContent);', '// fs.writeFileSync(auctionsFilePath, auctionsContent);');

const oldNextPageLogic = `          const nextPageLink = await page.$('a[href*="accion=Mas"]');
          if (nextPageLink) {
            const delay = Math.floor(Math.random() * 1000) + 1000; // Delay 1-2s
            await new Promise(resolve => setTimeout(resolve, delay));

            try {
              await Promise.all([
                nextPageLink.click(),
                page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }),
                page.waitForSelector('ul.resultado-busqueda li', { timeout: 10000 })
              ]);
              currentPage++;
            } catch (navError) {
              console.warn(\` - Error al navegar a la siguiente página en \${province.text}: \${(navError as any).message}\`);
              hasNextPage = false; // Parar si falla la navegación
            }
          } else {
            hasNextPage = false;
          }`;

const newNextPageLogic = `          const nextPageUrl = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a[href*="accion=Mas"]'));
            const next = links.find(a => a.textContent?.includes('siguiente'));
            return next ? (next as HTMLAnchorElement).href : null;
          });

          if (nextPageUrl) {
            const delay = Math.floor(Math.random() * 1000) + 1000; // Delay 1-2s
            await new Promise(resolve => setTimeout(resolve, delay));

            try {
              await Promise.all([
                page.goto(nextPageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }),
                page.waitForSelector('li.resultado-busqueda', { timeout: 10000 })
              ]);
              currentPage++;
            } catch (navError) {
              console.warn(\` - Error al navegar a la siguiente página en \${province.text}: \${(navError as any).message}\`);
              hasNextPage = false;
            }
          } else {
            hasNextPage = false;
          }`;

content = content.replace(oldNextPageLogic, newNextPageLogic);

content = content.replace(/images: \[\]\n  \}/g, 'images: [],\n    isNew: true\n  }');

content = content.replace('export { runCrawler };', 'runCrawler();');

fs.writeFileSync('scripts/boeSubastasCrawlerTest.ts', content);
console.log('Done');
