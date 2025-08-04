import { Client, Account, Storage, ID, OAuthProvider } from 'appwrite';
import { APPWRITE_CONFIG } from '../config/appwrite';

// Initialize Appwrite client
export const appwriteClient = new Client();

appwriteClient
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

// Initialize Appwrite services
const account = new Account(appwriteClient);
const storage = new Storage(appwriteClient);

class AppwriteService {
  async login(email: string, password: string) {
    try {
      // Create email password session
      const session = await account.createEmailPasswordSession(email, password);
      
      // Get user details
      const user = await account.get();
      
      // Create magic URL for unverified users
      if (!user.emailVerification) {
        try {
          const verificationUrl = window.location.origin + '/auth/verify';
          console.log('📧 Creating magic URL token with URL:', verificationUrl);
          await account.createMagicURLToken(
            user.$id,
            email,
            verificationUrl
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
    provider: OAuthProvider,
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
      // Email updated successfully
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
      const verificationUrl = window.location.origin + '/auth/verify';
      // Sending verification email
      await account.createVerification(verificationUrl);
      return true;
    } catch (error) {
      console.error('Send email verification error:', error);
      throw error;
    }
  }

  async verifyEmail(userId: string, secret: string) {
    try {
      // Starting email verification
      await account.updateVerification(userId, secret);
      console.log('Email verification completed successfully');
      return true;
    } catch (error) {
      console.error('Verify email error:', error);
      throw error;
    }
  }

  // ==================== FILE STORAGE METHODS ====================

  /**
   * Convert base64 string to File object
   */
  private base64ToFile(base64String: string, filename: string): File {
    try {
      const arr = base64String.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    } catch (error) {
      console.error('Error converting base64 to file:', error);
      throw new Error('Failed to convert image data');
    }
  }

  /**
   * Upload a file to Appwrite Storage
   */
  async uploadFile(file: File): Promise<string> {
    try {
      console.log('Uploading file to storage:', file.name, file.size, 'bytes');
      
      const fileId = ID.unique();
      const uploadedFile = await storage.createFile(
        APPWRITE_CONFIG.buckets.storyImages,
        fileId,
        file
      );
      
      console.log('File uploaded successfully:', uploadedFile.$id);
      return uploadedFile.$id;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload image. Please try again.');
    }
  }

  /**
   * Get direct file URL (no transformations - works with free plan)
   */
  getFileUrl(fileId: string): string {
    try {
      const url = storage.getFileView(
        APPWRITE_CONFIG.buckets.storyImages,
        fileId
      ).toString();
      console.log('Generated direct file URL for file:', fileId);
      return url;
    } catch (error) {
      console.error('Error getting file URL:', error);
      return '/assets/placeholder-image.png';
    }
  }

  /**
   * Get file preview URL (deprecated - requires paid plan)
   * @deprecated Use getFileUrl instead for free plan compatibility
   */
  getFilePreview(fileId: string, width: number = 600, height: number = 400): string {
    console.warn('⚠️ getFilePreview requires paid Appwrite plan. Using direct file URL instead.');
    return this.getFileUrl(fileId);
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      console.log('Deleting file from storage:', fileId);
      
      await storage.deleteFile(
        APPWRITE_CONFIG.buckets.storyImages,
        fileId
      );
      
      console.log('File deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  /**
   * Upload multiple base64 images and return file URLs
   */
  async uploadStoryImages(images: string[]): Promise<string[]> {
    try {
      console.log('Processing story images for upload:', images.length);
      
      const uploadPromises = images.map(async (base64Image, index) => {
        if (!base64Image || !base64Image.startsWith('data:')) {
          console.warn(`Skipping invalid image at index ${index}`);
          return null;
        }

        try {
          // Convert base64 to file
          const filename = `story-image-${Date.now()}-${index}.png`;
          const file = this.base64ToFile(base64Image, filename);
          
          // Upload to storage
          const fileId = await this.uploadFile(file);
          
          // Get direct file URL (free plan compatible)
          const url = this.getFileUrl(fileId);
          
          return url;
        } catch (error) {
          console.error(`Error uploading image ${index}:`, error);
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(url => url !== null) as string[];
      
      console.log(`Successfully uploaded ${successfulUploads.length} out of ${images.length} images`);
      return successfulUploads;
    } catch (error) {
      console.error('Error uploading story images:', error);
      throw new Error('Failed to upload story images. Please try again.');
    }
  }
}

// Export singleton instance
export const appwriteService = new AppwriteService();