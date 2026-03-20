import * as cheerio from 'cheerio';

async function run() {
  const url = 'https://subastas.boe.es/subastas_ava.php';
  const params = new URLSearchParams();
  params.append('accion', 'Buscar');
  
  // campo[18] is FECHA_INICIO
  params.append('campo[18]', 'SUBASTA.FECHA_INICIO');
  params.append('dato[18][0]', '13/03/2026'); // Format DD/MM/YYYY
  params.append('dato[18][1]', '20/03/2026');
  params.append('page_hits', '500');

  const res = await fetch(url, {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const text = $('.caja_contenidos').text();
  const match = text.match(/encontrad[oa]s?\s+([0-9.]+)/i);
  let total = match ? match[1] : 0;
  
  const results = $('.resultado-busqueda li.resultado');
  if (!total) total = results.length;
  
  console.log('Total encontradas:', total);
  
  const examples = [];
  results.slice(0, 3).each((i, el) => {
    const textContent = $(el).text();
    const idMatch = textContent.match(/Identificador:\s*([A-Z0-9-]+)/);
    const statusMatch = textContent.match(/Estado:\s*([^\n]+)/);
    
    if (idMatch) {
      examples.push({
        id: idMatch[1],
        estado: statusMatch ? statusMatch[1].trim() : 'Desconocido'
      });
    }
  });
  
  console.log('Ejemplos:');
  examples.forEach(e => console.log('- ID: ' + e.id + ' | Estado: ' + e.estado));
}
run();
