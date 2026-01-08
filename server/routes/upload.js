import express from 'express';
import multer from 'multer';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

// Load .env.local for local development, use process.env for production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config(); // Use environment variables in production
}

const router = express.Router();

// Configure Cloudinary with validation
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Cloudinary configuration missing!');
  console.error('CLOUDINARY_CLOUD_NAME:', cloudName ? '✅ Set (' + cloudName + ')' : '❌ Missing');
  console.error('CLOUDINARY_API_KEY:', apiKey ? '✅ Set (****' + apiKey.slice(-4) + ')' : '❌ Missing');
  console.error('CLOUDINARY_API_SECRET:', apiSecret ? '✅ Set (****' + apiSecret.slice(-4) + ')' : '❌ Missing');
} else {
  console.log('✅ Cloudinary configured successfully');
  console.log('   Cloud Name:', cloudName);
  console.log('   API Key:', '****' + apiKey.slice(-4));
  console.log('   API Secret:', '****' + apiSecret.slice(-4));
}

cloudinary.v2.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

// Configure multer with Cloudinary storage
let storage;
if (cloudName && apiKey && apiSecret) {
  try {
    storage = new CloudinaryStorage({
      cloudinary: cloudinary.v2,
      params: async (req, file) => {
        console.log('📁 Preparing upload to folder: test.bureaupro');
        return {
          folder: 'test.bureaupro', // Folder in Cloudinary
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' }, // Max size
            { quality: 'auto' }, // Auto optimize quality
            { fetch_format: 'auto' } // Auto format (webp when possible)
          ],
        };
      },
    });
    console.log('✅ CloudinaryStorage configured successfully');
  } catch (error) {
    console.error('❌ Error creating CloudinaryStorage:', error);
    console.error('   This will prevent file uploads from working.');
    // Don't throw - let the route handle the error when upload is attempted
  }
} else {
  console.warn('⚠️ CloudinaryStorage not initialized - Cloudinary credentials missing');
}

// File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Seules les images (JPEG, PNG, GIF, WEBP) sont autorisées'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  console.error('🔴 Multer error handler triggered:', err);
  
  if (err instanceof multer.MulterError) {
    console.error('Multer error code:', err.code);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message} (code: ${err.code})` });
  }
  if (err) {
    console.error('Upload middleware error:', err);
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    
    // Check for Cloudinary-specific errors
    if (err.message && err.message.includes('cloudinary')) {
      console.error('❌ Cloudinary error detected!');
    }
    
    return res.status(400).json({ error: err.message || 'Upload failed' });
  }
  next();
};

// Single image upload
router.post('/single', (req, res, next) => {
  console.log('📤 Upload request received');
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Origin:', req.headers.origin);
  
  // Check if Cloudinary is configured
  if (!cloudName || !apiKey || !apiSecret) {
    console.error('❌ Cloudinary not configured!');
    console.error('Environment check:');
    console.error('  NODE_ENV:', process.env.NODE_ENV);
    console.error('  CLOUDINARY_CLOUD_NAME:', cloudName ? 'Set' : 'Missing');
    console.error('  CLOUDINARY_API_KEY:', apiKey ? 'Set' : 'Missing');
    console.error('  CLOUDINARY_API_SECRET:', apiSecret ? 'Set' : 'Missing');
    return res.status(500).json({ 
      error: 'Cloudinary configuration missing. Please check server environment variables.',
      details: 'Ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in environment variables.'
    });
  }
  
  // Check if storage is initialized
  if (!storage) {
    console.error('❌ CloudinaryStorage not initialized!');
    return res.status(500).json({ 
      error: 'Upload service not initialized. Please check server logs.',
      details: 'CloudinaryStorage failed to initialize. Check Cloudinary credentials.'
    });
  }
  
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('❌ Multer upload error:', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      
      // More specific error messages
      if (err.message && err.message.includes('cloudinary')) {
        return res.status(500).json({ 
          error: 'Cloudinary upload failed',
          details: 'Please check Cloudinary configuration and credentials in environment variables.',
          message: err.message
        });
      }
      
      return handleMulterError(err, req, res, next);
    }
    
    try {
      if (!req.file) {
        console.error('❌ No file in request');
        console.log('Request body keys:', Object.keys(req.body));
        console.log('Request files:', req.files);
        console.log('Content-Type:', req.headers['content-type']);
        return res.status(400).json({ 
          error: 'Aucun fichier uploadé',
          details: 'Ensure the form field name is "image" and Content-Type is multipart/form-data'
        });
      }

      console.log('✅ File received:', req.file.originalname);
      console.log('📁 File size:', req.file.size);
      console.log('📁 Mime type:', req.file.mimetype);
      console.log('📁 Cloudinary path:', req.file.path);
      console.log('📁 Cloudinary public_id:', req.file.public_id);
      console.log('📁 Full req.file object:', JSON.stringify(req.file, null, 2));

      // Cloudinary returns the URL in req.file.path or secure_url
      const imageUrl = req.file.path || req.file.secure_url || req.file.url;
      if (!imageUrl) {
        console.error('❌ No image URL in req.file');
        console.error('req.file keys:', Object.keys(req.file));
        console.error('Full req.file:', JSON.stringify(req.file, null, 2));
        return res.status(500).json({ 
          error: 'Upload succeeded but no URL returned from Cloudinary',
          details: 'Cloudinary upload completed but URL is missing. Check Cloudinary dashboard and server logs.',
          fileInfo: {
            originalname: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype,
            keys: Object.keys(req.file)
          }
        });
      }
      
      // Ensure URL is HTTPS
      const secureUrl = imageUrl.startsWith('http://') 
        ? imageUrl.replace('http://', 'https://') 
        : imageUrl;
      
      console.log('✅ Upload successful, imageUrl:', secureUrl);
      res.json({ imageUrl: secureUrl });
    } catch (error) {
      console.error('❌ Upload processing error:', error);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      res.status(500).json({ 
        error: 'Erreur lors de l\'upload: ' + (error.message || 'Unknown error'),
        details: process.env.NODE_ENV !== 'production' ? error.stack : 'Check server logs for details'
      });
    }
  });
});

// Multiple images upload
router.post('/multiple', upload.array('images', 10), handleMulterError, (req, res) => {
  try {
    console.log('📤 Multiple upload request received');
    
    if (!req.files || req.files.length === 0) {
      console.error('❌ No files in request');
      return res.status(400).json({ error: 'Aucun fichier uploadé' });
    }

    console.log(`✅ ${req.files.length} file(s) received`);

    // Cloudinary returns URLs in req.files[].path
    const imageUrls = req.files.map(file => file.path);
    console.log('✅ Upload successful:', imageUrls);
    res.json({ imageUrls });
  } catch (error) {
    console.error('❌ Upload error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Erreur lors de l\'upload: ' + (error.message || 'Unknown error') });
  }
});

export default router;
