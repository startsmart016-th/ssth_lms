import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import apiRoutes from './server/routes';
import { connectDB } from './server/db';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing JSON
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Explicit static handlers for PWA assets to prevent Vite SPA HTML fallback
  app.get(['/manifest.webmanifest', '/manifest.json'], (req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json');
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(process.cwd(), 'public', 'manifest.webmanifest'));
  });

  app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(process.cwd(), 'public', 'sw.js'));
  });

  // Serve static files from public directory (avatars, icons, logo assets)
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Initialize DB connection (MongoDB Atlas with automatic embedded fallback)
  await connectDB();

  // Healthcheck endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      institution: 'StartSmart Tech Hub',
    });
  });

  // Mount API routes
  app.use('/api', apiRoutes);

  // Catch unmatched API routes to prevent Vite from returning HTML for /api/* requests
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}`, success: false });
  });
  app.all('/api', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}`, success: false });
  });

  // Global JSON error handler for API routes
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path && req.path.startsWith('/api')) {
      console.error('Unhandled API Error:', err);
      res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
      return;
    }
    next(err);
  });

  // Vite middleware for development vs static build in production
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
    console.log(`🚀 StartSmart Tech Hub LMS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Boot Error:', err);
});
