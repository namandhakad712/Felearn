const { Client, Users, Databases } = require('node-appwrite');

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

async function fetchAuthenticationDetails() {
    try {
        // Fetch users collection details
        const userCollections = await databases.listCollections(databaseId, [
            'userCreation=true'
        ]);
        
        console.log('=== Authentication Collections ===');
        console.log(JSON.stringify(userCollections, null, 2));
        
        // Fetch user collection attributes
        if (userCollections.total > 0) {
            for (const collection of userCollections.collections) {
                console.log(`\n=== Attributes for ${collection.name} ===`);
                const attributes = await databases.listAttributes(databaseId, collection.$id);
                console.log(JSON.stringify(attributes, null, 2));
            }
        }
        
        // Fetch authentication settings
        console.log('\n=== Authentication Methods ===');
        // Note: This requires appropriate permissions
        // You might need to use the Appwrite Console to view these details
        
    } catch (error) {
        console.error('Error fetching Appwrite details:', error);
    }
}

fetchAuthenticationDetails();