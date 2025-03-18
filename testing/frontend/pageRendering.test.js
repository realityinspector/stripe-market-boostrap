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

const { simulatePageLoad } = require('../utils/testHelpers');

/**
 * Test API root endpoint
 */
exports.testApiRootEndpoint = async () => {
  const result = await simulatePageLoad('/');
  
  if (result.status !== 200) {
    throw new Error(`API root endpoint returned status ${result.status} instead of 200`);
  }
};

/**
 * Test API response times
 */
exports.testApiResponseTimes = async () => {
  const endpoints = [
    { name: 'Home Page', path: '/' },
    { name: 'Login API Endpoint', path: '/api/auth/login', method: 'OPTIONS' },
    { name: 'Register API Endpoint', path: '/api/auth/register', method: 'OPTIONS' },
    { name: 'Vendors API Endpoint', path: '/api/vendors', method: 'OPTIONS' },
    { name: 'Products API Endpoint', path: '/api/products', method: 'OPTIONS' }
  ];
  
  console.log('API Response Times:');
  
  for (const endpoint of endpoints) {
    const result = await simulatePageLoad(endpoint.path);
    console.log(`${endpoint.name}: ${result.status}, ${result.duration.toFixed(2)}ms`);
    
    if (result.duration > 1000) {
      throw new Error(`${endpoint.name} response time (${result.duration}ms) exceeds 1000ms threshold`);
    }
  }
};

/**
 * Test that all critical API endpoints return appropriate CORS headers
 */
exports.testApiCorsHeaders = async () => {
  const endpoints = [
    { name: 'Login API Endpoint', path: '/api/auth/login', method: 'OPTIONS' },
    { name: 'Register API Endpoint', path: '/api/auth/register', method: 'OPTIONS' },
    { name: 'Vendors API Endpoint', path: '/api/vendors', method: 'OPTIONS' },
    { name: 'Products API Endpoint', path: '/api/products', method: 'OPTIONS' }
  ];
  
  for (const endpoint of endpoints) {
    const result = await simulatePageLoad(endpoint.path);
    
    // Required CORS headers
    const requiredHeaders = [
      'access-control-allow-origin',
      'access-control-allow-methods',
      'access-control-allow-headers'
    ];
    
    for (const header of requiredHeaders) {
      if (!result.headers[header]) {
        throw new Error(`CORS test failed for ${endpoint.name}: CORS header "${header}" missing for ${endpoint.name}`);
      }
    }
  }
};

/**
 * Test API content types
 */
exports.testApiContentTypes = async () => {
  const result = await simulatePageLoad('/api/products');
  
  if (!result.contentType || !result.contentType.includes('application/json')) {
    throw new Error(`API endpoint returned content type ${result.contentType} instead of application/json`);
  }
};

/**
 * Test for server errors when accessing API endpoints
 */
exports.testApiErrorHandling = async () => {
  const result = await simulatePageLoad('/api/non-existent-endpoint');
  
  if (result.status !== 404) {
    throw new Error(`Non-existent API endpoint returned status ${result.status} instead of 404`);
  }
};

/**
 * Cleanup function to run after tests
 */
exports.cleanup = async () => {
  // No cleanup needed for these tests
};