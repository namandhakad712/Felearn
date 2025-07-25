/**
 * Firebase Data Export Script
 * 
 * This script exports data from Firebase to JSON files that can be imported into Appwrite.
 * It exports users, stories, and any other collections defined in Firebase.
 * 
 * Usage:
 * node scripts/exportFirebaseData.js
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

// Output directory for exported data
const OUTPUT_DIR = path.join(__dirname, '../data/firebase-export');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Export Firebase Auth users
 */
async function exportUsers() {
  console.log('Exporting users...');
  
  try {
    // List all users
    const listUsersResult = await auth.listUsers();
    const users = listUsersResult.users.map(userRecord => {
      // Convert Firebase UserRecord to plain object
      const user = userRecord.toJSON();
      
      // Add any additional user data from Firestore
      return user;
    });
    
    // Write users to file
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'users.json'),
      JSON.stringify(users, null, 2)
    );
    
    console.log(`Exported ${users.length} users`);
    return users;
  } catch (error) {
    console.error('Error exporting users:', error);
    return [];
  }
}

/**
 * Export a Firestore collection to JSON
 * @param {string} collectionName Collection name
 */
async function exportCollection(collectionName) {
  console.log(`Exporting collection: ${collectionName}...`);
  
  try {
    // Get all documents in the collection
    const snapshot = await db.collection(collectionName).get();
    
    if (snapshot.empty) {
      console.log(`No documents found in ${collectionName}`);
      return [];
    }
    
    // Convert documents to plain objects
    const documents = snapshot.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data()
      };
    });
    
    // Write documents to file
    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${collectionName}.json`),
      JSON.stringify(documents, null, 2)
    );
    
    console.log(`Exported ${documents.length} documents from ${collectionName}`);
    return documents;
  } catch (error) {
    console.error(`Error exporting collection ${collectionName}:`, error);
    return [];
  }
}

/**
 * Main export function
 */
async function exportAllData() {
  console.log('Starting Firebase data export...');
  
  // Export users
  const users = await exportUsers();
  
  // Export collections
  const collections = ['stories', 'user_profiles', 'admin_logs'];
  
  for (const collection of collections) {
    await exportCollection(collection);
  }
  
  console.log('Firebase data export complete!');
  console.log(`Exported data saved to: ${OUTPUT_DIR}`);
}

// Run the export
exportAllData()
  .then(() => {
    console.log('Export completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Export failed:', error);
    process.exit(1);
  });