import { AppwriteException } from 'appwrite';
import AppwriteErrorHandler, { ErrorInfo, ErrorType, ErrorSeverity } from './appwriteErrorHandler';
import { appwriteService } from '../services/appwrite';
// import ErrorMessageFormatter from './errorMessageFormatter';

/**
 * Authentication Error Handler
 * Specialized utilities for handling authentication-specific errors
 */
export class AuthErrorHandler {
  /**
   * Handle authentication errors with user-friendly messages
   * @param error The error object
   * @param operation The authentication operation (e.g., 'login', 'register')
   * @returns User-friendly error message
   */
  static handleAuthError(error: unknown, operation: string): string {
    const errorInfo = AppwriteErrorHandler.handleAuthError(error, { operation });
    AuthErrorHandler.logAuthError(errorInfo, operation);
    return errorInfo.message;
  }

  /**
   * Handle registration-specific errors
   * @param error The error object
   * @returns User-friendly error message
   */
  static handleRegistrationError(error: unknown): string {
    if (error instanceof AppwriteException) {
      switch (error.code) {
        case 400:
          // Check for password-related errors first since they're more specific
          if (error.message.includes('password') || error.message.includes('references to your name, email')) {
            if (error.message.includes('8 characters')) {
              return 'Password must be at least 8 characters long';
            } else if (error.message.includes('references to your name, email') || 
                      error.message.includes('contains references to your')) {
              return 'Your password cannot contain parts of your email address or name. Please choose a different password.';
            } else {
              return 'Please use a stronger password with a mix of letters, numbers, and symbols';
            }
          } else if (error.message.includes('email')) {
            return 'Please enter a valid email address';
          } else {
            return 'Please check your information and try again';
          }
        case 409:
          return 'An account with this email already exists. Please log in instead.';
        case 429:
          return 'Too many registration attempts. Please try again later';
        case 500:
        case 501:
        case 502:
        case 503:
          return 'Our servers are experiencing issues. Please try again later';
        default:
          return error.message || 'Registration failed. Please try again';
      }
    } else if (error instanceof Error) {
      // Check for specific error messages
      const errorMsg = error.message.toLowerCase();
      if (errorMsg.includes('references to your name, email') || 
          errorMsg.includes('contains references to your')) {
        return 'Your password cannot contain parts of your email address or name. Please choose a different password.';
      } else if (errorMsg.includes('already exists')) {
        return 'An account with this email already exists. Please log in instead.';
      }
      return error.message;
    }
    
    return 'An unexpected error occurred during registration';
  }

  /**
   * Handle login-specific errors
   * @param error The error object
   * @returns User-friendly error message
   */
  static handleLoginError(error: unknown): string {
    if (error instanceof AppwriteException) {
      switch (error.code) {
        case 401:
          return 'Invalid email or password';
        case 404:
          return 'No account found with this email';
        case 429:
          return 'Too many login attempts. Please try again later';
        case 0:
          return 'Network connection failed. Please check your internet connection';
        case 500:
        case 501:
        case 502:
        case 503:
          return 'Our servers are experiencing issues. Please try again later';
        default:
          return error.message || 'Login failed. Please try again';
      }
    } else if (error instanceof Error) {
      if (error.message.includes('network') || error.message.includes('internet')) {
        return 'Network connection failed. Please check your internet connection';
      }
      return error.message;
    }
    
    return 'An unexpected error occurred during login';
  }

  /**
   * Handle password reset-specific errors
   * @param error The error object
   * @returns User-friendly error message
   */
  static handlePasswordResetError(error: unknown): string {
    if (error instanceof AppwriteException) {
      switch (error.code) {
        case 400:
          if (error.message.includes('email')) {
            return 'Please enter a valid email address';
          } else {
            return 'Please check your information and try again';
          }
        case 404:
          return 'No account found with this email';
        case 429:
          return 'Too many password reset attempts. Please try again later';
        case 0:
          return 'Network connection failed. Please check your internet connection';
        case 500:
        case 501:
        case 502:
        case 503:
          return 'Our servers are experiencing issues. Please try again later';
        default:
          return error.message || 'Password reset failed. Please try again';
      }
    } else if (error instanceof Error) {
      return error.message;
    }
    
    return 'An unexpected error occurred during password reset';
  }

  /**
   * Handle logout-specific errors
   * @param error The error object
   * @returns User-friendly error message
   */
  static handleLogoutError(error: unknown): string {
    if (error instanceof AppwriteException) {
      switch (error.code) {
        case 401:
          return 'Your session has expired';
        case 0:
          return 'Network connection failed. Please check your internet connection';
        default:
          return 'Logout failed. You may need to refresh the page';
      }
    } else if (error instanceof Error) {
      return error.message;
    }
    
    return 'An unexpected error occurred during logout';
  }

  /**
   * Handle session-related errors with automatic retry
   * @param error The error object
   * @param operationName Name of the operation for logging
   * @param retryFn Function to retry
   * @param maxRetries Maximum number of retries
   * @returns Promise with the operation result
   */
  static async handleSessionError<T>(
    error: unknown, 
    operationName: string, 
    retryFn: () => Promise<T>,
    maxRetries: number = 1
  ): Promise<T> {
    const errorInfo = AppwriteErrorHandler.handleAuthError(error, { operation: operationName });
    
    // Log the error
    this.logAuthError(errorInfo, operationName);
    
    // If it's a session error, try to refresh the session and retry
    if (
      errorInfo.type === ErrorType.AUTHENTICATION && 
      maxRetries > 0 &&
      (error instanceof AppwriteException && error.code === 401)
    ) {
      try {
        // Try to refresh the session
        console.log('Attempting to refresh session...');
        
        // Wait a moment before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Retry the operation
        return await retryFn();
      } catch (retryError) {
        // If retry fails, throw the original error with a better message
        throw new Error('Your session has expired. Please log in again.');
      }
    }
    
    // For other errors, throw with a user-friendly message
    throw new Error(errorInfo.message);
  }

