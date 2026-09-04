"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.checkDatabaseConnection = checkDatabaseConnection;
exports.isDbConnected = isDbConnected;
exports.query = query;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/sawari_radar_db';
exports.pool = new pg_1.Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 3000,
});
let isPostgresConnected = false;
// Test DB connectivity on startup
async function checkDatabaseConnection() {
    try {
        const client = await exports.pool.connect();
        const res = await client.query('SELECT NOW() as current_time, version()');
        client.release();
        isPostgresConnected = true;
        console.log('✅ Connected to PostgreSQL Database:', res.rows[0].current_time);
        return true;
    }
    catch (error) {
        isPostgresConnected = false;
        console.warn('⚠️ PostgreSQL not reachable. Demand engine running in fast in-memory mode.');
        return false;
    }
}
function isDbConnected() {
    return isPostgresConnected;
}
async function query(text, params) {
    const start = Date.now();
    const res = await exports.pool.query(text, params);
    const duration = Date.now() - start;
    // console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
}
