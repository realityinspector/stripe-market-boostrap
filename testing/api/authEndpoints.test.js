/**
 * Auth Endpoints Tests
 * 
 * Tests for authentication-related API endpoints.
 * 
 * Assumptions:
 * - The /api/auth/register endpoint accepts user registration with email, password, name, and role
 * - The /api/auth/login endpoint authenticates users with email and password
 * - The /api/auth/me endpoint returns the authenticated user's data when provided a valid token
 * - Invalid authentication should return 401 Unauthorized status
 * 
 * Current Status:
 * - Most tests are passing but the authenticated route test is failing because we're
 *   receiving a 403 status instead of 401 for invalid tokens
 */

const axios = require('axios');
const { config } = require('../utils/testRunner');
const { generateRandomData, cleanupTestData } = require('../utils/testHelpers');

/**
 * Test user registration
 */
exports.testUserRegistration = async () => {
  // Test data
  const userData = {
    email: generateRandomData('email'),
    password: generateRandomData('password'),
    name: generateRandomData('name'),
    role: 'customer'
  };
  
  // Register a new user
  const response = await axios.post(`${config.apiBaseUrl}/api/auth/register`, userData);
  
  // Verify response structure
  if (!response.data.success) {
    throw new Error('Registration failed');
  }
  
  if (!response.data.token) {
    throw new Error('No token returned on registration');
  }
  
  if (!response.data.user || !response.data.user.id) {
    throw new Error('No user data returned on registration');
  }
  
  if (response.data.user.role !== userData.role) {
    throw new Error(`User role mismatch: expected ${userData.role}, got ${response.data.user.role}`);
  }
  
  // Return user data to be used by other tests
  return response.data;
};

/**
 * Test vendor registration
 */
exports.testVendorRegistration = async () => {
  // Test data
  const userData = {
    email: generateRandomData('email'),
    password: generateRandomData('password'),
    name: generateRandomData('name'),
    role: 'vendor',
    businessName: generateRandomData('businessName')
  };
  
  // Register a new vendor
  const response = await axios.post(`${config.apiBaseUrl}/api/auth/register`, userData);
  
  // Verify response structure
  if (!response.data.success) {
    throw new Error('Vendor registration failed');
  }
  
  if (!response.data.token) {
    throw new Error('No token returned on vendor registration');
  }
  
  if (!response.data.user || !response.data.user.id) {
    throw new Error('No user data returned on vendor registration');
  }
  
  if (response.data.user.role !== 'vendor') {
    throw new Error(`User role mismatch: expected vendor, got ${response.data.user.role}`);
  }
  
  return response.data;
};

/**
 * Test user login
 */
exports.testUserLogin = async () => {
  // First register a user
  const userData = {
    email: generateRandomData('email'),
    password: generateRandomData('password'),
    name: generateRandomData('name'),
    role: 'customer'
  };
  
  await axios.post(`${config.apiBaseUrl}/api/auth/register`, userData);
  
  // Now test login
  const loginResponse = await axios.post(`${config.apiBaseUrl}/api/auth/login`, {
    email: userData.email,
    password: userData.password
  });
  
  // Verify response structure
  if (!loginResponse.data.success) {
    throw new Error('Login failed');
  }
  
  if (!loginResponse.data.token) {
    throw new Error('No token returned on login');
  }
  
  if (!loginResponse.data.user || !loginResponse.data.user.id) {
    throw new Error('No user data returned on login');
  }
  
  if (loginResponse.data.user.email !== userData.email) {
    throw new Error(`Email mismatch: expected ${userData.email}, got ${loginResponse.data.user.email}`);
  }
  
  return loginResponse.data;
};

/**
 * Test authentication middleware
 */
exports.testAuthenticatedRoute = async () => {
  // First register a user to get a token
  const { token } = await exports.testUserRegistration();
  
  // Test accessing an authenticated route
  const response = await axios.get(`${config.apiBaseUrl}/api/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  // Verify response
  if (!response.data.success) {
    throw new Error('Authenticated route access failed');
  }
  
  if (!response.data.user) {
    throw new Error('No user data returned from authenticated route');
  }
  
  // Try with an invalid token - should fail
  try {
    await axios.get(`${config.apiBaseUrl}/api/auth/me`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    throw new Error('Authentication with invalid token should have failed');
  } catch (error) {
    if (error.message === 'Authentication with invalid token should have failed') {
      throw error;
    }
    // Expected error - authentication failed
    if (!error.response || error.response.status !== 401) {
      throw new Error(`Expected 401 status, got ${error.response ? error.response.status : 'no response'}`);
    }
  }
};

// Clean up after tests
exports.cleanup = async () => {
  await cleanupTestData();
};