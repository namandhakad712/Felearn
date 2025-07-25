import { Client, Databases, ID } from 'node-appwrite';
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

async function setupDatabase() {
    try {
        console.log('Starting database setup...');
        
        // Check if database exists
        try {
            const database = await databases.get(databaseId);
            console.log(`Database exists: ${database.name} (${database.$id})`);
        } catch (error) {
            console.log('Database does not exist, creating...');
            await databases.create(databaseId, 'users');
            console.log(`Database created with ID: ${databaseId}`);
        }
        
        // Setup Users Collection
        await setupUsersCollection();
        
        // Setup Stories Collection
        await setupStoriesCollection();
        
        // Setup Admin Logs Collection
        await setupAdminLogsCollection();
        
        // Setup Error Logs Collection
        await setupErrorLogsCollection();
        
        // Setup Analytics Collection
        await setupAnalyticsCollection();
        
        console.log('Database setup completed successfully!');
        
        // Generate .env.local file with the correct values
        generateEnvFile();
        
    } catch (error) {
        console.error('Error setting up database:', error);
    }
}

async function setupUsersCollection() {
    try {
        // Check if collection exists
        try {
            const collection = await databases.getCollection(databaseId, usersCollectionId);
            console.log(`Users collection exists: ${collection.name} (${collection.$id})`);
            
            // Update collection name if needed
            if (collection.name !== 'Users') {
                await databases.updateCollection(databaseId, usersCollectionId, 'Users');
                console.log('Updated Users collection name');
            }
        } catch (error) {
            // Create collection if it doesn't exist
            await databases.createCollection(
                databaseId,
                usersCollectionId,
                'Users',
                ['read("users")', 'write("users")'],
                true
            );
            console.log(`Users collection created with ID: ${usersCollectionId}`);
        }
        
        // Add required attributes
        const attributes = [
            { name: 'email', type: 'string', size: 255, required: true },
            { name: 'geminiKey', type: 'string', size: 1000, required: false },
            { name: 'settings', type: 'string', size: 2000, required: false },
            { name: 'isAdmin', type: 'boolean', required: false, default: false },
            { name: 'createdAt', type: 'datetime', required: true },
            { name: 'lastLogin', type: 'datetime', required: false },
            { name: 'name', type: 'string', size: 255, required: false },
            { name: 'bio', type: 'string', size: 1000, required: false },
            { name: 'oauthProvider', type: 'string', size: 255, required: false },
            { name: 'emailVerification', type: 'boolean', required: false },
            { name: 'disabled', type: 'boolean', required: false }
        ];
        
        // Create attributes
        for (const attr of attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(
                        databaseId,
                        usersCollectionId,
                        attr.name,
                        attr.size,
                        attr.required,
                        '',
                        attr.default || null
                    );
                } else if (attr.type === 'boolean') {
                    await databases.createBooleanAttribute(
                        databaseId,
                        usersCollectionId,
                        attr.name,
                        attr.required,
                        attr.default || false
                    );
                } else if (attr.type === 'datetime') {
                    await databases.createDatetimeAttribute(
                        databaseId,
                        usersCollectionId,
                        attr.name,
                        attr.required,
                        '',
                        attr.default || null
                    );
                }
                console.log(`Created attribute ${attr.name} in Users collection`);
            } catch (error) {
                console.log(`Attribute ${attr.name} already exists or error:`, error.message);
            }
        }
        
        // Create indexes
        try {
            await databases.createIndex(
                databaseId,
                usersCollectionId,
                'email_index',
                'unique',
                ['email']
            );
            console.log('Created email_index in Users collection');
        } catch (error) {
            console.log('Email index already exists or error:', error.message);
        }
        
        try {
            await databases.createIndex(
                databaseId,
                usersCollectionId,
                'created_at_index',
                'key',
                ['createdAt']
            );
            console.log('Created created_at_index in Users collection');
        } catch (error) {
            console.log('Created at index already exists or error:', error.message);
        }
        
    } catch (error) {
        console.error('Error setting up Users collection:', error);
    }
}

async function setupStoriesCollection() {
    try {
        // Check if collection exists
        try {
            const collection = await databases.getCollection(databaseId, storiesCollectionId);
            console.log(`Stories collection exists: ${collection.name} (${collection.$id})`);
        } catch (error) {
            // Create collection if it doesn't exist
            await databases.createCollection(
                databaseId,
                storiesCollectionId,
                'Stories',
                ['read("users")', 'write("users")'],
                true
            );
            console.log(`Stories collection created with ID: ${storiesCollectionId}`);
        }
        
        // Add required attributes
        const attributes = [
            { name: 'userId', type: 'string', size: 255, required: true },
            { name: 'title', type: 'string', size: 500, required: true },
            { name: 'content', type: 'string', size: 10000, required: true },
            { name: 'images', type: 'string', size: 2000, required: false },
            { name: 'isPinned', type: 'boolean', required: false, default: false },
            { name: 'createdAt', type: 'datetime', required: true },
            { name: 'tags', type: 'string', size: 1000, required: false }
        ];
        
        // Create attributes
        for (const attr of attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(
                        databaseId,
                        storiesCollectionId,
                        attr.name,
                        attr.size,
                        attr.required,
                        '',
                        attr.default || null
                    );
                } else if (attr.type === 'boolean') {
                    await databases.createBooleanAttribute(
                        databaseId,
                        storiesCollectionId,
                        attr.name,
                        attr.required,
                        attr.default || false
                    );
                } else if (attr.type === 'datetime') {
                    await databases.createDatetimeAttribute(
                        databaseId,
                        storiesCollectionId,
                        attr.name,
                        attr.required,
                        '',
                        attr.default || null
                    );
                }
                console.log(`Created attribute ${attr.name} in Stories collection`);
            } catch (error) {
                console.log(`Attribute ${attr.name} already exists or error:`, error.message);
            }
        }
        
        // Create indexes
        try {
            await databases.createIndex(
                databaseId,
                storiesCollectionId,
                'user_stories_index',
                'key',
                ['userId', 'createdAt']
            );
            console.log('Created user_stories_index in Stories collection');
        } catch (error) {
            console.log('User stories index already exists or error:', error.message);
        }
        
        try {
            await databases.createIndex(
                databaseId,
                storiesCollectionId,
                'created_at_index',
                'key',
                ['createdAt']
            );
            console.log('Created created_at_index in Stories collection');
        } catch (error) {
            console.log('Created at index already exists or error:', error.message);
        }
        
    } catch (error) {
        console.error('Error setting up Stories collection:', error);
    }
}

async function setupAdminLogsCollection() {
    try {
        // Check if collection exists
        try {
            const collection = await databases.getCollection(databaseId, adminLogsCollectionId);
            console.log(`Admin Logs collection exists: ${collection.name} (${collection.$id})`);
        } catch (error) {
            // Create collection if it doesn't exist
            await databases.createCollection(
                databaseId,
                adminLogsCollectionId,
                'Admin Logs',
                ['read("admins")', 'write("admins")'],
                false
            );
            console.log(`Admin Logs collection created with ID: ${adminLogsCollectionId}`);
        }
        
        // Add required attributes
        const attributes = [
            { name: 'action', type: 'string', size: 255, required: true },
            { name: 'adminId', type: 'string', size: 255, required: true },
            { name: 'details', type: 'string', size: 5000, required: false },
            { name: 'timestamp', type: 'datetime', required: true }
        ];
        
        // Create attributes
        for (const attr of attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(
                        databaseId,
                        adminLogsCollectionId,
                        attr.name,
                        attr.size,
                        attr.required,
                        '',
                        attr.default || null
                    );
                } else if (attr.type === 'datetime') {
                    await databases.createDatetimeAttribute(
                        databaseId,
                        adminLogsCollectionId,
                        attr.name,
                        attr.required,
                        '',
                        attr.default || null
                    );
                }
                console.log(`Created attribute ${attr.name} in Admin Logs collection`);
            } catch (error) {
                console.log(`Attribute ${attr.name} already exists or error:`, error.message);
            }
        }
        
        // Create indexes
        try {
            await databases.createIndex(
                databaseId,
                adminLogsCollectionId,
                'timestamp_index',
                'key',
                ['timestamp']
            );
            console.log('Created timestamp_index in Admin Logs collection');
        } catch (error) {
            console.log('Timestamp index already exists or error:', error.message);
        }
        
    } catch (error) {
        console.error('Error setting up Admin Logs collection:', error);
    }
}

