// Simple script to test the database connection and schema
require('dotenv').config();
const { db, healthCheck, closePool } = require('./db');

async function testDbConnection() {
  try {
    console.log('Checking database connection...');
    const isHealthy = await healthCheck();
    
    if (isHealthy) {
      console.log('✅ Database connection successful');
      
      // Test query: get all product categories
      const categories = await db.query.productCategories.findMany();
      console.log(`Found ${categories.length} product categories in the database`);
      
      // Test query: get all active products
      const products = await db.query.products.findMany({
        where: (products, { eq }) => eq(products.active, true),
        limit: 5
      });
      console.log(`Found ${products.length} active products (limited to 5)`);
      
      // Test query: check events
      const events = await db.query.events.findMany({
        limit: 5
      });
      console.log(`Found ${events.length} events (limited to 5)`);
      
    } else {
      console.error('❌ Database connection failed');
    }
  } catch (error) {
    console.error('Error testing database connection:', error);
  } finally {
    // Close the database connection pool
    await closePool();
  }
}

testDbConnection().catch(console.error);