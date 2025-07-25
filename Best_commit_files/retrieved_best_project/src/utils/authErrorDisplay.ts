import AuthErrorHandler from './authErrorHandler';
import { ErrorType } from './appwriteErrorHandler';

/**
 * Interface for error display data
 */
export interface ErrorDisplayData {
  message: string;
  helpText?: string;
  suggestions?: string[];
  isRetryable: boolean;
  retryDelay?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Authentication Error Display Utility
 * Provides formatted error information for UI display
 */
export class AuthErrorDisplay {
  /**
   * Get formatted error display data for UI
   * @param error The error object
   * @param operation The operation that failed
   * @returns Formatted error display data
   */
  static getErrorDisplayData(error: unknown, operation: string): ErrorDisplayData {
    const errorInfo = AuthErrorHandler.getErrorInfo(error, operation);
    
    return {
      message: errorInfo.message,
      helpText: AuthErrorHandler.getHelpText(error, operation),
      suggestions: AuthErrorHandler.getActionSuggestions(error, operation),
      isRetryable: errorInfo.retryable,
      retryDelay: AuthErrorHandler.isRetryable(error, operation) 
        ? AuthErrorHandler.getRetryDelay(error, operation) 
        : undefined,
      severity: this.mapSeverity(errorInfo.severity)
    };
  }

  /**
   * Map internal severity to display severity
   * @param severity Internal error severity
   * @returns Display severity
   */
  private static mapSeverity(severity: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (severity) {
      case 'LOW':
        return 'low';
      case 'MEDIUM':
        return 'medium';
      case 'HIGH':
        return 'high';
      case 'CRITICAL':
        return 'critical';
      default:
        return 'medium';
    }
  }

  /**
   * Get CSS class for error severity
   * @param severity Error severity
   * @returns CSS class name
   */
  static getSeverityClass(severity: 'low' | 'medium' | 'high' | 'critical'): string {
    switch (severity) {
      case 'low':
        return 'text-yellow-600';
      case 'medium':
        return 'text-orange-600';
      case 'high':
        return 'text-red-600';
      case 'critical':
        return 'text-red-700 font-bold';
      default:
        return 'text-gray-600';
    }
  }

  /**
   * Get icon name for error type
   * @param error The error object
   * @param operation The operation that failed
   * @returns Icon name for UI display
   */
  static getErrorIcon(error: unknown, operation: string): string {
    const errorInfo = AuthErrorHandler.getErrorInfo(error, operation);
    
    switch (errorInfo.type) {
      case ErrorType.AUTHENTICATION:
        return 'lock';
      case ErrorType.AUTHORIZATION:
        return 'shield';
      case ErrorType.VALIDATION:
        return 'form';
      case ErrorType.NETWORK:
        return 'wifi-off';
      case ErrorType.SERVER:
        return 'server';
      case ErrorType.RATE_LIMIT:
        return 'clock';
      case ErrorType.NOT_FOUND:
        return 'search';
      default:
        return 'alert-circle';
    }
  }

  /**
   * Format error message with highlighted keywords
   * @param message Error message
   * @returns HTML formatted message with highlights
   */
  static formatErrorMessage(message: string): string {
    // Highlight important keywords
    return message
      .replace(/password/gi, '<strong>password</strong>')
      .replace(/email/gi, '<strong>email</strong>')
      .replace(/invalid/gi, '<strong>invalid</strong>')
      .replace(/failed/gi, '<strong>failed</strong>');
  }
}

export default AuthErrorDisplay;