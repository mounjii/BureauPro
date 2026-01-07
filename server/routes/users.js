import express from 'express';
import pool from '../db.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, firstName, lastName } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with pending status
    const [result] = await pool.query(
      'INSERT INTO users (email, name, first_name, last_name, password, role, status, liked_products) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [email, name, firstName || null, lastName || null, hashedPassword, 'user', 'pending', JSON.stringify([])]
    );

    const userId = result.insertId;

    // Get created user (without password)
    const [users] = await pool.query(
      'SELECT id, email, name, first_name, last_name, role, status, liked_products, created_at FROM users WHERE id = ?',
      [userId]
    );

    const user = users[0];
    const userResponse = {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      status: user.status,
      permissions: user.permissions ? JSON.parse(user.permissions) : null,
      likedProducts: JSON.parse(user.liked_products || '[]'),
      createdAt: user.created_at
    };

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is approved (admin is always approved)
    if (user.role !== 'admin' && user.status !== 'approved') {
      // Return user info even if pending, so frontend can show waiting page
      const userResponse = {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        status: user.status,
        permissions: user.permissions ? JSON.parse(user.permissions) : null,
        likedProducts: JSON.parse(user.liked_products || '[]'),
        createdAt: user.created_at
      };
      return res.status(403).json({ 
        error: 'Account pending approval',
        status: user.status,
        user: userResponse
      });
    }

    // Return user without password
    const userResponse = {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      status: user.status,
      permissions: user.permissions ? JSON.parse(user.permissions) : null,
      likedProducts: JSON.parse(user.liked_products || '[]'),
      createdAt: user.created_at
    };

    res.json(userResponse);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Try to get user with permissions column, fallback if it doesn't exist
    let query = 'SELECT id, email, name, first_name, last_name, role, status, liked_products, created_at FROM users WHERE id = ?';
    
    // Check if permissions column exists
    try {
      const [columns] = await pool.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'permissions'`
      );
      
      if (columns.length > 0) {
        query = 'SELECT id, email, name, first_name, last_name, role, status, permissions, liked_products, created_at FROM users WHERE id = ?';
      }
    } catch (err) {
      // If check fails, use query without permissions
    }

    const [users] = await pool.query(query, [id]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    const userResponse = {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      status: user.status,
      permissions: user.permissions ? (typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions) : null,
      likedProducts: JSON.parse(user.liked_products || '[]'),
      createdAt: user.created_at
    };

    res.json(userResponse);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Update user liked products
router.patch('/:id/liked-products', async (req, res) => {
  try {
    const { id } = req.params;
    const { likedProducts } = req.body;

    if (!Array.isArray(likedProducts)) {
      return res.status(400).json({ error: 'likedProducts must be an array' });
    }

    await pool.query(
      'UPDATE users SET liked_products = ? WHERE id = ?',
      [JSON.stringify(likedProducts), id]
    );

    // Get updated user
    const [users] = await pool.query(
      'SELECT id, email, name, first_name, last_name, role, status, liked_products, created_at FROM users WHERE id = ?',
      [id]
    );

    const user = users[0];
    const userResponse = {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      status: user.status,
      permissions: user.permissions ? JSON.parse(user.permissions) : null,
      likedProducts: JSON.parse(user.liked_products || '[]'),
      createdAt: user.created_at
    };

    res.json(userResponse);
  } catch (error) {
    console.error('Update liked products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users (admin only)
router.get('/', async (req, res) => {
  try {
    // Check if permissions column exists
    let hasPermissionsColumn = false;
    try {
      const [columns] = await pool.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'permissions'`
      );
      hasPermissionsColumn = columns.length > 0;
    } catch (err) {
      console.log('Could not check permissions column');
    }

    // Query with or without permissions column
    let query = 'SELECT id, email, name, first_name, last_name, role, status, liked_products, created_at FROM users ORDER BY created_at DESC';
    if (hasPermissionsColumn) {
      query = 'SELECT id, email, name, first_name, last_name, role, status, permissions, liked_products, created_at FROM users ORDER BY created_at DESC';
    }
    
    const [users] = await pool.query(query);

    if (!users || users.length === 0) {
      return res.json([]);
    }

    const formattedUsers = users.map(user => {
      try {
        // Safely parse liked_products
        let likedProducts = [];
        if (user.liked_products) {
          if (typeof user.liked_products === 'string') {
            try {
              likedProducts = JSON.parse(user.liked_products);
            } catch (e) {
              console.warn('Failed to parse liked_products for user', user.id, e);
              likedProducts = [];
            }
          } else if (Array.isArray(user.liked_products)) {
            likedProducts = user.liked_products;
          }
        }

        return {
          id: String(user.id || ''),
          email: user.email || '',
          name: user.name || '',
          firstName: user.first_name || null,
          lastName: user.last_name || null,
          role: user.role || 'user',
          status: user.status || 'pending',
          permissions: (hasPermissionsColumn && user.permissions) ? (typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions) : null,
          likedProducts: likedProducts,
          createdAt: user.created_at ? new Date(user.created_at).toISOString() : new Date().toISOString()
        };
      } catch (parseError) {
        console.error('Error formatting user data:', parseError, user);
        // Return minimal user object on error
        return {
          id: String(user.id || ''),
          email: user.email || '',
          name: user.name || '',
          firstName: user.first_name || null,
          lastName: user.last_name || null,
          role: user.role || 'user',
          status: user.status || 'pending',
          permissions: null,
          likedProducts: [],
          createdAt: user.created_at ? new Date(user.created_at).toISOString() : new Date().toISOString()
        };
      }
    });

    res.json(formattedUsers);
  } catch (error) {
    console.error('Get users error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      code: error.code 
    });
  }
});

