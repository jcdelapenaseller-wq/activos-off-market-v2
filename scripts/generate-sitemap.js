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
  '/ejemplos-subastas',
  '/noticias-subastas',
  '/subastas-recientes',
  '/subastas-descuento-50'
];


function removeAccents(str) {
  return str
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ÁÀÄÂ]/g, 'A')
    .replace(/[ÉÈËÊ]/g, 'E')
    .replace(/[ÍÌÏÎ]/g, 'I')
    .replace(/[ÓÒÖÔ]/g, 'O')
    .replace(/[ÚÙÜÛ]/g, 'U');
}

function normalizeProvince(name) {
  if (!name) return '';
  let clean = name.toLowerCase().trim();
  if (clean.includes('/')) clean = clean.split('/')[0].trim();
  clean = clean.replace(/\([^)]*\)/g, '').trim();
  clean = clean.replace(/,?\s*\d{5}\b/g, '').trim();
  clean = removeAccents(clean);
  clean = clean.split(/[\s-]+/).map(word => {
    if (['de', 'del', 'la', 'las', 'el', 'los', 'y', 'en', 'l'].includes(word)) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
  const corrections = {
    'Alacant': 'Alicante',
    'Castello': 'Castellon',
    'Girona': 'Gerona',
    'Lleida': 'Lerida',
    'Ourense': 'Orense',
    'A Coruna': 'A Coruña',
    'Donostia': 'San Sebastian',
    'Gasteiz': 'Vitoria',
    'Bilbo': 'Bilbao'
  };
  return corrections[clean] || clean;
}

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
  const cityOpportunitiesPages = new Set();
  const cityBestAuctionsPages = new Set();
  const streetPages = new Set();
  const zonePropertyCityPages = new Set();
  const provincePages = new Set();
  
  // Split content by auction entries to process them individually
  const entries = auctionsContent.split(/['"]\s*:\s*\{/);
  entries.forEach(entry => {
    const cityMatch = entry.match(/city\s*:\s*['"]([^'"]+)['"]/);
    const provinceMatch = entry.match(/province\s*:\s*['"]([^'"]+)['"]/);
    const typeMatch = entry.match(/propertyType\s*:\s*['"]([^'"]+)['"]/);
    const zoneMatch = entry.match(/zone\s*:\s*['"]([^'"]+)['"]/);
    const addressMatch = entry.match(/address\s*:\s*['"]([^'"]+)['"]/);
    
    if (provinceMatch) {
      const province = normalizeProvince(provinceMatch[1]).toLowerCase().replace(/\s+/g, '-');
      provincePages.add(`/noticias-subastas/provincia/${province}`);
    } else if (cityMatch) {
      const city = normalizeProvince(cityMatch[1]).toLowerCase().replace(/\s+/g, '-');
      provincePages.add(`/noticias-subastas/provincia/${city}`);
    }
    
    if (cityMatch) {
      const city = cityMatch[1].toLowerCase();
      cityOpportunitiesPages.add(`/subastas/${city}/oportunidades`);
      cityBestAuctionsPages.add(`/mejores-subastas/${city}`);
    }

    if (cityMatch && typeMatch) {
      const city = cityMatch[1].toLowerCase();
      const type = typeMatch[1];
      const typeSlug = typeToSlug[type] || type.toLowerCase();
      cityPropertyPages.add(`/subastas/${city}/${typeSlug}`);
      
      if (zoneMatch) {
        const zone = zoneMatch[1].toLowerCase()
          .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
          .replace(/\s+/g, '-');
        zonePropertyCityPages.add(`/subastas-${typeSlug}-${city}-${zone}`);
      }
    }

    if (cityMatch && zoneMatch) {
      const city = cityMatch[1].toLowerCase();
      const zone = zoneMatch[1].toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/\s+/g, '-');
      zonePages.add(`/subastas/${city}/${zone}`);
    }

    if (cityMatch && zoneMatch && addressMatch) {
      const city = cityMatch[1].toLowerCase();
      const zone = zoneMatch[1].toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/\s+/g, '-');
      const street = addressMatch[1].toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
      streetPages.add(`/subastas/${city}/${zone}/${street}`);
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

  // Extract slugs from DISCOVER_REPORTS
  const reportsFilePath = path.join(process.cwd(), 'src/data/discoverReports.ts');
  const reportsSlugs = [];
  if (fs.existsSync(reportsFilePath)) {
    const reportsContent = fs.readFileSync(reportsFilePath, 'utf-8');
    const reportSlugRegex = /'([^']+)'\s*:\s*\{/g;
    let reportMatch;
    while ((reportMatch = reportSlugRegex.exec(reportsContent)) !== null) {
      reportsSlugs.push(reportMatch[1]);
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
${Array.from(cityOpportunitiesPages).map(page => `  <url>
    <loc>${BASE_URL}${page}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
${Array.from(cityBestAuctionsPages).map(page => `  <url>
    <loc>${BASE_URL}${page}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
${Array.from(streetPages).map(page => `  <url>
    <loc>${BASE_URL}${page}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
${Array.from(zonePropertyCityPages).map(page => `  <url>
    <loc>${BASE_URL}${page}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
${Array.from(provincePages).map(page => `  <url>
    <loc>${BASE_URL}${page}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n')}
${slugs.map(slug => `  <url>
    <loc>${BASE_URL}/subasta/${slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/noticias-subastas/analisis/${slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n')}
${reportsSlugs.map(slug => `  <url>
    <loc>${BASE_URL}/analisis/${slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
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
