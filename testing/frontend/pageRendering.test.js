/**
 * Page Rendering Tests
 * 
 * Tests to verify that frontend pages are rendering correctly.
 * 
 * Assumptions:
 * - The API root endpoint returns a welcome message
 * - API endpoints return appropriate response times (under 1000ms)
 * - API endpoints include proper CORS headers for cross-origin requests
 * - API responses use the application/json content type
 * - Non-existent endpoints return 404 status codes
 * 
 * Current Status:
 * - Most tests are passing, but the CORS headers test is failing
 * - The API is missing the 'access-control-allow-headers' CORS header
 * - This needs to be fixed in the server's CORS middleware configuration
 */

const axios = require('axios');
const { performance } = require('perf_hooks');
const { config } = require('../utils/testRunner');
const { checkPageRendering } = require('../utils/testHelpers');

// Set of critical pages to check
const criticalPages = [
  { path: '/', name: 'Home Page' },
  { path: '/api/auth/login', name: 'Login API Endpoint' },
  { path: '/api/auth/register', name: 'Register API Endpoint' },
  { path: '/api/vendors', name: 'Vendors API Endpoint' },
  { path: '/api/products', name: 'Products API Endpoint' },
];

/**
 * Test API root endpoint
 */
exports.testApiRootEndpoint = async () => {
  const response = await axios.get(config.apiBaseUrl);
  
  if (response.status !== 200) {
    throw new Error(`API root endpoint returned status ${response.status}`);
  }
  
  if (!response.data || !response.data.message) {
    throw new Error('API root endpoint response does not contain expected message');
  }
  
  const expected = 'Stripe Connect Marketplace API';
  if (response.data.message !== expected) {
    throw new Error(`API response message mismatch: expected "${expected}", got "${response.data.message}"`);
  }
  
  return true;
};

/**
 * Test API response times
 */
exports.testApiResponseTimes = async () => {
  const results = [];
  
  for (const page of criticalPages) {
    const startTime = performance.now();
    
    try {
      // Use GET for paths that end with slash, OPTIONS for API endpoints
      const method = page.path.endsWith('/') ? 'get' : 'options';
      const response = await axios[method](`${config.apiBaseUrl}${page.path}`);
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      results.push({
        page: page.name,
        path: page.path,
        status: response.status,
        responseTime
      });
      
      // Check if response time is acceptable (under 1000ms)
      if (responseTime > 1000) {
        console.warn(`Slow response time for ${page.name}: ${responseTime.toFixed(2)}ms`);
      }
    } catch (error) {
      // For OPTIONS requests, some 404s are expected, don't throw
      if (error.response && error.response.status === 404) {
        results.push({
          page: page.name,
          path: page.path,
          status: 404,
          responseTime: performance.now() - startTime
        });
      } else {
        throw new Error(`Failed to check page ${page.name}: ${error.message}`);
      }
    }
  }
  
  // Log all response times
  console.log('API Response Times:');
  results.forEach(result => {
    console.log(`${result.page}: ${result.status}, ${result.responseTime.toFixed(2)}ms`);
  });
  
  return results;
};

/**
 * Test that all critical API endpoints return appropriate CORS headers
 */
exports.testApiCorsHeaders = async () => {
  for (const page of criticalPages) {
    if (page.path === '/') continue; // Skip root endpoint
    
    try {
      const response = await axios.options(`${config.apiBaseUrl}${page.path}`);
      
      // Check for CORS headers
      const corsHeaders = [
        'access-control-allow-origin',
        'access-control-allow-methods',
        'access-control-allow-headers'
      ];
      
      for (const header of corsHeaders) {
        if (!response.headers[header]) {
          throw new Error(`CORS header "${header}" missing for ${page.name}`);
        }
      }
    } catch (error) {
      // Some 404s are expected, don't throw for those
      if (!error.response || error.response.status !== 404) {
        throw new Error(`CORS test failed for ${page.name}: ${error.message}`);
      }
    }
  }
  
  return true;
};

/**
 * Test API content types
 */
exports.testApiContentTypes = async () => {
  const response = await axios.get(config.apiBaseUrl);
  
  const contentType = response.headers['content-type'];
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error(`Expected JSON content type, got "${contentType}"`);
  }
  
  return true;
};

/**
 * Test for server errors when accessing API endpoints
 */
exports.testApiErrorHandling = async () => {
  // Test a non-existent endpoint
  try {
    await axios.get(`${config.apiBaseUrl}/api/non-existent-endpoint`);
    throw new Error('Request to non-existent endpoint should have failed');
  } catch (error) {
    if (error.message === 'Request to non-existent endpoint should have failed') {
      throw error;
    }
    
    // Expected error - endpoint doesn't exist
    if (!error.response || error.response.status !== 404) {
      throw new Error(`Expected 404 status, got ${error.response ? error.response.status : 'no response'}`);
    }
  }
  
  return true;
};