/**
 * Test Coordinator
 * 
 * This is the main entry point for the automated testing system.
 * It coordinates all the different types of tests, collects results,
 * and generates comprehensive reports.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { performApiTests } = require('./apiTester');
const { performUiTests } = require('./uiTester');
const { performE2eTests } = require('./e2eTester');
const { generateReport } = require('./reportGenerator');

// Configuration
const config = {
  apiBaseUrl: 'http://localhost:8000',
  frontendUrl: 'http://localhost:5000',
  screenshotDir: path.join(__dirname, '../screenshots'),
  reportDir: path.join(__dirname, '../reports'),
  logDir: path.join(__dirname, '../logs'),
  mockAuth: true, // Use mock authentication for testing
  headless: 'new' // Use 'new' for headless mode or false for visible browser
};

// Create directories if they don't exist
[config.screenshotDir, config.reportDir, config.logDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Run all tests and generate reports
 */
async function runAllTests() {
  console.log(chalk.blue.bold('=== Starting Automated Testing System ==='));
  const startTime = Date.now();
  
  const results = {
    api: { tests: [], passed: 0, failed: 0 },
    ui: { tests: [], passed: 0, failed: 0 },
    e2e: { tests: [], passed: 0, failed: 0 }
  };
  
  // Run API tests
  try {
    console.log(chalk.cyan('Running API tests...'));
    results.api = await performApiTests(config);
    console.log(chalk.cyan(`API Tests: ${results.api.passed} passed, ${results.api.failed} failed`));
  } catch (error) {
    console.error(chalk.red('Error running API tests:'), error);
    results.api.error = error.message;
  }
  
  // Run UI tests
  try {
    console.log(chalk.cyan('Running UI tests...'));
    results.ui = await performUiTests(config);
    console.log(chalk.cyan(`UI Tests: ${results.ui.passed} passed, ${results.ui.failed} failed`));
  } catch (error) {
    console.error(chalk.red('Error running UI tests:'), error);
    results.ui.error = error.message;
  }
  
  // Run E2E tests
  try {
    console.log(chalk.cyan('Running E2E tests...'));
    results.e2e = await performE2eTests(config);
    console.log(chalk.cyan(`E2E Tests: ${results.e2e.passed} passed, ${results.e2e.failed} failed`));
  } catch (error) {
    console.error(chalk.red('Error running E2E tests:'), error);
    results.e2e.error = error.message;
  }
  
  // Generate report
  const reportPath = await generateReport(results, config);
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  // Calculate totals
  const totalTests = results.api.tests.length + results.ui.tests.length + results.e2e.tests.length;
  const totalPassed = results.api.passed + results.ui.passed + results.e2e.passed;
  const totalFailed = results.api.failed + results.ui.failed + results.e2e.failed;
  const successRate = Math.round((totalPassed / totalTests) * 100);
  
  console.log(chalk.blue.bold('=== Testing Completed ==='));
  console.log(chalk.yellow(`Total duration: ${duration.toFixed(2)} seconds`));
  console.log(chalk.yellow(`Total tests: ${totalTests}`));
  console.log(chalk.green(`Tests passed: ${totalPassed}`));
  console.log(chalk.red(`Tests failed: ${totalFailed}`));
  console.log(chalk.yellow(`Success rate: ${successRate}%`));
  console.log(chalk.yellow(`Report generated at: ${reportPath}`));
  
  return {
    results,
    summary: {
      totalTests,
      totalPassed,
      totalFailed,
      successRate,
      duration,
      reportPath
    }
  };
}

/**
 * Schedule periodic tests
 * @param {number} intervalMinutes - Interval in minutes for running tests
 */
function scheduleTests(intervalMinutes = 60) {
  console.log(chalk.blue(`Scheduling tests to run every ${intervalMinutes} minutes`));
  
  // Run tests immediately
  runAllTests();
  
  // Schedule future test runs
  setInterval(() => {
    console.log(chalk.blue(`Running scheduled tests (${new Date().toISOString()})`));
    runAllTests();
  }, intervalMinutes * 60 * 1000);
}

// If this file is run directly, run the tests
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  scheduleTests,
  config
};