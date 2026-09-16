import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import apiRoutes from './routes';
import { connectDB } from './db';

dotenv.config();

export function createExpressApp() {
  const app = express();

  // Middleware for parsing JSON with generous limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Middleware to ensure Database is initialized before handling requests
  let dbPromise: Promise<boolean> | null = null;
  app.use(async (req, res, next) => {
    // Only wait for DB if it's an API route or healthcheck
    if (req.path.startsWith('/api') || req.path === '/health') {
      try {
        if (!dbPromise) {
          dbPromise = connectDB().catch((err) => {
            console.error('Database connection error in middleware:', err);
            dbPromise = null;
            return false;
          });
        }
        await dbPromise;
      } catch (err) {
        console.warn('DB connect error, continuing with fallback:', err);
      }
    }
    next();
  });

  // Explicit static handlers for PWA assets
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

  // Serve static files from public directory
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Healthcheck endpoints
  const healthHandler = (req: express.Request, res: express.Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      institution: 'StartSmart Tech Hub',
      platform: process.env.VERCEL ? 'vercel_serverless' : 'node_container',
    });
  };
  app.get('/api/health', healthHandler);
  app.get('/health', healthHandler);

  // Mount API routes with `/api` prefix
  app.use('/api', apiRoutes);

  // Catch unmatched API routes to return clean JSON errors
  app.all(['/api', '/api/*'], (req, res) => {
    res.status(404).json({
      error: `API route not found: ${req.method} ${req.originalUrl}`,
      success: false,
    });
  });

  // Global JSON error handler for API routes
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path && req.path.startsWith('/api')) {
      console.error('Unhandled API Error in Express app:', err);
      res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        success: false,
      });
      return;
    }
    next(err);
  });

  return app;
}

export const app = createExpressApp();
export default app;
