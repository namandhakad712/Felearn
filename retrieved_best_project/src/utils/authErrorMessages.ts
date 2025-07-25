import { AppwriteException } from 'appwrite';

/**
 * Authentication Error Messages
 * Provides user-friendly error messages for authentication operations
 */
export class AuthErrorMessages {
  /**
   * Get user-friendly error message for registration errors
   * @param error The error object
   * @returns User-friendly error message
   */
  static getRegistrationErrorMessage(error: unknown): string {
    if (error instanceof AppwriteException) {
      switch (error.code) {
        case 400:
          if (error.message.includes('email')) {
            return 'Please enter a valid email address';
          } else if (error.message.includes('password')) {
            if (error.message.includes('8 characters')) {
              return 'Password must be at least 8 characters long';
            } else {
              return 'Please use a stronger password with a mix of letters, numbers, and symbols';
            }
          } else {
            return 'Please check your information and try again';
          }
        case 409:
          return 'An account with this email already exists';
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
      return error.message;
    }
    
    return 'An unexpected error occurred during registration';
  }

  /**
   * Get user-friendly error message for login errors
   * @param error The error object
   * @returns User-friendly error message
   */
  static getLoginErrorMessage(error: unknown): string {
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
   * Get user-friendly error message for password reset errors
   * @param error The error object
   * @returns User-friendly error message
   */
  static getPasswordResetErrorMessage(error: unknown): string {
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
   * Get user-friendly error message for logout errors
   * @param error The error object
   * @returns User-friendly error message
   */
  static getLogoutErrorMessage(error: unknown): string {
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
   * Get user-friendly error message for session errors
   * @param error The error object
   * @returns User-friendly error message
   */
  static getSessionErrorMessage(error: unknown): string {
    if (error instanceof AppwriteException) {
      switch (error.code) {
        case 401:
          return 'Your session has expired. Please log in again';
        case 0:
          return 'Network connection failed. Please check your internet connection';
        default:
          return error.message || 'Session error. Please log in again';
      }
    } else if (error instanceof Error) {
      return error.message;
    }
    
    return 'An unexpected session error occurred';
  }

  /**
   * Get user-friendly error message for account update errors
   * @param error The error object
   * @returns User-friendly error message
   */
  static getAccountUpdateErrorMessage(error: unknown): string {
    if (error instanceof AppwriteException) {
      switch (error.code) {
        case 400:
          if (error.message.includes('email')) {
            return 'Please enter a valid email address';
          } else if (error.message.includes('password')) {
            return 'Invalid password format';
          } else {
            return 'Please check your information and try again';
          }
        case 401:
          return 'Your session has expired. Please log in again';
        case 409:
          return 'This email is already in use by another account';
        case 0:
          return 'Network connection failed. Please check your internet connection';
        default:
          return error.message || 'Account update failed. Please try again';
      }
    } else if (error instanceof Error) {
      return error.message;
    }
    
    return 'An unexpected error occurred while updating your account';
  }
}

export default AuthErrorMessages;