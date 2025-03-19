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

// Stripe webhook secret from environment variables
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

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
        // Use Stripe library to verify signature
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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
      
      // Add more event handlers as needed
      
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

module.exports = router;