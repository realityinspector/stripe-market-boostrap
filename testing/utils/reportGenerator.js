/**
 * Report Generator
 * 
 * Utility to generate test reports in various formats.
 */

const fs = require('fs');
const path = require('path');

/**
 * Generate JSON report from test results
 * @param {Object} results - Test results organized by category
 * @param {string} outputPath - Path to write report to
 */
function generateJsonReport(results, outputPath) {
  // Ensure results is an object
  results = results || {};
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      successRate: 0
    },
    results: results
  };
  
  // Calculate summary statistics
  const totalTests = 
    (results.api ? results.api.length : 0) + 
    (results.e2e ? results.e2e.length : 0) + 
    (results.frontend ? results.frontend.length : 0) +
    (results.ui ? results.ui.length : 0);
    
  const passedTests = 
    (results.api ? results.api.filter(t => t.passed).length : 0) + 
    (results.e2e ? results.e2e.filter(t => t.passed).length : 0) + 
    (results.frontend ? results.frontend.filter(t => t.passed).length : 0) +
    (results.ui ? results.ui.filter(t => t.passed).length : 0);
    
  report.summary.total = totalTests;
  report.summary.passed = passedTests;
  report.summary.failed = totalTests - passedTests;
  report.summary.successRate = totalTests > 0 
    ? Math.round((passedTests / totalTests) * 100) 
    : 0;
  
  // Create directory if it doesn't exist
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Write report to file
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  
  return report;
}

/**
 * Generate human-readable text report
 * @param {Object} report - JSON report data
 * @param {string} outputPath - Path to write text report to
 */
function generateTextReport(report, outputPath) {
  const lines = [];
  
  // Add header
  lines.push('====================================');
  lines.push('  STRIPE MARKETPLACE TEST REPORT');
  lines.push('====================================');
  lines.push('');
  lines.push(`Date: ${new Date(report.timestamp).toLocaleString()}`);
  lines.push('');
  
  // Add summary
  lines.push('SUMMARY');
  lines.push('-------');
  lines.push(`Total Tests:  ${report.summary.total}`);
  lines.push(`Passed:       ${report.summary.passed}`);
  lines.push(`Failed:       ${report.summary.failed}`);
  lines.push(`Success Rate: ${report.summary.successRate}%`);
  lines.push('');
  
  // Add API test results
  lines.push('API TESTS');
  lines.push('--------');
  if (!report.results.api || report.results.api.length === 0) {
    lines.push('No API tests run');
  } else {
    report.results.api.forEach(test => {
      lines.push(`${test.passed ? '✓' : '✗'} ${test.name}`);
      if (!test.passed) {
        lines.push(`  Error: ${test.error}`);
      }
    });
  }
  lines.push('');
  
  // Add E2E test results
  lines.push('E2E TESTS');
  lines.push('--------');
  if (!report.results.e2e || report.results.e2e.length === 0) {
    lines.push('No E2E tests run');
  } else {
    report.results.e2e.forEach(test => {
      lines.push(`${test.passed ? '✓' : '✗'} ${test.name}`);
      if (!test.passed) {
        lines.push(`  Error: ${test.error}`);
      }
    });
  }
  lines.push('');
  
  // Add Frontend test results
  lines.push('FRONTEND TESTS');
  lines.push('--------------');
  if (!report.results.frontend || report.results.frontend.length === 0) {
    lines.push('No Frontend tests run');
  } else {
    report.results.frontend.forEach(test => {
      lines.push(`${test.passed ? '✓' : '✗'} ${test.name}`);
      if (!test.passed) {
        lines.push(`  Error: ${test.error}`);
      }
    });
  }
  lines.push('');
  
  // Add conclusion
  if (report.summary.failed > 0) {
    lines.push('CONCLUSION: Some tests are failing. Please check the failures above.');
    
    // Group failures by category
    const apiFailures = report.results.api ? report.results.api.filter(t => !t.passed) : [];
    const e2eFailures = report.results.e2e ? report.results.e2e.filter(t => !t.passed) : [];
    const frontendFailures = report.results.frontend ? report.results.frontend.filter(t => !t.passed) : [];
    
    lines.push('');
    lines.push('FAILURE SUMMARY:');
    
    if (apiFailures.length > 0) {
      lines.push(`- API Failures: ${apiFailures.length}`);
      apiFailures.forEach(f => lines.push(`  - ${f.name}`));
    }
    
    if (e2eFailures.length > 0) {
      lines.push(`- E2E Failures: ${e2eFailures.length}`);
      e2eFailures.forEach(f => lines.push(`  - ${f.name}`));
    }
    
    if (frontendFailures.length > 0) {
      lines.push(`- Frontend Failures: ${frontendFailures.length}`);
      frontendFailures.forEach(f => lines.push(`  - ${f.name}`));
    }
  } else {
    lines.push('CONCLUSION: All tests passed successfully!');
  }
  
  // Write report to file
  fs.writeFileSync(outputPath, lines.join('\n'));
  
  return lines.join('\n');
}

/**
 * Generate trend analysis by comparing with previous reports
 * @param {Object} currentReport - Current test report data
 * @param {string} reportsDir - Directory containing previous reports
 * @returns {Object} - Trend analysis data
 */
function generateTrendAnalysis(currentReport, reportsDir) {
  // Only process if reports directory exists
  if (!fs.existsSync(reportsDir)) {
    return {
      trend: 'unknown',
      previousSuccessRate: 0,
      change: 0
    };
  }
  
  // Get previous reports
  const reportFiles = fs.readdirSync(reportsDir)
    .filter(file => file.endsWith('.json'))
    .sort()
    .reverse();
  
  // If there are no previous reports, return unknown trend
  if (reportFiles.length <= 1) {
    return {
      trend: 'unknown',
      previousSuccessRate: 0,
      change: 0
    };
  }
  
  // Get the most recent previous report
  const previousReportFile = reportFiles[1]; // [0] would be the current report
  const previousReport = JSON.parse(
    fs.readFileSync(path.join(reportsDir, previousReportFile), 'utf8')
  );
  
  // Calculate trend
  const currentSuccessRate = currentReport.summary.successRate;
  const previousSuccessRate = previousReport.summary.successRate;
  const change = currentSuccessRate - previousSuccessRate;
  
  let trend;
  if (change > 0) {
    trend = 'improving';
  } else if (change < 0) {
    trend = 'declining';
  } else {
    trend = 'stable';
  }
  
  return {
    trend,
    previousSuccessRate,
    change
  };
}

module.exports = {
  generateJsonReport,
  generateTextReport,
  generateTrendAnalysis
};