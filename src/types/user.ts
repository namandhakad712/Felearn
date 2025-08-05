/**
 * User type with all required properties for the application
 */
export interface User {
  // Appwrite User base properties
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  name: string;
  registration: string;
  status: boolean;
  labels: string[];
  passwordUpdate: string;
  email: string;
  phone: string;
  emailVerification: boolean;
  phoneVerification: boolean;
  mfa: boolean;
  prefs: Record<string, any>;
  targets: any[];
  accessedAt: string;
  
  // Extended properties required by the application
  geminiKey?: string; // API key
  isAdmin?: boolean; // admin privileges
  settings?: UserSettings | string; // user preferences
  lastLogin?: string; // last login timestamp
  createdAt?: string; // creation timestamp (for compatibility)
  bio?: string; // user bio
  oauthProvider?: string; // OAuth provider used
  disabled?: boolean; // account status
  onboardingcompleted?: boolean; // onboarding completion status
}

export interface UserSettings {
  theme: 'light' | 'dark';
  language: string;
  onboardingcompleted?: boolean;
} 