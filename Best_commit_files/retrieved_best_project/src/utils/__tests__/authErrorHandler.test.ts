import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppwriteException } from 'appwrite';
import AuthErrorHandler from '../authErrorHandler';
import { ErrorType, ErrorSeverity } from '../appwriteErrorHandler';

// Mock appwriteService
vi.mock('../../services/appwrite', () => ({
  appwriteService: {
    createErrorReport: vi.fn().mockResolvedValue({}),
  },
}));

describe('Auth Error Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Error Handling', () => {
    it('should handle registration errors', async () => {
      // Test email already exists error
      const emailExistsError = new AppwriteException('Email already exists', 409);
      const emailExistsMessage = AuthErrorHandler.handleRegistrationError(emailExistsError);
      expect(emailExistsMessage).toContain('already exists');
      
      // Test weak password error
      const weakPasswordError = new AppwriteException('Password is too weak', 400);
      const weakPasswordMessage = AuthErrorHandler.handleRegistrationError(weakPasswordError);
      expect(weakPasswordMessage).toContain('Password is too weak');
      
      // Test invalid email error
      const invalidEmailError = new AppwriteException('Invalid email', 400);
      const invalidEmailMessage = AuthErrorHandler.handleRegistrationError(invalidEmailError);
      expect(invalidEmailMessage).toContain('valid email');
    });
    
    it('should handle login errors', async () => {
      // Test invalid credentials error
      const invalidCredentialsError = new AppwriteException('Invalid credentials', 401);
      const invalidCredentialsMessage = AuthErrorHandler.handleLoginError(invalidCredentialsError);
      expect(invalidCredentialsMessage).toContain('Invalid email or password');
      
      // Test user not found error
      const userNotFoundError = new AppwriteException('User not found', 404);
      const userNotFoundMessage = AuthErrorHandler.handleLoginError(userNotFoundError);
      expect(userNotFoundMessage).toContain('No account found');
      
      // Test rate limit error
      const rateLimitError = new AppwriteException('Too many requests', 429);
      const rateLimitMessage = AuthErrorHandler.handleLoginError(rateLimitError);
      expect(rateLimitMessage).toContain('Too many login attempts');
    });
    
    it('should handle password reset errors', async () => {
      // Test user not found error
      const userNotFoundError = new AppwriteException('User not found', 404);
      const userNotFoundMessage = AuthErrorHandler.handlePasswordResetError(userNotFoundError);
      expect(userNotFoundMessage).toContain('No account found');
      
      // Test invalid email error
      const invalidEmailError = new AppwriteException('Invalid email', 400);
      const invalidEmailMessage = AuthErrorHandler.handlePasswordResetError(invalidEmailError);
      expect(invalidEmailMessage).toContain('valid email');
    });
    
    it('should handle logout errors', async () => {
      // Test any logout error
      const logoutError = new Error('Logout failed');
      const logoutMessage = AuthErrorHandler.handleLogoutError(logoutError);
      expect(logoutMessage).toContain('Unable to log out');
    });
  });

  describe('Error Classification', () => {
    it('should correctly classify network errors as retryable', async () => {
      const networkError = new Error('Network connection failed');
      const isRetryable = AuthErrorHandler.isRetryable(networkError, 'login');
      expect(isRetryable).toBe(true);
    });
    
    it('should correctly classify validation errors as non-retryable', async () => {
      const validationError = new AppwriteException('Invalid email', 400);
      const isRetryable = AuthErrorHandler.isRetryable(validationError, 'login');
      expect(isRetryable).toBe(false);
    });
    
    it('should correctly classify server errors as retryable', async () => {
      const serverError = new AppwriteException('Server error', 500);
      const isRetryable = AuthErrorHandler.isRetryable(serverError, 'login');
      expect(isRetryable).toBe(true);
    });
  });

  describe('Retry Logic', () => {
    it('should retry operations that are retryable', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new AppwriteException('Server error', 500))
        .mockResolvedValueOnce('success');
      
      const result = await AuthErrorHandler.handleWithRetry(
        new AppwriteException('Server error', 500),
        'test_operation',
        operation,
        1
      );
      
      expect(operation).toHaveBeenCalledTimes(1);
      expect(result).toBe('success');
    });
    
    it('should not retry operations that are not retryable', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      
      await expect(
        AuthErrorHandler.handleWithRetry(
          new AppwriteException('Invalid input', 400),
          'test_operation',
          operation,
          1
        )
      ).rejects.toThrow();
      
      expect(operation).not.toHaveBeenCalled();
    });
    
    it('should stop retrying after max retries', async () => {
      const operation = vi.fn()
        .mockRejectedValue(new AppwriteException('Server error', 500));
      
      await expect(
        AuthErrorHandler.handleWithRetry(
          new AppwriteException('Server error', 500),
          'test_operation',
          operation,
          1
        )
      ).rejects.toThrow();
      
      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Reporting', () => {
    it('should report critical errors', async () => {
      const criticalError = new AppwriteException('Critical server error', 500);
      
      await AuthErrorHandler.reportAuthError(criticalError, 'login', 'user-id');
      
      // Check that createErrorReport was called
      const { appwriteService } = await import('../../services/appwrite');
      expect(appwriteService.createErrorReport).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'frontend',
          message: expect.stringContaining('Authentication error'),
          userId: 'user-id',
        })
      );
    });
  });
});