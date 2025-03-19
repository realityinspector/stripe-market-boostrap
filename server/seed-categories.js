// Script to add initial product categories
require('dotenv').config();
const { Pool } = require('pg');

async function seedCategories() {
  // Create a new pool connection
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    console.log('Connecting to database to add product categories...');
    
    const client = await pool.connect();
    try {
      // Check if we already have categories
      const checkResult = await client.query('SELECT COUNT(*) FROM product_categories');
      const categoryCount = parseInt(checkResult.rows[0].count);
      
      if (categoryCount > 0) {
        console.log(`Database already has ${categoryCount} product categories. No need to add more.`);
        return;
      }
      
      // Create parent categories
      const categories = [
        {
          name: 'Electronics',
          description: 'Electronic devices and gadgets',
          slug: 'electronics',
          parentId: null
        },
        {
          name: 'Clothing',
          description: 'Apparel and fashion items',
          slug: 'clothing',
          parentId: null
        },
        {
          name: 'Home & Garden',
          description: 'Home decor and garden supplies',
          slug: 'home-garden',
          parentId: null
        },
        {
          name: 'Sports & Outdoors',
          description: 'Sports equipment and outdoor gear',
          slug: 'sports-outdoors',
          parentId: null
        },
        {
          name: 'Books & Media',
          description: 'Books, music, and entertainment content',
          slug: 'books-media',
          parentId: null
        }
      ];
      
      console.log('Adding parent categories...');
      
      // Insert parent categories and store their IDs
      const parentIds = {};
      
      for (const category of categories) {
        const result = await client.query(
          'INSERT INTO product_categories (name, description, slug, active) VALUES ($1, $2, $3, $4) RETURNING id',
          [category.name, category.description, category.slug, true]
        );
        
        const id = result.rows[0].id;
        parentIds[category.name] = id;
        console.log(`Added category: ${category.name} (ID: ${id})`);
      }
      
      // Create subcategories
      const subcategories = [
        {
          name: 'Smartphones',
          description: 'Mobile phones and smartphones',
          slug: 'smartphones',
          parentName: 'Electronics'
        },
        {
          name: 'Laptops',
          description: 'Laptop computers and accessories',
          slug: 'laptops',
          parentName: 'Electronics'
        },
        {
          name: 'Men\'s Clothing',
          description: 'Clothing for men',
          slug: 'mens-clothing',
          parentName: 'Clothing'
        },
        {
          name: 'Women\'s Clothing',
          description: 'Clothing for women',
          slug: 'womens-clothing',
          parentName: 'Clothing'
        },
        {
          name: 'Furniture',
          description: 'Home furniture',
          slug: 'furniture',
          parentName: 'Home & Garden'
        },
        {
          name: 'Kitchen',
          description: 'Kitchen appliances and supplies',
          slug: 'kitchen',
          parentName: 'Home & Garden'
        },
        {
          name: 'Fitness',
          description: 'Fitness and exercise equipment',
          slug: 'fitness',
          parentName: 'Sports & Outdoors'
        },
        {
          name: 'Camping',
          description: 'Camping gear and supplies',
          slug: 'camping',
          parentName: 'Sports & Outdoors'
        },
        {
          name: 'Fiction',
          description: 'Fiction books',
          slug: 'fiction',
          parentName: 'Books & Media'
        },
        {
          name: 'Non-Fiction',
          description: 'Non-fiction books',
          slug: 'non-fiction',
          parentName: 'Books & Media'
        }
      ];
      
      console.log('\nAdding subcategories...');
      
      for (const subcategory of subcategories) {
        const parentId = parentIds[subcategory.parentName];
        
        const result = await client.query(
          'INSERT INTO product_categories (name, description, slug, parent_id, active) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [subcategory.name, subcategory.description, subcategory.slug, parentId, true]
        );
        
        const id = result.rows[0].id;
        console.log(`Added subcategory: ${subcategory.name} (ID: ${id}, Parent: ${subcategory.parentName})`);
      }
      
      console.log('\nProduct categories added successfully!');
      
      // Check the total number of categories
      const countResult = await client.query('SELECT COUNT(*) FROM product_categories');
      console.log(`Total categories in database: ${countResult.rows[0].count}`);
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error seeding categories:', error);
  } finally {
    await pool.end();
    console.log('Database pool closed');
  }
}

// Run the seed function
seedCategories().catch(console.error);