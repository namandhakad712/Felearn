import { sessionManager } from './services/sessionManager';
import { APPWRITE_CONFIG } from './config/appwrite';

/**
 * Initialize the application
 */
export const initializeApp = async () => {
  try {
    // Initialize Appwrite configuration
    APPWRITE_CONFIG.init();

    // Initialize authentication session
    const { isAuthenticated, message } = await sessionManager.initializeAuthSession();
    
    // Log initialization status (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Authentication session initialization result:', message);
    }

    return {
      isAuthenticated,
      error: null
    };
  } catch (error) {
    console.error('Application initialization error:', error);
    return {
      isAuthenticated: false,
      error
    };
  }
};

/**
 * Log application information
 */
export const logAppInfo = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`
    🚀 Felearn
    Version: ${import.meta.env.VITE_APP_VERSION || '1.0.0'}
    Environment: ${process.env.NODE_ENV}
    Build Date: ${new Date().toISOString()}
  `);
  }
}; 