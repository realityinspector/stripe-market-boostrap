#!/usr/bin/env node

/**
 * Automated Testing Runner
 * 
 * This script runs the automated testing system, which includes:
 * - API testing for backend endpoints
 * - UI testing for frontend components using Puppeteer
 * - E2E testing for complete user flows
 * 
 * Usage:
 *   node runAutomatedTests.js [options]
 * 
 * Options:
 *   --api-only       Run only API tests
 *   --ui-only        Run only UI tests
 *   --e2e-only       Run only E2E tests
 *   --monitor        Run tests in monitoring mode (repeats at intervals)
 *   --interval=N     Set monitoring interval in minutes (default: 60)
 *   --help           Show this help message
 */

const { runAllTests, scheduleTests, config } = require('./testCoordinator');
const chalk = require('chalk');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  apiOnly: args.includes('--api-only'),
  uiOnly: args.includes('--ui-only'),
  e2eOnly: args.includes('--e2e-only'),
  monitor: args.includes('--monitor'),
  help: args.includes('--help')
};

// Extract interval parameter
const intervalArg = args.find(arg => arg.startsWith('--interval='));
options.interval = intervalArg 
  ? parseInt(intervalArg.split('=')[1]) 
  : 60; // Default to 60 minutes

// Show help message if requested
if (options.help) {
  console.log(chalk.bold.blue('Automated Testing Runner'));
  console.log(chalk.yellow('\nThis script runs the automated testing system.\n'));
  console.log(chalk.yellow('Usage:'));
  console.log('  node runAutomatedTests.js [options]');
  console.log(chalk.yellow('\nOptions:'));
  console.log('  --api-only       Run only API tests');
  console.log('  --ui-only        Run only UI tests');
  console.log('  --e2e-only       Run only E2E tests');
  console.log('  --monitor        Run tests in monitoring mode (repeats at intervals)');
  console.log('  --interval=N     Set monitoring interval in minutes (default: 60)');
  console.log('  --help           Show this help message');
  process.exit(0);
}

// Override configuration based on options
if (options.apiOnly) {
  console.log(chalk.yellow('Running API tests only'));
  config.runApi = true;
  config.runUi = false;
  config.runE2e = false;
} else if (options.uiOnly) {
  console.log(chalk.yellow('Running UI tests only'));
  config.runApi = false;
  config.runUi = true;
  config.runE2e = false;
} else if (options.e2eOnly) {
  console.log(chalk.yellow('Running E2E tests only'));
  config.runApi = false;
  config.runUi = false;
  config.runE2e = true;
} else {
  // Run all test types by default
  config.runApi = true;
  config.runUi = true;
  config.runE2e = true;
}

// Execute tests based on mode
if (options.monitor) {
  console.log(chalk.blue.bold(`Starting test monitoring at ${options.interval} minute intervals...`));
  scheduleTests(options.interval);
} else {
  console.log(chalk.blue.bold('Running automated tests once...'));
  runAllTests().then(results => {
    const { summary } = results;
    
    if (summary.totalFailed > 0) {
      process.exit(1); // Exit with error if any tests failed
    } else {
      process.exit(0); // Success
    }
  }).catch(error => {
    console.error(chalk.red('Error running tests:'), error);
    process.exit(1);
  });
}