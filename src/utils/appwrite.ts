import { APPWRITE_CONFIG } from '../config/appwrite';

/**
 * Generates an Appwrite authentication URL for the specified provider
 * @param provider The authentication provider (e.g., 'email', 'google', 'github')
 * @param successUrl The URL to redirect to after successful authentication
 * @param failureUrl The URL to redirect to after failed authentication
 * @returns The authentication URL
 */
export const getAuthUrl = (
  provider: string,
  successUrl: string = window.location.origin + '/onboarding',
  failureUrl: string = window.location.origin + '/auth/login'
): string => {
  // For email authentication, return the signup page URL
  if (provider === 'email') {
    return '/auth/signup';
  }
  
  // For OAuth providers, construct the Appwrite OAuth URL
  const endpoint = APPWRITE_CONFIG.endpoint;
  const projectId = APPWRITE_CONFIG.projectId;
  
  // Construct the OAuth URL based on Appwrite's OAuth endpoint format
  return `${endpoint}/account/sessions/oauth2/${provider}?project=${projectId}&success=${encodeURIComponent(successUrl)}&failure=${encodeURIComponent(failureUrl)}`;
};

/**
 * Redirects the user to the Appwrite authentication page for the specified provider
 * @param provider The authentication provider (e.g., 'email', 'google', 'github')
 */
export const redirectToAuth = (provider: string): void => {
  const authUrl = getAuthUrl(provider);
  
  if (provider === 'email') {
    // For email authentication, use client-side navigation
    window.location.href = authUrl;
  } else {
    // For OAuth providers, redirect to the Appwrite OAuth URL
    window.location.href = authUrl;
  }
};