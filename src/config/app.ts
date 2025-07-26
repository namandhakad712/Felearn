/**
 * Universal app configuration that works on any domain
 */

export interface AppConfig {
  name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  baseUrl: string;
  api: {
    appwrite: {
      endpoint: string;
      project: string;
    };
  };
  auth: {
    routes: {
      login: string;
      callback: string;
      verify: string;
      resetPassword: string;
      dashboard: string;
      onboarding: string;
    };
  };
}

/**
 * Get current environment based on hostname
 */
function getEnvironment(): 'development' | 'staging' | 'production' {
  if (typeof window === 'undefined') return 'development';
  
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  } else if (hostname.includes('staging') || hostname.includes('dev')) {
    return 'staging';
  } else {
    return 'production';
  }
}

/**
 * Get base URL dynamically
 */
function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:5173';
}

/**
 * Universal app configuration
 */
export const appConfig: AppConfig = {
  name: 'Felearn',
  version: '1.0.0',
  environment: getEnvironment(),
  baseUrl: getBaseUrl(),
  api: {
    appwrite: {
      endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1',
      project: import.meta.env.VITE_APPWRITE_PROJECT_ID || 'felearn',
    },
  },
  auth: {
    routes: {
      login: '/app.html#/auth/login',
      callback: '/app.html#/auth/callback',
      verify: '/app.html#/auth/verify',
      resetPassword: '/app.html#/auth/reset-password',
      dashboard: '/app.html#/dashboard',
      onboarding: '/app.html#/onboarding',
    },
  },
};

/**
 * Get full URL for a route
 */
export function getFullUrl(route: string): string {
  return `${appConfig.baseUrl}${route}`;
}

/**
 * Get auth URLs
 */
export const getAuthUrls = () => ({
  login: getFullUrl(appConfig.auth.routes.login),
  callback: getFullUrl(appConfig.auth.routes.callback),
  verify: getFullUrl(appConfig.auth.routes.verify),
  resetPassword: getFullUrl(appConfig.auth.routes.resetPassword),
  dashboard: getFullUrl(appConfig.auth.routes.dashboard),
  onboarding: getFullUrl(appConfig.auth.routes.onboarding),
});

/**
 * Debug: Log current configuration
 */
export function logAppConfig(): void {
  console.log('🚀 App Configuration:', {
    environment: appConfig.environment,
    baseUrl: appConfig.baseUrl,
    authUrls: getAuthUrls(),
  });
}