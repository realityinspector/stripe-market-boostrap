/**
 * UI Testing with Puppeteer
 * 
 * This file contains E2E tests for the UI using Puppeteer for live rendering.
 * These tests validate the UI components and user flows in a headless browser.
 */

const path = require('path');
const fs = require('fs');
const { 
  initBrowser, 
  closeBrowser, 
  testPageRendering, 
  testAuthFlow,
  testPaymentFlow 
} = require('../utils/puppeteerHelper');
const { createTestUser, createTestProduct } = require('../utils/testHelpers');

// Store test users, products, etc. for cleanup
const testUsers = [];
const testProducts = [];
const testOrders = [];

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, '../screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Base URL for the application
const BASE_URL = 'http://localhost:5000';
const API_URL = 'http://localhost:8000';

/**
 * Test the home page rendering
 */
async function testHomePageRendering() {
  console.log('Testing home page rendering...');
  
  const result = await testPageRendering(`${BASE_URL}/`, {
    selectors: ['.app-header', '.product-list', '.search-bar'],
    screenshotPath: path.join(screenshotsDir, 'home-page.png')
  });
  
  if (!result.success) {
    throw new Error(`Home page rendering test failed: ${result.errors.join(', ')}`);
  }
  
  console.log('Home page rendering test passed');
  return true;
}

/**
 * Test the login flow
 */
async function testLoginFlow() {
  console.log('Testing login flow...');
  
  // Create a test user
  const { user, password } = await createTestUser('customer');
  testUsers.push(user);
  
  // Test login flow
  const result = await testAuthFlow(BASE_URL, {
    email: user.email,
    password: password
  }, {
    screenshotPath: path.join(screenshotsDir, 'login-flow.png')
  });
  
  if (!result.success) {
    throw new Error(`Login flow test failed: ${result.errors.join(', ')}`);
  }
  
  console.log('Login flow test passed');
  return result.token;
}

/**
 * Test the product details page
 */
async function testProductDetailsPage() {
  console.log('Testing product details page...');
  
  // Create a test vendor
  const { user: vendor, token: vendorToken } = await createTestUser('vendor');
  testUsers.push(vendor);
  
  // Create a test product
  const product = await createTestProduct(vendor.id, vendorToken);
  testProducts.push(product);
  
  // Test product details page
  const result = await testPageRendering(`${BASE_URL}/products/${product.id}`, {
    selectors: ['.product-details', '.product-price', '.add-to-cart-button'],
    screenshotPath: path.join(screenshotsDir, 'product-details.png')
  });
  
  if (!result.success) {
    throw new Error(`Product details page test failed: ${result.errors.join(', ')}`);
  }
  
  console.log('Product details page test passed');
  return true;
}

/**
 * Test the checkout process
 */
async function testCheckoutProcess() {
  console.log('Testing checkout process...');
  
  // Create a test customer
  const { user: customer, token: customerToken } = await createTestUser('customer');
  testUsers.push(customer);
  
  // Create a test vendor with Stripe onboarding completed
  const { user: vendor, token: vendorToken } = await createTestUser('vendor');
  testUsers.push(vendor);
  
  // Create a test product
  const product = await createTestProduct(vendor.id, vendorToken);
  testProducts.push(product);
  
  // Test payment flow
  const result = await testPaymentFlow(BASE_URL, {
    productId: product.id,
    quantity: 1
  }, customerToken, {
    screenshotPath: path.join(screenshotsDir, 'checkout-process.png')
  });
  
  if (!result.success) {
    throw new Error(`Checkout process test failed: ${result.errors.join(', ')}`);
  }
  
  if (result.orderId) {
    testOrders.push(result.orderId);
  }
  
  console.log('Checkout process test passed');
  return true;
}

/**
 * Run all UI tests
 */
async function runUITests() {
  try {
    await initBrowser();
    
    // Run the tests
    await testHomePageRendering();
    await testLoginFlow();
    await testProductDetailsPage();
    await testCheckoutProcess();
    
    return {
      success: true,
      message: 'All UI tests passed'
    };
  } catch (error) {
    return {
      success: false,
      message: `UI tests failed: ${error.message}`
    };
  } finally {
    // Clean up
    console.log('Cleaning up test data...');
    console.log(`Would clean up ${testUsers.length} test users`);
    console.log(`Would clean up ${testProducts.length} test products`);
    console.log(`Would clean up ${testOrders.length} test orders`);
    
    // Close the browser
    await closeBrowser();
  }
}

module.exports = {
  testHomePageRendering,
  testLoginFlow,
  testProductDetailsPage,
  testCheckoutProcess,
  runUITests
};