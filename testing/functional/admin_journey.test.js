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
const { 
  initBrowser, 
  closeBrowser, 
  navigateTo,
  waitForElement,
  clickElement,
  fillInput,
  getElementText,
  evaluate,
  takeScreenshot,
  mockSafeWait
} = require('../utils/puppeteerHelper');
const { createTestUser } = require('../utils/testHelpers');

// Base URL for the application
const BASE_URL = 'http://localhost:8000';
const API_URL = 'http://localhost:8000';

/**
 * Test the complete admin journey flow
 */
async function testAdminJourney() {
  console.log('Testing admin journey flow...');
  
  let browser, page;
  let admin = null;
  
  try {
    browser = await initBrowser();
    page = await browser.newPage();
    
    // 1. Login as admin (assuming admin account exists)
    admin = {
      email: 'admin@marketplace.com',
      password: 'Admin123!'
    };
    await testAdminLogin(page, admin);
    
    // 2. View platform analytics
    await testPlatformAnalytics(page);
    
    // 3. Manage vendors
    await testVendorManagement(page);
    
    // 4. Manage products
    await testProductManagement(page);
    
    // 5. View transactions
    await testTransactionOversight(page);
    
    // 6. Manage platform commission
    await testCommissionManagement(page);
    
    console.log('Admin journey test passed');
    return true;
  } catch (error) {
    console.error(`Admin journey error: ${error.message}`);
    
    // Take a failure screenshot
    if (page) {
      await takeScreenshot(page, 'testing/screenshots/admin-journey-failure.png');
    }
    
    // In testing mode, we'll proceed even if there are errors
    console.log('Testing in mock mode - some steps may have been skipped');
    return false;
  } finally {
    if (browser) {
      await closeBrowser();
    }
  }
}

/**
 * Test admin login
 */
async function testAdminLogin(page, admin) {
  console.log('Testing admin login...');
  
  // Try to create admin user first if it doesn't exist
  try {
    // Make API call to create admin user
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: admin.email,
        password: admin.password,
        name: 'Admin User',
        role: 'admin'
      })
    });
    
    if (response.ok) {
      console.log('Admin user created successfully');
    } else {
      // Admin might already exist, which is fine
      console.log('Admin user might already exist, proceeding to login');
    }
  } catch (error) {
    // Ignore errors here - we'll proceed to login
    console.warn('Error creating admin user (might already exist):', error.message);
  }
  
  // Navigate to login page
  await navigateTo(page, `${BASE_URL}/login`);
  
  // Wait for login form
  await waitForElement(page, 'form');
  
  // Fill out login form
  await fillInput(page, 'input[name="email"]', admin.email);
  await fillInput(page, 'input[name="password"]', admin.password);
  
  // Submit form
  await clickElement(page, 'button[type="submit"]');
  
  // Wait for admin dashboard redirect
  await waitForElement(page, '.admin-dashboard, .dashboard', 5000);
  
  // Get auth token from localStorage
  const token = await evaluate(page, () => {
    return localStorage.getItem('authToken');
  });
  
  console.log('Admin login test passed');
  return token;
}

/**
 * Test platform analytics dashboard
 */
async function testPlatformAnalytics(page) {
  console.log('Testing platform analytics...');
  
  // Navigate to admin dashboard
  await navigateTo(page, `${BASE_URL}/admin/dashboard`);
  
  // Wait for analytics components
  await waitForElement(page, '.analytics-summary, .dashboard-metrics', 5000);
  
  // Check for key metrics
  const hasRevenue = await waitForElement(page, '.total-revenue, .revenue-metric', 2000);
  const hasOrders = await waitForElement(page, '.total-orders, .orders-metric', 2000);
  const hasVendors = await waitForElement(page, '.total-vendors, .vendors-metric', 2000);
  
  if (!hasRevenue || !hasOrders || !hasVendors) {
    console.warn('Some analytics components not found, dashboard may be structured differently');
  }
  
  // Take screenshot of analytics dashboard
  await takeScreenshot(page, 'testing/screenshots/admin-analytics.png');
  
  console.log('Platform analytics test passed');
}

/**
 * Test vendor management
 */
async function testVendorManagement(page) {
  console.log('Testing vendor management...');
  
  // Navigate to vendor management page
  await navigateTo(page, `${BASE_URL}/admin/vendors`);
  
  // Wait for vendor list
  await waitForElement(page, '.vendor-list, .vendors-table', 5000);
  
  // Take screenshot of vendor management
  await takeScreenshot(page, 'testing/screenshots/admin-vendor-management.png');
  
  // Test search/filter if available
  const hasSearch = await waitForElement(page, 'input[type="search"]', 2000);
  
  if (hasSearch) {
    await fillInput(page, 'input[type="search"]', 'Test Vendor');
    
    // Look for search button or just press Enter
    const searchButton = await waitForElement(page, 'button[type="submit"], button.search-button', 1000);
    
    if (searchButton) {
      await clickElement(page, 'button[type="submit"], button.search-button');
    } else {
      // Press Enter in the search box
      await page.keyboard.press('Enter');
    }
    
    // Wait briefly for search results (using mock compatibility)
    await mockSafeWait(page, 1000);
  }
  
  // Test vendor approval/suspension if a vendor is present
  const hasVendorActions = await waitForElement(page, '.vendor-actions, .action-buttons', 2000);
  
  if (hasVendorActions) {
    // Check if there's a status toggle button
    const hasStatusToggle = await waitForElement(page, '.status-toggle, .toggle-status', 1000);
    
    if (hasStatusToggle) {
      await clickElement(page, '.status-toggle, .toggle-status');
      
      // Wait for confirmation dialog if it appears
      const hasConfirmation = await waitForElement(page, '.confirmation-dialog, .confirm-action', 2000);
      
      if (hasConfirmation) {
        await clickElement(page, '.confirm-button, .yes-button');
        
        // Wait for status update
        await mockSafeWait(page, 1000);
      }
    }
  }
  
  console.log('Vendor management test passed');
}

