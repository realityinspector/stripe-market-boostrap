/**
 * Payment Flow E2E Test
 * 
 * End-to-end test for the payment flow, including:
 * 1. Vendor creates a product
 * 2. Customer places an order
 * 3. Payment is processed
 * 4. Vendor receives payment (minus commission)
 * 
 * Assumptions:
 * - Vendors need to complete Stripe Connect onboarding to receive payments
 * - The /api/payments/create-payment-intent endpoint initiates payment processing
 * - The /api/payments/orders/:id endpoint allows retrieving order details
 * - The /api/payments/orders endpoint lists a customer's order history
 * - The /api/payments/vendor/orders endpoint lists a vendor's orders
 * 
 * Current Status:
 * - All E2E tests are failing with a 400 error
 * - The error message indicates that vendors have not completed Stripe onboarding
 * - We need to implement proper Stripe Connect integration for vendors
 * - Currently, the tests attempt to mock the Stripe account ID for testing purposes
 */

const axios = require('axios');
const { config, createAuthenticatedClient } = require('../utils/testRunner');
const { 
  createTestUser, 
  createTestProduct, 
  createTestOrder,
  cleanupTestData 
} = require('../utils/testHelpers');

// Store test data for cleanup
const testData = {
  vendor: null,
  customer: null,
  product: null,
  order: null,
  vendorToken: null,
  customerToken: null
};

/**
 * Test the full payment flow
 */
exports.testPaymentFlow = async () => {
  try {
    // Step 1: Create vendor user
    console.log('Creating vendor...');
    const vendorData = await createTestUser('vendor');
    testData.vendor = vendorData.user;
    testData.vendorToken = vendorData.token;
    
    // Step 2: Create a customer
    console.log('Creating customer...');
    const customerData = await createTestUser('customer');
    testData.customer = customerData.user;
    testData.customerToken = customerData.token;
    
    // Step 3: Simulate vendor onboarding with Stripe Connect
    // In a real test, we'd complete a full Stripe Connect onboarding
    // For now, we'll just create a test product
    console.log('Creating product...');
    const vendorClient = createAuthenticatedClient(testData.vendorToken);
    
    // We need to manually update the vendor with a Stripe account ID for testing
    // In production, this would happen through the Stripe Connect onboarding process
    const vendorResponse = await vendorClient.get('/api/auth/me');
    const vendorId = vendorResponse.data.user.vendor.id;
    
    // For testing purposes, create a test Stripe account ID
    const mockStripeAccountId = `acct_test_${Date.now()}`;
    testData.mockStripeAccountId = mockStripeAccountId;
    
    // Mock product creation since we don't have a real Stripe account
    const productData = {
      name: 'Test Product',
      description: 'This is a test product',
      price: 29.99,
      image_url: 'https://via.placeholder.com/300'
    };
    
    // Create product directly in database
    const productResponse = await vendorClient.post('/api/products', productData);
    testData.product = productResponse.data.product;
    
    // Step 4: Customer creates an order
    console.log('Creating order...');
    const customerClient = createAuthenticatedClient(testData.customerToken);
    
    // Create payment intent
    const paymentResponse = await customerClient.post('/api/payments/create-payment-intent', {
      productId: testData.product.id,
      quantity: 1
    });
    
    if (!paymentResponse.data.success) {
      throw new Error('Failed to create payment intent');
    }
    
    const { orderId, clientSecret } = paymentResponse.data;
    testData.orderId = orderId;
    
    // Step 5: Get order details
    const orderResponse = await customerClient.get(`/api/payments/orders/${orderId}`);
    if (!orderResponse.data.success) {
      throw new Error('Failed to get order details');
    }
    
    testData.order = orderResponse.data.order;
    
    // Step 6: Verify order contains the correct data
    const order = orderResponse.data.order;
    if (!order.stripe_payment_intent_id) {
      throw new Error('Order does not have a Stripe payment intent ID');
    }
    
    // Verify commission calculation
    const expectedCommission = testData.product.price * 0.10; // Assuming 10% commission
    const actualCommission = parseFloat(order.commission_amount);
    const tolerance = 0.01; // Allow for small floating point differences
    
    if (Math.abs(actualCommission - expectedCommission) > tolerance) {
      throw new Error(`Commission amount mismatch: expected ${expectedCommission}, got ${actualCommission}`);
    }
    
    console.log('Payment flow test completed successfully!');
    return { success: true };
  } catch (error) {
    console.error('Payment flow test failed:', error);
    throw error;
  }
};

/**
 * Test order history for customer
 */
exports.testCustomerOrderHistory = async () => {
  // First run the payment flow to create an order
  await exports.testPaymentFlow();
  
  // Now check the customer's order history
  const customerClient = createAuthenticatedClient(testData.customerToken);
  const response = await customerClient.get('/api/payments/orders');
  
  if (!response.data.success) {
    throw new Error('Failed to get customer order history');
  }
  
  if (!response.data.orders || !Array.isArray(response.data.orders)) {
    throw new Error('Order history response does not contain orders array');
  }
  
  // Check if the order we created is in the history
  const orders = response.data.orders;
  const foundOrder = orders.find(order => order.id === testData.orderId);
  
  if (!foundOrder) {
    throw new Error('Order not found in customer order history');
  }
  
  return { success: true };
};

/**
 * Test vendor order management
 */
exports.testVendorOrderManagement = async () => {
  // First run the payment flow to create an order
  await exports.testPaymentFlow();
  
  // Now check the vendor's orders
  const vendorClient = createAuthenticatedClient(testData.vendorToken);
  const response = await vendorClient.get('/api/payments/vendor/orders');
  
  if (!response.data.success) {
    throw new Error('Failed to get vendor orders');
  }
  
  if (!response.data.orders || !Array.isArray(response.data.orders)) {
    throw new Error('Vendor orders response does not contain orders array');
  }
  
  // Check if the order we created is in the list
  const orders = response.data.orders;
  const foundOrder = orders.find(order => order.id === testData.orderId);
  
  if (!foundOrder) {
    throw new Error('Order not found in vendor orders');
  }
  
  return { success: true };
};

// Clean up after tests
exports.cleanup = async () => {
  await cleanupTestData();
};