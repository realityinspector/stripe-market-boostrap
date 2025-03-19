/**
 * Inventory Management Test Script
 * 
 * This script tests the inventory management functionality for products:
 * 1. Creating a product with inventory
 * 2. Updating inventory levels
 * 3. Testing inventory alerts
 * 4. Viewing inventory history
 */

const { productStorage } = require('./product-storage');

// Test constants
const TEST_VENDOR_ID = 1;  // Assuming vendor with ID 1 exists
const TEST_CATEGORY_ID = 1; // Assuming category with ID 1 exists

async function runInventoryTests() {
  try {
    console.log('Starting inventory management tests...');
    
    // Step 1: Create a test product with initial inventory
    console.log('\n---- Step 1: Creating test product with inventory ----');
    const testProduct = {
      name: 'Test Inventory Product',
      description: 'A product for testing inventory management',
      price: 19.99,
      vendorId: TEST_VENDOR_ID,
      categoryId: TEST_CATEGORY_ID,
      sku: 'TEST-INV-001',
      inventory: 10, // Start with 10 items
      weight: 1.5,
      dimensions: '10x5x2',
      active: true,
      featured: false
    };
    
    const createdProduct = await productStorage.createProduct(testProduct);
    console.log('Created product:', createdProduct);
    
    if (!createdProduct || createdProduct.length === 0) {
      throw new Error('Failed to create test product');
    }
    
    const productId = createdProduct[0].id;
    console.log(`Test product created with ID: ${productId} and inventory: ${createdProduct[0].inventory}`);
    
    // Step 2: Update inventory (decrease by 3 - simulate purchase)
    console.log('\n---- Step 2: Updating inventory (purchase 3 items) ----');
    let updatedProduct = await productStorage.updateInventory(productId, -3, {
      reason: 'test_purchase'
    });
    console.log(`Inventory after purchase: ${updatedProduct.inventory} (Decreased by 3)`);
    
    // Step 3: Update inventory again (increase by 5 - simulate restock)
    console.log('\n---- Step 3: Updating inventory (restock 5 items) ----');
    updatedProduct = await productStorage.updateInventory(productId, 5, {
      reason: 'test_restock'
    });
    console.log(`Inventory after restock: ${updatedProduct.inventory} (Increased by 5)`);
    
    // Step 4: Reduce inventory to trigger low stock alert
    console.log('\n---- Step 4: Reducing inventory to trigger low stock alert ----');
    const currentInventory = updatedProduct.inventory;
    const reduceAmount = currentInventory - 4; // Leave 4 items (below low threshold of 5)
    
    updatedProduct = await productStorage.updateInventory(productId, -reduceAmount, {
      reason: 'test_low_stock'
    });
    console.log(`Inventory after reduction: ${updatedProduct.inventory} (Should trigger low stock alert)`);
    
    // Step 5: Check for low inventory products
    console.log('\n---- Step 5: Checking for low inventory products ----');
    const lowInventoryProducts = await productStorage.getLowInventoryProducts({
      vendorId: TEST_VENDOR_ID,
      categoryId: TEST_CATEGORY_ID
    });
    console.log(`Found ${lowInventoryProducts.length} products with low inventory:`);
    lowInventoryProducts.forEach(product => {
      console.log(`- ${product.name} (ID: ${product.id}): ${product.inventory} in stock`);
    });
    
    // Step 6: Check inventory alerts
    console.log('\n---- Step 6: Checking inventory alerts ----');
    const alerts = await productStorage.getInventoryAlerts({
      vendorId: TEST_VENDOR_ID
    });
    console.log(`Found ${alerts.length} active inventory alerts:`);
    alerts.forEach(alert => {
      console.log(`- ${alert.product_name} (ID: ${alert.product_id}): ${alert.quantity} in stock, Alert level: ${alert.alert_level}`);
    });
    
    // Step 7: Reduce inventory to critical level
    console.log('\n---- Step 7: Reducing inventory to critical level ----');
    updatedProduct = await productStorage.updateInventory(productId, -2, {
      reason: 'test_critical_stock'
    });
    console.log(`Inventory after reduction: ${updatedProduct.inventory} (Should trigger critical alert)`);
    
    // Step 8: Check alerts again
    console.log('\n---- Step 8: Checking alerts after critical reduction ----');
    const criticalAlerts = await productStorage.getInventoryAlerts({ 
      alertLevel: 'critical',
      vendorId: TEST_VENDOR_ID
    });
    console.log(`Found ${criticalAlerts.length} critical inventory alerts:`);
    criticalAlerts.forEach(alert => {
      console.log(`- ${alert.product_name} (ID: ${alert.product_id}): ${alert.quantity} in stock, Alert level: ${alert.alert_level}`);
    });
    
    // Step 9: Get inventory history
    console.log('\n---- Step 9: Checking inventory history ----');
    const history = await productStorage.getInventoryHistory(productId);
    console.log(`Found ${history.length} inventory changes for product ID ${productId}:`);
    history.forEach(change => {
      console.log(`- ${new Date(change.changed_at).toLocaleString()}: ${change.previous_quantity} -> ${change.new_quantity} (${change.change_quantity > 0 ? '+' : ''}${change.change_quantity}) Reason: ${change.change_reason}`);
    });
    
    // Step 10: Test insufficient inventory error
    console.log('\n---- Step 10: Testing insufficient inventory error ----');
    try {
      await productStorage.updateInventory(productId, -100, {
        reason: 'test_insufficient'
      });
      console.log('ERROR: Should have thrown insufficient inventory error');
    } catch (error) {
      console.log('Successfully caught insufficient inventory error:', error.message);
    }
    
    // Step 11: Allow negative inventory
    console.log('\n---- Step 11: Testing negative inventory (allowNegative: true) ----');
    try {
      updatedProduct = await productStorage.updateInventory(productId, -10, {
        reason: 'test_negative_inventory',
        allowNegative: true
      });
      console.log(`Inventory after negative adjustment: ${updatedProduct.inventory}`);
    } catch (error) {
      console.log('ERROR: Should have allowed negative inventory:', error.message);
    }
    
    // Clean up - delete test product
    console.log('\n---- Cleaning up: Deleting test product ----');
    await productStorage.deleteProduct(productId);
    console.log('Test product deleted successfully');
    
    console.log('\n---- Inventory Management Tests Completed Successfully ----');
  } catch (error) {
    console.error('Error during inventory testing:', error);
  }
}

// Run the tests
runInventoryTests()
  .then(() => {
    console.log('All inventory tests finished');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error running inventory tests:', error);
    process.exit(1);
  });