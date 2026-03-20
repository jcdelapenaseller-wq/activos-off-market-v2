import puppeteer from 'puppeteer';
import { AUCTIONS } from '../src/data/auctions';

async function testCrawler() {
  console.log('Iniciando test del crawler (Solo Madrid, 1 página)...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await page.goto('https://subastas.boe.es/index.php?ver=1', { waitUntil: 'networkidle2', timeout: 60000 });

    // Find Madrid option
    const madridValue = await page.evaluate(() => {
      const select = document.querySelector('select'); // The province select
      if (!select) return null;
      const options = Array.from(select.options);
      const madridOpt = options.find(opt => opt.text.includes('Madrid'));
      return madridOpt ? madridOpt.value : null;
    });

    if (!madridValue) {
      console.log('No se encontró la provincia Madrid en el selector.');
      return;
    }

    console.log(`Seleccionando Madrid (valor: ${madridValue})...`);
    await page.select('select', madridValue);
    
    await Promise.all([
      page.click('input[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
    ]);

    console.log('Extrayendo subastas de la página 1...');
    const detectedIds = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('ul.resultado-busqueda li, .resultado-busqueda li'));
      return items.map(li => {
        const anchor = li.querySelector('a[href*="subastas_det.php"]') || li.querySelector('a[href*="idSub="]');
        if (!anchor) return null;
        const href = anchor.getAttribute('href') || '';
        const match = href.match(/idSub=([^&]+)/);
        return match ? match[1] : null;
      }).filter(Boolean) as string[];
    });

    console.log(`\n--- RESULTADOS ---`);
    console.log(`IDs detectados en la página 1 (${detectedIds.length}):`);
    console.log(detectedIds.join(', '));

    const existingIds = new Set(Object.values(AUCTIONS).map(a => a.boeId));
    
    const newIds = detectedIds.filter(id => !existingIds.has(id));
    const oldIds = detectedIds.filter(id => existingIds.has(id));

    console.log(`\nComparación con auctions.ts:`);
    console.log(`- Ya existentes en la base de datos: ${oldIds.length}`);
    console.log(`- Realmente NUEVOS: ${newIds.length}`);
    
    if (newIds.length > 0) {
      console.log(`\nIDs Nuevos:`);
      console.log(newIds.join(', '));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

testCrawler();
