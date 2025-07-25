// Run this script to create the missing Appwrite collections
// node create-appwrite-collections.js

const { Client, Databases, Permission, Role } = require('node-appwrite');
require('dotenv').config();

// Get environment variables from .env file or use defaults
const endpoint = process.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const projectId = process.env.VITE_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.VITE_APPWRITE_DATABASE_ID || '687a8ae6003b5969331a';

if (!projectId) {
  console.error('❌ Error: VITE_APPWRITE_PROJECT_ID is required');
  process.exit(1);
}

if (!apiKey) {
  console.error('❌ Error: APPWRITE_API_KEY is required');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

// Collections to create
const collections = [
  {
    id: 'error_logs',
    name: 'Error Logs',
    attributes: [
      { name: 'message', type: 'string', size: 2000, required: true },
      { name: 'stack', type: 'string', size: 5000, required: false },
      { name: 'context', type: 'string', size: 5000, required: false },
      { name: 'timestamp', type: 'string', size: 50, required: true },
      { name: 'userAgent', type: 'string', size: 500, required: false },
      { name: 'url', type: 'string', size: 500, required: false }
    ]
  },
  {
    id: 'alert_configs',
    name: 'Alert Configurations',
    attributes: [
      { name: 'name', type: 'string', size: 255, required: true },
      { name: 'metric', type: 'string', size: 50, required: true },
      { name: 'threshold', type: 'double', required: true },
      { name: 'operator', type: 'string', size: 10, required: true },
      { name: 'enabled', type: 'boolean', required: true },
      { name: 'recipients', type: 'string', size: 1000, required: false, array: true }
    ]
  },
  {
    id: 'system_metrics',
    name: 'System Metrics',
    attributes: [
      { name: 'timestamp', type: 'string', size: 50, required: true },
      { name: 'responseTime', type: 'double', required: true },
      { name: 'errorRate', type: 'double', required: true },
      { name: 'activeUsers', type: 'integer', required: true },
      { name: 'storiesGenerated', type: 'integer', required: true },
      { name: 'apiUsage', type: 'integer', required: true }
    ]
  },
  {
    id: 'alerts',
    name: 'Alerts',
    attributes: [
      { name: 'configId', type: 'string', size: 36, required: true },
      { name: 'message', type: 'string', size: 500, required: true },
      { name: 'severity', type: 'string', size: 20, required: true },
      { name: 'timestamp', type: 'string', size: 50, required: true },
      { name: 'resolved', type: 'boolean', required: true },
      { name: 'resolvedAt', type: 'string', size: 50, required: false }
    ]
  },
  {
    id: 'performance_logs',
    name: 'Performance Logs',
    attributes: [
      { name: 'page', type: 'string', size: 255, required: true },
      { name: 'loadTime', type: 'double', required: true },
      { name: 'timestamp', type: 'string', size: 50, required: true },
      { name: 'userAgent', type: 'string', size: 500, required: false }
    ]
  },
  {
    id: 'request_logs',
    name: 'Request Logs',
    attributes: [
      { name: 'path', type: 'string', size: 500, required: true },
      { name: 'method', type: 'string', size: 10, required: true },
      { name: 'status', type: 'integer', required: true },
      { name: 'duration', type: 'double', required: true },
      { name: 'timestamp', type: 'string', size: 50, required: true },
      { name: 'userAgent', type: 'string', size: 500, required: false }
    ]
  },
  {
    id: 'api_usage_logs',
    name: 'API Usage Logs',
    attributes: [
      { name: 'endpoint', type: 'string', size: 500, required: true },
      { name: 'method', type: 'string', size: 10, required: true },
      { name: 'userId', type: 'string', size: 36, required: false },
      { name: 'timestamp', type: 'string', size: 50, required: true }
    ]
  }
];

async function createCollections() {
  console.log(`🔍 Checking for database ${databaseId}...`);
  
  try {
    // First check if database exists
    try {
      await databases.get(databaseId);
      console.log(`✅ Database ${databaseId} exists`);
    } catch (error) {
      if (error.code === 404) {
        console.log(`⚠️ Database ${databaseId} not found, creating it...`);
        await databases.create(databaseId, 'Monitoring Database');
        console.log(`✅ Database ${databaseId} created`);
      } else {
        throw error;
      }
    }
    
    // Create collections
    for (const collection of collections) {
      try {
        console.log(`🔍 Checking for collection ${collection.id}...`);
        
        try {
          await databases.getCollection(databaseId, collection.id);
          console.log(`✅ Collection ${collection.id} already exists`);
        } catch (error) {
          if (error.code === 404) {
            console.log(`⚠️ Collection ${collection.id} not found, creating it...`);
            
            // Create collection
            await databases.createCollection(
              databaseId,
              collection.id,
              collection.name,
              [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
              ]
            );
            
            console.log(`✅ Collection ${collection.id} created`);
            
            // Create attributes
            for (const attr of collection.attributes) {
              console.log(`  ➕ Creating attribute ${attr.name}...`);
              
              try {
                if (attr.type === 'string') {
                  await databases.createStringAttribute(
                    databaseId,
                    collection.id,
                    attr.name,
                    attr.size,
                    attr.required,
                    null,
                    attr.array || false
                  );
                } else if (attr.type === 'integer') {
                  await databases.createIntegerAttribute(
                    databaseId,
                    collection.id,
                    attr.name,
                    attr.required,
                    null,
                    null,
                    attr.array || false
                  );
                } else if (attr.type === 'double') {
                  await databases.createFloatAttribute(
                    databaseId,
                    collection.id,
                    attr.name,
                    attr.required,
                    null,
                    null,
                    attr.array || false
                  );
                } else if (attr.type === 'boolean') {
                  await databases.createBooleanAttribute(
                    databaseId,
                    collection.id,
                    attr.name,
                    attr.required,
                    null,
                    attr.array || false
                  );
                }
                
                console.log(`  ✅ Attribute ${attr.name} created`);
              } catch (attrError) {
                if (attrError.code === 409) {
                  console.log(`  ℹ️ Attribute ${attr.name} already exists`);
                } else {
                  console.error(`  ❌ Failed to create attribute ${attr.name}:`, attrError);
                }
              }
            }
            
            // Wait for attributes to be ready
            console.log(`  ⏳ Waiting for attributes to be ready...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          } else {
            throw error;
          }
        }
      } catch (collectionError) {
        console.error(`❌ Error with collection ${collection.id}:`, collectionError);
      }
    }
    
    console.log('🎉 All collections created successfully!');
    
  } catch (error) {
    console.error('❌ Failed to create collections:', error);
    
    if (error.code === 401) {
      console.error('❌ Unauthorized. Please check your API key.');
    }
  }
}

createCollections();