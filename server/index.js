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

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
});

