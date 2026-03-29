import fs from 'fs';
import path from 'path';
import { AUCTIONS } from '../src/data/auctions.ts';
import { DISCOVER_REPORTS } from '../src/data/discoverReports.ts';

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

import { getAllowedProvincesForToday } from '../src/utils/discoverLimits.ts';

function generateSitemaps() {
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

  const now = new Date().toISOString();
  const allowedProvinces = getAllowedProvincesForToday();

  // 1. sitemap-auctions-active.xml
  const activeAuctions = Object.entries(AUCTIONS)
    .filter(([_, data]) => ['active', 'upcoming'].includes(data.status || ''))
    .filter(([_, data]) => {
      if (!data.lastCheckedAt) return false;
      const lastChecked = new Date(data.lastCheckedAt);
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      return lastChecked >= fourteenDaysAgo;
    })
    .sort((a, b) => new Date(b[1].lastCheckedAt || 0).getTime() - new Date(a[1].lastCheckedAt || 0).getTime());

  const auctionsXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${activeAuctions.map(([slug, data]) => `  <url>
    <loc>${BASE_URL}/subasta/${slug}</loc>
    <lastmod>${data.lastCheckedAt || now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;
  fs.writeFileSync(path.join(publicDir, 'sitemap-auctions-active.xml'), auctionsXml);

  // 2. sitemap-discover.xml
  const discoverXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.entries(DISCOVER_REPORTS).map(([slug, data]) => `  <url>
    <loc>${BASE_URL}/analisis/${slug}</loc>
    <lastmod>${data.publishDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/noticias-subastas/analisis/${slug}</loc>
    <lastmod>${data.publishDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n')}
${allowedProvinces.map(province => {
  const slug = province.toLowerCase().replace(/\s+/g, '-');
  return `  <url>
    <loc>${BASE_URL}/noticias-subastas/provincia/${slug}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
}).join('\n')}
</urlset>`;
  fs.writeFileSync(path.join(publicDir, 'sitemap-discover.xml'), discoverXml);

  // 3. sitemap-aggregators.xml
  const cityPages = new Set();
  const zonePages = new Set();
  Object.values(AUCTIONS).forEach(data => {
    if (data.city) {
      const city = data.city.toLowerCase().replace(/\s+/g, '-');
      cityPages.add(`/subastas/${city}`);
      if (data.zone) {
        const zone = data.zone.toLowerCase().replace(/\s+/g, '-');
        zonePages.add(`/subastas/${city}/${zone}`);
      }
    }
  });

  const aggregatorsXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from(cityPages).map(page => `  <url>
    <loc>${BASE_URL}${page}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
${Array.from(zonePages).map(page => `  <url>
    <loc>${BASE_URL}${page}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;
  fs.writeFileSync(path.join(publicDir, 'sitemap-aggregators.xml'), aggregatorsXml);

  // 4. sitemap-static.xml
  const staticXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${BASE_URL}${page}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${page === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;
  fs.writeFileSync(path.join(publicDir, 'sitemap-static.xml'), staticXml);

  // 5. sitemap-index.xml
  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>${BASE_URL}/sitemap-auctions-active.xml</loc><lastmod>${now}</lastmod></sitemap>
  <sitemap><loc>${BASE_URL}/sitemap-discover.xml</loc><lastmod>${now}</lastmod></sitemap>
  <sitemap><loc>${BASE_URL}/sitemap-aggregators.xml</loc><lastmod>${now}</lastmod></sitemap>
  <sitemap><loc>${BASE_URL}/sitemap-static.xml</loc><lastmod>${now}</lastmod></sitemap>
</sitemapindex>`;
  fs.writeFileSync(path.join(publicDir, 'sitemap-index.xml'), indexXml);

  console.log('Sitemaps generated successfully!');
}

generateSitemaps();
