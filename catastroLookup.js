const axios = require('axios');
const xml2js = require('xml2js');

/**
 * Script de prueba para consultar datos físicos de un inmueble en el Catastro.
 * 
 * Uso: node catastroLookup.js 1234567VK4713S0001XX
 */

async function lookupCatastro(rc) {
  const url = `http://ovc.catastro.minhap.es/ovcservweb/ovcalllejer/ovccallejer.asmx/Consulta_DNPRC?RC=${rc}&Provincia=&Municipio=`;

  console.log(`\n--- Consultando Catastro para la referencia: ${rc} ---\n`);

  try {
    const response = await axios.get(url);
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(response.data);

    // Verificar si hay error en la respuesta del Catastro
    if (result.consulta_dnprc.lerr) {
      console.error('❌ Error del Catastro:', result.consulta_dnprc.lerr.err.des);
      return;
    }

    const data = result.consulta_dnprc.bico;
    
    // Extraer datos con navegación segura por el objeto XML parseado
    const physicalData = {
      cadastralRef: rc,
      surface: parseInt(data.bi.inf.sfc) || null,
      use: data.bi.inf.dest || null,
      yearBuilt: parseInt(data.bi.inf.ant) || null,
      municipality: data.bi.dt.nm || null,
      province: data.bi.dt.np || null
    };

    console.log(JSON.stringify(physicalData, null, 2));

  } catch (error) {
    console.error(`❌ Error al conectar con la API del Catastro: ${error.message}`);
  }

  console.log(`\n--- Fin del proceso ---\n`);
}

// Ejecución
const rcArg = process.argv[2];

if (!rcArg) {
  console.log('Uso: node catastroLookup.js <REFERENCIA-CATASTRAL>');
  console.log('Ejemplo: node catastroLookup.js 1234567VK4713S0001XX');
} else {
  lookupCatastro(rcArg);
}