  /**
   * Log authentication errors with appropriate context
   * @param errorInfo Error information
   * @param operation The authentication operation
   */
  static logAuthError(errorInfo: ErrorInfo, operation: string): void {
    const userId = this.getCurrentUserId();
    AppwriteErrorHandler.logError(errorInfo, `Authentication:${operation}`, userId);
    
    // Report authentication errors to the server for monitoring
    this.reportAuthError(errorInfo, operation, userId);
  }

  /**
   * Get current user ID if available
   * @returns User ID or undefined
   */
  private static getCurrentUserId(): string | undefined {
    try {
      // Try to get from localStorage if available
      const userData = localStorage.getItem('appwrite_user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.$id;
      }
      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Report authentication errors to the server
   * @param errorInfo Error information
   * @param operation The authentication operation
   * @param userId Optional user ID
   */
  private static async reportAuthError(
    errorInfo: ErrorInfo, 
    operation: string, 
    userId?: string
  ): Promise<void> {
    // Only report medium, high, and critical errors
    if (
      errorInfo.severity === ErrorSeverity.LOW || 
      errorInfo.type === ErrorType.VALIDATION
    ) {
      return;
    }

    try {
      await appwriteService.createErrorReport({
        type: 'frontend',
        message: `Authentication error: ${errorInfo.message}`,
        userId: userId || '',
        context: {
          operation,
          errorType: errorInfo.type,
          errorCode: errorInfo.code,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        },
        severity: errorInfo.severity
      });
    } catch (reportError) {
      // Don't let reporting errors affect the user experience
      console.error('Failed to report authentication error:', reportError);
    }
  }

  /**
   * Format validation errors for form fields
   * @param error The error object
   * @returns Object with field-specific error messages
   */
  static getFormValidationErrors(error: unknown): Record<string, string> {
    const fieldErrors: Record<string, string> = {};
    
    if (error instanceof AppwriteException) {
      if (error.message.includes('email')) {
        fieldErrors.email = 'Please enter a valid email address';
      }
      
      if (error.message.includes('password')) {
        if (error.message.includes('8 characters')) {
          fieldErrors.password = 'Password must be at least 8 characters long';
        } else if (error.message.includes('weak')) {
          fieldErrors.password = 'Password is too weak. Please use a stronger password';
        } else {
          fieldErrors.password = 'Invalid password format';
        }
      }
      
      if (error.message.includes('name')) {
        fieldErrors.name = 'Please enter a valid name';
      }
      
      // Handle account already exists errors
      if (error.code === 409) {
        fieldErrors.email = 'An account with this email already exists';
      }
      
      // Handle invalid credentials
      if (error.code === 401) {
        fieldErrors.general = 'Invalid email or password';
      }
    } else if (error instanceof Error) {
      fieldErrors.general = error.message;
    } else {
      fieldErrors.general = 'An error occurred';
    }
    
    return fieldErrors;
  }

  /**
   * Check if an error is due to network connectivity issues
   * @param error The error object
   * @returns Boolean indicating if it's a network error
   */
  static isNetworkError(error: unknown): boolean {
    if (error instanceof AppwriteException && error.code === 0) {
      return true;
    }
    
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return message.includes('network') || 
             message.includes('internet') || 
             message.includes('offline') ||
             message.includes('connection');
    }
    
    return false;
  }

  /**
   * Check if an error is due to rate limiting
   * @param error The error object
   * @returns Boolean indicating if it's a rate limit error
   */
  static isRateLimitError(error: unknown): boolean {
    return error instanceof AppwriteException && error.code === 429;
  }

  /**
   * Get recommended action based on error type
   * @param error The error object
   * @returns Recommended action message
   */
  static getRecommendedAction(error: unknown): string {
    const errorInfo = AppwriteErrorHandler.handleAuthError(error);
    
    switch (errorInfo.type) {
      case ErrorType.NETWORK:
        return 'Please check your internet connection and try again.';
      case ErrorType.RATE_LIMIT:
        return 'You\'ve made too many attempts. Please wait a few minutes before trying again.';
      case ErrorType.AUTHENTICATION:
        return 'Please verify your credentials and try again.';
      case ErrorType.VALIDATION:
        return 'Please check your input and try again.';
      case ErrorType.SERVER:
        return 'Our servers are experiencing issues. Please try again later.';
      default:
        return 'Please try again or contact support if the issue persists.';
    }
  }

  /**
   * Handle authentication errors with automatic retry for specific error types
   * @param operation The operation description
   * @param authFn The authentication function to execute
   * @param maxRetries Maximum number of retries
   * @returns Promise with the result or throws an error
   */
  static async executeWithRetry<T>(
    operation: string,
    authFn: () => Promise<T>,
    maxRetries: number = 2
  ): Promise<T> {
    try {
      return await authFn();
    } catch (error) {
      const errorInfo = AppwriteErrorHandler.handleAuthError(error, { operation });
      
      // Log the error
      this.logAuthError(errorInfo, operation);
      
      // Only retry for network or server errors
      if (
        errorInfo.retryable && 
        maxRetries > 0 && 
        (errorInfo.type === ErrorType.NETWORK || errorInfo.type === ErrorType.SERVER)
      ) {
        const delay = AppwriteErrorHandler.getRetryDelay(errorInfo);
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry the operation
        return this.executeWithRetry(operation, authFn, maxRetries - 1);
      }
      
      // For other errors or if max retries reached, throw the error
      throw error;
    }
  }
}

export default AuthErrorHandler;