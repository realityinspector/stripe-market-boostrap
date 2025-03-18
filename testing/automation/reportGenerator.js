/**
 * Report Generator
 * 
 * Generates detailed test reports in various formats (JSON, HTML, console output)
 * with visualization of test results.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

/**
 * Generate a test report
 * @param {Object} results - Combined test results
 * @param {Object} config - Testing configuration
 * @returns {string} Report file path
 */
async function generateReport(results, config) {
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const reportDir = config.reportDir;
  
  // Ensure report directory exists
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  // Generate JSON report
  const jsonReport = {
    timestamp,
    summary: {
      api: {
        total: results.api.tests.length,
        passed: results.api.passed,
        failed: results.api.failed,
        successRate: results.api.tests.length > 0 
          ? Math.round((results.api.passed / results.api.tests.length) * 100) 
          : 0
      },
      ui: {
        total: results.ui.tests.length,
        passed: results.ui.passed,
        failed: results.ui.failed,
        successRate: results.ui.tests.length > 0 
          ? Math.round((results.ui.passed / results.ui.tests.length) * 100) 
          : 0,
        mockBrowser: results.ui.mockBrowser || false
      },
      e2e: {
        total: results.e2e.tests.length,
        passed: results.e2e.passed,
        failed: results.e2e.failed,
        successRate: results.e2e.tests.length > 0 
          ? Math.round((results.e2e.passed / results.e2e.tests.length) * 100) 
          : 0,
        mockBrowser: results.e2e.mockBrowser || false
      },
      overall: {
        total: results.api.tests.length + results.ui.tests.length + results.e2e.tests.length,
        passed: results.api.passed + results.ui.passed + results.e2e.passed,
        failed: results.api.failed + results.ui.failed + results.e2e.failed
      }
    },
    details: {
      api: results.api.tests,
      ui: results.ui.tests,
      e2e: results.e2e.tests
    },
    config: {
      apiBaseUrl: config.apiBaseUrl,
      frontendUrl: config.frontendUrl,
      mockAuth: config.mockAuth,
      headless: config.headless
    }
  };
  
  // Calculate overall success rate
  jsonReport.summary.overall.successRate = jsonReport.summary.overall.total > 0 
    ? Math.round((jsonReport.summary.overall.passed / jsonReport.summary.overall.total) * 100) 
    : 0;
  
  // Write JSON report
  const jsonReportPath = path.join(reportDir, `test-report-${timestamp}.json`);
  fs.writeFileSync(jsonReportPath, JSON.stringify(jsonReport, null, 2));
  console.log(chalk.yellow(`JSON report saved to: ${jsonReportPath}`));
  
  // Generate HTML report
  const htmlReportPath = path.join(reportDir, `test-report-${timestamp}.html`);
  const htmlReport = generateHtmlReport(jsonReport);
  fs.writeFileSync(htmlReportPath, htmlReport);
  console.log(chalk.yellow(`HTML report saved to: ${htmlReportPath}`));
  
  // Generate console report
  printConsoleReport(jsonReport);
  
  return jsonReportPath;
}

/**
 * Generate HTML report from JSON data
 * @param {Object} report - JSON report data
 * @returns {string} HTML report content
 */
