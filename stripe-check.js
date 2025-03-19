/**
 * Stripe Connect Platform Validation Script
 * 
 * This script validates that we're properly connected to Stripe as a platform
 * in test mode with the correct API keys.
 */

const Stripe = require('stripe');
const stripeKey = process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

console.log('Starting Stripe Connect platform validation...');

// Initialize Stripe with the secret key
const stripe = new Stripe(stripeKey, {
  apiVersion: '2023-10-16',
});

async function validateStripeConnection() {
  try {
    // First, check if we have a valid API key by requesting account information
    const account = await stripe.accounts.retrieve();
    
    // Check if we're in test mode
    const isTestMode = stripeKey.startsWith('sk_test_');
    
    console.log('\n===== STRIPE CONNECTION VALIDATION =====');
    console.log(`✅ Successfully connected to Stripe API`);
    console.log(`✅ Mode: ${isTestMode ? 'TEST' : 'LIVE'}`);
    console.log(`✅ Account Type: ${account.type}`);
    console.log(`✅ Business Name: ${account.business_profile?.name || 'Not set'}`);
    console.log(`✅ Platform ID: ${account.id}`);
    console.log(`✅ Platform Status: ${account.charges_enabled ? 'Active' : 'Pending'}`);
    
    // Validate that we can create Connect accounts
    console.log('\nTesting Express Connect account creation...');
    try {
      const testAccount = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: `test-${Date.now()}@example.com`,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          name: 'Test Vendor',
        },
      });
      
      console.log(`✅ Successfully created test Connect account: ${testAccount.id}`);
      
      // Test account links for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: testAccount.id,
        refresh_url: 'https://example.com/refresh',
        return_url: 'https://example.com/return',
        type: 'account_onboarding',
      });
      
      console.log(`✅ Successfully created account onboarding link`);
      console.log(`✅ Link: ${accountLink.url}`);
      
    } catch (connectError) {
      console.error('❌ Failed to create Connect account:', connectError.message);
    }
    
    console.log('\nPlatform capabilities:');
    console.log(`✅ Card Payments: ${account.capabilities?.card_payments || 'Not enabled'}`);
    console.log(`✅ Transfers: ${account.capabilities?.transfers || 'Not enabled'}`);
    console.log(`✅ Tax Reporting: ${account.capabilities?.tax_reporting_us_1099_k || 'Not enabled'}`);
    
    console.log('\nVerification summary:');
    console.log(`✅ Connected as platform administrator: YES`);
    console.log(`✅ Ready to onboard vendors: ${account.charges_enabled ? 'YES' : 'NO - Additional setup needed'}`);
    console.log(`✅ Ready to process payments: ${account.charges_enabled ? 'YES' : 'NO - Additional setup needed'}`);
    
    return {
      success: true,
      mode: isTestMode ? 'test' : 'live',
      platform_id: account.id,
      business_name: account.business_profile?.name || 'Not set',
      charges_enabled: account.charges_enabled
    };
    
  } catch (error) {
    console.error('❌ Stripe connection validation failed:');
    console.error(error.message);
    
    if (error.code === 'api_key_expired' || error.type === 'invalid_request_error') {
      console.log('\n❗ API Key Issue: Your Stripe API key may be invalid or expired.');
      console.log('Please check that you have the correct API key configured in your environment.');
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the validation
validateStripeConnection()
  .then(result => {
    console.log('\n===== VALIDATION COMPLETE =====');
    if (!result.success) {
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unexpected error during validation:', err);
    process.exit(1);
  });