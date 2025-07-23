import { Account, ID } from 'appwrite';
import { appwriteClient } from './appwrite';
import { encryptApiKey, decryptApiKey } from '../utils/encryption';
import { hybridAuthService } from './hybridAuth';

// Initialize Appwrite account service
const account = new Account(appwriteClient);

/**
 * Authentication service for handling user authentication and session management
 */
export class AuthService {
  /**
   * Register a new user with email and password
   * @param email User's email
   * @param password User's password
   * @returns Promise with the created user
   */
  async register(email: string, password: string) {
    try {
      const user = await account.create(ID.unique(), email, password);
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login with email and password
   * @param email User's email
   * @param password User's password
   * @returns Promise with the created session
   */
  async login(email: string, password: string) {
    try {
      const session = await account.createEmailSession(email, password);
      return session;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Login with OAuth provider
   * @param provider OAuth provider (e.g., 'google', 'github')
   * @param successUrl URL to redirect after successful login
   * @param failureUrl URL to redirect after failed login
   */
  loginWithOAuth(
    provider: string,
    successUrl: string = window.location.origin + '/onboarding',
    failureUrl: string = window.location.origin + '/auth/login'
  ) {
    try {
      return account.createOAuth2Session(
        provider,
        successUrl,
        failureUrl
      );
    } catch (error) {
      console.error('OAuth login error:', error);
      throw error;
    }
  }

  /**
   * Logout the current user
   * @returns Promise indicating success
   */
  async logout() {
    try {
      await account.deleteSession('current');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Get the current user
   * @returns Promise with the current user or null if not logged in
   */
  async getCurrentUser() {
    try {
      const user = await account.get();
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Check if the user is logged in
   * @returns Promise with boolean indicating if user is logged in
   */
  async isLoggedIn() {
    try {
      const user = await this.getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update the user's email
   * @param email New email
   * @param password Current password for verification
   * @returns Promise with the updated user
   */
  async updateEmail(email: string, password: string) {
    try {
      // Validate email format
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Invalid email format');
      }
      
      // Verify current password first
      try {
        await this.login(await this.getCurrentUser()?.email || '', password);
      } catch (error) {
        throw new Error('Current password is incorrect');
      }
      
      // Update email
      const user = await account.updateEmail(email, password);
      console.log('Email updated successfully:', user);
      return user;
    } catch (error: any) {
      console.error('Update email error:', error);
      
      // Provide more user-friendly error messages
      if (error.message?.includes('already exists')) {
        throw new Error('This email is already in use');
      } else if (error.message?.includes('password')) {
        throw new Error('Current password is incorrect');
      } else if (error.message?.includes('Invalid email')) {
        throw new Error('Invalid email format');
      } else {
        throw new Error(error.message || 'Failed to update email');
      }
    }
  }

  /**
   * Update the user's password
   * @param password New password
   * @param oldPassword Current password for verification
   * @returns Promise with the updated user
   */
  async updatePassword(password: string, oldPassword: string) {
    try {
      // Validate password strength
      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      // Verify current password first
      try {
        await this.login(await this.getCurrentUser()?.email || '', oldPassword);
      } catch (error) {
        throw new Error('Current password is incorrect');
      }
      
      // Update password
      const user = await account.updatePassword(password, oldPassword);
      console.log('Password updated successfully');
      return user;
    } catch (error: any) {
      console.error('Update password error:', error);
      
      // Provide more user-friendly error messages
      if (error.message?.includes('current password')) {
        throw new Error('Current password is incorrect');
      } else if (error.message?.includes('8 characters')) {
        throw new Error('Password must be at least 8 characters long');
      } else {
        throw new Error(error.message || 'Failed to update password');
      }
    }
  }
  
  /**
   * Verify password
   * @param password Password to verify
   * @returns Promise indicating success
   */
  async verifyPassword(password: string): Promise<boolean> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No authenticated user');
      }
      
      // Try to create a session with the current email and provided password
      await this.login(currentUser.email, password);
      return true;
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }

  /**
   * Send a password reset email
   * @param email User's email
   * @returns Promise indicating success
   */
  async sendPasswordRecovery(email: string) {
    try {
      await account.createRecovery(email, window.location.origin + '/auth/reset-password');
      return true;
    } catch (error) {
      console.error('Send password recovery error:', error);
      throw error;
    }
  }

  /**
   * Reset the user's password with a recovery token
   * @param userId User ID
   * @param token Recovery token
   * @param password New password
   * @param confirmPassword Confirm new password
   * @returns Promise indicating success
   */
  async resetPassword(userId: string, token: string, password: string, confirmPassword: string) {
    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      await account.updateRecovery(userId, token, password, confirmPassword);
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Send email verification
   * @returns Promise indicating success
   */
  async sendEmailVerification() {
    try {
      await account.createVerification(window.location.origin + '/auth/verify-email');
      return true;
    } catch (error) {
      console.error('Send email verification error:', error);
      throw error;
    }
  }

  /**
   * Verify email with a verification token
   * @param userId User ID
   * @param token Verification token
   * @returns Promise indicating success
   */
  async verifyEmail(userId: string, token: string) {
    try {
      await account.updateVerification(userId, token);
      return true;
    } catch (error) {
      console.error('Verify email error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const authService = new AuthService();