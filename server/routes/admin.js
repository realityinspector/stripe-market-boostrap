const express = require('express');
const db = require('../db');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const stripeService = require('../services/stripe');

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

/**
 * Get Stripe Connect configuration
 */
router.get('/stripe-connect', async (req, res) => {
  try {
    // Get Stripe Connect settings from database
    const connectTypeResult = await db.query(
      'SELECT value FROM platform_settings WHERE key = $1',
      ['stripe_connect_type']
    );
    
    const stripeModeResult = await db.query(
      'SELECT value FROM platform_settings WHERE key = $1',
      ['stripe_mode']
    );
    
    const currencyResult = await db.query(
      'SELECT value FROM platform_settings WHERE key = $1',
      ['platform_currency']
    );
    
    // Default values
    let connectType = 'express';
    let stripeMode = await stripeService.getStripeMode();
    let currency = 'usd';
    
    // Use values from database if available
    if (connectTypeResult.rows.length > 0) {
      connectType = connectTypeResult.rows[0].value;
    }
    
    if (stripeModeResult.rows.length > 0) {
      stripeMode = stripeModeResult.rows[0].value;
    }
    
    if (currencyResult.rows.length > 0) {
      currency = currencyResult.rows[0].value;
    }
    
    res.status(200).json({
      success: true,
      stripeConnect: {
        connectType,
        mode: stripeMode,
        currency
      }
    });
  } catch (err) {
    console.error('Get Stripe Connect config error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get Stripe Connect configuration',
      error: err.message
    });
  }
});

/**
 * Update Stripe Connect configuration
 */
router.post('/stripe-connect', async (req, res) => {
  try {
    const { connectType, mode, currency } = req.body;
    
    // Validate connectType
    if (connectType && !['express', 'standard', 'custom'].includes(connectType)) {
      return res.status(400).json({
        success: false,
        message: 'Connect type must be express, standard, or custom'
      });
    }
    
    // Validate mode
    if (mode && !['test', 'live'].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: 'Mode must be test or live'
      });
    }
    
    // Validate currency
    if (currency && typeof currency !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Currency must be a valid ISO currency code'
      });
    }
    
    // Update settings in database
    if (connectType) {
      await db.query(
        'INSERT INTO platform_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
        ['stripe_connect_type', connectType]
      );
    }
    
    if (mode) {
      await db.query(
        'INSERT INTO platform_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
        ['stripe_mode', mode]
      );
    }
    
    if (currency) {
      await db.query(
        'INSERT INTO platform_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
        ['platform_currency', currency.toLowerCase()]
      );
    }
    
    res.status(200).json({
      success: true,
      message: 'Stripe Connect configuration updated successfully',
      stripeConnect: {
        connectType: connectType || 'express',
        mode: mode || 'test',
        currency: currency || 'usd'
      }
    });
  } catch (err) {
    console.error('Update Stripe Connect config error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update Stripe Connect configuration',
      error: err.message
    });
  }
});

/**
 * Get available Stripe Connect webhook events
 */
router.get('/webhook-events', async (req, res) => {
  try {
    // Categorized list of available webhook events for Stripe Connect
    const webhookEvents = {
      account: [
        'account.updated',
        'account.application.authorized',
        'account.application.deauthorized',
        'account.external_account.created',
        'account.external_account.deleted',
        'account.external_account.updated'
      ],
      payment: [
        'payment_intent.created',
        'payment_intent.succeeded',
        'payment_intent.payment_failed',
        'payment_intent.canceled',
        'payment_method.attached',
        'payment_method.detached',
        'payment_method.updated',
        'charge.succeeded',
        'charge.failed',
        'charge.refunded',
        'charge.dispute.created',
        'charge.dispute.updated',
        'charge.dispute.closed'
      ],
      customer: [
        'customer.created',
        'customer.updated',
        'customer.deleted',
        'customer.source.created',
        'customer.source.updated',
        'customer.source.deleted'
      ],
      transfers: [
        'transfer.created',
        'transfer.updated',
        'transfer.reversed',
        'transfer.failed'
      ],
      payouts: [
        'payout.created',
        'payout.updated',
        'payout.paid',
        'payout.failed'
      ],
      checkout: [
        'checkout.session.completed',
        'checkout.session.async_payment_succeeded',
        'checkout.session.async_payment_failed'
      ],
      products: [
        'product.created',
        'product.updated',
        'product.deleted',
        'price.created',
        'price.updated',
        'price.deleted'
      ],
      subscriptions: [
        'subscription.created',
        'subscription.updated',
        'subscription.deleted',
        'subscription.trial_will_end',
        'invoice.created',
        'invoice.updated',
        'invoice.paid',
        'invoice.payment_failed'
      ]
    };
    
    res.status(200).json({
      success: true,
      webhookEvents
    });
  } catch (err) {
    console.error('Get webhook events error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get webhook events',
      error: err.message
    });
  }
});

/**
 * Get all registered webhook endpoints
 */
