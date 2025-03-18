/**
 * Test Coordinator
 * 
 * This is the main entry point for the automated testing system.
 * It coordinates all the different types of tests, collects results,
 * and generates comprehensive reports.
 */

const { performApiTests } = require('./apiTester');
const { performUiTests } = require('./uiTester');
const { performE2eTests } = require('./e2eTester');
const { generateReport } = require('./reportGenerator');

// Simple chalk replacement for terminal colors
const chalk = {
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  bold: {
    blue: (text) => `\x1b[1m\x1b[34m${text}\x1b[0m`,
    green: (text) => `\x1b[1m\x1b[32m${text}\x1b[0m`,
    red: (text) => `\x1b[1m\x1b[31m${text}\x1b[0m`
  }
};

// Default testing configuration
const config = {
  baseUrl: 'http://localhost:8000',
  clientUrl: 'http://localhost:8000',
  timeouts: {
    apiResponse: 5000,
    pageLoad: 10000,
    elementAppear: 5000
  },
  runApi: true,
  runUi: true,
  runE2e: true,
  screenshots: true,
  screenshotDir: './testing/screenshots',
  reportsDir: './testing/reports',
  debug: false
};

/**
 * Run all tests and generate reports
 */
async function runAllTests() {
  console.log('🚀 Starting automated test suite...');
  
  const startTime = Date.now();
  const results = { api: {}, ui: {}, e2e: {} };
  let summary = { totalTests: 0, totalPassed: 0, totalFailed: 0, successRate: 0 };
  
  try {
    // Run API tests if enabled
    if (config.runApi) {
      console.log('\n📡 Running API tests...');
      results.api = await performApiTests(config);
      console.log(`API tests complete: ${results.api.passed.length} passed, ${results.api.failed.length} failed`);
    }
    
    // Run UI tests if enabled
    if (config.runUi) {
      console.log('\n🖥️ Running UI tests...');
      results.ui = await performUiTests(config);
      console.log(`UI tests complete: ${results.ui.passed.length} passed, ${results.ui.failed.length} failed`);
    }
    
    // Run E2E tests if enabled
    if (config.runE2e) {
      console.log('\n🔄 Running E2E tests...');
      results.e2e = await performE2eTests(config);
      console.log(`E2E tests complete: ${results.e2e.passed.length} passed, ${results.e2e.failed.length} failed`);
    }
    
    // Calculate summary statistics
    summary = calculateSummary(results);
    
    // Generate comprehensive report
    const reportPath = await generateReport(results, config);
    console.log(`\n📊 Test report generated: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ Error running tests:', error);
    throw error;
  }
  
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n✅ All tests completed in ${totalTime}s`);
  console.log(`📈 Results: ${summary.totalPassed}/${summary.totalTests} passed (${summary.successRate}% success rate)`);
  
  return { results, summary, config };
}

/**
 * Calculate summary statistics from test results
 */
function calculateSummary(results) {
  const apiTotal = (results.api.passed?.length || 0) + (results.api.failed?.length || 0);
  const uiTotal = (results.ui.passed?.length || 0) + (results.ui.failed?.length || 0);
  const e2eTotal = (results.e2e.passed?.length || 0) + (results.e2e.failed?.length || 0);
  
  const totalTests = apiTotal + uiTotal + e2eTotal;
  const totalPassed = (results.api.passed?.length || 0) + (results.ui.passed?.length || 0) + (results.e2e.passed?.length || 0);
  const totalFailed = totalTests - totalPassed;
  const successRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;
  
  return {
    totalTests,
    totalPassed,
    totalFailed,
    successRate,
    apiResults: {
      total: apiTotal,
      passed: results.api.passed?.length || 0,
      failed: results.api.failed?.length || 0
    },
    uiResults: {
      total: uiTotal,
      passed: results.ui.passed?.length || 0,
      failed: results.ui.failed?.length || 0
    },
    e2eResults: {
      total: e2eTotal,
      passed: results.e2e.passed?.length || 0,
      failed: results.e2e.failed?.length || 0
    }
  };
}

/**
 * Schedule periodic tests
 * @param {number} intervalMinutes - Interval in minutes for running tests
 */
function scheduleTests(intervalMinutes = 60) {
  console.log(`🕒 Scheduling tests to run every ${intervalMinutes} minutes`);
  
  // Run tests immediately
  runAllTests().catch(error => {
    console.error('Error in scheduled test run:', error);
  });
  
  // Schedule periodic runs
  const intervalMs = intervalMinutes * 60 * 1000;
  setInterval(() => {
    console.log(`\n⏰ Running scheduled tests at ${new Date().toISOString()}`);
    runAllTests().catch(error => {
      console.error('Error in scheduled test run:', error);
    });
  }, intervalMs);
  
  console.log('📆 Test scheduling active, press Ctrl+C to stop');
}

module.exports = {
  runAllTests,
  scheduleTests,
  config
};