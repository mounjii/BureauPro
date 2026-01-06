// Database connection - supports both MySQL (local) and PostgreSQL (production)
import dotenv from 'dotenv';

dotenv.config();

let pool;

// Check if DATABASE_URL is provided (PostgreSQL on Render)
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://')) {
  // PostgreSQL (Production - Render)
  const { Pool } = await import('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  // Test PostgreSQL connection
  pool.query('SELECT NOW()')
    .then(() => {
      console.log('✅ Connected to PostgreSQL database');
    })
    .catch(err => {
      console.error('❌ PostgreSQL connection error:', err.message);
    });

  // Wrap PostgreSQL pool to match MySQL interface
  const originalQuery = pool.query.bind(pool);
  pool.query = async (sql, params) => {
    // Convert MySQL-style ? placeholders to PostgreSQL $1, $2, etc.
    if (params && params.length > 0) {
      let paramIndex = 1;
      sql = sql.replace(/\?/g, () => `$${paramIndex++}`);
    }
    const result = await originalQuery(sql, params);
    // PostgreSQL returns { rows, rowCount }, MySQL returns [rows, fields]
    // Return in MySQL format for compatibility
    return [result.rows, []];
  };
} else {
  // MySQL (Development - Local)
  const mysql = await import('mysql2/promise');
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'bureaupro_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };

  pool = mysql.createPool(dbConfig);

  // Test MySQL connection
  pool.getConnection()
    .then(connection => {
      console.log('✅ Connected to MySQL database');
      connection.release();
    })
    .catch(err => {
      console.error('❌ MySQL connection error:', err.message);
    });
}

export default pool;
