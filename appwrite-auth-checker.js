import { Client, Users, Databases, Account } from 'node-appwrite';
import fs from 'fs';

// Initialize Appwrite client
const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('felearn');

// This script can be run in two modes:
// 1. With API key (recommended for development) - bypasses rate limits and CORS restrictions
// 2. With session token (user access) - for testing authentication flows

// For development with API key (recommended)
client.setKey('5c920e77f56edc4512d3f86e67065a8240e5e43bcbfa1564d4397b46ffc314f1e21a8ea4451a348467955943d853780a2fea08c0269a32ff7769b6d48c032555cdea37df90673bed66a99e7d8dc11f68554e057a1cbee9b6ddd52d3f97a6dc5f4e73bd9d9ef9359d26a09cace415446a0f976a861a6942f4393517708a3fb546');

// For admin access with API key (alternative)
// client.setKey('YOUR_API_KEY'); 

// For user access testing (uncomment and add credentials)
// const account = new Account(client);
// async function login() {
//   try {
//     await account.createEmailSession('email@example.com', 'password');
//     console.log('Login successful');
//   } catch (error) {
//     console.error('Login failed:', error);
//   }
// }

// Initialize services
const users = new Users(client);
const databases = new Databases(client);

// Database ID from your reference file
const databaseId = '687a8ae6003b5969331a';

async function generateAuthReport() {
    const report = {
        projectDetails: {
            projectId: 'felearn',
            endpoint: 'https://fra.cloud.appwrite.io/v1',
            databaseId: databaseId,
            databaseName: 'users'
        },
        collections: {},
        authMethods: {},
        timestamp: new Date().toISOString()
    };

    try {
        // 1. Get all collections
        console.log('Fetching collections...');
        const collectionsResponse = await databases.listCollections(databaseId);
        
        // 2. For each collection, get attributes and indexes
        for (const collection of collectionsResponse.collections) {
            console.log(`Analyzing collection: ${collection.name} (${collection.$id})`);
            
            const attributes = await databases.listAttributes(databaseId, collection.$id);
            const indexes = await databases.listIndexes(databaseId, collection.$id);
            
            report.collections[collection.$id] = {
                name: collection.name,
                id: collection.$id,
                attributes: attributes,
                indexes: indexes,
                isUserCollection: collection.name.toLowerCase().includes('user') || 
                                 collection.$id.toLowerCase().includes('user')
            };
        }
        
        // 3. Save report to file
        fs.writeFileSync(
            'appwrite-auth-report.json', 
            JSON.stringify(report, null, 2)
        );
        
        console.log('\nReport generated: appwrite-auth-report.json');
        console.log('\nTo check authentication methods and settings, please visit:');
        console.log('https://fra.cloud.appwrite.io/console/project-felearn/auth/providers');
        
    } catch (error) {
        console.error('Error generating report:', error);
    }
}

// Execute the report generation
generateAuthReport();