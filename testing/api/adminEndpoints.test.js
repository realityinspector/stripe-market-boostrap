/**
 * Admin Endpoints Tests
 * 
 * Tests for admin-related API endpoints.
 * 
 * Assumptions:
 * - The /api/admin/* endpoints require admin authentication
 * - The endpoints return data in JSON format with consistent structure
 * - Non-admin users cannot access these endpoints
 */

const axios = require('axios');
const baseURL = process.env.API_URL || 'http://localhost:8000/api';

// Test data
const adminUser = {
  email: 'admin-test@example.com',
  password: 'Test123!',
  name: 'Admin Test',
  role: 'admin'
};

const vendorUser = {
  email: 'vendor-test@example.com',
  password: 'Test123!',
  name: 'Vendor Test',
  role: 'vendor',
  businessName: 'Test Vendor Business'
};

let adminToken = null;
let vendorToken = null;
let vendorId = null;
let productId = null;

/**
 * Test admin authentication requirements
 */
async function testAdminAuthRequirements() {
  try {
    // Try accessing admin endpoint without authentication
    const analyticsResponse = await axios.get(`${baseURL}/admin/analytics`, {
      validateStatus: () => true // Don't throw on error status
    });
    
    // Expect 401 Unauthorized
    if (analyticsResponse.status !== 401) {
      console.error('Expected 401 status for unauthorized access, got:', analyticsResponse.status);
      return { passed: false, error: 'Admin endpoint accessible without authentication' };
    }
    
    // Create a vendor user for testing role-based access control
    const registerResponse = await axios.post(`${baseURL}/auth/register`, vendorUser, {
      validateStatus: () => true // Don't throw on error status
    });
    
    // If registration fails with 409, the user already exists which is fine
    if (registerResponse.status === 409) {
      console.log('Test vendor user already exists, proceeding with login.');
    } else if (!registerResponse.data.success) {
      console.error('Failed to register vendor user:', registerResponse.data.message);
      return { passed: false, error: 'Failed to register vendor user' };
    }
    
    // Login as vendor
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: vendorUser.email,
      password: vendorUser.password
    });
    
    if (!loginResponse.data.success) {
      console.error('Failed to login as vendor:', loginResponse.data.message);
      return { passed: false, error: 'Failed to login as vendor' };
    }
    
    vendorToken = loginResponse.data.token;
    vendorId = loginResponse.data.user.vendor.id;
    
    // Try accessing admin endpoint with vendor authentication
    const vendorAnalyticsResponse = await axios.get(`${baseURL}/admin/analytics`, {
      headers: { Authorization: `Bearer ${vendorToken}` },
      validateStatus: () => true // Don't throw on error status
    });
    
    // Expect 403 Forbidden
    if (vendorAnalyticsResponse.status !== 403) {
      console.error('Expected 403 status for vendor access, got:', vendorAnalyticsResponse.status);
      return { passed: false, error: 'Admin endpoint accessible to non-admin users' };
    }
    
    return { passed: true };
  } catch (err) {
    console.error('Error testing admin auth requirements:', err);
    return { passed: false, error: err.message };
  }
}

/**
 * Test admin analytics endpoint
 */
