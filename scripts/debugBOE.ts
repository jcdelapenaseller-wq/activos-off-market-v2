import axios from 'axios';

async function debugBOE() {
  const date = '20260311';
  const url = `https://www.boe.es/datosabiertos/api/boe/sumario/${date}`;
  try {
    const response = await axios.get(url);
    const summary = response.data;
    const diario = summary.data.sumario.diario[0];
    const sections = diario.seccion;
    
    console.log('Sections found:');
    sections.forEach((s: any) => {
      console.log(`- ${s.codigo}: ${s.nombre}`);
    });

    const section5A = sections.find((s: any) => s.codigo === '5A');
    if (section5A) {
      console.log('Section 5A found!');
    } else {
      console.log('Section 5A NOT found.');
    }

    const section5B = sections.find((s: any) => s.codigo === '5B');
    if (section5B) {
      console.log('Section 5B found. Structure:');
      // Log keys of section5B
      console.log('Keys:', Object.keys(section5B));
      
      // Check for 'departamento' which often contains items
      if (section5B.departamento) {
        const departamentos = Array.isArray(section5B.departamento) ? section5B.departamento : [section5B.departamento];
        departamentos.forEach((dept: any) => {
          console.log(`  Dept: ${dept.nombre}`);
          if (dept.item) {
            const items = Array.isArray(dept.item) ? dept.item : [dept.item];
            items.forEach((item: any) => {
              console.log(`    - [${item.id}] ${item.titulo}`);
            });
          }
        });
      }
    } else {
      console.log('Section 5B NOT found.');
    }
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

debugBOE();
