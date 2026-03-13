const axios = require('axios');
const xml2js = require('xml2js');

/**
 * Script de prueba para obtener coordenadas geográficas (Lat/Lon) del Catastro.
 * 
 * Uso: node catastroCoords.js 1234567VK4713S0001XX
 */

async function getCoords(rc) {
  // El servicio Consulta_CPMRC requiere Provincia y Municipio, pero funcionan vacíos si se provee RC
  const url = `http://ovc.catastro.minhap.es/ovcservweb/ovccoord/ovccoord.asmx/Consulta_CPMRC?Provincia=&Municipio=&RC=${rc}`;

  console.log(`\n--- Obteniendo coordenadas para: ${rc} ---\n`);

  try {
    const response = await axios.get(url);
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(response.data);

    // Verificar errores en la respuesta
    if (result.consulta_cpmrc.lerr) {
      console.error('❌ Error del Catastro:', result.consulta_cpmrc.lerr.err.des);
      return;
    }

    // Los datos de coordenadas están en el nodo 'coordenadas' -> 'coord' -> 'geo'
    // xcen es longitud, ycen es latitud
    const geo = result.consulta_cpmrc.coordenadas.coord.geo;
    
    const coordData = {
      cadastralRef: rc,
      lat: parseFloat(geo.ycen),
      lon: parseFloat(geo.xcen)
    };

    console.log(JSON.stringify(coordData, null, 2));

  } catch (error) {
    console.error(`❌ Error al conectar con el servicio de coordenadas: ${error.message}`);
  }

  console.log(`\n--- Fin del proceso ---\n`);
}

// Ejecución
const rcArg = process.argv[2];

if (!rcArg) {
  console.log('Uso: node catastroCoords.js <REFERENCIA-CATASTRAL>');
  console.log('Ejemplo: node catastroCoords.js 1234567VK4713S0001XX');
} else {
  getCoords(rcArg);
}
