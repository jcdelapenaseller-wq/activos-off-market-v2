import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

// Import API handlers
import valuationHandler from './api/valuation.js';
import sendConfirmationHandler from './api/send-confirmation.js';
import stripeWebhookHandler from './api/stripe-webhook.js';
import subscribeHandler from './api/subscribe.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Stripe webhook needs raw body
  app.use('/api/stripe-webhook', express.raw({ type: 'application/json' }));
  
  // Other routes need JSON body
  app.use('/api/valuation', express.json());
  app.use('/api/send-confirmation', express.json());
  app.use('/api/subscribe', express.json());

  // Map API routes
  app.all('/api/valuation', (req, res) => valuationHandler(req as any, res as any));
  app.all('/api/send-confirmation', (req, res) => sendConfirmationHandler(req as any, res as any));
  app.all('/api/stripe-webhook', (req, res) => stripeWebhookHandler(req as any, res as any));
  app.all('/api/subscribe', (req, res) => subscribeHandler(req as any, res as any));

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