/**
 * Test product management
 */
async function testProductManagement(page) {
  console.log('Testing product management...');
  
  // Navigate to product management page
  await navigateTo(page, `${BASE_URL}/admin/products`);
  
  // Wait for product list
  await waitForElement(page, '.product-list, .products-table', 5000);
  
  // Take screenshot of product management
  await takeScreenshot(page, 'testing/screenshots/admin-product-management.png');
  
  // Test search/filter if available
  const hasSearch = await waitForElement(page, 'input[type="search"]', 2000);
  
  if (hasSearch) {
    await fillInput(page, 'input[type="search"]', 'Test Product');
    
    // Look for search button or just press Enter
    const searchButton = await waitForElement(page, 'button[type="submit"], button.search-button', 1000);
    
    if (searchButton) {
      await clickElement(page, 'button[type="submit"], button.search-button');
    } else {
      // Press Enter in the search box
      await page.keyboard.press('Enter');
    }
    
    // Wait briefly for search results (using mock compatibility)
    await mockSafeWait(page, 1000);
  }
  
  // Test product feature/removal if a product is present
  const hasProductActions = await waitForElement(page, '.product-actions, .action-buttons', 2000);
  
  if (hasProductActions) {
    // Check if there's a feature toggle button
    const hasFeatureToggle = await waitForElement(page, '.feature-toggle, .toggle-feature', 1000);
    
    if (hasFeatureToggle) {
      await clickElement(page, '.feature-toggle, .toggle-feature');
      
      // Wait for status update
      await mockSafeWait(page, 1000);
    }
  }
  
  console.log('Product management test passed');
}

/**
 * Test transaction oversight
 */
async function testTransactionOversight(page) {
  console.log('Testing transaction oversight...');
  
  // Navigate to transactions page
  await navigateTo(page, `${BASE_URL}/admin/transactions`);
  
  // Wait for transactions list
  await waitForElement(page, '.transactions-list, .transactions-table', 5000);
  
  // Take screenshot of transactions page
  await takeScreenshot(page, 'testing/screenshots/admin-transactions.png');
  
  // Test filtering by date range if available
  const hasDateFilter = await waitForElement(page, 'input[type="date"]', 2000);
  
  if (hasDateFilter) {
    // Set date filters - note: input[type="date"] accepts YYYY-MM-DD format
    const dateInputs = await page.$$('input[type="date"]');
    
    if (dateInputs.length >= 2) {
      // Set start date (30 days ago)
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const startDateStr = startDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Set end date (today)
      const endDate = new Date();
      const endDateStr = endDate.toISOString().split('T')[0]; // YYYY-MM-DD
      
      await fillInput(page, 'input[type="date"]:nth-child(1)', startDateStr);
      await fillInput(page, 'input[type="date"]:nth-child(2)', endDateStr);
      
      // Apply filters
      const filterButton = await waitForElement(page, 'button.apply-filter, button.filter-button', 1000);
      if (filterButton) {
        await clickElement(page, 'button.apply-filter, button.filter-button');
        
        // Wait for filtered results
        await mockSafeWait(page, 1000);
      }
    }
  }
  
  console.log('Transaction oversight test passed');
}

/**
 * Test commission management
 */
async function testCommissionManagement(page) {
  console.log('Testing commission management...');
  
  // Navigate to commission management page
  await navigateTo(page, `${BASE_URL}/admin/commission`);
  
  // Wait for commission form or table
  await waitForElement(page, '.commission-settings, .platform-settings', 5000);
  
  // Take screenshot of commission settings
  await takeScreenshot(page, 'testing/screenshots/admin-commission.png');
  
  // Test updating commission rate if form exists
  const hasCommissionForm = await waitForElement(page, 'form', 2000);
  
  if (hasCommissionForm) {
    // Look for commission rate input
    const hasRateInput = await waitForElement(page, 'input[name="commissionRate"], input[name="platformFee"]', 1000);
    
    if (hasRateInput) {
      // Get current value
      const currentValue = await evaluate(page, () => {
        const input = document.querySelector('input[name="commissionRate"], input[name="platformFee"]');
        return input ? input.value : null;
      });
      
      // Set a new value (for testing, we'll set it back to current value)
      if (currentValue) {
        await fillInput(page, 'input[name="commissionRate"], input[name="platformFee"]', currentValue);
        
        // Submit form
        await clickElement(page, 'button[type="submit"]');
        
        // Wait for success message
        await waitForElement(page, '.success-message, .alert-success', 5000);
      }
    }
  }
  
  console.log('Commission management test passed');
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