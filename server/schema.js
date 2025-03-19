// Database schema setup script

const db = require('./db');

// Function to update existing table schemas
const updateTableSchemas = async () => {
  try {
    console.log('Checking for database schema updates...');
    
    // Check if currency column exists in orders table
    const checkCurrencyColumn = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name = 'currency'
    `);
    
    // Add currency column if it doesn't exist
    if (checkCurrencyColumn.rows.length === 0) {
      console.log('Adding currency column to orders table...');
      await db.query(`
        ALTER TABLE orders 
        ADD COLUMN currency VARCHAR(3) NOT NULL DEFAULT 'usd'
      `);
      console.log('Currency column added successfully');
    }
    
    // Check if featured column exists in products table
    const checkFeaturedColumn = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'featured'
    `);
    
    // Add featured column if it doesn't exist
    if (checkFeaturedColumn.rows.length === 0) {
      console.log('Adding featured column to products table...');
      await db.query(`
        ALTER TABLE products 
        ADD COLUMN featured BOOLEAN NOT NULL DEFAULT FALSE
      `);
      console.log('Featured column added successfully');
    }
    
    // Check if status constraint includes refund states
    const checkOrderStatusValues = await db.query(`
      SELECT pg_get_constraintdef(oid) as constraint_def
      FROM pg_constraint
      WHERE conname = (
        SELECT conname
        FROM pg_constraint
        JOIN pg_attribute ON pg_attribute.attrelid = pg_constraint.conrelid
          AND pg_attribute.attnum = ANY(pg_constraint.conkey)
        WHERE pg_attribute.attname = 'status'
          AND pg_constraint.conrelid = 'orders'::regclass
      )
    `);
    
    // Update status constraint if needed
    if (checkOrderStatusValues.rows.length > 0) {
      const constraintDef = checkOrderStatusValues.rows[0].constraint_def;
      if (!constraintDef.includes('refunded') || !constraintDef.includes('partially_refunded')) {
        console.log('Updating order status constraint to include refund states...');
        
        // Drop the existing constraint
        await db.query(`
          ALTER TABLE orders
          DROP CONSTRAINT IF EXISTS orders_status_check
        `);
        
        // Add the new constraint with refund states
        await db.query(`
          ALTER TABLE orders
          ADD CONSTRAINT orders_status_check 
          CHECK (status IN ('pending', 'paid', 'completed', 'cancelled', 'refunded', 'partially_refunded', 'failed'))
        `);
        
        console.log('Order status constraint updated successfully');
      }
    }
    
    // Check if refunds table exists
    const checkRefundsTable = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'refunds'
    `);
    
    // Create refunds table if it doesn't exist
    if (checkRefundsTable.rows.length === 0) {
      console.log('Creating refunds table...');
      await db.query(`
        CREATE TABLE IF NOT EXISTS refunds (
          id SERIAL PRIMARY KEY,
          order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
          amount DECIMAL(10,2) NOT NULL,
          reason TEXT,
          stripe_refund_id VARCHAR(255),
          initiated_by VARCHAR(20) NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Refunds table created successfully');
    }
    
    console.log('Database schema updates completed');
  } catch (err) {
    console.error('Error updating database schemas:', err);
    throw err;
  }
};

const createTables = async () => {
  try {
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'vendor', 'customer')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create vendors table
    await db.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        business_name VARCHAR(255) NOT NULL,
        business_description TEXT,
        stripe_account_id VARCHAR(255) UNIQUE,
        stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
        commission_rate DECIMAL(5,2) DEFAULT 10.00,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create products table
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        image_url TEXT,
        active BOOLEAN DEFAULT TRUE,
        featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create orders table
    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES users(id),
        vendor_id INTEGER REFERENCES vendors(id),
        total_amount DECIMAL(10,2) NOT NULL,
        commission_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(25) NOT NULL DEFAULT 'pending' 
          CHECK (status IN ('pending', 'paid', 'completed', 'cancelled', 'refunded', 'partially_refunded', 'failed')),
        currency VARCHAR(3) NOT NULL DEFAULT 'usd',
        stripe_payment_intent_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create order_items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create payouts table
    await db.query(`
      CREATE TABLE IF NOT EXISTS payouts (
        id SERIAL PRIMARY KEY,
        vendor_id INTEGER REFERENCES vendors(id),
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
        stripe_payout_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create refunds table
    await db.query(`
      CREATE TABLE IF NOT EXISTS refunds (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        reason TEXT,
        stripe_refund_id VARCHAR(255),
        initiated_by VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create platform_settings table
    await db.query(`
      CREATE TABLE IF NOT EXISTS platform_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables created successfully');
  } catch (err) {
    console.error('Error creating database tables:', err);
    throw err;
  }
};

module.exports = { createTables, updateTableSchemas };
