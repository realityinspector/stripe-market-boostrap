#!/usr/bin/env node

/**
 * Test Suite Runner
 * 
 * This script provides a user-friendly interface for running the test suite.
 * 
 * Usage:
 *   node run.js [options]
 * 
 * Options:
 *   --api       Run only API tests
 *   --e2e       Run only E2E tests
 *   --frontend  Run only frontend tests
 *   --help      Show help
 *   --report    Show most recent test report
 * 
 * Examples:
 *   node run.js               # Run all tests
 *   node run.js --api         # Run only API tests
 *   node run.js --report      # Display the most recent test report
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { runAllTests } = require('./utils/testRunner');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  help: args.includes('--help'),
  api: args.includes('--api'),
  e2e: args.includes('--e2e'),
  frontend: args.includes('--frontend'),
  report: args.includes('--report')
};

// Show help
if (options.help) {
  console.log(`
  Stripe Connect Marketplace Test Suite
  
  Usage:
    node run.js [options]
  
  Options:
    --api       Run only API tests
    --e2e       Run only E2E tests
    --frontend  Run only frontend tests
    --help      Show this help message
    --report    Show most recent test report
  
  Examples:
    node run.js               # Run all tests
    node run.js --api         # Run only API tests
    node run.js --report      # Display the most recent test report
  `);
  process.exit(0);
}

// Show most recent test report
if (options.report) {
  const reportsDir = path.join(__dirname, 'reports');
  
  if (!fs.existsSync(reportsDir)) {
    console.error('No reports found.');
    process.exit(1);
  }
  
  const reportFiles = fs.readdirSync(reportsDir)
    .filter(file => file.endsWith('.txt'))
    .sort()
    .reverse();
  
  if (reportFiles.length === 0) {
    console.error('No test reports found.');
    process.exit(1);
  }
  
  const latestReport = path.join(reportsDir, reportFiles[0]);
  const reportContent = fs.readFileSync(latestReport, 'utf8');
  
  console.log(reportContent);
  process.exit(0);
}

// Determine which tests to run
let testCategory = null;
if (options.api) {
  testCategory = 'api';
} else if (options.e2e) {
  testCategory = 'e2e';
} else if (options.frontend) {
  testCategory = 'frontend';
}

// Run the test runner script with appropriate arguments
const runnerPath = path.join(__dirname, 'runTests.js');
const args2 = [runnerPath];
if (testCategory) {
  args2.push(testCategory);
}

const child = spawn('node', args2, { stdio: 'inherit' });

child.on('close', (code) => {
  process.exit(code);
});