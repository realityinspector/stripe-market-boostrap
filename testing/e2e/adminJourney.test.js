/**
 * Admin Journey E2E Test
 * 
 * End-to-end test for the admin journey, including:
 * 1. Admin authentication
 * 2. Platform management 
 * 3. Vendor oversight
 * 4. Product management
 * 5. Commission rate configuration
 */

const axios = require('axios');
const puppeteer = require('puppeteer');
const puppeteerHelper = require('../utils/puppeteerHelper');
const baseURL = process.env.API_URL || 'http://localhost:8000/api';

// Test data
const adminUser = {
  email: 'newadmin@marketplace.com',
  password: 'Admin123!',
  name: 'New Admin',
  role: 'admin'
};

const testVendor = {
  email: 'vendor-test@example.com',
  password: 'Vendor123!',
  name: 'Test Vendor',
  role: 'vendor',
  businessName: 'Test Vendor Shop'
};

/**
 * Test the full admin journey
 */
async function testAdminJourney() {
  let browser;
  let page;
  let adminToken;
  
  try {
    console.log('🧪 Testing admin journey...');
    
    // Create admin user if not already exists
    try {
      await axios.post(`${baseURL}/auth/register`, adminUser, {
        validateStatus: () => true
      });
    } catch (err) {
      // Ignore if user already exists
    }
    
    // Login as admin
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: adminUser.email,
      password: adminUser.password
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Failed to login as admin');
    }
    
    adminToken = loginResponse.data.token;
    
    // Initialize browser
    browser = await puppeteerHelper.initBrowser();
    page = await browser.newPage();
    
    // Set token in local storage for authentication
    await page.evaluateOnNewDocument((token) => {
      localStorage.setItem('authToken', token);
    }, adminToken);
    
    // Access admin dashboard
    await page.goto('http://localhost:8000/admin/dashboard');
    await page.waitForSelector('#admin-dashboard', { timeout: 5000 });
    
    // Take screenshot of admin dashboard
    await page.screenshot({ path: 'testing/screenshots/admin-dashboard.png' });
    
    // Test analytics section
    console.log('Testing admin analytics...');
    const analyticsData = await axios.get(`${baseURL}/admin/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (!analyticsData.data.success) {
      throw new Error('Failed to retrieve analytics data');
    }
    
    // Test vendor management
    console.log('Testing vendor management...');
    const vendorsData = await axios.get(`${baseURL}/admin/vendors`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (!vendorsData.data.success) {
      throw new Error('Failed to retrieve vendors data');
    }
    
    // Create a test vendor if needed
    let vendorId = null;
    if (vendorsData.data.vendors.length === 0) {
      // Register a test vendor
      const registerVendorResponse = await axios.post(`${baseURL}/auth/register`, testVendor);
      const vendorLoginResponse = await axios.post(`${baseURL}/auth/login`, {
        email: testVendor.email,
        password: testVendor.password
      });
      
      const vendorToken = vendorLoginResponse.data.token;
      vendorId = vendorLoginResponse.data.user.vendor.id;
      
      // Create a test product as this vendor
      await axios.post(
        `${baseURL}/products`,
        {
          name: 'Test Product for Admin',
          description: 'Product for admin journey testing',
          price: 49.99,
          imageUrl: 'https://example.com/test-product.jpg'
        },
        { headers: { Authorization: `Bearer ${vendorToken}` } }
      );
    } else {
      // Use existing vendor
      vendorId = vendorsData.data.vendors[0].id;
    }
    
    // Test updating vendor status
    console.log('Testing vendor status update...');
    const updateVendorResponse = await axios.patch(
      `${baseURL}/admin/vendors/${vendorId}/status`,
      { status: 'active' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    if (!updateVendorResponse.data.success) {
      throw new Error('Failed to update vendor status');
    }
    
    // Test product management
    console.log('Testing product management...');
    const productsData = await axios.get(`${baseURL}/admin/products`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (!productsData.data.success) {
      throw new Error('Failed to retrieve products data');
    }
    
    // Test product featuring (if products exist)
    if (productsData.data.products.length > 0) {
      const productId = productsData.data.products[0].id;
      
      const featureResponse = await axios.patch(
        `${baseURL}/admin/products/${productId}/feature`,
        { featured: true },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      
      if (!featureResponse.data.success) {
        throw new Error('Failed to feature product');
      }
    }
    
    // Test commission management
    console.log('Testing commission management...');
    const commissionData = await axios.get(`${baseURL}/admin/commission`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    if (!commissionData.data.success) {
      throw new Error('Failed to retrieve commission data');
    }
    
    const currentRate = commissionData.data.commission.rate;
    const newRate = currentRate === 10 ? 12.5 : 10;
    
    const updateCommissionResponse = await axios.post(
      `${baseURL}/admin/commission`,
      { rate: newRate },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    if (!updateCommissionResponse.data.success) {
      throw new Error('Failed to update commission rate');
    }
    
    console.log('✅ Admin journey test passed');
    return { passed: true };
  } catch (err) {
    console.error('❌ Admin journey test failed:', err);
    if (page) {
      await page.screenshot({ path: 'testing/screenshots/admin-journey-failed.png' });
    }
    return { passed: false, error: err.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Test admin authorization
 */
async function testAdminAuthorization() {
  try {
    console.log('🧪 Testing admin authorization...');
    
    // Create a non-admin user
    const nonAdminUser = {
      email: 'nonadmin@example.com',
      password: 'Password123!',
      name: 'Non Admin',
      role: 'customer'
    };
    
    try {
      await axios.post(`${baseURL}/auth/register`, nonAdminUser, {
        validateStatus: () => true
      });
    } catch (err) {
      // Ignore if user already exists
    }
    
    // Login as non-admin
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: nonAdminUser.email,
      password: nonAdminUser.password
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Failed to login as non-admin');
    }
    
    const nonAdminToken = loginResponse.data.token;
    
    // Try to access admin endpoints
    const analyticsResponse = await axios.get(`${baseURL}/admin/analytics`, {
      headers: { Authorization: `Bearer ${nonAdminToken}` },
      validateStatus: () => true
    });
    
    // Should be forbidden (403)
    if (analyticsResponse.status !== 403) {
      throw new Error(`Expected 403 status, got ${analyticsResponse.status}`);
    }
    
    console.log('✅ Admin authorization test passed');
    return { passed: true };
  } catch (err) {
    console.error('❌ Admin authorization test failed:', err);
    return { passed: false, error: err.message };
  }
}

module.exports = {
  testAdminJourney,
  testAdminAuthorization
};