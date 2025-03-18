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

const { testCustomerJourney } = require('./customer_journey.test');
const { testVendorJourney } = require('./vendor_journey.test');
const { testStripeIntegration } = require('./stripe_integration.test');
const { runConnectTests } = require('./stripe_connect_onboarding.test');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  reportsDir: path.join(__dirname, '../reports'),
  screenshotsDir: path.join(__dirname, '../screenshots'),
  baseUrl: 'http://localhost:8000'
};

// Ensure directories exist
for (const dir of [config.reportsDir, config.screenshotsDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Run a specific test and record results
 */
async function runTest(name, testFn) {
  console.log(`=== Running ${name} test ===`);
  const startTime = Date.now();
  
  try {
    const result = await testFn();
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(`✅ ${name} tests completed in ${duration.toFixed(2)}s`);
    return {
      name,
      success: true,
      duration,
      result
    };
  } catch (error) {
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.error(`❌ ${name} tests failed after ${duration.toFixed(2)}s`);
    console.error(`   Error: ${error.message}`);
    
    return {
      name,
      success: false,
      duration,
      error: error.message
    };
  }
}

/**
 * Run all functional tests
 */
async function runAllTests(specificTest = null) {
  console.log('Starting functional tests...');
  const results = [];
  const startTime = Date.now();
  
  const testsToRun = [];
  
  if (!specificTest || specificTest === 'customer') {
    testsToRun.push({
      name: 'Customer Journey',
      fn: testCustomerJourney
    });
  }
  
  if (!specificTest || specificTest === 'vendor') {
    testsToRun.push({
      name: 'Vendor Journey',
      fn: testVendorJourney
    });
  }
  
  if (!specificTest || specificTest === 'stripe') {
    testsToRun.push({
      name: 'Stripe Integration',
      fn: testStripeIntegration
    });
  }
  
  if (!specificTest || specificTest === 'connect') {
    testsToRun.push({
      name: 'Stripe Connect',
      fn: runConnectTests
    });
  }
  
  for (const test of testsToRun) {
    const result = await runTest(test.name, test.fn);
    results.push(result);
  }
  
  // Generate report
  const endTime = Date.now();
  const totalDuration = (endTime - startTime) / 1000;
  
  const report = {
    timestamp: new Date().toISOString(),
    totalDuration,
    tests: results,
    summary: {
      total: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    }
  };
  
  const reportPath = path.join(
    config.reportsDir,
    `functional-tests-${new Date().toISOString().replace(/:/g, '-')}.json`
  );
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Report saved to ${reportPath}`);
  
  const successRate = (report.summary.passed / report.summary.total) * 100;
  console.log(`\n=== Functional Test Summary ===`);
  console.log(`Total tests: ${report.summary.total}`);
  console.log(`Passed: ${report.summary.passed}`);
  console.log(`Failed: ${report.summary.failed}`);
  console.log(`Success rate: ${successRate.toFixed(2)}%`);
  console.log(`Total duration: ${totalDuration.toFixed(2)}s`);
  
  return report;
}

// Only run if this script is executed directly
if (require.main === module) {
  const specificTest = process.argv[2];
  runAllTests(specificTest)
    .catch(error => {
      console.error('Uncaught error in functional tests:', error);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  runTest
};