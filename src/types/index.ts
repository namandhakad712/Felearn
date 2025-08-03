export interface User {
  $id: string;
  email: string;
  name?: string;
  bio?: string;
  oauthProvider?: string;
  geminiKey: string; // encrypted
  createdAt: string;
  lastLogin?: string; // Added back as it's in the Appwrite schema
  settings: UserSettings | string; // Can be object in memory or string in database
  isAdmin?: boolean;
  emailVerification?: boolean; // Whether the email has been verified
  disabled?: boolean; // Whether the user account is disabled
}

export interface UserSettings {
  theme: 'light' | 'dark';
  language: string;
  onboardingCompleted?: boolean;
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
  text: string;
  image: string | null;
}

export interface GeminiResponse {
  story: string;
  images?: string[];
  slides?: StorySlide[];
  metadata: {
    tokensUsed: number;
    processingTime: number;
  };
}

export interface ErrorReport {
  type: 'frontend' | 'backend' | 'api';
  message: string;
  stack?: string;
  userId?: string;
  timestamp: string;
  context: Record<string, any>;
}