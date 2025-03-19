const { drizzle } = require('drizzle-orm/node-postgres');
const { migrate } = require('drizzle-orm/node-postgres/migrator');
const { Pool } = require('pg');
const { join } = require('path');

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }

  console.log('Running Drizzle migration...');
  
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL
  });
  
  const db = drizzle(pool);
  
  console.log('Connected to database, applying migrations...');
  
  try {
    // Update database with all changes from the schema
    await migrate(db, { migrationsFolder: join(__dirname, '../migrations') });
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('Migration script executed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration script failed:', err);
      process.exit(1);
    });
}

module.exports = { runMigration };