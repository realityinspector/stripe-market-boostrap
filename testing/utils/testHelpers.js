/**
 * Test Helpers
 * 
 * Common utilities for setting up test data and facilitating tests.
 */

const axios = require('axios');
const crypto = require('crypto');
const { config, createAuthenticatedClient } = require('./testRunner');

// Cache for test users, tokens, etc.
const testCache = {
  users: {},
  tokens: {},
  products: [],
  vendors: [],
  orders: []
};

/**
 * Generate random data for testing
 * @param {string} type - Type of data to generate (email, name, etc.)
 * @returns {string} - Random data
 */
const generateRandomData = (type) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  
  switch (type) {
    case 'email':
      return `test-${randomString}@test.com`;
    case 'name':
      return `Test User ${randomString.substring(0, 6)}`;
    case 'businessName':
      return `Test Business ${randomString.substring(0, 6)}`;
    case 'productName':
      return `Test Product ${randomString.substring(0, 6)}`;
    case 'password':
      return `Password${randomString.substring(0, 8)}!`;
    default:
      return randomString;
  }
};

/**
 * Create a test user
 * @param {string} role - User role (admin, vendor, customer)
 * @returns {Object} - Created user and token
 */
const createTestUser = async (role = 'customer') => {
  const userData = {
    email: generateRandomData('email'),
    password: generateRandomData('password'),
    name: generateRandomData('name'),
    role: role
  };
  
  if (role === 'vendor') {
    userData.businessName = generateRandomData('businessName');
  }
  
  try {
    const response = await axios.post(`${config.apiBaseUrl}/api/auth/register`, userData);
    
    const { user, token } = response.data;
    
    // Cache the user and token
    testCache.users[user.id] = user;
    testCache.tokens[user.id] = token;
    
    return { user, token };
  } catch (error) {
    console.error('Failed to create test user:', error.message);
    throw error;
  }
};

/**
 * Login as a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} - User and token
 */
const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${config.apiBaseUrl}/api/auth/login`, {
      email,
      password
    });
    
    const { user, token } = response.data;
    
    // Cache the user and token
    testCache.users[user.id] = user;
    testCache.tokens[user.id] = token;
    
    return { user, token };
  } catch (error) {
    console.error('Failed to login user:', error.message);
    throw error;
  }
};

/**
 * Create a test product for a vendor
 * @param {string} vendorId - Vendor ID
 * @param {string} token - Vendor authentication token
 * @returns {Object} - Created product
 */
const createTestProduct = async (vendorId, token) => {
  const productData = {
    name: generateRandomData('productName'),
    description: 'This is a test product description',
    price: (Math.random() * 100 + 5).toFixed(2),
    image_url: 'https://via.placeholder.com/300'
  };
  
  try {
    const client = createAuthenticatedClient(token);
    const response = await client.post('/api/products', productData);
    
    const product = response.data.product;
    testCache.products.push(product);
    
    return product;
  } catch (error) {
    console.error('Failed to create test product:', error.message);
    throw error;
  }
};

/**
 * Create a test order
 * @param {Object} customer - Customer user object
 * @param {string} customerToken - Customer authentication token
 * @param {Object} product - Product object
 * @returns {Object} - Created order
 */
const createTestOrder = async (customer, customerToken, product) => {
  try {
    const client = createAuthenticatedClient(customerToken);
    
    // Create payment intent
    const paymentResponse = await client.post('/api/payments/create-payment-intent', {
      productId: product.id,
      quantity: 1
    });
    
    const { orderId, clientSecret } = paymentResponse.data;
    
    // In a real test, we'd simulate confirming the payment with Stripe
    // For testing, we'll just get the order details
    const orderResponse = await client.get(`/api/payments/orders/${orderId}`);
    
    const order = orderResponse.data.order;
    testCache.orders.push(order);
    
    return { order, clientSecret };
  } catch (error) {
    console.error('Failed to create test order:', error.message);
    throw error;
  }
};

/**
 * Clean up test data after tests
 */
const cleanupTestData = async () => {
  // In a real implementation, you would delete test data from the database
  // For now, we'll just clear the cache
  Object.keys(testCache).forEach(key => {
    if (Array.isArray(testCache[key])) {
      testCache[key] = [];
    } else {
      testCache[key] = {};
    }
  });
};

/**
 * Simulate a frontend page load and check rendering
 * @param {string} url - URL to check
 * @returns {Promise<Object>} - Page load result
 */
const checkPageRendering = async (url) => {
  try {
    const response = await axios.get(url);
    return {
      statusCode: response.status,
      contentType: response.headers['content-type'],
      hasContent: response.data && response.data.length > 0
    };
  } catch (error) {
    throw new Error(`Failed to load page ${url}: ${error.message}`);
  }
};

module.exports = {
  generateRandomData,
  createTestUser,
  loginUser,
  createTestProduct,
  createTestOrder,
  cleanupTestData,
  checkPageRendering,
  testCache
};