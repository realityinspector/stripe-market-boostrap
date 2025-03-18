/**
 * Admin Journey Functional Tests
 * 
 * This test suite validates the complete admin journey through the marketplace:
 * 1. Admin authentication
 * 2. Platform management (vendors, products)
 * 3. Transaction oversight
 * 4. Commission management
 */

const puppeteer = require('puppeteer');
const puppeteerHelper = require('../utils/puppeteerHelper');
const testHelpers = require('../utils/testHelpers');
const chalk = require('chalk');

/**
 * Test the complete admin journey flow
 */
async function testAdminJourney() {
  let browser;
  let page;
  let testPassed = false;
  let admin = null;
  
  try {
    console.log(chalk.blue('🧪 Testing admin journey...'));
    
    // Initialize browser
    browser = await puppeteerHelper.initBrowser();
    page = await puppeteerHelper.createPage();
    
    // Create test admin if needed
    admin = await testHelpers.createTestUser('admin');
    
    // Test admin login
    const loginResult = await testAdminLogin(page, admin);
    if (!loginResult.passed) {
      throw new Error('Admin login test failed: ' + loginResult.error);
    }
    
    // Test platform analytics dashboard
    const analyticsResult = await testPlatformAnalytics(page);
    if (!analyticsResult.passed) {
      throw new Error('Platform analytics test failed: ' + analyticsResult.error);
    }
    
    // Test vendor management
    const vendorResult = await testVendorManagement(page);
    if (!vendorResult.passed) {
      throw new Error('Vendor management test failed: ' + vendorResult.error);
    }
    
    // Test product management
    const productResult = await testProductManagement(page);
    if (!productResult.passed) {
      throw new Error('Product management test failed: ' + productResult.error);
    }
    
    // Test transaction oversight
    const transactionResult = await testTransactionOversight(page);
    if (!transactionResult.passed) {
      throw new Error('Transaction oversight test failed: ' + transactionResult.error);
    }
    
    // Test commission management
    const commissionResult = await testCommissionManagement(page);
    if (!commissionResult.passed) {
      throw new Error('Commission management test failed: ' + commissionResult.error);
    }
    
    console.log(chalk.green('✅ Admin journey test passed'));
    testPassed = true;
    
    return { passed: true };
  } catch (err) {
    console.error(chalk.red('❌ Admin journey test failed:'), err);
    return { passed: false, error: err.message };
  } finally {
    // Clean up resources
    if (browser) {
      await puppeteerHelper.closeBrowser(browser);
    }
  }
}

/**
 * Test admin login
 */
async function testAdminLogin(page, admin) {
  try {
    console.log(chalk.blue('  Testing admin login...'));
    
    // Navigate to login page
    await puppeteerHelper.navigateTo(page, 'http://localhost:8000/login');
    
    // Fill login form
    await puppeteerHelper.fillInput(page, '#email', admin.email);
    await puppeteerHelper.fillInput(page, '#password', admin.password);
    
    // Submit login form
    await puppeteerHelper.clickElement(page, '#login-button');
    
    // Wait for redirect to admin dashboard
    await puppeteerHelper.waitForElement(page, '#admin-dashboard', 5000);
    
    // Verify admin name is displayed
    const adminName = await puppeteerHelper.getElementText(page, '#user-name');
    if (!adminName.includes(admin.name)) {
      throw new Error('Admin name not displayed correctly');
    }
    
    console.log(chalk.green('  ✅ Admin login successful'));
    return { passed: true };
  } catch (err) {
    console.error(chalk.red('  ❌ Admin login failed:'), err);
    await puppeteerHelper.takeScreenshot(page, 'testing/screenshots/admin-login-failed.png');
    return { passed: false, error: err.message };
  }
}

/**
 * Test platform analytics dashboard
 */
async function testPlatformAnalytics(page) {
  try {
    console.log(chalk.blue('  Testing platform analytics...'));
    
    // Navigate to analytics dashboard
    await puppeteerHelper.clickElement(page, '#analytics-link');
    
    // Verify analytics components are displayed
    await puppeteerHelper.waitForElement(page, '#total-users-metric', 5000);
    await puppeteerHelper.waitForElement(page, '#total-revenue-metric', 5000);
    await puppeteerHelper.waitForElement(page, '#total-orders-metric', 5000);
    await puppeteerHelper.waitForElement(page, '#total-products-metric', 5000);
    
    // Verify analytics sections
    const userCount = await puppeteerHelper.getElementText(page, '#total-users-metric');
    const productCount = await puppeteerHelper.getElementText(page, '#total-products-metric');
    
    // Analytics should contain numbers
    if (!/\d+/.test(userCount) || !/\d+/.test(productCount)) {
      throw new Error('Analytics data not displayed correctly');
    }
    
    // Take a screenshot of the analytics dashboard
    await puppeteerHelper.takeScreenshot(page, 'testing/screenshots/admin-analytics.png');
    
    console.log(chalk.green('  ✅ Platform analytics test passed'));
    return { passed: true };
  } catch (err) {
    console.error(chalk.red('  ❌ Platform analytics test failed:'), err);
    await puppeteerHelper.takeScreenshot(page, 'testing/screenshots/admin-analytics-failed.png');
    return { passed: false, error: err.message };
  }
}

/**
 * Test vendor management
 */
