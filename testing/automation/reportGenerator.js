/**
 * Report Generator
 * 
 * Generates detailed test reports in various formats (JSON, HTML, console output)
 * with visualization of test results.
 */

const fs = require('fs');
const path = require('path');

/**
 * Generate a test report
 * @param {Object} results - Combined test results
 * @param {Object} config - Testing configuration
 * @returns {string} Report file path
 */
async function generateReport(results, config) {
  // Create report structure
  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    summary: calculateSummary(results),
    environment: {
      apiServer: config.baseUrl,
      clientUrl: config.clientUrl,
      timeouts: config.timeouts,
      browserVersion: 'Mock Browser'  // Will be updated if real browser info is available
    },
    results
  };
  
  // Ensure report directory exists
  const reportsDir = config.reportsDir || './testing/reports';
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  // Generate JSON report
  const jsonReportPath = path.join(reportsDir, `automated-report-${timestamp.replace(/:/g, '-')}.json`);
  fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));
  
  // Generate HTML report
  const htmlReport = generateHtmlReport(report);
  const htmlReportPath = jsonReportPath.replace('.json', '.html');
  fs.writeFileSync(htmlReportPath, htmlReport);
  
  // Print console report
  printConsoleReport(report);
  
  return jsonReportPath;
}

/**
 * Calculate summary statistics from results
 * @param {Object} results - Test results object
 * @returns {Object} Summary statistics
 */
function calculateSummary(results) {
  const apiPassed = results.api.passed?.length || 0;
  const apiFailed = results.api.failed?.length || 0;
  const apiWarnings = results.api.warnings?.length || 0;
  
  const uiPassed = results.ui.passed?.length || 0;
  const uiFailed = results.ui.failed?.length || 0;
  const uiWarnings = results.ui.warnings?.length || 0;
  
  const e2ePassed = results.e2e.passed?.length || 0;
  const e2eFailed = results.e2e.failed?.length || 0;
  const e2eWarnings = results.e2e.warnings?.length || 0;
  
  const totalPassed = apiPassed + uiPassed + e2ePassed;
  const totalFailed = apiFailed + uiFailed + e2eFailed;
  const totalWarnings = apiWarnings + uiWarnings + e2eWarnings;
  const totalTests = totalPassed + totalFailed;
  const successRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;
  
  return {
    totalTests,
    totalPassed,
    totalFailed,
    totalWarnings,
    successRate,
    api: {
      total: apiPassed + apiFailed,
      passed: apiPassed,
      failed: apiFailed,
      warnings: apiWarnings
    },
    ui: {
      total: uiPassed + uiFailed,
      passed: uiPassed,
      failed: uiFailed,
      warnings: uiWarnings
    },
    e2e: {
      total: e2ePassed + e2eFailed,
      passed: e2ePassed,
      failed: e2eFailed,
      warnings: e2eWarnings
    }
  };
}

/**
 * Generate HTML report from JSON data
 * @param {Object} report - JSON report data
 * @returns {string} HTML report content
 */
