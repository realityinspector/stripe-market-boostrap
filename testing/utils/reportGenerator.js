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
exports.generateReport = async (results, outputPath) => {
  try {
    // Create the report object
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        successRate: 0,
        categories: {}
      },
      details: results
    };

    // Calculate summary statistics
    let totalTests = 0;
    let passedTests = 0;

    for (const [category, categoryResults] of Object.entries(results)) {
      const categoryTotal = categoryResults.length;
      const categoryPassed = categoryResults.filter(result => result.success).length;
      
      totalTests += categoryTotal;
      passedTests += categoryPassed;
      
      report.summary.categories[category] = {
        total: categoryTotal,
        passed: categoryPassed,
        failed: categoryTotal - categoryPassed,
        successRate: categoryTotal > 0 ? Math.round((categoryPassed / categoryTotal) * 100) : 0
      };
    }
    
    report.summary.totalTests = totalTests;
    report.summary.passedTests = passedTests;
    report.summary.failedTests = totalTests - passedTests;
    report.summary.successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    
    // Create output directory if it doesn't exist
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write the report to a file
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    
    // Generate a human-readable report as well
    const textReportPath = outputPath.replace('.json', '.txt');
    await exports.generateTextReport(report, textReportPath);
    
    return outputPath;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

/**
 * Generate human-readable text report
 * @param {Object} report - JSON report data
 * @param {string} outputPath - Path to write text report to
 */
exports.generateTextReport = async (report, outputPath) => {
  try {
    let textReport = '';
    
    // Report header
    textReport += '===============================================\n';
    textReport += '           TEST EXECUTION REPORT               \n';
    textReport += '===============================================\n\n';
    
    textReport += `Report generated: ${new Date(report.timestamp).toLocaleString()}\n\n`;
    
    // Summary section
    textReport += '=============== SUMMARY ========================\n\n';
    textReport += `Total Tests: ${report.summary.totalTests}\n`;
    textReport += `Passed Tests: ${report.summary.passedTests}\n`;
    textReport += `Failed Tests: ${report.summary.failedTests}\n`;
    textReport += `Success Rate: ${report.summary.successRate}%\n\n`;
    
    // Category summaries
    textReport += 'Category Results:\n';
    for (const [category, stats] of Object.entries(report.summary.categories)) {
      textReport += `  ${category.toUpperCase()}: ${stats.passed}/${stats.total} passed (${stats.successRate}%)\n`;
    }
    
    textReport += '\n';
    
    // Details for failed tests
    textReport += '================ FAILURES =====================\n\n';
    
    let hasFailures = false;
    
    for (const [category, results] of Object.entries(report.details)) {
      const failedTests = results.filter(result => !result.success);
      
      if (failedTests.length > 0) {
        hasFailures = true;
        textReport += `${category.toUpperCase()} Failures:\n`;
        
        for (const test of failedTests) {
          textReport += `  - ${test.name}\n`;
          textReport += `    Error: ${test.error}\n`;
          textReport += `    Duration: ${test.duration}ms\n\n`;
        }
      }
    }
    
    if (!hasFailures) {
      textReport += 'No test failures! 🎉\n\n';
    }
    
    // Performance metrics
    textReport += '============== PERFORMANCE ====================\n\n';
    
    for (const [category, results] of Object.entries(report.details)) {
      if (results.length > 0) {
        textReport += `${category.toUpperCase()} Performance:\n`;
        
        // Calculate average duration
        const totalDuration = results.reduce((sum, test) => sum + test.duration, 0);
        const avgDuration = Math.round(totalDuration / results.length);
        
        // Find slowest test
        const slowestTest = results.reduce((slowest, test) => {
          return (!slowest || test.duration > slowest.duration) ? test : slowest;
        }, null);
        
        textReport += `  Average duration: ${avgDuration}ms\n`;
        if (slowestTest) {
          textReport += `  Slowest test: ${slowestTest.name} (${slowestTest.duration}ms)\n`;
        }
        textReport += '\n';
      }
    }
    
    // Write the text report to a file
    fs.writeFileSync(outputPath, textReport);
    
    return outputPath;
  } catch (error) {
    console.error('Error generating text report:', error);
    throw error;
  }
};