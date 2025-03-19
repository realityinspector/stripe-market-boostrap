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
const { createTestUser, createTestProduct } = require('../utils/testHelpers');

const BASE_URL = 'http://localhost:8000';
const testUsers = [];
const testProducts = [];
const testOrders = [];

/**
 * Test the full payment flow
 */
exports.testPaymentFlow = async () => {
  // Step 1: Create a vendor
  const vendorData = await createTestUser('vendor');
  testUsers.push(vendorData);
  
  // Step 2: Create a customer
  const customerData = await createTestUser('customer');
  testUsers.push(customerData);
  
  // Step 3: Vendor creates a product
  const product = await createTestProduct(vendorData.user.id, vendorData.token);
  testProducts.push(product);
  
  // Step 4: Customer initiates payment
  try {
    const paymentResponse = await axios.post(
      `${BASE_URL}/api/payments/create-payment-intent`,
      {
        productId: product.id,
        amount: product.price
      },
      {
        headers: {
          'Authorization': `Bearer ${customerData.token}`
        }
      }
    );
    
    if (paymentResponse.status !== 200) {
      throw new Error(`Expected status 200 for payment intent creation, got ${paymentResponse.status}`);
    }
    
    if (!paymentResponse.data.clientSecret) {
      throw new Error('Payment intent creation did not return client secret');
    }
    
    const clientSecret = paymentResponse.data.clientSecret;
    
    // Step 5: Simulate Stripe payment completion (in real test, would mock Stripe API)
    // For the purpose of this test, we'll assume the payment was confirmed client-side
    // and proceed to order creation
    
    // Step 6: Create order
    const orderResponse = await axios.post(
      `${BASE_URL}/api/orders`,
      {
        productId: product.id,
        paymentIntentId: clientSecret.split('_secret_')[0], // Extract payment intent ID
        quantity: 1
      },
      {
        headers: {
          'Authorization': `Bearer ${customerData.token}`
        }
      }
    );
    
    if (orderResponse.status !== 200) {
      throw new Error(`Expected status 200 for order creation, got ${orderResponse.status}`);
    }
    
    if (!orderResponse.data.order.id) {
      throw new Error('Order creation did not return order data with ID');
    }
    
    const orderId = orderResponse.data.order.id;
    testOrders.push(orderResponse.data.order);
    
    // Step 7: Verify order details
    const orderDetailsResponse = await axios.get(
      `${BASE_URL}/api/payments/orders/${orderId}`,
      {
        headers: {
          'Authorization': `Bearer ${customerData.token}`
        }
      }
    );
    
    if (orderDetailsResponse.status !== 200) {
      throw new Error(`Expected status 200 for order details, got ${orderDetailsResponse.status}`);
    }
    
    if (orderDetailsResponse.data.order.productId !== product.id) {
      throw new Error('Order details show incorrect product ID');
    }
    
    if (orderDetailsResponse.data.order.customerId !== customerData.user.id) {
      throw new Error('Order details show incorrect customer ID');
    }
    
    if (orderDetailsResponse.data.order.status !== 'completed') {
      throw new Error(`Order status is ${orderDetailsResponse.data.order.status}, expected 'completed'`);
    }
  } catch (error) {
    if (error.response && error.response.status === 400 && 
        error.response.data.message === 'Vendor has not completed Stripe onboarding') {
      // This is the expected error until Stripe Connect is implemented
      throw new Error('Payment flow failed: Vendor has not completed Stripe onboarding');
    } else {
      throw error;
    }
  }
};

/**
 * Test order history for customer
 */
