/**
 * API Tester
 * 
 * Automated testing for all API endpoints in the application.
 * Tests include authentication, data manipulation, and error handling.
 */

const axios = require('axios');

/**
 * Perform all API tests
 * @param {Object} config - Testing configuration
 * @returns {Object} Test results
 */
async function performApiTests(config) {
  console.log('Starting API testing...');
  
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };
  
  // Create a base axios instance for API testing
  const api = axios.create({
    baseURL: config.baseUrl,
    timeout: config.timeouts.apiResponse,
    validateStatus: () => true // Don't throw on error status codes
  });
  
  // Test the server root endpoint
  try {
    await testResponseTime('/');
  } catch (error) {
    recordTest('Server Root Endpoint', false, error);
  }
  
  // Test authentication endpoints
  try {
    await testAuthEndpoints();
  } catch (error) {
    recordTest('Authentication Endpoints', false, error);
  }
  
  // Test product endpoints
  try {
    await testProductEndpoints();
  } catch (error) {
    recordTest('Product Endpoints', false, error);
  }
  
  // Test payment endpoints
  try {
    await testPaymentEndpoints();
  } catch (error) {
    recordTest('Payment Endpoints', false, error);
  }
  
  // Test CORS headers
  try {
    await testCorsHeaders();
  } catch (error) {
    recordTest('CORS Headers', false, error);
  }
  
  // Test API response time for various endpoints
  try {
    await testResponseTimes();
  } catch (error) {
    recordTest('API Response Times', false, error);
  }
  
  // Test error handling for non-existent endpoints
  try {
    await testErrorHandling();
  } catch (error) {
    recordTest('Error Handling', false, error);
  }
  
  console.log(`API testing complete: ${results.passed.length} passed, ${results.failed.length} failed`);
  
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
      if (config.debug) {
        console.log(`✅ [API] ${name}: Passed`);
      }
    } else {
      result.error = error ? (error.message || String(error)) : 'Unknown error';
      results.failed.push(result);
      console.log(`❌ [API] ${name}: Failed - ${result.error}`);
    }
    
    return result;
  }
  
  // Test for proper CORS headers
  async function testCorsHeaders() {
    const criticalEndpoints = ['/', '/api/auth/login', '/api/products', '/api/payments/create-payment-intent'];
    const expectedHeaders = ['access-control-allow-origin', 'access-control-allow-methods', 'access-control-allow-headers'];
    
    let allPassed = true;
    const details = { endpoints: {} };
    
    for (const endpoint of criticalEndpoints) {
      try {
        const response = await api.options(endpoint);
        
        const hasAllHeaders = expectedHeaders.every(header => 
          response.headers[header] !== undefined
        );
        
        details.endpoints[endpoint] = {
          status: response.status,
          headers: expectedHeaders.reduce((acc, header) => {
            acc[header] = response.headers[header] !== undefined;
            return acc;
          }, {})
        };
        
        if (!hasAllHeaders) {
          allPassed = false;
        }
      } catch (error) {
        details.endpoints[endpoint] = { error: error.message };
        allPassed = false;
      }
    }
    
    recordTest('CORS Headers', allPassed, allPassed ? null : 'Missing CORS headers', details);
  }
  
  // Test response time for a specific endpoint
  async function testResponseTime(endpoint, name) {
    const testName = name || `Response Time - ${endpoint}`;
    const start = Date.now();
    try {
      const response = await api.get(endpoint);
      const time = Date.now() - start;
      
      const details = {
        endpoint,
        status: response.status,
        time: `${time}ms`
      };
      
      const passed = time < config.timeouts.apiResponse;
      recordTest(testName, passed, 
                 passed ? null : `Response time too slow: ${time}ms`, 
                 details);
      return { passed, time, status: response.status };
    } catch (error) {
      recordTest(testName, false, error, { endpoint });
      return { passed: false, error: error.message };
    }
  }
  
  // Test response times for various endpoints
  async function testResponseTimes() {
    const endpoints = ['/', '/api/auth/login', '/api/auth/register', '/api/products'];
    const results = {};
    let allFast = true;
    
    for (const endpoint of endpoints) {
      const result = await testResponseTime(endpoint);
      results[endpoint] = result;
      if (!result.passed) {
        allFast = false;
      }
    }
    
    recordTest('API Response Times', allFast, 
               allFast ? null : 'Some endpoints have slow response times',
               { endpoints: results });
  }
  
  // Test error handling for non-existent endpoints
  async function testErrorHandling() {
    const nonExistentEndpoint = '/api/non-existent-endpoint';
    const response = await api.get(nonExistentEndpoint);
    
    const details = {
      status: response.status,
      data: response.data
    };
    
    const passed = response.status === 404;
    recordTest('404 Error Handling', passed,
               passed ? null : `Expected 404 status, got ${response.status}`,
               details);
  }
  
  // Test authentication endpoints
  async function testAuthEndpoints() {
    // Test registration
    const email = `test_user_${Date.now()}@example.com`;
    const name = `Test User ${Date.now()}`;
    const password = 'Test123!';
    
    let userId, token;
    
    try {
      const registerResponse = await api.post('/api/auth/register', {
        email,
        name,
        password,
        role: 'customer'
      });
      
      const registerDetails = {
        status: registerResponse.status,
        success: registerResponse.data?.success || false
      };
      
      if (registerResponse.data?.user) {
        userId = registerResponse.data.user.id;
        registerDetails.userId = userId;
      }
      
      const registerPassed = registerResponse.status === 201 && registerDetails.success;
      recordTest('User Registration', registerPassed, 
                registerPassed ? null : 'Failed to register user',
                registerDetails);
      
      if (!registerPassed) return;
      
      // Test login
      const loginResponse = await api.post('/api/auth/login', {
        email,
        password
      });
      
      const loginDetails = {
        status: loginResponse.status,
        success: loginResponse.data?.success || false
      };
      
      if (loginResponse.data?.token) {
        token = loginResponse.data.token;
        loginDetails.hasToken = true;
      }
      
      const loginPassed = loginResponse.status === 200 && loginDetails.success && loginDetails.hasToken;
      recordTest('User Login', loginPassed,
                loginPassed ? null : 'Failed to login user',
                loginDetails);
      
      if (!loginPassed) return;
      
      // Test authenticated route
      const authApi = axios.create({
        baseURL: config.baseUrl,
        timeout: config.timeouts.apiResponse,
        validateStatus: () => true,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const meResponse = await authApi.get('/api/auth/me');
      
      const meDetails = {
        status: meResponse.status,
        hasUser: meResponse.data?.user !== undefined
      };
      
      const mePassed = meResponse.status === 200 && meDetails.hasUser;
      recordTest('Authenticated Route', mePassed,
                mePassed ? null : 'Failed to access authenticated route',
                meDetails);
      
    } catch (error) {
      recordTest('Authentication Flow', false, error);
    }
  }
  
  // Test product endpoints
  async function testProductEndpoints() {
    try {
      // Register a vendor
      const vendorEmail = `vendor_${Date.now()}@example.com`;
      const vendorName = `Vendor ${Date.now()}`;
      const vendorPassword = 'Vendor123!';
      const businessName = `${vendorName}'s Shop`;
      
      const registerResponse = await api.post('/api/auth/register', {
        email: vendorEmail,
        name: vendorName,
        password: vendorPassword,
        role: 'vendor',
        businessName
      });
      
      if (registerResponse.status !== 201) {
        recordTest('Vendor Registration', false, 
                  `Failed to register vendor: ${registerResponse.status}`,
                  { status: registerResponse.status });
        return;
      }
      
      // Login as vendor
      const loginResponse = await api.post('/api/auth/login', {
        email: vendorEmail,
        password: vendorPassword
      });
      
      if (loginResponse.status !== 200 || !loginResponse.data?.token) {
        recordTest('Vendor Login', false,
                  `Failed to login as vendor: ${loginResponse.status}`,
                  { status: loginResponse.status });
        return;
      }
      
      const vendorToken = loginResponse.data.token;
      const vendorId = loginResponse.data.user.id;
      
      // Create authenticated API instance
      const authApi = axios.create({
        baseURL: config.baseUrl,
        timeout: config.timeouts.apiResponse,
        validateStatus: () => true,
        headers: {
          'Authorization': `Bearer ${vendorToken}`
        }
      });
      
      // Create a product
      const productData = {
        name: `Test Product ${Date.now()}`,
        description: 'A test product created by the automated testing system',
        price: 29.99,
        stock: 100,
        vendorId: vendorId
      };
      
      const createResponse = await authApi.post('/api/products', productData);
      
      const createDetails = {
        status: createResponse.status,
        success: createResponse.data?.product?.id !== undefined
      };
      
      if (createResponse.data?.product?.id) {
        createDetails.productId = createResponse.data.product.id;
      }
      
      const createPassed = createResponse.status === 201 && createDetails.success;
      recordTest('Product Creation', createPassed,
                createPassed ? null : 'Failed to create product',
                createDetails);
      
      if (!createPassed) return;
      
      const productId = createResponse.data.product.id;
      
      // Test product listing
      const listResponse = await api.get('/api/products');
      
      const listDetails = {
        status: listResponse.status,
        count: listResponse.data?.products?.length || 0
      };
      
      const listPassed = listResponse.status === 200 && listDetails.count > 0;
      recordTest('Product Listing', listPassed,
                listPassed ? null : 'Failed to list products',
                listDetails);
      
      // Test product retrieval
      const getResponse = await api.get(`/api/products/${productId}`);
      
      const getDetails = {
        status: getResponse.status,
        found: getResponse.data?.product?.id === productId
      };
      
      const getPassed = getResponse.status === 200 && getDetails.found;
      recordTest('Product Retrieval', getPassed,
                getPassed ? null : 'Failed to retrieve product',
                getDetails);
      
      // Test product update
      const updateData = {
        name: `Updated Product ${Date.now()}`,
        price: 39.99
      };
      
      const updateResponse = await authApi.put(`/api/products/${productId}`, updateData);
      
      const updateDetails = {
        status: updateResponse.status,
        success: updateResponse.data?.product?.id === productId
      };
      
      const updatePassed = updateResponse.status === 200 && updateDetails.success;
      recordTest('Product Update', updatePassed,
                updatePassed ? null : 'Failed to update product',
                updateDetails);
      
      // Test vendor products listing
      const vendorProductsResponse = await authApi.get('/api/products/vendor');
      
      const vendorProductsDetails = {
        status: vendorProductsResponse.status,
        count: vendorProductsResponse.data?.products?.length || 0
      };
      
      const vendorProductsPassed = vendorProductsResponse.status === 200 && vendorProductsDetails.count > 0;
      recordTest('Vendor Products', vendorProductsPassed,
                vendorProductsPassed ? null : 'Failed to list vendor products',
                vendorProductsDetails);
      
    } catch (error) {
      recordTest('Product Endpoints', false, error);
    }
  }
  
  // Test payment endpoints
  async function testPaymentEndpoints() {
    try {
      // Create a payment intent
      const paymentData = {
        amount: 1999,
        items: [{ id: 'test-item', quantity: 1 }]
      };
      
      const paymentResponse = await api.post('/api/payments/create-payment-intent', paymentData);
      
      const paymentDetails = {
        status: paymentResponse.status,
        success: paymentResponse.data?.clientSecret !== undefined && paymentResponse.data?.success === true
      };
      
      const paymentPassed = paymentResponse.status === 200 && paymentDetails.success;
      recordTest('Create Payment Intent', paymentPassed,
                paymentPassed ? null : 'Failed to create payment intent',
                paymentDetails);
      
    } catch (error) {
      recordTest('Payment Endpoints', false, error);
    }
  }
}

module.exports = {
  performApiTests
};