async function testVendorManagement(page) {
  try {
    console.log(chalk.blue('  Testing vendor management...'));
    
    // Navigate to vendor management
    await puppeteerHelper.clickElement(page, '#vendors-link');
    
    // Verify vendor table is displayed
    await puppeteerHelper.waitForElement(page, '#vendors-table', 5000);
    
    // Check if there are vendors listed
    const vendorsExist = await puppeteerHelper.elementExists(page, '.vendor-row');
    
    if (vendorsExist) {
      // Test approve/suspend vendor (if vendors exist)
      await puppeteerHelper.clickElement(page, '.vendor-status-dropdown');
      await puppeteerHelper.clickElement(page, '.vendor-status-active');
      
      // Verify status change confirmation
      await puppeteerHelper.waitForElement(page, '#status-change-success', 5000);
    } else {
      console.log(chalk.yellow('  ⚠️ No vendors found to test status changes'));
    }
    
    // Take a screenshot of vendor management
    await puppeteerHelper.takeScreenshot(page, 'testing/screenshots/admin-vendors.png');
    
    console.log(chalk.green('  ✅ Vendor management test passed'));
    return { passed: true };
  } catch (err) {
    console.error(chalk.red('  ❌ Vendor management test failed:'), err);
    await puppeteerHelper.takeScreenshot(page, 'testing/screenshots/admin-vendors-failed.png');
    return { passed: false, error: err.message };
  }
}

/**
 * Test product management
 */
async function testProductManagement(page) {
  try {
    console.log(chalk.blue('  Testing product management...'));
    
    // Navigate to product management
    await puppeteerHelper.clickElement(page, '#products-link');
    
    // Verify product table is displayed
    await puppeteerHelper.waitForElement(page, '#products-table', 5000);
    
    // Check if there are products listed
    const productsExist = await puppeteerHelper.elementExists(page, '.product-row');
    
    if (productsExist) {
      // Test featuring a product
      await puppeteerHelper.clickElement(page, '.feature-product-checkbox');
      
      // Verify feature change confirmation
      await puppeteerHelper.waitForElement(page, '#feature-change-success', 5000);
    } else {
      console.log(chalk.yellow('  ⚠️ No products found to test featuring'));
    }
    
    // Take a screenshot of product management
    await puppeteerHelper.takeScreenshot(page, 'testing/screenshots/admin-products.png');
    
    console.log(chalk.green('  ✅ Product management test passed'));
    return { passed: true };
  } catch (err) {
    console.error(chalk.red('  ❌ Product management test failed:'), err);
    await puppeteerHelper.takeScreenshot(page, 'testing/screenshots/admin-products-failed.png');
    return { passed: false, error: err.message };
  }
}

/**
 * Test transaction oversight
 */
async function testTransactionOversight(page) {
  try {
    console.log(chalk.blue('  Testing transaction oversight...'));
    
    // Navigate to transactions
    await puppeteerHelper.clickElement(page, '#transactions-link');
    
    // Verify transaction table is displayed
    await puppeteerHelper.waitForElement(page, '#transactions-table', 5000);
    
    // Check if export functionality exists
    const exportExists = await puppeteerHelper.elementExists(page, '#export-transactions');
    
    if (exportExists) {
      // Test exporting transactions
      await puppeteerHelper.clickElement(page, '#export-transactions');
      
      // Verify export confirmation
      await puppeteerHelper.waitForElement(page, '#export-success', 5000);
    } else {
      console.log(chalk.yellow('  ⚠️ Export functionality not found'));
    }
    
    // Take a screenshot of transaction oversight
    await puppeteerHelper.takeScreenshot(page, 'testing/screenshots/admin-transactions.png');
    
    console.log(chalk.green('  ✅ Transaction oversight test passed'));
    return { passed: true };
  } catch (err) {
    console.error(chalk.red('  ❌ Transaction oversight test failed:'), err);
    await puppeteerHelper.takeScreenshot(page, 'testing/screenshots/admin-transactions-failed.png');
    return { passed: false, error: err.message };
  }
}

/**
 * Test commission management
 */
async function testCommissionManagement(page) {
  try {
    console.log(chalk.blue('  Testing commission management...'));
    
    // Navigate to commission settings
    await puppeteerHelper.clickElement(page, '#settings-link');
    
    // Verify commission form is displayed
    await puppeteerHelper.waitForElement(page, '#commission-form', 5000);
    
    // Get current commission rate
    const currentRate = await page.evaluate(() => {
      return document.querySelector('#commission-rate').value;
    });
    
    // Set new commission rate (add 1 to current rate, or reset to 10 if it's too high)
    const newRate = parseFloat(currentRate) >= 20 ? 10 : parseFloat(currentRate) + 1;
    
    // Fill commission form
    await page.evaluate((rate) => {
      document.querySelector('#commission-rate').value = rate;
    }, newRate);
    
    // Submit commission form
    await puppeteerHelper.clickElement(page, '#update-commission');
    
    // Verify update confirmation
    await puppeteerHelper.waitForElement(page, '#commission-update-success', 5000);
    
    // Verify new commission rate is displayed
    const updatedRate = await page.evaluate(() => {
      return document.querySelector('#commission-rate').value;
    });
    
    if (parseFloat(updatedRate) !== newRate) {
      throw new Error(`Commission rate not updated correctly. Expected ${newRate}, got ${updatedRate}`);
    }
    
    // Take a screenshot of commission management
    await puppeteerHelper.takeScreenshot(page, 'testing/screenshots/admin-commission.png');
    
    console.log(chalk.green('  ✅ Commission management test passed'));
    return { passed: true };
  } catch (err) {
    console.error(chalk.red('  ❌ Commission management test failed:'), err);
    await puppeteerHelper.takeScreenshot(page, 'testing/screenshots/admin-commission-failed.png');
    return { passed: false, error: err.message };
  }
}

module.exports = {
  testAdminJourney,
  testAdminLogin,
  testPlatformAnalytics,
  testVendorManagement,
  testProductManagement,
  testTransactionOversight,
  testCommissionManagement
};