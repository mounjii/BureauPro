import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const [products] = await pool.query(
      'SELECT * FROM products ORDER BY created_at DESC'
    );

    const formattedProducts = products.map(product => ({
      id: product.id.toString(),
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      category: product.category,
      imageUrl: product.image_url,
      images: JSON.parse(product.images || '[]'),
      features: JSON.parse(product.features || '[]'),
      stock: product.stock,
      available: product.available !== null && product.available !== undefined ? Boolean(product.available) : true
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = products[0];
    const formattedProduct = {
      id: product.id.toString(),
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      category: product.category,
      imageUrl: product.image_url,
      images: JSON.parse(product.images || '[]'),
      features: JSON.parse(product.features || '[]'),
      stock: product.stock,
      available: product.available !== null && product.available !== undefined ? Boolean(product.available) : true
    };

    res.json(formattedProduct);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create product
router.post('/', async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, images, features, stock, available } = req.body;

    if (!name || !description || price === undefined || !category || !imageUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [result] = await pool.query(
      `INSERT INTO products (name, description, price, category, image_url, images, features, stock, available) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description,
        price,
        category,
        imageUrl,
        JSON.stringify(images || []),
        JSON.stringify(features || []),
        stock || 0,
        available !== undefined ? available : true
      ]
    );

    const productId = result.insertId;

    // Get created product
    const [products] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [productId]
    );

    const product = products[0];
    const formattedProduct = {
      id: product.id.toString(),
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      category: product.category,
      imageUrl: product.image_url,
      images: JSON.parse(product.images || '[]'),
      features: JSON.parse(product.features || '[]'),
      stock: product.stock,
      available: product.available !== null && product.available !== undefined ? Boolean(product.available) : true
    };

    res.status(201).json(formattedProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure req.body exists
    if (!req.body) {
      return res.status(400).json({ error: 'Request body is required' });
    }
    
    // Remove id from updates if present (we use URL parameter)
    const updates = { ...req.body };
    delete updates.id;

    // Get existing product first
    const [existingProducts] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (existingProducts.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existingProduct = existingProducts[0];

    // Merge updates with existing product (frontend sends full product object)
    const name = updates.name !== undefined ? updates.name : existingProduct.name;
    const description = updates.description !== undefined ? updates.description : existingProduct.description;
    const price = updates.price !== undefined ? updates.price : existingProduct.price;
    const category = updates.category !== undefined ? updates.category : existingProduct.category;
    const imageUrl = updates.imageUrl !== undefined ? updates.imageUrl : existingProduct.image_url;
    
    // Handle images - can be array or string
    let imagesArray = [];
    if (updates.images !== undefined) {
      if (Array.isArray(updates.images)) {
        imagesArray = updates.images;
      } else if (typeof updates.images === 'string') {
        try {
          imagesArray = JSON.parse(updates.images);
        } catch {
          imagesArray = updates.images.split(',').map(url => url.trim()).filter(Boolean);
        }
      }
    } else {
      // Parse existing images
      try {
        imagesArray = existingProduct.images ? (typeof existingProduct.images === 'string' ? JSON.parse(existingProduct.images) : existingProduct.images) : [];
      } catch {
        imagesArray = [];
      }
    }

    // Handle features - can be array or string
    let featuresArray = [];
    if (updates.features !== undefined) {
      if (Array.isArray(updates.features)) {
        featuresArray = updates.features;
      } else if (typeof updates.features === 'string') {
        featuresArray = updates.features.split(',').map(f => f.trim()).filter(Boolean);
      }
    } else {
      // Parse existing features
      try {
        featuresArray = existingProduct.features ? (typeof existingProduct.features === 'string' ? JSON.parse(existingProduct.features) : existingProduct.features) : [];
      } catch {
        featuresArray = [];
      }
    }

    const stock = updates.stock !== undefined ? (parseInt(updates.stock) || 0) : (existingProduct.stock || 0);
    const available = updates.available !== undefined ? Boolean(updates.available) : (existingProduct.available !== null && existingProduct.available !== undefined ? Boolean(existingProduct.available) : true);

    // Validate merged values
    if (!name || !description || price === undefined || price === null || !category || !imageUrl) {
      console.error('Validation failed:', { name, description, price, category, imageUrl });
      return res.status(400).json({ 
        error: 'Missing required fields', 
        details: { name: !!name, description: !!description, price: price !== undefined && price !== null, category: !!category, imageUrl: !!imageUrl }
      });
    }

    // Ensure price is a valid number
    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) {
      return res.status(400).json({ error: 'Price must be a valid number', received: price });
    }

    // Prepare values for SQL query - ensure all types are correct
    const updateValues = [
      String(name || '').trim(),
      String(description || '').trim(),
      Number(priceNum),
      String(category || '').trim(),
      String(imageUrl || '').trim(),
      JSON.stringify(imagesArray || []),
      JSON.stringify(featuresArray || []),
      Number(parseInt(stock) || 0),
      Number(available ? 1 : 0), // Convert boolean to 0/1 for MySQL
      Number(parseInt(id))
    ];

    // Validate all values before query
    if (updateValues.some(v => v === null || v === undefined)) {
      console.error('❌ Null/undefined value in updateValues:', updateValues);
      return res.status(500).json({ error: 'Invalid data format', details: 'One or more values are null or undefined' });
    }

    console.log('✅ Updating product:', { 
      id, 
      name: String(name).substring(0, 50),
      price: priceNum,
      category,
      hasImageUrl: !!imageUrl,
      imagesCount: imagesArray.length,
      featuresCount: featuresArray.length,
      stock,
      available
    });

    // Update query - updated_at will be added by migration if needed
    // For now, we don't include it to avoid errors if column doesn't exist
    await pool.query(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, category = ?, image_url = ?, 
           images = ?, features = ?, stock = ?, available = ?
       WHERE id = ?`,
      updateValues
    );

    // Get updated product
    const [products] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found after update' });
    }

    const product = products[0];
    
    // Safely parse JSON fields
    let parsedImages = [];
    let parsedFeatures = [];
    try {
      parsedImages = product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : [];
    } catch (e) {
      console.warn('Error parsing images JSON:', e);
      parsedImages = [];
    }
    
    try {
      parsedFeatures = product.features ? (typeof product.features === 'string' ? JSON.parse(product.features) : product.features) : [];
    } catch (e) {
      console.warn('Error parsing features JSON:', e);
      parsedFeatures = [];
    }

    const formattedProduct = {
      id: product.id.toString(),
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      category: product.category,
      imageUrl: product.image_url,
      images: parsedImages,
      features: parsedFeatures,
      stock: product.stock,
      available: product.available !== null && product.available !== undefined ? Boolean(product.available) : true
    };

    res.json(formattedProduct);
  } catch (error) {
    console.error('❌ Update product error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error sqlState:', error.sqlState);
    console.error('Error sqlMessage:', error.sqlMessage);
    console.error('Error stack:', error.stack);
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    console.error('Product ID:', req.params.id);
    console.error('Request params:', req.params);
    
    // Check for database connection errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.message?.includes('getaddrinfo')) {
      return res.status(503).json({ 
        error: 'Database connection failed',
        message: 'Unable to connect to database. Please check database configuration.',
        details: 'Check Railway logs and ensure MYSQL_PUBLIC_URL is set correctly.'
      });
    }
    
    // Check for SQL errors
    if (error.code === 'ER_BAD_FIELD_ERROR' || error.code === 'ER_NO_SUCH_TABLE' || error.sqlState) {
      return res.status(500).json({ 
        error: 'Database error',
        message: error.sqlMessage || error.message,
        code: error.code,
        sqlState: error.sqlState
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      details: process.env.NODE_ENV !== 'production' ? error.stack : 'Check server logs for details'
    });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM products WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

