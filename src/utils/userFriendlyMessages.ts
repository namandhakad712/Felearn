import { ErrorType, ErrorSeverity } from './appwriteErrorHandler';

/**
 * User-friendly error messages for different authentication scenarios
 */
export class UserFriendlyMessages {
  /**
   * Get user-friendly error message based on error type and context
   * @param errorType Type of error
   * @param operation Operation that failed
   * @param severity Error severity
   * @returns User-friendly error message
   */
  static getAuthErrorMessage(
    errorType: ErrorType,
    operation: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM
  ): string {
    const operationMessages = this.getOperationSpecificMessages(operation);
    
    switch (errorType) {
      case ErrorType.AUTHENTICATION:
        return operationMessages.authentication || this.getGenericAuthMessage(operation);
        
      case ErrorType.AUTHORIZATION:
        return operationMessages.authorization || 'You do not have permission to perform this action.';
        
      case ErrorType.VALIDATION:
        return operationMessages.validation || 'Please check your input and try again.';
        
      case ErrorType.NETWORK:
        return severity === ErrorSeverity.CRITICAL 
          ? 'Unable to connect to our servers. Please check your internet connection and try again.'
          : 'Connection issue detected. Please try again in a moment.';
          
      case ErrorType.SERVER:
        return severity === ErrorSeverity.CRITICAL
          ? 'Our servers are currently experiencing issues. Please try again later.'
          : 'Temporary server issue. Please try again in a moment.';
          
      case ErrorType.RATE_LIMIT:
        return operationMessages.rateLimit || 'Too many attempts. Please wait a moment before trying again.';
        
      case ErrorType.NOT_FOUND:
        return operationMessages.notFound || 'The requested information was not found.';
        
      default:
        return operationMessages.unknown || 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Get operation-specific error messages
   * @param operation The operation that failed
   * @returns Object with operation-specific messages
   */
  private static getOperationSpecificMessages(operation: string): {
    authentication?: string;
    authorization?: string;
    validation?: string;
    rateLimit?: string;
    notFound?: string;
    unknown?: string;
  } {
    const lowerOperation = operation.toLowerCase();
    
    if (lowerOperation.includes('login') || lowerOperation.includes('signin')) {
      return {
        authentication: 'Invalid email or password. Please check your credentials and try again.',
        validation: 'Please enter a valid email and password.',
        rateLimit: 'Too many login attempts. Please wait 5 minutes before trying again.',
        notFound: 'No account found with this email address.',
        unknown: 'Login failed. Please try again or contact support if the problem persists.'
      };
    }
    
    if (lowerOperation.includes('register') || lowerOperation.includes('signup')) {
      return {
        authentication: 'Registration failed. Please try again.',
        validation: 'Please check that all fields are filled correctly. Password must be at least 8 characters.',
        rateLimit: 'Too many registration attempts. Please wait before trying again.',
        unknown: 'Registration failed. Please try again or contact support if the problem persists.'
      };
    }
    
    if (lowerOperation.includes('password') && lowerOperation.includes('reset')) {
      return {
        validation: 'Please enter a valid email address.',
        notFound: 'No account found with this email address.',
        rateLimit: 'Too many password reset requests. Please check your email or wait before trying again.',
        unknown: 'Password reset failed. Please try again or contact support.'
      };
    }
    
    if (lowerOperation.includes('logout')) {
      return {
        authentication: 'Logout failed. You may already be logged out.',
        unknown: 'Logout failed. Please refresh the page.'
      };
    }
    
    if (lowerOperation.includes('oauth')) {
      return {
        authentication: 'Social login failed. Please try again or use email/password login.',
        authorization: 'Permission denied for social login. Please try again.',
        unknown: 'Social login failed. Please try again or use email/password login.'
      };
    }
    
    return {};
  }

  /**
   * Get generic authentication message based on operation
   * @param operation The operation that failed
   * @returns Generic authentication error message
   */
  private static getGenericAuthMessage(operation: string): string {
    const lowerOperation = operation.toLowerCase();
    
    if (lowerOperation.includes('login')) {
      return 'Login failed. Please check your credentials.';
    }
    
    if (lowerOperation.includes('register')) {
      return 'Registration failed. Please try again.';
    }
    
    if (lowerOperation.includes('password')) {
      return 'Password operation failed. Please try again.';
    }
    
    return 'Authentication failed. Please try again.';
  }

  /**
   * Get success messages for authentication operations
   * @param operation The successful operation
   * @returns Success message
   */
  static getSuccessMessage(operation: string): string {
    const lowerOperation = operation.toLowerCase();
    
    if (lowerOperation.includes('login') || lowerOperation.includes('signin')) {
      return 'Successfully logged in! Welcome back.';
    }
    
    if (lowerOperation.includes('register') || lowerOperation.includes('signup')) {
      return 'Account created successfully! Welcome to our platform.';
    }
    
    if (lowerOperation.includes('logout')) {
      return 'Successfully logged out. See you next time!';
    }
    
    if (lowerOperation.includes('password') && lowerOperation.includes('reset')) {
      return 'Password reset email sent! Please check your inbox.';
    }
    
    if (lowerOperation.includes('password') && lowerOperation.includes('update')) {
      return 'Password updated successfully!';
    }
    
    if (lowerOperation.includes('email') && lowerOperation.includes('update')) {
      return 'Email updated successfully!';
    }
    
    if (lowerOperation.includes('profile') && lowerOperation.includes('update')) {
      return 'Profile updated successfully!';
    }
    
    return 'Operation completed successfully!';
  }

  /**
   * Get help text for common authentication issues
   * @param errorType Type of error
   * @param operation Operation that failed
   * @returns Help text with suggestions
   */
  static getHelpText(errorType: ErrorType, operation: string): string {
    const lowerOperation = operation.toLowerCase();
    
    switch (errorType) {
      case ErrorType.AUTHENTICATION:
        if (lowerOperation.includes('login')) {
          return 'Make sure you\'re using the correct email and password. If you forgot your password, use the "Forgot Password" link.';
        }
        if (lowerOperation.includes('register')) {
          return 'Ensure your password is at least 8 characters long and contains a mix of letters and numbers.';
        }
        return 'Double-check your credentials and try again.';
        
      case ErrorType.VALIDATION:
        if (lowerOperation.includes('email')) {
          return 'Please enter a valid email address (e.g., user@example.com).';
        }
        if (lowerOperation.includes('password')) {
          return 'Password must be at least 8 characters long and contain letters and numbers.';
        }
        return 'Please check that all required fields are filled correctly.';
        
      case ErrorType.NETWORK:
        return 'Check your internet connection and try again. If the problem persists, try refreshing the page.';
        
      case ErrorType.SERVER:
        return 'Our servers are temporarily unavailable. Please try again in a few minutes.';
        
      case ErrorType.RATE_LIMIT:
        return 'You\'ve made too many attempts. Please wait a few minutes before trying again.';
        
      case ErrorType.NOT_FOUND:
        if (lowerOperation.includes('login') || lowerOperation.includes('password')) {
          return 'If you don\'t have an account yet, please sign up first.';
        }
        return 'The requested information could not be found.';
        
      default:
        return 'If this problem continues, please contact our support team for assistance.';
    }
  }

  /**
   * Get action suggestions based on error type
   * @param errorType Type of error
   * @param operation Operation that failed
   * @returns Array of suggested actions
   */
  static getActionSuggestions(errorType: ErrorType, operation: string): string[] {
    const lowerOperation = operation.toLowerCase();
    const suggestions: string[] = [];
    
    switch (errorType) {
      case ErrorType.AUTHENTICATION:
        if (lowerOperation.includes('login')) {
          suggestions.push('Double-check your email and password');
          suggestions.push('Try the "Forgot Password" option if needed');
          suggestions.push('Make sure Caps Lock is off');
        } else if (lowerOperation.includes('register')) {
          suggestions.push('Use a different email address');
          suggestions.push('Make sure your password meets requirements');
          suggestions.push('Try again in a few minutes');
        }
        break;
        
      case ErrorType.NETWORK:
        suggestions.push('Check your internet connection');
        suggestions.push('Try refreshing the page');
        suggestions.push('Disable VPN if you\'re using one');
        break;
        
      case ErrorType.SERVER:
        suggestions.push('Wait a few minutes and try again');
        suggestions.push('Check our status page for updates');
        suggestions.push('Try using a different browser');
        break;
        
      case ErrorType.RATE_LIMIT:
        suggestions.push('Wait 5-10 minutes before trying again');
        suggestions.push('Clear your browser cache');
        suggestions.push('Try from a different device');
        break;
        
      case ErrorType.VALIDATION:
        suggestions.push('Check all required fields are filled');
        suggestions.push('Ensure email format is correct');
        suggestions.push('Verify password meets requirements');
        break;
        
      default:
        suggestions.push('Try again in a few minutes');
        suggestions.push('Contact support if the problem persists');
    }
    
    return suggestions;
  }
}