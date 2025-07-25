import { AppwriteException } from 'appwrite';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Error types for categorization
 */
export enum ErrorType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NETWORK = 'network',
  SERVER = 'server',
  RATE_LIMIT = 'rate_limit',
  NOT_FOUND = 'not_found',
  UNKNOWN = 'unknown'
}

/**
 * Structured error information
 */
export interface ErrorInfo {
  message: string;
  type: ErrorType;
  severity: ErrorSeverity;
  code?: number;
  retryable: boolean;
  context?: Record<string, any>;
}

/**
 * Appwrite Error Handler
 * Maps Appwrite error codes to user-friendly messages with enhanced error handling
 */
export class AppwriteErrorHandler {
  /**
   * Map authentication error to user-friendly message with detailed error info
   * @param error The error object
   * @param context Additional context about the operation
   * @returns Structured error information
   */
  static handleAuthError(error: unknown, context?: Record<string, any>): ErrorInfo {
    let errorInfo: ErrorInfo = {
      message: 'An error occurred during authentication',
      type: ErrorType.AUTHENTICATION,
      severity: ErrorSeverity.MEDIUM,
      retryable: false,
      context
    };
    
    if (error instanceof AppwriteException) {
      errorInfo.code = error.code;
      
      // Handle specific Appwrite error codes
      switch (error.code) {
        // Authentication errors
        case 401:
          if (error.message.includes('Invalid credentials')) {
            errorInfo.message = 'Invalid email or password';
            errorInfo.type = ErrorType.AUTHENTICATION;
            errorInfo.severity = ErrorSeverity.LOW;
          } else if (error.message.includes('session')) {
            errorInfo.message = 'Your session has expired. Please log in again';
            errorInfo.type = ErrorType.AUTHENTICATION;
            errorInfo.severity = ErrorSeverity.MEDIUM;
            errorInfo.retryable = true;
          } else {
            errorInfo.message = 'Authentication failed';
            errorInfo.type = ErrorType.AUTHENTICATION;
            errorInfo.severity = ErrorSeverity.MEDIUM;
          }
          break;
          
        // Not found errors
        case 404:
          if (error.message.includes('user')) {
            errorInfo.message = 'No account found with this email';
            errorInfo.type = ErrorType.NOT_FOUND;
            errorInfo.severity = ErrorSeverity.LOW;
          } else {
            errorInfo.message = 'Account not found';
            errorInfo.type = ErrorType.NOT_FOUND;
            errorInfo.severity = ErrorSeverity.LOW;
          }
          break;
          
        // Rate limiting
        case 429:
          errorInfo.message = 'Too many login attempts. Please try again in a few minutes';
          errorInfo.type = ErrorType.RATE_LIMIT;
          errorInfo.severity = ErrorSeverity.HIGH;
          errorInfo.retryable = true;
          break;
          
        // Validation errors
        case 400:
          errorInfo.type = ErrorType.VALIDATION;
          errorInfo.severity = ErrorSeverity.LOW;
          
          if (error.message.includes('email')) {
            errorInfo.message = 'Please enter a valid email address';
          } else if (error.message.includes('password')) {
            if (error.message.includes('8 characters')) {
              errorInfo.message = 'Password must be at least 8 characters long';
            } else if (error.message.includes('weak')) {
              errorInfo.message = 'Password is too weak. Please use a stronger password';
            } else {
              errorInfo.message = 'Invalid password format';
            }
          } else if (error.message.includes('name')) {
            errorInfo.message = 'Please enter a valid name';
          } else {
            errorInfo.message = 'Please check your input and try again';
          }
          break;
          
        // Conflict errors (user already exists)
        case 409:
          errorInfo.message = 'An account with this email already exists';
          errorInfo.type = ErrorType.VALIDATION;
          errorInfo.severity = ErrorSeverity.LOW;
          break;
          
        // Authorization errors
        case 403:
          errorInfo.message = 'You do not have permission to perform this action';
          errorInfo.type = ErrorType.AUTHORIZATION;
          errorInfo.severity = ErrorSeverity.MEDIUM;
          break;
          
        // Server errors
        case 500:
        case 502:
        case 503:
        case 504:
          errorInfo.message = 'Server is temporarily unavailable. Please try again later';
          errorInfo.type = ErrorType.SERVER;
          errorInfo.severity = ErrorSeverity.HIGH;
          errorInfo.retryable = true;
          break;
          
        // Network errors
        case 0:
          errorInfo.message = 'Network connection failed. Please check your internet connection';
          errorInfo.type = ErrorType.NETWORK;
          errorInfo.severity = ErrorSeverity.HIGH;
          errorInfo.retryable = true;
          break;
          
        // Default case
        default:
          errorInfo.message = error.message || 'Authentication failed';
          errorInfo.type = ErrorType.UNKNOWN;
          errorInfo.severity = ErrorSeverity.MEDIUM;
      }
    } else if (error instanceof Error) {
      // Handle generic Error objects
      errorInfo.message = error.message;
      errorInfo.type = ErrorType.UNKNOWN;
      errorInfo.severity = ErrorSeverity.MEDIUM;
      
      // Check for network-related errors
      if (error.message.includes('network') || error.message.includes('fetch')) {
        errorInfo.type = ErrorType.NETWORK;
        errorInfo.retryable = true;
      }
    } else if (typeof error === 'string') {
      // Handle string errors
      errorInfo.message = error;
      errorInfo.type = ErrorType.UNKNOWN;
      errorInfo.severity = ErrorSeverity.MEDIUM;
    }
    
    return errorInfo;
  }

