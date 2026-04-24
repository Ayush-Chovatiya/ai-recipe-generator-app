import dotenv from "dotenv";
dotenv.config();

import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on("connect", () => {
  console.log("Connected to NEON PG DB :)");
});

pool.on("error", (err) => {
  console.log("Unexpected DB error", err);
  process.exit(-1);
});

export default {
  query: (text, params) => pool.query(text, params),
  pool,
};