async function testAdminAnalytics() {
  try {
    // Create admin user if not exists
    const registerResponse = await axios.post(`${baseURL}/auth/register`, adminUser, {
      validateStatus: () => true // Don't throw on error status
    });
    
    // Login as admin
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: adminUser.email,
      password: adminUser.password
    });
    
    if (!loginResponse.data.success) {
      console.error('Failed to login as admin:', loginResponse.data.message);
      return { passed: false, error: 'Failed to login as admin' };
    }
    
    adminToken = loginResponse.data.token;
    
    // Access analytics endpoint
    const analyticsResponse = await axios.get(`${baseURL}/admin/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (!analyticsResponse.data.success) {
      console.error('Failed to get analytics:', analyticsResponse.data.message);
      return { passed: false, error: 'Failed to get analytics' };
    }
    
    // Verify analytics data structure
    const analytics = analyticsResponse.data.analytics;
    
    if (!analytics.users || typeof analytics.users.total !== 'number' ||
        typeof analytics.products !== 'number' || 
        typeof analytics.orders !== 'number' ||
        typeof analytics.revenue !== 'number') {
      console.error('Invalid analytics data structure:', analytics);
      return { passed: false, error: 'Invalid analytics data structure' };
    }
    
    return { passed: true };
  } catch (err) {
    console.error('Error testing admin analytics:', err);
    return { passed: false, error: err.message };
  }
}

/**
 * Test admin vendors management endpoints
 */
async function testAdminVendorsManagement() {
  try {
    if (!adminToken) {
      // Login as admin if not done yet
      const loginResponse = await axios.post(`${baseURL}/auth/login`, {
        email: adminUser.email,
        password: adminUser.password
      });
      
      if (!loginResponse.data.success) {
        console.error('Failed to login as admin:', loginResponse.data.message);
        return { passed: false, error: 'Failed to login as admin' };
      }
      
      adminToken = loginResponse.data.token;
    }
    
    // Access vendors endpoint
    const vendorsResponse = await axios.get(`${baseURL}/admin/vendors`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (!vendorsResponse.data.success) {
      console.error('Failed to get vendors:', vendorsResponse.data.message);
      return { passed: false, error: 'Failed to get vendors' };
    }
    
    // Verify vendors data includes our test vendor
    const vendors = vendorsResponse.data.vendors;
    
    if (!Array.isArray(vendors)) {
      console.error('Invalid vendors data structure:', vendors);
      return { passed: false, error: 'Invalid vendors data structure' };
    }
    
    // Find our test vendor
    let testVendor = vendors.find(v => v.user_id === vendorId);
    
    if (!testVendor) {
      console.error('Test vendor not found in vendors list');
      return { passed: false, error: 'Test vendor not found' };
    }
    
    // Test updating vendor status
    const updateResponse = await axios.patch(
      `${baseURL}/admin/vendors/${testVendor.id}/status`,
      { status: 'active' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    if (!updateResponse.data.success) {
      console.error('Failed to update vendor status:', updateResponse.data.message);
      return { passed: false, error: 'Failed to update vendor status' };
    }
    
    // Verify status was updated
    if (updateResponse.data.vendor.status !== 'active') {
      console.error('Vendor status not updated correctly');
      return { passed: false, error: 'Vendor status not updated correctly' };
    }
    
    return { passed: true };
  } catch (err) {
    console.error('Error testing admin vendors management:', err);
    return { passed: false, error: err.message };
  }
}

/**
 * Test admin products management endpoints
 */
async function testAdminProductsManagement() {
  try {
    if (!adminToken || !vendorToken || !vendorId) {
      console.error('Missing required test data');
      return { passed: false, error: 'Missing required test data' };
    }
    
    // Create a test product as vendor
    const createProductResponse = await axios.post(
      `${baseURL}/products`,
      {
        name: 'Test Product for Admin',
        description: 'Product for testing admin functionality',
        price: 99.99,
        imageUrl: 'https://example.com/test-product.jpg'
      },
      { headers: { Authorization: `Bearer ${vendorToken}` } }
    );
    
    if (!createProductResponse.data.success) {
      console.error('Failed to create test product:', createProductResponse.data.message);
      return { passed: false, error: 'Failed to create test product' };
    }
    
    productId = createProductResponse.data.product.id;
    
    // Access products endpoint as admin
    const productsResponse = await axios.get(`${baseURL}/admin/products`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (!productsResponse.data.success) {
      console.error('Failed to get products:', productsResponse.data.message);
      return { passed: false, error: 'Failed to get products' };
    }
    
    // Verify products data includes our test product
    const products = productsResponse.data.products;
    
    if (!Array.isArray(products)) {
      console.error('Invalid products data structure:', products);
      return { passed: false, error: 'Invalid products data structure' };
    }
    
    // Find our test product
    let testProduct = products.find(p => p.id === productId);
    
    if (!testProduct) {
      console.error('Test product not found in products list');
      return { passed: false, error: 'Test product not found' };
    }
    
    // Test featuring a product
    const featureResponse = await axios.patch(
      `${baseURL}/admin/products/${productId}/feature`,
      { featured: true },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    if (!featureResponse.data.success) {
      console.error('Failed to feature product:', featureResponse.data.message);
      return { passed: false, error: 'Failed to feature product' };
    }
    
    // Verify product was featured
    if (!featureResponse.data.product.featured) {
      console.error('Product not featured correctly');
      return { passed: false, error: 'Product not featured correctly' };
    }
    
    return { passed: true };
  } catch (err) {
    console.error('Error testing admin products management:', err);
    return { passed: false, error: err.message };
  }
}

/**
 * Test admin commission management endpoints
 */
async function testAdminCommissionManagement() {
  try {
    if (!adminToken) {
      console.error('Missing required test data');
      return { passed: false, error: 'Missing required test data' };
    }
    
    // Get current commission settings
    const commissionResponse = await axios.get(`${baseURL}/admin/commission`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (!commissionResponse.data.success) {
      console.error('Failed to get commission settings:', commissionResponse.data.message);
      return { passed: false, error: 'Failed to get commission settings' };
    }
    
    // Verify commission data structure
    const commission = commissionResponse.data.commission;
    
    if (typeof commission.rate !== 'number') {
      console.error('Invalid commission data structure:', commission);
      return { passed: false, error: 'Invalid commission data structure' };
    }
    
    // Test updating commission rate
    const newRate = 12.5;
    const updateResponse = await axios.post(
      `${baseURL}/admin/commission`,
      { rate: newRate },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    if (!updateResponse.data.success) {
      console.error('Failed to update commission rate:', updateResponse.data.message);
      return { passed: false, error: 'Failed to update commission rate' };
    }
    
    // Verify rate was updated
    if (updateResponse.data.commission.rate !== newRate) {
      console.error('Commission rate not updated correctly');
      return { passed: false, error: 'Commission rate not updated correctly' };
    }
    
    // Test invalid commission rate
    const invalidResponse = await axios.post(
      `${baseURL}/admin/commission`,
      { rate: -5 },
      { 
        headers: { Authorization: `Bearer ${adminToken}` },
        validateStatus: () => true
      }
    );
    
    if (invalidResponse.status !== 400) {
      console.error('Expected 400 status for invalid commission rate, got:', invalidResponse.status);
      return { passed: false, error: 'Invalid commission rate was accepted' };
    }
    
    return { passed: true };
  } catch (err) {
    console.error('Error testing admin commission management:', err);
    return { passed: false, error: err.message };
  }
}

/**
 * Test admin transactions viewing endpoint
 */
async function testAdminTransactionsViewing() {
  try {
    if (!adminToken) {
      console.error('Missing required test data');
      return { passed: false, error: 'Missing required test data' };
    }
    
    // Access transactions endpoint
    const transactionsResponse = await axios.get(`${baseURL}/admin/transactions`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (!transactionsResponse.data.success) {
      console.error('Failed to get transactions:', transactionsResponse.data.message);
      return { passed: false, error: 'Failed to get transactions' };
    }
    
    // Verify transactions data structure
    const transactions = transactionsResponse.data.transactions;
    
    if (!Array.isArray(transactions)) {
      console.error('Invalid transactions data structure:', transactions);
      return { passed: false, error: 'Invalid transactions data structure' };
    }
    
    return { passed: true };
  } catch (err) {
    console.error('Error testing admin transactions viewing:', err);
    return { passed: false, error: err.message };
  }
}

/**
 * Cleanup function to run after tests
 */
async function cleanupAdminTests() {
  try {
    // Clean up the test product if needed
    if (productId && vendorToken) {
      await axios.delete(`${baseURL}/products/${productId}`, {
        headers: { Authorization: `Bearer ${vendorToken}` },
        validateStatus: () => true
      });
    }
    
    return { passed: true };
  } catch (err) {
    console.error('Error cleaning up admin tests:', err);
    return { passed: false, error: err.message };
  }
}

module.exports = {
  testAdminAuthRequirements,
  testAdminAnalytics,
  testAdminVendorsManagement,
  testAdminProductsManagement,
  testAdminCommissionManagement,
  testAdminTransactionsViewing,
  cleanupAdminTests
};