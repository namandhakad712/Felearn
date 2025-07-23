import { errorReportingService } from '../services/errorReporting';

/**
 * Utility for testing error reporting
 */
export const testErrorReporting = {
  /**
   * Test error reporting by triggering a test error
   */
  triggerTestError(): void {
    try {
      // Deliberately throw an error for testing
      throw new Error('This is a test error from the error reporting system');
    } catch (error) {
      if (error instanceof Error) {
        errorReportingService.captureException(error, {
          source: 'testErrorReporting',
          test: true,
          timestamp: new Date().toISOString()
        });
      }
      console.log('Test error reported successfully');
    }
  },
  
  /**
   * Test error reporting by triggering a test message
   * @param level Severity level
   */
  triggerTestMessage(level: 'info' | 'warning' | 'error' = 'info'): void {
    errorReportingService.captureMessage(
      `This is a test ${level} message from the error reporting system`,
      level,
      {
        source: 'testErrorReporting',
        test: true,
        timestamp: new Date().toISOString()
      }
    );
    console.log(`Test ${level} message reported successfully`);
  }
};