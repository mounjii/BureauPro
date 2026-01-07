import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config({ path: '.env.local' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Mounjikouki12',
};

async function initDatabase() {
  let connection;
  try {
    // Connect without database specified
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'bureaupro_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database '${dbName}' ready`);

    // Use the database
    await connection.query(`USE \`${dbName}\``);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        permissions TEXT,
        liked_products TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table ready');

    // Add status and name columns if they don't exist (for existing databases)
    try {
      const [statusColumns] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'status'
      `, [dbName]);
      
      if (statusColumns.length === 0) {
        await connection.query(`
          ALTER TABLE users 
          ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'
        `);
        // Set existing users (except admin) to approved
        await connection.query(`
          UPDATE users SET status = 'approved' WHERE role = 'admin' OR status IS NULL
        `);
        console.log('Status column added to existing users table');
      }

      const [nameColumns] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'first_name'
      `, [dbName]);
      
      if (nameColumns.length === 0) {
        await connection.query(`
          ALTER TABLE users 
          ADD COLUMN first_name VARCHAR(255),
          ADD COLUMN last_name VARCHAR(255)
        `);
        console.log('Name columns added to existing users table');
      }

      const [permissionsColumns] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'permissions'
      `, [dbName]);
      
      if (permissionsColumns.length === 0) {
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
        console.log('Permissions column added to existing users table');
      }
    } catch (error) {
      console.log('Column check completed');
    }

    // Create products table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        images TEXT,
        features TEXT,
        stock INT DEFAULT 0,
        available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Products table ready');

    // Add available column if it doesn't exist (for existing databases)
    try {
      const [columns] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'available'
      `, [dbName]);
      
      if (columns.length === 0) {
        await connection.query(`
          ALTER TABLE products 
          ADD COLUMN available BOOLEAN DEFAULT TRUE
        `);
        console.log('Available column added to existing products table');
      }
    } catch (error) {
      // Column might already exist or table doesn't exist yet, ignore error
      console.log('Available column check completed');
    }

    // Create categories table (if you want to manage them dynamically)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Categories table ready');

    // Insert default admin user if it doesn't exist
    const [adminUsers] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      ['admin@bureaupro.com']
    );

    if (adminUsers.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const adminPermissions = JSON.stringify({
        manageProducts: true,
        manageCategories: true,
        manageCollaborators: true,
        viewDashboard: true
      });
      await connection.query(
        'INSERT INTO users (email, name, password, role, status, permissions) VALUES (?, ?, ?, ?, ?, ?)',
        ['admin@bureaupro.com', 'Admin', hashedPassword, 'admin', 'approved', adminPermissions]
      );
      console.log('Default admin user created');
    }

    // Insert default categories if they don't exist
    const categories = ['Papeterie', 'Mobilier', 'Informatique', 'Écriture', 'Classement'];
    for (const category of categories) {
      await connection.query(
        'INSERT IGNORE INTO categories (name) VALUES (?)',
        [category]
      );
    }
    console.log('Default categories ready');

    // Insert default products if they don't exist
    const [productCount] = await connection.query('SELECT COUNT(*) as count FROM products');
    if (productCount[0].count === 0) {
      const defaultProducts = [
        {
          name: 'Chaise Ergonomique Zenith',
          description: 'Une chaise de bureau haut de gamme conçue pour un confort optimal pendant de longues heures de travail. Son design primé allie élégance et science du corps.',
          price: 349.99,
          category: 'Mobilier',
          image_url: 'https://images.unsplash.com/photo-1505797149-43b0000ee20e?auto=format&fit=crop&q=80&w=800',
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1505797149-43b0000ee20e?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&q=80&w=800'
          ]),
          features: JSON.stringify(['Support lombaire réglable', 'Accoudoirs 4D', 'Tissu respirant', 'Structure en aluminium recyclé']),
          stock: 12
        },
        {
          name: 'Stylo Plume Executive Noir',
          description: 'Un instrument d\'écriture élégant pour les signatures importantes et la prise de notes de prestige. Fabriqué à la main avec une précision chirurgicale.',
          price: 89.00,
          category: 'Écriture',
          image_url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&q=80&w=800',
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1565538412225-3c73f288a75c?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&q=80&w=800'
          ]),
          features: JSON.stringify(['Plume en or 14 carats', 'Corps en résine précieuse', 'Rechargeable', 'Livré dans un coffret en bois']),
          stock: 25
        },
        {
          name: 'Pack de Papier Recyclé A4',
          description: 'Papier de haute qualité respectueux de l\'environnement, idéal pour toutes vos impressions professionnelles.',
          price: 6.50,
          category: 'Papeterie',
          image_url: 'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&q=80&w=800',
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1603484477859-abe6a73f9366?auto=format&fit=crop&q=80&w=800'
          ]),
          features: JSON.stringify(['80g/m²', 'Blancheur naturelle', 'Certifié FSC', 'Sans chlore']),
          stock: 150
        },
        {
          name: 'Moniteur 4K 27 pouces Pro',
          description: 'Écran ultra-haute définition pour une clarté exceptionnelle et un espace de travail étendu. Parfait pour les graphistes et analystes.',
          price: 429.00,
          category: 'Informatique',
          image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800',
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1551645120-d70bfe84c826?auto=format&fit=crop&q=80&w=800'
          ]),
          features: JSON.stringify(['Dalle IPS Delta E < 2', 'HDR 400', 'Connectique USB-C Power Delivery', 'Bords ultra-fins']),
          stock: 8
        },
        {
          name: 'Organiseur de Bureau Bambou',
          description: 'Gardez votre espace de travail impeccable avec cet élégant organiseur en bois naturel de bambou.',
          price: 24.99,
          category: 'Classement',
          image_url: 'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?auto=format&fit=crop&q=80&w=800',
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1616627547584-bf28cee262db?auto=format&fit=crop&q=80&w=800'
          ]),
          features: JSON.stringify(['Matériau durable', 'Plusieurs compartiments', 'Design zen', 'Anti-dérapant']),
          stock: 40
        },
        {
          name: 'Lampe de Bureau LED Smart',
          description: 'Éclairage modulable avec contrôle de la température de couleur et recharge sans fil intégrée pour smartphone.',
          price: 55.00,
          category: 'Mobilier',
          image_url: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=800',
          images: JSON.stringify([
            'https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800'
          ]),
          features: JSON.stringify(['Gradateur tactile', 'Port de charge USB-C', 'Mode lecture', 'Bras articulé à 360°']),
          stock: 15
        }
      ];

      for (const product of defaultProducts) {
        await connection.query(
          `INSERT INTO products (name, description, price, category, image_url, images, features, stock, available) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [product.name, product.description, product.price, product.category, 
           product.image_url, product.images, product.features, product.stock, true]
        );
      }
      console.log('Default products inserted');
    }

    console.log('✅ Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase()
  .then(() => {
    console.log('Database setup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });

