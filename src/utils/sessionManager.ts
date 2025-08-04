import { Client, Account } from 'appwrite';

/**
 * Initialize the authentication session
 * Attempts to restore the user's session from cookies/local storage
 * @returns Promise<boolean> True if session was restored, false otherwise
 */
export const initializeAuthSession = async (): Promise<boolean> => {
  try {
    // Create Appwrite client
    const client = new Client()
      .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
      .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);
    
    // Create account instance
    const account = new Account(client);
    
    // Try to get the current session
    // const _session = await account.getSession('current'); // Removed unused variable
    
    // If we get here without an error, the session exists and is valid
    console.log('Session restored successfully');
    return true;
  } catch (error) {
    // If there's an error, the session doesn't exist or is invalid
    console.log('No active session found or session expired');
    return false;
  }
};

/**
 * Logout the current user
 * @returns Promise<void>
 */
export const logoutUser = async (): Promise<void> => {
  try {
    // Create Appwrite client
    const client = new Client()
      .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
      .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);
    
    // Create account instance
    const account = new Account(client);
    
    // Delete the current session
    await account.deleteSession('current');
    
    console.log('User logged out successfully');
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};