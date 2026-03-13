const axios = require('axios');

/**
 * Script de prueba para obtener el barrio o zona mediante geocodificación inversa.
 * Utiliza la API gratuita de OpenStreetMap (Nominatim).
 * 
 * Uso: node reverseGeocode.js <lat> <lon>
 * Ejemplo: node reverseGeocode.js 40.441234 -3.703456
 */

async function reverseGeocode(lat, lon) {
  // Nominatim requiere un User-Agent identificativo según sus políticas de uso
  const config = {
    headers: {
      'User-Agent': 'ActivosOffMarket-Bot/1.0 (josecpmx@gmail.com)'
    },
    params: {
      format: 'json',
      lat: lat,
      lon: lon,
      zoom: 18,
      addressdetails: 1,
      'accept-language': 'es'
    }
  };

  const url = 'https://nominatim.openstreetmap.org/reverse';

  console.log(`\n--- Consultando zona para coordenadas: ${lat}, ${lon} ---\n`);

  try {
    const response = await axios.get(url, config);
    const address = response.data.address;

    if (!address) {
      console.log('❌ No se encontraron detalles de dirección para estas coordenadas.');
      return;
    }

    // Selección del campo más específico disponible para definir la "zona"
    const zone = address.neighbourhood || address.suburb || address.city_district || address.city || 'Desconocida';

    const result = {
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      zone: zone.toLowerCase()
    };

    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error(`❌ Error al conectar con Nominatim: ${error.message}`);
    if (error.response && error.response.status === 403) {
      console.error('Nota: Nominatim puede bloquear peticiones sin un User-Agent válido o por exceso de uso.');
    }
  }

  console.log(`\n--- Fin del proceso ---\n`);
}

// Ejecución
const latArg = process.argv[2];
const lonArg = process.argv[3];

if (!latArg || !lonArg) {
  console.log('Uso: node reverseGeocode.js <lat> <lon>');
  console.log('Ejemplo: node reverseGeocode.js 40.441234 -3.703456');
} else {
  reverseGeocode(latArg, lonArg);
}
