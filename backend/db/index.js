/**
 * @module db/index.js
 * @description Singleton pg.Pool connection to PostgreSQL.
 * All controllers import this pool and call pool.query().
 * Connection details come from the DATABASE_URL environment variable.
 */

const { Pool } = require('pg');

/**
 * @type {Pool}
 * @description A shared connection pool.
 * max: 10 connections — suitable for a small-to-medium load.
 * idleTimeoutMillis: release idle connections after 30s.
 * connectionTimeoutMillis: fail fast if no connection available after 2s.
 */
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    // In production, if using SSL (e.g. Heroku, Neon, Supabase), uncomment:
    // ssl: { rejectUnauthorized: false },
});

// Log a warning if the pool encounters a background error
pool.on('error', (err) => {
    console.error('[DB] Unexpected pool error:', err.message);
    // Do NOT process.exit here — let the request-level error handler deal with it
});

module.exports = pool;
