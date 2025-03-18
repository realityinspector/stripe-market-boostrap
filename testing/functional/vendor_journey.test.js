/**
 * Vendor Journey Functional Tests
 * 
 * This test suite validates the complete vendor journey through the marketplace:
 * 1. Registration and authentication
 * 2. Vendor onboarding with Stripe Connect (mocked)
 * 3. Product creation and management
 * 4. Order and transaction management
 */

const puppeteer = require('puppeteer');
const { initBrowser, closeBrowser, createPage, navigateTo, waitForElement,
  elementExists, fillInput, clickElement, getElementText } = require('../utils/puppeteerHelper');

// Test data and configurations
const BASE_URL = 'http://localhost:8000';
const TEST_VENDOR = {
  name: `Test Vendor ${Date.now()}`,
  email: `vendor_${Date.now()}@example.com`,
  password: `Password${Date.now()}`,
};

const TEST_PRODUCT = {
  name: `Test Product ${Date.now()}`,
  description: `This is a test product created at ${new Date().toISOString()}`,
  price: Math.floor(Math.random() * 100) + 9.99,
  stock: Math.floor(Math.random() * 100) + 10
};

// Success criteria validation
let testResults = {
  registration: false,
  login: false,
  stripeConnect: false,
  productCreation: false,
  productUpdate: false,
  productManagement: false,
  orders: false,
  transactions: false
};

// Track successful test paths for reporting
const successPaths = [];
const failurePaths = [];

/**
 * Test the complete vendor journey flow
 */
async function testVendorJourney() {
  let browser;
  let page;
  
  try {
    console.log('Starting Vendor Journey Test...');
    
    // Initialize browser
    browser = await initBrowser();
    page = await createPage(browser);
    
    // Step 1: Register as a new vendor
    await testVendorRegistration(page);
    
    // Step 2: Logout and login again to verify credentials
    await testVendorLogin(page);
    
    // Step 3: Complete Stripe Connect onboarding (mock)
    await testStripeConnectOnboarding(page);
    
    // Step 4: Create a product
    const createdProduct = await testProductCreation(page);
    
    // Step 5: Update product
    if (createdProduct) {
      await testProductUpdate(page, createdProduct);
    }
    
    // Step 6: Product management (list, filter, etc.)
    await testProductManagement(page);
    
    // Step 7: Order management
    await testOrderManagement(page);
    
    // Step 8: Transaction history and analytics
    await testTransactions(page);
    
    // Report results
    console.log('\nVendor Journey Test Results:');
    console.log('---------------------------');
    Object.entries(testResults).forEach(([test, result]) => {
      console.log(`${test}: ${result ? '✅ PASSED' : '❌ FAILED'}`);
    });
    
    console.log(`\nSuccessful paths: ${successPaths.length}`);
    successPaths.forEach(path => console.log(`- ${path}`));
    
    console.log(`\nFailed paths: ${failurePaths.length}`);
    failurePaths.forEach(path => console.log(`- ${path}`));
    
  } catch (error) {
    console.error('Error in vendor journey test:', error);
  } finally {
    // Cleanup
    if (browser) {
      await closeBrowser(browser);
    }
  }
}

/**
 * Test vendor registration
 */
async function testVendorRegistration(page) {
  try {
    console.log('Testing vendor registration...');
    
    // Navigate to registration page
    await navigateTo(page, `${BASE_URL}/register`);
    
    // Fill registration form
    await fillInput(page, 'input[name="name"]', TEST_VENDOR.name);
    await fillInput(page, 'input[name="email"]', TEST_VENDOR.email);
    await fillInput(page, 'input[name="password"]', TEST_VENDOR.password);
    await fillInput(page, 'input[name="confirmPassword"]', TEST_VENDOR.password);
    
    // Select vendor role
    await clickElement(page, 'input[value="vendor"]');
    
    // Submit form
    await clickElement(page, 'button[type="submit"]');
    
    // Wait for redirect to dashboard or confirmation
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    // Verify successful registration
    const isDashboard = await elementExists(page, '.vendor-dashboard');
    
    if (isDashboard) {
      console.log('✅ Vendor registration successful');
      testResults.registration = true;
      successPaths.push('Vendor Registration');
      
      // Logout for login test
      await clickElement(page, '.logout-button');
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
    } else {
      console.log('❌ Vendor registration failed');
      failurePaths.push('Vendor Registration');
    }
  } catch (error) {
    console.error('Error in vendor registration test:', error);
    failurePaths.push('Vendor Registration');
  }
}

