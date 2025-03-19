const express = require('express');
const db = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const stripeService = require('../services/stripe');

const router = express.Router();

// Get all vendors (admin only)
router.get('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const result = await db.query(`
      SELECT v.*, u.name, u.email
      FROM vendors v
      JOIN users u ON v.user_id = u.id
      ORDER BY v.created_at DESC
    `);

    res.status(200).json({
      success: true,
      vendors: result.rows
    });
  } catch (err) {
    console.error('Get vendors error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get vendors',
      error: err.message
    });
  }
});

// Get vendor details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is authorized (admin or the vendor themselves)
    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to vendor information'
      });
    }

    const result = await db.query(`
      SELECT v.*, u.name, u.email
      FROM vendors v
      JOIN users u ON v.user_id = u.id
      WHERE v.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      vendor: result.rows[0]
    });
  } catch (err) {
    console.error('Get vendor details error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get vendor details',
      error: err.message
    });
  }
});

// Start Stripe Connect onboarding for a vendor
router.post('/onboarding', authenticateToken, authorizeRole(['vendor']), async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get vendor record
    const vendorResult = await db.query(
      'SELECT * FROM vendors WHERE user_id = $1',
      [userId]
    );
    
    if (vendorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor record not found'
      });
    }
    
    const vendor = vendorResult.rows[0];
    
    // Get user record for email
    const userResult = await db.query(
      'SELECT email FROM users WHERE id = $1',
      [userId]
    );
    
    const userEmail = userResult.rows[0].email;
    
    // Get Stripe mode from platform settings
    const stripeMode = await stripeService.getStripeMode();
    console.log(`Creating Stripe Connect account in ${stripeMode.toUpperCase()} mode for ${vendor.business_name}`);
    
    // Get Stripe Connect type from platform settings
    const connectTypeResult = await db.query(
      'SELECT value FROM platform_settings WHERE key = $1',
      ['stripe_connect_type']
    );
    
    const connectType = connectTypeResult.rows.length > 0 
      ? connectTypeResult.rows[0].value 
      : 'express';
    
    // Create or retrieve Stripe account
    let stripeAccountId = vendor.stripe_account_id;
    
    if (!stripeAccountId) {
      // Create new Stripe account
      const account = await stripeService.createStripeAccount(vendor.business_name, userEmail);
      stripeAccountId = account.id;
      
      // Save the Stripe account ID to the database
      await db.query(
        'UPDATE vendors SET stripe_account_id = $1, status = $2 WHERE id = $3',
        [stripeAccountId, 'pending', vendor.id]
      );
    }
    
    // Generate account link for onboarding
    const accountLinkUrl = await stripeService.getAccountLink(stripeAccountId);
    
    res.status(200).json({
      success: true,
      accountLinkUrl,
      stripeAccountId,
      connectType,
      mode: stripeMode
    });
  } catch (err) {
    console.error('Stripe onboarding error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate Stripe onboarding',
      error: err.message
    });
  }
});

// Check Stripe account status
router.get('/stripe-status', authenticateToken, authorizeRole(['vendor']), async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get vendor record
    const vendorResult = await db.query(
      'SELECT * FROM vendors WHERE user_id = $1',
      [userId]
    );
    
    if (vendorResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor record not found'
      });
    }
    
    const vendor = vendorResult.rows[0];
    
    if (!vendor.stripe_account_id) {
      return res.status(400).json({
        success: false,
        message: 'Stripe onboarding not initiated',
        onboardingComplete: false
      });
    }
    
    // Get Stripe mode
    const stripeMode = await stripeService.getStripeMode();
    
    // Check Stripe account status
    const accountStatus = await stripeService.getStripeAccountStatus(vendor.stripe_account_id);
    
    // Update onboarding status if needed
    if (accountStatus.charges_enabled && !vendor.stripe_onboarding_complete) {
      await db.query(
        'UPDATE vendors SET stripe_onboarding_complete = TRUE, status = $1 WHERE id = $2',
        ['active', vendor.id]
      );
    }
    
    res.status(200).json({
      success: true,
      stripeAccountId: vendor.stripe_account_id,
      onboardingComplete: accountStatus.charges_enabled,
      detailsSubmitted: accountStatus.details_submitted,
      payoutsEnabled: accountStatus.payouts_enabled,
      mode: stripeMode,
      status: vendor.status || 'pending'
    });
  } catch (err) {
    console.error('Check Stripe status error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to check Stripe account status',
      error: err.message
    });
  }
});

// Update vendor commission rate (admin only)
router.patch('/:id/commission', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { commissionRate } = req.body;
    
    if (commissionRate < 0 || commissionRate > 100) {
      return res.status(400).json({
        success: false,
        message: 'Commission rate must be between 0 and 100'
      });
    }
    
    const result = await db.query(
      'UPDATE vendors SET commission_rate = $1 WHERE id = $2 RETURNING *',
      [commissionRate, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Commission rate updated successfully',
      vendor: result.rows[0]
    });
  } catch (err) {
    console.error('Update commission error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update commission rate',
      error: err.message
    });
  }
});

// Get vendor sales statistics
router.get('/stats/sales', authenticateToken, authorizeRole(['vendor', 'admin']), async (req, res) => {
  try {
    let vendorId;
    
    // If admin and vendorId specified in query, use that, otherwise use the vendor's ID
    if (req.user.role === 'admin' && req.query.vendorId) {
      vendorId = req.query.vendorId;
    } else if (req.user.role === 'vendor') {
      // Get vendor ID from user ID
      const vendorResult = await db.query(
        'SELECT id FROM vendors WHERE user_id = $1',
        [req.user.id]
      );
      
      if (vendorResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Vendor record not found'
        });
      }
      
      vendorId = vendorResult.rows[0].id;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to vendor statistics'
      });
    }
    
    // Get total sales
    const salesResult = await db.query(
      'SELECT SUM(total_amount) as total_sales, COUNT(*) as order_count FROM orders WHERE vendor_id = $1 AND status = $2',
      [vendorId, 'paid']
    );
    
    // Get total commission
    const commissionResult = await db.query(
      'SELECT SUM(commission_amount) as total_commission FROM orders WHERE vendor_id = $1 AND status = $2',
      [vendorId, 'paid']
    );
    
    // Get recent orders
    const recentOrdersResult = await db.query(`
      SELECT o.*, u.name as customer_name
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      WHERE o.vendor_id = $1
      ORDER BY o.created_at DESC
      LIMIT 5
    `, [vendorId]);
    
    res.status(200).json({
      success: true,
      stats: {
        totalSales: salesResult.rows[0].total_sales || 0,
        orderCount: parseInt(salesResult.rows[0].order_count) || 0,
        totalCommission: commissionResult.rows[0].total_commission || 0,
        recentOrders: recentOrdersResult.rows
      }
    });
  } catch (err) {
    console.error('Get vendor stats error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get vendor statistics',
      error: err.message
    });
  }
});

module.exports = router;