function generateHtmlReport(report) {
  // Use template literals for HTML report
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Report - ${report.timestamp}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1, h2, h3 {
      color: #2c3e50;
    }
    .summary {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      flex: 1;
      min-width: 200px;
    }
    .overall-card {
      background: #e3f2fd;
    }
    .progress-bar {
      height: 10px;
      background: #e0e0e0;
      border-radius: 5px;
      overflow: hidden;
      margin-top: 10px;
    }
    .progress-fill {
      height: 100%;
      background: #4caf50;
    }
    .test-section {
      margin-bottom: 30px;
    }
    .test-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .test-table th, .test-table td {
      text-align: left;
      padding: 10px;
      border-bottom: 1px solid #e0e0e0;
    }
    .test-table th {
      background: #f5f5f5;
    }
    .test-table tr:hover {
      background: #f8f9fa;
    }
    .test-pass {
      color: #4caf50;
    }
    .test-fail {
      color: #f44336;
    }
    .warning {
      color: #ff9800;
      font-style: italic;
    }
    .error-details {
      background: #ffebee;
      border-radius: 4px;
      padding: 10px;
      margin-top: 5px;
      white-space: pre-wrap;
      font-family: monospace;
      font-size: 0.9em;
      max-height: 200px;
      overflow-y: auto;
    }
    .hidden {
      display: none;
    }
    .config-info {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      margin-top: 20px;
    }
    .toggle-btn {
      background: none;
      border: none;
      color: #2196f3;
      cursor: pointer;
      padding: 0;
      font-size: 0.9em;
    }
    .toggle-btn:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <h1>Automated Test Report</h1>
  <p>Generated on: ${new Date(report.timestamp).toLocaleString()}</p>
  
  <h2>Summary</h2>
  <div class="summary">
    <div class="summary-card overall-card">
      <h3>Overall</h3>
      <p>Success Rate: <strong>${report.summary.overall.successRate}%</strong></p>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${report.summary.overall.successRate}%"></div>
      </div>
      <p>Total Tests: ${report.summary.overall.total}</p>
      <p>Passed: <span class="test-pass">${report.summary.overall.passed}</span></p>
      <p>Failed: <span class="test-fail">${report.summary.overall.failed}</span></p>
    </div>
    
    <div class="summary-card">
      <h3>API Tests</h3>
      <p>Success Rate: <strong>${report.summary.api.successRate}%</strong></p>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${report.summary.api.successRate}%"></div>
      </div>
      <p>Total Tests: ${report.summary.api.total}</p>
      <p>Passed: <span class="test-pass">${report.summary.api.passed}</span></p>
      <p>Failed: <span class="test-fail">${report.summary.api.failed}</span></p>
    </div>
    
    <div class="summary-card">
      <h3>UI Tests</h3>
      <p>Success Rate: <strong>${report.summary.ui.successRate}%</strong></p>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${report.summary.ui.successRate}%"></div>
      </div>
      <p>Total Tests: ${report.summary.ui.total}</p>
      <p>Passed: <span class="test-pass">${report.summary.ui.passed}</span></p>
      <p>Failed: <span class="test-fail">${report.summary.ui.failed}</span></p>
      ${report.summary.ui.mockBrowser ? '<p class="warning">Using mock browser</p>' : ''}
    </div>
    
    <div class="summary-card">
      <h3>E2E Tests</h3>
      <p>Success Rate: <strong>${report.summary.e2e.successRate}%</strong></p>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${report.summary.e2e.successRate}%"></div>
      </div>
      <p>Total Tests: ${report.summary.e2e.total}</p>
      <p>Passed: <span class="test-pass">${report.summary.e2e.passed}</span></p>
      <p>Failed: <span class="test-fail">${report.summary.e2e.failed}</span></p>
      ${report.summary.e2e.mockBrowser ? '<p class="warning">Using mock browser</p>' : ''}
    </div>
  </div>
  
  <h2>Test Details</h2>
  
  <div class="test-section">
    <h3>API Tests</h3>
    <table class="test-table">
      <thead>
        <tr>
          <th>Test Name</th>
          <th>Status</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        ${report.details.api.map(test => `
          <tr>
            <td>${test.name}</td>
            <td class="${test.passed ? 'test-pass' : 'test-fail'}">${test.passed ? 'PASS' : 'FAIL'}</td>
            <td>
              ${!test.passed ? `
                <button class="toggle-btn" onclick="toggleDetails('api-${report.details.api.indexOf(test)}')">Show Error</button>
                <div id="api-${report.details.api.indexOf(test)}" class="error-details hidden">
                  ${test.error || 'No error details available'}
                </div>
              ` : ''}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <div class="test-section">
    <h3>UI Tests</h3>
    <table class="test-table">
      <thead>
        <tr>
          <th>Test Name</th>
          <th>Status</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        ${report.details.ui.map(test => `
          <tr>
            <td>${test.name}</td>
            <td class="${test.passed ? 'test-pass' : 'test-fail'}">${test.passed ? 'PASS' : 'FAIL'}</td>
            <td>
              ${!test.passed ? `
                <button class="toggle-btn" onclick="toggleDetails('ui-${report.details.ui.indexOf(test)}')">Show Error</button>
                <div id="ui-${report.details.ui.indexOf(test)}" class="error-details hidden">
                  ${test.error || 'No error details available'}
                </div>
              ` : ''}
              ${test.screenshot ? `<br><a href="../screenshots/${path.basename(test.screenshot)}" target="_blank">View Screenshot</a>` : ''}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <div class="test-section">
    <h3>E2E Tests</h3>
    <table class="test-table">
      <thead>
        <tr>
          <th>Test Name</th>
          <th>Status</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        ${report.details.e2e.map(test => `
          <tr>
            <td>${test.name}</td>
            <td class="${test.passed ? 'test-pass' : 'test-fail'}">${test.passed ? 'PASS' : 'FAIL'}</td>
            <td>
              ${!test.passed ? `
                <button class="toggle-btn" onclick="toggleDetails('e2e-${report.details.e2e.indexOf(test)}')">Show Error</button>
                <div id="e2e-${report.details.e2e.indexOf(test)}" class="error-details hidden">
                  ${test.error || 'No error details available'}
                </div>
              ` : ''}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  
  <div class="config-info">
    <h3>Test Configuration</h3>
    <ul>
      <li><strong>API URL:</strong> ${report.config.apiBaseUrl}</li>
      <li><strong>Frontend URL:</strong> ${report.config.frontendUrl}</li>
      <li><strong>Headless Mode:</strong> ${report.config.headless}</li>
      <li><strong>Mock Auth:</strong> ${report.config.mockAuth ? 'Yes' : 'No'}</li>
    </ul>
  </div>
  
  <script>
    function toggleDetails(id) {
      const element = document.getElementById(id);
      if (element.classList.contains('hidden')) {
        element.classList.remove('hidden');
      } else {
        element.classList.add('hidden');
      }
    }
  </script>
</body>
</html>`;
}

/**
 * Print a formatted console report
 * @param {Object} report - JSON report data
 */
function printConsoleReport(report) {
  console.log('\n' + chalk.bold.blue('=== Test Report Summary ==='));
  console.log(chalk.yellow(`Generated on: ${new Date(report.timestamp).toLocaleString()}`));
  
  console.log('\n' + chalk.bold.green(`Overall Success Rate: ${report.summary.overall.successRate}%`));
  console.log(chalk.cyan(`Total Tests: ${report.summary.overall.total}`));
  console.log(chalk.green(`Passed: ${report.summary.overall.passed}`));
  console.log(chalk.red(`Failed: ${report.summary.overall.failed}`));
  
  // Print API test summary
  console.log('\n' + chalk.bold.cyan('API Tests:'));
  console.log(chalk.cyan(`Success Rate: ${report.summary.api.successRate}%`));
  console.log(chalk.cyan(`Total: ${report.summary.api.total}, Passed: ${report.summary.api.passed}, Failed: ${report.summary.api.failed}`));
  
  // Print UI test summary
  console.log('\n' + chalk.bold.cyan('UI Tests:'));
  console.log(chalk.cyan(`Success Rate: ${report.summary.ui.successRate}%`));
  console.log(chalk.cyan(`Total: ${report.summary.ui.total}, Passed: ${report.summary.ui.passed}, Failed: ${report.summary.ui.failed}`));
  if (report.summary.ui.mockBrowser) {
    console.log(chalk.yellow('Note: Using mock browser for UI tests'));
  }
  
  // Print E2E test summary
  console.log('\n' + chalk.bold.cyan('E2E Tests:'));
  console.log(chalk.cyan(`Success Rate: ${report.summary.e2e.successRate}%`));
  console.log(chalk.cyan(`Total: ${report.summary.e2e.total}, Passed: ${report.summary.e2e.passed}, Failed: ${report.summary.e2e.failed}`));
  if (report.summary.e2e.mockBrowser) {
    console.log(chalk.yellow('Note: Using mock browser for E2E tests'));
  }
  
  // Print failed tests
  const apiFailures = report.details.api.filter(t => !t.passed);
  const uiFailures = report.details.ui.filter(t => !t.passed);
  const e2eFailures = report.details.e2e.filter(t => !t.passed);
  
  if (apiFailures.length + uiFailures.length + e2eFailures.length > 0) {
    console.log('\n' + chalk.bold.red('Failed Tests:'));
    
    if (apiFailures.length > 0) {
      console.log(chalk.red('\nAPI Failures:'));
      apiFailures.forEach(test => {
        console.log(chalk.red(`  ✗ ${test.name}: ${test.error || 'No error details'}`));
      });
    }
    
    if (uiFailures.length > 0) {
      console.log(chalk.red('\nUI Failures:'));
      uiFailures.forEach(test => {
        console.log(chalk.red(`  ✗ ${test.name}: ${test.error || 'No error details'}`));
      });
    }
    
    if (e2eFailures.length > 0) {
      console.log(chalk.red('\nE2E Failures:'));
      e2eFailures.forEach(test => {
        console.log(chalk.red(`  ✗ ${test.name}: ${test.error || 'No error details'}`));
      });
    }
  }
}

module.exports = {
  generateReport
};