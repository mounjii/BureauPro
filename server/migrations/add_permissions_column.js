import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Mounjikouki12',
  database: process.env.DB_NAME || 'bureaupro_db',
};

async function addPermissionsColumn() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database');

    // Check if permissions column exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'permissions'
    `, [dbConfig.database]);

    if (columns.length === 0) {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN permissions TEXT
      `);
      
      // Set default permissions for admin (all true)
      const adminPermissions = JSON.stringify({
        manageProducts: true,
        manageCategories: true,
        manageCollaborators: true,
        viewDashboard: true
      });
      await connection.query(`
        UPDATE users SET permissions = ? WHERE role = 'admin'
      `, [adminPermissions]);
      
      console.log('✅ Permissions column added successfully');
    } else {
      console.log('✅ Permissions column already exists');
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

addPermissionsColumn()
  .then(() => {
    console.log('Migration complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });

