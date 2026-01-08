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

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);

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

// Database initialization endpoint (one-time use)
app.post('/api/init-db', async (req, res) => {
  try {
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
          return res.json({ 
            success: true, 
            message: 'Database already initialized',
            alreadyInitialized: true 
          });
        }
      }
    } catch (checkError) {
      // Table doesn't exist, continue with initialization
      console.log('Tables do not exist, initializing database...');
    }

    // Import and run initDb
    const { default: initDatabase } = await import('./initDb.js');
    await initDatabase();
    
    res.json({ 
      success: true, 
      message: 'Database initialized successfully',
      alreadyInitialized: false 
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 API endpoints available at http://0.0.0.0:${PORT}/api`);
});

