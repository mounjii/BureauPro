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
    const { name, description, price, category, imageUrl, images, features, stock, available } = req.body;

    // Check if product exists
    const [existingProducts] = await pool.query(
      'SELECT id FROM products WHERE id = ?',
      [id]
    );

    if (existingProducts.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await pool.query(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, category = ?, image_url = ?, 
           images = ?, features = ?, stock = ?, available = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name,
        description,
        price,
        category,
        imageUrl,
        JSON.stringify(images || []),
        JSON.stringify(features || []),
        stock || 0,
        available !== undefined ? available : true,
        id
      ]
    );

    // Get updated product
    const [products] = await pool.query(
      'SELECT * FROM products WHERE id = ?',
      [id]
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

    res.json(formattedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
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