router.get('/webhooks', async (req, res) => {
  try {
    // Get all webhook endpoints from database
    const result = await db.query(
      'SELECT * FROM webhook_endpoints ORDER BY created_at DESC'
    );
    
    // Use the webhooks endpoints API to get the latest status
    const mode = req.query.mode || 'test';
    let stripeKey;
    
    // Determine which Stripe key to use based on mode
    if (mode === 'test') {
      stripeKey = process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    } else if (mode === 'live') {
      stripeKey = process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    } else {
      // Default to the main secret key
      stripeKey = process.env.STRIPE_SECRET_KEY;
    }
    
    // Initialize Stripe with the appropriate key
    const stripe = require('stripe')(stripeKey);
    
    // Get all webhooks from Stripe API
    const stripeWebhooks = await stripe.webhookEndpoints.list({ limit: 100 });
    
    // Match database webhooks with Stripe webhooks for status
    const webhooks = result.rows.map(webhook => {
      const stripeWebhook = stripeWebhooks.data.find(sw => sw.id === webhook.stripe_webhook_id);
      
      return {
        ...webhook,
        // If we found a matching Stripe webhook, use its status
        active: stripeWebhook ? stripeWebhook.status === 'enabled' : false,
        events: stripeWebhook ? stripeWebhook.enabled_events : [],
        last_checked: new Date().toISOString()
      };
    });
    
    res.status(200).json({
      success: true,
      webhooks,
      mode
    });
  } catch (err) {
    console.error('Get admin webhooks error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get webhooks data',
      error: err.message
    });
  }
});

/**
 * Register a new webhook endpoint
 */
router.post('/webhooks', async (req, res) => {
  try {
    const { url, mode, events } = req.body;
    
    // Validate URL
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Webhook URL is required'
      });
    }
    
    // Validate events
    if (!events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one webhook event is required'
      });
    }
    
    // Validate mode
    if (!mode || !['test', 'live'].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: 'Mode must be test or live'
      });
    }
    
    // Determine which Stripe key to use based on mode
    let stripeKey;
    if (mode === 'test') {
      stripeKey = process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    } else if (mode === 'live') {
      stripeKey = process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    } else {
      // Default to the main secret key
      stripeKey = process.env.STRIPE_SECRET_KEY;
    }
    
    // Initialize Stripe with the appropriate key
    const stripe = require('stripe')(stripeKey);
    
    // Register the webhook endpoint with Stripe
    const webhook = await stripe.webhookEndpoints.create({
      url: url,
      enabled_events: events,
      description: `Marketplace webhook endpoint (${mode} mode)`
    });
    
    // Save the webhook to database
    const result = await db.query(
      'INSERT INTO webhook_endpoints (stripe_webhook_id, url, mode, secret, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [webhook.id, url, mode, webhook.secret, new Date()]
    );
    
    res.status(201).json({
      success: true,
      message: 'Webhook endpoint registered successfully',
      webhook: {
        ...result.rows[0],
        events: webhook.enabled_events
      }
    });
  } catch (err) {
    console.error('Register webhook error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to register webhook endpoint',
      error: err.message
    });
  }
});

/**
 * Update a webhook endpoint
 */
router.put('/webhooks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { events, status } = req.body;
    
    // Get webhook from database
    const dbResult = await db.query(
      'SELECT * FROM webhook_endpoints WHERE id = $1',
      [id]
    );
    
    if (dbResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Webhook endpoint not found'
      });
    }
    
    const webhook = dbResult.rows[0];
    
    // Determine which Stripe key to use based on webhook mode
    let stripeKey;
    if (webhook.mode === 'test') {
      stripeKey = process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    } else if (webhook.mode === 'live') {
      stripeKey = process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    } else {
      // Default to the main secret key
      stripeKey = process.env.STRIPE_SECRET_KEY;
    }
    
    // Initialize Stripe with the appropriate key
    const stripe = require('stripe')(stripeKey);
    
    // Update webhook in Stripe
    const updateParams = {};
    
    if (events && Array.isArray(events) && events.length > 0) {
      updateParams.enabled_events = events;
    }
    
    if (status && ['active', 'disabled'].includes(status)) {
      updateParams.disabled = status === 'disabled';
    }
    
    // Only update if we have parameters to update
    if (Object.keys(updateParams).length > 0) {
      await stripe.webhookEndpoints.update(webhook.stripe_webhook_id, updateParams);
      
      // Update status in database if provided
      if (status) {
        await db.query(
          'UPDATE webhook_endpoints SET status = $1, updated_at = $2 WHERE id = $3',
          [status, new Date(), id]
        );
      }
    }
    
    // Get updated webhook from database
    const updatedResult = await db.query(
      'SELECT * FROM webhook_endpoints WHERE id = $1',
      [id]
    );
    
    // Get webhook from Stripe for latest info
    const stripeWebhook = await stripe.webhookEndpoints.retrieve(webhook.stripe_webhook_id);
    
    res.status(200).json({
      success: true,
      message: 'Webhook endpoint updated successfully',
      webhook: {
        ...updatedResult.rows[0],
        events: stripeWebhook.enabled_events,
        active: stripeWebhook.status === 'enabled'
      }
    });
  } catch (err) {
    console.error('Update webhook error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update webhook endpoint',
      error: err.message
    });
  }
});

/**
 * Delete a webhook endpoint
 */
router.delete('/webhooks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get webhook from database
    const result = await db.query(
      'SELECT * FROM webhook_endpoints WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Webhook endpoint not found'
      });
    }
    
    const webhook = result.rows[0];
    
    // Determine which Stripe key to use based on webhook mode
    let stripeKey;
    if (webhook.mode === 'test') {
      stripeKey = process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    } else if (webhook.mode === 'live') {
      stripeKey = process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    } else {
      // Default to the main secret key
      stripeKey = process.env.STRIPE_SECRET_KEY;
    }
    
    // Initialize Stripe with the appropriate key
    const stripe = require('stripe')(stripeKey);
    
    // Delete webhook from Stripe
    await stripe.webhookEndpoints.del(webhook.stripe_webhook_id);
    
    // Delete webhook from database
    await db.query(
      'DELETE FROM webhook_endpoints WHERE id = $1',
      [id]
    );
    
    res.status(200).json({
      success: true,
      message: 'Webhook endpoint deleted successfully'
    });
  } catch (err) {
    console.error('Delete webhook error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete webhook endpoint',
      error: err.message
    });
  }
});

module.exports = router;