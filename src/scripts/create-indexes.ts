import { Client, Databases } from 'appwrite';
import { APPWRITE_CONFIG } from '../config/appwrite';

// Initialize Appwrite client
const client = new Client();
client
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

const databases = new Databases(client);
const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const USERS_COLLECTION_ID = APPWRITE_CONFIG.collections.users;
const STORIES_COLLECTION_ID = APPWRITE_CONFIG.collections.stories;

async function createIndexes() {
  try {
    console.log('Creating indexes for users collection...');
    
    // Users collection indexes
    try {
      await databases.createIndex(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        'email_unique',
        'unique',
        ['email']
      );
      console.log('Created email_unique index');
    } catch (error) {
      if (error.toString().includes('Index already exists')) {
        console.log('email_unique index already exists');
      } else {
        throw error;
      }
    }
    
    try {
      await databases.createIndex(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        'name_key',
        'key',
        ['name']
      );
      console.log('Created name_key index');
    } catch (error) {
      if (error.toString().includes('Index already exists')) {
        console.log('name_key index already exists');
      } else {
        throw error;
      }
    }
    
    try {
      await databases.createIndex(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        'lastLogin_key',
        'key',
        ['lastLogin']
      );
      console.log('Created lastLogin_key index');
    } catch (error) {
      if (error.toString().includes('Index already exists')) {
        console.log('lastLogin_key index already exists');
      } else {
        throw error;
      }
    }
    
    console.log('Creating indexes for stories collection...');
    
    // Stories collection indexes
    try {
      await databases.createIndex(
        DATABASE_ID,
        STORIES_COLLECTION_ID,
        'email_key',
        'key',
        ['email']
      );
      console.log('Created email_key index');
    } catch (error) {
      if (error.toString().includes('Index already exists')) {
        console.log('email_key index already exists');
      } else {
        throw error;
      }
    }
    
    try {
      await databases.createIndex(
        DATABASE_ID,
        STORIES_COLLECTION_ID,
        'userId_key',
        'key',
        ['userId']
      );
      console.log('Created userId_key index');
    } catch (error) {
      if (error.toString().includes('Index already exists')) {
        console.log('userId_key index already exists');
      } else {
        throw error;
      }
    }
    
    try {
      await databases.createIndex(
        DATABASE_ID,
        STORIES_COLLECTION_ID,
        'createdAt_key',
        'key',
        ['createdAt']
      );
      console.log('Created createdAt_key index');
    } catch (error) {
      if (error.toString().includes('Index already exists')) {
        console.log('createdAt_key index already exists');
      } else {
        throw error;
      }
    }
    
    try {
      await databases.createIndex(
        DATABASE_ID,
        STORIES_COLLECTION_ID,
        'title_fulltext',
        'fulltext',
        ['title']
      );
      console.log('Created title_fulltext index');
    } catch (error) {
      if (error.toString().includes('Index already exists')) {
        console.log('title_fulltext index already exists');
      } else {
        throw error;
      }
    }
    
    try {
      await databases.createIndex(
        DATABASE_ID,
        STORIES_COLLECTION_ID,
        'content_fulltext',
        'fulltext',
        ['content']
      );
      console.log('Created content_fulltext index');
    } catch (error) {
      if (error.toString().includes('Index already exists')) {
        console.log('content_fulltext index already exists');
      } else {
        throw error;
      }
    }
    
    // Only create tags index if you use tags
    try {
      await databases.createIndex(
        DATABASE_ID,
        STORIES_COLLECTION_ID,
        'tags_array',
        'array',
        ['tags']
      );
      console.log('Created tags_array index');
    } catch (error) {
      if (error.toString().includes('Index already exists')) {
        console.log('tags_array index already exists');
      } else {
        throw error;
      }
    }
    
    console.log('All indexes created successfully!');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}

// Run the function
createIndexes();