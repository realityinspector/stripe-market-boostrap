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
const { createTestUser, createTestProduct } = require('../utils/testHelpers');

const BASE_URL = 'http://localhost:5000';
const testUsers = [];
const testProducts = [];

/**
 * Test product creation
 */
exports.testProductCreation = async () => {
  // Create a test vendor
  const vendorData = await createTestUser('vendor');
  testUsers.push(vendorData);
  
  // Create a test product
  const product = await createTestProduct(vendorData.user.id, vendorData.token);
  testProducts.push(product);
  
  if (!product.id) {
    throw new Error('Product creation failed to return product data with ID');
  }
  
  if (product.vendorId !== vendorData.user.id) {
    throw new Error(`Product vendorId (${product.vendorId}) does not match vendor ID (${vendorData.user.id})`);
  }
};

/**
 * Test product listing
 */
exports.testProductListing = async () => {
  // Create a test vendor and product
  const vendorData = await createTestUser('vendor');
  testUsers.push(vendorData);
  const product = await createTestProduct(vendorData.user.id, vendorData.token);
  testProducts.push(product);
  
  // Get product listing
  const response = await axios.get(`${BASE_URL}/api/products`);
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200 for product listing, got ${response.status}`);
  }
  
  if (!Array.isArray(response.data.products)) {
    throw new Error('Product listing did not return an array of products');
  }
  
  // Check if our created product is in the list
  const foundProduct = response.data.products.find(p => p.id === product.id);
  if (!foundProduct) {
    throw new Error('Created product not found in product listing');
  }
};

/**
 * Test product retrieval by ID
 */
exports.testProductRetrieval = async () => {
  // Create a test vendor and product
  const vendorData = await createTestUser('vendor');
  testUsers.push(vendorData);
  const product = await createTestProduct(vendorData.user.id, vendorData.token);
  testProducts.push(product);
  
  // Get product by ID
  const response = await axios.get(`${BASE_URL}/api/products/${product.id}`);
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200 for product retrieval, got ${response.status}`);
  }
  
  if (response.data.product.id !== product.id) {
    throw new Error(`Retrieved product ID (${response.data.product.id}) does not match created product ID (${product.id})`);
  }
  
  if (response.data.product.name !== product.name) {
    throw new Error('Retrieved product has different name than created product');
  }
};

/**
 * Test product update
 */
exports.testProductUpdate = async () => {
  // Create a test vendor and product
  const vendorData = await createTestUser('vendor');
  testUsers.push(vendorData);
  const product = await createTestProduct(vendorData.user.id, vendorData.token);
  testProducts.push(product);
  
  // Update product
  const updatedData = {
    name: `Updated ${product.name}`,
    description: `Updated ${product.description}`,
    price: product.price + 10
  };
  
  const response = await axios.put(
    `${BASE_URL}/api/products/${product.id}`,
    updatedData,
    {
      headers: {
        'Authorization': `Bearer ${vendorData.token}`
      }
    }
  );
  
  if (response.status !== 200) {
    throw new Error(`Expected status 200 for product update, got ${response.status}`);
  }
  
  if (response.data.product.name !== updatedData.name) {
    throw new Error('Updated product name does not match');
  }
  
  if (response.data.product.price !== updatedData.price) {
    throw new Error('Updated product price does not match');
  }
};

/**
 * Test product deactivation
 */
exports.testProductDeactivation = async () => {
  // Create a test vendor and product
  const vendorData = await createTestUser('vendor');
  testUsers.push(vendorData);
  const product = await createTestProduct(vendorData.user.id, vendorData.token);
  testProducts.push(product);
  
  // Deactivate product
  try {
    const response = await axios.patch(
      `${BASE_URL}/api/products/${product.id}/status`,
      { active: false },
      {
        headers: {
          'Authorization': `Bearer ${vendorData.token}`
        }
      }
    );
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200 for product deactivation, got ${response.status}`);
    }
    
    if (response.data.product.active !== false) {
      throw new Error('Product was not deactivated');
    }
  } catch (error) {
    // This test is expected to fail until the endpoint is implemented
    if (error.response && error.response.status === 404) {
      throw new Error('Product deactivation endpoint not found (404)');
    } else {
      throw error;
    }
  }
};

/**
 * Test vendor product listing
 */
exports.testVendorProductListing = async () => {
  // Create a test vendor and multiple products
  const vendorData = await createTestUser('vendor');
  testUsers.push(vendorData);
  
  // Create 3 products for this vendor
  const product1 = await createTestProduct(vendorData.user.id, vendorData.token);
  const product2 = await createTestProduct(vendorData.user.id, vendorData.token);
  const product3 = await createTestProduct(vendorData.user.id, vendorData.token);
  
  testProducts.push(product1, product2, product3);
  
  // Get vendor products
  try {
    const response = await axios.get(
      `${BASE_URL}/api/products/vendor`,
      {
        headers: {
          'Authorization': `Bearer ${vendorData.token}`
        }
      }
    );
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200 for vendor product listing, got ${response.status}`);
    }
    
    if (!Array.isArray(response.data.products)) {
      throw new Error('Vendor product listing did not return an array of products');
    }
    
    // Check if all our created products are in the list
    const vendorProducts = response.data.products;
    
    if (!vendorProducts.find(p => p.id === product1.id)) {
      throw new Error('First created product not found in vendor product listing');
    }
    
    if (!vendorProducts.find(p => p.id === product2.id)) {
      throw new Error('Second created product not found in vendor product listing');
    }
    
    if (!vendorProducts.find(p => p.id === product3.id)) {
      throw new Error('Third created product not found in vendor product listing');
    }
  } catch (error) {
    // This test is expected to fail until the route is fixed
    if (error.response && error.response.status === 500) {
      throw new Error('Vendor product listing endpoint returned server error (500)');
    } else {
      throw error;
    }
  }
};

/**
 * Cleanup function to run after tests
 */
exports.cleanup = async () => {
  // In a real implementation, we might want to delete the test products and users
  // from the database, but for simplicity, we'll just log them
  console.log(`Would clean up ${testUsers.length} test users`);
  console.log(`Would clean up ${testProducts.length} test products`);
};