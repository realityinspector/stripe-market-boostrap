// Simple script to test the database connection and schema
require('dotenv').config();
const { Pool } = require('pg');

async function testDbConnection() {
  // Create a new pool connection for this test
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    console.log('Checking database connection...');
    
    // Test the connection
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT 1 as test');
      if (result.rows.length > 0) {
        console.log('✅ Database connection successful');
        
        // Test query: List all tables
        const tablesResult = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
          ORDER BY table_name
        `);
        
        console.log(`\nDatabase tables (${tablesResult.rows.length} total):`);
        tablesResult.rows.forEach(row => {
          console.log(`- ${row.table_name}`);
        });
        
        // Test getting product categories
        const categoryResult = await client.query('SELECT * FROM product_categories LIMIT 5');
        console.log(`\nFound ${categoryResult.rows.length} product categories`);
        
        // Test getting all active products
        const productResult = await client.query('SELECT * FROM products WHERE active = true LIMIT 5');
        console.log(`Found ${productResult.rows.length} active products (limited to 5)`);
        
        // Test getting events
        const eventResult = await client.query('SELECT * FROM events LIMIT 5');
        console.log(`Found ${eventResult.rows.length} events (limited to 5)`);
        
        console.log('\nDatabase schema check complete!');
      } else {
        console.error('❌ Database connection failed');
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error testing database connection:', error);
  } finally {
    // Close the pool
    await pool.end();
    console.log('Database pool closed');
  }
}

testDbConnection().catch(console.error);