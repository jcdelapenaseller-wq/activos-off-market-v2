import puppeteer from 'puppeteer';

async function run() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await page.goto('https://subastas.boe.es/subastas_ava.php', { waitUntil: 'domcontentloaded', timeout: 60000 });

    await page.evaluate(() => {
      document.querySelector('input[name="dato[18][0]"]').value = '2026-03-13';
      document.querySelector('input[name="dato[18][1]"]').value = '2026-03-20';
    });
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.evaluate(() => {
        const btn = document.querySelector('input[type="submit"][value="Buscar"]');
        btn.click();
      })
    ]);

    const total = await page.evaluate(() => {
      const text = document.querySelector('.caja_contenidos')?.textContent || '';
      const match = text.match(/de\ s+([\\d.]+)\s*$/m);
      if (match) return match[1].replace(/\\./g, '');
      return document.querySelectorAll('.resultado-busqueda li.resultado').length.toString();
    });
    
    console.log('Total encontradas:', total);

    const examples = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.resultado-busqueda li.resultado')).slice(0, 3);
      return items.map(el => {
        const text = el.textContent || '';
        const idMatch = text.match(/SUB-[A-Z0-9-]+/);
        const statusMatch = text.match(/Estado:\ s*([^\n]+)/i);
        return {
          id: idMatch ? idMatch[0] : 'N/A',
          estado: statusMatch ? statusMatch[1].trim() : 'N/A'
        };
      });
    });

    console.log('Ejemplos:');
    examples.forEach(e => console.log('- ID: ' + e.id + ' | Estado: ' + e.estado));

  } catch (e) {
    console.error('Error:', e);
  } finally {
    await browser.close();
  }
}

run();