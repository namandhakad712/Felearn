import { Account, Models, OAuthProvider } from 'appwrite';

// OAuthProvider validation - removed debug logging for production
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
      // Starting registration process

      // Skip user existence check - let Appwrite handle duplicates

      // Generate a simple, guaranteed valid user ID
      const userId = 'user' + Date.now().toString();
      // Generated userId

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
      // Login validation - debug logging removed for production

      // Create session using email/password
      // Creating email password session
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
      // Verifying email with userId and secret
      
      // Use the userId as-is from Appwrite's verification URL
      await this.account.updateVerification(userId, secret);
      
      // Try to get updated user info, but don't fail if user is not logged in
      try {
        const user = await this.account.get();
        // Email verification successful
        return {
          success: true,
          user,
          message: 'Email verified successfully! You can now access all features.'
        };
      } catch (getUserError: any) {
        // If we can't get user info (user not logged in), verification still succeeded
        // Email verification successful, but user not logged in
        return {
          success: true,
          message: 'Email verified successfully! Please log in to continue.'
        };
      }
    } catch (error: any) {
      console.error('❌ Verification error:', error);
      console.log('Error code:', error.code);
      console.log('Error message:', error.message);
      console.log('Error type:', error.type);

      // Check if email is already verified (this should be SUCCESS, not error)
      if (error.message?.includes('already verified') || 
          error.message?.includes('User already verified') ||
          error.message?.includes('email verification') ||
          error.type === 'user_already_verified') {
        // Email already verified - treating as success
        return {
          success: true,
          message: 'Your email is already verified! Please log in to continue.'
        };
      }

      // Handle different 401 error types
      if (error.code === 401) {
        if (error.type === 'general_unauthorized_scope') {
          // This might mean the email is already verified or there's a scope issue
          // Unauthorized scope error - checking if email is already verified
          return {
            success: true,
            message: 'Your email verification is complete! Please log in to access your account.'
          };
        } else if (error.type === 'user_invalid_token' || error.message?.includes('Invalid token')) {
          return {
            success: false,
            message: 'This verification link is invalid or has already been used. If your email is not verified, please request a new verification email.'
          };
        } else {
          return {
            success: false,
            message: 'This verification link has expired. Please request a new verification email from your account settings.'
          };
        }
      }
      
      // Handle invalid links
      if (error.code === 400) {
        return {
          success: false,
          message: 'This verification link is invalid. Please check your email for the correct link or request a new one.'
        };
      }

      // For other errors, return a generic message
      return {
        success: false,
        message: 'Email verification failed. Please try again or request a new verification link.'
      };
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
      console.log('🌐 OAuth URLs:', {
        callback: urls.callback,
        login: urls.login,
        verify: urls.verify,
        resetPassword: urls.resetPassword
      });
      logAppConfig(); // Debug: show current configuration
      
      console.log('🔗 Creating OAuth2 session with provider:', oauthProvider);
      // Calling createOAuth2Session
      this.account.createOAuth2Session(
        oauthProvider,
        urls.callback, // Universal success redirect
        urls.login,    // Universal failure redirect
        ['email'] // Request email scope
      );
      console.log('✅ OAuth session creation initiated');
      // OAuth session creation initiated
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
      console.log('🔄 Starting OAuth callback handling...');
      
      const user = await this.account.get();
      console.log('👤 User from account.get():', user ? 'Found' : 'Not found');
      
      if (user) {
        console.log('✅ User found, processing OAuth callback...');
        
        // Get current session to determine OAuth provider
        let oauthProvider = 'oauth';
        try {
          const session = await this.account.getSession('current');
          oauthProvider = session.provider || 'oauth';
          console.log('🔗 Session provider:', oauthProvider);
        } catch (sessionError) {
          console.error('Could not get session info:', sessionError);
        }

        // Check if user document exists, create if not
        try {
          console.log('📊 Checking user document in database...');
          let userDoc;
          try {
            userDoc = await databaseService.getUserDocument(user.$id);
            console.log('📄 User document:', userDoc ? 'Found' : 'Not found');
          } catch (error) {
            console.log('❌ Error getting user document:', error);
            // Document doesn't exist, userDoc will be null
            userDoc = null;
          }

          if (!userDoc) {
            console.log('📝 Creating new user document...');
            // Try to create user document for OAuth user
            try {
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
              console.log('✅ User document created successfully');
            } catch (createError: any) {
              console.log('⚠️ Error creating user document:', createError);
              // If document already exists, just update it
              if (createError.message?.includes('already exists')) {
                console.log('🔄 User document already exists, updating instead...');
                // User document already exists, updating instead
                await databaseService.updateUserDocument(user.$id, {
                  lastLogin: new Date().toISOString(),
                  oauthProvider: oauthProvider
                });
                console.log('✅ User document updated successfully');
              } else {
                throw createError;
              }
            }
          } else {
            console.log('🔄 Updating existing user document...');
            // Update last login and OAuth provider
            await databaseService.updateUserDocument(user.$id, {
              lastLogin: new Date().toISOString(),
              oauthProvider: oauthProvider
            });
            console.log('✅ User document updated successfully');
          }
        } catch (dbError) {
          console.error('❌ Failed to handle OAuth user document:', dbError);
          // Continue anyway - the user can still use the app
        }

        console.log('✅ OAuth callback completed successfully');
        return {
          success: true,
          user,
          message: 'OAuth login successful!'
        };
      }

      console.log('❌ No user found after OAuth callback');
      throw new Error('No user found after OAuth callback');
    } catch (error: any) {
      console.error('❌ OAuth callback error:', error);
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
      // Completing password reset
      
      // Use the userId as-is from Appwrite's password reset URL
      await this.account.updateRecovery(userId, secret, password);

      console.log('✅ Password reset completed successfully');
      return {
        success: true,
        message: '🎉 Password has been reset successfully! You can now log in with your new password.'
      };
    } catch (error: any) {
      console.error('❌ Complete password reset error:', error);
      
      // Provide more user-friendly error messages
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (error.message?.includes('Invalid token') || error.message?.includes('invalid')) {
        errorMessage = 'This password reset link is invalid or has expired. Please request a new password reset.';
      } else if (error.message?.includes('expired')) {
        errorMessage = 'This password reset link has expired. Please request a new password reset.';
      } else if (error.message?.includes('used')) {
        errorMessage = 'This password reset link has already been used. Please request a new password reset if needed.';
      } else if (error.message?.includes('password')) {
        errorMessage = 'The new password does not meet the requirements. Please try a different password.';
      }
      
      return {
        success: false,
        message: errorMessage
      };
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