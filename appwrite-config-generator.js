const { Client, Users, Databases } = require('node-appwrite');
const fs = require('fs');

// Initialize Appwrite client
const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('felearn')
    .setKey('YOUR_API_KEY'); // Replace with your actual API key

// Initialize Appwrite services
const users = new Users(client);
const databases = new Databases(client);

// Database ID from your reference file
const databaseId = '687a8ae6003b5969331a';

async function generateConfigFile() {
    try {
        console.log('Generating Appwrite configuration file...');
        
        // Get collections info
        const collectionsResponse = await databases.listCollections(databaseId);
        
        // Find user collection
        const userCollection = collectionsResponse.collections.find(
            c => c.name.toLowerCase().includes('user') || c.$id.toLowerCase() === 'users'
        );
        
        // Find other important collections
        const analyticsCollection = collectionsResponse.collections.find(
            c => c.name.toLowerCase().includes('analytics') || c.$id.toLowerCase() === 'analytics'
        );
        
        const errorLogsCollection = collectionsResponse.collections.find(
            c => c.name.toLowerCase().includes('error') || c.$id.toLowerCase() === 'error_logs'
        );
        
        const storiesCollection = collectionsResponse.collections.find(
            c => c.name.toLowerCase().includes('stories') || c.$id.toLowerCase() === 'stories'
        );
        
        // Generate configuration
        const config = {
            endpoint: 'https://fra.cloud.appwrite.io/v1',
            project: 'felearn',
            database: {
                id: databaseId,
                name: 'users'
            },
            collections: {
                users: userCollection ? {
                    id: userCollection.$id,
                    name: userCollection.name
                } : null,
                analytics: analyticsCollection ? {
                    id: analyticsCollection.$id,
                    name: analyticsCollection.name
                } : null,
                errorLogs: errorLogsCollection ? {
                    id: errorLogsCollection.$id,
                    name: errorLogsCollection.name
                } : null,
                stories: storiesCollection ? {
                    id: storiesCollection.$id,
                    name: storiesCollection.name
                } : null
            }
        };
        
        // Write configuration to file
        fs.writeFileSync(
            'appwrite.config.js',
            `// Appwrite Configuration
// Generated on: ${new Date().toISOString()}

export const appwriteConfig = ${JSON.stringify(config, null, 2)};
`
        );
        
        console.log('Configuration file generated: appwrite.config.js');
        console.log('\nTo use this configuration in your application:');
        console.log('1. Import the configuration:');
        console.log('   import { appwriteConfig } from \'./appwrite.config.js\';');
        console.log('2. Initialize the Appwrite client:');
        console.log('   const client = new Client()');
        console.log('     .setEndpoint(appwriteConfig.endpoint)');
        console.log('     .setProject(appwriteConfig.project);');
        
    } catch (error) {
        console.error('Error generating configuration:', error);
    }
}

generateConfigFile();