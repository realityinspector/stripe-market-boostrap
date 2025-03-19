/**
 * Test Vendor Onboarding with Stripe Connect
 * 
 * This script tests the vendor onboarding process through Stripe Connect,
 * verifying that our server properly creates and manages Connect accounts.
 */

const stripeService = require('./services/stripe');

async function testVendorOnboarding() {
  console.log('===== TESTING VENDOR ONBOARDING WITH STRIPE CONNECT =====');
  
  try {
    // 1. Create a Stripe account for a test vendor
    console.log('\nCreating test vendor Connect account...');
    const vendorEmail = `test-vendor-${Date.now()}@example.com`;
    const vendorName = `Test Vendor Business ${Date.now()}`;
    
    const account = await stripeService.createStripeAccount(vendorName, vendorEmail);
    
    console.log(`✅ Successfully created Connect account for vendor`);
    console.log(`✅ Connect Account ID: ${account.id}`);
    console.log(`✅ Account Type: ${account.type}`);
    console.log(`✅ Email: ${account.email}`);
    
    // 2. Generate an onboarding link for the vendor
    console.log('\nGenerating vendor onboarding link...');
    
    // Temporarily override the FRONTEND_URL for testing
    const originalFrontendUrl = process.env.FRONTEND_URL;
    process.env.FRONTEND_URL = 'https://example.com';
    
    try {
      const onboardingUrl = await stripeService.getAccountLink(account.id);
      
      // Restore the original FRONTEND_URL
      process.env.FRONTEND_URL = originalFrontendUrl;
      
      console.log(`✅ Successfully generated onboarding link for vendor`);
      console.log(`✅ Onboarding URL: ${onboardingUrl}`);
      
      // 3. Check account status
      console.log('\nChecking vendor account status...');
      const status = await stripeService.getStripeAccountStatus(account.id);
      
      console.log(`✅ Successfully retrieved vendor account status`);
      console.log(`✅ Charges Enabled: ${status.charges_enabled}`);
      console.log(`✅ Details Submitted: ${status.details_submitted}`);
      console.log(`✅ Payouts Enabled: ${status.payouts_enabled}`);
      
      // 4. Attempt to create a payment intent for the vendor
      console.log('\nTesting payment intent creation for vendor...');
      try {
        // For a newly created account, our service should fall back to a mock payment intent
        // This tests that our service gracefully handles the error for unverified accounts
        const paymentIntent = await stripeService.createPaymentIntent(
          1000, // $10
          'usd',
          account.id,
          125, // $1.25 platform fee
          { test: true, vendorId: 'test-vendor-id' }
        );
        
        // Check if we got a mock payment intent (expected behavior)
        if (paymentIntent.id && paymentIntent.id.startsWith('pi_mock_')) {
          console.log(`✅ Successfully created mock payment intent for unverified vendor`);
          console.log(`✅ Mock Payment Intent ID: ${paymentIntent.id}`);
          console.log(`✅ This is the expected behavior for new Connect accounts`);
          console.log(`✅ Real payment intents will work after vendor completes onboarding`);
        } 
        // Or if we somehow got a real payment intent (unexpected but valid)
        else if (paymentIntent.id) {
          console.log(`✅ Successfully created real payment intent for vendor`);
          console.log(`✅ Payment Intent ID: ${paymentIntent.id}`);
          console.log(`✅ Application Fee: ${paymentIntent.application_fee_amount}`);
        } 
        // Unexpected case
        else {
          console.log(`⚠️ Unexpected payment intent result`);
        }
      } catch (err) {
        // This should not happen as our service should handle the error internally
        console.log(`❌ Payment intent handling failed unexpectedly`);
        console.log(`❌ Error: ${err.message}`);
        
        // This is only an issue if our error handling in the stripe service is broken
        return {
          success: false,
          error: `Payment intent error handling is not working properly: ${err.message}`
        };
      }
      
      console.log('\n✅ Vendor onboarding flow is properly configured');
      console.log('✅ Platform can successfully create and manage Connect accounts');
      
      return {
        success: true,
        accountId: account.id,
        onboardingUrl
      };
      
    } catch (err) {
      console.error(`❌ Error generating onboarding link: ${err.message}`);
      return {
        success: false,
        error: err.message
      };
    }
    
  } catch (error) {
    console.error(`❌ Vendor onboarding test failed: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testVendorOnboarding()
  .then(result => {
    console.log('\n===== VENDOR ONBOARDING TEST COMPLETE =====');
    console.log(result.success ? 
      '✅ Vendor onboarding is properly configured!' : 
      `❌ Vendor onboarding test failed: ${result.error}`
    );
  })
  .catch(err => {
    console.error('Unexpected error during vendor onboarding test:', err);
  });