/**
 * @module app.js
 * @description Express application factory for SHOPAHOLIC API.
 * Sets up global middleware, mounts all API routes, and registers the global error handler.
 * Separated from server.js to make unit testing easier.
 */

'use strict';

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const ApiError = require('./utils/apiError');

// ── Route modules ─────────────────────────────────────────────────────────────
const authRoutes    = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes   = require('./routes/orders');

const app = express();

// ─────────────────────────────────────────────────────────────────────────────
// 1. Security Headers (helmet)
//    Sets sane HTTP headers to protect against XSS, clickjacking, MIME sniffing, etc.
// ─────────────────────────────────────────────────────────────────────────────
app.use(helmet());

// ─────────────────────────────────────────────────────────────────────────────
// 2. CORS
//    Only allow requests from the configured origin(s).
//    In production: set CORS_ORIGIN to your actual frontend domain.
// ─────────────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server calls (no origin) and configured origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin "${origin}" is not allowed.`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ─────────────────────────────────────────────────────────────────────────────
// 3. Body Parsers
// ─────────────────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─────────────────────────────────────────────────────────────────────────────
// 4. Request Logger (development only)
// ─────────────────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. API Routes
// ─────────────────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);

// Health-check endpoint — useful for uptime monitoring
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'SHOPAHOLIC API', timestamp: new Date().toISOString() });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. 404 handler — catches any route not matched above
// ─────────────────────────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  next(new ApiError(404, `Cannot ${req.method} ${req.url}`));
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Global Error Handler
//    All controllers/middleware call next(err) to reach here.
//    Returns standardized JSON error responses.
//    Never leaks stack traces in production.
// ─────────────────────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message    = err.message    || 'An unexpected error occurred.';

  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error]', err.stack || err);
  }

  res.status(statusCode).json({
    error: {
      status:  statusCode,
      message,
      ...(err.details && { details: err.details }),
    },
  });
});

module.exports = app;
