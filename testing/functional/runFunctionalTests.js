/**
 * Functional Tests Runner
 * 
 * This script runs the functional tests for the marketplace application,
 * focusing on complete user journeys through the system.
 * 
 * Usage:
 *   node runFunctionalTests.js [test-name]
 * 
 * Options:
 *   [test-name] - Optional name of specific test to run (customer, vendor, stripe)
 *                 If not specified, all functional tests will be run.
 * 
 * Example:
 *   node runFunctionalTests.js customer    # Run only customer journey tests
 */

const chalk = require('chalk');
const { testCustomerJourney } = require('./customer_journey.test');
const { testVendorJourney } = require('./vendor_journey.test');
const { testStripeIntegration } = require('./stripe_integration.test');
const fs = require('fs');
const path = require('path');

// Set up environment
process.env.NODE_ENV = 'test';

// Create reports directory if it doesn't exist
const reportDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

// Track test results
const results = {
  timestamp: new Date().toISOString(),
  overall: {
    total: 0,
    passed: 0,
    failed: 0,
    success_rate: 0
  },
  tests: []
};

/**
 * Run a specific test and record results
 */
async function runTest(name, testFn) {
  console.log(chalk.blue(`\n=== Running ${name} Tests ===`));
  
  const testStart = Date.now();
  const successPathsBefore = successPaths.length;
  const failurePathsBefore = failurePaths.length;
  
  try {
    await testFn();
    
    const successPathsAfter = successPaths.length;
    const failurePathsAfter = failurePaths.length;
    
    const newSuccessPaths = successPathsAfter - successPathsBefore;
    const newFailurePaths = failurePathsAfter - failurePathsBefore;
    
    const testResult = {
      name,
      duration_ms: Date.now() - testStart,
      success_paths: newSuccessPaths,
      failure_paths: newFailurePaths,
      success_rate: newSuccessPaths / (newSuccessPaths + newFailurePaths) * 100
    };
    
    results.tests.push(testResult);
    results.overall.total += newSuccessPaths + newFailurePaths;
    results.overall.passed += newSuccessPaths;
    results.overall.failed += newFailurePaths;
    
    console.log(chalk.blue(`\n=== ${name} Tests Completed ===`));
    console.log(`Success Paths: ${chalk.green(newSuccessPaths)}`);
    console.log(`Failure Paths: ${chalk.red(newFailurePaths)}`);
    console.log(`Success Rate: ${chalk.yellow(testResult.success_rate.toFixed(2))}%`);
    
  } catch (error) {
    console.error(chalk.red(`Error running ${name} tests:`), error);
    
    results.tests.push({
      name,
      duration_ms: Date.now() - testStart,
      success_paths: 0,
      failure_paths: 1,
      success_rate: 0,
      error: error.message
    });
    
    results.overall.total += 1;
    results.overall.failed += 1;
  }
}

// Track success and failure paths across all tests
let successPaths = [];
let failurePaths = [];

/**
 * Run all functional tests
 */
async function runAllTests(specificTest = null) {
  console.log(chalk.bgBlue.white(' FUNCTIONAL TESTS '));
  console.log(`Starting functional tests at ${new Date().toLocaleString()}`);
  console.log('---------------------------------------------------');
  
  const startTime = Date.now();
  
  try {
    // Check if we need to run a specific test only
    if (specificTest) {
      switch (specificTest.toLowerCase()) {
        case 'customer':
          await runTest('Customer Journey', testCustomerJourney);
          break;
        case 'vendor':
          await runTest('Vendor Journey', testVendorJourney);
          break;
        case 'stripe':
          await runTest('Stripe Integration', testStripeIntegration);
          break;
        default:
          console.error(chalk.red(`Unknown test: ${specificTest}`));
          console.log(`Available tests: customer, vendor, stripe`);
          process.exit(1);
      }
    } else {
      // Run all tests in sequence
      await runTest('Customer Journey', testCustomerJourney);
      await runTest('Vendor Journey', testVendorJourney);
      await runTest('Stripe Integration', testStripeIntegration);
    }
    
    // Calculate overall results
    results.overall.success_rate = results.overall.passed / results.overall.total * 100;
    results.duration_ms = Date.now() - startTime;
    
    // Print summary
    console.log('\n---------------------------------------------------');
    console.log(chalk.bgBlue.white(' FUNCTIONAL TEST SUMMARY '));
    console.log(`Total paths tested: ${results.overall.total}`);
    console.log(`Successful paths: ${chalk.green(results.overall.passed)}`);
    console.log(`Failed paths: ${chalk.red(results.overall.failed)}`);
    console.log(`Overall success rate: ${chalk.yellow(results.overall.success_rate.toFixed(2))}%`);
    console.log(`Total duration: ${(results.duration_ms / 1000).toFixed(2)}s`);
    
    // Save report
    const reportPath = path.join(reportDir, `functional-test-report-${new Date().toISOString().replace(/:/g, '-')}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`\nReport saved to: ${reportPath}`);
    
  } catch (error) {
    console.error(chalk.red('Error running tests:'), error);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  // Get specific test name from command line if provided
  const specificTest = process.argv[2];
  
  runAllTests(specificTest).catch(err => {
    console.error(chalk.red('Fatal error:'), err);
    process.exit(1);
  });
}

module.exports = {
  runAllTests
};