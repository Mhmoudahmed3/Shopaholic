/**
 * @module server.js
 * @description HTTP server entry point for SHOPAHOLIC API.
 * Loads environment variables, starts the Express app, and listens on PORT.
 * Handles graceful shutdown on SIGTERM (e.g. Railway, Render, Docker).
 */

'use strict';

require('dotenv').config();

const app = require('./app');
const prisma = require('./prisma/client');

const PORT = process.env.PORT || 4000;

// ── Start server ──────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║  🛍️  SHOPAHOLIC API                          ║
║  Server:  http://localhost:${PORT}              ║
║  Env:     ${(process.env.NODE_ENV || 'development').padEnd(34)}║
╚══════════════════════════════════════════════╝
  `);
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const shutdown = async (signal) => {
  console.log(`\n[Server] ${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    console.log('[Server] HTTP server closed.');
    // Disconnect Prisma client cleanly
    await prisma.$disconnect();
    console.log('[Server] Prisma disconnected. Exiting.');
    process.exit(0);
  });

  // Force exit if graceful shutdown takes more than 10 seconds
  setTimeout(() => {
    console.error('[Server] Force exit after timeout.');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', async (err) => {
  console.error('[Server] Uncaught exception:', err);
  await prisma.$disconnect();
  process.exit(1);
});
process.on('unhandledRejection', async (reason) => {
  console.error('[Server] Unhandled rejection:', reason);
  await prisma.$disconnect();
  process.exit(1);
});
