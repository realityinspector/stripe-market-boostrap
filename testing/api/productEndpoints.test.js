/**
 * Product Endpoints Tests
 * 
 * Tests for product-related API endpoints.
 * 
 * Assumptions:
 * - The /api/products endpoint allows creating and listing products
 * - The /api/products/:id endpoint allows retrieving and updating specific products
 * - The /api/products/:id/status endpoint allows activating/deactivating products
 * - The /api/products/vendor endpoint allows vendors to list their own products
 * 
 * Current Status:
 * - Product creation, listing, and retrieval tests are passing
 * - Product deactivation fails with a 404 error (endpoint not found)
 * - Vendor product listing fails with a 500 error (server error)
 * - Server logs show an error in parsing "vendor" as integer - route may be misconfigured
 */

const axios = require('axios');
const { config, createAuthenticatedClient } = require('../utils/testRunner');
const { 
  createTestUser, 
  generateRandomData,
  cleanupTestData 
} = require('../utils/testHelpers');

// Store test data for cleanup
const testData = {
  vendor: null,
  products: [],
  token: null
};

/**
 * Test product creation
 */
exports.testProductCreation = async () => {
  // Create a vendor user
  const vendorData = await createTestUser('vendor');
  testData.vendor = vendorData.user;
  testData.token = vendorData.token;
  
  // Create a test product
  const productData = {
    name: generateRandomData('productName'),
    description: 'Test product description',
    price: (Math.random() * 100 + 5).toFixed(2),
    image_url: 'https://via.placeholder.com/300'
  };
  
  const client = createAuthenticatedClient(testData.token);
  const response = await client.post('/api/products', productData);
  
  // Verify response
  if (!response.data.success) {
    throw new Error('Product creation failed');
  }
  
  if (!response.data.product || !response.data.product.id) {
    throw new Error('No product data returned on creation');
  }
  
  if (response.data.product.name !== productData.name) {
    throw new Error(`Product name mismatch: expected ${productData.name}, got ${response.data.product.name}`);
  }
  
  if (parseFloat(response.data.product.price) !== parseFloat(productData.price)) {
    throw new Error(`Product price mismatch: expected ${productData.price}, got ${response.data.product.price}`);
  }
  
  // Save for later tests
  testData.products.push(response.data.product);
  
  return response.data.product;
};

/**
 * Test product listing
 */
exports.testProductListing = async () => {
  // Create a product if none exists
  if (testData.products.length === 0) {
    await exports.testProductCreation();
  }
  
  // Get product listing
  const response = await axios.get(`${config.apiBaseUrl}/api/products`);
  
  // Verify response
  if (!response.data.success) {
    throw new Error('Product listing failed');
  }
  
  if (!response.data.products || !Array.isArray(response.data.products)) {
    throw new Error('No products array in response');
  }
  
  // Check if our test product is included
  const foundProduct = response.data.products.find(p => p.id === testData.products[0].id);
  if (!foundProduct) {
    throw new Error('Test product not found in listing');
  }
  
  return response.data.products;
};

/**
 * Test product retrieval by ID
 */
exports.testProductRetrieval = async () => {
  // Create a product if none exists
  if (testData.products.length === 0) {
    await exports.testProductCreation();
  }
  
  const productId = testData.products[0].id;
  
  // Get product by ID
  const response = await axios.get(`${config.apiBaseUrl}/api/products/${productId}`);
  
  // Verify response
  if (!response.data.success) {
    throw new Error('Product retrieval failed');
  }
  
  if (!response.data.product || !response.data.product.id) {
    throw new Error('No product data in response');
  }
  
  if (response.data.product.id !== productId) {
    throw new Error(`Product ID mismatch: expected ${productId}, got ${response.data.product.id}`);
  }
  
  return response.data.product;
};

/**
 * Test product update
 */
exports.testProductUpdate = async () => {
  // Create a product if none exists
  if (testData.products.length === 0) {
    await exports.testProductCreation();
  }
  
  const productId = testData.products[0].id;
  const updatedData = {
    name: `Updated ${generateRandomData('productName')}`,
    description: 'Updated test product description',
    price: (Math.random() * 100 + 10).toFixed(2)
  };
  
  // Update product
  const client = createAuthenticatedClient(testData.token);
  const response = await client.put(`/api/products/${productId}`, updatedData);
  
  // Verify response
  if (!response.data.success) {
    throw new Error('Product update failed');
  }
  
  if (!response.data.product || response.data.product.id !== productId) {
    throw new Error('No updated product data returned');
  }
  
  if (response.data.product.name !== updatedData.name) {
    throw new Error(`Updated name mismatch: expected ${updatedData.name}, got ${response.data.product.name}`);
  }
  
  if (parseFloat(response.data.product.price) !== parseFloat(updatedData.price)) {
    throw new Error(`Updated price mismatch: expected ${updatedData.price}, got ${response.data.product.price}`);
  }
  
  // Update stored product data
  testData.products[0] = response.data.product;
  
  return response.data.product;
};

/**
 * Test product deactivation
 */
exports.testProductDeactivation = async () => {
  // Create a product if none exists
  if (testData.products.length === 0) {
    await exports.testProductCreation();
  }
  
  const productId = testData.products[0].id;
  
  // Deactivate product
  const client = createAuthenticatedClient(testData.token);
  const response = await client.patch(`/api/products/${productId}/status`, {
    active: false
  });
  
  // Verify response
  if (!response.data.success) {
    throw new Error('Product deactivation failed');
  }
  
  if (!response.data.product || response.data.product.id !== productId) {
    throw new Error('No product data returned on deactivation');
  }
  
  if (response.data.product.active !== false) {
    throw new Error(`Product active status mismatch: expected false, got ${response.data.product.active}`);
  }
  
  // Update stored product data
  testData.products[0] = response.data.product;
  
  return response.data.product;
};

/**
 * Test vendor product listing
 */
exports.testVendorProductListing = async () => {
  // Create a product if none exists
  if (testData.products.length === 0) {
    await exports.testProductCreation();
  }
  
  // Get vendor's products
  const client = createAuthenticatedClient(testData.token);
  const response = await client.get('/api/products/vendor');
  
  // Verify response
  if (!response.data.success) {
    throw new Error('Vendor product listing failed');
  }
  
  if (!response.data.products || !Array.isArray(response.data.products)) {
    throw new Error('No products array in vendor listing response');
  }
  
  // Check if our test product is included
  const foundProduct = response.data.products.find(p => p.id === testData.products[0].id);
  if (!foundProduct) {
    throw new Error('Test product not found in vendor listing');
  }
  
  return response.data.products;
};

// Clean up after tests
exports.cleanup = async () => {
  await cleanupTestData();
};