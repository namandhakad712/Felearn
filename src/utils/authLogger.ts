import { appwriteService } from '../services/appwrite';
import { ErrorSeverity } from './appwriteErrorHandler';

/**
 * Log levels for authentication events
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

/**
 * Authentication event types
 */
export enum AuthEventType {
  LOGIN_ATTEMPT = 'login_attempt',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  REGISTRATION_ATTEMPT = 'registration_attempt',
  REGISTRATION_SUCCESS = 'registration_success',
  REGISTRATION_FAILURE = 'registration_failure',
  PASSWORD_RESET_REQUEST = 'password_reset_request',
  PASSWORD_RESET_SUCCESS = 'password_reset_success',
  PASSWORD_RESET_FAILURE = 'password_reset_failure',
  SESSION_EXPIRED = 'session_expired',
  SESSION_REFRESH = 'session_refresh'
}

/**
 * Authentication Logger
 * Handles logging of authentication events and errors
 */
export class AuthLogger {
  /**
   * Log an authentication event with string event type
   * @param eventType String event type
   * @param data Additional event data
   * @param level Log level string
   */
  static logAuthEvent(
    eventType: string,
    data?: Record<string, any>,
    level: string = 'info'
  ): void {
    const logLevel = this.getLogLevelFromString(level);
    const message = this.getDefaultMessageForEvent(eventType);
    
    const logData = {
      eventType,
      timestamp: new Date().toISOString(),
      ...data
    };

    // Log to console based on level
    switch (logLevel) {
      case LogLevel.DEBUG:
        console.debug(`Auth Event [${eventType}]: ${message}`, logData);
        break;
      case LogLevel.INFO:
        console.info(`Auth Event [${eventType}]: ${message}`, logData);
        break;
      case LogLevel.WARN:
        console.warn(`Auth Event [${eventType}]: ${message}`, logData);
        break;
      case LogLevel.ERROR:
        console.error(`Auth Event [${eventType}]: ${message}`, logData);
        break;
    }

    // For important events, report to server
    if (logLevel === LogLevel.ERROR || this.isImportantEventString(eventType)) {
      this.reportAuthEventString(eventType, message, data);
    }
  }

