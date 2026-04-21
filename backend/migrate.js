import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "pg";

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log("Runnning Databse Migration");

    //Read The Schema File
    const schemaPath = path.join(__dirname, "config", "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");
    await client.query(schemaSql);
    console.log("Database migraion completed successfully");
    
  } catch (err) {
    console.log(`Migration Failed: ${err.message}`);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
