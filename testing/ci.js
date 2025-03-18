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
const chalk = require('chalk');
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
  console.log(chalk.blue.bold('==============================================='));
  console.log(chalk.blue.bold('  Stripe Connect Marketplace CI/CD Pipeline'));
  console.log(chalk.blue.bold('==============================================='));
  
  console.log(chalk.cyan(`\n[${new Date().toISOString()}] Starting CI pipeline...\n`));
  
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
      console.log(chalk.green.bold('\n✅ CI tests passed, checking deployment readiness...\n'));
      
      const readiness = checkDeploymentReadiness();
      
      if (readiness.ready) {
        console.log(chalk.green.bold('\n✅ Codebase ready for deployment'));
        console.log(chalk.green('\nTo deploy your application, use Replit\'s deployment feature.'));
      } else {
        console.log(chalk.yellow.bold('\n⚠️ Codebase not ready for deployment'));
        console.log(chalk.yellow('Issues:'));
        readiness.issues.forEach(issue => {
          console.log(chalk.yellow(`- ${issue}`));
        });
      }
    } else {
      console.log(chalk.red.bold('\n❌ CI tests failed, fix issues before deployment'));
    }
    
    // Final summary
    outputCISummary(testResults);
    
    // Exit with appropriate code
    process.exit(testResults.passedCI ? 0 : 1);
  } catch (error) {
    console.error(chalk.red.bold('\n❌ CI pipeline error:'));
    console.error(chalk.red(error.message));
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
  console.log(chalk.blue.bold('\n==============================================='));
  console.log(chalk.blue.bold('  CI/CD Pipeline Summary'));
  console.log(chalk.blue.bold('==============================================='));
  
  console.log(chalk.blue(`Test Run: ${new Date(results.timestamp).toLocaleString()}`));
  console.log(chalk.blue(`Success Rate: ${results.stats.successRate.toFixed(2)}%`));
  
  // Output pass/fail status
  if (results.passedCI) {
    console.log(chalk.green.bold('\n✅ CI PASSED - Ready for deployment'));
  } else {
    console.log(chalk.red.bold('\n❌ CI FAILED - Fix issues before deployment'));
  }
  
  console.log(chalk.blue.bold('\nTest Reports:'));
  console.log(chalk.blue(`JSON Report: ${results.reportPaths?.json || 'Not generated'}`));
  console.log(chalk.blue(`Text Report: ${results.reportPaths?.text || 'Not generated'}`));
  
  console.log(chalk.blue.bold('\n==============================================='));
}

// If running directly (not imported), run the CI pipeline
if (require.main === module) {
  runCIPipeline();
}

module.exports = {
  runCIPipeline
};