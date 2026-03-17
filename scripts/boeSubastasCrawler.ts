import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Crawler para obtener subastas activas del portal del BOE usando Puppeteer.
 * Se enfoca en la sección de Inmuebles para obtener un mayor volumen de datos.
 */
async function runCrawler() {
  const url = 'https://subastas.boe.es/index.php?ver=1'; // Todos los inmuebles
  console.log(`Iniciando crawler en: ${url}`);

  const browser = await puppeteer.launch({
    headless: true,
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
    
    // Filtrar solo para Madrid para la prueba
    const provincesToTest = provinces.filter(p => p.value === '28');
    console.log(`Ejecutando prueba solo para: ${provincesToTest[0].text}`);
    
    const allAuctions = [];
    const processedSlugs = new Set();
    const maxResults = 30;

    for (const province of provincesToTest) {
      if (allAuctions.length >= maxResults) break;

      console.log(`Seleccionando provincia: ${province.text} (valor: ${province.value})`);
      
      // Reset paginación por provincia
      const visitedPages = new Set();
      let currentPage = 1;
      const maxPagesPerProvince = 100;
      let hasNextPage = true;

      try {
        await page.select('select', province.value);
        
        const submitButton = await page.$('input[type="submit"]');
        if (submitButton) {
          await Promise.all([
            page.click('input[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
          ]);
        }

        while (hasNextPage && currentPage <= maxPagesPerProvince) {
          const currentUrl = page.url();
          if (visitedPages.has(currentUrl)) break;
          visitedPages.add(currentUrl);

          const provinceResults = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('ul.resultado-busqueda li, .resultado-busqueda li'));
            return items.map(li => {
              let titulo = '';
              const spans = Array.from(li.querySelectorAll('span'));
              const descSpan = spans.find(s => (s as HTMLElement).innerText.includes('Descripción:'));
              if (descSpan) {
                let next = descSpan.nextSibling;
                while (next && next.nodeType !== 3) next = next.nextSibling;
                if (next) titulo = next.textContent!.trim();
              }
              if (!titulo) {
                const h3 = li.querySelector('h3, h4, strong');
                titulo = h3 ? (h3 as HTMLElement).innerText.trim() : ((li.querySelector('a') as HTMLElement | null)?.innerText.trim() || 'Subasta');
              }
              titulo = titulo.replace(/^Más\.\.\.\s*/, '');
              const anchor = li.querySelector('a[href*="subastas_det.php"]') || 
                             li.querySelector('a[href*="idSub="]');
              let urlDetalle = '';
              if (anchor) {
                const href = anchor.getAttribute('href')!;
                urlDetalle = href.startsWith('http') ? href : 'https://subastas.boe.es/' + href.replace(/^\.\//, '');
              }
              return { titulo, urlDetalle };
            }).filter(r => r.urlDetalle);
          });

          console.log(` - Página ${currentPage}: Encontradas ${provinceResults.length} subastas.`);

          for (const res of provinceResults) {
            if (allAuctions.length < maxResults && !processedSlugs.has(res.urlDetalle)) {
              processedSlugs.add(res.urlDetalle);
              allAuctions.push({ ...res, provinceText: province.text });
            }
          }

          if (allAuctions.length >= maxResults) break;

          const nextPageLink = await page.$('a[href*="accion=Mas"]');
          if (nextPageLink) {
            const delay = Math.floor(Math.random() * 1000) + 1000;
            await new Promise(resolve => setTimeout(resolve, delay));

            await Promise.all([
              nextPageLink.click(),
              page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
              page.waitForSelector('ul.resultado-busqueda li')
            ]);
            currentPage++;
          } else {
            hasNextPage = false;
          }
        }
      } catch (e) {
        console.error(`Error al procesar provincia ${province.text}: ${(e as any).message}`);
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
      console.error('No se pudo leer auctions.ts, se procesarán todas como nuevas:', (err as any).message);
    }

    const finalResults = [];

    // Función para normalizar números
    const parseNumber = (str: string) => {
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
        
        const generalData = await detailPage.evaluate(`
          (function() {
            window.__name = function(target, value) { return target; };
            function getVal(label) {
              var elements = Array.from(document.querySelectorAll('td, th, dt, dd, span, label, p, div.dato'))
                .filter(function(el) { return !el.closest('#pestanas') && !el.closest('.pestanas') && !el.closest('ul.tab') && !el.closest('#cabecera') && !el.closest('#pie'); });
              
              for (var i = 0; i < elements.length; i++) {
                var el = elements[i];
                var text = el.innerText.trim();
                if (text.toLowerCase().startsWith(label.toLowerCase())) {
                  if (text.includes('\\t')) {
                    var parts = text.split('\\t');
                    if (parts.length > 1 && parts[0].toLowerCase().includes(label.toLowerCase())) {
                      return parts.slice(1).join('\\t').trim();
                    }
                  }
                  var next = el.nextElementSibling;
                  if (next && next.innerText.trim()) return next.innerText.trim();
                }
              }
              return null;
            }

            var valorSubasta = getVal('Valor subasta');
            var valorTasacion = getVal('Tasación');
            var cantidadReclamada = getVal('Cantidad reclamada');
            var deposito = getVal('Importe del depósito');
            var fechaFin = getVal('Fecha de conclusión') || getVal('Fecha de fin');
            var estadoSubasta = getVal('Estado') || 'Celebrándose';

            return { valorSubasta: valorSubasta, valorTasacion: valorTasacion, cantidadReclamada: cantidadReclamada, deposito: deposito, fechaFin: fechaFin, estadoSubasta: estadoSubasta };
          })()
        `) as any;

        // 2. Obtener autoridad gestora (ver=2)
        const authUrl = generalUrl.replace('&ver=1', '&ver=2');
        await detailPage.goto(authUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        
        const autoridad = await detailPage.evaluate(`
          (function() {
            window.__name = function(target, value) { return target; };
            function getVal(label) {
              var elements = Array.from(document.querySelectorAll('td, th, dt, dd, span, label, p, div.dato'))
                .filter(function(el) { return !el.closest('#pestanas') && !el.closest('.pestanas') && !el.closest('ul.tab') && !el.closest('#cabecera') && !el.closest('#pie'); });
              for (var i = 0; i < elements.length; i++) {
                var el = elements[i];
                var text = el.innerText.trim();
                if (text.toLowerCase().startsWith(label.toLowerCase())) {
                  if (text.includes('\\t')) {
                    var parts = text.split('\\t');
                    if (parts.length > 1) return parts.slice(1).join('\\t').trim();
                  }
                  var next = el.nextElementSibling;
                  if (next && next.innerText.trim()) return next.innerText.trim();
                }
              }
              return null;
            }
            return getVal('Descripción') || getVal('Nombre') || getVal('Autoridad gestora') || 'N/A';
          })()
        `) as any;

        // 3. Obtener Bienes (ver=3)
        const bienesUrl = generalUrl.replace('&ver=1', '&ver=3');
        await detailPage.goto(bienesUrl, { waitUntil: 'networkidle2', timeout: 30000 });

        const bienesData = await detailPage.evaluate(`
          (function() {
            window.__name = function(target, value) { return target; };
            function getVal(label) {
              var elements = Array.from(document.querySelectorAll('td, th, dt, dd, span, label, p, div.dato'))
                .filter(function(el) { return !el.closest('#pestanas') && !el.closest('.pestanas') && !el.closest('ul.tab') && !el.closest('#cabecera') && !el.closest('#pie'); });
              for (var i = 0; i < elements.length; i++) {
                var el = elements[i];
                var text = el.innerText.trim();
                if (text.toLowerCase().startsWith(label.toLowerCase())) {
                  if (text.includes('\\t')) {
                    var parts = text.split('\\t');
                    if (parts.length > 1) return parts.slice(1).join('\\t').trim();
                  }
                  var next = el.nextElementSibling;
                  if (next && next.innerText.trim()) return next.innerText.trim();
                }
              }
              return null;
            }

            var tipoBien = getVal('Tipo de bien') || getVal('Descripción');
            var direccion = getVal('Dirección') || getVal('Situación');
            var superficie = getVal('Superficie');
            var cargas = getVal('Cargas');

            return { tipoBien: tipoBien, direccion: direccion, superficie: superficie, cargas: cargas };
          })()
        `) as any;

        const urlObj = new URL(item.urlDetalle);
        const idSub = urlObj.searchParams.get('idSub') || 'N/A';

        // Normalización
        const subastaNum = parseNumber(generalData.valorSubasta as string);
        const tasacionNum = parseNumber(generalData.valorTasacion as string);
        const deudaNum = parseNumber(generalData.cantidadReclamada as string);
        const depositoNum = parseNumber(generalData.deposito as string);
        const superficieNum = parseNumber(bienesData.superficie as string);

        // Funciones de limpieza y normalización
        const toTitleCase = (str: string): string => {
          return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        };

        const cleanPropertyType = (raw: string): string => {
          const text = raw.toLowerCase();
          if (text.includes('piso') || text.includes('vivienda')) return 'Piso';
          if (text.includes('local')) return 'Local';
          if (text.includes('garaje') || text.includes('plaza')) return 'Garaje';
          if (text.includes('nave')) return 'Nave';
          return 'Inmueble';
        };

        const cleanAddress = (raw: string): string => {
          let cleaned = raw
            .replace(/\bCL\b/gi, 'Calle')
            .replace(/\bAV\b|\bAVDA\b/gi, 'Avenida')
            .replace(/\bPZ\b/gi, 'Plaza')
            .replace(/\bnúmero\b|\bnº\b|\bnum\b/gi, '')
            .replace(/\s+/g, ' ')
            .trim();

          const match = cleaned.match(/(Calle|Avenida|Plaza|Paseo|Camino|Ctra\.|Av\.|Pl\.|Ps\.)\s+([a-zA-ZáéíóúÁÉÍÓÚñÑ\s\.]+?)\s+(\d+)/i);
          if (match) {
            return `${toTitleCase(match[1])} ${toTitleCase(match[2].trim())} ${match[3]}`;
          }
          
          const firstPart = raw.split(',')[0].split('(')[0].trim();
          return toTitleCase(firstPart.length > 50 ? firstPart.substring(0, 50) : firstPart);
        };

        const extractCityAndZone = (address: string, description: string, province: string) => {
          const text = (address + ' ' + description + ' ' + province).toLowerCase();
          
          // Ciudades principales
          const cities = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao', 'Alicante', 'Córdoba', 'Valladolid', 'Vigo', 'Gijón', 'Hospitalet', 'Vitoria', 'A Coruña', 'Elche', 'Granada', 'Terrassa', 'Badalona', 'Oviedo', 'Sabadell', 'Cartagena', 'Jerez', 'Móstoles', 'Santa Cruz', 'Pamplona', 'Almería', 'Alcalá de Henares', 'Fuenlabrada', 'Leganés', 'San Sebastián', 'Getafe', 'Burgos', 'Albacete', 'Castellón', 'Santander', 'Alcorcón', 'Logroño', 'Badajoz', 'Marbella', 'Salamanca', 'Huelva', 'Lleida', 'Tarragona', 'Dos Hermanas', 'Parla', 'Torrejón de Ardoz'];
          
          let city = province; // Default a la provincia
          for (const c of cities) {
            if (text.includes(c.toLowerCase())) {
              city = c;
              break;
            }
          }

          // Zonas (ejemplo Madrid)
          const zones = ['Chamberí', 'Salamanca', 'Retiro', 'Centro', 'Arganzuela', 'Tetuán', 'Chamartín', 'Fuencarral', 'Moncloa', 'Latina', 'Carabanchel', 'Usera', 'Puente de Vallecas', 'Moratalaz', 'Ciudad Lineal', 'Hortaleza', 'Villaverde', 'Villa de Vallecas', 'Vicálvaro', 'San Blas', 'Barajas'];
          let zone = '';
          for (const z of zones) {
            if (text.includes(z.toLowerCase())) {
              zone = z;
              break;
            }
          }

          return { city, zone };
        };

        const { city, zone } = extractCityAndZone(bienesData.direccion || '', item.titulo, item.provinceText.split(' ')[0]);

        // Filtro de calidad
        const estadosIgnorar = ["Suspendida", "Cancelada", "Finalizada"];
        const esEstadoInvalido = estadosIgnorar.some(e => (generalData.estadoSubasta as string).includes(e));

        if (subastaNum !== null && subastaNum >= 5000 && !esEstadoInvalido) {
          finalResults.push({
            idSub,
            titulo: item.titulo,
            valorSubasta: subastaNum,
            valorTasacion: tasacionNum,
            claimedDebt: deudaNum,
            deposito: depositoNum,
            autoridad,
            estadoSubasta: generalData.estadoSubasta,
            fechaFin: generalData.fechaFin,
            urlDetalle: item.urlDetalle,
            tipoBien: cleanPropertyType(bienesData.tipoBien || ''),
            direccion: cleanAddress(bienesData.direccion || ''),
            city,
            zone,
            superficie: superficieNum,
            cargas: bienesData.cargas
          });
        } else {
          console.log(` - Subasta ${idSub} descartada por calidad (Valor: ${subastaNum}, Estado: ${generalData.estadoSubasta})`);
        }
      } catch (err) {
        console.error(`Error procesando subasta ${item.titulo}: ${(err as any).message}`);
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
          let isActive = false;
          const isoMatch = (s.fechaFin || '').match(/ISO:\s*([^)]+)/);
          if (isoMatch) {
            auctionDate = isoMatch[1].split('T')[0];
            const endDate = new Date(isoMatch[1]);
            isActive = new Date() < endDate;
          }

          // Combinar descripción y cargas
          let desc = s.titulo;
          if (s.cargas) desc += ` | Cargas: ${s.cargas}`;
          if (s.deposito) desc += ` | Depósito: ${s.deposito}€`;

          const entry = `  '${slug}': {
    propertyType: "${(s.tipoBien || 'Inmueble').replace(/"/g, '\\"')}",
    city: "${(s.city || '').replace(/"/g, '\\"')}",
    zone: "${(s.zone || '').replace(/"/g, '\\"')}",
    address: "${(s.direccion || 'No indicada').replace(/"/g, '\\"')}",
    appraisalValue: ${s.valorTasacion || s.valorSubasta},
    claimedDebt: ${s.claimedDebt || 'undefined'},
    valorSubasta: ${s.valorSubasta || 'undefined'},
    valorTasacion: ${s.valorTasacion || 'undefined'},
    deposito: ${s.deposito || 'undefined'},
    procedureType: "${s.autoridad.replace(/"/g, '\\"')}",
    surface: ${s.superficie || 'undefined'},
    description: "${desc.replace(/"/g, '\\"').replace(/\n/g, ' ')}",
    boeId: "${s.idSub}",
    boeUrl: "${s.urlDetalle}",
    publishedAt: "${new Date().toISOString()}",
    auctionDate: "${auctionDate}",
    status: "${(s.estadoSubasta || 'Celebrándose').replace(/"/g, '\\"')}",
    isActive: ${isActive}
  },`;
          console.log(`Ejemplo de subasta (${slug}):\n${entry}`);
          return entry;
        }).join('\n');

        const insertionPoint = auctionsContent.indexOf('export const AUCTIONS: Record<string, AuctionData> = {');
        if (insertionPoint !== -1) {
          const openBraceIndex = auctionsContent.indexOf('{', insertionPoint);
          const updatedContent = auctionsContent.slice(0, openBraceIndex + 1) + '\n' + newEntries + auctionsContent.slice(openBraceIndex + 1);
          fs.writeFileSync(auctionsFilePath, updatedContent);
          output.subastasInsertadas = nuevas.length;
        }
      } catch (err) {
        console.error('Error al actualizar auctions.ts:', (err as any).message);
      }
    }

    console.log('\n--- RESULTADOS DEL CRAWLER ---');
    console.log(JSON.stringify(output, null, 2));

  } catch (error) {
    console.error('Error crítico en el crawler:', (error as any).message);
  } finally {
    await browser.close();
    console.log('Crawler finalizado.');
  }
}

runCrawler();
