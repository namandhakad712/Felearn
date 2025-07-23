/**
 * Vercel-specific configuration
 */

/**
 * Get environment variable with fallback
 */
const getEnvVar = (key: string, fallback?: string): string => {
  const value = import.meta.env[key] || process.env[key];
  if (!value && !fallback) {
    console.warn(`Environment variable ${key} is not set`);
  }
  return value || fallback || '';
};

/**
 * Vercel deployment configuration
 */
export const VERCEL_CONFIG = {
  // Deployment information
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
  
  // Vercel-specific environment variables
  vercelUrl: getEnvVar('VERCEL_URL'),
  vercelEnv: getEnvVar('VERCEL_ENV', 'development'),
  vercelRegion: getEnvVar('VERCEL_REGION', 'iad1'),
  
  // Application configuration
  appName: getEnvVar('VITE_APP_NAME', 'AI Storytelling Platform'),
  appVersion: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  appUrl: getEnvVar('VITE_APP_URL', 'http://localhost:5173'),
  
  // Feature flags
  enableAnalytics: getEnvVar('VITE_ENABLE_ANALYTICS', 'true') === 'true',
  enableErrorReporting: getEnvVar('VITE_ENABLE_ERROR_REPORTING', 'true') === 'true',
  enablePerformanceMonitoring: getEnvVar('VITE_ENABLE_PERFORMANCE_MONITORING', 'true') === 'true',
  
  // Debug configuration
  debugMode: getEnvVar('VITE_DEBUG_MODE', 'false') === 'true',
  devMode: getEnvVar('VITE_DEV_MODE', 'false') === 'true',
};

/**
 * Get the current deployment URL
 */
export const getDeploymentUrl = (): string => {
  // In production, use the configured app URL
  if (VERCEL_CONFIG.isProduction) {
    return VERCEL_CONFIG.appUrl;
  }
  
  // In preview deployments, use Vercel URL
  if (VERCEL_CONFIG.vercelUrl) {
    return `https://${VERCEL_CONFIG.vercelUrl}`;
  }
  
  // Fallback to localhost for development
  return 'http://localhost:5173';
};

/**
 * Get environment-specific configuration
 */
export const getEnvironmentConfig = () => {
  const baseConfig = {
    name: VERCEL_CONFIG.appName,
    version: VERCEL_CONFIG.appVersion,
    url: getDeploymentUrl(),
    environment: VERCEL_CONFIG.vercelEnv,
  };

  switch (VERCEL_CONFIG.vercelEnv) {
    case 'production':
      return {
        ...baseConfig,
        debug: false,
        analytics: true,
        errorReporting: true,
        performanceMonitoring: true,
      };
    
    case 'preview':
      return {
        ...baseConfig,
        debug: true,
        analytics: false,
        errorReporting: true,
        performanceMonitoring: true,
      };
    
    default: // development
      return {
        ...baseConfig,
        debug: true,
        analytics: false,
        errorReporting: false,
        performanceMonitoring: false,
      };
  }
};

/**
 * Log deployment information
 */
export const logDeploymentInfo = (): void => {
  if (VERCEL_CONFIG.debugMode) {
    console.log('=== Deployment Information ===');
    console.log(`Environment: ${VERCEL_CONFIG.vercelEnv}`);
    console.log(`Region: ${VERCEL_CONFIG.vercelRegion}`);
    console.log(`URL: ${getDeploymentUrl()}`);
    console.log(`Version: ${VERCEL_CONFIG.appVersion}`);
    console.log(`Production: ${VERCEL_CONFIG.isProduction}`);
    console.log('==============================');
  }
};