exports.testOrderHistory = async () => {
  // Step 1: Create a vendor
  const vendorData = await createTestUser('vendor');
  testUsers.push(vendorData);
  
  // Step 2: Create a customer
  const customerData = await createTestUser('customer');
  testUsers.push(customerData);
  
  // Step 3: Vendor creates multiple products
  const product1 = await createTestProduct(vendorData.user.id, vendorData.token);
  const product2 = await createTestProduct(vendorData.user.id, vendorData.token);
  testProducts.push(product1, product2);
  
  // Step 4: Try to create orders for these products
  try {
    // Create payment intent for product 1
    const payment1Response = await axios.post(
      `${BASE_URL}/api/payments/create-payment-intent`,
      {
        productId: product1.id,
        amount: product1.price
      },
      {
        headers: {
          'Authorization': `Bearer ${customerData.token}`
        }
      }
    );
    
    // Create payment intent for product 2
    const payment2Response = await axios.post(
      `${BASE_URL}/api/payments/create-payment-intent`,
      {
        productId: product2.id,
        amount: product2.price
      },
      {
        headers: {
          'Authorization': `Bearer ${customerData.token}`
        }
      }
    );
    
    // Step 5: Get order history
    const orderHistoryResponse = await axios.get(
      `${BASE_URL}/api/payments/orders`,
      {
        headers: {
          'Authorization': `Bearer ${customerData.token}`
        }
      }
    );
    
    if (orderHistoryResponse.status !== 200) {
      throw new Error(`Expected status 200 for order history, got ${orderHistoryResponse.status}`);
    }
    
    if (!Array.isArray(orderHistoryResponse.data.orders)) {
      throw new Error('Order history did not return an array of orders');
    }
    
    // Note: We can't check for the specific orders since we expect the payment creation to fail
    // but we can at least verify that the endpoint works
  } catch (error) {
    if (error.response && error.response.status === 400 && 
        error.response.data.message === 'Vendor has not completed Stripe onboarding') {
      // This is the expected error until Stripe Connect is implemented
      throw new Error('Order history test failed: Vendor has not completed Stripe onboarding');
    } else {
      throw error;
    }
  }
};

/**
 * Test vendor order management
 */
exports.testVendorOrders = async () => {
  // Step 1: Create a vendor
  const vendorData = await createTestUser('vendor');
  testUsers.push(vendorData);
  
  // Step 2: Create a customer
  const customerData = await createTestUser('customer');
  testUsers.push(customerData);
  
  // Step 3: Vendor creates a product
  const product = await createTestProduct(vendorData.user.id, vendorData.token);
  testProducts.push(product);
  
  // Step 4: Try to create an order
  try {
    const paymentResponse = await axios.post(
      `${BASE_URL}/api/payments/create-payment-intent`,
      {
        productId: product.id,
        amount: product.price
      },
      {
        headers: {
          'Authorization': `Bearer ${customerData.token}`
        }
      }
    );
    
    // Step 5: Get vendor orders
    const vendorOrdersResponse = await axios.get(
      `${BASE_URL}/api/payments/vendor/orders`,
      {
        headers: {
          'Authorization': `Bearer ${vendorData.token}`
        }
      }
    );
    
    if (vendorOrdersResponse.status !== 200) {
      throw new Error(`Expected status 200 for vendor orders, got ${vendorOrdersResponse.status}`);
    }
    
    if (!Array.isArray(vendorOrdersResponse.data.orders)) {
      throw new Error('Vendor orders did not return an array of orders');
    }
    
    // Note: We can't check for the specific orders since we expect the payment creation to fail
    // but we can at least verify that the endpoint works
  } catch (error) {
    if (error.response && error.response.status === 400 && 
        error.response.data.message === 'Vendor has not completed Stripe onboarding') {
      // This is the expected error until Stripe Connect is implemented
      throw new Error('Vendor orders test failed: Vendor has not completed Stripe onboarding');
    } else {
      throw error;
    }
  }
};

/**
 * Cleanup function to run after tests
 */
exports.cleanup = async () => {
  // In a real implementation, we might want to delete the test data
  // from the database, but for simplicity, we'll just log it
  console.log(`Would clean up ${testUsers.length} test users`);
  console.log(`Would clean up ${testProducts.length} test products`);
  console.log(`Would clean up ${testOrders.length} test orders`);
};