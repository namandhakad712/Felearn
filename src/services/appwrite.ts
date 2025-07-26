import { Client, Account, ID } from 'appwrite';
import { APPWRITE_CONFIG } from '../config/appwrite';

// Initialize Appwrite client
export const appwriteClient = new Client();

appwriteClient
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

// Initialize Appwrite services
const account = new Account(appwriteClient);

class AppwriteService {
  async login(email: string, password: string) {
    try {
      // Create email password session
      const session = await account.createEmailSession(email, password);
      
      // Get user details
      const user = await account.get();
      
      // Create magic URL for unverified users
      if (!user.emailVerification) {
        try {
          await account.createMagicURLToken(
            user.$id,
            email,
            window.location.origin + '/app.html#/auth/verify'
          );
          throw new Error('Please verify your email. A new verification link has been sent to your inbox.');
        } catch (error) {
          // Delete the session since email is not verified
          await this.logout();
          throw error;
        }
      }
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async loginWithOAuth(
    provider: string,
    successUrl: string = window.location.origin + '/app.html#/onboarding',
    failureUrl: string = window.location.origin + '/app.html#/auth/login'
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

  async logout() {
    try {
      await account.deleteSession('current');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const user = await account.get();
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async isLoggedIn() {
    try {
      const user = await this.getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }

  async updateEmail(email: string, password: string) {
    try {
      // Validate email format
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Invalid email format');
      }
      
      // Verify current password first
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No authenticated user');
      }
      
      try {
        await this.login(currentUser.email, password);
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

  async updatePassword(password: string, oldPassword: string) {
    try {
      // Validate password strength
      if (!password || password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      // Verify current password first
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No authenticated user');
      }
      
      try {
        await this.login(currentUser.email, oldPassword);
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

  async sendPasswordRecovery(email: string) {
    try {
      await account.createRecovery(email, window.location.origin + '/app.html#/auth/reset-password');
      return true;
    } catch (error) {
      console.error('Send password recovery error:', error);
      throw error;
    }
  }

  async resetPassword(userId: string, secret: string, password: string, confirmPassword: string) {
    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      await account.updateRecovery(userId, secret, password, confirmPassword);
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  async sendEmailVerification() {
    try {
      // Update verification URL to match the route
      await account.createVerification(window.location.origin + '/app.html#/auth/verify');
      return true;
    } catch (error) {
      console.error('Send email verification error:', error);
      throw error;
    }
  }

  async verifyEmail(userId: string, secret: string) {
    try {
      console.log('Starting email verification for user:', userId);
      console.log('Verification secret:', secret);
      await account.updateVerification(userId, secret);
      console.log('Email verification completed successfully');
      return true;
    } catch (error) {
      console.error('Verify email error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const appwriteService = new AppwriteService();