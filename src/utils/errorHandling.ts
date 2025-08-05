/**
 * Error Handling Utilities
 * Provides consistent error handling for onboarding and authentication flows
 */

export interface AppError {
  message: string;
  code?: string;
  type: 'auth' | 'onboarding' | 'api' | 'network' | 'unknown';
  recoverable: boolean;
  action?: string;
}

/**
 * Handle onboarding-specific errors
 */
export const handleOnboardingError = (error: any): AppError => {
  console.error('🚨 Onboarding error:', error);
  
  // Handle specific error types
  if (error.code === 'document_not_found') {
    return {
      message: 'User profile not found. Please try signing in again.',
      code: error.code,
      type: 'onboarding',
      recoverable: true,
      action: 'retry_auth'
    };
  }
  
  if (error.code === 'permission_denied') {
    return {
      message: 'Permission denied. Please check your account status.',
      code: error.code,
      type: 'auth',
      recoverable: false,
      action: 'contact_support'
    };
  }
  
  if (error.message?.includes('API key')) {
    return {
      message: 'Invalid API key. Please check your Gemini API key and try again.',
      code: 'invalid_api_key',
      type: 'api',
      recoverable: true,
      action: 'retry_api_key'
    };
  }
  
  // Default error
  return {
    message: error.message || 'An unexpected error occurred during onboarding.',
    type: 'unknown',
    recoverable: true,
    action: 'retry'
  };
};

/**
 * Handle authentication errors
 */
export const handleAuthError = (error: any): AppError => {
  console.error('🚨 Authentication error:', error);
  
  if (error.code === 'user_invalid_token') {
    return {
      message: 'Your session has expired. Please sign in again.',
      code: error.code,
      type: 'auth',
      recoverable: true,
      action: 'relogin'
    };
  }
  
  if (error.code === 'user_already_exists') {
    return {
      message: 'An account with this email already exists. Please sign in instead.',
      code: error.code,
      type: 'auth',
      recoverable: true,
      action: 'login_instead'
    };
  }
  
  return {
    message: error.message || 'Authentication failed. Please try again.',
    type: 'auth',
    recoverable: true,
    action: 'retry'
  };
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: AppError): string => {
  return error.message;
};

/**
 * Check if error is recoverable
 */
export const isRecoverableError = (error: AppError): boolean => {
  return error.recoverable;
};

/**
 * Get suggested action for error
 */
export const getErrorAction = (error: AppError): string => {
  return error.action || 'retry';
};

/**
 * Log error with context
 */
export const logError = (error: any, context: string, userId?: string): void => {
  console.error(`🚨 ${context} Error:`, {
    error,
    context,
    userId,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  });
}; 