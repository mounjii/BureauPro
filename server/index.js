import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import userRoutes from './routes/users.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import uploadRoutes from './routes/upload.js';
import pool from './db.js';
import initDatabase from './initDb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local for local development, use process.env for production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config(); // Use environment variables in production
}

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for production deployments (handles HTTPS properly)
app.set('trust proxy', 1);

// Log startup configuration
console.log('🔧 Server startup configuration:');
console.log('   PORT:', PORT);
console.log('   NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('   Database connection variables:');
console.log('     MYSQL_PUBLIC_URL:', process.env.MYSQL_PUBLIC_URL ? '✅ Set' : '❌ Not set');
console.log('     CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Not set');

// Middleware
// CORS configuration for production deployment
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In production, only allow HTTPS origins
    if (process.env.NODE_ENV === 'production') {
      // Allow all HTTPS origins in production
      if (origin.startsWith('https://')) {
        return callback(null, true);
      }
      // Reject non-HTTPS origins in production for security
      return callback(new Error('HTTPS required in production'), false);
    }
    
    // In development, allow localhost and all origins for testing
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

// Database initialization endpoint (one-time use)
app.post('/api/init-db', async (req, res) => {
  try {
    console.log('🔄 Database initialization requested');
    await initDatabase();
    res.json({ 
      status: 'success', 
      message: 'Database initialized successfully',
      admin: {
        email: 'admin@bureaupro.com',
        password: 'admin123'
      }
    });
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Database initialization failed',
      error: error.message 
    });
  }
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
// Try multiple possible paths for dist folder (different deployment environments may use different working directories)
const possibleDistPaths = [
  path.join(__dirname, '..', 'dist'),  // Standard: server/../dist
  path.join(process.cwd(), 'dist'),     // Current working directory
  path.resolve('dist'),                 // Absolute from cwd
];

let distPath = null;
for (const possiblePath of possibleDistPaths) {
  if (fs.existsSync(possiblePath)) {
    distPath = possiblePath;
    console.log('✅ Found dist directory at:', distPath);
    break;
  }
}

if (!distPath) {
  distPath = path.join(__dirname, '..', 'dist'); // Default fallback
  console.error('❌ Dist directory not found in any expected location!');
  console.error('   Tried:', possibleDistPaths);
  console.error('   Using fallback:', distPath);
  console.error('   Current working directory:', process.cwd());
  console.error('   __dirname:', __dirname);
  console.error('   Run "npm run build" to create the dist folder');
} else {
  // Check dist directory contents
  const files = fs.readdirSync(distPath);
  console.log('📦 Dist directory contents:', files);
  if (fs.existsSync(path.join(distPath, 'assets'))) {
    const assets = fs.readdirSync(path.join(distPath, 'assets'));
    console.log('📦 Assets directory contents:', assets);
  } else {
    console.warn('⚠️ Assets subdirectory not found in dist folder');
  }
}

// Middleware to log static file requests for debugging (before express.static)
app.use((req, res, next) => {
  // Log requests for static assets
  if (req.path.startsWith('/assets/') || req.path.match(/\.(js|css|json|svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$/)) {
    const filePath = path.join(distPath, req.path);
    const exists = fs.existsSync(filePath);
    console.log(`📄 Static file request: ${req.path} - ${exists ? '✅ Found' : '❌ Not found'}`);
    if (!exists) {
      console.log(`   Expected path: ${filePath}`);
      console.log(`   Dist directory exists: ${fs.existsSync(distPath)}`);
      if (fs.existsSync(distPath)) {
        const distContents = fs.readdirSync(distPath);
        console.log(`   Dist contents: ${distContents.join(', ')}`);
        if (fs.existsSync(path.join(distPath, 'assets'))) {
          const assetsContents = fs.readdirSync(path.join(distPath, 'assets'));
          console.log(`   Assets contents: ${assetsContents.join(', ')}`);
        }
      }
    }
  }
  next();
});

// Serve static assets with proper MIME types and CORS headers
// This middleware will serve files from dist/ and call next() if file not found
// Exclude index.html so our custom route can handle it with asset path fixing
app.use(express.static(distPath, {
  setHeaders: (res, filePath, stat) => {
    // Set proper MIME types for different file extensions
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (filePath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    } else if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    }
    
    // Ensure CORS headers for static assets (needed if crossorigin attribute is used)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Cache control for assets
    if (filePath.match(/\.(js|css)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  },
  // Don't serve index.html - let our custom route handle it
  index: false
}));

// Helper function to fix HTML with correct asset filenames
const fixHtmlAssetPaths = (htmlContent, distPath) => {
  try {
    // Read actual asset files from dist/assets
    const assetsPath = path.join(distPath, 'assets');
    console.log('🔧 Fixing HTML asset paths, checking:', assetsPath);
    
    if (fs.existsSync(assetsPath)) {
      const assetFiles = fs.readdirSync(assetsPath);
      console.log('📦 Available asset files:', assetFiles);
      
      const jsFile = assetFiles.find(f => f.endsWith('.js') && f.startsWith('index-'));
      const cssFile = assetFiles.find(f => f.endsWith('.css') && f.startsWith('index-'));
      
      console.log('📄 Found JS file:', jsFile);
      console.log('📄 Found CSS file:', cssFile);
      
      if (jsFile && cssFile) {
        // Replace old hardcoded filenames with actual ones
        // Match patterns like: src="/assets/index-XXX.js" or href="/assets/index-XXX.css"
        let fixedHtml = htmlContent;
        let changed = false;
        
        // Replace JS file references (in src attributes)
        const jsPattern = /src=["']\/assets\/index-[A-Za-z0-9_-]+\.js["']/g;
        const jsReplacement = `src="/assets/${jsFile}"`;
        if (fixedHtml.match(jsPattern)) {
          fixedHtml = fixedHtml.replace(jsPattern, jsReplacement);
          changed = true;
          console.log(`✅ Replaced JS reference with: ${jsFile}`);
        }
        
        // Replace CSS file references (in href attributes)
        // Also remove crossorigin attribute from CSS links (not needed for same-origin and can cause issues)
        const cssPattern = /<link[^>]*href=["']\/assets\/index-[A-Za-z0-9_-]+\.css["'][^>]*>/g;
        fixedHtml = fixedHtml.replace(cssPattern, (match) => {
          // Remove crossorigin attribute if present
          const withoutCrossorigin = match.replace(/\s+crossorigin=["'][^"']*["']/g, '');
          // Replace the href with the correct filename
          return withoutCrossorigin.replace(/href=["']\/assets\/index-[A-Za-z0-9_-]+\.css["']/, `href="/assets/${cssFile}"`);
        });
        if (fixedHtml !== htmlContent) {
          changed = true;
          console.log(`✅ Replaced CSS reference with: ${cssFile} (removed crossorigin if present)`);
        }
        
        if (changed) {
          console.log(`✅ Fixed HTML asset paths: JS=${jsFile}, CSS=${cssFile}`);
          return fixedHtml;
        } else {
          console.log('⚠️ No asset path replacements needed (already correct or pattern not matched)');
        }
      } else {
        console.warn('⚠️ Could not find JS or CSS files in assets directory');
      }
    } else {
      console.error('❌ Assets directory does not exist:', assetsPath);
    }
  } catch (error) {
    console.error('⚠️ Error fixing HTML asset paths:', error.message);
    console.error('   Stack:', error.stack);
  }
  return htmlContent;
};

// Serve index.html with asset path fixing for root and all non-API routes
const serveIndexHtml = (req, res) => {
  // Don't serve frontend for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      error: 'Route not found',
      path: req.path
    });
  }
  
  // Don't serve index.html for static asset requests
  // If express.static didn't find the file, return a plain 404 (not JSON)
  if (req.path.startsWith('/assets/') || 
      req.path.startsWith('/images/') || 
      req.path.match(/\.(js|css|json|svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$/)) {
    console.error(`❌ Static file not found: ${req.path}`);
    return res.status(404).send(`File not found: ${req.path}`);
  }
  
  // Serve frontend for all other routes (React Router)
  const indexPath = path.join(distPath, 'index.html');
  console.log(`📄 Serving index.html for route: ${req.path}`);
  
  // Read and fix HTML if needed
  if (fs.existsSync(indexPath)) {
    let htmlContent = fs.readFileSync(indexPath, 'utf-8');
    console.log('📄 Original HTML loaded, length:', htmlContent.length);
    
    // Check what asset references are in the HTML before fixing
    const jsMatch = htmlContent.match(/src=["']\/assets\/index-([A-Za-z0-9_-]+)\.js["']/);
    const cssMatch = htmlContent.match(/href=["']\/assets\/index-([A-Za-z0-9_-]+)\.css["']/);
    if (jsMatch) console.log('📄 HTML references JS:', jsMatch[1]);
    if (cssMatch) console.log('📄 HTML references CSS:', cssMatch[1]);
    
    htmlContent = fixHtmlAssetPaths(htmlContent, distPath);
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(htmlContent);
  }
  
  console.error('❌ index.html not found at:', indexPath);
  res.status(404).send('index.html not found');
};

// Serve index.html for root route
app.get('/', serveIndexHtml);

// Serve frontend index.html for all other non-API and non-asset routes (client-side routing)
app.get('*', serveIndexHtml);

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

