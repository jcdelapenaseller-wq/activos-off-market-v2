const axios = require('axios');
const cheerio = require('cheerio');

async function testScraper() {
  const url = 'https://subastas.boe.es/index.php?ver=6';
  console.log(`Fetching ${url}...`);

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const results = [];

    // Note: index.php?ver=3 might show a map. 
    // If no results are found, we try to see if there's a list.
    // Usually results are in ul.resultado-busqueda li
    
    $('ul.resultado-busqueda li').each((i, el) => {
      if (i >= 5) return false;

      const item = $(el);
      const titulo = item.find('h3').text().trim() || item.find('a').first().text().trim();
      
      let valorSubasta = '';
      let localidad = '';
      let fechaFin = '';

      item.find('span').each((_, span) => {
        const text = $(span).text();
        if (text.includes('Valor subasta:')) {
          valorSubasta = text.replace('Valor subasta:', '').trim();
        } else if (text.includes('Localidad:')) {
          localidad = text.replace('Localidad:', '').trim();
        } else if (text.includes('Fecha de conclusión:')) {
          fechaFin = text.replace('Fecha de conclusión:', '').trim();
        }
      });

      const urlDetalle = item.find('a[href^="subastas_det.php"]').attr('href');
      const fullUrlDetalle = urlDetalle ? `https://subastas.boe.es/${urlDetalle}` : '';

      results.push({
        titulo,
        valorSubasta,
        localidad,
        fechaFin,
        urlDetalle: fullUrlDetalle
      });
    });

    if (results.length === 0) {
      console.log('No se encontraron subastas en esta URL. Es posible que la página requiera una selección previa (provincia) o que no haya subastas activas visibles directamente.');
      console.log('Sugerencia: Prueba con https://subastas.boe.es/index.php?ver=6 (Últimos vehículos)');
    } else {
      console.log(JSON.stringify(results, null, 2));
    }

  } catch (error) {
    console.error('Error fetching or parsing:', error.message);
  }
}

testScraper();
