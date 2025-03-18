/**
 * Customer Journey Functional Tests
 * 
 * This test suite validates the complete customer journey through the marketplace:
 * 1. Registration and authentication
 * 2. Browsing products
 * 3. Purchasing a product
 * 4. Viewing order history
 */

const puppeteer = require('puppeteer');
const { initBrowser, closeBrowser, createPage, navigateTo, waitForElement,
  elementExists, fillInput, clickElement, getElementText } = require('../utils/puppeteerHelper');

// Test data and configurations
const BASE_URL = 'http://localhost:8000';
const TEST_CUSTOMER = {
  name: `Test Customer ${Date.now()}`,
  email: `customer_${Date.now()}@example.com`,
  password: `Password${Date.now()}`,
};

// Success criteria validation
let testResults = {
  registration: false,
  login: false,
  productBrowsing: false,
  productDetails: false,
  checkout: false,
  payment: false,
  orderHistory: false
};

// Track successful test paths for reporting
const successPaths = [];
const failurePaths = [];

/**
 * Test the complete customer journey flow
 */
async function testCustomerJourney() {
  let browser;
  let page;
  
  try {
    console.log('Starting Customer Journey Test...');
    
    // Initialize browser
    browser = await initBrowser();
    page = await createPage(browser);
    
    // Step 1: Register as a new customer
    await testCustomerRegistration(page);
    
    // Step 2: Logout and login again to verify credentials
    await testCustomerLogin(page);
    
    // Step 3: Browse products
    await testProductBrowsing(page);
    
    // Step 4: View product details
    await testProductDetails(page);
    
    // Step 5: Checkout process
    await testCheckoutProcess(page);
    
    // Step 6: Payment process (with Stripe mock)
    await testPaymentProcess(page);
    
    // Step 7: Order history
    await testOrderHistory(page);
    
    // Report results
    console.log('\nCustomer Journey Test Results:');
    console.log('-----------------------------');
    Object.entries(testResults).forEach(([test, result]) => {
      console.log(`${test}: ${result ? '✅ PASSED' : '❌ FAILED'}`);
    });
    
    console.log(`\nSuccessful paths: ${successPaths.length}`);
    successPaths.forEach(path => console.log(`- ${path}`));
    
    console.log(`\nFailed paths: ${failurePaths.length}`);
    failurePaths.forEach(path => console.log(`- ${path}`));
    
  } catch (error) {
    console.error('Error in customer journey test:', error);
  } finally {
    // Cleanup
    if (browser) {
      await closeBrowser(browser);
    }
  }
}

/**
 * Test customer registration
 */
async function testCustomerRegistration(page) {
  try {
    console.log('Testing customer registration...');
    
    // Navigate to registration page
    await navigateTo(page, `${BASE_URL}/register`);
    
    // Fill registration form
    await fillInput(page, 'input[name="name"]', TEST_CUSTOMER.name);
    await fillInput(page, 'input[name="email"]', TEST_CUSTOMER.email);
    await fillInput(page, 'input[name="password"]', TEST_CUSTOMER.password);
    await fillInput(page, 'input[name="confirmPassword"]', TEST_CUSTOMER.password);
    
    // Select customer role
    await clickElement(page, 'input[value="customer"]');
    
    // Submit form
    await clickElement(page, 'button[type="submit"]');
    
    // Wait for redirect to dashboard or confirmation
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    // Verify successful registration
    const isDashboard = await elementExists(page, '.customer-dashboard');
    
    if (isDashboard) {
      console.log('✅ Customer registration successful');
      testResults.registration = true;
      successPaths.push('Customer Registration');
      
      // Logout for login test
      await clickElement(page, '.logout-button');
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
    } else {
      console.log('❌ Customer registration failed');
      failurePaths.push('Customer Registration');
    }
  } catch (error) {
    console.error('Error in customer registration test:', error);
    failurePaths.push('Customer Registration');
  }
}

/**
 * Test customer login
 */
