import { appwriteService } from './appwrite';
import { User } from '../types';
import AppwriteErrorHandler, { ErrorType, ErrorSeverity } from '../utils/appwriteErrorHandler';
import AuthErrorHandler from '../utils/authErrorHandler';
import ErrorMessageFormatter from '../utils/errorMessageFormatter';
import AuthLogger from '../utils/authLogger';

/**
 * Authentication Service
 * Handles all authentication operations
 */
export class AuthService {
  /**
   * Register a new user with email and password
   * @param email User's email
   * @param password User's password
   * @returns Promise with the user data
   */
  async register(email: string, password: string): Promise<{ success: boolean; message: string; requiresVerification?: boolean }> {
    try {
      // Log registration attempt
      AuthLogger.logAuthEvent('registration_attempt', { email });
      
      // Register with Appwrite
      await appwriteService.register(email, password);
      
      // Log successful registration
      AuthLogger.logAuthEvent('registration_success', { email });
      
      return {
        success: true,
        message: 'Account created successfully! Please check your email and click the verification link before logging in.',
        requiresVerification: true
      };
    } catch (error: any) {
      // Handle and log registration error
      const errorMessage = AuthErrorHandler.handleRegistrationError(error);
      
      // Log failed registration
      AuthLogger.logAuthEvent('registration_failure', { 
        email, 
        error: errorMessage 
      });
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Verify email with userId and secret from verification link
   * @param userId User ID from verification link
   * @param secret Secret from verification link
   * @returns Promise indicating success
   */
  async verifyEmail(userId: string, secret: string): Promise<void> {
    try {
      await appwriteService.verifyEmail(userId, secret);
      AuthLogger.logAuthEvent('email_verification_success', { userId });
    } catch (error: any) {
      const errorMessage = 'Email verification failed. The link may be expired or invalid.';
      AuthLogger.logAuthEvent('email_verification_failure', { 
        userId, 
        error: errorMessage 
      });
      throw new Error(errorMessage);
    }
  }

  /**
   * Resend verification email
   * @returns Promise indicating success
   */
  async resendVerificationEmail(): Promise<void> {
    try {
      await appwriteService.resendVerificationEmail();
      AuthLogger.logAuthEvent('verification_email_resent', {});
    } catch (error: any) {
      const errorMessage = 'Failed to resend verification email. Please try again later.';
      AuthLogger.logAuthEvent('verification_email_resend_failure', { 
        error: errorMessage 
      });
      throw new Error(errorMessage);
    }
  }

  /**
   * Login with email and password
   * @param email User's email
   * @param password User's password
   * @returns Promise with the user data
   */
  async login(email: string, password: string): Promise<User> {
    try {
      // Log login attempt
      AuthLogger.logAuthEvent('login_attempt', { email });
      
      // Login with Appwrite
      await appwriteService.login(email, password);
      
      // Get the current user
      const user = await appwriteService.getCurrentUser();
      
      if (!user) {
        throw new Error('Failed to get user after login');
      }
      
      // Log successful login
      AuthLogger.logAuthEvent('login_success', { userId: user.$id });
      
      return user;
    } catch (error: any) {
      // Handle and log login error
      const errorMessage = AuthErrorHandler.handleLoginError(error);
      
      // Log failed login
      AuthLogger.logAuthEvent('login_failure', { 
        email, 
        error: errorMessage 
      });
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Login with OAuth provider
   * @param provider OAuth provider (e.g., 'google', 'github')
   */
  loginWithOAuth(provider: string): void {
    try {
      // Log OAuth login attempt
      AuthLogger.logAuthEvent('oauth_login_attempt', { provider });
      
      appwriteService.loginWithOAuth(provider);
    } catch (error: any) {
      // Handle and log OAuth login error
      const errorInfo = AppwriteErrorHandler.handleAuthError(error, { provider });
      const errorMessage = ErrorMessageFormatter.formatAuthError(
        error.message || 'OAuth login failed',
        errorInfo.type
      );
      
      // Log failed OAuth login
      AuthLogger.logAuthEvent('oauth_login_failure', { 
        provider, 
        error: errorMessage 
      });
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Logout the current user
   * @returns Promise indicating success
   */
  async logout(): Promise<void> {
    try {
      // Get current user before logout for logging
      const user = await this.getCurrentUser();
      const userId = user?.$id;
      
      await appwriteService.logout();
      
      // Log successful logout
      AuthLogger.logAuthEvent('logout_success', { userId });
    } catch (error: any) {
      // Handle and log logout error
      const errorMessage = AuthErrorHandler.handleLogoutError(error);
      
      // Log failed logout
      AuthLogger.logAuthEvent('logout_failure', { 
        error: errorMessage 
      });
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Send a password reset email
   * @param email User's email
   * @returns Promise indicating success
   */
  async resetPassword(email: string): Promise<void> {
    try {
      // Log password reset attempt
      AuthLogger.logAuthEvent('password_reset_request', { email });
      
      // Use Appwrite's password recovery
      await appwriteService.resetPassword(email);
      
      // Log successful password reset request
      AuthLogger.logAuthEvent('password_reset_email_sent', { email });
    } catch (error: any) {
      // Handle and log password reset error
      const errorMessage = AuthErrorHandler.handlePasswordResetError(error);
      
      // Log failed password reset
      AuthLogger.logAuthEvent('password_reset_failure', { 
        email, 
        error: errorMessage 
      });
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Get the current user
   * @returns Promise with the current user or null if not logged in
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      return await appwriteService.getCurrentUser();
    } catch (error) {
      // For getCurrentUser, we don't throw errors, just return null
      // But we still log the error
      const errorInfo = AppwriteErrorHandler.handleAuthError(error);
      AuthLogger.logAuthError(error, 'Get current user', undefined, errorInfo.severity);
      return null;
    }
  }

  /**
   * Check if a user is currently authenticated
   * @returns Promise with boolean indicating if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  }

  /**
   * Delete the current user
   * @returns Promise indicating success
   */
  async deleteCurrentUser(): Promise<void> {
    try {
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser) {
        throw new Error('No authenticated user to delete');
      }
      
      const userId = currentUser.$id;
      
      // Log account deletion attempt
      AuthLogger.logAuthEvent('account_deletion_attempt', { userId });
      
      await appwriteService.deleteUser(currentUser.$id);
      
      // Log successful account deletion
      AuthLogger.logAuthEvent('account_deletion_success', { userId });
    } catch (error: any) {
      // Handle and log account deletion error
      const errorInfo = AppwriteErrorHandler.handleAuthError(error);
      const errorMessage = ErrorMessageFormatter.formatAuthError(
        error.message || 'Failed to delete user',
        errorInfo.type
      );
      
      // Log failed account deletion
      AuthLogger.logAuthEvent('account_deletion_failure', { 
        error: errorMessage 
      });
      
      throw new Error(errorMessage);
    }
  }
  
  /**
   * Handle authentication operation with retry for session errors
   * @param operation Function that performs an authentication operation
   * @param operationName Name of the operation for logging
   * @returns Promise with the operation result
   */
  async withSessionErrorHandling<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      return AuthErrorHandler.handleSessionError(error, operationName, operation);
    }
  }
}

// Create and export a singleton instance
export const authService = new AuthService();