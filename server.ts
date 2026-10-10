/**
 * CarePlus Clinic - Full-Stack Express Server Entry Point
 * Mounts server-side API routes, Google OAuth handlers, and Vite middleware.
 * Runs on port 3000.
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './server/api/routes';
import { config } from './server/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const isProduction = process.env.NODE_ENV === 'production';
  const port = config.port;

  // JSON Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Safe request logging without sensitive patient or token data
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      const sanitizedMethod = req.method;
      const sanitizedPath = req.path;
      console.log(`[API Request] ${sanitizedMethod} ${sanitizedPath} (${new Date().toLocaleTimeString()})`);
    }
    next();
  });

  // Mount API router
  app.use('/api', apiRouter);

  // Vite development middleware or static production serving
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve built static files from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // Safe global error handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[Unhandled Server Error]:', err.message || err);
    if (res.headersSent) {
      return next(err);
    }
    res.status(500).json({
      ok: false,
      error: 'An internal server error occurred while processing the request.',
    });
  });

  app.listen(port, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(` CarePlus Clinic — Smart Appointment System Server`);
    console.log(` Dev server running on: http://0.0.0.0:${port}`);
    console.log(` Mode: ${isProduction ? 'Production' : 'Development'}`);
    console.log(` Google OAuth Configured: ${config.google.isOAuthConfigured ? 'YES' : 'SIMULATED / DEMO'}`);
    console.log(` Callback URI: ${config.google.redirectUri}`);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
