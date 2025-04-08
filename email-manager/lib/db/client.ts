// lib/db/client.ts
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

// Connection configuration
const connectionConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'libremail',
  port: Number(process.env.DB_PORT) || 3306,
};

// Connection pool
let connectionPool: mysql.Pool | null = null;

/**
 * Get or create a MySQL connection pool
 */
export async function getConnectionPool() {
  if (!connectionPool) {
    connectionPool = mysql.createPool({
      ...connectionConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return connectionPool;
}

/**
 * Get a Drizzle ORM instance with the MySQL connection
 */
export async function getDb() {
  const pool = await getConnectionPool();
  return drizzle(pool, { schema, mode: 'default' });
}

/**
 * Close the database connection pool
 */
export async function closeDb() {
  if (connectionPool) {
    await connectionPool.end();
    connectionPool = null;
  }
}

// Create a type for the database
export type Database = ReturnType<typeof getDb> extends Promise<infer T> ? T : never;