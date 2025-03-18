/**
 * Test Coordinator - Main CI/CD Control System
 * 
 * This system coordinates test execution, report generation, and CI/CD integration.
 * 
 * 🚨 CRITICAL NOTICE FOR AI AGENTS 🚨
 * This file is part of the core testing infrastructure. Modifications should only
 * be made with explicit instructions. Breaking this component will impact the
 * entire testing and CI/CD pipeline.
 * 
 * The test coordinator:
 * 1. Manages test execution across all categories
 * 2. Generates comprehensive test reports
 * 3. Integrates with Replit's deployment workflow
 * 4. Provides feedback on test coverage and quality
 * 
 * @module testing/coordinator/testCoordinator
 */

const path = require('path');
const fs = require('fs');

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
const { runAllTests } = require('../utils/testRunner');
const { generateJsonReport, generateTextReport } = require('../utils/reportGenerator');

// Constants for test reporting and management
const REPORTS_DIR = path.join(__dirname, '..', 'reports');
const README_PATH = path.join(__dirname, '..', '..', 'README.md');
const NOTES_PATH = path.join(__dirname, '..', 'NOTES.md');

/**
 * Run the complete test suite and generate reports
 * 
 * @param {Object} options - Test execution options
 * @param {string} options.category - Test category to run (all, api, ui, e2e, auto)
 * @param {boolean} options.verbose - Whether to output detailed logs
 * @param {boolean} options.ci - Whether running in CI mode
 * @returns {Object} Test results and reporting information
 */
