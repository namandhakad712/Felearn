/**
 * Firebase to Appwrite Migration Script
 * 
 * This script handles the migration of data from Firebase to Appwrite.
 * It exports data from Firebase and imports it into Appwrite.
 * 
 * Usage:
 * 1. Make sure Firebase and Appwrite configurations are set up correctly
 * 2. Run this script with Node.js: node migrate-firebase-to-appwrite.js
 */

// Import required modules
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define the export directory
const EXPORT_DIR = path.resolve(__dirname, './data/firebase-export');

// Define collection mappings (Firebase collection name to Appwrite collection ID)
const COLLECTION_MAPPINGS = {
  'users': 'users',
  'stories': 'stories',
  // Add other collections as needed
};

/**
 * Create a directory if it doesn't exist
 * @param {string} dirPath Directory path
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

/**
 * Run the migration process
 */
async function runMigration() {
  try {
    console.log('Starting Firebase to Appwrite migration...');
    
    // Create export directory
    ensureDirectoryExists(EXPORT_DIR);
    
    // Create a migration script that uses the DataMigration and FirebaseDataExport classes
    const migrationScriptPath = path.resolve(__dirname, './migration-runner.js');
    
    // Write the migration runner script
    fs.writeFileSync(migrationScriptPath, `
const { DataMigration } = require('./src/utils/dataMigration');
const { FirebaseDataExport } = require('./src/utils/firebaseDataExport');
const { APPWRITE_CONFIG } = require('./src/config/appwrite');
const fs = require('fs');
const path = require('path');

// Define the export directory
const EXPORT_DIR = '${EXPORT_DIR.replace(/\\/g, '\\\\')}';

// Define collection mappings
const COLLECTION_MAPPINGS = ${JSON.stringify(COLLECTION_MAPPINGS, null, 2)};

async function runMigration() {
  try {
    // Step 1: Export users from Firebase
    console.log('Exporting users from Firebase...');
    const userCount = await FirebaseDataExport.exportUsers(EXPORT_DIR);
    console.log(\`Exported \${userCount} users from Firebase\`);
    
    // Step 2: Export collections from Firebase
    console.log('Exporting collections from Firebase...');
    const collectionResults = await FirebaseDataExport.exportAllCollections(
      Object.keys(COLLECTION_MAPPINGS),
      EXPORT_DIR
    );
    console.log('Exported collections from Firebase:', collectionResults);
    
    // Step 3: Run the full migration using DataMigration
    console.log('Running full migration...');
    const migrationResults = await DataMigration.runFullMigration(
      EXPORT_DIR,
      COLLECTION_MAPPINGS
    );
    
    console.log('Migration completed successfully!');
    console.log('Results:', JSON.stringify(migrationResults, null, 2));
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration().catch(error => {
  console.error('Unhandled error during migration:', error);
  process.exit(1);
});
    `);
    
    console.log('Migration script created at:', migrationScriptPath);
    console.log('');
    console.log('To run the migration:');
    console.log('1. Make sure Firebase and Appwrite configurations are set up correctly');
    console.log('2. Run the script with Node.js: node migration-runner.js');
    console.log('');
    console.log('Migration data will be exported to:', EXPORT_DIR);
    
  } catch (error) {
    console.error('Error setting up migration:', error);
    process.exit(1);
  }
}

// Run the setup
runMigration().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});