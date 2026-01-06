import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Parse DATABASE_URL if provided (Render format)
// Format: postgresql://user:password@host:port/database
let pool;

if (process.env.DATABASE_URL) {
  // Production: Use DATABASE_URL from Render
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
} else {
  // Development: Use individual config
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'burocycle_db',
    ssl: false,
  });
}

// Test connection
pool.query('SELECT NOW()')
  .then(() => {
    console.log('✅ Connected to PostgreSQL database');
  })
  .catch(err => {
    console.error('❌ Database connection error:', err.message);
  });

export default pool;

