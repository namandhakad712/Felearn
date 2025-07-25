import { Models } from 'appwrite';

/**
 * User type extending Appwrite's User model
 */
export interface User extends Omit<Models.User<Models.Preferences>, 'prefs'> {
  // Add any additional user properties here
  settings?: {
    theme?: 'light' | 'dark';
    language?: string;
    onboardingCompleted?: boolean;
  };
} 