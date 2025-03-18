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
    
    // If tests passed, check deployment readiness
    if (testResults.passedCI) {
      console.log(colors.bold.green('\n✅ CI tests passed, checking deployment readiness...\n'));
      
      const readiness = checkDeploymentReadiness();
      
      if (readiness.ready) {
        console.log(colors.bold.green('\n✅ Codebase ready for deployment'));
        console.log(colors.green('\nTo deploy your application, use Replit\'s deployment feature.'));
      } else {
        console.log(colors.bold.yellow('\n⚠️ Codebase not ready for deployment'));
        console.log(colors.yellow('Issues:'));
        readiness.issues.forEach(issue => {
          console.log(colors.yellow(`- ${issue}`));
        });
      }
    } else {
      console.log(colors.bold.red('\n❌ CI tests failed, fix issues before deployment'));
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
  
  console.log(colors.blue(`Test Run: ${new Date(results.timestamp).toLocaleString()}`));
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
  
  console.log(colors.bold.blue('\n==============================================='));
}

// If running directly (not imported), run the CI pipeline
if (require.main === module) {
  runCIPipeline();
}

module.exports = {
  runCIPipeline
};