// Database connection - supports both MySQL (local) and PostgreSQL (production)
import dotenv from 'dotenv';

// Load .env.local for local development, use process.env for production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config(); // Use environment variables in production
}

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
  // MySQL (Development - Local or Production)
  const mysql = await import('mysql2/promise');
  
  let dbConfig;
  
  // Debug: Log available MySQL-related environment variables
  console.log('🔍 Checking MySQL connection variables...');
  console.log('MYSQL_PUBLIC_URL:', process.env.MYSQL_PUBLIC_URL ? '✅ Found' : '❌ Not found');
  if (process.env.MYSQL_PUBLIC_URL) {
    console.log('MYSQL_PUBLIC_URL value:', process.env.MYSQL_PUBLIC_URL.replace(/:[^:@]+@/, ':****@'));
  }
  console.log('MYSQL_URL:', process.env.MYSQL_URL ? '✅ Found' : '❌ Not found');
  if (process.env.MYSQL_URL) {
    console.log('MYSQL_URL value:', process.env.MYSQL_URL.replace(/:[^:@]+@/, ':****@'));
  }
  console.log('MYSQLHOST:', process.env.MYSQLHOST || 'Not set');
  console.log('MYSQLUSER:', process.env.MYSQLUSER || 'Not set');
  console.log('MYSQLPASSWORD:', process.env.MYSQLPASSWORD ? '✅ Set (hidden)' : 'Not set');
  console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE || 'Not set');
  console.log('MYSQLPORT:', process.env.MYSQLPORT || 'Not set');
  
  // Debug: Show if variables are literally "${{MySQL.MYSQL_PUBLIC_URL}}"
  if (process.env.MYSQL_PUBLIC_URL && process.env.MYSQL_PUBLIC_URL.includes('${{')) {
    console.log('⚠️ WARNING: MYSQL_PUBLIC_URL contains unresolved variable reference:', process.env.MYSQL_PUBLIC_URL);
    console.log('   This means the deployment platform did not resolve the variable reference. Check service name and syntax.');
  }
  
  // Check if MySQL connection URL is provided (mysql://user:password@host:port/database)
  if (process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL) {
    const mysqlUrl = process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL;
    console.log('✅ Using MySQL connection URL');
    console.log('Connection URL:', mysqlUrl.replace(/:[^:@]+@/, ':****@')); // Mask password in logs
    pool = mysql.createPool(mysqlUrl);
  } else {
    // Use individual connection parameters
    console.log('⚠️ Using individual MySQL connection parameters');
    dbConfig = {
      host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
      user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
      password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD || 'Mounjikouki12',
      database: process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'bureaupro_db',
      port: process.env.DB_PORT || process.env.MYSQLPORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };
    
    console.log('MySQL connection config:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port
    });
    
    pool = mysql.createPool(dbConfig);
  }

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
