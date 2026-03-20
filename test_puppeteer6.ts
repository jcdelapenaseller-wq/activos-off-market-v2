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

    await page.type('input[name="dato[18][0]"]', '01/01/2026');
    await page.type('input[name="dato[18][1]"]', '20/03/2026');
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.click('input[type="submit"][value="Buscar"]')
    ]);

    const text = await page.evaluate(() => document.body.innerText || '');
    console.log('Texto de respuesta:', text.trim().substring(0, 500));
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await browser.close();
  }
}

run();