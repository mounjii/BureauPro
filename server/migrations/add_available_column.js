import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Mounjikouki12',
  database: process.env.DB_NAME || 'bureaupro_db',
};

async function addAvailableColumn() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database');

    // Check if column exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'available'
    `, [dbConfig.database]);

    if (columns.length === 0) {
      // Add the column
      await connection.query(`
        ALTER TABLE products 
        ADD COLUMN available BOOLEAN DEFAULT TRUE
      `);
      console.log('✅ Column "available" added successfully');
      
      // Update all existing products to be available by default
      await connection.query(`
        UPDATE products SET available = TRUE WHERE available IS NULL
      `);
      console.log('✅ All existing products set to available');
    } else {
      console.log('✅ Column "available" already exists');
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

addAvailableColumn()
  .then(() => {
    console.log('Migration complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