// Update user status and permissions (admin only)
router.patch('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, permissions } = req.body;

    // Check if user exists
    const [existingUsers] = await pool.query(
      'SELECT role, email FROM users WHERE id = ?',
      [id]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingUser = existingUsers[0];

    // Protect the default admin account
    if (existingUser.email === 'admin@bureaupro.com' && status === 'rejected') {
      return res.status(403).json({ error: 'Cannot reject the default admin account.' });
    }

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updateFields = ['status = ?'];
    const updateValues = [status];

    // Check if permissions column exists, create it if it doesn't
    let hasPermissionsColumn = false;
    try {
      const [columns] = await pool.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'permissions'`
      );
      hasPermissionsColumn = columns.length > 0;
      
      // Create column if it doesn't exist
      if (!hasPermissionsColumn && permissions) {
        await pool.query('ALTER TABLE users ADD COLUMN permissions TEXT');
        hasPermissionsColumn = true;
        console.log('Permissions column created');
      }
    } catch (err) {
      console.log('Could not check/create permissions column:', err);
    }

    // Always update permissions if provided, even if column was just created
    if (permissions) {
      if (!hasPermissionsColumn) {
        // Create column if it doesn't exist
        try {
          await pool.query('ALTER TABLE users ADD COLUMN permissions TEXT');
          hasPermissionsColumn = true;
          console.log('Permissions column created');
        } catch (err) {
          console.log('Could not create permissions column:', err);
        }
      }
      
      if (hasPermissionsColumn) {
        updateFields.push('permissions = ?');
        updateValues.push(JSON.stringify(permissions));
      }
    }

    updateValues.push(id);

    await pool.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Get updated user - query without permissions if column doesn't exist
    let userQuery = 'SELECT id, email, name, first_name, last_name, role, status, liked_products, created_at FROM users WHERE id = ?';
    if (hasPermissionsColumn) {
      userQuery = 'SELECT id, email, name, first_name, last_name, role, status, permissions, liked_products, created_at FROM users WHERE id = ?';
    }
    
    const [users] = await pool.query(userQuery, [id]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    const userResponse = {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      status: user.status,
      permissions: (hasPermissionsColumn && user.permissions) ? (typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions) : null,
      likedProducts: JSON.parse(user.liked_products || '[]'),
      createdAt: user.created_at
    };

    res.json(userResponse);
  } catch (error) {
    console.error('Approve user error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Update user settings (email and password)
router.patch('/:id/settings', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, currentPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ error: 'Current password is required' });
    }

    // Check if user exists
    const [users] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    // Check if new email is already taken by another user (if email is being changed)
    if (email && email !== user.email) {
      const [existingUsers] = await pool.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, id]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Build update query - ensure we're updating the existing user, not creating a new one
    const updateFields = [];
    const updateValues = [];

    if (email && email !== user.email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No changes to update' });
    }

    // Ensure we're updating the specific user by ID
    updateValues.push(id);

    // Use UPDATE with explicit WHERE clause to ensure we update the correct user
    console.log(`[UPDATE SETTINGS] Updating user ID ${id} with fields: ${updateFields.join(', ')}`);
    const updateResult = await pool.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Verify the update was successful
    const affectedRows = updateResult[0]?.affectedRows || 0;
    console.log(`[UPDATE SETTINGS] Update result: ${affectedRows} row(s) affected`);
    
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'User not found or no changes applied' });
    }

    // Double-check: ensure no duplicate was created
    if (email && email !== user.email) {
      const [duplicateCheck] = await pool.query(
        'SELECT COUNT(*) as count FROM users WHERE email = ?',
        [email]
      );
      if (duplicateCheck[0]?.count > 1) {
        console.error(`[UPDATE SETTINGS] WARNING: Duplicate email detected after update: ${email}`);
        // Delete the duplicate (keep the one we just updated)
        await pool.query(
          'DELETE FROM users WHERE email = ? AND id != ?',
          [email, id]
        );
        console.log(`[UPDATE SETTINGS] Removed duplicate user with email: ${email}`);
      }
    }

    // Get updated user
    const [updatedUsers] = await pool.query(
      'SELECT id, email, name, first_name, last_name, role, status, liked_products, created_at FROM users WHERE id = ?',
      [id]
    );

    const updatedUser = updatedUsers[0];
    const userResponse = {
      id: updatedUser.id.toString(),
      email: updatedUser.email,
      name: updatedUser.name,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      role: updatedUser.role,
      status: updatedUser.status,
      permissions: null, // Will be populated if column exists
      likedProducts: JSON.parse(updatedUser.liked_products || '[]'),
      createdAt: updatedUser.created_at
    };

    // Check if permissions column exists
    try {
      const [columns] = await pool.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'permissions'`
      );
      if (columns.length > 0) {
        const [usersWithPerms] = await pool.query(
          'SELECT permissions FROM users WHERE id = ?',
          [id]
        );
        if (usersWithPerms[0] && usersWithPerms[0].permissions) {
          userResponse.permissions = typeof usersWithPerms[0].permissions === 'string' 
            ? JSON.parse(usersWithPerms[0].permissions) 
            : usersWithPerms[0].permissions;
        }
      }
    } catch (err) {
      // Permissions column doesn't exist, ignore
    }

    res.json(userResponse);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [users] = await pool.query(
      'SELECT role, email FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userToDelete = users[0];

    // If trying to delete an admin, check if it's the default admin or if it's the last admin
    if (userToDelete.role === 'admin') {
      // Protect the default admin account
      if (userToDelete.email === 'admin@bureaupro.com') {
        return res.status(403).json({ error: 'Cannot delete the default admin account (admin@bureaupro.com).' });
      }

      // Check if this is the last admin
      const [adminCount] = await pool.query(
        'SELECT COUNT(*) as count FROM users WHERE role = ?',
        ['admin']
      );

      if (adminCount[0].count <= 1) {
        return res.status(403).json({ error: 'Cannot delete the last admin. At least one admin must remain in the system.' });
      }
    }

    const [result] = await pool.query(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

