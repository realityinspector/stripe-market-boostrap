/**
 * Example E2E Test for Stripe Connect Marketplace
 * 
 * 🚨 ATTENTION AI AGENTS 🚨
 * This is an example test file that demonstrates how to use the E2E test template.
 * Use this as a reference when creating new E2E tests.
 */

const { 
  initBrowser, 
  closeBrowser, 
  createPage, 
  navigateTo,
  elementExists,
  clickElement,
  fillInput,
  getElementText,
  waitForElement,
  mockSafeWait,
  takeScreenshot
} = require('../utils/puppeteerHelper');

const {
  createTestUser,
  loginUser,
  createTestProduct,
  cleanupTestData
} = require('../utils/testHelpers');

// Base URL for E2E testing
const BASE_URL = process.env.E2E_URL || 'http://localhost:8000';

/**
 * Test Quick Purchase Journey
 * 
 * Description:
 * This test validates the complete quick purchase flow for a customer
 * from product discovery to payment completion without account creation.
 * 
 * User Journey Steps:
 * 1. Visit the marketplace homepage
 * 2. Search for a product
 * 3. View product details
 * 4. Add product to cart
 * 5. Proceed to checkout as a guest
 * 6. Fill in shipping & payment information
 * 7. Complete purchase
 * 8. Verify order confirmation
 * 
 * Expected Outcome:
 * - Successful order placement with confirmation number
 * - No account creation required
 */
