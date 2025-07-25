import { ErrorType, ErrorSeverity } from './appwriteErrorHandler';

/**
 * Error message formatter for displaying user-friendly error messages
 */
export class ErrorMessageFormatter {
  /**
   * Format authentication error messages for display
   * @param message Raw error message
   * @param type Error type
   * @returns Formatted user-friendly message
   */
  static formatAuthError(message: string, type: ErrorType): string {
    // Return the message directly if it's already user-friendly
    if (this.isUserFriendly(message)) {
      return message;
    }
    
    // Format based on error type
    switch (type) {
      case ErrorType.AUTHENTICATION:
        return 'Authentication failed. Please check your credentials and try again.';
      
      case ErrorType.AUTHORIZATION:
        return 'You don\'t have permission to perform this action.';
      
      case ErrorType.VALIDATION:
        return 'Please check your input and try again.';
      
      case ErrorType.NETWORK:
        return 'Network connection issue. Please check your internet connection and try again.';
      
      case ErrorType.SERVER:
        return 'Server error. Please try again later.';
      
      case ErrorType.RATE_LIMIT:
        return 'Too many attempts. Please wait a moment and try again.';
      
      case ErrorType.NOT_FOUND:
        return 'Account not found. Please check your email address.';
      
      default:
        return 'An error occurred. Please try again.';
    }
  }

  /**
   * Check if a message is already user-friendly
   * @param message Error message to check
   * @returns Whether the message is user-friendly
   */
  private static isUserFriendly(message: string): boolean {
    // List of technical terms that indicate a message is not user-friendly
    const technicalTerms = [
      'exception',
      'undefined',
      'null',
      'NaN',
      'syntax',
      'unexpected token',
      'failed to fetch',
      'promise',
      'rejected',
      'timeout',
      'appwrite',
      'firebase',
      'sdk',
      'api',
      'endpoint',
      'status code',
      'http',
      'response',
      'request',
      'payload',
      'json',
      'parse',
      'stringify'
    ];
    
    // Check if message contains any technical terms
    return !technicalTerms.some(term => 
      message.toLowerCase().includes(term.toLowerCase())
    );
  }

  /**
   * Get appropriate UI styling based on error severity
   * @param severity Error severity
   * @returns CSS class or style information
   */
  static getSeverityStyle(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'error-critical';
      case ErrorSeverity.HIGH:
        return 'error-high';
      case ErrorSeverity.MEDIUM:
        return 'error-medium';
      case ErrorSeverity.LOW:
        return 'error-low';
      default:
        return 'error-medium';
    }
  }

  /**
   * Get appropriate icon based on error type
   * @param type Error type
   * @returns Icon name or class
   */
  static getErrorIcon(type: ErrorType): string {
    switch (type) {
      case ErrorType.AUTHENTICATION:
        return 'icon-lock';
      case ErrorType.AUTHORIZATION:
        return 'icon-shield';
      case ErrorType.VALIDATION:
        return 'icon-form';
      case ErrorType.NETWORK:
        return 'icon-wifi-off';
      case ErrorType.SERVER:
        return 'icon-server';
      case ErrorType.RATE_LIMIT:
        return 'icon-clock';
      case ErrorType.NOT_FOUND:
        return 'icon-search';
      default:
        return 'icon-alert';
    }
  }
}

export default ErrorMessageFormatter;