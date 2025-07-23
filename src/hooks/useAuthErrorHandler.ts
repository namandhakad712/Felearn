import { useState, useCallback } from 'react';
import AuthErrorHandler from '../utils/authErrorHandler';
import AuthErrorDisplay, { ErrorDisplayData } from '../utils/authErrorDisplay';

/**
 * Hook for handling authentication errors in React components
 * @returns Object with error handling methods and state
 */
export const useAuthErrorHandler = () => {
  const [errorData, setErrorData] = useState<ErrorDisplayData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  /**
   * Handle authentication operation with error handling
   * @param operation Operation name (e.g., 'login', 'register')
   * @param asyncFn Async function to execute
   * @param onSuccess Success callback
   * @returns Promise that resolves with the operation result
   */
  const handleAuthOperation = useCallback(async <T>(
    operation: string,
    asyncFn: () => Promise<T>,
    onSuccess?: (result: T) => void
  ): Promise<T | undefined> => {
    setIsLoading(true);
    setErrorData(null);
    
    try {
      const result = await asyncFn();
      setIsLoading(false);
      onSuccess?.(result);
      return result;
    } catch (error) {
      setIsLoading(false);
      
      // Get formatted error display data
      const displayData = AuthErrorDisplay.getErrorDisplayData(error, operation);
      setErrorData(displayData);
      
      // Log the error
      await AuthErrorHandler.handleError(error, operation);
      
      return undefined;
    }
  }, []);
  
  /**
   * Clear current error
   */
  const clearError = useCallback(() => {
    setErrorData(null);
  }, []);
  
  /**
   * Retry the last failed operation
   * @param operation Operation name
   * @param asyncFn Async function to retry
   * @param onSuccess Success callback
   * @returns Promise that resolves with the operation result
   */
  const retryOperation = useCallback(async <T>(
    operation: string,
    asyncFn: () => Promise<T>,
    onSuccess?: (result: T) => void
  ): Promise<T | undefined> => {
    clearError();
    return handleAuthOperation(operation, asyncFn, onSuccess);
  }, [clearError, handleAuthOperation]);
  
  return {
    errorData,
    isLoading,
    handleAuthOperation,
    clearError,
    retryOperation,
    hasError: !!errorData
  };
};

export default useAuthErrorHandler;