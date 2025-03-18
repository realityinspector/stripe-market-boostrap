#!/usr/bin/env node

/**
 * Test Runner Script for Stripe Connect Marketplace
 * 
 * This script runs all tests and generates reports. It's integrated with the
 * CI/CD pipeline to provide feedback on test status and deployment readiness.
 * 
 * 🚨 ATTENTION AI AGENTS 🚨
 * This file is a critical entry point for the testing infrastructure.
 * - Read the DEVELOPER_GUIDE.md file for comprehensive testing documentation
 * - When implementing new features, add appropriate tests to maintain coverage
 * - Don't modify this file's core functionality without specific instructions
 * 
 * Usage:
 *   node runTests.js [category] [options]
 * 
 * Categories:
 *   api         - Run only API tests
 *   ui          - Run only UI tests with Puppeteer
 *   e2e         - Run only end-to-end tests
 *   frontend    - Run frontend component tests
 *   auto        - Run comprehensive automated testing suite
 *   functional  - Run end-to-end user journey tests
 *   stripe      - Run Stripe Connect integration tests
 *   all         - Run all tests (default)
 *   
 * Options:
 *   --ci        - Run in CI mode (stricter validation)
 *   --verbose   - Show detailed test output
 *   --report    - Generate and display test reports only
 * 
 * Examples:
 *   node runTests.js api           # Run only API tests
 *   node runTests.js ui            # Run only UI tests with Puppeteer
 *   node runTests.js auto          # Run automated testing suite
 *   node runTests.js stripe        # Run Stripe integration tests
 *   node runTests.js --ci          # Run all tests in CI mode
 *   
 * For full CI/CD pipeline:
 *   node testing/ci.js             # Run complete CI/CD pipeline
 */

const fs = require('fs');
const path = require('path');
const { runAllTests } = require('./utils/testRunner');
const { generateTextReport, generateJsonReport } = require('./utils/reportGenerator');

// Custom coloring functions instead of chalk (which is ESM only)
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  cyan: (text) => `\x1b[36m${text}\x1b[0m`,
  bold: {
    red: (text) => `\x1b[1m\x1b[31m${text}\x1b[0m`,
    green: (text) => `\x1b[1m\x1b[32m${text}\x1b[0m`,
    yellow: (text) => `\x1b[1m\x1b[33m${text}\x1b[0m`,
    blue: (text) => `\x1b[1m\x1b[34m${text}\x1b[0m`
  }
};

// Attempt to load the new CI/CD coordinator if available
let ciCoordinator;
try {
  ciCoordinator = require('./coordinator/testCoordinator');
} catch (error) {
  console.log(colors.yellow('CI/CD coordinator not available, using legacy test runner'));
}

// Parse command line arguments
const args = process.argv.slice(2);
const category = args.find(arg => !arg.startsWith('--')) || 'all';
const options = {
  ci: args.includes('--ci'),
  verbose: args.includes('--verbose'),
  reportOnly: args.includes('--report')
};

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