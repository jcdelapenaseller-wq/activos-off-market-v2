const puppeteer = require('puppeteer');

/**
 * Script de prueba para extraer 10 subastas del BOE con campos específicos.
 */
async function runTest() {
  const url = 'https://subastas.boe.es/index.php?ver=1'; // Inmuebles
  console.log(`Iniciando prueba en: ${url}`);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const provinces = await page.evaluate(() => {
      const select = document.querySelector('select');
      if (!select) return [];
      return Array.from(select.options)
        .map(opt => {
          const match = opt.text.match(/\((\d+)\)/);
          return { value: opt.value, text: opt.text, count: match ? parseInt(match[1]) : 0 };
        })
        .filter(o => o.value && o.count > 0)
        .sort((a, b) => b.count - a.count);
    });

    const allAuctions = [];
    const maxResults = 10;

    for (const province of provinces) {
      if (allAuctions.length >= maxResults) break;

      await page.select('select', province.value);
      await Promise.all([
        page.click('input[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
      ]);

      const provinceResults = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('ul.resultado-busqueda li, .resultado-busqueda li'));
        return items.map(li => {
          let titulo = '';
          const spans = Array.from(li.querySelectorAll('span'));
          const descSpan = spans.find(s => s.innerText.includes('Descripción:'));
          if (descSpan) {
            let next = descSpan.nextSibling;
            while (next && next.nodeType !== 3) next = next.nextSibling;
            if (next) titulo = next.textContent.trim();
          }
          if (!titulo) {
            const h3 = li.querySelector('h3, h4, strong');
            titulo = h3 ? h3.innerText.trim() : (li.querySelector('a')?.innerText.trim() || 'Subasta');
          }
          titulo = titulo.replace(/^Más\.\.\.\s*/, '');

          const anchor = li.querySelector('a[href*="subastas_det.php"]') || li.querySelector('a[href*="idSub="]');
          let urlDetalle = '';
          if (anchor) {
            const href = anchor.getAttribute('href');
            urlDetalle = href.startsWith('http') ? href : 'https://subastas.boe.es/' + href.replace(/^\.\//, '');
          }
          return { titulo, urlDetalle };
        }).filter(r => r.urlDetalle);
      });

      for (const res of provinceResults) {
        if (allAuctions.length < maxResults && !allAuctions.find(a => a.urlDetalle === res.urlDetalle)) {
          allAuctions.push(res);
        }
      }

      if (allAuctions.length < maxResults) {
        await page.goto(url, { waitUntil: 'networkidle2' });
      }
    }

    const finalResults = [];
    for (const item of allAuctions) {
      const detailPage = await browser.newPage();
      try {
        const generalUrl = item.urlDetalle.includes('&ver=') ? item.urlDetalle.replace(/&ver=\d+/, '&ver=1') : item.urlDetalle + '&ver=1';
        await detailPage.goto(generalUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        
        const generalData = await detailPage.evaluate(() => {
          const getVal = (label) => {
            const elements = Array.from(document.querySelectorAll('td, th, dt, dd, span, label, p, div.dato'))
              .filter(el => !el.closest('#pestanas') && !el.closest('.pestanas') && !el.closest('ul.tab') && !el.closest('#cabecera') && !el.closest('#pie'));
            for (let el of elements) {
              const text = el.innerText.trim();
              if (text.toLowerCase().startsWith(label.toLowerCase())) {
                if (text.includes('\t')) {
                  const parts = text.split('\t');
                  if (parts.length > 1) return parts.slice(1).join('\t').trim();
                }
                let next = el.nextElementSibling;
                if (next && next.innerText.trim()) return next.innerText.trim();
              }
            }
            return null;
          };
          return {
            valorSubasta: getVal('Valor subasta') || 'N/A',
            fechaFin: getVal('Fecha de conclusión') || getVal('Fecha de fin') || 'N/A',
            estadoSubasta: getVal('Estado') || 'Celebrándose'
          };
        });

        const authUrl = generalUrl.replace('&ver=1', '&ver=2');
        await detailPage.goto(authUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        const autoridad = await detailPage.evaluate(() => {
          const getVal = (label) => {
            const elements = Array.from(document.querySelectorAll('td, th, dt, dd, span, label, p, div.dato'))
              .filter(el => !el.closest('#pestanas') && !el.closest('.pestanas') && !el.closest('ul.tab') && !el.closest('#cabecera') && !el.closest('#pie'));
            for (let el of elements) {
              const text = el.innerText.trim();
              if (text.toLowerCase().startsWith(label.toLowerCase())) {
                if (text.includes('\t')) {
                  const parts = text.split('\t');
                  if (parts.length > 1) return parts.slice(1).join('\t').trim();
                }
                let next = el.nextElementSibling;
                if (next && next.innerText.trim()) return next.innerText.trim();
              }
            }
            return null;
          };
          return getVal('Descripción') || getVal('Nombre') || 'N/A';
        });

        finalResults.push({
          titulo: item.titulo,
          valorSubasta: generalData.valorSubasta,
          autoridad: autoridad,
          estadoSubasta: generalData.estadoSubasta,
          fechaFin: generalData.fechaFin,
          urlDetalle: item.urlDetalle
        });
      } catch (e) {
        console.error(`Error en detalle: ${e.message}`);
      } finally {
        await detailPage.close();
      }
    }

    console.log(JSON.stringify(finalResults, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

runTest();