async function setupErrorLogsCollection() {
    try {
        // Check if collection exists
        try {
            const collection = await databases.getCollection(databaseId, errorLogsCollectionId);
            console.log(`Error Logs collection exists: ${collection.name} (${collection.$id})`);
        } catch (error) {
            // Create collection if it doesn't exist
            await databases.createCollection(
                databaseId,
                errorLogsCollectionId,
                'Error Logs',
                ['read("admins")', 'write("users")'],
                false
            );
            console.log(`Error Logs collection created with ID: ${errorLogsCollectionId}`);
        }
        
        // Add required attributes
        const attributes = [
            { name: 'type', type: 'string', size: 50, required: true },
            { name: 'message', type: 'string', size: 1000, required: true },
            { name: 'stack', type: 'string', size: 5000, required: false },
            { name: 'userId', type: 'string', size: 255, required: false },
            { name: 'context', type: 'string', size: 2000, required: false },
            { name: 'severity', type: 'string', size: 20, required: true },
            { name: 'resolved', type: 'boolean', required: false, default: false },
            { name: 'timestamp', type: 'datetime', required: true }
        ];
        
        // Create attributes
        for (const attr of attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(
                        databaseId,
                        errorLogsCollectionId,
                        attr.name,
                        attr.size,
                        attr.required,
                        '',
                        attr.default || null
                    );
                } else if (attr.type === 'boolean') {
                    await databases.createBooleanAttribute(
                        databaseId,
                        errorLogsCollectionId,
                        attr.name,
                        attr.required,
                        attr.default || false
                    );
                } else if (attr.type === 'datetime') {
                    await databases.createDatetimeAttribute(
                        databaseId,
                        errorLogsCollectionId,
                        attr.name,
                        attr.required,
                        '',
                        attr.default || null
                    );
                }
                console.log(`Created attribute ${attr.name} in Error Logs collection`);
            } catch (error) {
                console.log(`Attribute ${attr.name} already exists or error:`, error.message);
            }
        }
        
        // Create indexes
        try {
            await databases.createIndex(
                databaseId,
                errorLogsCollectionId,
                'timestamp_index',
                'key',
                ['timestamp']
            );
            console.log('Created timestamp_index in Error Logs collection');
        } catch (error) {
            console.log('Timestamp index already exists or error:', error.message);
        }
        
        try {
            await databases.createIndex(
                databaseId,
                errorLogsCollectionId,
                'severity_index',
                'key',
                ['severity']
            );
            console.log('Created severity_index in Error Logs collection');
        } catch (error) {
            console.log('Severity index already exists or error:', error.message);
        }
        
    } catch (error) {
        console.error('Error setting up Error Logs collection:', error);
    }
}

async function setupAnalyticsCollection() {
    try {
        // Check if collection exists
        try {
            const collection = await databases.getCollection(databaseId, analyticsCollectionId);
            console.log(`Analytics collection exists: ${collection.name} (${collection.$id})`);
        } catch (error) {
            // Create collection if it doesn't exist
            await databases.createCollection(
                databaseId,
                analyticsCollectionId,
                'Analytics',
                ['read("admins")', 'write("users")'],
                false
            );
            console.log(`Analytics collection created with ID: ${analyticsCollectionId}`);
        }
        
        // Add required attributes
        const attributes = [
            { name: 'eventId', type: 'string', size: 255, required: true },
            { name: 'userId', type: 'string', size: 255, required: false },
            { name: 'eventType', type: 'string', size: 100, required: true },
            { name: 'resourceId', type: 'string', size: 255, required: false },
            { name: 'resourceType', type: 'string', size: 100, required: false },
            { name: 'timestamp', type: 'datetime', required: true },
            { name: 'metadata', type: 'string', size: 2000, required: false }
        ];
        
        // Create attributes
        for (const attr of attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(
                        databaseId,
                        analyticsCollectionId,
                        attr.name,
                        attr.size,
                        attr.required,
                        '',
                        attr.default || null
                    );
                } else if (attr.type === 'datetime') {
                    await databases.createDatetimeAttribute(
                        databaseId,
                        analyticsCollectionId,
                        attr.name,
                        attr.required,
                        '',
                        attr.default || null
                    );
                }
                console.log(`Created attribute ${attr.name} in Analytics collection`);
            } catch (error) {
                console.log(`Attribute ${attr.name} already exists or error:`, error.message);
            }
        }
        
        // Create indexes
        try {
            await databases.createIndex(
                databaseId,
                analyticsCollectionId,
                'timestamp_index',
                'key',
                ['timestamp']
            );
            console.log('Created timestamp_index in Analytics collection');
        } catch (error) {
            console.log('Timestamp index already exists or error:', error.message);
        }
        
        try {
            await databases.createIndex(
                databaseId,
                analyticsCollectionId,
                'user_events_index',
                'key',
                ['userId', 'timestamp']
            );
            console.log('Created user_events_index in Analytics collection');
        } catch (error) {
            console.log('User events index already exists or error:', error.message);
        }
        
        try {
            await databases.createIndex(
                databaseId,
                analyticsCollectionId,
                'event_type_index',
                'key',
                ['eventType']
            );
            console.log('Created event_type_index in Analytics collection');
        } catch (error) {
            console.log('Event type index already exists or error:', error.message);
        }
        
    } catch (error) {
        console.error('Error setting up Analytics collection:', error);
    }
}

function generateEnvFile() {
    const envContent = `# API Keys
VITE_GEMINI_API_KEY=your-gemini-api-key

# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=felearn
VITE_APPWRITE_DATABASE_ID=${databaseId}
VITE_APPWRITE_USERS_COLLECTION_ID=${usersCollectionId}
VITE_APPWRITE_STORIES_COLLECTION_ID=${storiesCollectionId}
VITE_APPWRITE_ADMIN_LOGS_COLLECTION_ID=${adminLogsCollectionId}
VITE_APPWRITE_ERROR_LOGS_COLLECTION_ID=${errorLogsCollectionId}

# Feature Flags
VITE_ENABLE_IMAGE_GENERATION=true
`;

    fs.writeFileSync('.env.local', envContent);
    console.log('Generated .env.local file with database configuration');
}

// Run the setup
setupDatabase();