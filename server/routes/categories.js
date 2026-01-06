import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT id, name FROM categories ORDER BY name'
    );

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create category
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const categoryName = name.trim();

    // Check if category already exists
    const [existing] = await pool.query(
      'SELECT id FROM categories WHERE name = ?',
      [categoryName]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    // Insert new category
    const [result] = await pool.query(
      'INSERT INTO categories (name) VALUES (?)',
      [categoryName]
    );

    const [newCategory] = await pool.query(
      'SELECT id, name FROM categories WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newCategory[0]);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const categoryName = name.trim();

    // Check if category exists and get old name
    const [existing] = await pool.query(
      'SELECT id, name FROM categories WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const oldCategoryName = existing[0].name;

    // Check if another category with the same name exists
    const [duplicate] = await pool.query(
      'SELECT id FROM categories WHERE name = ? AND id != ?',
      [categoryName, id]
    );

    if (duplicate.length > 0) {
      return res.status(400).json({ error: 'Category name already exists' });
    }

    // Update category
    await pool.query(
      'UPDATE categories SET name = ? WHERE id = ?',
      [categoryName, id]
    );

    // Update all products with the old category name to the new name
    if (oldCategoryName !== categoryName) {
      await pool.query(
        'UPDATE products SET category = ? WHERE category = ?',
        [categoryName, oldCategoryName]
      );
    }

    const [updatedCategory] = await pool.query(
      'SELECT id, name FROM categories WHERE id = ?',
      [id]
    );

    res.json(updatedCategory[0]);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const [existing] = await pool.query(
      'SELECT id, name FROM categories WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if any products use this category
    const [products] = await pool.query(
      'SELECT COUNT(*) as count FROM products WHERE category = ?',
      [existing[0].name]
    );

    if (products[0].count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category. Some products are using it. Please reassign products first.' 
      });
    }

    // Delete category
    await pool.query(
      'DELETE FROM categories WHERE id = ?',
      [id]
    );

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

