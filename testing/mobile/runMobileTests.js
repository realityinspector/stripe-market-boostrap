#!/usr/bin/env node

/**
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃            STRIPE CONNECT MARKETPLACE MOBILE TEST RUNNER                      ┃
 * ┃                                                                               ┃
 * ┃ 🚀 CI/CD INTEGRATION: This runner executes React Native component and         ┃
 * ┃ integration tests for the mobile application and integrates with the CI/CD    ┃
 * ┃ pipeline for automated testing and deployment                                 ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 * 
 * Usage:
 *   node runMobileTests.js [component] [options]
 * 
 * Arguments:
 *   component - Optional component name to test (e.g., ProductCard)
 * 
 * Options:
 *   --coverage   Generate test coverage report
 *   --watch      Run tests in watch mode
 *   --verbose    Show detailed test output
 *   --update     Update snapshots
 *   --ci         Run in CI mode (for CI/CD pipeline)
 * 
 * Examples:
 *   node runMobileTests.js                      # Run all mobile tests
 *   node runMobileTests.js ProductCard          # Test only ProductCard component
 *   node runMobileTests.js --coverage           # Run all tests with coverage report
 *   node runMobileTests.js --update             # Update snapshots
 */

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { generateJsonReport } = require('../utils/reportGenerator');

// Custom coloring functions (for terminals that support it)
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

// Parse command line arguments
const args = process.argv.slice(2);
const componentName = args.find(arg => !arg.startsWith('--'));
const options = {
  coverage: args.includes('--coverage'),
  watch: args.includes('--watch'),
  verbose: args.includes('--verbose'),
  updateSnapshots: args.includes('--update'),
  ci: args.includes('--ci')
};

/**
 * Main function to run mobile tests
 */
async function runMobileTests() {
  console.log(colors.bold.blue('🧪 Running React Native Mobile Tests 📱'));
  
  try {
    // Ensure Jest is installed
    ensureDependencies();
    
    // Set up environment variables for testing
    setupTestEnvironment();
    
    // Build Jest command
    const jestCommand = buildJestCommand();
    
    // Run Tests
    console.log(colors.blue(`Running ${componentName ? `tests for ${componentName}` : 'all mobile tests'}...`));
    
    try {
      execSync(jestCommand, { stdio: 'inherit' });
      console.log(colors.green('✅ Mobile tests completed successfully!'));
      
      // Generate report for CI/CD pipeline integration
      generateTestReport(true);
      
      return { success: true };
    } catch (error) {
      console.error(colors.red('❌ Mobile tests failed'));
      
      // Still generate a report even on failure for CI/CD pipeline
      generateTestReport(false);
      
      return { success: false, error };
    }
  } catch (error) {
    console.error(colors.bold.red('Error running mobile tests:'), error);
    process.exit(1);
  }
}

/**
 * Ensure all required dependencies are installed
 */
function ensureDependencies() {
  const requiredDeps = [
    '@testing-library/react-native',
    '@testing-library/jest-native',
    'react-test-renderer'
  ];
  
  try {
    // Check if package.json exists and contains the dependencies
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const allDeps = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {})
    };
    
    const missingDeps = requiredDeps.filter(dep => !allDeps[dep]);
    
    if (missingDeps.length > 0) {
      console.log(colors.yellow(`⚠️ Missing required dependencies: ${missingDeps.join(', ')}`));
      console.log(colors.yellow(`Installing missing dependencies...`));
      
      try {
        execSync(`npm install --save-dev ${missingDeps.join(' ')}`, { stdio: 'inherit' });
        console.log(colors.green('✅ Dependencies installed successfully'));
      } catch (error) {
        throw new Error(`Failed to install dependencies: ${error.message}`);
      }
    }
  } catch (error) {
    console.error(colors.red('Error checking dependencies:'), error);
    // Continue anyway, let Jest handle the missing dependencies
  }
}

/**
 * Set up environment variables for testing
 */
function setupTestEnvironment() {
  // Set environment variables
  process.env.NODE_ENV = 'test';
  process.env.JEST_WORKER_ID = 1;
  
  // For CI environment
  if (options.ci) {
    process.env.CI = 'true';
  }
}

/**
 * Build the Jest command with appropriate options
 */
function buildJestCommand() {
  const jestConfigPath = path.resolve(__dirname, 'jest.config.js');
  const hasCustomConfig = fs.existsSync(jestConfigPath);
  
  // Base command
  let command = 'npx jest';
  
  // Add configuration
  if (hasCustomConfig) {
    command += ` --config=${jestConfigPath}`;
  } else {
    // If no custom config, use sensible defaults
    command += ' --preset=react-native';
  }
  
  // Add test pattern if a specific component was specified
  if (componentName) {
    command += ` "${componentName}"`;
  } else {
    // Look in all mobile test directories
    command += ' "testing/mobile"';
  }
  
  // Add options
  if (options.coverage) {
    command += ' --coverage';
  }
  
  if (options.watch) {
    command += ' --watch';
  }
  
  if (options.verbose) {
    command += ' --verbose';
  }
  
  if (options.updateSnapshots) {
    command += ' --updateSnapshot';
  }
  
  if (options.ci) {
    command += ' --ci --runInBand';
  }
  
  return command;
}

/**
 * Generate test report for CI/CD pipeline integration
 */
function generateTestReport(success) {
  try {
    // Set up report directory
    const reportDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const reportFile = path.join(reportDir, `mobile-test-report-${timestamp}.json`);
    
    // Create report structure that's compatible with the CI/CD pipeline
    const report = {
      timestamp: new Date().toISOString(),
      type: 'mobile',
      success,
      component: componentName || 'all',
      summary: {
        total: 0,        // Would be filled with actual data in a real implementation
        passed: 0,       // Would be filled with actual data in a real implementation
        failed: 0,       // Would be filled with actual data in a real implementation
        skipped: 0       // Would be filled with actual data in a real implementation
      },
      options: { ...options }
    };
    
    // Try to parse coverage data if available
    if (options.coverage) {
      try {
        const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-final.json');
        if (fs.existsSync(coveragePath)) {
          const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
          report.coverage = {
            statements: 0,  // These would be calculated from the coverage data
            branches: 0,    // in a full implementation
            functions: 0,
            lines: 0
          };
        }
      } catch (error) {
        console.warn(colors.yellow('Warning: Could not parse coverage data'));
      }
    }
    
    // Write report to file
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(colors.blue(`📋 Test report generated at: ${reportFile}`));
    
  } catch (error) {
    console.error(colors.yellow('Warning: Failed to generate test report'), error);
  }
}

// If this script is run directly, execute the tests
if (require.main === module) {
  runMobileTests().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}

// Export for use in CI/CD pipeline
module.exports = { runMobileTests };