async function testQuickPurchaseJourney() {
  console.log('Testing quick purchase journey...');
  
  let browser;
  let page;
  let testData = {
    users: [],
    products: [],
    orders: []
  };
  
  try {
    // Initialize browser and page
    browser = await initBrowser();
    page = await createPage(browser);
    
    // JOURNEY STEP 1: Visit the marketplace homepage
    await navigateTo(page, BASE_URL);
    
    // Wait for the homepage to load
    const homePageLoaded = await waitForElement(page, '.featured-products');
    if (!homePageLoaded) {
      throw new Error('Homepage not loaded correctly');
    }
    
    // Take screenshot of homepage
    await takeScreenshot(page, 'testing/screenshots/quick-purchase-home.png');
    
    // JOURNEY STEP 2: Search for a product
    await fillInput(page, '.search-input', 'premium headphones');
    await clickElement(page, '.search-button');
    
    // Wait for search results
    await mockSafeWait(page, 1000);
    const searchResultsLoaded = await waitForElement(page, '.search-results');
    if (!searchResultsLoaded) {
      throw new Error('Search results not loaded');
    }
    
    // Verify search results contain products
    const productCards = await page.$$('.product-card');
    if (productCards.length === 0) {
      throw new Error('No products found in search results');
    }
    
    // JOURNEY STEP 3: View product details (click first product)
    await clickElement(page, '.product-card:first-child');
    
    // Wait for product details page to load
    const productDetailsLoaded = await waitForElement(page, '.product-details');
    if (!productDetailsLoaded) {
      throw new Error('Product details page not loaded');
    }
    
    // Capture product info for later verification
    const productTitle = await getElementText(page, '.product-title');
    const productPrice = await getElementText(page, '.product-price');
    
    // Take screenshot of product details
    await takeScreenshot(page, 'testing/screenshots/quick-purchase-product.png');
    
    // JOURNEY STEP 4: Add product to cart
    await clickElement(page, '.add-to-cart-button');
    
    // Wait for cart update confirmation
    const cartUpdateConfirmed = await waitForElement(page, '.cart-confirmation', 3000);
    if (!cartUpdateConfirmed) {
      throw new Error('Cart update confirmation not shown');
    }
    
    // Navigate to cart page
    await clickElement(page, '.view-cart-button');
    
    // Wait for cart page to load
    const cartPageLoaded = await waitForElement(page, '.cart-items');
    if (!cartPageLoaded) {
      throw new Error('Cart page not loaded');
    }
    
    // Verify product is in cart
    const cartItemTitle = await getElementText(page, '.cart-item-title');
    if (cartItemTitle !== productTitle) {
      throw new Error(`Product title mismatch in cart: expected "${productTitle}", got "${cartItemTitle}"`);
    }
    
    // JOURNEY STEP 5: Proceed to checkout as a guest
    await clickElement(page, '.checkout-as-guest-button');
    
    // Wait for checkout page to load
    const checkoutLoaded = await waitForElement(page, '.checkout-form');
    if (!checkoutLoaded) {
      throw new Error('Checkout page not loaded');
    }
    
    // Take screenshot of checkout page
    await takeScreenshot(page, 'testing/screenshots/quick-purchase-checkout.png');
    
    // JOURNEY STEP 6: Fill in shipping information
    await fillInput(page, 'input[name="fullName"]', 'Test Customer');
    await fillInput(page, 'input[name="email"]', 'test@example.com');
    await fillInput(page, 'input[name="address"]', '123 Test Street');
    await fillInput(page, 'input[name="city"]', 'Test City');
    await fillInput(page, 'input[name="zipCode"]', '12345');
    await fillInput(page, 'select[name="country"]', 'US');
    
    // Fill in credit card details (using mock payment form)
    await fillInput(page, 'input[name="cardNumber"]', '4242424242424242');
    await fillInput(page, 'input[name="cardExpiry"]', '12/25');
    await fillInput(page, 'input[name="cardCvc"]', '123');
    
    // JOURNEY STEP 7: Complete purchase
    await clickElement(page, '.complete-purchase-button');
    
    // Inject Stripe mock (if needed)
    await page.evaluate(() => {
      window.Stripe = function() {
        return {
          elements: () => ({
            create: () => ({
              mount: () => {},
              on: (event, callback) => { if (event === 'ready') callback(); }
            })
          }),
          confirmCardPayment: async () => ({ paymentIntent: { status: 'succeeded' } })
        };
      };
    });
    
    // Wait for payment processing
    await mockSafeWait(page, 3000);
    
    // JOURNEY STEP 8: Verify order confirmation
    const orderConfirmationLoaded = await waitForElement(page, '.order-confirmation', 5000);
    if (!orderConfirmationLoaded) {
      throw new Error('Order confirmation page not loaded');
    }
    
    // Take screenshot of confirmation page
    await takeScreenshot(page, 'testing/screenshots/quick-purchase-confirmation.png');
    
    // Verify success message
    const confirmationMessage = await getElementText(page, '.confirmation-message');
    if (!confirmationMessage.includes('Thank you for your order')) {
      throw new Error(`Unexpected confirmation message: ${confirmationMessage}`);
    }
    
    // Verify order details
    const orderTotal = await getElementText(page, '.order-total');
    if (!orderTotal.includes(productPrice.replace(/[^0-9.]/g, ''))) {
      throw new Error(`Order total doesn't match product price: ${orderTotal} vs ${productPrice}`);
    }
    
    // Record order ID for cleanup
    const orderId = await getElementText(page, '.order-number');
    testData.orders.push({ id: orderId.replace('Order #', '') });
    
    console.log('Quick purchase journey test passed');
    return { passed: true };
  } catch (error) {
    console.error(`Quick purchase journey test failed: ${error.message}`);
    
    // Capture failure screenshot if possible
    if (page) {
      await takeScreenshot(page, 'testing/screenshots/quick-purchase-failure.png');
    }
    
    return { 
      passed: false, 
      error: error.message 
    };
  } finally {
    // Always close the browser
    if (browser) {
      await closeBrowser(browser);
    }
    
    // Clean up test data
    await cleanupTestData(testData.users, testData.products, testData.orders);
  }
}

/**
 * Test Quick Purchase Error Handling
 * 
 * Description:
 * This test validates how the system handles errors during the quick purchase flow
 * 
 * Error Scenarios:
 * 1. Invalid credit card information
 * 2. Out of stock product
 * 
 * Expected Behavior:
 * - Clear error messages for invalid payment
 * - Proper handling of inventory issues
 */
