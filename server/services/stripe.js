const Stripe = require('stripe');

// Get Stripe API key from environment variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY environment variable is not set');
  process.exit(1);
}

// Check if we're using test or live keys and log the mode
const isTestMode = STRIPE_SECRET_KEY.startsWith('sk_test_');
console.log(`Stripe initialized in ${isTestMode ? 'TEST' : 'LIVE'} mode`);

// Initialize Stripe with the secret key
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-01',
});

// Create a Stripe Connect account for a vendor
const createStripeAccount = async (businessName, email) => {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name: businessName,
      },
    });
    
    return account;
  } catch (error) {
    console.error('Stripe account creation error:', error);
    throw error;
  }
};

// Generate a Stripe Connect account link for onboarding
const getAccountLink = async (accountId) => {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.FRONTEND_URL}/vendor/onboarding/refresh`,
      return_url: `${process.env.FRONTEND_URL}/vendor/onboarding/complete`,
      type: 'account_onboarding',
    });
    
    return accountLink.url;
  } catch (error) {
    console.error('Stripe account link error:', error);
    throw error;
  }
};

// Get Stripe account status
const getStripeAccountStatus = async (accountId) => {
  try {
    const account = await stripe.accounts.retrieve(accountId);
    
    return {
      charges_enabled: account.charges_enabled,
      details_submitted: account.details_submitted,
      payouts_enabled: account.payouts_enabled,
    };
  } catch (error) {
    console.error('Stripe account status error:', error);
    throw error;
  }
};

// Create a payment intent
const createPaymentIntent = async (amount, currency, stripeAccountId, applicationFeeAmount, metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      application_fee_amount: applicationFeeAmount,
      transfer_data: {
        destination: stripeAccountId,
      },
      metadata,
    });
    
    return paymentIntent;
  } catch (error) {
    console.error('Create payment intent error:', error);
    throw error;
  }
};

// Create a transfer to vendor
const createTransfer = async (amount, stripeAccountId, metadata = {}) => {
  try {
    const transfer = await stripe.transfers.create({
      amount,
      currency: 'usd',
      destination: stripeAccountId,
      metadata,
    });
    
    return transfer;
  } catch (error) {
    console.error('Create transfer error:', error);
    throw error;
  }
};

// Retrieve a payment intent
const retrievePaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    return paymentIntent;
  } catch (error) {
    console.error('Retrieve payment intent error:', error);
    throw error;
  }
};

module.exports = {
  createStripeAccount,
  getAccountLink,
  getStripeAccountStatus,
  createPaymentIntent,
  createTransfer,
  retrievePaymentIntent
};
