/**
 * Test Helpers
 * 
 * Common utilities for setting up test data and facilitating tests.
 */

const axios = require('axios');
const { config, createAuthenticatedClient } = require('./testRunner');

// Store test data for cleanup
const testData = {
  users: [],
  products: [],
  orders: []
};

/**
 * Generate random data for testing
 * @param {string} type - Type of data to generate (email, name, etc.)
 * @returns {string} - Random data
 */
exports.generateRandomData = (type) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  
  switch (type) {
    case 'email':
      return `test_${timestamp}_${random}@example.com`;
    case 'password':
      return `Password${random}!`;
    case 'name':
      return `Test User ${timestamp}`;
    case 'productName':
      return `Test Product ${timestamp}`;
    case 'businessName':
      return `Test Business ${timestamp}`;
    default:
      return `test_${timestamp}_${random}`;
  }
};

/**
 * Create a test user
 * @param {string} role - User role (admin, vendor, customer)
 * @returns {Object} - Created user and token
 */
exports.createTestUser = async (role) => {
  // Test data
  const userData = {
    email: exports.generateRandomData('email'),
    password: exports.generateRandomData('password'),
    name: exports.generateRandomData('name'),
    role: role
  };
  
  // Add business name for vendors
  if (role === 'vendor') {
    userData.businessName = exports.generateRandomData('businessName');
  }
  
  // Register a new user
  const response = await axios.post(`${config.apiBaseUrl}/api/auth/register`, userData);
  
  // Save for cleanup
  testData.users.push(response.data.user);
  
  return {
    user: response.data.user,
    token: response.data.token
  };
};

/**
 * Login as a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} - User and token
 */
exports.loginUser = async (email, password) => {
  const response = await axios.post(`${config.apiBaseUrl}/api/auth/login`, {
    email,
    password
  });
  
  return {
    user: response.data.user,
    token: response.data.token
  };
};

/**
 * Create a test product for a vendor
 * @param {string} vendorId - Vendor ID
 * @param {string} token - Vendor authentication token
 * @returns {Object} - Created product
 */
exports.createTestProduct = async (vendorId, token) => {
  const productData = {
    name: exports.generateRandomData('productName'),
    description: 'Test product description',
    price: (Math.random() * 100 + 5).toFixed(2),
    image_url: 'https://via.placeholder.com/300'
  };
  
  const client = createAuthenticatedClient(token);
  const response = await client.post('/api/products', productData);
  
  // Save for cleanup
  testData.products.push(response.data.product);
  
  return response.data.product;
};

/**
 * Create a test order
 * @param {Object} customer - Customer user object
 * @param {string} customerToken - Customer authentication token
 * @param {Object} product - Product object
 * @returns {Object} - Created order
 */
exports.createTestOrder = async (customer, customerToken, product) => {
  const client = createAuthenticatedClient(customerToken);
  
  // Create payment intent
  const paymentResponse = await client.post('/api/payments/create-payment-intent', {
    productId: product.id,
    quantity: 1
  });
  
  const { orderId } = paymentResponse.data;
  
  // Get order details
  const orderResponse = await client.get(`/api/payments/orders/${orderId}`);
  const order = orderResponse.data.order;
  
  // Save for cleanup
  testData.orders.push(order);
  
  return order;
};

/**
 * Clean up test data after tests
 */
exports.cleanupTestData = async () => {
  // In a real test environment with a real database, 
  // you would clean up test data here.
  // For now, we just log what would be cleaned up.
  
  console.log(`Would clean up ${testData.users.length} test users`);
  console.log(`Would clean up ${testData.products.length} test products`);
  console.log(`Would clean up ${testData.orders.length} test orders`);
  
  // Reset test data
  testData.users = [];
  testData.products = [];
  testData.orders = [];
};

/**
 * Simulate a frontend page load and check rendering
 * @param {string} url - URL to check
 * @returns {Promise<Object>} - Page load result
 */
exports.checkPageRendering = async (url) => {
  try {
    const startTime = Date.now();
    const response = await axios.get(url);
    const loadTime = Date.now() - startTime;
    
    return {
      success: true,
      status: response.status,
      loadTime,
      contentType: response.headers['content-type']
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: error.response ? error.response.status : 'unknown'
    };
  }
};