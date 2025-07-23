/**
 * Appwrite Data Import Script
 * 
 * This script imports data from JSON files exported from Firebase into Appwrite.
 * It imports users, stories, and any other collections defined in the export.
 * 
 * Usage:
 * node scripts/importToAppwrite.js
 */

const fs = require('fs');
const path = require('path');
const { Client, Databases, ID } = require('node-appwrite');

// Load environment variables
require('dotenv').config();

// Initialize Appwrite client
const client = new Client();

client
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY); // Server API key with write permissions

const databases = new Databases(client);

// Database and collection IDs
const DATABASE_ID = process.env.VITE_APPWRITE_DATABASE_ID;
const USERS_COLLECTION_ID = process.env.VITE_APPWRITE_USERS_COLLECTION_ID || 'users';
const STORIES_COLLECTION_ID = process.env.VITE_APPWRITE_STORIES_COLLECTION_ID || 'stories';
const ADMIN_LOGS_COLLECTION_ID = process.env.VITE_APPWRITE_ADMIN_LOGS_COLLECTION_ID || 'admin_logs';

// Input directory for imported data
const INPUT_DIR = path.join(__dirname, '../data/firebase-export');

/**
 * Transform Firebase user to Appwrite user format
 * @param {Object} firebaseUser Firebase user data
 * @returns {Object} Appwrite user data
 */
function transformFirebaseUser(firebaseUser) {
  // Extract Firebase user data
  const {
    uid,
    email,
    displayName,
    metadata,
    providerData,
    emailVerified,
    disabled
  } = firebaseUser;
  
  // Create default settings
  const settings = {
    theme: 'light',
    language: 'en',
    onboardingCompleted: true // Assume completed for migrated users
  };
  
  // Determine OAuth provider if any
  let oauthProvider = undefined;
  if (providerData && providerData.length > 0) {
    const provider = providerData[0].providerId;
    if (provider !== 'password') {
      oauthProvider = provider.replace('.com', '');
    }
  }
  
  // Create Appwrite user
  return {
    $id: uid,
    email,
    name: displayName || email.split('@')[0],
    createdAt: metadata?.creationTime || new Date().toISOString(),
    lastLogin: metadata?.lastSignInTime || new Date().toISOString(),
    oauthProvider,
    settings: JSON.stringify(settings), // Store as string in Appwrite
    geminiKey: '', // Empty by default
    emailVerification: emailVerified,
    disabled: disabled || false
  };
}

/**
 * Transform Firebase story to Appwrite story format
 * @param {Object} firebaseStory Firebase story data
 * @returns {Object} Appwrite story data
 */
function transformFirebaseStory(firebaseStory) {
  // Extract Firebase story data
  const {
    id,
    userId,
    title,
    content,
    images,
    createdAt,
    isPinned,
    tags
  } = firebaseStory;
  
  // Create Appwrite story
  return {
    $id: id || ID.unique(),
    userId,
    title,
    content,
    images: JSON.stringify(images || []), // Store as string in Appwrite
    createdAt: createdAt || new Date().toISOString(),
    isPinned: isPinned || false,
    tags: JSON.stringify(tags || []) // Store as string in Appwrite
  };
}

/**
 * Import users into Appwrite
 */
async function importUsers() {
  console.log('Importing users...');
  
  try {
    // Read users from file
    const usersFile = path.join(INPUT_DIR, 'users.json');
    
    if (!fs.existsSync(usersFile)) {
      console.log('No users file found, skipping user import');
      return { total: 0, successful: 0, failed: 0, errors: [] };
    }
    
    const firebaseUsers = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    
    const results = {
      total: firebaseUsers.length,
      successful: 0,
      failed: 0,
      errors: []
    };
    
    // Import each user
    for (const firebaseUser of firebaseUsers) {
      try {
        // Transform Firebase user to Appwrite format
        const appwriteUser = transformFirebaseUser(firebaseUser);
        
        // Create user document in Appwrite
        await databases.createDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          appwriteUser.$id,
          appwriteUser
        );
        
        results.successful++;
      } catch (error) {
        console.error(`Failed to import user ${firebaseUser.uid}:`, error);
        results.failed++;
        results.errors.push({
          userId: firebaseUser.uid,
          error: error.message || String(error)
        });
      }
    }
    
    console.log(`Imported ${results.successful}/${results.total} users`);
    return results;
  } catch (error) {
    console.error('Error importing users:', error);
    return { total: 0, successful: 0, failed: 0, errors: [error.message || String(error)] };
  }
}

/**
 * Import stories into Appwrite
 */
async function importStories() {
  console.log('Importing stories...');
  
  try {
    // Read stories from file
    const storiesFile = path.join(INPUT_DIR, 'stories.json');
    
    if (!fs.existsSync(storiesFile)) {
      console.log('No stories file found, skipping story import');
      return { total: 0, successful: 0, failed: 0, errors: [] };
    }
    
    const firebaseStories = JSON.parse(fs.readFileSync(storiesFile, 'utf8'));
    
    const results = {
      total: firebaseStories.length,
      successful: 0,
      failed: 0,
      errors: []
    };
    
    // Import each story
    for (const firebaseStory of firebaseStories) {
      try {
        // Transform Firebase story to Appwrite format
        const appwriteStory = transformFirebaseStory(firebaseStory);
        
        // Create story document in Appwrite
        await databases.createDocument(
          DATABASE_ID,
          STORIES_COLLECTION_ID,
          appwriteStory.$id,
          appwriteStory
        );
        
        results.successful++;
      } catch (error) {
        console.error(`Failed to import story ${firebaseStory.id}:`, error);
        results.failed++;
        results.errors.push({
          storyId: firebaseStory.id,
          error: error.message || String(error)
        });
      }
    }
    
    console.log(`Imported ${results.successful}/${results.total} stories`);
    return results;
  } catch (error) {
    console.error('Error importing stories:', error);
    return { total: 0, successful: 0, failed: 0, errors: [error.message || String(error)] };
  }
}

/**
 * Main import function
 */
async function importAllData() {
  console.log('Starting data import to Appwrite...');
  
  // Import users
  const userResults = await importUsers();
  
  // Import stories
  const storyResults = await importStories();
  
  // Log results
  console.log('Import complete!');
  console.log('User import results:', userResults);
  console.log('Story import results:', storyResults);
  
  // Write results to file
  fs.writeFileSync(
    path.join(INPUT_DIR, 'import-results.json'),
    JSON.stringify({
      timestamp: new Date().toISOString(),
      users: userResults,
      stories: storyResults
    }, null, 2)
  );
}

// Run the import
importAllData()
  .then(() => {
    console.log('Import completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Import failed:', error);
    process.exit(1);
  });