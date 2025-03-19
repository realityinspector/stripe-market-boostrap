#!/usr/bin/env node

/**
 * CI/CD Pipeline Controller
 * 
 * This script orchestrates the CI/CD process for the Stripe Connect Marketplace.
 * It coordinates test execution, reporting, and deployment readiness checks.
 * 
 * 🚨 CRITICAL NOTICE FOR AI AGENTS 🚨
 * This file is part of the core CI/CD infrastructure. Modifications should only
 * be made with explicit instructions. Breaking this component will impact the
 * entire testing and deployment pipeline.
 * 
 * @module testing/ci
 */

const path = require('path');
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
const { runTestSuite, checkDeploymentReadiness, updateDevNotes } = require('./coordinator/testCoordinator');

// Process command line arguments
const args = process.argv.slice(2);
const options = {
  category: args.find(arg => !arg.startsWith('--')) || 'all',
  ci: args.includes('--ci'),
  verbose: args.includes('--verbose'),
  report: args.includes('--report-only')
};

/**
 * Run the CI pipeline
 */
async function runCIPipeline() {
  console.log(colors.bold.blue('==============================================='));
  console.log(colors.bold.blue('  Stripe Connect Marketplace CI/CD Pipeline'));
  console.log(colors.bold.blue('==============================================='));
  
  console.log(colors.cyan(`\n[${new Date().toISOString()}] Starting CI pipeline...\n`));
  
  try {
    // Run test suite
    const testResults = await runTestSuite({
      category: options.category,
      verbose: options.verbose,
      ci: options.ci
    });
    
    // Update development notes with test results
    updateDevNotes(testResults);
    
    // Check deployment readiness with our test results
    console.log(colors.bold.blue('\nChecking deployment readiness based on quality gates...\n'));
    
    const readiness = checkDeploymentReadiness(testResults);
    
    if (readiness.ready) {
      console.log(colors.bold.green('✅ Codebase PASSED all quality gates and is ready for deployment'));
      console.log(colors.green('\nDeployment next steps:'));
      console.log(colors.green('1. Use Replit\'s deployment feature to deploy your application'));
      console.log(colors.green('2. Verify the deployment in the production environment'));
      console.log(colors.green('3. Monitor for any post-deployment issues'));
    } else {
      console.log(colors.bold.yellow('⚠️ Codebase failed one or more deployment quality gates'));
      console.log(colors.yellow('\nDeployment blockers:'));
      readiness.issues.forEach(issue => {
        console.log(colors.yellow(`- ${issue}`));
      });
      console.log(colors.yellow('\nActions required before deployment:'));
      console.log(colors.yellow('1. Fix the issues listed above'));
      console.log(colors.yellow('2. Re-run the CI pipeline to verify fixes'));
      console.log(colors.yellow('3. Ensure all quality gates pass before deployment'));
    }
    
    // Final summary
    outputCISummary(testResults);
    
    // Exit with appropriate code
    process.exit(testResults.passedCI ? 0 : 1);
  } catch (error) {
    console.error(colors.bold.red('\n❌ CI pipeline error:'));
    console.error(colors.red(error.message));
    console.error(error.stack);
    process.exit(1);
  }
}

/**
 * Output a formatted CI/CD pipeline summary
 * 
 * @param {Object} results - Test results
 */
function outputCISummary(results) {
  console.log(colors.bold.blue('\n==============================================='));
  console.log(colors.bold.blue('  CI/CD Pipeline Summary'));
  console.log(colors.bold.blue('==============================================='));
  
  // Ensure results is an object
  if (!results) {
    results = {};
  }
  
  console.log(colors.blue(`Test Run: ${new Date(results.timestamp || Date.now()).toLocaleString()}`));
  
  // Check if stats exist before trying to access them
  if (results.stats && typeof results.stats.successRate !== 'undefined') {
    console.log(colors.blue(`Success Rate: ${results.stats.successRate.toFixed(2)}%`));
    
    // Output pass/fail status
    if (results.passedCI) {
      console.log(colors.bold.green('\n✅ CI PASSED - Ready for deployment'));
    } else {
      console.log(colors.bold.red('\n❌ CI FAILED - Fix issues before deployment'));
    }
    
    console.log(colors.bold.blue('\nTest Reports:'));
    console.log(colors.blue(`JSON Report: ${results.reportPaths?.json || 'Not generated'}`));
    console.log(colors.blue(`Text Report: ${results.reportPaths?.text || 'Not generated'}`));
  } else {
    console.log(colors.bold.red('\n❌ No test statistics available'));
    console.log(colors.red('Run tests with: node testing/runTests.js [category]'));
  }
  
  console.log(colors.bold.blue('\n==============================================='));
}

// If running directly (not imported), run the CI pipeline
if (require.main === module) {
  runCIPipeline();
}

module.exports = {
  runCIPipeline
};