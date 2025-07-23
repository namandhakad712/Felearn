const { Client, Databases, Users, Account } = require('node-appwrite');

// Initialize Appwrite client with Dev key
const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('felearn')
    .setDevKey('YOUR_DEV_KEY'); // Replace with your actual Dev key

// Initialize services
const databases = new Databases(client);
const users = new Users(client);
const account = new Account(client);

// Database ID from your reference file
const databaseId = '687a8ae6003b5969331a';

async function exploreAppwriteSetup() {
    try {
        console.log('=== Exploring Appwrite Setup with Dev Key ===\n');
        
        // 1. Get all collections
        console.log('Fetching collections...');
        const collectionsResponse = await databases.listCollections(databaseId);
        console.log(`Found ${collectionsResponse.total} collections`);
        
        // 2. Explore each collection in detail
        for (const collection of collectionsResponse.collections) {
            console.log(`\n=== Collection: ${collection.name} (${collection.$id}) ===`);
            
            // Get attributes
            const attributes = await databases.listAttributes(databaseId, collection.$id);
            console.log('Attributes:');
            if (attributes.total > 0) {
                attributes.attributes.forEach(attr => {
                    console.log(`- ${attr.key}: ${attr.type} ${attr.required ? '(required)' : '(optional)'}`);
                });
            } else {
                console.log('No attributes found');
            }
            
            // Get indexes
            const indexes = await databases.listIndexes(databaseId, collection.$id);
            console.log('\nIndexes:');
            if (indexes.total > 0) {
                indexes.indexes.forEach(index => {
                    console.log(`- ${index.key}: ${index.type} on [${index.attributes.join(', ')}]`);
                });
            } else {
                console.log('No indexes found');
            }
            
            // Get sample documents (limited to 5)
            try {
                const documents = await databases.listDocuments(
                    databaseId, 
                    collection.$id,
                    [
                        // Add any query parameters if needed
                    ],
                    5 // Limit to 5 documents
                );
                
                console.log(`\nSample Documents (${documents.total} total, showing up to 5):`);
                if (documents.documents.length > 0) {
                    documents.documents.forEach((doc, i) => {
                        console.log(`\nDocument ${i+1}:`);
                        // Remove internal fields for cleaner output
                        const { $id, $createdAt, $updatedAt, ...cleanDoc } = doc;
                        console.log(`ID: ${$id}`);
                        console.log(`Created: ${$createdAt}`);
                        console.log(`Updated: ${$updatedAt}`);
                        console.log('Data:', cleanDoc);
                    });
                } else {
                    console.log('No documents found');
                }
            } catch (error) {
                console.log(`Could not fetch documents: ${error.message}`);
            }
        }
        
        // 3. Check authentication methods
        console.log('\n=== Authentication Methods ===');
        console.log('Note: Dev keys allow bypassing rate limits and CORS restrictions');
        console.log('To check full authentication configuration, visit:');
        console.log('https://fra.cloud.appwrite.io/console/project-felearn/auth/providers');
        
        // 4. List users (if permissions allow)
        try {
            console.log('\n=== Users ===');
            const usersList = await users.list();
            console.log(`Total users: ${usersList.total}`);
            if (usersList.users.length > 0) {
                usersList.users.forEach((user, i) => {
                    if (i < 5) { // Show only first 5 users
                        console.log(`\nUser ${i+1}:`);
                        console.log(`ID: ${user.$id}`);
                        console.log(`Email: ${user.email}`);
                        console.log(`Name: ${user.name}`);
                        console.log(`Registration: ${user.registration}`);
                        console.log(`Status: ${user.status}`);
                    }
                });
                
                if (usersList.users.length > 5) {
                    console.log(`\n... and ${usersList.users.length - 5} more users`);
                }
            } else {
                console.log('No users found');
            }
        } catch (error) {
            console.log(`Could not fetch users: ${error.message}`);
        }
        
    } catch (error) {
        console.error('Error exploring Appwrite setup:', error);
    }
}

// Execute the exploration
exploreAppwriteSetup();