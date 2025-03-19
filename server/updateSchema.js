// Script to update the database schema
const { updateTableSchemas } = require('./schema');

async function runSchemaUpdates() {
  try {
    console.log('Starting database schema updates...');
    await updateTableSchemas();
    console.log('Database schema updates completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating database schema:', error);
    process.exit(1);
  }
}

// Run the updates
runSchemaUpdates();