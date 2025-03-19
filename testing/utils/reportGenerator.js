/**
 * Report Generator
 * 
 * Utility to generate test reports in various formats with enhanced error reporting
 * and detailed failure analysis for CI/CD pipeline integration.
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
    categories: {
      api: {
        total: results.api ? results.api.length : 0,
        passed: results.api ? results.api.filter(t => t.passed).length : 0
      },
      e2e: {
        total: results.e2e ? results.e2e.length : 0,
        passed: results.e2e ? results.e2e.filter(t => t.passed).length : 0
      },
      ui: {
        total: results.ui ? results.ui.length : 0,
        passed: results.ui ? results.ui.filter(t => t.passed).length : 0
      },
      frontend: {
        total: results.frontend ? results.frontend.length : 0,
        passed: results.frontend ? results.frontend.filter(t => t.passed).length : 0
      }
    },
    results: results,
    timestamp_readable: new Date().toLocaleString()
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
    const apiPassed = report.results.api.filter(t => t.passed).length;
    const apiTotal = report.results.api.length;
    lines.push(`Results: ${apiPassed}/${apiTotal} (${Math.round((apiPassed/apiTotal) * 100)}% success rate)`);
    lines.push('');
    
    report.results.api.forEach(test => {
      lines.push(`${test.passed ? '✓' : '✗'} ${test.name}`);
      if (!test.passed) {
        lines.push(`  Error: ${test.error}`);
        if (test.details) {
          lines.push(`  Details: ${JSON.stringify(test.details, null, 2)}`);
        }
        if (test.stack) {
          const stackLines = test.stack.split('\n').slice(0, 3);
          lines.push('  Stack trace (first 3 lines):');
          stackLines.forEach(line => lines.push(`    ${line.trim()}`));
        }
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
    const e2ePassed = report.results.e2e.filter(t => t.passed).length;
    const e2eTotal = report.results.e2e.length;
    lines.push(`Results: ${e2ePassed}/${e2eTotal} (${Math.round((e2ePassed/e2eTotal) * 100)}% success rate)`);
    lines.push('');
    
    report.results.e2e.forEach(test => {
      lines.push(`${test.passed ? '✓' : '✗'} ${test.name}`);
      if (!test.passed) {
        lines.push(`  Error: ${test.error}`);
        if (test.details) {
          lines.push(`  Details: ${JSON.stringify(test.details, null, 2)}`);
        }
        if (test.stack) {
          const stackLines = test.stack.split('\n').slice(0, 3);
          lines.push('  Stack trace (first 3 lines):');
          stackLines.forEach(line => lines.push(`    ${line.trim()}`));
        }
      }
    });
  }
  lines.push('');
  
  // Add UI test results
  lines.push('UI TESTS');
  lines.push('--------');
  if (!report.results.ui || report.results.ui.length === 0) {
    lines.push('No UI tests run');
  } else {
    const uiPassed = report.results.ui.filter(t => t.passed).length;
    const uiTotal = report.results.ui.length;
    lines.push(`Results: ${uiPassed}/${uiTotal} (${Math.round((uiPassed/uiTotal) * 100)}% success rate)`);
    lines.push('');
    
    report.results.ui.forEach(test => {
      lines.push(`${test.passed ? '✓' : '✗'} ${test.name}`);
      if (!test.passed) {
        lines.push(`  Error: ${test.error}`);
        if (test.details) {
          lines.push(`  Details: ${JSON.stringify(test.details, null, 2)}`);
        }
        if (test.stack) {
          const stackLines = test.stack.split('\n').slice(0, 3);
          lines.push('  Stack trace (first 3 lines):');
          stackLines.forEach(line => lines.push(`    ${line.trim()}`));
        }
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
    const frontendPassed = report.results.frontend.filter(t => t.passed).length;
    const frontendTotal = report.results.frontend.length;
    lines.push(`Results: ${frontendPassed}/${frontendTotal} (${Math.round((frontendPassed/frontendTotal) * 100)}% success rate)`);
    lines.push('');
    
    report.results.frontend.forEach(test => {
      lines.push(`${test.passed ? '✓' : '✗'} ${test.name}`);
      if (!test.passed) {
        lines.push(`  Error: ${test.error}`);
        if (test.details) {
          lines.push(`  Details: ${JSON.stringify(test.details, null, 2)}`);
        }
        if (test.stack) {
          const stackLines = test.stack.split('\n').slice(0, 3);
          lines.push('  Stack trace (first 3 lines):');
          stackLines.forEach(line => lines.push(`    ${line.trim()}`));
        }
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
    const uiFailures = report.results.ui ? report.results.ui.filter(t => !t.passed) : [];
    const frontendFailures = report.results.frontend ? report.results.frontend.filter(t => !t.passed) : [];
    
    lines.push('');
    lines.push('FAILURE SUMMARY:');
    
    if (apiFailures.length > 0) {
      lines.push(`- API Failures: ${apiFailures.length}`);
      apiFailures.forEach(f => lines.push(`  - ${f.name}: ${f.error}`));
    }
    
    if (e2eFailures.length > 0) {
      lines.push(`- E2E Failures: ${e2eFailures.length}`);
      e2eFailures.forEach(f => lines.push(`  - ${f.name}: ${f.error}`));
    }
    
    if (uiFailures.length > 0) {
      lines.push(`- UI Failures: ${uiFailures.length}`);
      uiFailures.forEach(f => lines.push(`  - ${f.name}: ${f.error}`));
    }
    
    if (frontendFailures.length > 0) {
      lines.push(`- Frontend Failures: ${frontendFailures.length}`);
      frontendFailures.forEach(f => lines.push(`  - ${f.name}: ${f.error}`));
    }
    
    // Add recommendations for fixing the issues
    lines.push('');
    lines.push('RECOMMENDATIONS:');
    
    if (apiFailures.length > 0) {
      lines.push('- For API failures, check server routes and authentication');
    }
    if (e2eFailures.length > 0) {
      lines.push('- For E2E failures, review complete user flows and cross-component interactions');
    }
    if (uiFailures.length > 0) {
      lines.push('- For UI failures, check component rendering and user interactions');
    }
    if (frontendFailures.length > 0) {
      lines.push('- For Frontend failures, verify page rendering and API connections');
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