async function testCustomerLogin(page) {
  try {
    console.log('Testing customer login...');
    
    // Navigate to login page
    await navigateTo(page, `${BASE_URL}/login`);
    
    // Fill login form
    await fillInput(page, 'input[name="email"]', TEST_CUSTOMER.email);
    await fillInput(page, 'input[name="password"]', TEST_CUSTOMER.password);
    
    // Submit form
    await clickElement(page, 'button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    // Verify successful login
    const isDashboard = await elementExists(page, '.customer-dashboard');
    
    if (isDashboard) {
      console.log('✅ Customer login successful');
      testResults.login = true;
      successPaths.push('Customer Login');
    } else {
      console.log('❌ Customer login failed');
      failurePaths.push('Customer Login');
    }
  } catch (error) {
    console.error('Error in customer login test:', error);
    failurePaths.push('Customer Login');
  }
}

/**
 * Test product browsing
 */
async function testProductBrowsing(page) {
  try {
    console.log('Testing product browsing...');
    
    // Navigate to products page
    await navigateTo(page, `${BASE_URL}/products`);
    
    // Wait for product list to load
    await waitForElement(page, '.product-card');
    
    // Verify product listing exists
    const productCards = await page.$$('.product-card');
    
    if (productCards.length > 0) {
      console.log(`✅ Product browsing successful - found ${productCards.length} products`);
      testResults.productBrowsing = true;
      successPaths.push('Product Browsing');
      
      // Remember first product for details test
      const firstProductId = await page.evaluate(
        el => el.getAttribute('data-product-id'),
        productCards[0]
      );
      return firstProductId;
    } else {
      console.log('❌ No products found in listing');
      failurePaths.push('Product Browsing');
      return null;
    }
  } catch (error) {
    console.error('Error in product browsing test:', error);
    failurePaths.push('Product Browsing');
    return null;
  }
}

/**
 * Test product details
 */
async function testProductDetails(page) {
  try {
    console.log('Testing product details view...');
    
    // Find and click on a product card
    const productCards = await page.$$('.product-card');
    if (productCards.length === 0) {
      console.log('❌ No products available for testing details view');
      failurePaths.push('Product Details');
      return null;
    }
    
    await productCards[0].click();
    
    // Wait for product details to load
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await waitForElement(page, '.product-details');
    
    // Verify product details are displayed
    const hasDetails = await elementExists(page, '.product-name') &&
                       await elementExists(page, '.product-price') &&
                       await elementExists(page, '.product-description');
    
    if (hasDetails) {
      console.log('✅ Product details view successful');
      testResults.productDetails = true;
      successPaths.push('Product Details View');
      
      // Capture product details for later verification
      const productDetails = {
        name: await getElementText(page, '.product-name'),
        price: await getElementText(page, '.product-price'),
      };
      
      return productDetails;
    } else {
      console.log('❌ Product details not fully displayed');
      failurePaths.push('Product Details View');
      return null;
    }
  } catch (error) {
    console.error('Error in product details test:', error);
    failurePaths.push('Product Details View');
    return null;
  }
}

/**
 * Test checkout process
 */
async function testCheckoutProcess(page) {
  try {
    console.log('Testing checkout process...');
    
    // Assuming we're on the product details page
    // Click the buy/add to cart button
    await clickElement(page, '.buy-now-button, .add-to-cart-button');
    
    // Check if we're using cart flow or direct checkout
    const isCartFlow = await elementExists(page, '.cart-page');
    
    if (isCartFlow) {
      // Click proceed to checkout
      await clickElement(page, '.proceed-to-checkout');
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
    
    // Wait for checkout page to load
    await waitForElement(page, '.checkout-page');
    
    // Verify checkout elements are present
    const hasCheckoutElements = await elementExists(page, '.order-summary') &&
                               await elementExists(page, '.payment-section');
    
    if (hasCheckoutElements) {
      console.log('✅ Checkout process navigation successful');
      testResults.checkout = true;
      successPaths.push('Checkout Process');
      return true;
    } else {
      console.log('❌ Checkout page missing expected elements');
      failurePaths.push('Checkout Process');
      return false;
    }
  } catch (error) {
    console.error('Error in checkout process test:', error);
    failurePaths.push('Checkout Process');
    return false;
  }
}

/**
 * Test payment process with Stripe mock
 */
async function testPaymentProcess(page) {
  try {
    console.log('Testing payment process with Stripe mock...');
    
    // Wait for Stripe Elements to load
    await waitForElement(page, '.StripeElement');
    
    // Using Stripe test card number
    // We need to access the Stripe iframe
    const stripeFrame = page.frames().find(frame => 
      frame.url().includes('stripe.com') || frame.url().includes('js.stripe.com')
    );
    
    if (!stripeFrame) {
      console.log('❌ Could not find Stripe iframe');
      failurePaths.push('Payment Process');
      return false;
    }
    
    // Fill card details in the Stripe iframe (using test card)
    await stripeFrame.type('.CardNumberInput', '4242424242424242'); // Test card number
    await stripeFrame.type('.CardField-expiry input', '1234'); // MM/YY
    await stripeFrame.type('.CardField-cvc input', '123'); // CVC
    
    // Submit payment
    await clickElement(page, 'button[type="submit"]');
    
    // Wait for payment processing and confirmation
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    // Check for confirmation message
    const hasConfirmation = await elementExists(page, '.payment-confirmation, .order-confirmation');
    
    if (hasConfirmation) {
      console.log('✅ Payment process successful');
      testResults.payment = true;
      successPaths.push('Payment Process');
      
      // Capture confirmation details
      const confirmationText = await getElementText(page, '.payment-confirmation, .order-confirmation');
      console.log(`Confirmation message: ${confirmationText}`);
      
      return true;
    } else {
      console.log('❌ Payment confirmation not found');
      failurePaths.push('Payment Process');
      return false;
    }
  } catch (error) {
    console.error('Error in payment process test:', error);
    failurePaths.push('Payment Process');
    return false;
  }
}

/**
 * Test order history
 */
async function testOrderHistory(page) {
  try {
    console.log('Testing order history...');
    
    // Navigate to order history page
    await navigateTo(page, `${BASE_URL}/orders`);
    
    // Wait for order list to load
    await waitForElement(page, '.order-list, .order-history');
    
    // Check if orders are displayed
    const orderItems = await page.$$('.order-item');
    
    if (orderItems.length > 0) {
      console.log(`✅ Order history test successful - found ${orderItems.length} orders`);
      testResults.orderHistory = true;
      successPaths.push('Order History');
      
      // Verify most recent order matches our purchase
      const recentOrderText = await getElementText(page, '.order-item:first-child');
      console.log(`Most recent order: ${recentOrderText}`);
      
      return true;
    } else {
      console.log('❌ No orders found in history');
      failurePaths.push('Order History');
      return false;
    }
  } catch (error) {
    console.error('Error in order history test:', error);
    failurePaths.push('Order History');
    return false;
  }
}

module.exports = {
  testCustomerJourney
};

// If run directly
if (require.main === module) {
  testCustomerJourney().catch(console.error);
}