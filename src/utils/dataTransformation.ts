import { User, Story, UserSettings } from '../types';

/**
 * Data Transformation Utilities
 * Handles validation and transformation of data between Firebase and Appwrite
 */
export class DataTransformation {
  /**
   * Validate and transform user data
   * @param userData User data to validate and transform
   * @returns Validated and transformed user data
   */
  static validateUserData(userData: Partial<User>): Partial<User> {
    const validatedData: Partial<User> = { ...userData };
    
    // Ensure required fields
    if (!validatedData.email) {
      throw new Error('User email is required');
    }
    
    // Set default name if not provided
    if (!validatedData.name) {
      validatedData.name = validatedData.email.split('@')[0];
    }
    
    // Set default createdAt if not provided
    if (!validatedData.createdAt) {
      validatedData.createdAt = new Date().toISOString();
    }
    
    // Set default lastLogin if not provided
    if (!validatedData.lastLogin) {
      validatedData.lastLogin = new Date().toISOString();
    }
    
    // Ensure settings is an object
    if (!validatedData.settings) {
      validatedData.settings = {
        theme: 'light',
        language: 'en',
        onboardingCompleted: false
      };
    } else if (typeof validatedData.settings === 'string') {
      try {
        validatedData.settings = JSON.parse(validatedData.settings) as UserSettings;
      } catch (e) {
        validatedData.settings = {
          theme: 'light',
          language: 'en',
          onboardingCompleted: false
        };
      }
    }
    
    // Ensure geminiKey exists
    if (!validatedData.geminiKey) {
      validatedData.geminiKey = '';
    }
    
    return validatedData;
  }

  /**
   * Validate and transform story data
   * @param storyData Story data to validate and transform
   * @returns Validated and transformed story data
   */
  static validateStoryData(storyData: Partial<Story>): Partial<Story> {
    const validatedData: Partial<Story> = { ...storyData };
    
    // Ensure required fields
    if (!validatedData.userId) {
      throw new Error('Story userId is required');
    }
    
    if (!validatedData.title) {
      throw new Error('Story title is required');
    }
    
    if (!validatedData.content) {
      throw new Error('Story content is required');
    }
    
    // Set default createdAt if not provided
    if (!validatedData.createdAt) {
      validatedData.createdAt = new Date().toISOString();
    }
    
    // Ensure images is an array
    if (!validatedData.images) {
      validatedData.images = [];
    } else if (typeof validatedData.images === 'string') {
      try {
        validatedData.images = JSON.parse(validatedData.images) as string[];
      } catch (e) {
        validatedData.images = [];
      }
    }
    
    // Ensure tags is an array
    if (!validatedData.tags) {
      validatedData.tags = [];
    } else if (typeof validatedData.tags === 'string') {
      try {
        validatedData.tags = JSON.parse(validatedData.tags) as string[];
      } catch (e) {
        validatedData.tags = [];
      }
    }
    
    // Ensure isPinned is a boolean
    if (validatedData.isPinned === undefined) {
      validatedData.isPinned = false;
    }
    
    return validatedData;
  }

  /**
   * Convert Firebase timestamp to ISO string
   * @param timestamp Firebase timestamp
   * @returns ISO string date
   */
  static convertFirebaseTimestamp(timestamp: any): string {
    if (!timestamp) {
      return new Date().toISOString();
    }
    
    // Handle Firebase Timestamp objects
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toISOString();
    }
    
    // Handle timestamp as seconds
    if (typeof timestamp === 'number') {
      return new Date(timestamp * 1000).toISOString();
    }
    
    // Handle timestamp as string
    if (typeof timestamp === 'string') {
      return new Date(timestamp).toISOString();
    }
    
    return new Date().toISOString();
  }

  /**
   * Convert Firebase data to Appwrite format
   * @param data Firebase data
   * @returns Appwrite formatted data
   */
  static convertFirebaseToAppwrite(data: any): any {
    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.convertFirebaseToAppwrite(item));
    }
    
    // Handle objects
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      const result: any = {};
      
      for (const [key, value] of Object.entries(data)) {
        // Skip Firebase specific fields
        if (key.startsWith('_') || key === 'ref') {
          continue;
        }
        
        // Handle Firebase timestamps
        if (value && typeof value === 'object' && 'seconds' in value && 'nanoseconds' in value) {
          result[key] = this.convertFirebaseTimestamp(value);
          continue;
        }
        
        // Handle nested objects and arrays
        if (value && typeof value === 'object') {
          result[key] = this.convertFirebaseToAppwrite(value);
          continue;
        }
        
        // Handle primitive values
        result[key] = value;
      }
      
      return result;
    }
    
    // Return primitive values as is
    return data;
  }
}

export default DataTransformation;