async function runTestSuite(options = {}) {
  const { 
    category = 'all', 
    verbose = false,
    ci = false
  } = options;
  
  console.log(colors.bold.blue('===================================='));
  console.log(colors.bold.blue('  Stripe Connect Marketplace Tests  '));
  console.log(colors.bold.blue('===================================='));
  
  // Ensure reports directory exists
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
  
  // Create screenshots directory if it doesn't exist
  const screenshotsDir = path.join(__dirname, '..', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  try {
    // Log test execution start
    console.log(colors.cyan(`\n[${new Date().toISOString()}] Running ${category === 'all' ? 'all' : category} tests...\n`));
    
    // Execute tests based on category
    const testResults = await runAllTests(category);
    
    // Generate timestamp for reports
    const timestamp = new Date().toISOString();
    
    // Generate JSON report
    const jsonReportPath = path.join(REPORTS_DIR, `test-report-${timestamp}.json`);
    generateJsonReport(testResults, jsonReportPath);
    
    // Generate human-readable text report
    const textReportPath = path.join(REPORTS_DIR, `test-report-${timestamp}.txt`);
    generateTextReport(testResults, textReportPath);
    
    // Calculate overall statistics
    const stats = calculateStats(testResults);
    
    // Output test summary
    outputTestSummary(stats);
    
    // Check if tests passed threshold for CI
    const passedCI = stats.successRate >= 80; // 80% success threshold
    
    if (ci && !passedCI) {
      console.log(colors.bold.red('\n❌ CI tests did not meet required threshold of 80% success rate'));
    }
    
    // Return comprehensive result object
    return {
      timestamp,
      results: testResults,
      stats,
      reportPaths: {
        json: jsonReportPath,
        text: textReportPath
      },
      passedCI,
    };
  } catch (error) {
    console.error(colors.bold.red('\n❌ Error running test suite:'));
    console.error(colors.red(error.message));
    console.error(error.stack);
    
    // Return error result
    return {
      error: error.message,
      timestamp: new Date().toISOString(),
      passedCI: false
    };
  }
}

/**
 * Calculate overall test statistics from results
 * 
 * @param {Object} results - Test results from all categories
 * @returns {Object} Aggregated statistics
 */
function calculateStats(results) {
  const categories = Object.keys(results);
  let totalTests = 0;
  let passedTests = 0;
  
  // Collect stats across all categories
  const categoryStats = {};
  
  categories.forEach(category => {
    const categoryTests = results[category] || [];
    const categoryTotal = categoryTests.length;
    const categoryPassed = categoryTests.filter(test => test.passed).length;
    
    totalTests += categoryTotal;
    passedTests += categoryPassed;
    
    categoryStats[category] = {
      total: categoryTotal,
      passed: categoryPassed,
      successRate: categoryTotal > 0 ? (categoryPassed / categoryTotal) * 100 : 0
    };
  });
  
  return {
    totalTests,
    passedTests,
    failedTests: totalTests - passedTests,
    successRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
    categories: categoryStats
  };
}

/**
 * Output formatted test summary to console
 * 
 * @param {Object} stats - Test statistics
 */
function outputTestSummary(stats) {
  console.log(colors.bold.blue('\n=== Test Suite Summary ==='));
  console.log(colors.blue(`Total Tests: ${stats.totalTests}`));
  console.log(colors.green(`Passed Tests: ${stats.passedTests}`));
  console.log(colors.red(`Failed Tests: ${stats.failedTests}`));
  console.log(colors.blue(`Success Rate: ${stats.successRate.toFixed(2)}%`));
  
  console.log(colors.bold.blue('\nCategory Breakdown:'));
  
  Object.entries(stats.categories).forEach(([category, categoryStats]) => {
    const successRate = categoryStats.successRate.toFixed(2);
    let colorFn = colors.green;
    if (successRate < 80) colorFn = colors.red;
    else if (successRate < 90) colorFn = colors.yellow;
    
    console.log(colors.blue(`  ${category}: ${categoryStats.passed}/${categoryStats.total} (${colorFn(successRate + '%')})`));
  });
}

/**
 * Validate if the codebase has adequate test coverage
 * 
 * @param {string} path - Path to file or directory to validate
 * @returns {Object} Validation results
 */
function validateTestCoverage(path) {
  // This would use tools like istanbul/nyc in a real implementation
  // For now, we'll return a placeholder result
  return {
    path,
    coverage: 85, // Mock coverage percentage
    adequate: true
  };
}

/**
 * Check if the codebase is ready for deployment
 * 
 * @param {Object} testResults - Most recent test results
 * @returns {Object} Readiness assessment
 */
function checkDeploymentReadiness(testResults = null) {
  const issues = [];
  const criticalFlows = [
    'Customer Registration & Login',
    'Vendor Registration & Login',
    'Payment Initiation',
    'Full Purchase Flow',
    'Admin Authentication',
    'Admin Analytics',
    'Admin Vendors Management'
  ];
  
  // Initialize readiness as true, will set to false if any issues found
  let ready = true;
  
  // If we have test results, check for specific criteria
  if (testResults && testResults.results) {
    const stats = testResults.stats || {};
    const e2eResults = testResults.results.e2e || [];
    
    // Check 1: Minimum 90% overall success rate required for deployment
    if (stats.successRate < 90) {
      ready = false;
      issues.push(`Overall test success rate ${stats.successRate.toFixed(1)}% below required 90%`);
    }
    
    // Check 2: All API tests must pass (they're our core functionality)
    const apiResults = testResults.results.api || [];
    const apiFailures = apiResults.filter(test => !test.passed);
    if (apiFailures.length > 0) {
      ready = false;
      issues.push(`${apiFailures.length} failed API tests, all API tests must pass for deployment`);
    }
    
    // Check 3: Admin-related tests must pass (they control the platform)
    const adminApiTests = apiResults.filter(test => 
      test.name.toLowerCase().includes('admin')
    );
    const adminFailures = adminApiTests.filter(test => !test.passed);
    if (adminFailures.length > 0) {
      ready = false;
      issues.push(`${adminFailures.length} failed admin API tests, all admin endpoints must function properly`);
    }
    
    // Check 3: Critical user flows must pass
    const failedCriticalFlows = e2eResults
      .filter(test => criticalFlows.includes(test.name) && !test.passed)
      .map(test => test.name);
    
    if (failedCriticalFlows.length > 0) {
      ready = false;
      issues.push(`Critical flows failed: ${failedCriticalFlows.join(', ')}`);
    }
    
    // Check 4: Category-specific minimum success rates
    const categoryMinimums = {
      api: 100, // All API tests must pass
      e2e: 85,  // 85% of E2E tests must pass
      ui: 90    // 90% of UI tests must pass
    };
    
    Object.entries(stats.categories || {}).forEach(([category, categoryStats]) => {
      const minimum = categoryMinimums[category];
      if (minimum && categoryStats.successRate < minimum) {
        ready = false;
        issues.push(`${category.toUpperCase()} tests below minimum threshold: ${categoryStats.successRate.toFixed(1)}% (required: ${minimum}%)`);
      }
    });
  } else {
    // No test results provided, can't verify
    ready = false;
    issues.push('No test results available to verify deployment readiness');
  }
  
  return {
    ready,
    issues
  };
}

/**
 * Update development notes with test results
 * 
 * @param {Object} results - Test results
 */
function updateDevNotes(results) {
  try {
    let notes = '';
    
    if (fs.existsSync(NOTES_PATH)) {
      notes = fs.readFileSync(NOTES_PATH, 'utf8');
    }
    
    // Add latest test results to notes
    const timestamp = new Date().toISOString();
    const summary = `\n## Test Run: ${timestamp}\n`;
    
    // Check if stats exist before trying to access them
    if (results && results.stats) {
      const details = `- Total: ${results.stats.totalTests}\n` +
                      `- Passed: ${results.stats.passedTests}\n` +
                      `- Failed: ${results.stats.failedTests}\n` +
                      `- Success Rate: ${results.stats.successRate.toFixed(2)}%\n`;
      
      // Update notes with latest run
      fs.writeFileSync(NOTES_PATH, `${notes}\n${summary}${details}`);
      
      console.log(colors.green('\n✅ Development notes updated with test results'));
    } else {
      // If no stats are available, just record that tests were run
      const details = `- No test results available\n- Check logs for details\n`;
      
      // Update notes with latest run
      fs.writeFileSync(NOTES_PATH, `${notes}\n${summary}${details}`);
      
      console.log(colors.yellow('\n⚠️ Development notes updated (no test results available)'));
    }
  } catch (error) {
    console.error(colors.yellow('⚠️ Could not update development notes:'), error.message);
  }
}

module.exports = {
  runTestSuite,
  validateTestCoverage,
  checkDeploymentReadiness,
  updateDevNotes
};