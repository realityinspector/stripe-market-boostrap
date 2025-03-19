/**
 * Stripe Connect Test Runner
 * 
 * This script runs comprehensive tests for Stripe Connect, including:
 * 1. Buyer user tests - testing the payment flow from the customer perspective
 * 2. Vendor user tests - testing onboarding, receiving payments, and payouts
 * 3. Transaction tests - testing the complete flow from buyer to vendor
 * 
 * Usage:
 *   node stripe_connect_test_runner.js [options]
 * 
 * Options:
 *   --buyers-only    - Run only the buyer tests
 *   --vendors-only   - Run only the vendor tests
 *   --transactions   - Run only the transaction flow tests
 *   --detailed       - Show detailed test output
 */

// Import custom colorize instead of chalk for ESM compatibility
const colorize = {
  red: (text) => `\x1b[31m${text}\x1b[0m`, 
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`
};
const fs = require('fs');
const path = require('path');
const { runBuyerTests } = require('./stripe_connect_buyer_tests');
const { runVendorTests } = require('./stripe_connect_vendor_tests');

// Ensure reports directory exists
const reportsDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

/**
 * Test transactions between buyers and vendors
 * This combines both buyer and vendor tests to validate the complete flow
 */
async function testCompleteTransactionFlow() {
  console.log(colorize.green('\n===== STRIPE CONNECT TRANSACTION FLOW TESTS ====='));
  
  try {
    // Run buyer tests first
    console.log(colorize.blue('Running buyer tests...'));
    const buyerResults = await runBuyerTests();
    
    // Then run vendor tests
    console.log(colorize.blue('\nRunning vendor tests...'));
    const vendorResults = await runVendorTests();
    
    // Calculate overall success
    const overallSuccess = buyerResults.success && vendorResults.success;
    const totalTests = buyerResults.total + vendorResults.total;
    const passedTests = buyerResults.passed + vendorResults.passed;
    
    console.log(colorize.green(`\n===== OVERALL TEST SUMMARY =====`));
    console.log(`Buyer tests: ${buyerResults.passed}/${buyerResults.total} passed`);
    console.log(`Vendor tests: ${vendorResults.passed}/${vendorResults.total} passed`);
    console.log(`Total: ${passedTests}/${totalTests} passed (${Math.round((passedTests / totalTests) * 100)}%)`);
    
    return {
      success: overallSuccess,
      buyerTests: buyerResults,
      vendorTests: vendorResults,
      total: totalTests,
      passed: passedTests
    };
  } catch (error) {
    console.error(colorize.red('Error in transaction flow tests:'), error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate a report from the test results
 */
function generateReport(results) {
  const timestamp = new Date().toISOString();
  const reportFile = path.join(reportsDir, `stripe-connect-tests-${timestamp}.json`);
  
  fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
  console.log(chalk.blue(`Report saved to: ${reportFile}`));
  
  return reportFile;
}

/**
 * Main function
 */
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const options = {
    buyersOnly: args.includes('--buyers-only'),
    vendorsOnly: args.includes('--vendors-only'),
    transactions: args.includes('--transactions'),
    detailed: args.includes('--detailed')
  };
  
  // If no specific option is provided, run all tests
  if (!options.buyersOnly && !options.vendorsOnly && !options.transactions) {
    options.transactions = true;
  }
  
  // Log the Stripe Connect SDK version
  console.log(chalk.green('===== STRIPE CONNECT TEST SUITE ====='));
  console.log(`Running tests at: ${new Date().toISOString()}`);
  
  let results = {};
  
  // Run the selected tests
  if (options.buyersOnly) {
    results.buyers = await runBuyerTests();
  }
  
  if (options.vendorsOnly) {
    results.vendors = await runVendorTests();
  }
  
  if (options.transactions) {
    results.transactions = await testCompleteTransactionFlow();
  }
  
  // Generate a report
  const reportFile = generateReport(results);
  
  // Exit with the appropriate status code
  let succeeded = true;
  
  if (results.buyers && !results.buyers.success) succeeded = false;
  if (results.vendors && !results.vendors.success) succeeded = false;
  if (results.transactions && !results.transactions.success) succeeded = false;
  
  console.log(chalk.green('\n===== TEST RUN COMPLETE ====='));
  console.log(succeeded ? 
    chalk.green('✅ All tests passed!') : 
    chalk.red('❌ Some tests failed. See report for details.')
  );
  
  process.exit(succeeded ? 0 : 1);
}

// Run the main function
if (require.main === module) {
  main().catch(err => {
    console.error(chalk.red('Unhandled error in test runner:'), err);
    process.exit(1);
  });
}

module.exports = {
  runBuyerTests,
  runVendorTests,
  testCompleteTransactionFlow
};