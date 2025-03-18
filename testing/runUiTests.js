/**
 * UI Test Runner
 * 
 * This script runs the UI tests using Puppeteer with live rendering
 * or in mock mode if the real browser can't be launched.
 */

const path = require('path');
const fs = require('fs');
const { runUITests } = require('./e2e/uiTesting.test');
const config = require('./puppeteer.config');

async function main() {
  console.log('====================================');
  console.log('  STRIPE MARKETPLACE UI TEST RUNNER');
  console.log('====================================');
  console.log();
  
  if (config.mock) {
    console.log('Running in MOCK MODE - browser will be simulated');
  } else {
    console.log('Running with REAL BROWSER - Chrome will be launched');
  }
  console.log();
  
  // Create screenshots directory if it doesn't exist
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  try {
    // Run the UI tests
    console.log('Starting UI tests...');
    const result = await runUITests();
    
    if (result.success) {
      console.log('\n✅ UI Tests Passed!');
      console.log(result.message);
      process.exit(0);
    } else {
      console.log('\n❌ UI Tests Failed!');
      console.log(result.message);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error running UI tests:', error);
    process.exit(1);
  }
}

// Run the tests
main();