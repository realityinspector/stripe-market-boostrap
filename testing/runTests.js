/**
 * Test Runner Script
 * 
 * This script runs all tests and generates reports.
 * 
 * Usage:
 *   node runTests.js [category]
 * 
 * Options:
 *   [category] - Optional category of tests to run (api, e2e, frontend)
 *                If not specified, all tests will be run.
 * 
 * Example:
 *   node runTests.js api
 */

const fs = require('fs');
const path = require('path');
const { runAllTests } = require('./utils/testRunner');
const { generateReport } = require('./utils/reportGenerator');

// Parse command line arguments
const args = process.argv.slice(2);
const category = args[0] || null;

// Validate category if provided
if (category && !['api', 'e2e', 'frontend'].includes(category)) {
  console.error(`Invalid category: ${category}`);
  console.error('Valid categories: api, e2e, frontend');
  process.exit(1);
}

// Define the test directories
const TEST_DIRS = {
  api: path.join(__dirname, 'api'),
  e2e: path.join(__dirname, 'e2e'),
  frontend: path.join(__dirname, 'frontend')
};

// Create reports directory if it doesn't exist
const reportsDir = path.join(__dirname, 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

async function runTests() {
  console.log('Starting test execution...');
  
  if (category) {
    console.log(`Running tests for category: ${category}`);
  } else {
    console.log('Running all tests...');
  }
  
  try {
    const success = await runAllTests();
    
    if (success) {
      console.log('\nAll tests passed successfully!');
      process.exit(0);
    } else {
      console.log('\nSome tests failed. Check the report for details.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

// Run the tests
runTests();