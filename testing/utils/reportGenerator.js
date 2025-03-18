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
const generateReport = (results, outputPath) => {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      successRate: 0,
    },
    categories: {},
    details: results
  };
  
  // Calculate summary statistics
  Object.entries(results).forEach(([category, categoryResults]) => {
    report.categories[category] = {
      total: categoryResults.length,
      passed: categoryResults.filter(r => r.success).length,
      failed: categoryResults.filter(r => !r.success).length,
    };
    
    report.categories[category].successRate = (
      report.categories[category].passed / 
      Math.max(1, report.categories[category].total) * 100
    ).toFixed(2);
    
    report.summary.total += categoryResults.length;
    report.summary.passed += categoryResults.filter(r => r.success).length;
    report.summary.failed += categoryResults.filter(r => !r.success).length;
  });
  
  report.summary.successRate = (
    report.summary.passed / 
    Math.max(1, report.summary.total) * 100
  ).toFixed(2);
  
  // Write report to file
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
  
  // Also generate human-readable text report
  const textReportPath = outputPath.replace('.json', '.txt');
  generateTextReport(report, textReportPath);
  
  return report;
};

/**
 * Generate human-readable text report
 * @param {Object} report - JSON report data
 * @param {string} outputPath - Path to write text report to
 */
const generateTextReport = (report, outputPath) => {
  let textReport = `# Stripe Connect Marketplace Test Report\n`;
  textReport += `Generated: ${report.timestamp}\n\n`;
  
  textReport += `## Summary\n`;
  textReport += `- Total tests: ${report.summary.total}\n`;
  textReport += `- Passed: ${report.summary.passed}\n`;
  textReport += `- Failed: ${report.summary.failed}\n`;
  textReport += `- Success rate: ${report.summary.successRate}%\n\n`;
  
  textReport += `## Categories\n`;
  Object.entries(report.categories).forEach(([category, stats]) => {
    textReport += `### ${category.toUpperCase()}\n`;
    textReport += `- Total: ${stats.total}\n`;
    textReport += `- Passed: ${stats.passed}\n`;
    textReport += `- Failed: ${stats.failed}\n`;
    textReport += `- Success rate: ${stats.successRate}%\n\n`;
  });
  
  textReport += `## Failed Tests\n`;
  Object.entries(report.details).forEach(([category, results]) => {
    const failedTests = results.filter(r => !r.success);
    if (failedTests.length === 0) return;
    
    textReport += `### ${category.toUpperCase()}\n`;
    failedTests.forEach(test => {
      textReport += `- ${test.name}\n`;
      textReport += `  Error: ${test.error.message}\n\n`;
    });
  });
  
  fs.writeFileSync(outputPath, textReport);
};

module.exports = {
  generateReport,
  generateTextReport
};