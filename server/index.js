import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/users.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import uploadRoutes from './routes/upload.js';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local for local development, use process.env for production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config(); // Use Railway/environment variables in production
}

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for Railway (handles HTTPS properly)
app.set('trust proxy', 1);

// Log startup configuration
console.log('🔧 Server startup configuration:');
console.log('   PORT:', PORT);
console.log('   NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('   Database connection variables:');
console.log('     MYSQL_PUBLIC_URL:', process.env.MYSQL_PUBLIC_URL ? '✅ Set' : '❌ Not set');
console.log('     CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Not set');

// Middleware
// CORS configuration for Railway deployment
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In production, allow Railway domain and HTTPS origins
    if (process.env.NODE_ENV === 'production') {
      // Allow all HTTPS origins in production (Railway handles domain)
      if (origin.startsWith('https://')) {
        return callback(null, true);
      }
      // Also allow Railway's internal network
      return callback(null, true);
    }
    
    // In development, allow localhost
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parser with increased limits for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers for HTTPS
app.use((req, res, next) => {
  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);

// API root (some clients ping /api)
app.get('/api', (req, res) => {
  res.json({ status: 'OK', message: 'BureauPro API root', endpoints: ['/api/health', '/api/users', '/api/products', '/api/categories', '/api/upload'] });
});

// Health check with database test
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'OK',
    message: 'BureauPro API is running',
    timestamp: new Date().toISOString(),
    database: 'unknown',
    cloudinary: 'unknown'
  };

  // Test database connection
  try {
    await pool.query('SELECT 1');
    health.database = 'connected';
  } catch (error) {
    health.database = `error: ${error.message}`;
    health.status = 'DEGRADED';
  }

  // Check Cloudinary configuration
  if (process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_SECRET) {
    health.cloudinary = 'configured';
  } else {
    health.cloudinary = 'not configured';
    health.status = 'DEGRADED';
  }

  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Database initialization endpoint (one-time use) - GET for easy browser access
app.get('/api/init-db', async (req, res) => {
  try {
    console.log('🔧 Database initialization requested...');
    
    // Check if database is already initialized by checking if users table exists
    try {
      const [tables] = await pool.query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
      `);
      
      if (tables.length > 0) {
        // Check if admin user exists
        const [users] = await pool.query('SELECT id FROM users WHERE email = ?', ['simo@bureaupro.com']);
        
        if (users.length > 0) {
          console.log('✅ Database already initialized');
          return res.json({ 
            success: true, 
            message: 'Database already initialized',
            alreadyInitialized: true 
          });
        }
      }
    } catch (checkError) {
      // Table doesn't exist, continue with initialization
      console.log('📋 Tables do not exist, initializing database...');
    }

    // Use pool connection directly for initialization
    const connection = await pool.getConnection();
    
    try {
      // Import bcrypt for password hashing
      const bcrypt = (await import('bcrypt')).default;
      
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
      console.log('✅ Users table ready');

      // Create categories table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Categories table ready');

      // Create products table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10, 2),
          category VARCHAR(255),
          image_url VARCHAR(500),
          images TEXT,
          features TEXT,
          stock INT DEFAULT 0,
          available BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category) REFERENCES categories(name) ON DELETE SET NULL
        )
      `);
      console.log('✅ Products table ready');

      // Check if admin user exists
      const [existingAdmins] = await connection.query('SELECT id FROM users WHERE email = ?', ['simo@bureaupro.com']);
      
      if (existingAdmins.length === 0) {
        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await connection.query(
          `INSERT INTO users (email, name, password, role, status, permissions) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          ['simo@bureaupro.com', 'Admin', hashedPassword, 'admin', 'approved', 
           JSON.stringify({ manageProducts: true, manageCategories: true, manageCollaborators: true, viewDashboard: true })]
        );
        console.log('✅ Admin user created');
      }

      // Insert default categories if they don't exist
      const defaultCategories = [
        { name: 'Bureaux', description: 'Bureaux de toutes tailles et styles' },
        { name: 'Chaises', description: 'Chaises ergonomiques et confortables' },
        { name: 'Étagères', description: 'Étagères et rangements' },
        { name: 'Accessoires', description: 'Accessoires de bureau' }
      ];

      for (const category of defaultCategories) {
        await connection.query(
          'INSERT IGNORE INTO categories (name, description) VALUES (?, ?)',
          [category.name, category.description]
        );
      }
      console.log('✅ Default categories ready');

      connection.release();
      
      console.log('✅ Database initialization completed successfully!');
      res.json({ 
        success: true, 
        message: 'Database initialized successfully',
        alreadyInitialized: false 
      });
    } catch (initError) {
      connection.release();
      throw initError;
    }
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
});

// Error handling middleware (must be last)
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    error: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });
});

// Serve frontend static files (after API routes)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Serve frontend index.html for all non-API routes (client-side routing)
app.get('*', (req, res) => {
  // Don't serve frontend for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      error: 'Route not found',
      path: req.path
    });
  }
  // Serve frontend for all other routes
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start server with error handling
console.log('🔄 Starting server...');
try {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server successfully started!`);
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`📡 API endpoints available at http://0.0.0.0:${PORT}/api`);
    console.log(`🌐 Health check: http://0.0.0.0:${PORT}/api/health`);
  });
  
  server.on('error', (error) => {
    console.error('❌ Server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`   Port ${PORT} is already in use!`);
    }
    process.exit(1);
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully...');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
} catch (error) {
  console.error('❌ Failed to start server:', error);
  console.error('   Error stack:', error.stack);
  process.exit(1);
}

