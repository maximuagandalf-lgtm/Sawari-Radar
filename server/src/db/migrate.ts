import fs from 'fs';
import path from 'path';
import { pool } from './index';

async function runMigration() {
  console.log('🔄 Running PostgreSQL & PostGIS Schema Migrations...');

  const schemaPath = path.join(__dirname, 'schema.sql');
  const seedsPath = path.join(__dirname, 'seeds.sql');

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const seedsSql = fs.readFileSync(seedsPath, 'utf8');

  const client = await pool.connect();

  try {
    console.log('1️⃣ Creating tables, triggers, and PostGIS indexes...');
    await client.query(schemaSql);
    console.log('✅ Schema created successfully!');

    console.log('2️⃣ Seeding initial transit hubs...');
    await client.query(seedsSql);
    console.log('✅ Seeds executed successfully!');

    const countRes = await client.query('SELECT COUNT(*) as total FROM transit_hubs');
    console.log(`🎉 Total Transit Hubs in DB: ${countRes.rows[0].total}`);
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