  /**
   * Get user-friendly message from error info
   * @param errorInfo Error information object
   * @returns User-friendly error message
   */
  static getErrorMessage(errorInfo: ErrorInfo): string {
    return errorInfo.message;
  }

  /**
   * Check if an error is retryable
   * @param errorInfo Error information object
   * @returns Whether the operation should be retried
   */
  static isRetryable(errorInfo: ErrorInfo): boolean {
    return errorInfo.retryable;
  }

  /**
   * Get retry delay based on error type
   * @param errorInfo Error information object
   * @returns Delay in milliseconds before retry
   */
  static getRetryDelay(errorInfo: ErrorInfo): number {
    switch (errorInfo.type) {
      case ErrorType.RATE_LIMIT:
        return 60000; // 1 minute
      case ErrorType.NETWORK:
        return 5000; // 5 seconds
      case ErrorType.SERVER:
        return 10000; // 10 seconds
      default:
        return 3000; // 3 seconds
    }
  }
  
  /**
   * Map database error to user-friendly message with detailed error info
   * @param error The error object
   * @param context Additional context about the operation
   * @returns Structured error information
   */
  static handleDatabaseError(error: unknown, context?: Record<string, any>): ErrorInfo {
    let errorInfo: ErrorInfo = {
      message: 'An error occurred while accessing data',
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      retryable: false,
      context
    };
    
    if (error instanceof AppwriteException) {
      errorInfo.code = error.code;
      
      // Handle specific Appwrite error codes
      switch (error.code) {
        // Authentication errors
        case 401:
          errorInfo.message = 'You are not authorized to access this data';
          errorInfo.type = ErrorType.AUTHENTICATION;
          errorInfo.severity = ErrorSeverity.MEDIUM;
          break;
          
        // Permission errors
        case 403:
          errorInfo.message = 'You do not have permission to access this data';
          errorInfo.type = ErrorType.AUTHORIZATION;
          errorInfo.severity = ErrorSeverity.MEDIUM;
          break;
          
        // Not found errors
        case 404:
          errorInfo.message = 'The requested data was not found';
          errorInfo.type = ErrorType.NOT_FOUND;
          errorInfo.severity = ErrorSeverity.LOW;
          break;
          
        // Rate limiting
        case 429:
          errorInfo.message = 'Too many requests. Please try again later';
          errorInfo.type = ErrorType.RATE_LIMIT;
          errorInfo.severity = ErrorSeverity.HIGH;
          errorInfo.retryable = true;
          break;
          
        // Server errors
        case 500:
        case 502:
        case 503:
        case 504:
          errorInfo.message = 'Server error. Please try again later';
          errorInfo.type = ErrorType.SERVER;
          errorInfo.severity = ErrorSeverity.HIGH;
          errorInfo.retryable = true;
          break;
          
        // Default case
        default:
          errorInfo.message = error.message || 'Database operation failed';
          errorInfo.type = ErrorType.UNKNOWN;
          errorInfo.severity = ErrorSeverity.MEDIUM;
      }
    } else if (error instanceof Error) {
      // Handle generic Error objects
      errorInfo.message = error.message;
      errorInfo.type = ErrorType.UNKNOWN;
      errorInfo.severity = ErrorSeverity.MEDIUM;
    } else if (typeof error === 'string') {
      // Handle string errors
      errorInfo.message = error;
      errorInfo.type = ErrorType.UNKNOWN;
      errorInfo.severity = ErrorSeverity.MEDIUM;
    }
    
    return errorInfo;
  }
  
