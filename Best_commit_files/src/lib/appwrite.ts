import { Client, Account, ID } from 'appwrite';
import { appConfig } from '@/config/app';

// Initialize the Appwrite client with universal configuration
const client = new Client()
    .setEndpoint(appConfig.api.appwrite.endpoint)
    .setProject(appConfig.api.appwrite.project);

// Debug: Log Appwrite configuration
console.log('🔧 Appwrite Configuration:', {
    endpoint: appConfig.api.appwrite.endpoint,
    project: appConfig.api.appwrite.project,
    environment: appConfig.environment
});

// Export initialized services
export const account = new Account(client);
export { ID };  // Export ID for generating unique IDs
export default client; 