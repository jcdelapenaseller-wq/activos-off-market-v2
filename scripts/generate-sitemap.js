import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://activosoffmarket.es';

const staticPages = [
  '/',
  '/quien-soy',
  '/subastas-boe',
  '/indice-guia-subastas',
  '/subastas-judiciales-espana',
  '/calculadora-subastas',
  '/subastas-madrid',
  '/subastas-barcelona',
  '/subastas-valencia',
  '/subastas-sevilla',
  '/ejemplos-subastas'
];


function generateSitemap() {
  const auctionsFilePath = path.join(process.cwd(), 'src/data/auctions.ts');
  const auctionsContent = fs.readFileSync(auctionsFilePath, 'utf-8');

  // Map property types to their URL slugs
  const typeToSlug = {
    'Piso': 'pisos',
    'Local': 'locales',
    'Vivienda': 'viviendas',
    'Chalet': 'chalets',
    'Garaje': 'garajes',
    'Nave': 'naves',
    'Apartamento': 'apartamentos'
  };

  // Find unique city + propertyType combinations that actually exist in the data
  const cityPropertyPages = new Set();
  const zonePages = new Set();
  
  // Split content by auction entries to process them individually
  const entries = auctionsContent.split(/['"]\s*:\s*\{/);
  entries.forEach(entry => {
    const cityMatch = entry.match(/city\s*:\s*['"]([^'"]+)['"]/);
    const typeMatch = entry.match(/propertyType\s*:\s*['"]([^'"]+)['"]/);
    const zoneMatch = entry.match(/zone\s*:\s*['"]([^'"]+)['"]/);
    
    if (cityMatch && typeMatch) {
      const city = cityMatch[1].toLowerCase();
      const type = typeMatch[1];
      const typeSlug = typeToSlug[type] || type.toLowerCase();
      cityPropertyPages.add(`/subastas-${city}/${typeSlug}`);
    }

    if (cityMatch && zoneMatch) {
      const city = cityMatch[1].toLowerCase();
      const zone = zoneMatch[1].toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/\s+/g, '-');
      zonePages.add(`/subastas-${city}-${zone}`);
    }
  });

  // Extract slugs from AUCTIONS object using regex for individual auction pages
  const slugRegex = /'([^']+)'\s*:/g;
  const slugs = [];
  let match;
  while ((match = slugRegex.exec(auctionsContent)) !== null) {
    if (!match[1].includes(':')) { // Avoid matching property names
      slugs.push(match[1]);
    }
  }

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${BASE_URL}${page}</loc>
    <changefreq>monthly</changefreq>
    <priority>${page === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
${Array.from(cityPropertyPages).map(page => `  <url>
    <loc>${BASE_URL}${page}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
${Array.from(zonePages).map(page => `  <url>
    <loc>${BASE_URL}${page}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
${slugs.map(slug => `  <url>
    <loc>${BASE_URL}/ejemplo-subasta/${slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`).join('\n')}
</urlset>`;

  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent);
  console.log('Sitemap generated successfully!');
}

generateSitemap();
