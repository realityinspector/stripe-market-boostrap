const express = require('express');
const db = require('../db');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { 
  createPaymentIntent,
  createTransfer,
  retrievePaymentIntent
} = require('../services/stripe');

const router = express.Router();

// Create a payment intent for checkout
router.post('/create-payment-intent', authenticateToken, authorizeRole(['customer']), async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;
    
    // Get product details
    const productResult = await db.query(`
      SELECT p.*, v.stripe_account_id, v.commission_rate, v.id as vendor_id
      FROM products p
      JOIN vendors v ON p.vendor_id = v.id
      WHERE p.id = $1
    `, [productId]);
    
    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const product = productResult.rows[0];
    
    // Check if vendor has completed Stripe onboarding
    if (!product.stripe_account_id) {
      return res.status(400).json({
        success: false,
        message: 'Vendor has not completed Stripe onboarding'
      });
    }
    
    // Calculate amounts
    const amount = parseFloat(product.price) * quantity;
    const commissionRate = parseFloat(product.commission_rate);
    const commissionAmount = (amount * commissionRate) / 100;
    const vendorAmount = amount - commissionAmount;
    
    // Create order record
    const orderResult = await db.query(`
      INSERT INTO orders (
        customer_id, 
        vendor_id, 
        total_amount, 
        commission_amount,
        status
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [userId, product.vendor_id, amount, commissionAmount, 'pending']);
    
    const order = orderResult.rows[0];
    
    // Add order items
    await db.query(`
      INSERT INTO order_items (
        order_id,
        product_id,
        quantity,
        price
      )
      VALUES ($1, $2, $3, $4)
    `, [order.id, productId, quantity, product.price]);
    
    // Create a payment intent with Stripe
    const paymentIntent = await createPaymentIntent(
      Math.round(amount * 100), // Convert to cents
      'usd',
      product.stripe_account_id,
      Math.round(commissionAmount * 100), // Convert to cents
      {
        orderId: order.id.toString(),
        customerId: userId.toString(),
        vendorId: product.vendor_id.toString()
      }
    );
    
    // Update order with payment intent ID
    await db.query(
      'UPDATE orders SET stripe_payment_intent_id = $1 WHERE id = $2',
      [paymentIntent.id, order.id]
    );
    
    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      orderId: order.id
    });
  } catch (err) {
    console.error('Create payment intent error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: err.message
    });
  }
});

// Handle Stripe webhook events
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const Stripe = require('stripe');
  const isTestMode = process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
  console.log(`Webhook handling in ${isTestMode ? 'TEST' : 'LIVE'} mode`);
  
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = req.headers['stripe-signature'];
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  try {
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      
      // Update order status
      const orderResult = await db.query(
        'SELECT * FROM orders WHERE stripe_payment_intent_id = $1',
        [paymentIntent.id]
      );
      
      if (orderResult.rows.length > 0) {
        const order = orderResult.rows[0];
        
        // Update order status to paid
        await db.query(
          'UPDATE orders SET status = $1 WHERE id = $2',
          ['paid', order.id]
        );
        
        console.log(`Order ${order.id} marked as paid`);
      }
    }
    
    res.status(200).json({received: true});
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(500).send(`Webhook Error: ${err.message}`);
  }
});

// Get order details by ID
router.get('/orders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Get order with items
    const orderResult = await db.query(`
      SELECT o.*, u.name as customer_name, v.business_name as vendor_name
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      JOIN vendors v ON o.vendor_id = v.id
      WHERE o.id = $1
    `, [id]);
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const order = orderResult.rows[0];
    
    // Check if user is authorized to view this order
    if (
      req.user.role !== 'admin' && 
      order.customer_id !== userId && 
      !(req.user.role === 'vendor' && order.vendor_id === req.user.vendor_id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this order'
      });
    }
    
    // Get order items
    const itemsResult = await db.query(`
      SELECT oi.*, p.name as product_name, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [id]);
    
    order.items = itemsResult.rows;
    
    // Get payment intent status from Stripe if available
    if (order.stripe_payment_intent_id) {
      try {
        const paymentIntent = await retrievePaymentIntent(order.stripe_payment_intent_id);
        order.paymentStatus = paymentIntent.status;
      } catch (stripeErr) {
        console.error('Error retrieving payment intent:', stripeErr);
        order.paymentStatus = 'unknown';
      }
    }
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (err) {
    console.error('Get order error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get order details',
      error: err.message
    });
  }
});

// Get customer order history
router.get('/orders', authenticateToken, authorizeRole(['customer']), async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(`
      SELECT o.*, v.business_name as vendor_name
      FROM orders o
      JOIN vendors v ON o.vendor_id = v.id
      WHERE o.customer_id = $1
      ORDER BY o.created_at DESC
    `, [userId]);
    
    res.status(200).json({
      success: true,
      orders: result.rows
    });
  } catch (err) {
    console.error('Get order history error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get order history',
      error: err.message
    });
  }
});

// Get vendor orders
router.get('/vendor/orders', authenticateToken, authorizeRole(['vendor']), async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get vendor ID
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
    
    // Get orders
    const result = await db.query(`
      SELECT o.*, u.name as customer_name
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      WHERE o.vendor_id = $1
      ORDER BY o.created_at DESC
    `, [vendorId]);
    
    res.status(200).json({
      success: true,
      orders: result.rows
    });
  } catch (err) {
    console.error('Get vendor orders error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get vendor orders',
      error: err.message
    });
  }
});

// Get admin dashboard reports
router.get('/admin/reports', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    // Get total platform revenue (commissions)
    const revenueResult = await db.query(`
      SELECT SUM(commission_amount) as total_revenue
      FROM orders
      WHERE status = 'paid'
    `);
    
    // Get total sales volume
    const salesResult = await db.query(`
      SELECT SUM(total_amount) as total_sales
      FROM orders
      WHERE status = 'paid'
    `);
    
    // Get total orders
    const ordersResult = await db.query(`
      SELECT COUNT(*) as total_orders
      FROM orders
      WHERE status = 'paid'
    `);
    
    // Get total vendors
    const vendorsResult = await db.query(`
      SELECT COUNT(*) as total_vendors
      FROM vendors
    `);
    
    // Get total products
    const productsResult = await db.query(`
      SELECT COUNT(*) as total_products
      FROM products
    `);
    
    // Get recent orders
    const recentOrdersResult = await db.query(`
      SELECT o.*, u.name as customer_name, v.business_name as vendor_name
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      JOIN vendors v ON o.vendor_id = v.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `);
    
    res.status(200).json({
      success: true,
      reports: {
        totalRevenue: revenueResult.rows[0].total_revenue || 0,
        totalSales: salesResult.rows[0].total_sales || 0,
        totalOrders: parseInt(ordersResult.rows[0].total_orders) || 0,
        totalVendors: parseInt(vendorsResult.rows[0].total_vendors) || 0,
        totalProducts: parseInt(productsResult.rows[0].total_products) || 0,
        recentOrders: recentOrdersResult.rows
      }
    });
  } catch (err) {
    console.error('Get admin reports error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to get admin reports',
      error: err.message
    });
  }
});

module.exports = router;
