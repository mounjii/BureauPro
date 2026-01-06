import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Mounjikouki12',
  database: process.env.DB_NAME || 'bureaupro_db',
};

async function addUserStatusColumns() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database');

    // Check if status column exists
    const [statusColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'status'
    `, [dbConfig.database]);

    if (statusColumns.length === 0) {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'
      `);
      // Set existing users (except admin) to approved
      await connection.query(`
        UPDATE users SET status = 'approved' WHERE role = 'admin' OR status IS NULL
      `);
      console.log('✅ Status column added successfully');
    } else {
      console.log('✅ Status column already exists');
    }

    // Check if first_name column exists
    const [nameColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'first_name'
    `, [dbConfig.database]);

    if (nameColumns.length === 0) {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN first_name VARCHAR(255),
        ADD COLUMN last_name VARCHAR(255)
      `);
      console.log('✅ Name columns added successfully');
    } else {
      console.log('✅ Name columns already exist');
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('❌ Error running migration:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addUserStatusColumns()
  .then(() => {
    console.log('Migration complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

