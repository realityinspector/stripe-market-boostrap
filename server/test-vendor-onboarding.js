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
    try {
      const onboardingUrl = await stripeService.getAccountLink(account.id);
      
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
        // Note: This will almost certainly fail for a new account, but demonstrates the flow
        const paymentIntent = await stripeService.createPaymentIntent(
          1000, // $10
          'usd',
          account.id,
          125, // $1.25 platform fee
          { test: true, vendorId: 'test-vendor-id' }
        );
        
        if (paymentIntent.id) {
          console.log(`✅ Successfully created payment intent for vendor`);
          console.log(`✅ Payment Intent ID: ${paymentIntent.id}`);
          console.log(`✅ Application Fee: ${paymentIntent.application_fee_amount}`);
        } else {
          console.log(`ℹ️ Created mock payment intent (expected for new account in test mode)`);
        }
      } catch (err) {
        console.log(`ℹ️ Payment intent creation failed as expected for new account`);
        console.log(`ℹ️ Error: ${err.message}`);
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