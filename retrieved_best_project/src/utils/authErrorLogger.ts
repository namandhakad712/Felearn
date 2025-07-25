import { AppwriteErrorHandler, ErrorInfo, ErrorSeverity, ErrorType } from './appwriteErrorHandler';
import { appwriteService } from '../services/appwrite';

/**
 * Authentication Error Logger
 * Handles logging and reporting of authentication-related errors
 */
export class AuthErrorLogger {
  private static instance: AuthErrorLogger;
  private errorQueue: Array<{
    errorInfo: ErrorInfo;
    operation: string;
    userId?: string;
    timestamp: string;
  }> = [];

  private constructor() {
    // Start periodic error reporting
    this.startPeriodicReporting();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AuthErrorLogger {
    if (!AuthErrorLogger.instance) {
      AuthErrorLogger.instance = new AuthErrorLogger();
    }
    return AuthErrorLogger.instance;
  }

  /**
   * Log authentication error with context
   * @param error The error object
   * @param operation The operation that failed
   * @param userId Optional user ID for context
   * @param additionalContext Additional context information
   */
  async logAuthError(
    error: unknown,
    operation: string,
    userId?: string,
    additionalContext?: Record<string, any>
  ): Promise<void> {
    const errorInfo = AppwriteErrorHandler.handleAuthError(error, {
      operation,
      userId,
      ...additionalContext
    });

    // Log to console
    AppwriteErrorHandler.logError(errorInfo, operation, userId);

    // Add to error queue for batch reporting
    this.errorQueue.push({
      errorInfo,
      operation,
      userId,
      timestamp: new Date().toISOString()
    });

    // Immediately report critical errors
    if (errorInfo.severity === ErrorSeverity.CRITICAL) {
      await this.reportError(errorInfo, operation, userId, additionalContext);
    }
  }

  /**
   * Log successful authentication events for monitoring
   * @param operation The successful operation
   * @param userId User ID
   * @param additionalContext Additional context information
   */
  async logAuthSuccess(
    operation: string,
    userId: string,
    additionalContext?: Record<string, any>
  ): Promise<void> {
    const logData = {
      operation,
      userId,
      timestamp: new Date().toISOString(),
      success: true,
      ...additionalContext
    };

    console.info(`Authentication success: ${operation}`, logData);

    // Report successful operations for analytics
    try {
      await this.reportSuccessfulOperation(operation, userId, additionalContext);
    } catch (error) {
      console.warn('Failed to report successful operation:', error);
    }
  }

  /**
   * Report error to Appwrite error logs collection
   * @param errorInfo Error information
   * @param operation Operation that failed
   * @param userId Optional user ID
   * @param additionalContext Additional context
   */
  private async reportError(
    errorInfo: ErrorInfo,
    operation: string,
    userId?: string,
    additionalContext?: Record<string, any>
  ): Promise<void> {
    try {
      await appwriteService.createErrorReport({
        type: 'frontend',
        message: errorInfo.message,
        stack: this.getStackTrace(),
        userId: userId || '',
        context: {
          operation,
          errorType: errorInfo.type,
          errorCode: errorInfo.code,
          retryable: errorInfo.retryable,
          userAgent: navigator.userAgent,
          url: window.location.href,
          ...additionalContext
        },
        severity: this.mapSeverityToAppwrite(errorInfo.severity)
      });
    } catch (reportError) {
      console.error('Failed to report error to Appwrite:', reportError);
    }
  }

  /**
   * Report successful operation for analytics
   * @param operation Operation name
   * @param userId User ID
   * @param additionalContext Additional context
   */
  private async reportSuccessfulOperation(
    operation: string,
    userId: string,
    additionalContext?: Record<string, any>
  ): Promise<void> {
    // This could be sent to an analytics service
    // For now, we'll just store it locally or send to a success logs collection
    const successData = {
      operation,
      userId,
      timestamp: new Date().toISOString(),
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...additionalContext
      }
    };

    // Store in localStorage for now (in production, send to analytics service)
    const existingLogs = JSON.parse(localStorage.getItem('auth_success_logs') || '[]');
    existingLogs.push(successData);
    
    // Keep only last 100 entries
    if (existingLogs.length > 100) {
      existingLogs.splice(0, existingLogs.length - 100);
    }
    
    localStorage.setItem('auth_success_logs', JSON.stringify(existingLogs));
  }

  /**
   * Get current stack trace
   * @returns Stack trace string
   */
  private getStackTrace(): string {
    try {
      throw new Error();
    } catch (error) {
      return (error as Error).stack || '';
    }
  }

  /**
   * Map internal severity to Appwrite severity format
   * @param severity Internal error severity
   * @returns Appwrite severity format
   */
  private mapSeverityToAppwrite(severity: ErrorSeverity): 'low' | 'medium' | 'high' | 'critical' {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'low';
      case ErrorSeverity.MEDIUM:
        return 'medium';
      case ErrorSeverity.HIGH:
        return 'high';
      case ErrorSeverity.CRITICAL:
        return 'critical';
      default:
        return 'medium';
    }
  }

  /**
   * Start periodic error reporting for batched errors
   */
  private startPeriodicReporting(): void {
    setInterval(async () => {
      if (this.errorQueue.length > 0) {
        const errorsToReport = [...this.errorQueue];
        this.errorQueue = [];

        for (const errorData of errorsToReport) {
          // Only report medium and high severity errors in batches
          if (errorData.errorInfo.severity === ErrorSeverity.MEDIUM || 
              errorData.errorInfo.severity === ErrorSeverity.HIGH) {
            await this.reportError(
              errorData.errorInfo,
              errorData.operation,
              errorData.userId
            );
          }
        }
      }
    }, 30000); // Report every 30 seconds
  }

  /**
   * Get authentication error statistics
   * @returns Error statistics
   */
  getErrorStatistics(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    recentErrors: Array<{
      operation: string;
      message: string;
      timestamp: string;
    }>;
  } {
    const recentErrors = this.errorQueue.slice(-10).map(error => ({
      operation: error.operation,
      message: error.errorInfo.message,
      timestamp: error.timestamp
    }));

    const errorsByType: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};

    this.errorQueue.forEach(error => {
      errorsByType[error.errorInfo.type] = (errorsByType[error.errorInfo.type] || 0) + 1;
      errorsBySeverity[error.errorInfo.severity] = (errorsBySeverity[error.errorInfo.severity] || 0) + 1;
    });

    return {
      totalErrors: this.errorQueue.length,
      errorsByType,
      errorsBySeverity,
      recentErrors
    };
  }

  /**
   * Clear error queue (useful for testing or manual cleanup)
   */
  clearErrorQueue(): void {
    this.errorQueue = [];
  }
}

// Export singleton instance
export const authErrorLogger = AuthErrorLogger.getInstance();