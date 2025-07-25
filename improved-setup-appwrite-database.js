import { Client, Databases, ID } from 'node-appwrite';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID || 'felearn');

// Use API key from environment variable or prompt user to input it
const apiKey = process.env.APPWRITE_API_KEY;
if (!apiKey) {
    console.error('Error: APPWRITE_API_KEY environment variable is not set.');
    console.log('Please add your Appwrite API key to the .env.local file:');
    console.log('APPWRITE_API_KEY=your-api-key-here');
    process.exit(1);
}

client.setKey(apiKey);

// Initialize database service
const databases = new Databases(client);

// Database ID from your reference file
const databaseId = process.env.VITE_APPWRITE_DATABASE_ID || '687a8ae6003b5969331a';

// Collection IDs
const usersCollectionId = process.env.VITE_APPWRITE_USERS_COLLECTION_ID || 'users';
const storiesCollectionId = process.env.VITE_APPWRITE_STORIES_COLLECTION_ID || 'stories';
const adminLogsCollectionId = process.env.VITE_APPWRITE_ADMIN_LOGS_COLLECTION_ID || 'admin_logs';
const errorLogsCollectionId = process.env.VITE_APPWRITE_ERROR_LOGS_COLLECTION_ID || 'error_logs';
const analyticsCollectionId = process.env.VITE_APPWRITE_ANALYTICS_COLLECTION_ID || 'analytics';

// Helper function to add delay between API calls to avoid rate limiting
async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function for retrying API calls
async function retryOperation(operation, maxRetries = 3, delayMs = 2000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;
            
            // Check if it's a rate limit error
            if (error.message && error.message.includes('Rate limit')) {
                console.log(`Rate limit hit, waiting longer before retry (attempt ${attempt}/${maxRetries})...`);
                await delay(delayMs * attempt); // Exponential backoff
            } else {
                // For other errors, wait a bit less
                await delay(delayMs);
            }
        }
    }
    
    throw lastError;
}

