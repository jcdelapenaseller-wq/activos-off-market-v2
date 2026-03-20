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

    const inputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input[name^="dato[18]"]')).map(el => el.outerHTML);
    });
    console.log('Inputs:', inputs);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await browser.close();
  }
}

run();