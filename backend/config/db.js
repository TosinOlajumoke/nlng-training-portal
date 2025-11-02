// config/db.js
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;
const { DB_USER, DB_PASSWORD, DB_HOST, DB_NAME, DB_PORT, DATABASE_URL, NODE_ENV } = process.env;

// PostgreSQL configuration
const config = DATABASE_URL
  ? {
      connectionString: DATABASE_URL,
      ssl: NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    }
  : {
      user: DB_USER,
      host: DB_HOST,
      database: DB_NAME,
      password: String(DB_PASSWORD), // ensure string
      port: DB_PORT ? Number(DB_PORT) : 5432,
      ssl: NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    };

// Create pool
export const pool = new Pool(config);

// ✅ Test Connection
pool
  .connect()
  .then(() => console.log("✅ PostgreSQL connected successfully"))
  .catch((err) => console.error("❌ PostgreSQL connection error:", err.message));
