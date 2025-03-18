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
 *   [category] - Optional category of tests to run (api, e2e, frontend)
 *                If not specified, all tests will be run.
 * 
 * Example:
 *   node runTests.js api
 */

const fs = require('fs');
const path = require('path');
const { runAllTests } = require('./utils/testRunner');

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

    // Run all tests or tests for a specific category
    const testResults = await runAllTests(category);
    
    // Generate test report
    const reportDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const reportFile = path.join(reportDir, `test-report-${timestamp}.json`);
    
    fs.writeFileSync(reportFile, JSON.stringify(testResults, null, 2));
    console.log(`Report generated at: ${reportFile}`);

    // Generate human-readable report
    const textReportFile = reportFile.replace('.json', '.txt');
    const textReport = generateTextReport(testResults);
    fs.writeFileSync(textReportFile, textReport);
    
    // Output summary
    const totalTests = testResults.api.length + testResults.e2e.length + testResults.frontend.length;
    const passedTests = testResults.api.filter(t => t.passed).length + 
                        testResults.e2e.filter(t => t.passed).length + 
                        testResults.frontend.filter(t => t.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = Math.round((passedTests / totalTests) * 100);
    
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

function generateTextReport(results) {
  const lines = ['=== TEST REPORT ===', '', `Date: ${new Date().toISOString()}`, ''];
  
  // Add API test results
  lines.push('=== API Tests ===');
  results.api.forEach(test => {
    lines.push(`${test.passed ? '✓' : '✗'} ${test.name}`);
    if (!test.passed) {
      lines.push(`  Error: ${test.error}`);
    }
  });
  lines.push('');
  
  // Add E2E test results
  lines.push('=== E2E Tests ===');
  results.e2e.forEach(test => {
    lines.push(`${test.passed ? '✓' : '✗'} ${test.name}`);
    if (!test.passed) {
      lines.push(`  Error: ${test.error}`);
    }
  });
  lines.push('');
  
  // Add Frontend test results
  lines.push('=== Frontend Tests ===');
  results.frontend.forEach(test => {
    lines.push(`${test.passed ? '✓' : '✗'} ${test.name}`);
    if (!test.passed) {
      lines.push(`  Error: ${test.error}`);
    }
  });
  lines.push('');
  
  // Add summary
  const totalTests = results.api.length + results.e2e.length + results.frontend.length;
  const passedTests = results.api.filter(t => t.passed).length + 
                    results.e2e.filter(t => t.passed).length + 
                    results.frontend.filter(t => t.passed).length;
  const failedTests = totalTests - passedTests;
  const successRate = Math.round((passedTests / totalTests) * 100);
  
  lines.push('=== Summary ===');
  lines.push(`Total tests: ${totalTests}`);
  lines.push(`Passed tests: ${passedTests}`);
  lines.push(`Failed tests: ${failedTests}`);
  lines.push(`Success rate: ${successRate}%`);
  
  return lines.join('\n');
}

// Run the tests
runTests();