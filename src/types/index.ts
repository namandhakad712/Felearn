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
  settings?: UserSettings | string; // user preferences (can be object in memory or string in database)
  lastLogin?: string; // last login timestamp
  createdAt?: string; // creation timestamp (for compatibility)
  bio?: string; // user bio
  oauthProvider?: string; // OAuth provider used
  disabled?: boolean; // account status
  onboardingcompleted?: boolean; // onboarding completion status
  quota?: number; // story generation quota
}

// Extended User interface that includes Appwrite User properties
// Note: Models namespace will be available after fixing imports
export interface ExtendedUser {
  // Appwrite User properties
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
  
  // Extended properties
  geminiKey?: string;
  isAdmin?: boolean;
  settings?: UserSettings | string;
  lastLogin?: string;
  quota?: number; // story generation quota
}

export interface UserSettings {
  theme: 'light' | 'dark';
  language: string;
  onboardingcompleted?: boolean;
}

export interface Story {
  $id: string;
  userId: string;
  email: string;
  name: string;
  lastLogin: string;
  title: string;
  content: string;
  images: string[]; // URLs to stored images or file IDs
  slides?: StorySlide[]; // Added slides for the new image-text pairs
  createdAt: string;
  isPinned: boolean;
  tags?: string[];
  tokens?: number; // ✅ Track tokens used for generation
}

export interface AdminLog {
  $id: string;
  action: string;
  timestamp: string;
  details: Record<string, any>;
  adminId: string;
}

export interface GeminiRequest {
  prompt: string;
  apiKey: string;
  userId?: string; // Added userId for rate limiting
  options: {
    temperature: number;
    maxTokens: number;
    includeImages: boolean;
  };
}

export interface StorySlide {
  id?: string;
  index?: number;
  text: string;
  image: string | null;
}

export interface GeminiResponse {
  story: string;
  images?: string[];
  slides?: StorySlide[];
  metadata: {
    tokensUsed: number;
    promptTokens?: number;
    candidatesTokens?: number;
    totalTokens?: number;
    processingTime: number;
  };
}

// Add new interface for streaming updates
export interface StreamingUpdate {
  type: 'slide' | 'complete' | 'error';
  slide?: StorySlide;
  story?: string;
  images?: string[];
  slides?: StorySlide[]; // Add slides array for complete type
  metadata?: {
    tokensUsed: number;
    promptTokens?: number;
    candidatesTokens?: number;
    totalTokens?: number;
    processingTime: number;
  };
  error?: string;
}

export interface ErrorReport {
  type: 'frontend' | 'backend' | 'api';
  message: string;
  stack?: string;
  userId?: string;
  timestamp: string;
  context: Record<string, any>;
}