async function testQuickPurchaseErrorHandling() {
  console.log('Testing quick purchase error handling...');
  
  let browser;
  let page;
  let testData = {
    users: [],
    products: [],
    orders: []
  };
  
  try {
    // Initialize browser and page
    browser = await initBrowser();
    page = await createPage(browser);
    
    // First test: Invalid credit card information
    
    // Navigate through purchase flow
    await navigateTo(page, BASE_URL);
    await clickElement(page, '.featured-product');
    await waitForElement(page, '.product-details');
    await clickElement(page, '.add-to-cart-button');
    await mockSafeWait(page, 1000);
    await clickElement(page, '.view-cart-button');
    await waitForElement(page, '.cart-items');
    await clickElement(page, '.checkout-as-guest-button');
    await waitForElement(page, '.checkout-form');
    
    // Fill in shipping information
    await fillInput(page, 'input[name="fullName"]', 'Test Customer');
    await fillInput(page, 'input[name="email"]', 'test@example.com');
    await fillInput(page, 'input[name="address"]', '123 Test Street');
    await fillInput(page, 'input[name="city"]', 'Test City');
    await fillInput(page, 'input[name="zipCode"]', '12345');
    await fillInput(page, 'select[name="country"]', 'US');
    
    // Fill in INVALID credit card details
    await fillInput(page, 'input[name="cardNumber"]', '4242424242424241'); // Invalid last digit
    await fillInput(page, 'input[name="cardExpiry"]', '12/25');
    await fillInput(page, 'input[name="cardCvc"]', '123');
    
    // Mock Stripe with error response
    await page.evaluate(() => {
      window.Stripe = function() {
        return {
          elements: () => ({
            create: () => ({
              mount: () => {},
              on: (event, callback) => { if (event === 'ready') callback(); }
            })
          }),
          confirmCardPayment: async () => ({ 
            error: { message: 'Your card number is invalid.' } 
          })
        };
      };
    });
    
    // Try to complete purchase
    await clickElement(page, '.complete-purchase-button');
    
    // Wait for error message
    await mockSafeWait(page, 2000);
    
    // Verify error message is displayed
    const paymentErrorVisible = await elementExists(page, '.payment-error');
    if (!paymentErrorVisible) {
      throw new Error('Payment error message not displayed');
    }
    
    const errorMessage = await getElementText(page, '.payment-error');
    if (!errorMessage.includes('card') && !errorMessage.includes('invalid')) {
      throw new Error(`Unexpected error message: ${errorMessage}`);
    }
    
    // Take screenshot of error
    await takeScreenshot(page, 'testing/screenshots/quick-purchase-payment-error.png');
    
    // Second test: Out of stock product
    
    // Create a new page instance for the second test
    await closeBrowser(browser);
    browser = await initBrowser();
    page = await createPage(browser);
    
    // Create or find an out-of-stock product
    // (Assuming there's an out-of-stock product with ID 999 or a special URL)
    await navigateTo(page, `${BASE_URL}/products/out-of-stock-demo`);
    
    // Verify out-of-stock message
    const outOfStockVisible = await elementExists(page, '.out-of-stock-message');
    if (!outOfStockVisible) {
      throw new Error('Out of stock message not displayed');
    }
    
    // Verify add to cart button is disabled
    const addToCartButton = await page.$('.add-to-cart-button');
    const isDisabled = await page.evaluate(button => button.disabled, addToCartButton);
    if (!isDisabled) {
      throw new Error('Add to cart button should be disabled for out-of-stock product');
    }
    
    // Take screenshot of out-of-stock product
    await takeScreenshot(page, 'testing/screenshots/quick-purchase-out-of-stock.png');
    
    console.log('Quick purchase error handling test passed');
    return { passed: true };
  } catch (error) {
    console.error(`Quick purchase error handling test failed: ${error.message}`);
    
    // Capture failure screenshot if possible
    if (page) {
      await takeScreenshot(page, 'testing/screenshots/quick-purchase-error-handling-failure.png');
    }
    
    return { 
      passed: false, 
      error: error.message 
    };
  } finally {
    // Always close the browser
    if (browser) {
      await closeBrowser(browser);
    }
    
    // Clean up test data
    await cleanupTestData(testData.users, testData.products, testData.orders);
  }
}

// Export test functions for integration with the test runner
module.exports = {
  testQuickPurchaseJourney,
  testQuickPurchaseErrorHandling
};

/**
 * 📝 Notes for AI Agents:
 * 
 * This example demonstrates:
 * 
 * 1. Proper structure for E2E tests following the template
 * 2. Testing a complete user journey from start to finish
 * 3. Testing error scenarios and appropriate error handling
 * 4. Using puppeteerHelper utilities for browser automation
 * 5. Mocking Stripe payment processing
 * 6. Capturing screenshots at key points in the flow
 * 7. Proper cleanup of test data and resources
 * 
 * When creating new E2E tests:
 * - Structure tests around complete user journeys
 * - Test both happy path and error scenarios
 * - Capture screenshots at key points for debugging
 * - Clean up test data in finally blocks
 * - Mock external services like Stripe when necessary
 * 
 * See the /testing/templates/e2e_test_template.js file for the base template.
 */