/**
 * Test vendor login
 */
async function testVendorLogin(page) {
  try {
    console.log('Testing vendor login...');
    
    // Navigate to login page
    await navigateTo(page, `${BASE_URL}/login`);
    
    // Fill login form
    await fillInput(page, 'input[name="email"]', TEST_VENDOR.email);
    await fillInput(page, 'input[name="password"]', TEST_VENDOR.password);
    
    // Submit form
    await clickElement(page, 'button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    // Verify successful login
    const isDashboard = await elementExists(page, '.vendor-dashboard');
    
    if (isDashboard) {
      console.log('✅ Vendor login successful');
      testResults.login = true;
      successPaths.push('Vendor Login');
    } else {
      console.log('❌ Vendor login failed');
      failurePaths.push('Vendor Login');
    }
  } catch (error) {
    console.error('Error in vendor login test:', error);
    failurePaths.push('Vendor Login');
  }
}

/**
 * Test Stripe Connect onboarding (mocked)
 */
async function testStripeConnectOnboarding(page) {
  try {
    console.log('Testing Stripe Connect onboarding (mocked)...');
    
    // Check for Stripe Connect onboarding prompt
    const hasOnboardingPrompt = await elementExists(page, '.stripe-connect-section, .onboarding-section');
    
    if (!hasOnboardingPrompt) {
      console.log('❌ Stripe Connect onboarding section not found');
      failurePaths.push('Stripe Connect Onboarding');
      return false;
    }
    
    // Click the "Connect with Stripe" button
    await clickElement(page, '.stripe-connect-button');
    
    // Mock the Stripe Connect OAuth flow - inject test account ID
    // This would normally navigate to Stripe and come back with OAuth token
    
    // In our test, we'll inject a mock Stripe account ID directly
    await page.evaluate(() => {
      // Mock successful Stripe Connect authorization
      localStorage.setItem('stripe_account_id', 'acct_mock' + Date.now());
      // Trigger any callbacks or state updates that would happen after successful connect
      window.dispatchEvent(new CustomEvent('stripe-connect-complete', { 
        detail: { success: true, accountId: 'acct_mock' + Date.now() }
      }));
    });
    
    // Wait for onboarding completion indication
    await waitForElement(page, '.stripe-connected-badge, .onboarding-complete');
    
    // Verify Stripe connected status
    const isConnected = await elementExists(page, '.stripe-connected-badge, .onboarding-complete');
    
    if (isConnected) {
      console.log('✅ Stripe Connect onboarding (mocked) successful');
      testResults.stripeConnect = true;
      successPaths.push('Stripe Connect Onboarding');
      return true;
    } else {
      console.log('❌ Stripe Connect onboarding indicator not found after mock completion');
      failurePaths.push('Stripe Connect Onboarding');
      return false;
    }
  } catch (error) {
    console.error('Error in Stripe Connect onboarding test:', error);
    failurePaths.push('Stripe Connect Onboarding');
    return false;
  }
}

/**
 * Test product creation
 */
async function testProductCreation(page) {
  try {
    console.log('Testing product creation...');
    
    // Navigate to add product page
    await clickElement(page, '.add-product-button, a[href*="add-product"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    // Verify we're on the add product page
    const isAddProductPage = await elementExists(page, '.add-product-form, form[id*="product"]');
    
    if (!isAddProductPage) {
      console.log('❌ Add product page not found');
      failurePaths.push('Product Creation');
      return null;
    }
    
    // Fill product form
    await fillInput(page, 'input[name="name"]', TEST_PRODUCT.name);
    await fillInput(page, 'textarea[name="description"]', TEST_PRODUCT.description);
    await fillInput(page, 'input[name="price"]', TEST_PRODUCT.price.toString());
    
    // Check if there's a stock/inventory field
    const hasStockField = await elementExists(page, 'input[name="stock"], input[name="inventory"]');
    if (hasStockField) {
      await fillInput(page, 'input[name="stock"], input[name="inventory"]', TEST_PRODUCT.stock.toString());
    }
    
    // Submit form
    await clickElement(page, 'button[type="submit"]');
    
    // Wait for redirect or success message
    await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {
      // Some forms might show success message without redirect
      console.log('No navigation after product submission - checking for success message');
    });
    
    // Check for success message or product listing
    const isSuccess = await elementExists(page, '.success-message, .product-created, .product-list');
    
    if (isSuccess) {
      console.log('✅ Product creation successful');
      testResults.productCreation = true;
      successPaths.push('Product Creation');
      
      // Try to find product ID or use timestamp for mock ID
      const productId = await page.evaluate(() => {
        // Try to find product ID in URL or on page
        const idFromUrl = window.location.href.match(/product[s]?\/(\d+)/);
        if (idFromUrl) return idFromUrl[1];
        
        // Try to find in DOM
        const idElement = document.querySelector('[data-product-id]');
        if (idElement) return idElement.getAttribute('data-product-id');
        
        // Fallback
        return 'mock_' + Date.now();
      });
      
      return { ...TEST_PRODUCT, id: productId };
    } else {
      console.log('❌ Product creation success indicator not found');
      failurePaths.push('Product Creation');
      return null;
    }
  } catch (error) {
    console.error('Error in product creation test:', error);
    failurePaths.push('Product Creation');
    return null;
  }
}

/**
 * Test product update
 */
async function testProductUpdate(page, product) {
  try {
    console.log('Testing product update...');
    
    // Navigate to vendor's products list
    await navigateTo(page, `${BASE_URL}/vendor/products`);
    
    // Find and click edit button for our product
    const productSelector = `[data-product-id="${product.id}"], tr:has(.product-name:contains("${product.name}"))`;
    const editButtonSelector = `${productSelector} .edit-button, ${productSelector} a[href*="edit"]`;
    
    const hasEditButton = await elementExists(page, editButtonSelector);
    if (!hasEditButton) {
      console.log('❌ Edit button not found for product');
      failurePaths.push('Product Update');
      return false;
    }
    
    await clickElement(page, editButtonSelector);
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    // Verify we're on the edit product page
    const isEditPage = await elementExists(page, '.edit-product-form, form[id*="product"]');
    
    if (!isEditPage) {
      console.log('❌ Edit product page not found');
      failurePaths.push('Product Update');
      return false;
    }
    
    // Update product name
    const updatedName = `${product.name} (Updated)`;
    await fillInput(page, 'input[name="name"]', updatedName);
    
    // Submit form
    await clickElement(page, 'button[type="submit"]');
    
    // Wait for redirect or success message
    await page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(() => {
      // Some forms might show success message without redirect
      console.log('No navigation after update submission - checking for success message');
    });
    
    // Check for success message or updated product listing
    const isSuccess = await elementExists(page, '.success-message, .product-updated, .product-list');
    
    if (isSuccess) {
      console.log('✅ Product update successful');
      testResults.productUpdate = true;
      successPaths.push('Product Update');
      return true;
    } else {
      console.log('❌ Product update success indicator not found');
      failurePaths.push('Product Update');
      return false;
    }
  } catch (error) {
    console.error('Error in product update test:', error);
    failurePaths.push('Product Update');
    return false;
  }
}

/**
 * Test product management
 */
async function testProductManagement(page) {
  try {
    console.log('Testing product management...');
    
    // Navigate to vendor's products list
    await navigateTo(page, `${BASE_URL}/vendor/products`);
    
    // Verify product listing elements
    const hasList = await elementExists(page, '.product-list, table.products');
    const hasProducts = await elementExists(page, '.product-item, tr.product-row');
    const hasManagementTools = await elementExists(page, '.product-actions, .management-tools');
    
    if (hasList && hasProducts && hasManagementTools) {
      console.log('✅ Product management interface verified');
      testResults.productManagement = true;
      successPaths.push('Product Management');
      return true;
    } else {
      console.log('❌ Product management interface elements not found');
      if (!hasList) console.log('  - Missing product list element');
      if (!hasProducts) console.log('  - No products displayed');
      if (!hasManagementTools) console.log('  - Missing management tools');
      failurePaths.push('Product Management');
      return false;
    }
  } catch (error) {
    console.error('Error in product management test:', error);
    failurePaths.push('Product Management');
    return false;
  }
}

/**
 * Test order management
 */
async function testOrderManagement(page) {
  try {
    console.log('Testing vendor order management...');
    
    // Navigate to vendor's orders
    await navigateTo(page, `${BASE_URL}/vendor/orders`);
    
    // Check if orders page exists (even if empty)
    const hasOrdersPage = await elementExists(page, '.orders-page, .order-management');
    
    if (!hasOrdersPage) {
      console.log('❌ Orders management page not found');
      failurePaths.push('Order Management');
      return false;
    }
    
    // Check for orders or empty state
    const hasOrders = await elementExists(page, '.order-item, tr.order-row');
    const hasEmptyState = await elementExists(page, '.no-orders, .empty-state');
    
    if (hasOrders) {
      console.log('✅ Orders displayed in management interface');
      const orderCount = (await page.$$('.order-item, tr.order-row')).length;
      console.log(`   Found ${orderCount} orders`);
      testResults.orders = true;
      successPaths.push('Order Management');
      return true;
    } else if (hasEmptyState) {
      console.log('✅ Orders page found with proper empty state');
      testResults.orders = true;
      successPaths.push('Order Management');
      return true;
    } else {
      console.log('❌ Neither orders nor empty state indicator found');
      failurePaths.push('Order Management');
      return false;
    }
  } catch (error) {
    console.error('Error in order management test:', error);
    failurePaths.push('Order Management');
    return false;
  }
}

/**
 * Test transactions and analytics
 */
async function testTransactions(page) {
  try {
    console.log('Testing vendor transactions and analytics...');
    
    // Navigate to vendor's transactions/dashboard
    await navigateTo(page, `${BASE_URL}/vendor/transactions`);
    
    // Check if transactions page exists
    const hasTransactionsPage = await elementExists(page, '.transactions-page, .analytics-dashboard');
    
    if (!hasTransactionsPage) {
      console.log('❌ Transactions/analytics page not found');
      failurePaths.push('Transactions & Analytics');
      return false;
    }
    
    // Check for specific transaction elements
    const hasRevenueSummary = await elementExists(page, '.revenue-summary, .sales-summary');
    const hasTransactionList = await elementExists(page, '.transaction-list, .payout-history');
    const hasAnalytics = await elementExists(page, '.analytics-chart, .sales-chart');
    
    // We'll pass if we find at least 2 of these elements
    const foundElements = [hasRevenueSummary, hasTransactionList, hasAnalytics].filter(Boolean).length;
    
    if (foundElements >= 2) {
      console.log('✅ Transactions and analytics interface verified');
      console.log(`   Found ${foundElements}/3 key elements`);
      testResults.transactions = true;
      successPaths.push('Transactions & Analytics');
      return true;
    } else {
      console.log('❌ Missing critical transaction/analytics elements');
      if (!hasRevenueSummary) console.log('  - Missing revenue summary');
      if (!hasTransactionList) console.log('  - Missing transaction list');
      if (!hasAnalytics) console.log('  - Missing analytics charts');
      failurePaths.push('Transactions & Analytics');
      return false;
    }
  } catch (error) {
    console.error('Error in transactions test:', error);
    failurePaths.push('Transactions & Analytics');
    return false;
  }
}

module.exports = {
  testVendorJourney
};

// If run directly
if (require.main === module) {
  testVendorJourney().catch(console.error);
}