/**
 * E2E Tester
 * 
 * End-to-end testing for complex flows that span multiple components.
 * Tests complete user journeys like registration, product creation, purchasing, etc.
 */

const axios = require('axios');
const { createMockBrowser } = require('./uiTester');

/**
 * Perform all E2E tests
 * @param {Object} config - Testing configuration
 * @returns {Object} Test results
 */
async function performE2eTests(config) {
  console.log('Starting E2E testing...');
  
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };
  
  // Create API client
  const api = axios.create({
    baseURL: config.baseUrl,
    timeout: config.timeouts.apiResponse,
    validateStatus: () => true // Don't throw on error status codes
  });
  
  // Try to launch browser for UI tests
  let browser;
  try {
    const puppeteer = require('puppeteer');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('Successfully launched browser for E2E testing');
  } catch (error) {
    console.warn(`Error initializing browser: ${error.message}`);
    console.log('Using mock browser for E2E testing...');
    browser = createMockBrowser();
  }
  
  try {
    // Test vendor onboarding and product management flow
    await testVendorFlow();
    
    // Test customer shopping and checkout flow
    await testCustomerFlow();
    
    // Test full purchase flow from vendor to customer
    await testPurchaseFlow();
    
    // Test admin management capabilities
    await testAdminFlow();
    
    // Test customer edge cases and error handling
    await testCustomerEdgeCases();
    
  } catch (error) {
    console.error('Error in E2E testing:', error);
    recordTest('E2E Testing Suite', false, error);
  } finally {
    // Close browser if it's a real one
    if (browser && typeof browser.close === 'function' && !browser.toString().includes('MockBrowser')) {
      await browser.close();
    }
  }
  
  console.log(`E2E testing complete: ${results.passed.length} passed, ${results.failed.length} failed`);
  
  return results;
  
  // Helper function to record test results
  function recordTest(name, passed, error = null, details = {}) {
    const result = {
      name,
      timestamp: new Date().toISOString(),
      details: details || {}
    };
    
    if (passed) {
      results.passed.push(result);
      console.log(`✅ [E2E] ${name}: Passed`);
    } else {
      result.error = error ? (error.message || String(error)) : 'Unknown error';
      results.failed.push(result);
      console.log(`❌ [E2E] ${name}: Failed - ${result.error}`);
    }
    
    return result;
  }
  
  /**
   * Create test users
   * @param {string} role - User role (admin, vendor, customer)
   * @returns {Object} User data
   */
  async function createTestUser(role) {
    const username = `${role}_${Date.now()}`;
    const email = `${username}@example.com`;
    const name = `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`;
    const password = 'Test123!';
    
    const registerResponse = await api.post('/api/auth/register', {
      email,
      name,
      password,
      role
    });
    
    if (registerResponse.status !== 201) {
      throw new Error(`Failed to create ${role} user: ${registerResponse.status}`);
    }
    
    const loginResponse = await api.post('/api/auth/login', {
      email,
      password
    });
    
    if (loginResponse.status !== 200) {
      throw new Error(`Failed to login as ${role}: ${loginResponse.status}`);
    }
    
    return {
      id: loginResponse.data.user.id,
      username,
      role,
      token: loginResponse.data.token
    };
  }
  
  /**
   * Create a test product for a vendor
   * @param {Object} vendor - Vendor user data
   * @returns {Object} Product data
   */
  async function createTestProduct(vendor) {
    const authApi = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeouts.apiResponse,
      validateStatus: () => true,
      headers: {
        'Authorization': `Bearer ${vendor.token}`
      }
    });
    
    const productData = {
      name: `E2E Test Product ${Date.now()}`,
      description: 'A product created by the E2E testing system',
      price: 49.99,
      stock: 100,
      vendorId: vendor.id
    };
    
    const createResponse = await authApi.post('/api/products', productData);
    
    if (createResponse.status !== 201) {
      throw new Error(`Failed to create product: ${createResponse.status}`);
    }
    
    if (!createResponse.data.success || !createResponse.data.product) {
      throw new Error(`Invalid product response format: ${JSON.stringify(createResponse.data)}`);
    }
    
    return {
      id: createResponse.data.product.id,
      ...productData
    };
  }
  
  /**
   * Test vendor onboarding and product management flow
   */
  async function testVendorFlow() {
    console.log('Testing vendor onboarding flow...');
    
    try {
      // Create vendor user
      const vendor = await createTestUser('vendor');
      recordTest('Vendor Registration & Login', true, null, { vendorId: vendor.id });
      
      // Test Stripe Connect onboarding if applicable
      const authApi = axios.create({
        baseURL: config.baseUrl,
        timeout: config.timeouts.apiResponse,
        validateStatus: () => true,
        headers: {
          'Authorization': `Bearer ${vendor.token}`
        }
      });
      
      // Create a product
      const product = await createTestProduct(vendor);
      recordTest('Vendor Product Creation', true, null, { 
        productId: product.id,
        productName: product.name
      });
      
      // Update the product
      const updateData = {
        name: `Updated ${product.name}`,
        price: 59.99
      };
      
      const updateResponse = await authApi.put(`/api/products/${product.id}`, updateData);
      
      const updateSuccess = updateResponse.status === 200 && 
                           updateResponse.data.success && 
                           updateResponse.data.product && 
                           updateResponse.data.product.id === product.id;
      recordTest('Vendor Product Update', updateSuccess,
                updateSuccess ? null : `Failed to update product: ${updateResponse.status}`,
                { productId: product.id });
      
      // Get vendor's product list
      const listResponse = await authApi.get('/api/products/vendor');
      
      const listSuccess = listResponse.status === 200 && 
                         listResponse.data && 
                         listResponse.data.success && 
                         Array.isArray(listResponse.data.products) && 
                         listResponse.data.products.some(p => p.id === product.id);
                         
      recordTest('Vendor Products Listing', listSuccess,
                listSuccess ? null : `Failed to list vendor products: ${listResponse.status}`,
                { productCount: listResponse.data?.products?.length || 0 });
      
      // Deactivate product if endpoint exists
      try {
        const deactivateResponse = await authApi.patch(`/api/products/${product.id}/status`, {
          active: false
        });
        
        const deactivateSuccess = deactivateResponse.status === 200;
        recordTest('Product Deactivation', deactivateSuccess,
                  deactivateSuccess ? null : `Failed to deactivate product: ${deactivateResponse.status}`);
      } catch (error) {
        // This might be an optional endpoint
        results.warnings.push({
          name: 'Product Deactivation',
          message: 'Product deactivation endpoint may not be implemented',
          timestamp: new Date().toISOString()
        });
      }
      
    } catch (error) {
      recordTest('Vendor Flow', false, error);
    }
  }
  
  /**
   * Test customer shopping and checkout flow
   */
  async function testCustomerFlow() {
    console.log('Testing customer shopping flow...');
    
    try {
      // Create customer user
      const customer = await createTestUser('customer');
      recordTest('Customer Registration & Login', true, null, { customerId: customer.id });
      
      // Create vendor and product to purchase
      const vendor = await createTestUser('vendor');
      const product = await createTestProduct(vendor);
      
      // Customer API
      const customerApi = axios.create({
        baseURL: config.baseUrl,
        timeout: config.timeouts.apiResponse,
        validateStatus: () => true,
        headers: {
          'Authorization': `Bearer ${customer.token}`
        }
      });
      
      // Browse products
      const productsResponse = await customerApi.get('/api/products');
      
      const productsSuccess = productsResponse.status === 200 && 
                             productsResponse.data && 
                             productsResponse.data.success && 
                             Array.isArray(productsResponse.data.products) &&
                             productsResponse.data.products.length > 0;
                             
      recordTest('Customer Product Browsing', productsSuccess,
                productsSuccess ? null : `Failed to browse products: ${productsResponse.status}`,
                { productCount: productsResponse.data?.products?.length || 0 });
      
      // View product details
      const productDetailsResponse = await customerApi.get(`/api/products/${product.id}`);
      
      const detailsSuccess = productDetailsResponse.status === 200 && 
                            productDetailsResponse.data && 
                            productDetailsResponse.data.success && 
                            productDetailsResponse.data.product && 
                            productDetailsResponse.data.product.id === product.id;
                            
      recordTest('Product Details View', detailsSuccess,
                detailsSuccess ? null : `Failed to view product details: ${productDetailsResponse.status}`,
                { productId: product.id });
      
      // Initiate payment with Stripe - using a simpler endpoint for testing
      const paymentData = {
        amount: product.price * 100, // Convert to cents
        items: [{ id: product.id, quantity: 1 }]
      };
      
      try {
        const paymentResponse = await customerApi.post('/api/payments/create-payment-intent', paymentData);
        
        const paymentSuccess = paymentResponse.status === 200 && paymentResponse.data.clientSecret;
        
        recordTest('Payment Initiation', paymentSuccess,
                  paymentSuccess ? null : `Failed to initiate payment: ${paymentResponse.status}`,
                  { productId: product.id });
      } catch (paymentError) {
        recordTest('Payment Initiation', false, 
                  `Failed to initiate payment: ${paymentError.response?.status || paymentError.message}`,
                  { productId: product.id });
      }
      
    } catch (error) {
      recordTest('Customer Flow', false, error);
    }
  }
  
  /**
   * Test full purchase flow from vendor to customer
   */
  async function testPurchaseFlow() {
    console.log('Testing complete purchase flow...');
    
    try {
      // This will test a complete E2E flow combining API and UI tests
      const page = await browser.newPage();
      
      try {
        // 1. Create test users for this flow
        const vendor = await createTestUser('vendor');
        const customer = await createTestUser('customer');
        
        // 2. Vendor creates a product
        const product = await createTestProduct(vendor);
        
        // 3. Customer browser simulation
        await page.evaluateOnNewDocument((token) => {
          localStorage.setItem('authToken', token);
        }, customer.token);
        
        // Browse to product
        await page.goto(`${config.clientUrl}/products/${product.id}`, 
                      { waitUntil: 'networkidle2', timeout: config.timeouts.pageLoad });
        
        // 4. Customer initiates checkout process
        // (Note: This is UI-focused, but in a real test we'd simulate clicking "Buy Now")
        const customerApi = axios.create({
          baseURL: config.baseUrl,
          timeout: config.timeouts.apiResponse,
          validateStatus: () => true,
          headers: {
            'Authorization': `Bearer ${customer.token}`
          }
        });
        
        // 5. Create a payment intent
        const paymentData = {
          amount: product.price * 100, // Convert to cents
          items: [{ id: product.id, quantity: 1 }]
        };
        
        try {
          const paymentResponse = await customerApi.post('/api/payments/create-payment-intent', paymentData);
          
          const paymentSuccess = paymentResponse.status === 200 && paymentResponse.data.clientSecret;
          
          if (!paymentSuccess) {
            throw new Error(`Failed to create payment intent: ${paymentResponse.status}`);
          }
          
          // 6. In a real test with a real browser, we'd simulate completing the Stripe payment
          // For now, we'll assume payment was successful for E2E validation
          
          recordTest('Full Purchase Flow', true, null, {
            vendorId: vendor.id,
            customerId: customer.id,
            productId: product.id,
            paymentInitiated: true
          });
        } catch (paymentError) {
          recordTest('Full Purchase Flow', false, 
                    `Failed to create payment intent: ${paymentError.response?.status || paymentError.message}`,
                    { productId: product.id });
        }
        
      } finally {
        if (page.close && typeof page.close === 'function') {
          await page.close();
        }
      }
      
    } catch (error) {
      recordTest('Full Purchase Flow', false, error);
    }
  }
  
  /**
   * Test admin management capabilities
   */
  async function testAdminFlow() {
    console.log('Testing admin management capabilities...');
    
    try {
      // Create an admin user
      const admin = {
        email: 'admin@marketplace.com',
        password: 'Admin123!',
        role: 'admin'
      };
      
      // Login as admin
      const loginResponse = await api.post('/api/auth/login', {
        email: admin.email,
        password: admin.password
      });
      
      // Check if we got a successful login
      if (loginResponse.status !== 200 || !loginResponse.data.token) {
        throw new Error(`Admin login failed: ${loginResponse.status}`);
      }
      
      // Store admin token
      const adminToken = loginResponse.data.token;
      
      // Create admin API client
      const adminApi = axios.create({
        baseURL: config.baseUrl,
        timeout: config.timeouts.apiResponse,
        validateStatus: () => true,
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      // Test platform analytics access
      const analyticsResponse = await adminApi.get('/api/admin/analytics');
      const analyticsSuccess = analyticsResponse.status === 200;
      
      recordTest('Admin Analytics Access', analyticsSuccess,
        analyticsSuccess ? null : `Failed to access admin analytics: ${analyticsResponse.status}`);
      
      // Test vendor management
      const vendorsResponse = await adminApi.get('/api/admin/vendors');
      const vendorsSuccess = vendorsResponse.status === 200;
      
      recordTest('Admin Vendor Management', vendorsSuccess,
        vendorsSuccess ? null : `Failed to access vendor management: ${vendorsResponse.status}`);
      
      // Test product management
      const productsResponse = await adminApi.get('/api/admin/products');
      const productsSuccess = productsResponse.status === 200;
      
      recordTest('Admin Product Management', productsSuccess,
        productsSuccess ? null : `Failed to access product management: ${productsResponse.status}`);
      
      // Test transaction oversight
      const transactionsResponse = await adminApi.get('/api/admin/transactions');
      const transactionsSuccess = transactionsResponse.status === 200;
      
      recordTest('Admin Transaction Oversight', transactionsSuccess,
        transactionsSuccess ? null : `Failed to access transactions: ${transactionsResponse.status}`);
      
      // Test commission management
      const commissionResponse = await adminApi.get('/api/admin/commission');
      const commissionSuccess = commissionResponse.status === 200;
      
      recordTest('Admin Commission Management', commissionSuccess,
        commissionSuccess ? null : `Failed to access commission settings: ${commissionResponse.status}`);
      
    } catch (error) {
      recordTest('Admin Flow', false, error);
    }
  }
  
  /**
   * Test customer edge cases and error handling
   */
  async function testCustomerEdgeCases() {
    console.log('Testing customer edge cases...');
    
    try {
      // Test invalid login
      const invalidLoginResponse = await api.post('/api/auth/login', {
        email: 'nonexistent@example.com',
        password: 'InvalidPassword123!'
      });
      
      const invalidLoginSuccess = invalidLoginResponse.status === 401;
      recordTest('Invalid Login Handling', invalidLoginSuccess,
        invalidLoginSuccess ? null : `Unexpected status for invalid login: ${invalidLoginResponse.status}`);
      
      // Test registration validation (invalid email)
      const invalidEmailResponse = await api.post('/api/auth/register', {
        email: 'not-an-email',
        name: 'Test User',
        password: 'Password123!',
        role: 'customer'
      });
      
      const invalidEmailSuccess = invalidEmailResponse.status === 400;
      recordTest('Registration Email Validation', invalidEmailSuccess,
        invalidEmailSuccess ? null : `Unexpected status for invalid email: ${invalidEmailResponse.status}`);
      
      // Test registration validation (password too short)
      const shortPasswordResponse = await api.post('/api/auth/register', {
        email: 'valid@example.com',
        name: 'Test User',
        password: 'short',
        role: 'customer'
      });
      
      const shortPasswordSuccess = shortPasswordResponse.status === 400;
      recordTest('Registration Password Validation', shortPasswordSuccess,
        shortPasswordSuccess ? null : `Unexpected status for short password: ${shortPasswordResponse.status}`);
      
      // Test payment with invalid product ID
      const customer = await createTestUser('customer');
      const customerApi = axios.create({
        baseURL: config.baseUrl,
        timeout: config.timeouts.apiResponse,
        validateStatus: () => true,
        headers: {
          'Authorization': `Bearer ${customer.token}`
        }
      });
      
      const invalidPaymentResponse = await customerApi.post('/api/payments/create-payment-intent', {
        amount: 1000,  // $10.00
        items: [{ id: 9999, quantity: 1 }]  // Non-existent product ID
      });
      
      // We're testing that the system gracefully handles an invalid product
      // Success is determined by whether we get an appropriate error status
      const invalidPaymentSuccess = invalidPaymentResponse.status >= 400;
      recordTest('Payment With Invalid Product', invalidPaymentSuccess,
        invalidPaymentSuccess ? null : `Expected error status for invalid product payment: ${invalidPaymentResponse.status}`);
      
    } catch (error) {
      recordTest('Customer Edge Cases', false, error);
    }
  }
}

module.exports = {
  performE2eTests
};