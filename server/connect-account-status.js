/**
 * Stripe Connect Account Status Checker
 * 
 * This script checks the status of a Stripe Connect account and updates 
 * the associated vendor record in our database.
 */

const stripeService = require('./services/stripe');
const db = require('./db');

/**
 * Updates the vendor record in our database based on Stripe account status
 * 
 * @param {string} stripeAccountId - The Stripe account ID to check
 * @returns {Promise<object>} - Result of the operation
 */
async function updateVendorStripeStatus(stripeAccountId) {
  try {
    console.log(`\nChecking status for Stripe account ${stripeAccountId}...`);
    
    // 1. Get the account status from Stripe
    const status = await stripeService.getStripeAccountStatus(stripeAccountId);
    
    console.log('Stripe account status:');
    console.log(`- Charges Enabled: ${status.charges_enabled}`);
    console.log(`- Details Submitted: ${status.details_submitted}`);
    console.log(`- Payouts Enabled: ${status.payouts_enabled}`);
    
    // 2. Find the vendor associated with this Stripe account
    const vendorResult = await db.query(
      'SELECT * FROM vendors WHERE stripe_account_id = $1',
      [stripeAccountId]
    );
    
    if (vendorResult.rows.length === 0) {
      console.log(`❌ No vendor found with Stripe account ID: ${stripeAccountId}`);
      return {
        success: false,
        error: 'Vendor not found',
        stripeAccountStatus: status
      };
    }
    
    const vendor = vendorResult.rows[0];
    console.log(`Found vendor: ${vendor.name} (ID: ${vendor.id})`);
    
    // 3. Update vendor record based on Stripe account status
    let vendorStatus = vendor.status;
    let onboardingComplete = vendor.stripe_onboarding_complete || false;
    
    // If charges are enabled and details are submitted, the vendor has completed onboarding
    if (status.charges_enabled && status.details_submitted) {
      vendorStatus = 'active';
      onboardingComplete = true;
      console.log('✅ Vendor has completed Stripe onboarding');
    } else {
      // If charges are not enabled but details are submitted, vendor is pending approval
      if (!status.charges_enabled && status.details_submitted) {
        vendorStatus = 'pending';
        console.log('⏳ Vendor has submitted details but charges are not yet enabled');
      } 
      // If details are not submitted, vendor needs to complete onboarding
      else if (!status.details_submitted) {
        vendorStatus = 'onboarding';
        console.log('⚠️ Vendor needs to complete Stripe onboarding');
      }
    }
    
    // 4. Update the vendor record in database
    const updateResult = await db.query(
      `UPDATE vendors 
       SET status = $1, 
           stripe_onboarding_complete = $2, 
           updated_at = NOW(),
           stripe_charges_enabled = $3,
           stripe_payouts_enabled = $4
       WHERE id = $5
       RETURNING *`,
      [vendorStatus, onboardingComplete, status.charges_enabled, status.payouts_enabled, vendor.id]
    );
    
    console.log(`✅ Vendor status updated to "${vendorStatus}"`);
    
    return {
      success: true,
      vendor: updateResult.rows[0],
      stripeAccountStatus: status
    };
    
  } catch (error) {
    console.error(`❌ Error updating vendor Stripe status: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate a new account link for vendors who haven't completed onboarding
 * 
 * @param {string} stripeAccountId - The Stripe account ID
 * @returns {Promise<object>} - The result with onboarding URL
 */
async function refreshOnboardingLink(stripeAccountId) {
  try {
    console.log(`\nGenerating fresh onboarding link for Stripe account ${stripeAccountId}...`);
    
    // 1. Check if account exists and needs onboarding
    const status = await stripeService.getStripeAccountStatus(stripeAccountId);
    
    if (status.charges_enabled && status.details_submitted) {
      console.log('⚠️ Vendor has already completed onboarding');
      return {
        success: false,
        error: 'Vendor has already completed onboarding',
        stripeAccountStatus: status
      };
    }
    
    // 2. Generate a fresh account link
    const accountLink = await stripeService.getAccountLink(stripeAccountId);
    
    console.log('✅ Generated fresh onboarding link');
    
    return {
      success: true,
      onboardingUrl: accountLink,
      stripeAccountStatus: status
    };
    
  } catch (error) {
    console.error(`❌ Error refreshing onboarding link: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export functions for use in other parts of the application
module.exports = {
  updateVendorStripeStatus,
  refreshOnboardingLink
};

// If running this script directly
if (require.main === module) {
  // Check for command line arguments
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('\nUsage:');
    console.log('  node connect-account-status.js <stripe_account_id>');
    console.log('  node connect-account-status.js --refresh <stripe_account_id>');
    process.exit(1);
  }
  
  // Check if we're refreshing an onboarding link
  if (args[0] === '--refresh' && args[1]) {
    refreshOnboardingLink(args[1])
      .then(result => {
        if (result.success) {
          console.log('\n✅ Onboarding URL refreshed successfully');
          console.log(`Onboarding URL: ${result.onboardingUrl}`);
        } else {
          console.log(`\n❌ Failed to refresh onboarding URL: ${result.error}`);
        }
        process.exit(0);
      })
      .catch(err => {
        console.error('Unexpected error:', err);
        process.exit(1);
      });
  } else {
    // Otherwise, check account status
    const stripeAccountId = args[0];
    
    updateVendorStripeStatus(stripeAccountId)
      .then(result => {
        if (result.success) {
          console.log('\n✅ Vendor Stripe status updated successfully');
        } else {
          console.log(`\n❌ Failed to update vendor Stripe status: ${result.error}`);
        }
        process.exit(0);
      })
      .catch(err => {
        console.error('Unexpected error:', err);
        process.exit(1);
      });
  }
}