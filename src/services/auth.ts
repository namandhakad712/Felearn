import { Account, ID, Models, OAuthProvider } from 'appwrite';

// Debug: Check if OAuthProvider is imported correctly
console.log('🔍 OAuthProvider check:', {
  Google: OAuthProvider.Google,
  Github: OAuthProvider.Github,
  available: Object.keys(OAuthProvider)
});
import { account } from '@/lib/appwrite';
import { databaseService } from './database';
import { extractNameFromEmail } from '@/utils/userUtils';
import { getAuthUrls, logAppConfig } from '@/config/app';

export interface AuthResponse {
  success: boolean;
  user?: Models.User<Models.Preferences>;
  session?: Models.Session;
  requiresVerification?: boolean;
  message: string;
}

export class AuthService {
  private account: Account;

  constructor() {
    this.account = account;
  }



  /**
   * Register a new user
   */
  async register(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('Starting registration process for:', email);
      console.log('Password length:', password.length);
      console.log('Using ID.unique():', ID.unique());

      // Skip user existence check - let Appwrite handle duplicates

      // Generate a simple, guaranteed valid user ID
      const userId = 'user' + Date.now().toString();
      console.log('Generated userId:', userId, 'Length:', userId.length);

      const user = await this.account.create(userId, email, password);

      // Create user document in database collection
      try {
        await databaseService.createUserDocument(userId, {
          email: email,
          name: extractNameFromEmail(email),
          geminiKey: '', // Will be set during onboarding
          lastLogin: new Date().toISOString(),
          isAdmin: false,
          createdAt: new Date().toISOString(),
          emailVerification: false,
          disabled: false,
          onboardingcompleted: false
        });
      } catch (dbError) {
        console.error('Failed to create user document:', dbError);
        // Continue with registration even if database creation fails
      }

      // Try to send verification email, but don't fail if it doesn't work
      try {
        await this.account.createVerification(getAuthUrls().verify);
        return {
          success: true,
          user,
          requiresVerification: true,
          message: 'Account created! Please check your email to verify your account.'
        };
      } catch (verificationError) {
        console.error('Failed to send verification email:', verificationError);
        return {
          success: true,
          user,
          requiresVerification: true,
          message: 'Account created! Verification email will be sent when you first login.'
        };
      }
    } catch (error: any) {
      console.error('Registration error:', error);

      // Handle specific error cases
      if (error.message?.includes('already exists')) {
        throw new Error('An account with this email already exists. Please log in instead.');
      }

      // Pass through the original error without password validation
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('=== LOGIN DEBUG ===');
      console.log('Email:', email);
      console.log('Email length:', email.length);
      console.log('Password length:', password.length);
      console.log('Email valid format:', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
      console.log('About to call createSession...');

      // Create session using email/password
      console.log('Calling createEmailPasswordSession with email and password...');
      const session = await this.account.createEmailPasswordSession(email, password);

      // Get user details
      const user = await this.account.get();

      // Check email verification
      if (!user.emailVerification) {
        try {
          // Send new verification email
          await this.account.createVerification(getAuthUrls().verify);
        } catch (verificationError) {
          console.error('Failed to send verification email:', verificationError);
        }

        // Delete session since email isn't verified
        await this.account.deleteSession('current');

        return {
          success: false,
          message: 'Please verify your email. A new verification link has been sent.'
        };
      }

      return {
        success: true,
        user,
        session,
        message: 'Login successful!'
      };
    } catch (error: any) {
      console.error('Login error:', error);

      if (error?.code === 401) {
        throw new Error('Invalid email or password.');
      }

      throw error;
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(userId: string, secret: string): Promise<AuthResponse> {
    try {
      // Use the userId as-is from Appwrite's verification URL
      await this.account.updateVerification(userId, secret);
      const user = await this.account.get();

      return {
        success: true,
        user,
        message: 'Email verified successfully!'
      };
    } catch (error: any) {
      console.error('Verification error:', error);
      console.log('Error code:', error.code);
      console.log('Error message:', error.message);

      if (error.code === 401) {
        throw new Error('Verification link has expired. Please request a new one.');
      }

      if (error.message?.includes('already verified')) {
        return {
          success: true,
          message: 'Email is already verified!'
        };
      }

      throw error;
    }
  }

  /**
   * OAuth login
   */
  async createOAuthSession(provider: string): Promise<void> {
    try {
      console.log(`🚀 Creating OAuth session for: ${provider}`);
      
      let oauthProvider;
      switch (provider.toLowerCase()) {
        case 'google':
          oauthProvider = OAuthProvider.Google;
          console.log('📱 Using Google OAuth provider');
          break;
        case 'github':
          oauthProvider = OAuthProvider.Github;
          console.log('📱 Using GitHub OAuth provider');
          break;
        default:
          throw new Error(`Unsupported OAuth provider: ${provider}`);
      }

      // Create OAuth2 session with universal URLs
      const urls = getAuthUrls();
      console.log('🌐 OAuth URLs:', urls);
      logAppConfig(); // Debug: show current configuration
      
      console.log('🔄 Calling createOAuth2Session...');
      this.account.createOAuth2Session(
        oauthProvider,
        urls.callback, // Universal success redirect
        urls.login,    // Universal failure redirect
        ['email'] // Request email scope
      );
      console.log('✅ OAuth session creation initiated');
    } catch (error) {
      console.error('❌ OAuth error:', error);
      throw error;
    }
  }

  /**
   * Handle OAuth callback and create user document if needed
   */
  async handleOAuthCallback(): Promise<AuthResponse> {
    try {
      const user = await this.account.get();
      
      if (user) {
        // Get current session to determine OAuth provider
        let oauthProvider = 'oauth';
        try {
          const session = await this.account.getSession('current');
          oauthProvider = session.provider || 'oauth';
        } catch (sessionError) {
          console.error('Could not get session info:', sessionError);
        }

        // Check if user document exists, create if not
        try {
          const userDoc = await databaseService.getUserDocument(user.$id);
          if (!userDoc) {
            // Create user document for OAuth user
            await databaseService.createUserDocument(user.$id, {
              email: user.email,
              name: user.name || extractNameFromEmail(user.email),
              geminiKey: '', // Will be set during onboarding
              lastLogin: new Date().toISOString(),
              isAdmin: false,
              createdAt: new Date().toISOString(),
              emailVerification: user.emailVerification || true, // OAuth users are usually verified
              disabled: false,
              onboardingcompleted: false,
              oauthProvider: oauthProvider
            });
          } else {
            // Update last login and OAuth provider
            await databaseService.updateUserDocument(user.$id, {
              lastLogin: new Date().toISOString(),
              oauthProvider: oauthProvider
            });
          }
        } catch (dbError) {
          console.error('Failed to handle OAuth user document:', dbError);
        }

        return {
          success: true,
          user,
          message: 'OAuth login successful!'
        };
      }

      throw new Error('No user found after OAuth callback');
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await this.account.deleteSession('current');
    } catch (error: any) {
      // Don't log 401 errors as they're expected when not logged in
      if (error?.code !== 401) {
        console.error('Logout error:', error);
        throw error;
      }
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
    try {
      return await this.account.get();
    } catch (error: any) {
      // Don't log 401 errors as they're expected when not logged in
      if (error?.code !== 401) {
        console.error('Get current user error:', error);
      }
      return null;
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<AuthResponse> {
    try {
      await this.account.createRecovery(
        email,
        getAuthUrls().resetPassword
      );

      return {
        success: true,
        message: 'Password reset instructions have been sent to your email.'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  /**
   * Complete password reset
   */
  async completePasswordReset(
    userId: string,
    secret: string,
    password: string
  ): Promise<AuthResponse> {
    try {
      // Use the userId as-is from Appwrite's password reset URL
      await this.account.updateRecovery(userId, secret, password);

      return {
        success: true,
        message: 'Password has been reset successfully. You can now log in.'
      };
    } catch (error) {
      console.error('Complete password reset error:', error);
      throw error;
    }
  }

  /**
   * Update user email
   */
  async updateEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      await this.account.updateEmail(email, password);
      return {
        success: true,
        message: 'Email updated successfully. Please verify your new email.'
      };
    } catch (error) {
      console.error('Update email error:', error);
      throw error;
    }
  }

  /**
   * Update user password
   */
  async updatePassword(newPassword: string, oldPassword: string): Promise<AuthResponse> {
    try {
      await this.account.updatePassword(newPassword, oldPassword);
      return {
        success: true,
        message: 'Password updated successfully.'
      };
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(): Promise<AuthResponse> {
    try {
      await this.account.createVerification(getAuthUrls().verify);
      return {
        success: true,
        message: 'Verification email sent. Please check your inbox.'
      };
    } catch (error) {
      console.error('Send email verification error:', error);
      throw error;
    }
  }

  /**
   * Update user document in database collection
   */
  async updateUser(data: any): Promise<void> {
    try {
      const user = await this.account.get();
      if (!user) {
        throw new Error('User not authenticated');
      }

      await databaseService.updateUserDocument(user.$id, data);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }
}