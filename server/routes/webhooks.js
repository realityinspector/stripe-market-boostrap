/**
 * Webhook Handler Routes
 * 
 * This file contains routes to handle webhooks from external services,
 * particularly Stripe Connect for payment processing and vendor onboarding.
 */

const express = require('express');
const db = require('../db');
const stripeService = require('../services/stripe');
const router = express.Router();

// Get appropriate webhook secret based on environment
const getWebhookSecret = () => {
  // Check for environment-specific webhook secrets first
  const testWebhookSecret = process.env.STRIPE_TEST_WEBHOOK_KEY;
  const liveWebhookSecret = process.env.STRIPE_LIVE_WEBHOOK_KEY;
  
  // Determine mode based on the Stripe secret key (test or live)
  const isTestMode = process.env.STRIPE_SECRET_KEY && 
                     process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
  
  if (isTestMode && testWebhookSecret) {
    console.log('Using test webhook secret');
    return testWebhookSecret;
  } else if (!isTestMode && liveWebhookSecret) {
    console.log('Using live webhook secret');
    return liveWebhookSecret;
  }
  
  // Fall back to generic webhook secret
  return process.env.STRIPE_WEBHOOK_SECRET;
};

const STRIPE_WEBHOOK_SECRET = getWebhookSecret();

/**
 * Stripe Connect webhook handler
 * This endpoint receives events from Stripe Connect such as:
 * - account.updated: When a vendor's Stripe account is updated
 * - account.application.authorized: When vendor authorizes our platform
 * - account.application.deauthorized: When vendor deauthorizes our platform
 * - payment_intent.succeeded: When a payment is successful
 * - payout.paid: When a payout to vendor is completed
 * - etc.
 */
