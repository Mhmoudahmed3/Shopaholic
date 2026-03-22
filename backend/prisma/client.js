/**
 * @module prisma/client.js
 * @description Singleton Prisma Client instance.
 * Reuses a single connection in development to avoid exhausting the pool
 * during hot-reloads (nodemon), and creates a fresh instance in production.
 */

'use strict';

const { PrismaClient } = require('@prisma/client');

// Prevent multiple Prisma instances during hot-reload in development
const globalForPrisma = global;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
