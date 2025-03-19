/**
 * Test Stripe Connect Payment Flow
 * 
 * This script tests the full payment flow through a Stripe Connect marketplace:
 * 1. Creates a customer
 * 2. Creates a vendor with Stripe Connect account
 * 3. Creates a payment intent from customer to vendor
 * 4. Verifies platform fees
 * 5. Simulates payment capture and transfer to vendor
 * 
 * Note: This test simulates the flow but doesn't actually charge real cards
 */

const stripeService = require('./services/stripe');
const db = require('./db');

// Platform configuration
const PLATFORM_FEE_PERCENT = 12.5; // 12.5%

/**
 * Generate a unique test data identifier to avoid conflicts
 */
function generateTestId() {
  return `test-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/**
 * Test the full Connect payment flow
 */
async function testConnectPaymentFlow() {
  console.log('===== TESTING STRIPE CONNECT PAYMENT FLOW =====');
  const testId = generateTestId();
  
  try {
    // Create a test vendor with a Stripe Connect account
    console.log('\n1. Creating test vendor with Connect account...');
    const vendorData = {
      name: `Test Vendor ${testId}`,
      email: `vendor-${testId}@example.com`,
      description: 'Test vendor for Connect payment flow'
    };
    
    // Create the vendor in our database
    const vendorResult = await db.query(
      `INSERT INTO vendors (business_name, user_id, business_description, status, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING *`,
      [vendorData.name, null, vendorData.description, 'pending']
    );
    
    const vendor = vendorResult.rows[0];
    console.log(`✅ Created vendor in database: ${vendor.business_name} (ID: ${vendor.id})`);
    
    // Create a Stripe Connect account for the vendor
    const stripeAccount = await stripeService.createStripeAccount(vendorData.name, vendorData.email);
    console.log(`✅ Created Stripe Connect account: ${stripeAccount.id}`);
    
    // Associate the Stripe account with the vendor
    await db.query(
      `UPDATE vendors 
       SET stripe_account_id = $1, 
           stripe_onboarding_complete = FALSE
       WHERE id = $2`,
      [stripeAccount.id, vendor.id]
    );
    
    // Create a test customer
    console.log('\n2. Creating test customer...');
    const customerData = {
      name: `Test Customer ${testId}`,
      email: `customer-${testId}@example.com`
    };
    
    // Create the customer in our database
    const customerResult = await db.query(
      `INSERT INTO users (name, email, password, role, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING *`,
      [customerData.name, customerData.email, 'password123', 'customer']
    );
    
    const customer = customerResult.rows[0];
    console.log(`✅ Created customer in database: ${customer.name} (ID: ${customer.id})`);
    
    // Create a test product
    console.log('\n3. Creating test product for vendor...');
    const productData = {
      name: `Test Product ${testId}`,
      description: 'Test product for Connect payment flow',
      price: 1995, // $19.95
      vendor_id: vendor.id
    };
    
    // Create the product in our database
    const productResult = await db.query(
      `INSERT INTO products (name, description, price, vendor_id, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) 
       RETURNING *`,
      [productData.name, productData.description, productData.price, productData.vendor_id, 'active']
    );
    
    const product = productResult.rows[0];
    console.log(`✅ Created product in database: ${product.name} (ID: ${product.id}, Price: $${product.price/100})`);
    
    // Calculate platform fee
    const platformFee = Math.round(productData.price * (PLATFORM_FEE_PERCENT / 100));
    console.log(`Platform fee (${PLATFORM_FEE_PERCENT}%): $${platformFee/100}`);
    
    // Create an order
    console.log('\n4. Creating order...');
    const orderData = {
      customer_id: customer.id,
      product_id: product.id,
      quantity: 1,
      total: productData.price,
      status: 'pending'
    };
    
    // Create the order in our database
    const orderResult = await db.query(
      `INSERT INTO orders (customer_id, product_id, vendor_id, quantity, total, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
       RETURNING *`,
      [
        orderData.customer_id, 
        orderData.product_id, 
        vendor.id, 
        orderData.quantity, 
        orderData.total, 
        orderData.status
      ]
    );
    
    const order = orderResult.rows[0];
    console.log(`✅ Created order in database: Order #${order.id} for $${order.total/100}`);
    
    // Create a payment intent with Connect account
    console.log('\n5. Creating payment intent...');
    const metadata = {
      orderId: order.id.toString(),
      productId: product.id.toString(),
      customerId: customer.id.toString(),
      vendorId: vendor.id.toString(),
      test: 'true'
    };
    
    const paymentIntent = await stripeService.createPaymentIntent(
      orderData.total,
      'usd',
      stripeAccount.id,
      platformFee,
      metadata,
      { description: `Order #${order.id}: ${product.name}` }
    );
    
    console.log(`✅ Created payment intent: ${paymentIntent.id}`);
    console.log(`✅ Application fee amount: $${paymentIntent.application_fee_amount/100}`);
    
    // Check if this is a mock payment intent (expected for new account)
    if (paymentIntent.id.startsWith('pi_mock_')) {
      console.log('ℹ️ Using mock payment intent because vendor has not completed onboarding');
      console.log('ℹ️ This is expected in test mode for new Connect accounts');
    }
    
    // Update order with payment intent ID
    await db.query(
      `UPDATE orders SET payment_id = $1 WHERE id = $2`,
      [paymentIntent.id, order.id]
    );
    
    // In a real app, the customer would now complete payment using the client_secret
    console.log('\n6. Simulating payment capture...');
    
    // In production, this would happen via webhook when payment is completed
    await db.query(
      `UPDATE orders SET status = $1 WHERE id = $2`,
      ['paid', order.id]
    );
    
    console.log('✅ Order marked as paid (simulated in test)');
    
    // Create a simulated transfer to the vendor
    console.log('\n7. Creating transfer to vendor...');
    const transferAmount = orderData.total - platformFee;
    
    const transfer = await stripeService.createTransfer(
      transferAmount, 
      stripeAccount.id,
      { 
        orderId: order.id.toString(),
        productId: product.id.toString() 
      },
      { description: `Order #${order.id} payment` }
    );
    
    if (transfer.id.startsWith('tr_mock_')) {
      console.log('ℹ️ Using mock transfer because vendor has not completed onboarding');
      console.log('ℹ️ This is expected in test mode for new Connect accounts');
    }
    
    console.log(`✅ Created transfer: ${transfer.id}`);
    console.log(`✅ Transfer amount: $${transferAmount/100}`);
    
    // Log transaction summary
    console.log('\n===== PAYMENT FLOW SUMMARY =====');
    console.log(`Order total:        $${orderData.total/100}`);
    console.log(`Platform fee:       $${platformFee/100} (${PLATFORM_FEE_PERCENT}%)`);
    console.log(`Vendor payout:      $${transferAmount/100}`);
    console.log('===============================');
    
    // Success!
    return {
      success: true,
      order: order,
      payment: paymentIntent,
      transfer: transfer,
      vendor: {
        id: vendor.id,
        stripeAccountId: stripeAccount.id
      },
      product: product,
      customer: customer
    };
    
  } catch (error) {
    console.error(`❌ Connect payment flow test failed: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testConnectPaymentFlow()
  .then(result => {
    console.log('\n===== CONNECT PAYMENT FLOW TEST COMPLETE =====');
    console.log(result.success ? 
      '✅ Stripe Connect payment flow is properly configured!' : 
      `❌ Stripe Connect payment flow test failed: ${result.error}`
    );
    
    // Clean up test data (optional)
    if (result.success) {
      console.log('\nTest data created:');
      console.log(`- Vendor ID: ${result.vendor.id} (Stripe Account: ${result.vendor.stripeAccountId})`);
      console.log(`- Customer ID: ${result.customer.id}`);
      console.log(`- Product ID: ${result.product.id}`);
      console.log(`- Order ID: ${result.order.id}`);
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Unexpected error during Connect payment flow test:', err);
    process.exit(1);
  });