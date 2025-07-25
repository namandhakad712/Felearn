/**
 * Validates configuration objects by checking if required fields are present
 * @param config The configuration object to validate
 * @param requiredFields Array of required field names
 * @param configName Name of the configuration for error messages
 * @returns The validated configuration object
 * @throws Error if any required field is missing
 */
export function validateConfig<T extends Record<string, any>>(
  config: T,
  requiredFields: string[],
  configName: string
): T {
  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    const errorMessage = `Missing required ${configName} configuration: ${missingFields.join(', ')}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  
  return config;
}

/**
 * Validates Firebase configuration
 * @param config Firebase configuration object
 * @returns The validated Firebase configuration
 */
export function validateFirebaseConfig(config: Record<string, string>): Record<string, string> {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    console.warn(`Missing Firebase configuration: ${missingFields.join(', ')} - Firebase features will be disabled`);
    // Return a dummy config to prevent initialization errors
    return {
      apiKey: 'dummy',
      authDomain: 'dummy.firebaseapp.com',
      projectId: 'dummy',
      storageBucket: 'dummy.appspot.com',
      messagingSenderId: '123456789',
      appId: '1:123456789:web:dummy'
    };
  }
  
  return config;
}

/**
 * Validates Appwrite configuration
 * @param config Appwrite configuration object
 * @returns The validated Appwrite configuration
 */
export function validateAppwriteConfig(config: Record<string, any>): Record<string, any> {
  const requiredFields = ['endpoint', 'projectId', 'databaseId'];
  return validateConfig(config, requiredFields, 'Appwrite');
}