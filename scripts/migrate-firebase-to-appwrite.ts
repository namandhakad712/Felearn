import { DataMigration } from '../src/utils/dataMigration';
import { FirebaseDataExport } from '../src/utils/firebaseDataExport';
import { APPWRITE_CONFIG } from '../src/config/appwrite';
import fs from 'fs';
import path from 'path';

// Define the export directory
const EXPORT_DIR = path.resolve(__dirname, '../data/firebase-export');

// Define collection mappings (Firebase collection name to Appwrite collection ID)
const COLLECTION_MAPPINGS = {
  'users': APPWRITE_CONFIG.collections.users,
  'stories': APPWRITE_CONFIG.collections.stories,
  // Add other collections as needed
};

/**
 * Main migration function
 */
async function runMigration() {
  try {
    console.log('Starting Firebase to Appwrite migration...');
    
    // Create export directory if it doesn't exist
    if (!fs.existsSync(EXPORT_DIR)) {
      fs.mkdirSync(EXPORT_DIR, { recursive: true });
    }
    
    // Step 1: Export users from Firebase
    console.log('Exporting users from Firebase...');
    const userCount = await FirebaseDataExport.exportUsers(EXPORT_DIR);
    console.log(`Exported ${userCount} users from Firebase`);
    
    // Step 2: Export collections from Firebase
    console.log('Exporting collections from Firebase...');
    const collectionResults = await FirebaseDataExport.exportAllCollections(
      Object.keys(COLLECTION_MAPPINGS),
      EXPORT_DIR
    );
    console.log('Exported collections from Firebase:', collectionResults);
    
    // Step 3: Import users to Appwrite
    console.log('Importing users to Appwrite...');
    const usersFilePath = path.resolve(EXPORT_DIR, 'firebase-users.json');
    if (fs.existsSync(usersFilePath)) {
      const userImportData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
      const userImportResult = await DataMigration.migrateUsers(userImportData);
      console.log('User import results:', userImportResult);
    } else {
      console.warn('No user export file found. Skipping user import.');
    }
    
    // Step 4: Import collections to Appwrite
    console.log('Importing collections to Appwrite...');
    for (const [firebaseCollection, appwriteCollectionId] of Object.entries(COLLECTION_MAPPINGS)) {
      const collectionFilePath = path.resolve(EXPORT_DIR, `firebase-${firebaseCollection}.json`);
      
      if (fs.existsSync(collectionFilePath)) {
        console.log(`Importing ${firebaseCollection} collection...`);
        const collectionData = JSON.parse(fs.readFileSync(collectionFilePath, 'utf8'));
        
        // Use the appropriate migration method based on collection type
        let importResult;
        if (firebaseCollection === 'stories') {
          importResult = await DataMigration.migrateStories(collectionData);
        } else {
          console.warn(`No specific migration method for collection "${firebaseCollection}". Skipping.`);
          continue;
        }
        
        console.log(`${firebaseCollection} import results:`, importResult);
      } else {
        console.warn(`No export file found for collection "${firebaseCollection}". Skipping.`);
      }
    }
    
    console.log('Migration completed successfully!');
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