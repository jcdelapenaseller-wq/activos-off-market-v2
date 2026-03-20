import * as cheerio from 'cheerio';

async function run() {
  const res = await fetch('https://subastas.boe.es/subastas_ava.php');
  const html = await res.text();
  const $ = cheerio.load(html);
  
  console.log('--- SORT FIELDS ---');
  $('select[name="sort_field[0]"] option').each((i, el) => {
    console.log($(el).attr('value'), $(el).text());
  });

  console.log('\\n--- SORT ORDERS ---');
  $('select[name="sort_order[0]"] option').each((i, el) => {
    console.log($(el).attr('value'), $(el).text());
  });

  console.log('\\n--- DATE FIELDS ---');
  $('input[type="hidden"]').each((i, el) => {
    const name = $(el).attr('name');
    const val = $(el).attr('value');
    if (val && val.toLowerCase().includes('fecha')) {
      console.log(name, val);
    }
  });
}
run();