function generateHtmlReport(report) {
  const summary = report.summary;
  
  // Function to create the test results table for a category
  const createTestTable = (category, results) => {
    if (!results[category] || (!results[category].passed?.length && !results[category].failed?.length)) {
      return `<p>No ${category.toUpperCase()} tests were run.</p>`;
    }
    
    let html = `
      <h3>${category.toUpperCase()} Tests</h3>
      <table class="tests-table">
        <thead>
          <tr>
            <th>Test</th>
            <th>Status</th>
            <th>Time</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    // Add passed tests
    for (const test of results[category].passed || []) {
      html += `
        <tr class="passed">
          <td>${escapeHtml(test.name)}</td>
          <td>PASSED</td>
          <td>${new Date(test.timestamp).toLocaleTimeString()}</td>
          <td>${formatDetails(test.details)}</td>
        </tr>
      `;
    }
    
    // Add failed tests
    for (const test of results[category].failed || []) {
      html += `
        <tr class="failed">
          <td>${escapeHtml(test.name)}</td>
          <td>FAILED</td>
          <td>${new Date(test.timestamp).toLocaleTimeString()}</td>
          <td>
            ${escapeHtml(test.error || '')}
            ${formatDetails(test.details)}
          </td>
        </tr>
      `;
    }
    
    // Add warnings if any
    if (results[category].warnings && results[category].warnings.length > 0) {
      for (const warning of results[category].warnings) {
        html += `
          <tr class="warning">
            <td>${escapeHtml(warning.name)}</td>
            <td>WARNING</td>
            <td>${new Date(warning.timestamp).toLocaleTimeString()}</td>
            <td>${escapeHtml(warning.message || '')}</td>
          </tr>
        `;
      }
    }
    
    html += `
        </tbody>
      </table>
    `;
    
    return html;
  };
  
  // Format object details as HTML
  const formatDetails = (details) => {
    if (!details || Object.keys(details).length === 0) return '';
    
    let html = '<details><summary>Details</summary><pre>';
    html += escapeHtml(JSON.stringify(details, null, 2));
    html += '</pre></details>';
    
    return html;
  };
  
  // Escape HTML to prevent XSS
  const escapeHtml = (text) => {
    if (text === undefined || text === null) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  // Generate pie chart data
  const pieChartData = `
    {
      passed: ${summary.totalPassed},
      failed: ${summary.totalFailed},
      warnings: ${summary.totalWarnings}
    }
  `;
  
  // Create HTML report
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Automated Test Report - ${new Date(report.timestamp).toLocaleString()}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }
        .summary {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .summary-card {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 15px;
          width: 30%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .summary-card h3 {
          margin-top: 0;
          border-bottom: 1px solid #ddd;
          padding-bottom: 10px;
        }
        .tests-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .tests-table th, .tests-table td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }
        .tests-table th {
          background: #f2f2f2;
        }
        .passed { background-color: #e6ffe6; }
        .failed { background-color: #ffe6e6; }
        .warning { background-color: #fffbe6; }
        .chart-container {
          width: 200px;
          height: 200px;
          margin: 0 auto;
        }
        .progress-bar {
          height: 20px;
          background-color: #e0e0e0;
          border-radius: 10px;
          margin-bottom: 10px;
          overflow: hidden;
        }
        .progress-value {
          height: 20px;
          background-color: #4CAF50;
          border-radius: 10px 0 0 10px;
        }
        details {
          margin-top: 8px;
        }
        summary {
          cursor: pointer;
          color: #0066cc;
        }
        pre {
          background: #f5f5f5;
          padding: 10px;
          border-radius: 4px;
          overflow-x: auto;
        }
      </style>
    </head>
    <body>
      <header>
        <h1>Automated Test Report</h1>
        <p>Generated on ${new Date(report.timestamp).toLocaleString()}</p>
      </header>
      
      <div class="summary">
        <div class="summary-card">
          <h3>Test Results</h3>
          <div class="progress-bar">
            <div class="progress-value" style="width: ${summary.successRate}%;"></div>
          </div>
          <p><strong>Success Rate:</strong> ${summary.successRate}%</p>
          <p><strong>Total Tests:</strong> ${summary.totalTests}</p>
          <p><strong>Passed:</strong> ${summary.totalPassed}</p>
          <p><strong>Failed:</strong> ${summary.totalFailed}</p>
          <p><strong>Warnings:</strong> ${summary.totalWarnings}</p>
        </div>
        <div class="summary-card">
          <h3>API Tests</h3>
          <p><strong>Total:</strong> ${summary.api.total}</p>
          <p><strong>Passed:</strong> ${summary.api.passed}</p>
          <p><strong>Failed:</strong> ${summary.api.failed}</p>
          <p><strong>Warnings:</strong> ${summary.api.warnings}</p>
        </div>
        <div class="summary-card">
          <h3>UI & E2E Tests</h3>
          <p><strong>UI Total:</strong> ${summary.ui.total}</p>
          <p><strong>UI Passed:</strong> ${summary.ui.passed} / Failed: ${summary.ui.failed}</p>
          <p><strong>E2E Total:</strong> ${summary.e2e.total}</p>
          <p><strong>E2E Passed:</strong> ${summary.e2e.passed} / Failed: ${summary.e2e.failed}</p>
        </div>
      </div>
      
      <div class="test-details">
        ${createTestTable('api', report.results)}
        ${createTestTable('ui', report.results)}
        ${createTestTable('e2e', report.results)}
      </div>
      
      <div class="environment">
        <h3>Test Environment</h3>
        <p><strong>API Server:</strong> ${report.environment.apiServer}</p>
        <p><strong>Client URL:</strong> ${report.environment.clientUrl}</p>
        <p><strong>Browser:</strong> ${report.environment.browserVersion}</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Print a formatted console report
 * @param {Object} report - JSON report data
 */
function printConsoleReport(report) {
  console.log('\n=========== TEST REPORT ===========');
  console.log(`Generated: ${new Date(report.timestamp).toLocaleString()}`);
  console.log('==================================');
  console.log(`Total Tests: ${report.summary.totalTests}`);
  console.log(`Passed: ${report.summary.totalPassed}`);
  console.log(`Failed: ${report.summary.totalFailed}`);
  console.log(`Warnings: ${report.summary.totalWarnings}`);
  console.log(`Success Rate: ${report.summary.successRate}%`);
  console.log('==================================');
  
  console.log('\nAPI Tests:');
  console.log(`  Total: ${report.summary.api.total}`);
  console.log(`  Passed: ${report.summary.api.passed}`);
  console.log(`  Failed: ${report.summary.api.failed}`);
  
  console.log('\nUI Tests:');
  console.log(`  Total: ${report.summary.ui.total}`);
  console.log(`  Passed: ${report.summary.ui.passed}`);
  console.log(`  Failed: ${report.summary.ui.failed}`);
  
  console.log('\nE2E Tests:');
  console.log(`  Total: ${report.summary.e2e.total}`);
  console.log(`  Passed: ${report.summary.e2e.passed}`);
  console.log(`  Failed: ${report.summary.e2e.failed}`);
  
  if (report.summary.totalFailed > 0) {
    console.log('\n⚠️ FAILED TESTS:');
    
    const logFailedTests = (category) => {
      if (report.results[category].failed && report.results[category].failed.length > 0) {
        console.log(`\n${category.toUpperCase()} Failures:`);
        report.results[category].failed.forEach(test => {
          console.log(`  - ${test.name}: ${test.error}`);
        });
      }
    };
    
    logFailedTests('api');
    logFailedTests('ui');
    logFailedTests('e2e');
  }
  
  console.log('\n==================================');
}

module.exports = {
  generateReport,
  generateHtmlReport,
  printConsoleReport
};