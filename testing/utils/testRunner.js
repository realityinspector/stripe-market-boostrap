/**
 * Test Runner
 * 
 * This utility manages the execution of all tests and generates reports.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { generateReport } = require('./reportGenerator');

// Test configuration
exports.config = {
  apiBaseUrl: process.env.API_URL || 'http://localhost:8000',
  reportOutputDir: path.join(__dirname, '../reports'),
  testTimeout: 30000, // 30 seconds
};

/**
 * Run a test and collect results
 * @param {Function} testFn - The test function to run
 * @param {string} testName - Name of the test
 * @returns {Object} - Test result details
 */
async function runTest(testFn, testName) {
  console.log(`Running test: ${testName}`);
  
  const startTime = Date.now();
  let success = false;
  let error = null;
  let result = null;
  
  try {
    // Set a timeout for the test
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Test timed out after ${exports.config.testTimeout}ms`)), 
        exports.config.testTimeout);
    });
    
    // Run the test with a timeout
    result = await Promise.race([
      testFn(),
      timeoutPromise
    ]);
    
    success = true;
  } catch (err) {
    error = err;
    console.error(`Test failed: ${testName}`, err);
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  return {
    name: testName,
    success,
    duration,
    error: error ? error.message : null,
    result: success ? result : null,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Run all tests in a directory
 * @param {string} testDir - Path to directory containing test files
 * @returns {Array} - Array of test results
 */
async function runTestsInDirectory(testDir) {
  const results = [];
  
  try {
    // Check if directory exists
    if (!fs.existsSync(testDir)) {
      console.warn(`Test directory does not exist: ${testDir}`);
      return results;
    }
    
    // Get all JS files in the directory
    const testFiles = fs.readdirSync(testDir)
      .filter(file => file.endsWith('.test.js'));
    
    // Run each test file
    for (const file of testFiles) {
      console.log(`\nRunning tests in file: ${file}`);
      
      // Import the test file
      const testPath = path.join(testDir, file);
      const testModule = require(testPath);
      
      // Run each test function in the file
      for (const [fnName, testFn] of Object.entries(testModule)) {
        // Skip non-functions and the cleanup function
        if (typeof testFn !== 'function' || fnName === 'cleanup') {
          continue;
        }
        
        // Run the test
        const testResult = await runTest(testFn, `${file} - ${fnName}`);
        results.push(testResult);
      }
      
      // Run cleanup if it exists
      if (typeof testModule.cleanup === 'function') {
        console.log(`Running cleanup for ${file}...`);
        await testModule.cleanup();
      }
    }
  } catch (error) {
    console.error('Error running tests:', error);
  }
  
  return results;
}

/**
 * Run all tests and generate reports
 */
exports.runAllTests = async () => {
  console.log('Starting test run...');
  const allResults = {
    api: [],
    e2e: [],
    frontend: [],
  };
  
  // Check if API server is running
  const isServerRunning = await exports.isServerRunning();
  if (!isServerRunning) {
    console.error('API server is not running. Cannot run tests.');
    return false;
  }
  
  // Create reports directory if it doesn't exist
  if (!fs.existsSync(exports.config.reportOutputDir)) {
    fs.mkdirSync(exports.config.reportOutputDir, { recursive: true });
  }
  
  // Run API tests
  console.log('\n=== Running API Tests ===');
  allResults.api = await runTestsInDirectory(path.join(__dirname, '../api'));
  
  // Run E2E tests
  console.log('\n=== Running E2E Tests ===');
  allResults.e2e = await runTestsInDirectory(path.join(__dirname, '../e2e'));
  
  // Run frontend tests
  console.log('\n=== Running Frontend Tests ===');
  allResults.frontend = await runTestsInDirectory(path.join(__dirname, '../frontend'));
  
  // Generate reports
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const reportPath = path.join(exports.config.reportOutputDir, `test-report-${timestamp}.json`);
  
  await generateReport(allResults, reportPath);
  
  // Log summary
  const totalTests = Object.values(allResults).reduce((sum, results) => sum + results.length, 0);
  const passedTests = Object.values(allResults).reduce((sum, results) => {
    return sum + results.filter(result => result.success).length;
  }, 0);
  
  console.log('\n=== Test Run Summary ===');
  console.log(`Total tests: ${totalTests}`);
  console.log(`Passed tests: ${passedTests}`);
  console.log(`Failed tests: ${totalTests - passedTests}`);
  console.log(`Success rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  console.log(`Report generated at: ${reportPath}`);
  
  return passedTests === totalTests;
};

/**
 * Check if the API server is running
 * @returns {Promise<boolean>}
 */
exports.isServerRunning = async () => {
  try {
    await axios.get(exports.config.apiBaseUrl, { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Utility to create a test HTTP client with authentication
 * @param {string} token - JWT authentication token
 * @returns {Object} - Axios instance with authentication
 */
exports.createAuthenticatedClient = (token) => {
  return axios.create({
    baseURL: exports.config.apiBaseUrl,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

// Run tests if this file is executed directly
if (require.main === module) {
  exports.runAllTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error running tests:', error);
      process.exit(1);
    });
}