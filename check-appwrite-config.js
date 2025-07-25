import { Client, Databases } from 'node-appwrite';
import fs from 'fs';

// Initialize Appwrite client
const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('felearn')
    .setKey('5c920e77f56edc4512d3f86e67065a8240e5e43bcbfa1564d4397b46ffc314f1e21a8ea4451a348467955943d853780a2fea08c0269a32ff7769b6d48c032555cdea37df90673bed66a99e7d8dc11f68554e057a1cbee9b6ddd52d3f97a6dc5f4e73bd9d9ef9359d26a09cace415446a0f976a861a6942f4393517708a3fb546');

// Initialize database service
const databases = new Databases(client);

// Database ID from your reference file
const databaseId = '687a8ae6003b5969331a';

// Collection IDs
const usersCollectionId = 'users';
const storiesCollectionId = 'stories';
const adminLogsCollectionId = 'admin_logs';
const errorLogsCollectionId = 'error_logs';
const analyticsCollectionId = 'analytics';

async function checkDatabaseConfig() {
    try {
        console.log('Checking database configuration...');
        
        // Check database
        try {
            const database = await databases.get(databaseId);
            console.log(`✅ Database exists: ${database.name} (${database.$id})`);
        } catch (error) {
            console.error(`❌ Database does not exist: ${error.message}`);
        }
        
        // Check collections
        const collections = [
            { id: usersCollectionId, name: 'Users' },
            { id: storiesCollectionId, name: 'Stories' },
            { id: adminLogsCollectionId, name: 'Admin Logs' },
            { id: errorLogsCollectionId, name: 'Error Logs' },
            { id: analyticsCollectionId, name: 'Analytics' }
        ];
        
        for (const collection of collections) {
            try {
                const collectionData = await databases.getCollection(databaseId, collection.id);
                console.log(`✅ Collection exists: ${collectionData.name} (${collectionData.$id})`);
                
                // Check if name matches expected name
                if (collectionData.name !== collection.name) {
                    console.warn(`⚠️ Collection name mismatch: Expected "${collection.name}", got "${collectionData.name}"`);
                }
                
                // Check attributes
                try {
                    const attributes = await databases.listAttributes(databaseId, collection.id);
                    console.log(`  - Attributes: ${attributes.total} found`);
                    
                    // List attribute names
                    const attributeNames = attributes.attributes.map(attr => attr.key);
                    console.log(`  - Attribute names: ${attributeNames.join(', ')}`);
                } catch (attrError) {
                    console.error(`  ❌ Could not fetch attributes: ${attrError.message}`);
                }
                
                // Check indexes
                try {
                    const indexes = await databases.listIndexes(databaseId, collection.id);
                    console.log(`  - Indexes: ${indexes.total} found`);
                    
                    // List index names
                    const indexNames = indexes.indexes.map(idx => idx.key);
                    console.log(`  - Index names: ${indexNames.join(', ')}`);
                } catch (idxError) {
                    console.error(`  ❌ Could not fetch indexes: ${idxError.message}`);
                }
                
            } catch (error) {
                console.error(`❌ Collection "${collection.id}" does not exist: ${error.message}`);
            }
        }
        
        console.log('\nDatabase configuration check completed.');
        
    } catch (error) {
        console.error('Error checking database configuration:', error);
    }
}

// Run the check
checkDatabaseConfig();