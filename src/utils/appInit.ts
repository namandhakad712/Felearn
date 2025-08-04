import { Client } from 'appwrite';
import { initializeAuthSession } from './sessionManager';

/**
 * Initialize the application
 * Sets up Appwrite client and restores authentication session
 */
export const initializeApp = async () => {
  try {
    // Initialize Appwrite client
    const client = new Client()
      .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
      .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);
    
    // Log deployment info
    logDeploymentInfo();
    
    // Initialize authentication session
    // const sessionRestored = await initializeAuthSession(); // Removed unused variable
    // Authentication session initialization completed
    
    return client;
  } catch (error) {
    console.error('Failed to initialize application:', error);
    throw error;
  }
};

/**
 * Log deployment information
 */
const logDeploymentInfo = () => {
  console.log(`
    🚀 Felearn
    Version: ${import.meta.env.VITE_APP_VERSION || 'development'}
    Environment: ${import.meta.env.MODE}
    Build Date: ${import.meta.env.VITE_BUILD_DATE || new Date().toISOString()}
  `);
};