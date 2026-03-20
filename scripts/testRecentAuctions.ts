import puppeteer from 'puppeteer';

async function run() {
  const browser = await puppeteer.launch({ 
    headless: true, 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  
  try {
    const page = await browser.newPage();
    await page.goto('https://subastas.boe.es/subastas_ava.php', { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Set dates for the last 3 days (2026-03-17 to 2026-03-20)
    await page.evaluate(() => {
      const desdeInput = document.querySelector('input[name="dato[18][0]"]');
      const hastaInput = document.querySelector('input[name="dato[18][1]"]');
      if (desdeInput) desdeInput.value = '2026-03-17';
      if (hastaInput) hastaInput.value = '2026-03-20';
    });
    
    // Submit the form
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.evaluate(() => {
        const btn = document.querySelector('input[type="submit"][value="Buscar"]');
        if (btn) btn.click();
      })
    ]);

    // Extract total count
    const total = await page.evaluate(() => {
      const text = document.body.innerText;
      const match = text.match(/Resultados\s+\d+\s+a\s+\d+\s+de\s+([\d.]+)/i);
      if (match) return parseInt(match[1].replace(/\./g, ''), 10);
      
      const results = document.querySelectorAll('.resultado-busqueda');
      return results.length;
    });
    
    console.log('Nº subastas encontradas:', total);

    // Extract 3 examples
    const examples = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.resultado-busqueda')).slice(0, 3);
      return items.map(el => {
        const text = el.innerText || '';
        const idMatch = text.match(/SUB-[A-Z0-9-]+/);
        const statusMatch = text.match(/Estado:\s*([^\n]+)/i);
        return {
          id: idMatch ? idMatch[0] : 'N/A',
          estado: statusMatch ? statusMatch[1].trim() : 'N/A'
        };
      });
    });

    console.log('3 ejemplos:');
    examples.forEach(e => console.log('- ID: ' + e.id + ' | Estado: ' + e.estado));
    
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await browser.close();
  }
}

run();
