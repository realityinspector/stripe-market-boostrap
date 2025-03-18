/**
 * Test Runner
 * 
 * This utility manages the execution of all tests and generates reports.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Run a test and collect results
 * @param {Function} testFn - The test function to run
 * @param {string} testName - Name of the test
 * @returns {Object} - Test result details
 */
async function runTest(testFn, testName) {
  console.log(`Running test: ${testName}`);
  
  try {
    await testFn();
    return {
      name: testName,
      passed: true,
      error: null,
      duration: 0 // We could add timing here if needed
    };
  } catch (error) {
    console.error(`Test failed: ${testName} ${error.message}`);
    return {
      name: testName,
      passed: false,
      error: error.message,
      stack: error.stack,
      duration: 0
    };
  }
}

/**
 * Run all tests in a directory
 * @param {string} testDir - Path to directory containing test files
 * @returns {Array} - Array of test results
 */
async function runTestsInDirectory(testDir) {
  const results = [];
  
  // Get the absolute path of the test directory
  const fullTestDir = path.join(__dirname, '..', testDir);
  
  if (!fs.existsSync(fullTestDir)) {
    console.warn(`Test directory not found: ${fullTestDir}`);
    return results;
  }
  
  const files = fs.readdirSync(fullTestDir)
    .filter(file => file.endsWith('.test.js'));
  
  for (const file of files) {
    console.log(`Running tests in file: ${file}`);
    
    const testModulePath = path.join(fullTestDir, file);
    console.log(`Loading test module from: ${testModulePath}`);
    
    const testModule = require(testModulePath);
    const testFunctions = Object.entries(testModule)
      .filter(([key, value]) => typeof value === 'function' && key.startsWith('test'));
    
    console.log(`Found ${testFunctions.length} test functions in ${file}`);
    
    for (const [testName, testFn] of testFunctions) {
      const result = await runTest(testFn, `${file} - ${testName}`);
      results.push(result);
    }
    
    // Run cleanup function if it exists
    if (typeof testModule.cleanup === 'function') {
      console.log(`Running cleanup for ${file}...`);
      await testModule.cleanup();
    }
  }
  
  return results;
}

/**
 * Run all tests and generate reports
 * @param {string} category - Optional category of tests to run (api, e2e, frontend, ui)
 * @returns {Object} - Object containing test results by category
 */
async function runAllTests(category) {
  const results = {
    api: [],
    e2e: [],
    frontend: []
  };
  
  // If 'ui' category is specified, run the UI tests via a separate script
  if (category === 'ui') {
    console.log('=== Running UI Tests with Puppeteer ===');
    const { spawn } = require('child_process');
    const uiTestProcess = spawn('node', [path.join(__dirname, '..', 'runUiTests.js')], {
      stdio: 'inherit'
    });
    
    return new Promise((resolve, reject) => {
      uiTestProcess.on('close', (code) => {
        if (code === 0) {
          // Create mock results for reporting purposes
          resolve({
            api: [],
            e2e: [{ name: 'UI Tests', passed: true, error: null }],
            frontend: []
          });
        } else {
          // Create mock results with failure for reporting purposes
          resolve({
            api: [],
            e2e: [{ name: 'UI Tests', passed: false, error: `UI tests failed with exit code ${code}` }],
            frontend: []
          });
        }
      });
    });
  }
  
  // If a specific category is provided, only run those tests
  if (category && category !== 'ui') {
    switch (category) {
      case 'api':
        console.log('=== Running API Tests ===');
        results.api = await runTestsInDirectory('api');
        break;
      case 'e2e':
        console.log('=== Running E2E Tests ===');
        results.e2e = await runTestsInDirectory('e2e');
        break;
      case 'frontend':
        console.log('=== Running Frontend Tests ===');
        results.frontend = await runTestsInDirectory('frontend');
        break;
      default:
        console.warn(`Unknown test category: ${category}`);
    }
  } else if (!category) {
    // Run all tests by default
    console.log('=== Running API Tests ===');
    results.api = await runTestsInDirectory('api');
    
    console.log('=== Running E2E Tests ===');
    results.e2e = await runTestsInDirectory('e2e');
    
    console.log('=== Running Frontend Tests ===');
    results.frontend = await runTestsInDirectory('frontend');
  }
  
  return results;
}

/**
 * Check if the API server is running
 * @returns {Promise<boolean>}
 */
async function isServerRunning() {
  try {
    const response = await axios.get('http://localhost:8000/');
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

/**
 * Utility to create a test HTTP client with authentication
 * @param {string} token - JWT authentication token
 * @returns {Object} - Axios instance with authentication
 */
function createAuthenticatedClient(token) {
  return axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
}

module.exports = {
  runTest,
  runTestsInDirectory,
  runAllTests,
  isServerRunning,
  createAuthenticatedClient
};