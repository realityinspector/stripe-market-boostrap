/**
 * Test Runner
 * 
 * This utility manages the execution of all tests and generates reports.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { performance } = require('perf_hooks');
const { generateReport } = require('./reportGenerator');

// Configuration
const config = {
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8000',
  mobileBaseUrl: process.env.MOBILE_BASE_URL || 'http://localhost:19006',
  testTimeout: 30000, // 30 seconds
  reportDir: path.join(__dirname, '../reports')
};

// Ensure report directory exists
if (!fs.existsSync(config.reportDir)) {
  fs.mkdirSync(config.reportDir, { recursive: true });
}

/**
 * Run a test and collect results
 * @param {Function} testFn - The test function to run
 * @param {string} testName - Name of the test
 * @returns {Object} - Test result details
 */
const runTest = async (testFn, testName) => {
  console.log(`Running test: ${testName}`);
  
  const startTime = performance.now();
  const result = {
    name: testName,
    success: false,
    error: null,
    duration: 0,
    timestamp: new Date().toISOString()
  };

  try {
    await Promise.race([
      testFn(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Test timeout')), config.testTimeout)
      )
    ]);
    
    result.success = true;
  } catch (error) {
    result.success = false;
    result.error = {
      message: error.message,
      stack: error.stack
    };
    console.error(`Test failed: ${testName}`, error.message);
  }

  result.duration = (performance.now() - startTime).toFixed(2);
  return result;
};

/**
 * Run all tests in a directory
 * @param {string} testDir - Path to directory containing test files
 * @returns {Array} - Array of test results
 */
const runTestsInDirectory = async (testDir) => {
  const results = [];
  const fullPath = path.join(__dirname, '..', testDir);
  
  try {
    const files = fs.readdirSync(fullPath)
      .filter(file => file.endsWith('.js') || file.endsWith('.mjs'));
    
    for (const file of files) {
      const testModule = require(path.join(fullPath, file));
      const testFunctions = Object.entries(testModule)
        .filter(([key, value]) => key.startsWith('test') && typeof value === 'function');
      
      for (const [testName, testFn] of testFunctions) {
        const result = await runTest(testFn, `${file}:${testName}`);
        results.push(result);
      }
    }
  } catch (error) {
    console.error(`Error running tests in ${testDir}:`, error);
  }
  
  return results;
};

/**
 * Run all tests and generate reports
 */
const runAllTests = async () => {
  console.log('Starting test run...');
  const testCategories = ['api', 'e2e', 'frontend'];
  const allResults = {};
  
  for (const category of testCategories) {
    console.log(`\n==== Running ${category} tests ====`);
    allResults[category] = await runTestsInDirectory(category);
  }
  
  // Generate consolidated report
  const reportPath = path.join(config.reportDir, `test-report-${Date.now()}.json`);
  generateReport(allResults, reportPath);
  
  // Print summary
  const totalTests = Object.values(allResults).flat().length;
  const passedTests = Object.values(allResults).flat().filter(r => r.success).length;
  
  console.log('\n==== Test Run Summary ====');
  console.log(`Total tests: ${totalTests}`);
  console.log(`Passed tests: ${passedTests}`);
  console.log(`Failed tests: ${totalTests - passedTests}`);
  console.log(`Success rate: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
  console.log(`Report generated: ${reportPath}`);
};

/**
 * Check if the API server is running
 * @returns {Promise<boolean>}
 */
const isApiServerRunning = async () => {
  try {
    const response = await axios.get(`${config.apiBaseUrl}/`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

/**
 * Utility to create a test HTTP client with authentication
 * @param {string} token - JWT authentication token
 * @returns {Object} - Axios instance with authentication
 */
const createAuthenticatedClient = (token) => {
  return axios.create({
    baseURL: config.apiBaseUrl,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

module.exports = {
  runAllTests,
  runTestsInDirectory,
  runTest,
  isApiServerRunning,
  createAuthenticatedClient,
  config
};