router.post('/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  let event;
  
  try {
    if (STRIPE_WEBHOOK_SECRET) {
      // Verify webhook signature if we have a secret
      const signature = req.headers['stripe-signature'];
      
      try {
        // Use appropriate Stripe secret key based on mode
        const isTestMode = process.env.STRIPE_SECRET_KEY && 
                           process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');
        
        // Get the appropriate secret key
        let stripeKey = process.env.STRIPE_SECRET_KEY;
        if (isTestMode && process.env.STRIPE_TEST_SECRET_KEY) {
          stripeKey = process.env.STRIPE_TEST_SECRET_KEY;
        } else if (!isTestMode && process.env.STRIPE_LIVE_SECRET_KEY) {
          stripeKey = process.env.STRIPE_LIVE_SECRET_KEY;
        }
        
        // Use Stripe library to verify signature
        const stripe = require('stripe')(stripeKey);
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.error('⚠️ Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
      }
    } else {
      // If we don't have a secret (e.g., in test/dev), parse the body
      event = JSON.parse(req.body);
      console.warn('⚠️ Webhook received without signature verification (not recommended for production)');
    }
    
    // Handle the event based on its type
    switch (event.type) {
      case 'account.updated': {
        // Get the Stripe account ID
        const accountId = event.account;
        
        // Fetch updated info from the event
        const isDetailsSubmitted = event.data.object.details_submitted;
        const isChargesEnabled = event.data.object.charges_enabled;
        const isPayoutsEnabled = event.data.object.payouts_enabled;
        
        // Update vendor record in our database
        if (isDetailsSubmitted && isChargesEnabled) {
          // Find vendor with this Stripe account ID
          const result = await db.query(
            'SELECT * FROM vendors WHERE stripe_account_id = $1',
            [accountId]
          );
          
          if (result.rows.length > 0) {
            const vendorId = result.rows[0].id;
            
            // Update vendor status to active if onboarding is complete
            await db.query(
              'UPDATE vendors SET stripe_onboarding_complete = TRUE, status = $1 WHERE id = $2',
              ['active', vendorId]
            );
            
            console.log(`Vendor ${vendorId} onboarding completed for Stripe account ${accountId}`);
          }
        }
        
        break;
      }
      
      case 'payment_intent.succeeded': {
        // Extract payment details
        const paymentIntent = event.data.object;
        const amount = paymentIntent.amount;
        const stripeAccountId = paymentIntent.transfer_data?.destination;
        const metadata = paymentIntent.metadata;
        
        console.log(`💰 Payment succeeded: ${paymentIntent.id} for ${amount / 100} ${paymentIntent.currency}`);
        
        // If this payment was for an order, update its status
        if (metadata.orderId) {
          await db.query(
            'UPDATE orders SET status = $1, payment_id = $2 WHERE id = $3',
            ['paid', paymentIntent.id, metadata.orderId]
          );
          
          console.log(`Updated order ${metadata.orderId} to paid status`);
        }
        
        break;
      }
      
      case 'account.application.deauthorized': {
        // Vendor revoked platform access
        const accountId = event.account;
        
        // Update vendor status in our database
        await db.query(
          'UPDATE vendors SET status = $1, stripe_onboarding_complete = FALSE WHERE stripe_account_id = $2',
          ['suspended', accountId]
        );
        
        console.log(`Vendor with Stripe account ${accountId} deauthorized the application`);
        break;
      }
      
      case 'payout.paid': {
        // Payout to vendor was successful
        const payout = event.data.object;
        const stripeAccountId = event.account;
        
        console.log(`Payout of ${payout.amount / 100} ${payout.currency} to Stripe account ${stripeAccountId} succeeded`);
        break;
      }
      
      case 'account.application.authorized': {
        // Vendor authorized our application
        const accountId = event.account;
        
        // Update vendor's authorization status in our database
        const result = await db.query(
          'SELECT * FROM vendors WHERE stripe_account_id = $1',
          [accountId]
        );
        
        if (result.rows.length > 0) {
          const vendorId = result.rows[0].id;
          
          await db.query(
            'UPDATE vendors SET stripe_authorized = TRUE WHERE id = $1',
            [vendorId]
          );
          
          console.log(`Vendor ${vendorId} authorized the platform application for Stripe account ${accountId}`);
        }
        
        break;
      }
      
      case 'transfer.created': {
        // Transfer to a vendor was created
        const transfer = event.data.object;
        const destinationAccountId = transfer.destination;
        const amount = transfer.amount;
        
        console.log(`Transfer of ${amount / 100} ${transfer.currency} to Stripe account ${destinationAccountId} created`);
        
        // Record the transfer in our database
        try {
          await db.query(
            'INSERT INTO transfers (stripe_transfer_id, stripe_account_id, amount, currency, created_at) VALUES ($1, $2, $3, $4, $5)',
            [
              transfer.id,
              destinationAccountId,
              amount,
              transfer.currency,
              new Date(transfer.created * 1000)
            ]
          );
        } catch (err) {
          // Handle case where transfers table might not exist yet
          console.log('Could not log transfer to database:', err.message);
        }
        
        break;
      }
      
      case 'transfer.failed': {
        // Transfer to a vendor failed
        const transfer = event.data.object;
        const destinationAccountId = transfer.destination;
        const amount = transfer.amount;
        
        console.log(`⚠️ Transfer of ${amount / 100} ${transfer.currency} to Stripe account ${destinationAccountId} failed`);
        
        // Update the transfer status in our database
        try {
          await db.query(
            'UPDATE transfers SET status = $1 WHERE stripe_transfer_id = $2',
            ['failed', transfer.id]
          );
        } catch (err) {
          console.log('Could not update transfer status in database:', err.message);
        }
        
        break;
      }
      
      case 'charge.succeeded': {
        // A charge was successful
        const charge = event.data.object;
        
        console.log(`Charge succeeded: ${charge.id} for ${charge.amount / 100} ${charge.currency}`);
        
        break;
      }
      
      case 'charge.failed': {
        // A charge failed
        const charge = event.data.object;
        const failureMessage = charge.failure_message;
        
        console.log(`⚠️ Charge failed: ${charge.id} - ${failureMessage}`);
        
        // If this charge was for an order, update its status
        if (charge.metadata && charge.metadata.orderId) {
          await db.query(
            'UPDATE orders SET status = $1, payment_error = $2 WHERE id = $3',
            ['payment_failed', failureMessage, charge.metadata.orderId]
          );
          
          console.log(`Updated order ${charge.metadata.orderId} to payment_failed status`);
        }
        
        break;
      }
      
      case 'payment_intent.payment_failed': {
        // A payment intent failed
        const paymentIntent = event.data.object;
        const failureMessage = paymentIntent.last_payment_error?.message || 'Unknown error';
        
        console.log(`⚠️ Payment failed: ${paymentIntent.id} - ${failureMessage}`);
        
        // If this payment was for an order, update its status
        if (paymentIntent.metadata && paymentIntent.metadata.orderId) {
          await db.query(
            'UPDATE orders SET status = $1, payment_error = $2 WHERE id = $3',
            ['payment_failed', failureMessage, paymentIntent.metadata.orderId]
          );
          
          console.log(`Updated order ${paymentIntent.metadata.orderId} to payment_failed status`);
        }
        
        break;
      }
      
      case 'checkout.session.completed': {
        // A checkout session was completed
        const session = event.data.object;
        
        console.log(`Checkout session completed: ${session.id}`);
        
        // If this session was for an order, update its status
        if (session.metadata && session.metadata.orderId) {
          await db.query(
            'UPDATE orders SET status = $1, session_id = $2 WHERE id = $3',
            ['paid', session.id, session.metadata.orderId]
          );
          
          console.log(`Updated order ${session.metadata.orderId} to paid status`);
        }
        
        break;
      }
      
      // Default handler for unhandled events
      default: {
        // Log unhandled events for debugging purposes
        console.log(`Unhandled Stripe event: ${event.type}`);
      }
    }
    
    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(500).send(`Webhook error: ${err.message}`);
  }
});