  /**
   * Log an authentication event with enum event type
   * @param eventType Type of authentication event
   * @param message Event message
   * @param data Additional event data
   * @param level Log level
   */
  static logAuthEventEnum(
    eventType: AuthEventType,
    message: string,
    data?: Record<string, any>,
    level: LogLevel = LogLevel.INFO
  ): void {
    const logData = {
      eventType,
      message,
      timestamp: new Date().toISOString(),
      ...data
    };

    // Log to console based on level
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`Auth Event [${eventType}]: ${message}`, logData);
        break;
      case LogLevel.INFO:
        console.info(`Auth Event [${eventType}]: ${message}`, logData);
        break;
      case LogLevel.WARN:
        console.warn(`Auth Event [${eventType}]: ${message}`, logData);
        break;
      case LogLevel.ERROR:
        console.error(`Auth Event [${eventType}]: ${message}`, logData);
        break;
    }

    // For important events, report to server
    if (level === LogLevel.ERROR || this.isImportantEvent(eventType)) {
      this.reportAuthEvent(eventType, message, data);
    }
  }

  /**
   * Log an authentication error
   * @param error The error object
   * @param operation The operation that failed
   * @param userId Optional user ID
   * @param severity Error severity
   */
  static logAuthError(
    error: unknown,
    operation: string,
    userId?: string,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM
  ): void {
    let errorMessage = 'Unknown error';
    let errorCode: number | undefined;
    let errorStack: string | undefined;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = error.stack;
      // @ts-ignore - Check for code property that might exist on custom errors
      errorCode = error.code;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    const logData = {
      operation,
      error: {
        message: errorMessage,
        code: errorCode,
        stack: errorStack
      },
      userId,
      timestamp: new Date().toISOString()
    };

    console.error(`Auth Error [${operation}]: ${errorMessage}`, logData);

    // Report authentication error to the server
    this.reportAuthErrorWithSeverity(errorMessage, operation, errorCode, severity, userId);
  }

  /**
   * Log an authentication error with event type
   * @param eventType Type of authentication event
   * @param error The error object
   * @param context Additional context
   */
  static logAuthErrorWithEvent(
    eventType: AuthEventType,
    error: unknown,
    context?: Record<string, any>
  ): void {
    let errorMessage = 'Unknown error';
    let errorCode: number | undefined;
    let errorStack: string | undefined;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = error.stack;
      // @ts-ignore - Check for code property that might exist on custom errors
      errorCode = error.code;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    const logData = {
      eventType,
      error: {
        message: errorMessage,
        code: errorCode,
        stack: errorStack
      },
      context,
      timestamp: new Date().toISOString()
    };

    console.error(`Auth Error [${eventType}]: ${errorMessage}`, logData);

    // Report all authentication errors to the server
    this.reportAuthError(eventType, errorMessage, errorCode, context);
  }

  /**
   * Get default message for an event type
   * @param eventType String event type
   * @returns Default message for the event
   */
  private static getDefaultMessageForEvent(eventType: string): string {
    switch (eventType) {
      case 'login_attempt':
        return 'User login attempt';
      case 'login_success':
        return 'User logged in successfully';
      case 'login_failure':
        return 'User login failed';
      case 'logout_success':
        return 'User logged out successfully';
      case 'logout_failure':
        return 'User logout failed';
      case 'registration_attempt':
        return 'User registration attempt';
      case 'registration_success':
        return 'User registered successfully';
      case 'registration_failure':
        return 'User registration failed';
      case 'password_reset_request':
        return 'Password reset requested';
      case 'password_reset_email_sent':
        return 'Password reset email sent';
      case 'password_reset_failure':
        return 'Password reset failed';
      case 'oauth_login_attempt':
        return 'OAuth login attempt';
      case 'oauth_login_failure':
        return 'OAuth login failed';
      case 'account_deletion_attempt':
        return 'Account deletion attempt';
      case 'account_deletion_success':
        return 'Account deleted successfully';
      case 'account_deletion_failure':
        return 'Account deletion failed';
      default:
        return `Authentication event: ${eventType}`;
    }
  }

  /**
   * Convert string log level to enum
   * @param level String log level
   * @returns LogLevel enum value
   */
  private static getLogLevelFromString(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'debug':
        return LogLevel.DEBUG;
      case 'info':
        return LogLevel.INFO;
      case 'warn':
      case 'warning':
        return LogLevel.WARN;
      case 'error':
        return LogLevel.ERROR;
      default:
        return LogLevel.INFO;
    }
  }

  /**
   * Check if a string event type is important
   * @param eventType String event type
   * @returns Boolean indicating if it's an important event
   */
  private static isImportantEventString(eventType: string): boolean {
    const importantEvents = [
      'login_failure',
      'registration_failure',
      'password_reset_failure',
      'session_expired',
      'account_deletion_failure',
      'oauth_login_failure'
    ];
    
    return importantEvents.includes(eventType);
  }

  /**
   * Report authentication event with string event type
   * @param eventType String event type
   * @param message Event message
   * @param data Additional event data
   */
  private static async reportAuthEventString(
    eventType: string,
    message: string,
    data?: Record<string, any>
  ): Promise<void> {
    try {
      // Get current user ID if available
      let userId = '';
      try {
        const user = await appwriteService.getCurrentUser();
        if (user) {
          userId = user.$id;
        }
      } catch (e) {
        // Ignore errors getting user ID
      }

      // Only report to server if it's an important event
      if (this.isImportantEventString(eventType)) {
        await appwriteService.createErrorReport({
          type: 'frontend',
          message: `Auth Event: ${message}`,
          userId,
          context: {
            eventType,
            ...data,
            userAgent: navigator.userAgent,
            url: window.location.href
          },
          severity: ErrorSeverity.LOW
        });
      }
    } catch (error) {
      // Don't let reporting errors affect the user experience
      console.error('Failed to report authentication event:', error);
    }
  }

  /**
   * Check if an event is important enough to report to server
   * @param eventType Type of authentication event
   * @returns Boolean indicating if it's an important event
   */
  private static isImportantEvent(eventType: AuthEventType): boolean {
    const importantEvents = [
      AuthEventType.LOGIN_FAILURE,
      AuthEventType.REGISTRATION_FAILURE,
      AuthEventType.PASSWORD_RESET_FAILURE,
      AuthEventType.SESSION_EXPIRED
    ];
    
    return importantEvents.includes(eventType);
  }

  /**
   * Report authentication event to server
   * @param eventType Type of authentication event
   * @param message Event message
   * @param data Additional event data
   */
  private static async reportAuthEvent(
    eventType: AuthEventType,
    message: string,
    data?: Record<string, any>
  ): Promise<void> {
    try {
      // Get current user ID if available
      let userId = '';
      try {
        const user = await appwriteService.getCurrentUser();
        if (user) {
          userId = user.$id;
        }
      } catch (e) {
        // Ignore errors getting user ID
      }

      // Only report to server if it's an important event
      if (this.isImportantEvent(eventType)) {
        await appwriteService.createErrorReport({
          type: 'frontend',
          message: `Auth Event: ${message}`,
          userId,
          context: {
            eventType,
            ...data,
            userAgent: navigator.userAgent,
            url: window.location.href
          },
          severity: ErrorSeverity.LOW
        });
      }
    } catch (error) {
      // Don't let reporting errors affect the user experience
      console.error('Failed to report authentication event:', error);
    }
  }

  /**
   * Report authentication error to server
   * @param eventType Type of authentication event
   * @param errorMessage Error message
   * @param errorCode Error code if available
   * @param context Additional context
   */
  private static async reportAuthError(
    eventType: AuthEventType,
    errorMessage: string,
    errorCode?: number,
    context?: Record<string, any>
  ): Promise<void> {
    try {
      // Get current user ID if available
      let userId = '';
      try {
        const user = await appwriteService.getCurrentUser();
        if (user) {
          userId = user.$id;
        }
      } catch (e) {
        // Ignore errors getting user ID
      }

      // Determine severity based on error type
      let severity = ErrorSeverity.MEDIUM;
      if (
        eventType === AuthEventType.LOGIN_FAILURE && 
        (errorCode === 401 || errorCode === 404)
      ) {
        // Invalid credentials are low severity
        severity = ErrorSeverity.LOW;
      } else if (errorCode === 0 || errorCode === 500) {
        // Network or server errors are high severity
        severity = ErrorSeverity.HIGH;
      }

      await appwriteService.createErrorReport({
        type: 'frontend',
        message: `Auth Error [${eventType}]: ${errorMessage}`,
        userId,
        context: {
          eventType,
          errorCode,
          ...context,
          userAgent: navigator.userAgent,
          url: window.location.href
        },
        severity
      });
    } catch (error) {
      // Don't let reporting errors affect the user experience
      console.error('Failed to report authentication error:', error);
    }
  }

  /**
   * Report authentication error with severity
   * @param errorMessage Error message
   * @param operation Operation that failed
   * @param errorCode Error code if available
   * @param severity Error severity
   * @param userId Optional user ID
   */
  private static async reportAuthErrorWithSeverity(
    errorMessage: string,
    operation: string,
    errorCode?: number,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    userId?: string
  ): Promise<void> {
    try {
      // If userId is not provided, try to get it
      if (!userId) {
        try {
          const user = await appwriteService.getCurrentUser();
          if (user) {
            userId = user.$id;
          }
        } catch (e) {
          // Ignore errors getting user ID
        }
      }

      // Only report medium, high, and critical errors
      if (severity === ErrorSeverity.LOW) {
        return;
      }

      await appwriteService.createErrorReport({
        type: 'frontend',
        message: `Auth Error [${operation}]: ${errorMessage}`,
        userId: userId || '',
        context: {
          operation,
          errorCode,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        },
        severity
      });
    } catch (error) {
      // Don't let reporting errors affect the user experience
      console.error('Failed to report authentication error:', error);
    }
  }

  /**
   * Convenience method for warning logs
   */
  static warn(message: string, data?: Record<string, any>): void {
    console.warn(`[AUTH WARNING] ${message}`, data);
  }

  /**
   * Convenience method for error logs
   */
  static error(message: string, error?: any, data?: Record<string, any>): void {
    console.error(`[AUTH ERROR] ${message}`, error, data);
  }

  /**
   * Convenience method for debug logs
   */
  static debug(message: string, data?: Record<string, any>): void {
    console.debug(`[AUTH DEBUG] ${message}`, data);
  }
}

export default AuthLogger;