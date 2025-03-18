/**
 * API Tester
 * 
 * Automated testing for all API endpoints in the application.
 * Tests include authentication, data manipulation, and error handling.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

/**
 * Perform all API tests
 * @param {Object} config - Testing configuration
 * @returns {Object} Test results
 */
async function performApiTests(config) {
  console.log(chalk.blue('Starting API Tests'));
  
  const results = {
    tests: [],
    passed: 0,
    failed: 0,
    startTime: new Date().toISOString()
  };
  
  // Create HTTP client
  const apiClient = axios.create({
    baseURL: config.apiBaseUrl,
    validateStatus: () => true // Always resolve promises (don't throw on error status)
  });
  
  // Track user accounts for testing
  const testUsers = {
    admin: null,
    vendor: null,
    customer: null
  };
  
  // Helper function to record test results
  function recordTest(name, passed, error = null, details = {}) {
    const test = {
      name,
      passed,
      timestamp: new Date().toISOString(),
      ...details
    };
    
    if (error) {
      test.error = typeof error === 'string' ? error : error.message;
      if (error.stack) test.stack = error.stack;
      if (error.response && error.response.data) test.responseData = error.response.data;
    }
    
    results.tests.push(test);
    passed ? results.passed++ : results.failed++;
    
    // Log the result
    const status = passed ? chalk.green('✓ PASS') : chalk.red('✗ FAIL');
    console.log(`${status} - ${name}`);
    if (!passed && error) {
      console.log(chalk.red(`  Error: ${test.error}`));
    }
    
    return test;
  }
  
  // Test API root endpoint
  try {
    const response = await apiClient.get('/');
    recordTest('API Root Endpoint', 
      response.status === 200 && response.data && response.data.message,
      null,
      { status: response.status, data: response.data }
    );
  } catch (error) {
    recordTest('API Root Endpoint', false, error);
  }
  
  // Test user registration - admin
  try {
    const adminData = {
      name: `Admin ${Date.now()}`,
      email: `admin${Date.now()}@test.com`,
      password: 'Password123!',
      role: 'admin'
    };
    
    const response = await apiClient.post('/api/auth/register', adminData);
    
    const passed = response.status === 201 && 
                  response.data && 
                  response.data.user && 
                  response.data.token;
    
    if (passed) {
      testUsers.admin = {
        user: response.data.user,
        token: response.data.token
      };
    }
    
    recordTest('Admin Registration', 
      passed,
      passed ? null : new Error('Registration failed or invalid response'),
      { status: response.status, userId: passed ? response.data.user.id : null }
    );
  } catch (error) {
    recordTest('Admin Registration', false, error);
  }
  
  // Test user registration - vendor
  try {
    const vendorData = {
      name: `Vendor ${Date.now()}`,
      email: `vendor${Date.now()}@test.com`,
      password: 'Password123!',
      role: 'vendor',
      businessName: `Test Vendor ${Date.now()}`
    };
    
    const response = await apiClient.post('/api/auth/register', vendorData);
    
    const passed = response.status === 201 && 
                  response.data && 
                  response.data.user && 
                  response.data.token;
    
    if (passed) {
      testUsers.vendor = {
        user: response.data.user,
        token: response.data.token
      };
    }
    
    recordTest('Vendor Registration', 
      passed,
      passed ? null : new Error('Registration failed or invalid response'),
      { status: response.status, userId: passed ? response.data.user.id : null }
    );
  } catch (error) {
    recordTest('Vendor Registration', false, error);
  }
  
  // Test user registration - customer
  try {
    const customerData = {
      name: `Customer ${Date.now()}`,
      email: `customer${Date.now()}@test.com`,
      password: 'Password123!',
      role: 'customer'
    };
    
    const response = await apiClient.post('/api/auth/register', customerData);
    
    const passed = response.status === 201 && 
                  response.data && 
                  response.data.user && 
                  response.data.token;
    
    if (passed) {
      testUsers.customer = {
        user: response.data.user,
        token: response.data.token
      };
    }
    
    recordTest('Customer Registration', 
      passed,
      passed ? null : new Error('Registration failed or invalid response'),
      { status: response.status, userId: passed ? response.data.user.id : null }
    );
  } catch (error) {
    recordTest('Customer Registration', false, error);
  }
  
  // Test login
  if (testUsers.vendor) {
    try {
      const loginData = {
        email: testUsers.vendor.user.email,
        password: 'Password123!'
      };
      
      const response = await apiClient.post('/api/auth/login', loginData);
      
      recordTest('User Login', 
        response.status === 200 && response.data && response.data.token,
        response.status !== 200 ? new Error(`Login failed with status ${response.status}`) : null,
        { status: response.status }
      );
    } catch (error) {
      recordTest('User Login', false, error);
    }
  } else {
    recordTest('User Login', false, new Error('Skipped because vendor registration failed'));
  }
  
  // Test authenticated route
  if (testUsers.customer) {
    try {
      const response = await apiClient.get('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${testUsers.customer.token}` }
      });
      
      recordTest('Authenticated Route', 
        response.status === 200 && response.data && response.data.user,
        response.status !== 200 ? new Error(`Authentication check failed with status ${response.status}`) : null,
        { status: response.status }
      );
    } catch (error) {
      recordTest('Authenticated Route', false, error);
    }
  } else {
    recordTest('Authenticated Route', false, new Error('Skipped because customer registration failed'));
  }
  
  // Test authentication with invalid token
  try {
    const response = await apiClient.get('/api/auth/me', {
      headers: { 'Authorization': 'Bearer invalid_token_here' }
    });
    
    recordTest('Invalid Authentication', 
      response.status === 401,
      response.status !== 401 ? new Error(`Expected 401, got ${response.status}`) : null,
      { status: response.status }
    );
  } catch (error) {
    recordTest('Invalid Authentication', false, error);
  }
  
  // Test product creation (vendor only)
  if (testUsers.vendor) {
    try {
      const productData = {
        name: `Test Product ${Date.now()}`,
        description: 'This is a test product created by the API tester',
        price: 29.99,
        imageUrl: 'https://example.com/test-product.jpg'
      };
      
      const response = await apiClient.post('/api/products', productData, {
        headers: { 'Authorization': `Bearer ${testUsers.vendor.token}` }
      });
      
      const productId = response.data && response.data.product ? response.data.product.id : null;
      
      recordTest('Product Creation', 
        response.status === 201 && productId,
        response.status !== 201 ? new Error(`Product creation failed with status ${response.status}`) : null,
        { status: response.status, productId }
      );
      
      // If product creation was successful, test product retrieval
      if (response.status === 201 && productId) {
        // Test product retrieval
        try {
          const getResponse = await apiClient.get(`/api/products/${productId}`);
          
          recordTest('Product Retrieval', 
            getResponse.status === 200 && getResponse.data && getResponse.data.product,
            getResponse.status !== 200 ? new Error(`Product retrieval failed with status ${getResponse.status}`) : null,
            { status: getResponse.status, productId }
          );
        } catch (error) {
          recordTest('Product Retrieval', false, error, { productId });
        }
        
        // Test product update
        try {
          const updateData = {
            name: `Updated Product ${Date.now()}`,
            price: 39.99
          };
          
          const updateResponse = await apiClient.put(`/api/products/${productId}`, updateData, {
            headers: { 'Authorization': `Bearer ${testUsers.vendor.token}` }
          });
          
          const isPriceUpdated = updateResponse.data && 
                                updateResponse.data.product && 
                                updateResponse.data.product.price === 39.99;
          
          recordTest('Product Update', 
            updateResponse.status === 200 && isPriceUpdated,
            updateResponse.status !== 200 ? new Error(`Product update failed with status ${updateResponse.status}`) : 
                                         !isPriceUpdated ? new Error('Price was not updated correctly') : null,
            { status: updateResponse.status, productId }
          );
        } catch (error) {
          recordTest('Product Update', false, error, { productId });
        }
      }
    } catch (error) {
      recordTest('Product Creation', false, error);
    }
  } else {
    recordTest('Product Creation', false, new Error('Skipped because vendor registration failed'));
  }
  
  // Test product listing
  try {
    const response = await apiClient.get('/api/products');
    
    recordTest('Product Listing', 
      response.status === 200 && response.data && Array.isArray(response.data.products),
      response.status !== 200 ? new Error(`Product listing failed with status ${response.status}`) : null,
      { status: response.status }
    );
  } catch (error) {
    recordTest('Product Listing', false, error);
  }
  
  // Test authentication required routes for unauthorized access
  try {
    const response = await apiClient.get('/api/products/vendor');
    
    recordTest('Auth Required Route', 
      response.status === 401,
      response.status !== 401 ? new Error(`Expected 401, got ${response.status}`) : null,
      { status: response.status }
    );
  } catch (error) {
    recordTest('Auth Required Route', false, error);
  }
  
  // Test API response times
  async function testResponseTime(endpoint, name) {
    try {
      const start = Date.now();
      const response = await apiClient.get(endpoint);
      const duration = Date.now() - start;
      
      recordTest(`Response Time - ${name}`, 
        duration < 1000, // Less than 1 second
        duration >= 1000 ? new Error(`Response time too slow: ${duration}ms`) : null,
        { duration, status: response.status }
      );
    } catch (error) {
      recordTest(`Response Time - ${name}`, false, error);
    }
  }
  
  await testResponseTime('/', 'API Root');
  await testResponseTime('/api/products', 'Product Listing');
  
  // Test API error handling
  try {
    const response = await apiClient.get('/api/non-existent-endpoint');
    
    recordTest('Non-existent Endpoint', 
      response.status === 404,
      response.status !== 404 ? new Error(`Expected 404, got ${response.status}`) : null,
      { status: response.status }
    );
  } catch (error) {
    recordTest('Non-existent Endpoint', false, error);
  }
  
  // Test CORS headers
  try {
    const response = await apiClient.options('/api/products');
    const corsHeaders = {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
      'access-control-allow-headers': 'Content-Type,Authorization'
    };
    
    const hasAllCorsHeaders = Object.keys(corsHeaders).every(
      header => response.headers[header] && 
                response.headers[header].toLowerCase().includes(corsHeaders[header].toLowerCase())
    );
    
    recordTest('CORS Headers', 
      response.status === 204 && hasAllCorsHeaders,
      !hasAllCorsHeaders ? new Error('Missing required CORS headers') : null,
      { 
        status: response.status,
        headers: {
          'access-control-allow-origin': response.headers['access-control-allow-origin'],
          'access-control-allow-methods': response.headers['access-control-allow-methods'],
          'access-control-allow-headers': response.headers['access-control-allow-headers']
        }
      }
    );
  } catch (error) {
    recordTest('CORS Headers', false, error);
  }
  
  // Record finish time
  results.endTime = new Date().toISOString();
  results.duration = new Date(results.endTime) - new Date(results.startTime);
  
  console.log(chalk.blue(`API Tests completed: ${results.passed} passed, ${results.failed} failed`));
  return results;
}

module.exports = {
  performApiTests
};