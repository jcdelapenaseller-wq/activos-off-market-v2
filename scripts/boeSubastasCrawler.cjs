const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Crawler para obtener subastas activas del portal del BOE usando Puppeteer.
 * Se enfoca en la sección de Inmuebles para obtener un mayor volumen de datos.
 */
async function runCrawler() {
  const url = 'https://subastas.boe.es/index.php?ver=1'; // Todos los inmuebles
  console.log(`Iniciando crawler en: ${url}`);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    console.log('Navegando a la página principal...');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Selección automática de provincias con resultados
    console.log('Buscando provincias con subastas activas...');
    const provinces = await page.evaluate(() => {
      const select = document.querySelector('select');
      if (!select) return [];
      const options = Array.from(select.options);
      
      return options.map(opt => {
        const match = opt.text.match(/\((\d+)\)/);
        return { value: opt.value, text: opt.text, count: match ? parseInt(match[1]) : 0 };
      }).filter(o => o.value && o.count > 0)
        .sort((a, b) => b.count - a.count);
    });

    console.log(`Provincias encontradas con resultados: ${provinces.length}`);
    
    const allAuctions = [];
    const maxResults = 10;

    for (const province of provinces) {
      if (allAuctions.length >= maxResults) break;

      console.log(`Seleccionando provincia: ${province.text} (valor: ${province.value})`);
      try {
        await page.select('select', province.value);
        
        const submitButton = await page.$('input[type="submit"]');
        if (submitButton) {
          await Promise.all([
            page.click('input[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
          ]);
        }

        const provinceResults = await page.evaluate(() => {
          const items = Array.from(document.querySelectorAll('ul.resultado-busqueda li, .resultado-busqueda li'));
          return items.map(li => {
            let titulo = '';
            
            // Intentar obtener la descripción si existe
            const spans = Array.from(li.querySelectorAll('span'));
            const descSpan = spans.find(s => s.innerText.includes('Descripción:'));
            if (descSpan) {
              // A veces la descripción está en el siguiente nodo de texto
              let next = descSpan.nextSibling;
              while (next && next.nodeType !== 3) next = next.nextSibling;
              if (next) titulo = next.textContent.trim();
            }

            if (!titulo) {
              const h3 = li.querySelector('h3, h4, strong');
              titulo = h3 ? h3.innerText.trim() : (li.querySelector('a')?.innerText.trim() || 'Subasta');
            }

            // Limpiar "Más... "
            titulo = titulo.replace(/^Más\.\.\.\s*/, '');

            const anchor = li.querySelector('a[href*="subastas_det.php"]') || 
                           li.querySelector('a[href*="idSub="]');
            let urlDetalle = '';
            if (anchor) {
              const href = anchor.getAttribute('href');
              urlDetalle = href.startsWith('http') ? href : 'https://subastas.boe.es/' + href.replace(/^\.\//, '');
            }
            return { titulo, urlDetalle };
          }).filter(r => r.urlDetalle);
        });

        console.log(` - Encontradas ${provinceResults.length} subastas en esta provincia.`);

        for (const res of provinceResults) {
          if (allAuctions.length < maxResults && !allAuctions.find(a => a.urlDetalle === res.urlDetalle)) {
            allAuctions.push(res);
          }
        }
      } catch (e) {
        console.error(`Error al procesar provincia ${province.text}: ${e.message}`);
      }

      // Volver a la página de búsqueda si necesitamos más
      if (allAuctions.length < maxResults) {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      }
    }

    console.log(`Se han recopilado ${allAuctions.length} subastas para procesar.`);

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
      console.error('No se pudo leer auctions.ts, se procesarán todas como nuevas:', err.message);
    }

    const finalResults = [];

    // Función para normalizar números
    const parseNumber = (str) => {
      if (!str || str === 'N/A' || str === 'null') return null;
      const cleaned = str.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? null : num;
    };

    for (const item of allAuctions) {
      console.log(`Extrayendo detalles de: ${item.titulo.substring(0, 40)}...`);
      
      const detailPage = await browser.newPage();
      await detailPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      try {
        // 1. Obtener información general (ver=1)
        const generalUrl = item.urlDetalle.includes('&ver=') ? item.urlDetalle.replace(/&ver=\d+/, '&ver=1') : item.urlDetalle + '&ver=1';
        await detailPage.goto(generalUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        
        const generalData = await detailPage.evaluate(() => {
          const getVal = (label) => {
            const elements = Array.from(document.querySelectorAll('td, th, dt, dd, span, label, p, div.dato'))
              .filter(el => !el.closest('#pestanas') && !el.closest('.pestanas') && !el.closest('ul.tab') && !el.closest('#cabecera') && !el.closest('#pie'));
            
            for (let i = 0; i < elements.length; i++) {
              const el = elements[i];
              const text = el.innerText.trim();
              if (text.toLowerCase().startsWith(label.toLowerCase())) {
                if (text.includes('\t')) {
                  const parts = text.split('\t');
                  if (parts.length > 1 && parts[0].toLowerCase().includes(label.toLowerCase())) {
                    return parts.slice(1).join('\t').trim();
                  }
                }
                let next = el.nextElementSibling;
                if (next && next.innerText.trim()) return next.innerText.trim();
              }
            }
            return null;
          };

          const valorSubasta = getVal('Valor subasta');
          const valorTasacion = getVal('Tasación');
          const deposito = getVal('Importe del depósito');
          const fechaFin = getVal('Fecha de conclusión') || getVal('Fecha de fin');
          const estadoSubasta = getVal('Estado') || 'Celebrándose';

          return { valorSubasta, valorTasacion, deposito, fechaFin, estadoSubasta };
        });

        // 2. Obtener autoridad gestora (ver=2)
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
          return getVal('Descripción') || getVal('Nombre') || getVal('Autoridad gestora') || 'N/A';
        });

        // 3. Obtener Bienes (ver=3)
        const bienesUrl = generalUrl.replace('&ver=1', '&ver=3');
        await detailPage.goto(bienesUrl, { waitUntil: 'networkidle2', timeout: 30000 });

        const bienesData = await detailPage.evaluate(() => {
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

          const tipoBien = getVal('Tipo de bien') || getVal('Descripción');
          const direccion = getVal('Dirección') || getVal('Situación');
          const superficie = getVal('Superficie');
          const cargas = getVal('Cargas');

          return { tipoBien, direccion, superficie, cargas };
        });

        const urlObj = new URL(item.urlDetalle);
        const idSub = urlObj.searchParams.get('idSub') || 'N/A';

        // Normalización
        const subastaNum = parseNumber(generalData.valorSubasta);
        const tasacionNum = parseNumber(generalData.valorTasacion);
        const depositoNum = parseNumber(generalData.deposito);
        const superficieNum = parseNumber(bienesData.superficie);

        // Filtro de calidad
        const estadosIgnorar = ["Suspendida", "Cancelada", "Finalizada"];
        const esEstadoInvalido = estadosIgnorar.some(e => generalData.estadoSubasta.includes(e));
        
        if (subastaNum !== null && subastaNum >= 5000 && !esEstadoInvalido) {
          finalResults.push({
            idSub,
            titulo: item.titulo,
            valorSubasta: subastaNum,
            valorTasacion: tasacionNum,
            deposito: depositoNum,
            autoridad,
            estadoSubasta: generalData.estadoSubasta,
            fechaFin: generalData.fechaFin,
            urlDetalle: item.urlDetalle,
            tipoBien: bienesData.tipoBien,
            direccion: bienesData.direccion,
            superficie: superficieNum,
            cargas: bienesData.cargas
          });
        } else {
          console.log(` - Subasta ${idSub} descartada por calidad (Valor: ${subastaNum}, Estado: ${generalData.estadoSubasta})`);
        }
      } catch (err) {
        console.error(`Error procesando subasta ${item.titulo}: ${err.message}`);
      } finally {
        await detailPage.close();
      }
    }

    const nuevas = finalResults.filter(s => !existingIds.has(s.idSub));
    
    const output = {
      totalEncontradas: allAuctions.length,
      totalValidas: finalResults.length,
      totalNuevas: nuevas.length,
      subastasInsertadas: 0
    };

    if (nuevas.length > 0) {
      try {
        let auctionsContent = fs.readFileSync(auctionsFilePath, 'utf-8');
        
        const newEntries = nuevas.map(s => {
          const slug = `subasta-${s.idSub.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
          
          let auctionDate = s.fechaFin;
          const isoMatch = s.fechaFin.match(/ISO:\s*([^)]+)/);
          if (isoMatch) {
            auctionDate = isoMatch[1].split('T')[0];
          }

          // Combinar descripción y cargas
          let desc = s.titulo;
          if (s.cargas) desc += ` | Cargas: ${s.cargas}`;
          if (s.deposito) desc += ` | Depósito: ${s.deposito}€`;

          return `  '${slug}': {
    propertyType: "${s.tipoBien || 'Inmueble'}",
    address: "${(s.direccion || 'No indicada').replace(/"/g, '\\"')}",
    appraisalValue: ${s.valorTasacion || s.valorSubasta},
    procedureType: "${s.autoridad.replace(/"/g, '\\"')}",
    surface: ${s.superficie || 'undefined'},
    description: "${desc.replace(/"/g, '\\"').replace(/\n/g, ' ')}",
    boeId: "${s.idSub}",
    boeUrl: "${s.urlDetalle}",
    publishedAt: "${new Date().toISOString()}",
    auctionDate: "${auctionDate}"
  },`;
        }).join('\n');

        const insertionPoint = auctionsContent.indexOf('export const AUCTIONS: Record<string, AuctionData> = {');
        if (insertionPoint !== -1) {
          const openBraceIndex = auctionsContent.indexOf('{', insertionPoint);
          const updatedContent = auctionsContent.slice(0, openBraceIndex + 1) + '\n' + newEntries + auctionsContent.slice(openBraceIndex + 1);
          fs.writeFileSync(auctionsFilePath, updatedContent);
          output.subastasInsertadas = nuevas.length;
        }
      } catch (err) {
        console.error('Error al actualizar auctions.ts:', err.message);
      }
    }

    console.log('\n--- RESULTADOS DEL CRAWLER ---');
    console.log(JSON.stringify(output, null, 2));

  } catch (error) {
    console.error('Error crítico en el crawler:', error.message);
  } finally {
    await browser.close();
    console.log('Crawler finalizado.');
  }
}

runCrawler();
