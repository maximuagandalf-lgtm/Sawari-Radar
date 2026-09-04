import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/sawari_radar_db';

export const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
});

let isPostgresConnected = false;

// Test DB connectivity on startup
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW() as current_time, version()');
    client.release();
    isPostgresConnected = true;
    console.log('✅ Connected to PostgreSQL Database:', res.rows[0].current_time);
    return true;
  } catch (error) {
    isPostgresConnected = false;
    console.warn('⚠️ PostgreSQL not reachable. Demand engine running in fast in-memory mode.');
    return false;
  }
}

export function isDbConnected(): boolean {
  return isPostgresConnected;
}

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  // console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
}
