const express = require('express');
const db = require('../db');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes in this file require admin authorization
router.use(authenticateToken);
router.use(authorizeAdmin);

/**
 * Get platform analytics data
 * Includes: total users, vendors, products, orders, revenue
 */
router.get('/analytics', async (req, res) => {
  try {
    // Get total users
    const usersResult = await db.query(
      'SELECT role, COUNT(*) FROM users GROUP BY role'
    );
    
    // Get total products
    const productsResult = await db.query(
      'SELECT COUNT(*) FROM products'
    );
    
    // Get total orders
    const ordersResult = await db.query(
      'SELECT COUNT(*), SUM(total_amount) as total FROM orders'
    );
    
    // Format the analytics data
    const analytics = {
      users: {
        total: 0,
        customers: 0,
        vendors: 0,
        admins: 0
      },
      products: parseInt(productsResult.rows[0]?.count || 0),
      orders: parseInt(ordersResult.rows[0]?.count || 0),
      revenue: parseFloat(ordersResult.rows[0]?.sum || 0)
    };
    
    // Process user counts by role
    usersResult.rows.forEach(row => {
      analytics.users.total += parseInt(row.count);
      
      if (row.role === 'customer') {
        analytics.users.customers = parseInt(row.count);
      } else if (row.role === 'vendor') {
        analytics.users.vendors = parseInt(row.count);
      } else if (row.role === 'admin') {
        analytics.users.admins = parseInt(row.count);
      }
    });
    
    res.status(200).json({
      success: true,
      analytics
    });
  } catch (err) {
    console.error('Get admin analytics error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get analytics data',
      error: err.message
    });
  }
});

/**
 * Get all vendors with status and sales data
 */
router.get('/vendors', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT v.*, u.email, u.name, u.created_at,
             COUNT(DISTINCT p.id) as product_count,
             COUNT(DISTINCT o.id) as order_count,
             SUM(o.total_amount) as total_sales
      FROM vendors v
      JOIN users u ON v.user_id = u.id
      LEFT JOIN products p ON p.vendor_id = v.id
      LEFT JOIN orders o ON o.vendor_id = v.id
      GROUP BY v.id, u.id
      ORDER BY v.id
    `);
    
    res.status(200).json({
      success: true,
      vendors: result.rows
    });
  } catch (err) {
    console.error('Get admin vendors error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get vendors data',
      error: err.message
    });
  }
});

/**
 * Get all products with vendor information
 */
router.get('/products', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.*, v.business_name as vendor_name, u.name as vendor_owner
      FROM products p
      JOIN vendors v ON p.vendor_id = v.id
      JOIN users u ON v.user_id = u.id
      ORDER BY p.created_at DESC
    `);
    
    res.status(200).json({
      success: true,
      products: result.rows
    });
  } catch (err) {
    console.error('Get admin products error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get products data',
      error: err.message
    });
  }
});

/**
 * Get all transactions/orders with details
 */
router.get('/transactions', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT o.*, u.name as customer_name, u.email as customer_email,
             v.business_name as vendor_name
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      JOIN vendors v ON o.vendor_id = v.id
      ORDER BY o.created_at DESC
    `);
    
    res.status(200).json({
      success: true,
      transactions: result.rows
    });
  } catch (err) {
    console.error('Get admin transactions error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get transactions data',
      error: err.message
    });
  }
});

/**
 * Get/Update platform commission settings
 */
router.get('/commission', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM platform_settings WHERE key = $1',
      ['commission_rate']
    );
    
    let commissionRate = 10; // Default commission rate (10%)
    
    if (result.rows.length > 0) {
      commissionRate = parseFloat(result.rows[0].value);
    } else {
      // Create default commission rate setting if it doesn't exist
      await db.query(
        'INSERT INTO platform_settings (key, value) VALUES ($1, $2)',
        ['commission_rate', commissionRate.toString()]
      );
    }
    
    res.status(200).json({
      success: true,
      commission: {
        rate: commissionRate
      }
    });
  } catch (err) {
    console.error('Get commission settings error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get commission settings',
      error: err.message
    });
  }
});

/**
 * Update platform commission rate
 */
router.post('/commission', async (req, res) => {
  try {
    const { rate } = req.body;
    
    // Validate rate
    if (typeof rate !== 'number' || rate < 0 || rate > 100) {
      return res.status(400).json({
        success: false,
        message: 'Commission rate must be a number between 0 and 100'
      });
    }
    
    // Update commission rate
    await db.query(
      'UPDATE platform_settings SET value = $1 WHERE key = $2',
      [rate.toString(), 'commission_rate']
    );
    
    res.status(200).json({
      success: true,
      message: 'Commission rate updated successfully',
      commission: {
        rate
      }
    });
  } catch (err) {
    console.error('Update commission settings error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update commission settings',
      error: err.message
    });
  }
});

/**
 * Update vendor status (approve/suspend)
 */
router.patch('/vendors/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!['active', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be active, suspended, or pending'
      });
    }
    
    // Update vendor status
    const result = await db.query(
      'UPDATE vendors SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Vendor status updated successfully',
      vendor: result.rows[0]
    });
  } catch (err) {
    console.error('Update vendor status error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update vendor status',
      error: err.message
    });
  }
});

/**
 * Feature or unfeature a product
 */
router.patch('/products/:id/feature', async (req, res) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;
    
    // Validate featured
    if (typeof featured !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Featured must be a boolean value'
      });
    }
    
    // Update product featured status
    const result = await db.query(
      'UPDATE products SET featured = $1 WHERE id = $2 RETURNING *',
      [featured, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Product featured status updated successfully',
      product: result.rows[0]
    });
  } catch (err) {
    console.error('Update product featured status error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update product featured status',
      error: err.message
    });
  }
});

module.exports = router;