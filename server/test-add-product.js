// Script to test adding a product using the storage layer
require('dotenv').config();
const { productStorage } = require('./storage');

async function testAddProduct() {
  try {
    console.log('Testing product creation...');
    
    // Get available categories
    const categories = await productStorage.getProductCategories();
    console.log(`Found ${categories.length} product categories`);
    
    if (categories.length === 0) {
      console.error('No categories found. Please run seed-categories.js first');
      return;
    }
    
    // Select a random category
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    console.log(`Selected category: ${randomCategory.name} (ID: ${randomCategory.id})`);
    
    // Create a test product
    const newProduct = {
      name: 'Test Product',
      description: 'This is a test product created to verify the storage layer functionality',
      price: '29.99',
      imageUrl: 'https://example.com/image.jpg',
      active: true,
      featured: false,
      inventory: 100,
      sku: 'TEST-001',
      vendorId: 1663, // Using existing vendor ID 1663
      categoryId: randomCategory.id,
      weight: '2.5',
      dimensions: '10x15x5'
    };
    
    console.log('\nCreating new product with the following details:');
    console.log(JSON.stringify(newProduct, null, 2));
    
    const [createdProduct] = await productStorage.createProduct(newProduct);
    
    console.log('\nProduct created successfully:');
    console.log(JSON.stringify(createdProduct, null, 2));
    
    // Test getting the product by ID
    console.log(`\nRetrieving product with ID ${createdProduct.id}...`);
    const retrievedProduct = await productStorage.getProductById(createdProduct.id);
    
    if (retrievedProduct) {
      console.log('Product retrieved successfully:');
      console.log(JSON.stringify(retrievedProduct, null, 2));
    } else {
      console.error('Failed to retrieve product by ID');
    }
    
    // Test updating the product
    console.log('\nUpdating product name and price...');
    
    const updatedFields = {
      name: 'Updated Test Product',
      price: '39.99',
      updatedAt: new Date()
    };
    
    const updatedProduct = await productStorage.updateProduct(createdProduct.id, updatedFields);
    
    console.log('Product updated successfully:');
    console.log(JSON.stringify(updatedProduct, null, 2));
    
    // Test product listing with filters
    console.log('\nTesting product listing with filters...');
    
    const productList = await productStorage.getProducts({
      categoryId: randomCategory.id,
      active: true,
      page: 1,
      limit: 10
    });
    
    console.log(`Found ${productList.products.length} products in category "${randomCategory.name}"`);
    console.log('Pagination info:', productList.pagination);
    
    console.log('\nAll product storage tests completed successfully!');
    
  } catch (error) {
    console.error('Error testing product storage:', error);
  }
}

// Run the test function
testAddProduct().catch(console.error);