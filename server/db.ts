import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';

/**
 * Database connection utility for Drizzle ORM
 * This module provides a singleton database connection
 * to be used throughout the application
 */

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait for a connection to become available
});

// Log connection events for debugging
pool.on('connect', () => {
  console.log('Database connection established');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Initialize Drizzle ORM with the schema
export const db = drizzle(pool, { schema });

// Export a function to close the pool (useful for shutdown)
export const closePool = async () => {
  await pool.end();
  console.log('Database connection pool closed');
};

// Export a health check function
export const healthCheck = async () => {
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};

export default db;