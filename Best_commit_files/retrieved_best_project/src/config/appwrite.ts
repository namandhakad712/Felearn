/**
 * Get environment variable with validation
 */
const getEnvVar = (key: string, fallback?: string): string => {
  const value = import.meta.env[key];
  if (!value && !fallback) {
    console.error(`Missing required environment variable: ${key}`);
    throw new Error(`Environment variable ${key} is required`);
  }
  return value || fallback || '';
};

/**
 * Check if environment variables are set
 */
const validateEnvVars = (): void => {
  const requiredVars = [
    'VITE_APPWRITE_ENDPOINT',
    'VITE_APPWRITE_PROJECT_ID',
    'VITE_APPWRITE_DATABASE_ID'
  ];

  for (const varName of requiredVars) {
    if (!import.meta.env[varName]) {
      console.error(`Missing required environment variable: ${varName}`);
      throw new Error(`Environment variable ${varName} is required for Appwrite configuration`);
    }
  }
};

/**
 * Appwrite configuration
 */
export const APPWRITE_CONFIG = {
  // Validate environment variables
  init: () => validateEnvVars(),

  // Core configuration
  endpoint: getEnvVar('VITE_APPWRITE_ENDPOINT', 'https://cloud.appwrite.io/v1'),
  projectId: getEnvVar('VITE_APPWRITE_PROJECT_ID'),
  databaseId: getEnvVar('VITE_APPWRITE_DATABASE_ID'),

  // Collections
  collections: {
    users: getEnvVar('VITE_APPWRITE_USERS_COLLECTION_ID', 'users'),
    stories: getEnvVar('VITE_APPWRITE_STORIES_COLLECTION_ID', 'stories'),
    adminLogs: getEnvVar('VITE_APPWRITE_ADMIN_LOGS_COLLECTION_ID', 'admin_logs'),
    errorLogs: getEnvVar('VITE_APPWRITE_ERROR_LOGS_COLLECTION_ID', 'error_logs'),
  },

  // Storage buckets
  buckets: {
    storyImages: getEnvVar('VITE_APPWRITE_STORY_IMAGES_BUCKET_ID', 'story-images'),
  },

  // Authentication settings
  auth: {
    // Session duration in seconds (default: 24 hours)
    sessionDuration: parseInt(getEnvVar('VITE_APPWRITE_SESSION_DURATION', '86400')),

    // Email verification settings
    emailVerification: getEnvVar('VITE_APPWRITE_EMAIL_VERIFICATION', 'true') === 'true',

    // OAuth providers
    oauthProviders: ['google', 'github'],

    // Password requirements
    passwordMinLength: 8,

    // Rate limiting (attempts per hour)
    rateLimit: {
      login: parseInt(getEnvVar('VITE_APPWRITE_RATE_LIMIT_LOGIN', '10')),
      register: parseInt(getEnvVar('VITE_APPWRITE_RATE_LIMIT_REGISTER', '5')),
      passwordReset: parseInt(getEnvVar('VITE_APPWRITE_RATE_LIMIT_PASSWORD_RESET', '3')),
    }
  }
};

/**
 * Appwrite OAuth providers
 */
export const OAUTH_PROVIDERS = {
  google: 'google',
  github: 'github',
};