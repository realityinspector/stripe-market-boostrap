const express = require('express');
const db = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// Get all products (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { vendorId, search, minPrice, maxPrice, sort } = req.query;
    
    let query = `
      SELECT p.*, v.business_name as vendor_name
      FROM products p
      JOIN vendors v ON p.vendor_id = v.id
      WHERE p.active = TRUE
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
    // Apply filters
    if (vendorId) {
      query += ` AND p.vendor_id = $${paramIndex}`;
      queryParams.push(vendorId);
      paramIndex++;
    }
    
    if (search) {
      query += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    
    if (minPrice) {
      query += ` AND p.price >= $${paramIndex}`;
      queryParams.push(minPrice);
      paramIndex++;
    }
    
    if (maxPrice) {
      query += ` AND p.price <= $${paramIndex}`;
      queryParams.push(maxPrice);
      paramIndex++;
    }
    
    // Apply sorting
    if (sort === 'price_asc') {
      query += ` ORDER BY p.price ASC`;
    } else if (sort === 'price_desc') {
      query += ` ORDER BY p.price DESC`;
    } else if (sort === 'newest') {
      query += ` ORDER BY p.created_at DESC`;
    } else {
      query += ` ORDER BY p.name ASC`;
    }
    
    const result = await db.query(query, queryParams);
    
    res.status(200).json({
      success: true,
      products: result.rows
    });
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get products',
      error: err.message
    });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.query(`
      SELECT p.*, v.business_name as vendor_name, v.id as vendor_id
      FROM products p
      JOIN vendors v ON p.vendor_id = v.id
      WHERE p.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      product: result.rows[0]
    });
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get product',
      error: err.message
    });
  }
});

// Create a new product (vendor only)
router.post('/', authenticateToken, authorizeRole(['vendor']), async (req, res) => {
  try {
    const { name, description, price, imageUrl } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name and price are required'
      });
    }
    
    // Get vendor ID from user ID
    const vendorResult = await db.query(
      'SELECT id FROM vendors WHERE user_id = $1',
      [userId]
    );
    
    if (vendorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor record not found'
      });
    }
    
    const vendorId = vendorResult.rows[0].id;
    
    // Create product
    const result = await db.query(`
      INSERT INTO products (vendor_id, name, description, price, image_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [vendorId, name, description, price, imageUrl]);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: result.rows[0]
    });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: err.message
    });
  }
});

// Update a product (vendor only)
router.put('/:id', authenticateToken, authorizeRole(['vendor']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, imageUrl, active } = req.body;
    const userId = req.user.id;
    
    // Get vendor ID from user ID
    const vendorResult = await db.query(
      'SELECT id FROM vendors WHERE user_id = $1',
      [userId]
    );
    
    if (vendorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor record not found'
      });
    }
    
    const vendorId = vendorResult.rows[0].id;
    
    // Check if product exists and belongs to the vendor
    const productResult = await db.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );
    
    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (productResult.rows[0].vendor_id !== vendorId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this product'
      });
    }
    
    // Update product
    const result = await db.query(`
      UPDATE products
      SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        price = COALESCE($3, price),
        image_url = COALESCE($4, image_url),
        active = COALESCE($5, active)
      WHERE id = $6
      RETURNING *
    `, [name, description, price, imageUrl, active, id]);
    
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: result.rows[0]
    });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: err.message
    });
  }
});

// Delete a product (vendor only)
router.delete('/:id', authenticateToken, authorizeRole(['vendor']), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Get vendor ID from user ID
    const vendorResult = await db.query(
      'SELECT id FROM vendors WHERE user_id = $1',
      [userId]
    );
    
    if (vendorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor record not found'
      });
    }
    
    const vendorId = vendorResult.rows[0].id;
    
    // Check if product exists and belongs to the vendor
    const productResult = await db.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );
    
    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (productResult.rows[0].vendor_id !== vendorId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this product'
      });
    }
    
    // Delete product
    await db.query('DELETE FROM products WHERE id = $1', [id]);
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: err.message
    });
  }
});

// Get products by vendor
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;
    
    const result = await db.query(`
      SELECT p.*, v.business_name as vendor_name
      FROM products p
      JOIN vendors v ON p.vendor_id = v.id
      WHERE p.vendor_id = $1 AND p.active = TRUE
      ORDER BY p.created_at DESC
    `, [vendorId]);
    
    res.status(200).json({
      success: true,
      products: result.rows
    });
  } catch (err) {
    console.error('Get vendor products error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get vendor products',
      error: err.message
    });
  }
});

// Get all vendor products (additional route for testing)
router.get('/vendor', authenticateToken, authorizeRole(['vendor']), async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get vendor ID from user ID
    const vendorResult = await db.query(
      'SELECT id FROM vendors WHERE user_id = $1',
      [userId]
    );
    
    if (vendorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor record not found'
      });
    }
    
    const vendorId = vendorResult.rows[0].id;
    
    const result = await db.query(`
      SELECT p.*, v.business_name as vendor_name
      FROM products p
      JOIN vendors v ON p.vendor_id = v.id
      WHERE p.vendor_id = $1
      ORDER BY p.created_at DESC
    `, [vendorId]);
    
    res.status(200).json({
      success: true,
      products: result.rows
    });
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get vendor products',
      error: err.message
    });
  }
});

// Get vendor products (for vendor dashboard)
router.get('/my-products', authenticateToken, authorizeRole(['vendor']), async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get vendor ID from user ID
    const vendorResult = await db.query(
      'SELECT id FROM vendors WHERE user_id = $1',
      [userId]
    );
    
    if (vendorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor record not found'
      });
    }
    
    const vendorId = vendorResult.rows[0].id;
    
    const result = await db.query(`
      SELECT *
      FROM products
      WHERE vendor_id = $1
      ORDER BY created_at DESC
    `, [vendorId]);
    
    res.status(200).json({
      success: true,
      products: result.rows
    });
  } catch (err) {
    console.error('Get my products error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get products',
      error: err.message
    });
  }
});

module.exports = router;
