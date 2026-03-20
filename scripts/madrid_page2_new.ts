import { normalizeStatus } from '../src/utils/auctionHelpers';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runCrawler() {
  const url = 'https://subastas.boe.es/index.php?ver=1'; 
  console.log(`Iniciando crawler en: ${url}`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log('Navegando a la página principal...');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Selección de Madrid (28)
    const province = { value: '28', text: 'MADRID' };
    
    const allAuctions: any[] = [];
    const processedSlugs = new Set();

    console.log(`Seleccionando provincia: ${province.text} (valor: ${province.value})`);
    
    await page.select('select', province.value);
    
    const submitButton = await page.$('input[type="submit"]');
    if (submitButton) {
      await Promise.all([
        page.click('input[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 })
      ]);
    }

    let currentPage = 1;
    const targetPage = 2;
    let hasNextPage = true;

    while (hasNextPage && currentPage <= targetPage) {
      if (currentPage === targetPage) {
        console.log(`Procesando página ${currentPage} de Madrid...`);
        const provinceResults = await page.evaluate(() => {
          const items = Array.from(document.querySelectorAll('ul.resultado-busqueda li, .resultado-busqueda li'));
          return items.map(li => {
            const anchor = li.querySelector('a[href*="subastas_det.php"]') || 
                           li.querySelector('a[href*="idSub="]');
            let urlDetalle = '';
            if (anchor) {
              const href = anchor.getAttribute('href')!;
              urlDetalle = href.startsWith('http') ? href : 'https://subastas.boe.es/' + href.replace(/^\.\//, '');
            }
            return { urlDetalle };
          }).filter(r => r.urlDetalle);
        });

        for (const res of provinceResults) {
          const urlObj = new URL(res.urlDetalle);
          const idSub = urlObj.searchParams.get('idSub') || 'N/A';
          allAuctions.push({ idSub, urlDetalle: res.urlDetalle });
        }
        break; // Ya tenemos la página 2
      }

      // Navegar a la siguiente página
      const nextPageUrl = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="accion=Mas"]'));
        const next = links.find(a => a.textContent?.toLowerCase().includes('siguiente'));
        return next ? (next as HTMLAnchorElement).href : null;
      });

      if (nextPageUrl) {
        console.log(`Navegando a la página ${currentPage + 1}...`);
        await Promise.all([
          page.goto(nextPageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }),
          page.waitForSelector('li.resultado-busqueda', { timeout: 10000 })
        ]);
        currentPage++;
      } else {
        console.log('No hay más páginas.');
        hasNextPage = false;
      }
    }

    console.log(`Encontradas ${allAuctions.length} subastas en la página 2 de Madrid.`);

    // Cargar subastas existentes para comparar
    const auctionsFilePath = path.join(__dirname, '../src/data/auctions.ts');
    let existingIds = new Set();
    try {
      const auctionsContent = fs.readFileSync(auctionsFilePath, 'utf-8');
      const idRegex = /boeId:\s*["']([^"']+)["']/g;
      let match;
      while ((match = idRegex.exec(auctionsContent)) !== null) {
        existingIds.add(match[1]);
      }
      console.log(`Cargadas ${existingIds.size} subastas existentes desde auctions.ts`);
    } catch (err) {
      console.error('No se pudo leer auctions.ts');
    }

    const nuevas = allAuctions.filter(s => !existingIds.has(s.idSub));
    
    console.log('\n--- RESULTADOS PÁGINA 2 MADRID ---');
    console.log(`Total subastas en página 2: ${allAuctions.length}`);
    console.log(`Subastas nuevas (isNew): ${nuevas.length}`);
    
    if (nuevas.length > 0) {
      console.log('IDs de subastas nuevas:');
      nuevas.forEach(n => console.log(` - ${n.idSub}`));
    }

  } catch (error) {
    console.error('Error:', (error as any).message);
  } finally {
    await browser.close();
  }
}

runCrawler();
