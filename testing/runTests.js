#!/usr/bin/env node

/**
 * Test Runner Script
 * 
 * This script runs all tests and generates reports.
 * 
 * Usage:
 *   node runTests.js [category]
 * 
 * Options:
 *   [category] - Optional category of tests to run (api, e2e, frontend, ui, auto, functional)
 *                If not specified, all tests will be run.
 *                Use 'ui' to run UI tests with Puppeteer.
 *                Use 'auto' to run the comprehensive automated testing suite.
 *                Use 'functional' to run end-to-end user journey tests.
 * 
 * Example:
 *   node runTests.js api           # Run only API tests
 *   node runTests.js ui            # Run only UI tests with Puppeteer
 *   node runTests.js auto          # Run automated testing suite with live rendering
 *   node runTests.js functional    # Run functional user journey tests
 */

const fs = require('fs');
const path = require('path');
const { runAllTests } = require('./utils/testRunner');
const { generateTextReport } = require('./utils/reportGenerator');

// Parse command line arguments
const args = process.argv.slice(2);
const category = args[0];

async function runTests() {
  try {
    // Check if server is running
    const serverStatus = await checkServerStatus();
    if (!serverStatus) {
      console.error('Error: API server is not running. Please start the server before running tests.');
      process.exit(1);
    }

    console.log('=== Starting Test Run ===');

    // Handle automated testing suite if requested
    if (category === 'auto') {
      try {
        console.log('Running comprehensive automated testing suite...');
        // Use the new automated testing system
        const { runAllTests } = require('./automation/testCoordinator');
        const results = await runAllTests();
        
        // Exit with appropriate code
        if (results.summary.totalFailed > 0) {
          console.log(`Automated tests completed with ${results.summary.totalFailed} failures.`);
          process.exit(1);
        } else {
          console.log('All automated tests passed successfully!');
          process.exit(0);
        }
      } catch (error) {
        console.error('Error running automated tests:', error);
        process.exit(1);
      }
      return;
    }
    
    // Handle functional user journey tests if requested
    if (category === 'functional') {
      try {
        console.log('Running functional user journey tests...');
        // Use the functional tests runner
        const { runAllTests } = require('./functional/runFunctionalTests');
        const results = await runAllTests();
        
        // Exit with appropriate code
        if (results.summary.failed > 0) {
          console.log(`Functional tests completed with ${results.summary.failed} failures.`);
          process.exit(1);
        } else {
          console.log('All functional tests passed successfully!');
          process.exit(0);
        }
      } catch (error) {
        console.error('Error running functional tests:', error);
        process.exit(1);
      }
      return;
    }
    
    // Run legacy tests
    const testResults = await runAllTests(category);
    
    // Generate test report
    // Calculate test statistics
    const totalTests = testResults.api.length + testResults.e2e.length + testResults.frontend.length;
    const passedTests = testResults.api.filter(t => t.passed).length + 
                        testResults.e2e.filter(t => t.passed).length + 
                        testResults.frontend.filter(t => t.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

    // Set up report directory
    const reportDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const reportFile = path.join(reportDir, `test-report-${timestamp}.json`);
    
    // Generate JSON report
    const reportObj = {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        successRate: successRate
      },
      results: testResults
    };
    
    fs.writeFileSync(reportFile, JSON.stringify(reportObj, null, 2));
    console.log(`Report generated at: ${reportFile}`);

    // Generate human-readable report
    const textReportFile = reportFile.replace('.json', '.txt');
    const textReport = generateTextReport(reportObj, textReportFile);
    
    console.log('=== Test Run Summary ===');
    console.log(`Total tests: ${totalTests}`);
    console.log(`Passed tests: ${passedTests}`);
    console.log(`Failed tests: ${failedTests}`);
    console.log(`Success rate: ${successRate}%`);
    
    if (failedTests > 0) {
      console.log('Some tests failed. Check the report for details.');
      process.exit(1);
    } else {
      console.log('All tests passed!');
      process.exit(0);
    }
  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

async function checkServerStatus() {
  try {
    const response = await fetch('http://localhost:8000/', {
      method: 'GET',
      timeout: 5000
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

// We're now using the imported generateTextReport function from utils/reportGenerator.js

// Run the tests
runTests();