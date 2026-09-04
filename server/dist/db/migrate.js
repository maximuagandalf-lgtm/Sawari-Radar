"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const index_1 = require("./index");
async function runMigration() {
    console.log('🔄 Running PostgreSQL & PostGIS Schema Migrations...');
    const schemaPath = path_1.default.join(__dirname, 'schema.sql');
    const seedsPath = path_1.default.join(__dirname, 'seeds.sql');
    const schemaSql = fs_1.default.readFileSync(schemaPath, 'utf8');
    const seedsSql = fs_1.default.readFileSync(seedsPath, 'utf8');
    const client = await index_1.pool.connect();
    try {
        console.log('1️⃣ Creating tables, triggers, and PostGIS indexes...');
        await client.query(schemaSql);
        console.log('✅ Schema created successfully!');
        console.log('2️⃣ Seeding initial transit hubs...');
        await client.query(seedsSql);
        console.log('✅ Seeds executed successfully!');
        const countRes = await client.query('SELECT COUNT(*) as total FROM transit_hubs');
        console.log(`🎉 Total Transit Hubs in DB: ${countRes.rows[0].total}`);
    }
    catch (err) {
        console.error('❌ Migration failed:', err);
    }
    finally {
        client.release();
        await index_1.pool.end();
    }
}
runMigration();
