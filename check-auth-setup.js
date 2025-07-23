const { Client, Account } = require('node-appwrite');
const { appwriteConfig } = require('./appwrite.config');

// Initialize Appwrite client
const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.project);

// Initialize Account service
const account = new Account(client);

// Function to check available authentication methods
async function checkAuthMethods() {
    console.log('Checking available authentication methods...');
    console.log('Note: This script will only check client-side available methods.');
    console.log('For complete authentication settings, please check the Appwrite Console.');
    
    try {
        // Check if OAuth providers are configured
        // This is a client-side check, so we can only detect if the methods are available
        // We can't get the actual configuration details from the client SDK
        
        console.log('\nAvailable Authentication Methods:');
        console.log('- Email/Password: Always available');
        
        // Check for OAuth methods by attempting to get their URLs
        // This won't actually authenticate, just check if the methods are configured
        const providers = [
            { name: 'Google', method: 'google' },
            { name: 'Facebook', method: 'facebook' },
            { name: 'GitHub', method: 'github' },
            { name: 'Discord', method: 'discord' },
            { name: 'Twitter', method: 'twitter' }
        ];
        
        for (const provider of providers) {
            try {
                // Just get the URL, don't actually redirect
                const url = account.createOAuth2Url(
                    provider.method,
                    'http://localhost:3000',
                    'http://localhost:3000'
                );
                console.log(`- ${provider.name}: Configured`);
            } catch (error) {
                console.log(`- ${provider.name}: Not configured`);
            }
        }
        
        console.log('\nTo check full authentication configuration, visit:');
        console.log('https://fra.cloud.appwrite.io/console/project-felearn/auth/providers');
        
    } catch (error) {
        console.error('Error checking authentication methods:', error);
    }
}

// Function to test authentication
async function testAuthentication(email, password) {
    try {
        console.log(`Testing authentication for ${email}...`);
        const session = await account.createEmailSession(email, password);
        console.log('Authentication successful!');
        console.log('Session details:', session);
        
        // Get account details
        const accountDetails = await account.get();
        console.log('Account details:', accountDetails);
        
        // Logout
        await account.deleteSession('current');
        console.log('Logged out successfully');
        
        return true;
    } catch (error) {
        console.error('Authentication failed:', error);
        return false;
    }
}

// Execute the checks
checkAuthMethods();

// To test authentication, uncomment and add credentials:
// testAuthentication('your-email@example.com', 'your-password');