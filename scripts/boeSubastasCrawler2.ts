import { normalizeStatus } from '../src/utils/auctionHelpers';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const normalizeProvince = (raw: string): string => {
  if (!raw) return raw;

  let cleaned = raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  cleaned = cleaned
    .replace(" provincia", "")
    .replace(" capital", "")
    .trim();

  const map: Record<string,string> = {
    "valencia": "Valencia",
    "valencia/valencia": "Valencia",
    "valencia/valencia ": "Valencia",
    "alicante": "Alicante",
    "alacant": "Alicante",
    "castellon": "Castellón",
    "castello": "Castellón",
    "a coruna": "A Coruña",
    "la coruna": "A Coruña",
    "vizcaya": "Vizcaya",
    "bizkaia": "Vizcaya"
  };

  return map[cleaned] || raw.trim();
};

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
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

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
    
    // Filtrar para Madrid (28)
    const provincesToTest = provinces.filter(p => p.value === '28');
    console.log(`Ejecutando prueba para ${provincesToTest.length} provincias: ${provincesToTest.map(p => p.text).join(', ')}`);
    
    const allAuctions: any[] = [];
    const processedSlugs = new Set();

    for (const province of provincesToTest) {
      console.log(`Seleccionando provincia: ${province.text} (valor: ${province.value})`);
      
      // Reset paginación por provincia
      const visitedPages = new Set();
      let currentPage = 1;
      const maxPagesPerProvince = 2; // Límite controlado: máximo 1 página por provincia
      let hasNextPage = true;

      try {
        await page.select('select', province.value);
        
        const submitButton = await page.$('input[type="submit"]');
        if (submitButton) {
          await Promise.all([
            page.click('input[type="submit"]'),
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 })
          ]);
        }

        while (hasNextPage && currentPage <= maxPagesPerProvince) {
          const currentUrl = page.url();
          if (visitedPages.has(currentUrl)) break;
          visitedPages.add(currentUrl);

          const provinceResults = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('li.resultado-busqueda'));
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
            if (!processedSlugs.has(res.urlDetalle)) {
              processedSlugs.add(res.urlDetalle);
              if(currentPage === 2) allAuctions.push({ ...res, provinceText: province.text });
            }
          }

          if (currentPage >= maxPagesPerProvince) {
            console.log(` - Límite de páginas alcanzado (${maxPagesPerProvince}) para ${province.text}.`);
            break;
          }

          const nextPageLink = await page.$('a[href*="accion=Mas"]');
          if (nextPageLink) {
            const delay = Math.floor(Math.random() * 1000) + 1000; // Delay 1-2s
            await new Promise(resolve => setTimeout(resolve, delay));

            try {
              await Promise.all([
                nextPageLink.click(),
                page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }),
                page.waitForSelector('li.resultado-busqueda', { timeout: 30000 })
              ]);
              currentPage++;
            } catch (navError) {
              console.warn(` - Error al navegar a la siguiente página en ${province.text}: ${(navError as any).message}`);
              hasNextPage = false; // Parar si falla la navegación
            }
          } else {
            hasNextPage = false;
          }
        }
      } catch (e) {
        console.error(`Error al procesar provincia ${province.text}: ${(e as any).message}`);
      }

      // Volver a la página de búsqueda para la siguiente provincia
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      } catch (navError) {
        console.warn(`Error al volver a la página principal: ${(navError as any).message}`);
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

    const finalResults: any[] = [];

    // Función para normalizar números
    const parseNumber = (str: string) => {
      if (!str || str === 'N/A' || str === 'null') return null;
      const cleaned = str.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? null : num;
    };

    const batchSize = 5;
    for (let i = 0; i < allAuctions.length; i += batchSize) {
      const batch = allAuctions.slice(i, i + batchSize);
      await Promise.all(batch.map(async (item) => {
        console.log(`Extrayendo detalles de: ${item.titulo.substring(0, 40)}...`);
        
        const detailPage = await browser.newPage();
      await detailPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      try {
        // 1. Obtener información general (ver=1)
        const generalUrl = item.urlDetalle.includes('&ver=') ? item.urlDetalle.replace(/&ver=\d+/, '&ver=1') : item.urlDetalle + '&ver=1';
        await detailPage.goto(generalUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
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
            var fechaInicio = getVal('Fecha de inicio');
            var fechaFin = getVal('Fecha de conclusión') || getVal('Fecha de fin');
            var estadoSubasta = getVal('Estado') || 'Celebrándose';

            return { valorSubasta: valorSubasta, valorTasacion: valorTasacion, cantidadReclamada: cantidadReclamada, deposito: deposito, fechaInicio: fechaInicio, fechaFin: fechaFin, estadoSubasta: estadoSubasta };
          })()
        `) as any;

        // 2. Obtener autoridad gestora (ver=2)
        const authUrl = generalUrl.replace('&ver=1', '&ver=2');
        await detailPage.goto(authUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
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
        await detailPage.goto(bienesUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

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
            var localidad = getVal('Localidad');
            var provincia = getVal('Provincia');
            var superficie = getVal('Superficie');
            var cargas = getVal('Cargas');

            return { tipoBien: tipoBien, direccion: direccion, localidad: localidad, provincia: provincia, superficie: superficie, cargas: cargas };
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

        const tipoBienLimpio = cleanPropertyType(bienesData.tipoBien || '');
        const esTipoExcluido = tipoBienLimpio === 'Local' || tipoBienLimpio === 'Garaje';

        // Cálculo de ratio para filtro (18% - 85%)
        const valorReferencia = tasacionNum || subastaNum;
        let esRatioBajo = false;
        let esRatioExcesivo = false;
        let ratio = 0;
        if (valorReferencia && deudaNum !== null && deudaNum !== undefined) {
          ratio = Math.round(((valorReferencia - deudaNum) / valorReferencia) * 100);
          // Descartamos si el ratio es explícitamente < 18% o > 85%
          if (ratio < 18) esRatioBajo = true;
          if (ratio > 85) esRatioExcesivo = true;
        }

        const esValorBajo = tasacionNum !== null && tasacionNum < 100000;
        const esDeudaCero = deudaNum === 0;

        if (subastaNum !== null && subastaNum >= 5000 && !esEstadoInvalido && !esTipoExcluido && !esRatioBajo && !esRatioExcesivo && !esValorBajo && !esDeudaCero) {
          let opportunityScore = 0;

          // base por descuento
          if (ratio >= 50) opportunityScore += 40;
          else if (ratio >= 35) opportunityScore += 30;
          else if (ratio >= 25) opportunityScore += 20;
          else if (ratio >= 18) opportunityScore += 10;

          // capital provincia
          const capitalCities = [
            "Madrid","Barcelona","Valencia","Sevilla",
            "Málaga","Bilbao","Zaragoza","Alicante",
            "Murcia","Palma","Las Palmas"
          ];

          if (capitalCities.includes(city)) {
            opportunityScore += 30;
          }

          // tipo inmueble
          if (
            tipoBienLimpio?.toLowerCase().includes("vivienda") ||
            tipoBienLimpio?.toLowerCase().includes("piso") ||
            tipoBienLimpio?.toLowerCase().includes("casa")
          ) {
            opportunityScore += 20;
          }

          // penalización garajes
          if (
            tipoBienLimpio?.toLowerCase().includes("garaje") ||
            tipoBienLimpio?.toLowerCase().includes("trastero")
          ) {
            opportunityScore -= 20;
          }

          // valor alto
          if (valorReferencia && valorReferencia > 150000) {
            opportunityScore += 10;
          }

          // clamp 0-100
          opportunityScore = Math.max(0, Math.min(100, opportunityScore));

          finalResults.push({
            idSub,
            titulo: item.titulo,
            valorSubasta: subastaNum,
            valorTasacion: tasacionNum,
            claimedDebt: deudaNum,
            deposito: depositoNum,
            autoridad,
            estadoSubasta: generalData.estadoSubasta,
            fechaInicio: generalData.fechaInicio,
            fechaFin: generalData.fechaFin,
            urlDetalle: item.urlDetalle,
            tipoBien: tipoBienLimpio,
            direccion: cleanAddress(bienesData.direccion || ''),
            municipality: bienesData.localidad || city,
            province: normalizeProvince(bienesData.provincia || item.provinceText),
            city: bienesData.localidad || city,
            zone,
            superficie: superficieNum,
            cargas: bienesData.cargas,
            opportunityScore,
          });
        } else {
          let motivo = "";
          if (esEstadoInvalido) motivo = `Estado: ${generalData.estadoSubasta}`;
          else if (esTipoExcluido) motivo = `Tipo excluido: ${tipoBienLimpio}`;
          else if (esRatioBajo) motivo = `Ratio insuficiente`;
          else if (esRatioExcesivo) motivo = `Ratio excesivo (>85%)`;
          else if (esValorBajo) motivo = `Valor tasación bajo (<100k)`;
          else if (esDeudaCero) motivo = `Deuda cero`;
          else motivo = `Valor insuficiente: ${subastaNum}`;
          
          console.log(` - Subasta ${idSub} descartada por calidad (${motivo})`);
        }
      } catch (err) {
        console.error(`Error procesando subasta ${item.titulo}: ${(err as any).message}`);
      } finally {
        await detailPage.close();
      }
      }));
    }

    const nuevas = finalResults.filter(s => !existingIds.has(s.idSub));
    
    const output = {
      totalEncontradas: allAuctions.length,
      totalValidas: finalResults.length,
      totalNuevas: 0,
      totalActualizadas: 0,
      subastasInsertadas: 0,
      subastasActualizadas: 0
    };

    if (finalResults.length > 0) {
      try {
        let auctionsContent = fs.readFileSync(auctionsFilePath, 'utf-8');
        
        // Mapeo de estados para el frontend
        for (const s of finalResults) {
          const slug = `subasta-${s.idSub.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
          const boeId = s.idSub;
          
          let auctionDate = s.fechaFin;
          let startDate = s.fechaInicio;
          let isActive = false;
          
          const isoMatchFin = (s.fechaFin || '').match(/ISO:\s*([^)]+)/);
          if (isoMatchFin) {
            auctionDate = isoMatchFin[1].split('T')[0];
            const endDate = new Date(isoMatchFin[1]);
            isActive = new Date() < endDate;
          }

          const isoMatchInicio = (s.fechaInicio || '').match(/ISO:\s*([^)]+)/);
          if (isoMatchInicio) {
            startDate = isoMatchInicio[1].split('T')[0];
          }

          const mappedStatus = normalizeStatus(s.estadoSubasta || '');
          const now = new Date().toISOString();

          // Verificar si ya existe en el archivo
          const slugPattern = new RegExp(`'${slug}':\\s*{`, 'g');
          const exists = slugPattern.test(auctionsContent);

          if (exists) {
            // ACTUALIZAR SOLO: status, auctionDate, startDate, isActive, lastCheckedAt
            console.log(`Actualizando subasta existente: ${slug}`);
            
            // Usar regex para reemplazar campos específicos dentro del bloque de la subasta
            const blockRegex = new RegExp(`('${slug}':\\s*{[\\s\\S]*?})`, 'g');
            auctionsContent = auctionsContent.replace(blockRegex, (match) => {
              let updated = match;
              
              // Actualizar status
              updated = updated.replace(/status:\s*"[^"]*"/, `status: "${mappedStatus}"`);
              
              // Actualizar auctionDate
              updated = updated.replace(/auctionDate:\s*"[^"]*"/, `auctionDate: "${auctionDate}"`);
              
              // Actualizar startDate (si existe, si no añadirlo)
              if (updated.includes('startDate:')) {
                updated = updated.replace(/startDate:\s*"[^"]*"/, `startDate: "${startDate}"`);
              } else {
                updated = updated.replace(/auctionDate:/, `startDate: "${startDate}",\n    auctionDate:`);
              }
              
              // Actualizar isActive
              updated = updated.replace(/isActive:\s*(true|false)/, `isActive: ${isActive}`);
              
              // Actualizar lastCheckedAt (si existe, si no añadirlo)
              if (updated.includes('lastCheckedAt:')) {
                updated = updated.replace(/lastCheckedAt:\s*"[^"]*"/, `lastCheckedAt: "${now}"`);
              } else {
                updated = updated.replace(/(publishedAt:\s*"[^"]*",?)/, `$1\n    lastCheckedAt: "${now}",`);
              }

              // Asegurar que isNew sea false para subastas existentes
              if (updated.includes('isNew:')) {
                updated = updated.replace(/isNew:\s*(true|false)/, `isNew: false`);
              } else {
                updated = updated.replace(/isActive:\s*(true|false)/, `isActive: $1,\n    isNew: false`);
              }

              return updated;
            });
            output.subastasActualizadas++;
          } else {
            // INSERTAR NUEVA
            console.log(`Insertando nueva subasta: ${slug}`);
            
            let desc = s.titulo;
            if (s.cargas) desc += ` | Cargas: ${s.cargas}`;
            if (s.deposito) desc += ` | Depósito: ${s.deposito}€`;

            const entry = `  '${slug}': {
    propertyType: "${(s.tipoBien || 'Inmueble').replace(/"/g, '\\"')}",
    city: "${(s.city || '').replace(/"/g, '\\"')}",
    province: "${(s.province || '').replace(/"/g, '\\"')}",
    municipality: "${(s.municipality || '').replace(/"/g, '\\"')}",
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
    publishedAt: "${startDate || auctionDate || now}",
    lastCheckedAt: "${now}",
    startDate: "${startDate}",
    auctionDate: "${auctionDate}",
    status: "${mappedStatus}",
    isActive: ${isActive},
    isNew: true,
    opportunityScore: ${s.opportunityScore || 0}
  },`;

            const insertionPoint = auctionsContent.indexOf('export const AUCTIONS: Record<string, AuctionData> = {');
            if (insertionPoint !== -1) {
              const openBraceIndex = auctionsContent.indexOf('{', insertionPoint);
              auctionsContent = auctionsContent.slice(0, openBraceIndex + 1) + '\n' + entry + auctionsContent.slice(openBraceIndex + 1);
              output.subastasInsertadas++;
            }
          }
        }
        
        // fs.writeFileSync(auctionsFilePath, auctionsContent);
        output.totalNuevas = output.subastasInsertadas;
        output.totalActualizadas = output.subastasActualizadas;
        
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
