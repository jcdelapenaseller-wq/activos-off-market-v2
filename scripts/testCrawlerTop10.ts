import puppeteer from 'puppeteer';
import { AUCTIONS } from '../src/data/auctions';

async function testCrawlerTop10() {
  console.log('Iniciando test ligero del crawler (Top 10 provincias, 1 página/provincia)...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await page.goto('https://subastas.boe.es/index.php?ver=1', { waitUntil: 'networkidle2', timeout: 60000 });

    // Obtener top 10 provincias
    const provinces = await page.evaluate(() => {
      const select = document.querySelector('select');
      if (!select) return [];
      const options = Array.from(select.options);
      return options.map(opt => {
        const match = opt.text.match(/\((\d+)\)/);
        return { value: opt.value, text: opt.text.replace(/\s*\(\d+\)$/, ''), count: match ? parseInt(match[1]) : 0 };
      }).filter(o => o.value && o.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    });

    console.log(`Top 10 provincias a procesar: ${provinces.map(p => p.text).join(', ')}`);

    const detectedAuctions: { id: string, title: string, province: string, city: string }[] = [];
    const detectedCities = new Set<string>();

    for (const province of provinces) {
      console.log(`\nProcesando: ${province.text}...`);
      
      try {
        await page.goto('https://subastas.boe.es/index.php?ver=1', { waitUntil: 'networkidle2', timeout: 60000 });
        await page.select('select', province.value);
        
        await Promise.all([
          page.click('input[type="submit"]'),
          page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
        ]);

        const results = await page.evaluate(() => {
          const items = Array.from(document.querySelectorAll('ul.resultado-busqueda li, .resultado-busqueda li'));
          return items.map(li => {
            let titulo = '';
            const h3 = li.querySelector('h3, h4, strong');
            titulo = h3 ? (h3 as HTMLElement).innerText.trim() : ((li.querySelector('a') as HTMLElement | null)?.innerText.trim() || '');
            
            const anchor = li.querySelector('a[href*="subastas_det.php"]') || li.querySelector('a[href*="idSub="]');
            if (!anchor) return null;
            const href = anchor.getAttribute('href') || '';
            const match = href.match(/idSub=([^&]+)/);
            return { id: match ? match[1] : null, titulo };
          }).filter(r => r && r.id) as { id: string, titulo: string }[];
        });

        console.log(` -> Encontradas ${results.length} subastas en la página 1.`);

        for (const res of results) {
          // Intento ligero de extraer ciudad del título (ej: "Subasta de Vivienda en Madrid")
          let city = province.text;
          const cityMatch = res.titulo.match(/\ben\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñA-ZÁÉÍÓÚÑ\s]+?)(?=[,.-]|$)/i);
          if (cityMatch && cityMatch[1].trim().length > 2) {
            city = cityMatch[1].trim();
          }
          
          detectedCities.add(city);
          detectedAuctions.push({
            id: res.id,
            title: res.titulo,
            province: province.text,
            city: city
          });
        }

      } catch (err) {
        console.error(` -> Error procesando ${province.text}:`, (err as any).message);
      }
    }

    const existingIds = new Set(Object.values(AUCTIONS).map(a => a.boeId));
    const newIds = detectedAuctions.filter(a => !existingIds.has(a.id));

    console.log(`\n=========================================`);
    console.log(`RESULTADOS DEL TEST (TOP 10 PROVINCIAS)`);
    console.log(`=========================================`);
    console.log(`- Provincias cubiertas: ${provinces.length}`);
    console.log(`- Total subastas encontradas: ${detectedAuctions.length}`);
    console.log(`- Nuevas detectadas: ${newIds.length}`);
    console.log(`- Insertadas en auctions.ts: 0 (Modo Test / Solo Lectura)`);
    console.log(`\n- Ciudades detectadas (${detectedCities.size}):`);
    
    // Mostrar una muestra de ciudades (máximo 30 para no saturar)
    const citiesArray = Array.from(detectedCities).sort();
    console.log(citiesArray.slice(0, 30).join(', ') + (citiesArray.length > 30 ? '...' : ''));

  } catch (error) {
    console.error('Error general:', error);
  } finally {
    await browser.close();
  }
}

testCrawlerTop10();
