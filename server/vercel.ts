/**
 * CarePlus Clinic - Vercel Serverless Handler Source
 * 
 * Bundled by esbuild into api/index.js for Vercel deployment.
 * Routes /api/* requests to the Express API router with full
 * OAuth, scheduling, and clinic status support.
 */

import express, { Request, Response, NextFunction } from 'express';
import { apiRouter } from './api/routes';

const app = express();

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Safe server-side request logging (zero patient data or secrets logged)
app.use((req: Request, res: Response, next: NextFunction) => {
  const sanitizedMethod = req.method;
  const sanitizedPath = req.path;
  console.log(`[Vercel Serverless API] ${sanitizedMethod} ${sanitizedPath}`);
  next();
});

// Handle requests whether path retains the /api prefix or is stripped by proxy rewrites
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Safe global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[API Server Error]:', err?.message || err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    ok: false,
    error: 'An internal server error occurred while processing the request.',
  });
});

export default app;
