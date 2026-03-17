const axios = require('axios');
const CONFIG = { USER_AGENT: 'ActivosOffMarket-Bot/1.0 (josecpmx@gmail.com)' };

async function diagnose() {
  const today = '20260316';
  const url = `https://www.boe.es/datosabiertos/api/boe/sumario/${today}`;
  try {
    const res = await axios.get(url, { headers: { 'User-Agent': CONFIG.USER_AGENT } });
    const diarios = [].concat(res.data.data.sumario.diario || []);
    
    console.log("--- ESTRUCTURA DEL SUMARIO ---");
    diarios.forEach(diario => {
      const secciones = [].concat(diario.seccion || []);
      secciones.forEach(seccion => {
        console.log(`Sección: ${seccion.nombre}`);
        const departamentos = [].concat(seccion.departamento || []);
        departamentos.forEach(dep => {
          const epigrafes = [].concat(dep.epigrafe || []);
          epigrafes.forEach(epi => {
            const items = [].concat(epi.item || []);
            if (items.length > 0) {
              console.log(`  Departamento: ${dep.nombre} | Epígrafe: ${epi.nombre} | Items: ${items.length}`);
              items.slice(0, 2).forEach(item => console.log(`    - ID: ${item.identificador} | Título: ${item.titulo}`));
            }
          });
        });
      });
    });
  } catch (e) {
    console.error(e);
  }
}
diagnose();
