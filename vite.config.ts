import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { AUCTIONS } from './src/data/auctions'
import { DISCOVER_REPORTS } from './src/data/discoverReports'
import { createRequire } from 'module'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const require = createRequire(import.meta.url)
const vitePrerender = require('vite-plugin-prerender')

// 1. Static Routes
const staticRoutes = [
  '/',
  '/subastas-recientes',
  '/calculadora-subastas'
]

// 2. Dynamic Routes (Auctions) - Limited to 50 for prudent implementation
const activeAuctions = Object.entries(AUCTIONS)
  .filter(([_, data]) => ['active', 'upcoming'].includes(data.status || ''))
  .sort((a, b) => new Date(b[1].lastCheckedAt || 0).getTime() - new Date(a[1].lastCheckedAt || 0).getTime())
  .slice(0, 50)
  .map(([slug]) => `/subasta/${slug}`)

// 3. Dynamic Routes (Discover)
const discoverRoutes = Object.keys(DISCOVER_REPORTS)
  .map(slug => `/analisis/${slug}`)

// 4. Aggregators (Cities)
const cityPages = new Set<string>()
Object.values(AUCTIONS).forEach(data => {
  if (data.city) {
    const city = data.city.toLowerCase().replace(/\s+/g, '-')
    cityPages.add(`/subastas/${city}`)
  }
})

const allRoutes = [
  ...staticRoutes,
  ...activeAuctions,
  ...discoverRoutes,
  ...Array.from(cityPages)
]

// Check if running in AI Studio (which lacks Puppeteer OS dependencies)
const isAIStudio = process.env.APP_URL !== undefined;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    !isAIStudio && vitePrerender({
      staticDir: path.join(__dirname, 'dist'),
      routes: allRoutes,
      renderer: new vitePrerender.PuppeteerRenderer({
        renderAfterDocumentEvent: 'custom-render-trigger',
        // Optional: inject a property to window to let the app know it's being prerendered
        injectProperty: '__PRERENDER_INJECTED',
        inject: {
          isPrerendering: true
        }
      })
    })
  ].filter(Boolean),
})