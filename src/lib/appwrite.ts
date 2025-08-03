import { Client, Account, ID } from 'appwrite';
import { appConfig } from '@/config/app';

// Initialize the Appwrite client with universal configuration
const client = new Client()
    .setEndpoint(appConfig.api.appwrite.endpoint)
    .setProject(appConfig.api.appwrite.project);

// Appwrite configuration - debug logging removed for production

// Export initialized services
export const account = new Account(client);
export { ID };  // Export ID for generating unique IDs
export default client; 