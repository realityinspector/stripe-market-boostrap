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
const { createTestUser, loginUser } = require('../utils/testHelpers');

const BASE_URL = 'http://localhost:8000';
const testUsers = [];

/**
 * Test user registration
 */
exports.testUserRegistration = async () => {
  // Create a test customer
  const customerData = await createTestUser('customer');
  testUsers.push(customerData);
  
  if (!customerData.user || !customerData.token) {
    throw new Error('Customer registration failed to return user data and token');
  }
  
  if (customerData.user.role !== 'customer') {
    throw new Error(`Expected role to be 'customer' but got '${customerData.user.role}'`);
  }
};

/**
 * Test vendor registration
 */
exports.testVendorRegistration = async () => {
  // Create a test vendor
  const vendorData = await createTestUser('vendor');
  testUsers.push(vendorData);
  
  if (!vendorData.user || !vendorData.token) {
    throw new Error('Vendor registration failed to return user data and token');
  }
  
  if (vendorData.user.role !== 'vendor') {
    throw new Error(`Expected role to be 'vendor' but got '${vendorData.user.role}'`);
  }
};

/**
 * Test user login
 */
exports.testUserLogin = async () => {
  // Create a test user
  const userData = await createTestUser('customer');
  testUsers.push(userData);
  
  // Log in with the created user
  const loginData = await loginUser(userData.user.email, userData.password);
  
  if (!loginData.user || !loginData.token) {
    throw new Error('User login failed to return user data and token');
  }
  
  if (loginData.user.id !== userData.user.id) {
    throw new Error('Login returned different user ID than registration');
  }
};

/**
 * Test authentication middleware
 */
exports.testAuthMiddleware = async () => {
  // Create a test user
  const userData = await createTestUser('customer');
  testUsers.push(userData);
  
  // Test with valid token
  try {
    const validResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${userData.token}`
      }
    });
    
    if (validResponse.status !== 200) {
      throw new Error(`Expected status 200 for authenticated request, got ${validResponse.status}`);
    }
    
    if (validResponse.data.user.id !== userData.user.id) {
      throw new Error('Authenticated route returned wrong user data');
    }
  } catch (error) {
    if (error.response) {
      throw new Error(`Authenticated request failed with status ${error.response.status}: ${error.response.data.message || error.message}`);
    }
    throw error;
  }
  
  // Test with invalid token
  try {
    await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    
    // If we get here, the request did not fail as expected
    throw new Error('Request with invalid token did not fail as expected');
  } catch (error) {
    if (!error.response) {
      throw error;
    }
    
    if (error.response.status !== 401) {
      throw new Error(`Expected status 401 for invalid token, got ${error.response.status}`);
    }
  }
  
  // Test with no token
  try {
    await axios.get(`${BASE_URL}/api/auth/me`);
    
    // If we get here, the request did not fail as expected
    throw new Error('Request with no token did not fail as expected');
  } catch (error) {
    if (!error.response) {
      throw error;
    }
    
    if (error.response.status !== 401) {
      throw new Error(`Expected status 401 for missing token, got ${error.response.status}`);
    }
  }
};

/**
 * Cleanup function to run after tests
 */
exports.cleanup = async () => {
  // In a real implementation, we might want to delete the test users
  // from the database, but for simplicity, we'll just log them
  console.log(`Would clean up ${testUsers.length} test users`);
};