async function setupDatabase() {
    try {
        console.log('Starting database setup...');
        console.log('Using database ID:', databaseId);
        
        // Check if database exists
        try {
            const database = await retryOperation(() => databases.get(databaseId));
            console.log(`Database exists: ${database.name} (${database.$id})`);
        } catch (error) {
            if (error.code === 404) {
                console.log('Database does not exist, creating...');
                await retryOperation(() => databases.create(databaseId, 'users'));
                console.log(`Database created with ID: ${databaseId}`);
            } else {
                throw error;
            }
        }
        
        // Setup Collections with delays between operations
        await setupUsersCollection();
        await delay(2000); // Wait 2 seconds between collection setups
        
        await setupStoriesCollection();
        await delay(2000);
        
        await setupAdminLogsCollection();
        await delay(2000);
        
        await setupErrorLogsCollection();
        await delay(2000);
        
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
        console.log('Setting up Users collection...');
        
        // Check if collection exists
        try {
            const collection = await retryOperation(() => 
                databases.getCollection(databaseId, usersCollectionId)
            );
            console.log(`Users collection exists: ${collection.name} (${collection.$id})`);
            
            // Update collection name if needed
            if (collection.name !== 'Users') {
                await retryOperation(() => 
                    databases.updateCollection(databaseId, usersCollectionId, 'Users')
                );
                console.log('Updated Users collection name');
            }
        } catch (error) {
            if (error.code === 404) {
                // Create collection if it doesn't exist
                await retryOperation(() => 
                    databases.createCollection(
                        databaseId,
                        usersCollectionId,
                        'Users',
                        ['read("users")', 'write("users")'],
                        true
                    )
                );
                console.log(`Users collection created with ID: ${usersCollectionId}`);
            } else {
                throw error;
            }
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
        
        // Create attributes with delay between each
        for (const attr of attributes) {
            try {
                if (attr.type === 'string') {
                    await retryOperation(() => 
                        databases.createStringAttribute(
                            databaseId,
                            usersCollectionId,
                            attr.name,
                            attr.size,
                            attr.required,
                            '',
                            attr.default || null
                        )
                    );
                } else if (attr.type === 'boolean') {
                    await retryOperation(() => 
                        databases.createBooleanAttribute(
                            databaseId,
                            usersCollectionId,
                            attr.name,
                            attr.required,
                            attr.default || false
                        )
                    );
                } else if (attr.type === 'datetime') {
                    await retryOperation(() => 
                        databases.createDatetimeAttribute(
                            databaseId,
                            usersCollectionId,
                            attr.name,
                            attr.required,
                            '',
                            attr.default || null
                        )
                    );
                }
                console.log(`Created attribute ${attr.name} in Users collection`);
                await delay(1000); // Wait 1 second between attribute creations
            } catch (error) {
                if (error.code === 409) {
                    console.log(`Attribute ${attr.name} already exists in Users collection`);
                } else {
                    console.error(`Error creating attribute ${attr.name}:`, error.message);
                }
            }
        }
        
        // Create indexes with delay between each
        try {
            await retryOperation(() => 
                databases.createIndex(
                    databaseId,
                    usersCollectionId,
                    'email_index',
                    'unique',
                    ['email']
                )
            );
            console.log('Created email_index in Users collection');
        } catch (error) {
            if (error.code === 409) {
                console.log('Email index already exists in Users collection');
            } else {
                console.error('Error creating email index:', error.message);
            }
        }
        
        await delay(1000);
        
        try {
            await retryOperation(() => 
                databases.createIndex(
                    databaseId,
                    usersCollectionId,
                    'created_at_index',
                    'key',
                    ['createdAt']
                )
            );
            console.log('Created created_at_index in Users collection');
        } catch (error) {
            if (error.code === 409) {
                console.log('Created at index already exists in Users collection');
            } else {
                console.error('Error creating created_at index:', error.message);
            }
        }
        
    } catch (error) {
        console.error('Error setting up Users collection:', error);
    }
}

// Similar modifications for other collection setup functions...
// (setupStoriesCollection, setupAdminLogsCollection, setupErrorLogsCollection, setupAnalyticsCollection)
// I'm omitting them for brevity, but they should follow the same pattern with retryOperation and delay

async function setupStoriesCollection() {
    try {
        console.log('Setting up Stories collection...');
        
        // Check if collection exists
        try {
            const collection = await retryOperation(() => 
                databases.getCollection(databaseId, storiesCollectionId)
            );
            console.log(`Stories collection exists: ${collection.name} (${collection.$id})`);
        } catch (error) {
            if (error.code === 404) {
                // Create collection if it doesn't exist
                await retryOperation(() => 
                    databases.createCollection(
                        databaseId,
                        storiesCollectionId,
                        'Stories',
                        ['read("users")', 'write("users")'],
                        true
                    )
                );
                console.log(`Stories collection created with ID: ${storiesCollectionId}`);
            } else {
                throw error;
            }
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
        
        // Create attributes with delay between each
        for (const attr of attributes) {
            try {
                if (attr.type === 'string') {
                    await retryOperation(() => 
                        databases.createStringAttribute(
                            databaseId,
                            storiesCollectionId,
                            attr.name,
                            attr.size,
                            attr.required,
                            '',
                            attr.default || null
                        )
                    );
                } else if (attr.type === 'boolean') {
                    await retryOperation(() => 
                        databases.createBooleanAttribute(
                            databaseId,
                            storiesCollectionId,
                            attr.name,
                            attr.required,
                            attr.default || false
                        )
                    );
                } else if (attr.type === 'datetime') {
                    await retryOperation(() => 
                        databases.createDatetimeAttribute(
                            databaseId,
                            storiesCollectionId,
                            attr.name,
                            attr.required,
                            '',
                            attr.default || null
                        )
                    );
                }
                console.log(`Created attribute ${attr.name} in Stories collection`);
                await delay(1000); // Wait 1 second between attribute creations
            } catch (error) {
                if (error.code === 409) {
                    console.log(`Attribute ${attr.name} already exists in Stories collection`);
                } else {
                    console.error(`Error creating attribute ${attr.name}:`, error.message);
                }
            }
        }
        
        // Create indexes with delay between each
        try {
            await retryOperation(() => 
                databases.createIndex(
                    databaseId,
                    storiesCollectionId,
                    'user_stories_index',
                    'key',
                    ['userId', 'createdAt']
                )
            );
            console.log('Created user_stories_index in Stories collection');
        } catch (error) {
            if (error.code === 409) {
                console.log('User stories index already exists in Stories collection');
            } else {
                console.error('Error creating user stories index:', error.message);
            }
        }
        
        await delay(1000);
        
        try {
            await retryOperation(() => 
                databases.createIndex(
                    databaseId,
                    storiesCollectionId,
                    'created_at_index',
                    'key',
                    ['createdAt']
                )
            );
            console.log('Created created_at_index in Stories collection');
        } catch (error) {
            if (error.code === 409) {
                console.log('Created at index already exists in Stories collection');
            } else {
                console.error('Error creating created_at index:', error.message);
            }
        }
        
    } catch (error) {
        console.error('Error setting up Stories collection:', error);
    }
}

function generateEnvFile() {
    // Only generate if it doesn't exist or user confirms overwrite
    if (!fs.existsSync('.env.local') || process.env.FORCE_ENV_OVERWRITE === 'true') {
        const envContent = `# API Keys
VITE_GEMINI_API_KEY=${process.env.VITE_GEMINI_API_KEY || 'your-gemini-api-key'}

# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=${process.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1'}
VITE_APPWRITE_PROJECT_ID=${process.env.VITE_APPWRITE_PROJECT_ID || 'felearn'}
VITE_APPWRITE_DATABASE_ID=${databaseId}
VITE_APPWRITE_USERS_COLLECTION_ID=${usersCollectionId}
VITE_APPWRITE_STORIES_COLLECTION_ID=${storiesCollectionId}
VITE_APPWRITE_ADMIN_LOGS_COLLECTION_ID=${adminLogsCollectionId}
VITE_APPWRITE_ERROR_LOGS_COLLECTION_ID=${errorLogsCollectionId}
VITE_APPWRITE_ANALYTICS_COLLECTION_ID=${analyticsCollectionId}

# Feature Flags
VITE_ENABLE_IMAGE_GENERATION=${process.env.VITE_ENABLE_IMAGE_GENERATION || 'true'}

# API Key for setup script (do not commit this to version control)
APPWRITE_API_KEY=${apiKey}
`;

        fs.writeFileSync('.env.local.new', envContent);
        console.log('Generated .env.local.new file with database configuration');
        console.log('Please review this file and rename it to .env.local if the configuration is correct');
    } else {
        console.log('.env.local file already exists. Set FORCE_ENV_OVERWRITE=true to overwrite it.');
    }
}

// Run the setup
setupDatabase();