const axios = require('axios');

/**
 * Script para extraer el SUB-ID del Portal de Subastas a partir de un anuncio del BOE.
 * 
 * Uso: node extractSubId.js BOE-B-2026-XXXXX
 */

async function extractSubId(boeId) {
  const url = `https://www.boe.es/datosabiertos/api/boe/anuncio/${boeId}`;
  
  console.log(`\n--- Iniciando extracción para: ${boeId} ---`);
  
  try {
    // Solicitamos el anuncio. La API del BOE devuelve XML por defecto.
    const response = await axios.get(url);
    const content = response.data;

    // Regex para detectar el identificador del Portal de Subastas
    // SUB-(JA|AT|SS|NE)-\d{4}-[A-Z0-9]+
    const subIdRegex = /SUB-(JA|AT|SS|NE)-\d{4}-[A-Z0-9]+/g;
    const matches = content.match(subIdRegex);

    if (matches && matches.length > 0) {
      // Eliminar duplicados usando un Set
      const uniqueSubIds = [...new Set(matches)];
      
      console.log(`✅ BOE ID: ${boeId}`);
      console.log(`✅ Se han detectado ${uniqueSubIds.length} subasta(s):`);
      
      uniqueSubIds.forEach((subId, index) => {
        const portalUrl = `https://subastas.boe.es/reg/detalleSubasta.php?idSub=${subId}`;
        console.log(`\n  [${index + 1}] SUB ID: ${subId}`);
        console.log(`      URL: ${portalUrl}`);
      });
    } else {
      console.log(`❌ No se encontró ningún SUB-ID en el contenido del anuncio.`);
      console.log(`Nota: Asegúrese de que el ID del BOE sea de la sección de subastas (Sección V).`);
    }

  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error(`❌ Error: El anuncio ${boeId} no existe en la API del BOE.`);
    } else {
      console.error(`❌ Error al conectar con la API del BOE: ${error.message}`);
    }
  }
  console.log(`--- Fin del proceso ---\n`);
}

// Obtener el ID del BOE desde los argumentos de la línea de comandos
const boeIdArg = process.argv[2];

if (!boeIdArg) {
  console.log('Uso: node extractSubId.js <BOE-ID>');
  console.log('Ejemplo: node extractSubId.js BOE-B-2024-12345');
} else {
  extractSubId(boeIdArg);
}
