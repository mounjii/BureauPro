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
  
  // Check MySQL connection variables (only log what's actually being used)
  if (process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL) {
    const mysqlUrl = process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL;
    console.log('✅ Using MySQL connection URL');
    console.log('Connection URL:', mysqlUrl.replace(/:[^:@]+@/, ':****@')); // Mask password in logs
  } else {
    // Only show individual parameters if URL is not available (for debugging)
    console.log('⚠️ Using individual MySQL connection parameters');
    console.log('MYSQLHOST:', process.env.MYSQLHOST || 'Not set');
    console.log('MYSQLUSER:', process.env.MYSQLUSER || 'Not set');
    console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE || 'Not set');
    console.log('MYSQLPORT:', process.env.MYSQLPORT || 'Not set');
  }
  
  // Debug: Show if variables are literally "${{MySQL.MYSQL_PUBLIC_URL}}"
  if (process.env.MYSQL_PUBLIC_URL && process.env.MYSQL_PUBLIC_URL.includes('${{')) {
    console.log('⚠️ WARNING: MYSQL_PUBLIC_URL contains unresolved variable reference:', process.env.MYSQL_PUBLIC_URL);
    console.log('   This means the deployment platform did not resolve the variable reference. Check service name and syntax.');
  }
  
  // Check if MySQL connection URL is provided (mysql://user:password@host:port/database)
  if (process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL) {
    const mysqlUrl = process.env.MYSQL_PUBLIC_URL || process.env.MYSQL_URL;
    pool = mysql.createPool(mysqlUrl);
  } else if (process.env.MYSQLHOST && process.env.MYSQLUSER && process.env.MYSQLPASSWORD && process.env.MYSQLDATABASE) {
    // Railway provides individual parameters - construct URL if we have all required fields
    // But check if host is an internal Kubernetes service name (won't work)
    const host = process.env.MYSQLHOST;
    if (host.includes('.svc.cluster.local') || host.includes('.svc.')) {
      console.error('❌ ERROR: MySQL host is an internal Kubernetes service name and cannot be resolved!');
      console.error('   Host:', host);
      console.error('   Solution: Use MYSQL_PUBLIC_URL from Railway database service instead.');
      console.error('   Steps:');
      console.error('   1. Go to Railway dashboard');
      console.error('   2. Click on your MySQL database service');
      console.error('   3. Go to Variables tab');
      console.error('   4. Copy MYSQL_PUBLIC_URL value');
      console.error('   5. Add it to your web service environment variables');
      throw new Error('MySQL connection failed: Internal service hostname cannot be resolved. Use MYSQL_PUBLIC_URL instead.');
    }
    
    // Construct connection URL from individual parameters
    const port = process.env.MYSQLPORT || process.env.DB_PORT || 3306;
    const mysqlUrl = `mysql://${process.env.MYSQLUSER}:${process.env.MYSQLPASSWORD}@${host}:${port}/${process.env.MYSQLDATABASE}`;
    console.log('✅ Constructed MySQL connection URL from individual parameters');
    pool = mysql.createPool(mysqlUrl);
  } else {
    // Use individual connection parameters (fallback for local development)
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
