// Run this script to create the missing Appwrite collections
// node setup-appwrite-collections.js

const { Client, Databases, Permission, Role } = require('appwrite');

const client = new Client()
  .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY); // You need to set this

const databases = new Databases(client);
const databaseId = process.env.VITE_APPWRITE_DATABASE_ID || '687a8ae6003b5969331a';

async function createCollections() {
  try {
    console.log('Creating alert_configs collection...');
    
    // Create alert_configs collection
    await databases.createCollection(
      databaseId,
      'alert_configs',
      'Alert Configurations',
      [
        Permission.read(Role.any()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users())
      ]
    );

    // Add attributes to alert_configs
    await databases.createStringAttribute(databaseId, 'alert_configs', 'name', 255, true);
    await databases.createStringAttribute(databaseId, 'alert_configs', 'metric', 50, true);
    await databases.createFloatAttribute(databaseId, 'alert_configs', 'threshold', true);
    await databases.createStringAttribute(databaseId, 'alert_configs', 'operator', 10, true);
    await databases.createBooleanAttribute(databaseId, 'alert_configs', 'enabled', true);
    await databases.createStringAttribute(databaseId, 'alert_configs', 'recipients', 1000, false, [], true);

    console.log('✅ alert_configs collection created successfully');

    // Create other required collections
    const collections = [
      'system_metrics',
      'alerts', 
      'performance_logs',
      'error_logs',
      'request_logs',
      'api_usage_logs'
    ];

    for (const collectionId of collections) {
      try {
        await databases.createCollection(
          databaseId,
          collectionId,
          collectionId.replace('_', ' ').toUpperCase(),
          [
            Permission.read(Role.any()),
            Permission.create(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users())
          ]
        );
        console.log(`✅ ${collectionId} collection created`);
      } catch (error) {
        if (error.code !== 409) { // Ignore if already exists
          console.error(`Failed to create ${collectionId}:`, error.message);
        }
      }
    }

    console.log('🎉 All collections created successfully!');
    
  } catch (error) {
    console.error('Failed to create collections:', error);
    
    if (error.code === 404) {
      console.error('Database not found. Please create the database first in Appwrite console.');
    } else if (error.code === 401) {
      console.error('Unauthorized. Please set APPWRITE_API_KEY environment variable.');
    }
  }
}

createCollections();