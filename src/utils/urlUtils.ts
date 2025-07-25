/**
 * Utility functions for dynamic URL generation
 * Works on localhost, production, or any domain
 */

/**
 * Get the current origin (protocol + domain + port)
 * Examples: 
 * - http://localhost:5173
 * - https://myapp.com
 * - https://staging.myapp.com
 */
export function getOrigin(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // Fallback for server-side rendering
  return 'http://localhost:5173';
}

/**
 * Generate dynamic URLs for authentication flows
 */
export const authUrls = {
  // OAuth callback URLs
  oauthCallback: () => `${getOrigin()}/auth/callback`,
  oauthFailure: () => `${getOrigin()}/auth/login`,
  
  // Email verification URLs
  emailVerify: () => `${getOrigin()}/auth/verify`,
  
  // Password reset URLs
  passwordReset: () => `${getOrigin()}/auth/reset-password`,
  
  // Dashboard URL
  dashboard: () => `${getOrigin()}/dashboard`,
  
  // Login URL
  login: () => `${getOrigin()}/auth/login`
};

/**
 * Log current URLs for debugging
 */
export function logCurrentUrls(): void {
  console.log('🌐 Dynamic URLs:', {
    origin: getOrigin(),
    oauthCallback: authUrls.oauthCallback(),
    emailVerify: authUrls.emailVerify(),
    passwordReset: authUrls.passwordReset(),
    dashboard: authUrls.dashboard()
  });
}