  /**
   * Log error with structured information and appropriate logging
   * @param errorInfo Error information object
   * @param operation The operation that failed
   * @param userId Optional user ID for context
   */
  static logError(errorInfo: ErrorInfo, operation: string, userId?: string): void {
    const logLevel = this.getLogLevel(errorInfo.severity);
    const logMessage = `${operation} failed: ${errorInfo.message}`;
    
    const logData = {
      operation,
      error: errorInfo,
      userId,
      timestamp: new Date().toISOString()
    };
    
    // Log based on severity
    switch (logLevel) {
      case 'error':
        console.error(logMessage, logData);
        break;
      case 'warn':
        console.warn(logMessage, logData);
        break;
      case 'info':
        console.info(logMessage, logData);
        break;
      default:
        console.log(logMessage, logData);
    }
    
    // Send critical errors to error reporting service
    if (errorInfo.severity === ErrorSeverity.CRITICAL) {
      this.reportCriticalError(errorInfo, operation, userId);
    }
  }

  /**
   * Get appropriate log level based on error severity
   * @param severity Error severity
   * @returns Log level
   */
  private static getLogLevel(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return 'error';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      case ErrorSeverity.LOW:
        return 'info';
      default:
        return 'log';
    }
  }

  /**
   * Report critical errors to external service
   * @param errorInfo Error information
   * @param operation Operation that failed
   * @param userId Optional user ID
   */
  private static reportCriticalError(errorInfo: ErrorInfo, operation: string, userId?: string): void {
    // In a real implementation, this would send to an error reporting service
    // For now, we'll just log it with additional context
    console.error('CRITICAL ERROR DETECTED:', {
      operation,
      error: errorInfo,
      userId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }

  /**
   * Create a standardized error response for API calls
   * @param errorInfo Error information
   * @returns Standardized error response
   */
  static createErrorResponse(errorInfo: ErrorInfo) {
    return {
      success: false,
      error: {
        message: errorInfo.message,
        type: errorInfo.type,
        severity: errorInfo.severity,
        code: errorInfo.code,
        retryable: errorInfo.retryable
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Handle authentication errors with automatic retry logic
   * @param error The error object
   * @param operation The operation that failed
   * @param retryFn Function to retry the operation
   * @param maxRetries Maximum number of retries
   * @returns Promise that resolves when operation succeeds or max retries reached
   */
  static async handleWithRetry<T>(
    error: unknown,
    operation: string,
    retryFn: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    const errorInfo = this.handleAuthError(error, { operation, maxRetries });
    
    if (!errorInfo.retryable || maxRetries <= 0) {
      throw error;
    }

    const delay = this.getRetryDelay(errorInfo);
    
    // Log retry attempt
    console.warn(`Retrying ${operation} in ${delay}ms. Attempts remaining: ${maxRetries}`);
    
    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
      return await retryFn();
    } catch (retryError) {
      return this.handleWithRetry(retryError, operation, retryFn, maxRetries - 1);
    }
  }
}

export default AppwriteErrorHandler;