/**
 * Test webhook endpoint for development
 * Used to verify webhook routing is working correctly
 */
router.post('/test', (req, res) => {
  console.log('Test webhook received:', req.body);
  res.status(200).json({ 
    received: true,
    timestamp: new Date().toISOString(),
    body: req.body
  });
});

/**
 * Register and validate webhook endpoints with Stripe
 * This endpoint allows the admin to register and test webhook endpoints
 * with Stripe in different environments
 */
router.post('/register', async (req, res) => {
  try {
    // Check for admin authorization
    if (!req.headers.authorization) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header is required'
      });
    }
    
    const token = req.headers.authorization.split(' ')[1];
    const jwt = require('jsonwebtoken');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Only allow admins to register webhooks
      if (!decoded.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization token'
      });
    }
    
    const { url, mode, events } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Webhook URL is required'
      });
    }
    
    if (!events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one webhook event is required'
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
    
    // Initialize Stripe
    const stripe = require('stripe')(stripeKey);
    
    // Register the webhook endpoint
    const webhook = await stripe.webhookEndpoints.create({
      url: url,
      enabled_events: events,
      description: `Marketplace webhook endpoint (${mode})`,
    });
    
    // Save webhook information to database for future reference
    try {
      await db.query(
        'INSERT INTO webhook_endpoints (stripe_webhook_id, url, mode, secret, created_at) VALUES ($1, $2, $3, $4, $5)',
        [webhook.id, url, mode, webhook.secret, new Date()]
      );
    } catch (err) {
      console.log('Could not save webhook to database:', err.message);
      // Continue anyway since the webhook was created in Stripe
    }
    
    res.status(201).json({
      success: true,
      message: 'Webhook endpoint registered successfully',
      webhook: {
        id: webhook.id,
        url: webhook.url,
        mode: mode,
        secret: webhook.secret,
        events: webhook.enabled_events
      }
    });
  } catch (err) {
    console.error('Error registering webhook endpoint:', err);
    res.status(500).json({
      success: false,
      message: 'Error registering webhook endpoint',
      error: err.message
    });
  }
});

/**
 * List webhook endpoints
 * Displays all registered webhook endpoints from Stripe
 */
router.get('/endpoints', async (req, res) => {
  try {
    // Check for admin authorization
    if (!req.headers.authorization) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header is required'
      });
    }
    
    const token = req.headers.authorization.split(' ')[1];
    const jwt = require('jsonwebtoken');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Only allow admins to view webhooks
      if (!decoded.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization token'
      });
    }
    
    // Default to test mode
    const mode = req.query.mode || 'test';
    
    // Get the appropriate Stripe key based on mode
    let stripeKey;
    if (mode === 'test') {
      stripeKey = process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    } else if (mode === 'live') {
      stripeKey = process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    } else {
      // Default to the main secret key
      stripeKey = process.env.STRIPE_SECRET_KEY;
    }
    
    // Initialize Stripe
    const stripe = require('stripe')(stripeKey);
    
    // Get all webhook endpoints
    const webhooks = await stripe.webhookEndpoints.list({
      limit: 100
    });
    
    res.status(200).json({
      success: true,
      webhooks: webhooks.data.map(webhook => ({
        id: webhook.id,
        url: webhook.url,
        status: webhook.status,
        events: webhook.enabled_events,
        created: new Date(webhook.created * 1000).toISOString()
      }))
    });
  } catch (err) {
    console.error('Error listing webhook endpoints:', err);
    res.status(500).json({
      success: false,
      message: 'Error listing webhook endpoints',
      error: err.message
    });
  }
});

module.exports = router;