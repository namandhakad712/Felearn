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
 * Get current environment based on hostname - Universal detection
 */
function getEnvironment(): 'development' | 'staging' | 'production' {
  if (typeof window === 'undefined') return 'development';
  
  const hostname = window.location.hostname;
  const origin = window.location.origin;
  
  // Development environments
  if (hostname === 'localhost' || 
      hostname === '127.0.0.1' || 
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.includes('local') ||
      origin.includes(':3000') ||
      origin.includes(':5173') ||
      origin.includes(':8080')) {
    return 'development';
  }
  
  // Staging environments
  if (hostname.includes('staging') || 
      hostname.includes('dev') || 
      hostname.includes('test') ||
      hostname.includes('preview') ||
      hostname.includes('beta')) {
    return 'staging';
  }
  
  // Everything else is production
  return 'production';
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
 * Universal app configuration - Works with any domain/environment
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
      login: '/auth/login',
      callback: '/auth/callback',
      verify: '/auth/verify',
      resetPassword: '/auth/reset-password',
      dashboard: '/dashboard',
      onboarding: '/onboarding',
    },
  },
};

/**
 * Get current domain info - Universal domain detection
 */
export const getDomainInfo = () => {
  if (typeof window === 'undefined') {
    return {
      origin: 'http://localhost:5173',
      hostname: 'localhost',
      isLocal: true,
      isProduction: false
    };
  }
  
  const origin = window.location.origin;
  const hostname = window.location.hostname;
  const isLocal = hostname === 'localhost' || 
                  hostname === '127.0.0.1' || 
                  hostname.startsWith('192.168.') ||
                  hostname.startsWith('10.') ||
                  origin.includes(':3000') ||
                  origin.includes(':5173') ||
                  origin.includes(':8080');
  
  const isProduction = !isLocal && 
                      !hostname.includes('staging') && 
                      !hostname.includes('dev') && 
                      !hostname.includes('test') &&
                      !hostname.includes('preview');
  
  return {
    origin,
    hostname,
    isLocal,
    isProduction
  };
};

/**
 * Get full URL for a route
 */
export function getFullUrl(route: string): string {
  return `${appConfig.baseUrl}${route}`;
}

/**
 * Get production domain for email URLs
 * Can be overridden with environment variable
 */
export const getProductionDomain = (): string => {
  try {
    // Allow override via environment variable
    if (import.meta.env?.VITE_PRODUCTION_DOMAIN) {
      console.log('🌍 Using custom production domain:', import.meta.env.VITE_PRODUCTION_DOMAIN);
      return import.meta.env.VITE_PRODUCTION_DOMAIN;
    }
  } catch (error) {
    console.warn('⚠️ Could not access environment variables:', error);
  }
  
  // Default production domain
  console.log('🌍 Using default production domain: https://felearn.vercel.app');
  return 'https://felearn.vercel.app';
};

/**
 * Get auth URLs - Universal for any environment
 * Works even if Appwrite Console URLs are not configured!
 */
export const getAuthUrls = () => {
  try {
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    console.log('🔍 Current origin detected:', currentOrigin);
    
    // Force production domain for email verification if in development
    // This ensures verification emails work even when testing locally
    const isLocalhost = currentOrigin.includes('localhost');
    console.log('🏠 Is localhost?', isLocalhost);
    
    // Inline production domain logic to avoid function call issues
    let productionDomain = 'https://felearn.vercel.app';
    try {
      if (import.meta.env?.VITE_PRODUCTION_DOMAIN) {
        productionDomain = import.meta.env.VITE_PRODUCTION_DOMAIN;
        console.log('🌍 Using custom production domain:', productionDomain);
      }
    } catch (envError) {
      console.warn('⚠️ Could not access environment variables, using default');
    }
    
    const emailOrigin = isLocalhost ? productionDomain : currentOrigin;
    console.log('📧 Email origin will be:', emailOrigin);
    
    // IMPORTANT: React app is served from /app.html, not root!
    const appPath = '/app.html#';
    
    const urls = {
      login: `${currentOrigin}${appPath}${appConfig.auth.routes.login}`,
      callback: `${currentOrigin}${appPath}${appConfig.auth.routes.callback}`,
      verify: `${emailOrigin}${appPath}${appConfig.auth.routes.verify}`, // Use production for emails
      resetPassword: `${emailOrigin}${appPath}${appConfig.auth.routes.resetPassword}`, // Use production for emails
      dashboard: `${currentOrigin}${appPath}${appConfig.auth.routes.dashboard}`,
      onboarding: `${currentOrigin}${appPath}${appConfig.auth.routes.onboarding}`,
    };
    
    console.log('🔗 Generated auth URLs:', urls);
    return urls;
  } catch (error) {
    console.error('❌ Error generating auth URLs:', error);
    // Fallback URLs - FIXED to include app.html
    return {
      login: 'https://felearn.vercel.app/app.html#/auth/login',
      callback: 'https://felearn.vercel.app/app.html#/auth/callback',
      verify: 'https://felearn.vercel.app/app.html#/auth/verify',
      resetPassword: 'https://felearn.vercel.app/app.html#/auth/reset-password',
      dashboard: 'https://felearn.vercel.app/app.html#/dashboard',
      onboarding: 'https://felearn.vercel.app/app.html#/onboarding',
    };
  }
};

/**
 * Debug: Log current configuration - Universal
 */
export function logAppConfig(): void {
  const domainInfo = getDomainInfo();
  const authUrls = getAuthUrls();
  
  console.log('🚀 Universal App Configuration:', {
    environment: appConfig.environment,
    baseUrl: appConfig.baseUrl,
    domainInfo,
    authUrls,
    appwriteConfig: appConfig.api.appwrite,
    isUniversal: true,
    note: 'This configuration works with ANY domain automatically!'
  });
  
  // Validate email verification URL
  console.log('📧 Email Verification URL Validation:', {
    verifyUrl: authUrls.verify,
    isValid: authUrls.verify.includes('/auth/verify'),
    currentDomain: domainInfo.origin,
    willWork: authUrls.verify.startsWith(domainInfo.origin)
  });
}

/**
 * Test email verification URL generation
 */
export function testEmailVerificationUrl(): void {
  const authUrls = getAuthUrls();
  const testUrl = authUrls.verify;
  
  console.log('🧪 Email Verification URL Test:', {
    generatedUrl: testUrl,
    expectedFormat: `${window.location.origin}/auth/verify`,
    isCorrect: testUrl === `${window.location.origin}/auth/verify`,
    domain: window.location.origin,
    route: '/auth/verify'
  });
  
  // Test with sample parameters
  const sampleUserId = 'user123456789';
  const sampleSecret = 'abc123def456';
  const fullTestUrl = `${testUrl}?userId=${sampleUserId}&secret=${sampleSecret}`;
  
  console.log('🔗 Full verification URL example:', fullTestUrl);
}