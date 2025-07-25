# Firebase to Appwrite Migration Guide

This document provides instructions for migrating data from Firebase to Appwrite.

## Prerequisites

- Node.js 14+ installed
- Firebase project with data to migrate
- Appwrite project set up and configured
- Environment variables for both Firebase and Appwrite properly configured

## Migration Process

The migration process consists of the following steps:

1. Export data from Firebase
2. Transform data to match Appwrite's format
3. Import data into Appwrite
4. Verify the migration

## Setup

1. Make sure your Firebase configuration is available in `src/config/firebase.backup.ts`
2. Make sure your Appwrite configuration is available in `src/config/appwrite.ts`
3. Ensure all required environment variables are set

## Running the Migration

### Option 1: Using the Migration Script

1. Run the migration setup script:
   ```
   node migrate-firebase-to-appwrite.js
   ```

2. This will create a `migration-runner.js` file. Run it to perform the migration:
   ```
   node migration-runner.js
   ```

### Option 2: Using the Migration Utilities Directly

You can use the migration utilities directly in your code:

```typescript
import { DataMigration } from './src/utils/dataMigration';
import { FirebaseDataExport } from './src/utils/firebaseDataExport';
import { APPWRITE_CONFIG } from './src/config/appwrite';

// Define the export directory
const EXPORT_DIR = './data/firebase-export';

// Define collection mappings
const COLLECTION_MAPPINGS = {
  'users': APPWRITE_CONFIG.collections.users,
  'stories': APPWRITE_CONFIG.collections.stories,
};

// Run the migration
async function migrate() {
  try {
    // Export data from Firebase
    await FirebaseDataExport.exportUsers(EXPORT_DIR);
    await FirebaseDataExport.exportAllCollections(Object.keys(COLLECTION_MAPPINGS), EXPORT_DIR);
    
    // Import data into Appwrite
    const results = await DataMigration.runFullMigration(EXPORT_DIR, COLLECTION_MAPPINGS);
    console.log('Migration completed:', results);
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();
```

## Migration Results

After running the migration, you'll find the following files in the export directory:

- `firebase-users.json`: Exported Firebase users
- `firebase-{collection}.json`: Exported Firebase collections
- `export-summary.json`: Summary of the export process
- `migration-summary.json`: Summary of the migration process

## Verifying the Migration

After the migration is complete, verify that:

1. All users have been migrated to Appwrite
2. All collections have been migrated to Appwrite
3. The data structure is correct
4. Authentication works with the migrated users

## Troubleshooting

### Common Issues

1. **Firebase Authentication Export Fails**
   - Make sure you're using Firebase Admin SDK for authentication export
   - Verify that you have the correct permissions

2. **Appwrite Import Fails**
   - Check that your Appwrite collections are properly set up
   - Verify that the data structure matches the Appwrite collection schema

3. **Data Transformation Issues**
   - Check the transformation functions in `DataMigration` class
   - Adjust the transformation logic if needed

### Logs

Check the following logs for more information:

- Console output during migration
- `export-summary.json` for export details
- `migration-summary.json` for migration details

## Additional Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Firebase Documentation](https://firebase.google.com/docs)