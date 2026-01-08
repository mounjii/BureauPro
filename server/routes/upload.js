import express from 'express';
import multer from 'multer';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

// Load .env.local for local development, use process.env for production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config(); // Use Railway/environment variables in production
}

const router = express.Router();

// Configure Cloudinary with validation
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Cloudinary configuration missing!');
  console.error('CLOUDINARY_CLOUD_NAME:', cloudName ? '✅ Set' : '❌ Missing');
  console.error('CLOUDINARY_API_KEY:', apiKey ? '✅ Set' : '❌ Missing');
  console.error('CLOUDINARY_API_SECRET:', apiSecret ? '✅ Set' : '❌ Missing');
} else {
  console.log('✅ Cloudinary configured');
}

cloudinary.v2.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

// Configure multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: async (req, file) => {
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
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  if (err) {
    console.error('Upload middleware error:', err);
    return res.status(400).json({ error: err.message || 'Upload failed' });
  }
  next();
};

// Single image upload
router.post('/single', upload.single('image'), handleMulterError, (req, res) => {
  try {
    console.log('📤 Upload request received');
    
    if (!req.file) {
      console.error('❌ No file in request');
      return res.status(400).json({ error: 'Aucun fichier uploadé' });
    }

    console.log('✅ File received:', req.file.originalname);
    console.log('📁 Cloudinary path:', req.file.path);

    // Cloudinary returns the URL in req.file.path
    const imageUrl = req.file.path;
    console.log('✅ Upload successful:', imageUrl);
    res.json({ imageUrl });
  } catch (error) {
    console.error('❌ Upload error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Erreur lors de l\'upload: ' + (error.message || 'Unknown error') });
  }
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
