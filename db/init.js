const { Client, Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1234'
};

const targetDbName = process.env.DB_NAME || 'chakriya_clinic';

async function initializeDatabase() {
  console.log(`🔌 Connecting to PostgreSQL at ${dbConfig.host}:${dbConfig.port}...`);
  
  // 1. Connect to default 'postgres' database to check/create target database
  const rootClient = new Client({
    ...dbConfig,
    database: 'postgres'
  });

  try {
    await rootClient.connect();
    console.log('✅ Connected to PostgreSQL Server!');

    // Check if database exists
    const res = await rootClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [targetDbName]
    );

    if (res.rowCount === 0) {
      console.log(`📦 Database "${targetDbName}" does not exist. Creating now...`);
      await rootClient.query(`CREATE DATABASE "${targetDbName}";`);
      console.log(`🎉 Database "${targetDbName}" created successfully!`);
    } else {
      console.log(`ℹ️ Database "${targetDbName}" already exists.`);
    }

    await rootClient.end();

    // 2. Connect to target 'chakriya_clinic' database and apply schema
    const targetPool = new Pool({
      ...dbConfig,
      database: targetDbName
    });

    const schemaPath = path.join(__dirname, 'schema.sql');
    const sqlSchema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📜 Applying database tables and schema...');
    await targetPool.query(sqlSchema);
    console.log('✨ All tables (doctors, patients, appointments, medical_records, invoices) are ready!');

    await targetPool.end();
    console.log('🚀 PostgreSQL Database Setup Complete!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Database Initialization Error:', err.message);
    process.exit(1);
  }
}

initializeDatabase();
