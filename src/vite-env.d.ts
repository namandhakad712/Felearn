/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Appwrite Configuration
  readonly VITE_APPWRITE_ENDPOINT: string
  readonly VITE_APPWRITE_PROJECT_ID: string
  readonly VITE_APPWRITE_DATABASE_ID: string
  readonly VITE_APPWRITE_USERS_COLLECTION_ID: string
  readonly VITE_APPWRITE_STORIES_COLLECTION_ID: string
  readonly VITE_APPWRITE_ADMIN_LOGS_COLLECTION_ID: string
  readonly VITE_APPWRITE_ERROR_LOGS_COLLECTION_ID: string
  readonly VITE_APPWRITE_SUBSCRIBERS_COLLECTION_ID: string
  readonly VITE_APPWRITE_SUGGESTIONS_COLLECTION_ID: string
  readonly VITE_APPWRITE_STORY_IMAGES_BUCKET_ID: string
  readonly VITE_APPWRITE_SESSION_DURATION: string
  readonly VITE_APPWRITE_EMAIL_VERIFICATION: string
  readonly VITE_APPWRITE_RATE_LIMIT_LOGIN: string
  readonly VITE_APPWRITE_RATE_LIMIT_REGISTER: string
  readonly VITE_APPWRITE_RATE_LIMIT_PASSWORD_RESET: string

  // Application Configuration
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_URL: string
  readonly VITE_BUILD_DATE: string

  // Feature Flags
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_ERROR_REPORTING: string
  readonly VITE_ENABLE_PERFORMANCE_MONITORING: string
  readonly VITE_DEBUG_MODE: string
  readonly VITE_DEV_MODE: string

  // Vercel Environment Variables
  readonly VERCEL_URL: string
  readonly VERCEL_ENV: string
  readonly VERCEL_REGION: string

  // API Keys
  readonly VITE_GEMINI_API_KEY: string

  // Standard Vite Environment Variables
  readonly MODE: string
  readonly BASE_URL: string
  readonly PROD: boolean
  readonly DEV: boolean
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}