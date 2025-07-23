import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';
import { User, Story, AdminLog } from '../types';
import { APPWRITE_CONFIG } from '../config/appwrite';
import { base64ToFile, generateImageFilename } from '../utils/imageUtils';

// Initialize Appwrite client
export const appwriteClient = new Client();

appwriteClient
  .setEndpoint(APPWRITE_CONFIG.endpoint)
  .setProject(APPWRITE_CONFIG.projectId);

// Initialize Appwrite services
const account = new Account(appwriteClient);
const databases = new Databases(appwriteClient);
const storage = new Storage(appwriteClient);

// Database and collection IDs
const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const USERS_COLLECTION_ID = APPWRITE_CONFIG.collections.users;
const STORIES_COLLECTION_ID = APPWRITE_CONFIG.collections.stories;
const ADMIN_LOGS_COLLECTION_ID = APPWRITE_CONFIG.collections.adminLogs;
const ERROR_LOGS_COLLECTION_ID = APPWRITE_CONFIG.collections.errorLogs || 'error_logs';

class AppwriteService {
  // Authentication methods
  /**
   * Check if an email is already registered
   * @param email Email to check
   * @returns Promise<boolean> True if email exists
   */
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      // This is a safer way to check if an email exists
      // We'll try to create a magic URL session which will fail if the email doesn't exist
      await account.createMagicURLToken(ID.unique(), email, 'https://example.com');
      
      // If we get here without an error, the email doesn't exist (new user)
      return false;
    } catch (error: any) {
      // If we get a 400 error with "exists" in the message, the email exists
      if (error.code === 409 || (error.message && error.message.toLowerCase().includes('exists'))) {
        return true;
      }
      
      // For any other error, we'll assume the email doesn't exist to allow registration
      return false;
    }
  }

  async register(email: string, password: string) {
    try {
      // Generate a unique ID for the user
      const userId = ID.unique();
      
      // Validate password doesn't contain email parts
      const emailParts = email.split('@')[0].toLowerCase();
      if (password.toLowerCase().includes(emailParts) && emailParts.length > 3) {
        throw new Error('Your password cannot contain parts of your email address. Please choose a different password.');
      }
      
      try {
        // Try to create the account
        const response = await account.create(userId, email, password);
        
        // After successful account creation, send verification email
        try {
          await account.createVerification(window.location.origin + '/auth/verify');
          console.log('Verification email sent successfully');
        } catch (verificationError) {
          console.warn('Failed to send verification email:', verificationError);
          // Don't throw here - account was created successfully
        }
        
        return response;
      } catch (createError: any) {
        // If the error is because the account already exists, throw a specific error
        if (createError.code === 409 || 
            (createError.message && createError.message.toLowerCase().includes('exists'))) {
          const error = new Error('An account with this email already exists. Please log in instead.');
          (error as any).code = 409;
          throw error;
        }
        
        // For other errors, rethrow
        throw createError;
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async verifyEmail(userId: string, secret: string) {
    try {
      const response = await account.updateVerification(userId, secret);
      return response;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  async resendVerificationEmail() {
    try {
      const response = await account.createVerification(window.location.origin + '/auth/verify');
      return response;
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      // For Appwrite SDK v18+
      const session = await account.createEmailPasswordSession(email, password);
      return session;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Check if the error is due to unverified email
      if (error.code === 401 && error.message && error.message.includes('verification')) {
        const verificationError = new Error('Please verify your email address before logging in. Check your inbox for a verification email.');
        (verificationError as any).code = 'EMAIL_NOT_VERIFIED';
        throw verificationError;
      }
      
      throw error;
    }
  }

  async loginWithOAuth(provider: string) {
    try {
      // Create OAuth session and redirect to provider
      if (typeof account.createOAuth2Session === 'function') {
        account.createOAuth2Session(
          provider,
          window.location.origin + '/onboarding',
          window.location.origin + '/auth/login'
        );
      } else {
        throw new Error('Appwrite SDK OAuth method not available. Please check SDK version.');
      }
    } catch (error) {
      console.error('OAuth login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      // Check if the deleteSession method exists
      if (typeof account.deleteSession === 'function') {
        await account.deleteSession('current');
      } 
      // If the method doesn't exist, throw an error
      else {
        throw new Error('Appwrite SDK logout method not available. Please check SDK version.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async resetPassword(email: string) {
    try {
      // Send password recovery email
      if (typeof account.createRecovery === 'function') {
        await account.createRecovery(email, window.location.origin + '/auth/reset-password');
        return true;
      } else {
        throw new Error('Appwrite SDK password recovery method not available. Please check SDK version.');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const accountDetails = await account.get();
      console.log('Account details:', accountDetails);
      
      try {
        // Try to get user document from database
        const user = await this.getUserDocument(accountDetails.$id);
        console.log('User document found:', user);
        
        // Parse settings from string to object if it's a string
        if (user && typeof user.settings === 'string') {
          try {
            user.settings = JSON.parse(user.settings);
          } catch (parseError) {
            console.error('Error parsing settings JSON:', parseError);
            // Fallback to default settings if parsing fails
            user.settings = {
              theme: 'light',
              language: 'en',
              onboardingCompleted: false,
            };
          }
        }
        
        return user;
      } catch (userDocError) {
        console.log('User document not found, attempting to create...');
        try {
          // If user document doesn't exist, create it
          const newUser = await this.createUserDocument(accountDetails.$id, accountDetails.email);
          console.log('New user document created:', newUser);
          
          // Parse settings from string to object
          if (newUser && typeof newUser.settings === 'string') {
            try {
              newUser.settings = JSON.parse(newUser.settings);
            } catch (parseError) {
              console.error('Error parsing settings JSON:', parseError);
              // Fallback to default settings if parsing fails
              newUser.settings = {
                theme: 'light',
                language: 'en',
                onboardingCompleted: false,
              };
            }
          }
          
          return newUser;
        } catch (createError) {
          console.error('Failed to create user document, using fallback:', createError);
          // Fallback: create a temporary user object from account details
          const fallbackUser: User = {
            $id: accountDetails.$id,
            email: accountDetails.email,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            settings: {
              theme: 'light',
              language: 'en',
              onboardingCompleted: false,
            },
            geminiKey: '', // Ensure this field is always present
          };
          return fallbackUser;
        }
      }
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // User methods
  async createUserDocument(userId: string, email: string) {
    try {
      // Create settings object
      const settingsObj = {
        theme: 'light',
        language: 'en',
        onboardingCompleted: false,
      };
      
      // Convert settings object to JSON string
      const settingsString = JSON.stringify(settingsObj);
      
      // Extract display name from email (part before @)
      const displayName = email.split('@')[0];
      
      const user: Partial<User> = {
        $id: userId,
        email,
        name: displayName, // Set display name from email
        createdAt: new Date().toISOString(),
        // Add lastLogin field
        lastLogin: new Date().toISOString(),
        geminiKey: '', // Add empty geminiKey field to satisfy schema requirement
        settings: settingsString, // Store as string instead of object
      };

      const createdUser = await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        user
      );

      console.log('User document created:', createdUser);
      return createdUser as User;
    } catch (error) {
      console.error('Create user document error:', error);
      throw error;
    }
  }

  async getUserDocument(userId: string) {
    try {
      const user = await databases.getDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId
      );

      return user as User;
    } catch (error) {
      console.error('Get user document error:', error);
      throw error;
    }
  }

  async updateUser(userData: Partial<User>) {
    try {
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser) {
        throw new Error('No authenticated user');
      }
      
      // Create a copy of userData to modify
      const userDataToUpdate = { ...userData };
      
      // Convert settings object to string if it exists
      if (userDataToUpdate.settings && typeof userDataToUpdate.settings === 'object') {
        userDataToUpdate.settings = JSON.stringify(userDataToUpdate.settings);
      }
      
      // Update lastLogin if not provided
      if (!userDataToUpdate.lastLogin) {
        userDataToUpdate.lastLogin = new Date().toISOString();
      }

      const updatedUser = await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        currentUser.$id,
        userDataToUpdate
      );
      
      // Parse settings back to object for return value
      if (updatedUser && typeof updatedUser.settings === 'string') {
        try {
          (updatedUser as any).settings = JSON.parse(updatedUser.settings);
        } catch (parseError) {
          console.error('Error parsing updated settings JSON:', parseError);
        }
      }

      return updatedUser as User;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }
  
  /**
   * Update a specific user document (admin only)
   * @param userId User ID to update
   * @param userData User data to update
   * @returns Promise with the updated user
   */
  async updateUserDocument(userId: string, userData: Partial<User>) {
    try {
      const currentUser = await this.getCurrentUser();
      
      // Only allow admins or the user themselves to update their document
      if (!currentUser || (currentUser.$id !== userId && !currentUser.isAdmin)) {
        throw new Error('Unauthorized: Cannot update another user\'s document');
      }
      
      // Create a copy of userData to modify
      const userDataToUpdate = { ...userData };
      
      // Convert settings object to string if it exists
      if (userDataToUpdate.settings && typeof userDataToUpdate.settings === 'object') {
        userDataToUpdate.settings = JSON.stringify(userDataToUpdate.settings);
      }

      const updatedUser = await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        userDataToUpdate
      );
      
      // Parse settings back to object for return value
      if (updatedUser && typeof updatedUser.settings === 'string') {
        try {
          (updatedUser as any).settings = JSON.parse(updatedUser.settings);
        } catch (parseError) {
          console.error('Error parsing updated settings JSON:', parseError);
        }
      }

      return updatedUser as User;
    } catch (error) {
      console.error('Update user document error:', error);
      throw error;
    }
  }

  /**
   * Delete a user document from Appwrite
   * @param userId User ID to delete
   * @returns Promise indicating success
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const currentUser = await this.getCurrentUser();
      
      // Only allow admins or the user themselves to delete their document
      if (!currentUser || (currentUser.$id !== userId && !currentUser.isAdmin)) {
        throw new Error('Unauthorized: Cannot delete another user\'s document');
      }

      await databases.deleteDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId
      );

      console.log('User document deleted successfully:', userId);
      return true;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  // Story methods
  async createStory(title: string, content: string, images: string[] = [], slides: StorySlide[] = []) {
    try {
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Create a new story document first to get an ID
      const storyData: Partial<Story> = {
        userId: currentUser.$id,
        email: currentUser.email,
        name: currentUser.name || currentUser.email.split('@')[0], // Use name or fallback to email username
        lastLogin: currentUser.lastLogin || new Date().toISOString(),
        title,
        content,
        images: '[]', // Temporary empty array
        slides: JSON.stringify([]), // Empty slides initially
        createdAt: new Date().toISOString(),
        isPinned: false,
      };

      const newStory = await databases.createDocument(
        DATABASE_ID,
        STORIES_COLLECTION_ID,
        ID.unique(),
        storyData
      ) as Story;

      // Upload images to storage and get file IDs
      console.log('Uploading images to storage bucket...');
      const imageIds = await this.uploadStoryImages(images, currentUser.email);
      console.log('Image upload complete, got IDs:', imageIds);
      
      // Process slides to use image IDs
      console.log('Processing slides with image IDs...');
      const processedSlides = slides.map((slide, index) => {
        // Make sure we have a valid image ID or URL
        const imageId = imageIds[index] || slide.image || '';
        console.log(`Slide ${index}: Using image ID/URL: ${imageId}`);
        
        return {
          ...slide,
          image: imageId
        };
      });
      
      // Update the story with image IDs and processed slides
      const updatedStory = await databases.updateDocument(
        DATABASE_ID,
        STORIES_COLLECTION_ID,
        newStory.$id,
        {
          images: JSON.stringify(imageIds),
          slides: JSON.stringify(processedSlides)
        }
      );

      // Parse images and slides back to arrays
      const story = { ...updatedStory };
      
      if (typeof story.images === 'string') {
        try {
          const imageIds = JSON.parse(story.images);
          // Convert file IDs to URLs
          story.images = imageIds.map((id: string) => this.getImageUrl(id));
        } catch (e) {
          console.error('Error parsing images JSON:', e);
          story.images = [];
        }
      }
      
      if (typeof story.slides === 'string') {
        try {
          const parsedSlides = JSON.parse(story.slides);
          // Update image URLs in slides
          story.slides = parsedSlides.map((slide: any) => ({
            ...slide,
            image: this.getImageUrl(slide.image)
          }));
        } catch (e) {
          console.error('Error parsing slides JSON:', e);
          story.slides = [];
        }
      }

      return story as Story;
    } catch (error) {
      console.error('Create story error:', error);
      throw error;
    }
  }

  async getStories() {
    try {
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Query by email instead of userId for better flexibility
      const response = await databases.listDocuments(
        DATABASE_ID,
        STORIES_COLLECTION_ID,
        [Query.equal('email', currentUser.email)]
      );

      // Parse images and slides strings back to arrays for each story
      const stories = response.documents.map(doc => {
        const story = { ...doc };
        
        // Parse images if it's a string
        if (typeof story.images === 'string') {
          try {
            const imageIds = JSON.parse(story.images);
            // Convert file IDs to URLs
            story.images = imageIds.map((id: string) => this.getImageUrl(id));
          } catch (e) {
            console.error('Error parsing images JSON:', e);
            story.images = [];
          }
        }
        
        // Parse slides if it's a string
        if (typeof story.slides === 'string') {
          try {
            const slides = JSON.parse(story.slides);
            // Update image URLs in slides
            story.slides = slides.map((slide: any) => ({
              ...slide,
              image: this.getImageUrl(slide.image)
            }));
          } catch (e) {
            console.error('Error parsing slides JSON:', e);
            story.slides = [];
          }
        }
        
        return story;
      });

      return stories as Story[];
    } catch (error) {
      console.error('Get stories error:', error);
      throw error;
    }
  }

  async getStory(storyId: string) {
    try {
      const doc = await databases.getDocument(
        DATABASE_ID,
        STORIES_COLLECTION_ID,
        storyId
      );
      
      // Parse images and slides if they're strings
      const story = { ...doc };
      
      // Parse images if it's a string
      if (typeof story.images === 'string') {
        try {
          const imageIds = JSON.parse(story.images);
          // Convert file IDs to URLs
          story.images = imageIds.map((id: string) => this.getImageUrl(id));
        } catch (e) {
          console.error('Error parsing images JSON:', e);
          story.images = [];
        }
      }
      
      // Parse slides if it's a string
      if (typeof story.slides === 'string') {
        try {
          const slides = JSON.parse(story.slides);
          // Update image URLs in slides
          story.slides = slides.map((slide: any) => ({
            ...slide,
            image: this.getImageUrl(slide.image)
          }));
        } catch (e) {
          console.error('Error parsing slides JSON:', e);
          story.slides = [];
        }
      }

      return story as Story;
    } catch (error) {
      console.error('Get story error:', error);
      throw error;
    }
  }

  async updateStory(storyId: string, data: Partial<Story>) {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No authenticated user');
      }
      
      // Create a copy of the data to modify
      const updateData = { ...data };
      
      // Always update user information to keep it current
      updateData.email = currentUser.email;
      updateData.name = currentUser.name || currentUser.email.split('@')[0];
      updateData.lastLogin = currentUser.lastLogin || new Date().toISOString();
      
      // Handle image updates if present
      if (updateData.images && Array.isArray(updateData.images)) {
        // Get existing story to get existing image IDs
        const existingStory = await this.getStory(storyId);
        
        // Get the original image IDs (before URL conversion)
        const existingDoc = await databases.getDocument(
          DATABASE_ID,
          STORIES_COLLECTION_ID,
          storyId
        );
        
        let existingImageIds: string[] = [];
        if (typeof existingDoc.images === 'string') {
          try {
            existingImageIds = JSON.parse(existingDoc.images);
          } catch (e) {
            existingImageIds = [];
          }
        }
        
        // Check if there are new base64 images to upload
        const newImages = updateData.images.filter(img => img.startsWith('data:'));
        const existingImages = updateData.images.filter(img => !img.startsWith('data:'));
        
        let finalImageIds = [...existingImageIds];
        
        // If there are new images, upload them
        if (newImages.length > 0) {
          const newImageIds = await this.uploadStoryImages(newImages, currentUser.email);
          finalImageIds = [...existingImages, ...newImageIds];
        }
        
        // Update the images field with the IDs
        updateData.images = JSON.stringify(finalImageIds);
        
        // Update slides if they exist
        if (updateData.slides && Array.isArray(updateData.slides)) {
          // Map slides to use the correct image IDs
          const updatedSlides = updateData.slides.map((slide, index) => {
            // If the slide image is a base64, use the corresponding new image ID
            if (slide.image && slide.image.startsWith('data:')) {
              const imageIndex = newImages.indexOf(slide.image);
              if (imageIndex >= 0) {
                return {
                  ...slide,
                  image: finalImageIds[existingImages.length + imageIndex]
                };
              }
            }
            return slide;
          });
          
          updateData.slides = JSON.stringify(updatedSlides);
        }
      } else if (updateData.slides && Array.isArray(updateData.slides)) {
        // If only slides are updated (no images array), convert to JSON string
        updateData.slides = JSON.stringify(updateData.slides);
      }
      
      const response = await databases.updateDocument(
        DATABASE_ID,
        STORIES_COLLECTION_ID,
        storyId,
        updateData
      );
      
      // Parse images and slides strings back to arrays
      const story = { ...response };
      
      // Parse images if it's a string
      if (typeof story.images === 'string') {
        try {
          const imageIds = JSON.parse(story.images);
          // Convert file IDs to URLs
          story.images = imageIds.map((id: string) => this.getImageUrl(id));
        } catch (e) {
          console.error('Error parsing images JSON:', e);
          story.images = [];
        }
      }
      
      // Parse slides if it's a string
      if (typeof story.slides === 'string') {
        try {
          const slides = JSON.parse(story.slides);
          // Update image URLs in slides
          story.slides = slides.map((slide: any) => ({
            ...slide,
            image: this.getImageUrl(slide.image)
          }));
        } catch (e) {
          console.error('Error parsing slides JSON:', e);
          story.slides = [];
        }
      }

      return story as Story;
    } catch (error) {
      console.error('Update story error:', error);
      throw error;
    }
  }

  async deleteStory(storyId: string) {
    try {
      // Get the original document to access image IDs
      const doc = await databases.getDocument(
        DATABASE_ID,
        STORIES_COLLECTION_ID,
        storyId
      );
      
      // Delete the story document
      await databases.deleteDocument(
        DATABASE_ID,
        STORIES_COLLECTION_ID,
        storyId
      );
      
      // Delete associated images from storage
      if (doc && typeof doc.images === 'string') {
        try {
          const imageIds = JSON.parse(doc.images);
          
          // Delete each image that's not an external URL
          for (const imageId of imageIds) {
            if (!imageId.startsWith('http') && !imageId.startsWith('data:')) {
              try {
                await this.deleteFile(imageId);
                console.log(`Deleted image ${imageId} from storage`);
              } catch (deleteError) {
                console.warn(`Failed to delete image ${imageId}:`, deleteError);
                // Continue with other deletions even if one fails
              }
            }
          }
        } catch (parseError) {
          console.error('Error parsing images JSON during deletion:', parseError);
        }
      }

      return true;
    } catch (error) {
      console.error('Delete story error:', error);
      throw error;
    }
  }

  // Admin methods
  async createAdminLog(action: string, details: Record<string, any>) {
    try {
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser || !currentUser.isAdmin) {
        throw new Error('Unauthorized');
      }

      const log: Partial<AdminLog> = {
        action,
        details,
        timestamp: new Date().toISOString(),
        adminId: currentUser.$id,
      };

      const response = await databases.createDocument(
        DATABASE_ID,
        ADMIN_LOGS_COLLECTION_ID,
        ID.unique(),
        log
      );

      return response as AdminLog;
    } catch (error) {
      console.error('Create admin log error:', error);
      throw error;
    }
  }

  async getAdminLogs() {
    try {
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser || !currentUser.isAdmin) {
        throw new Error('Unauthorized');
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        ADMIN_LOGS_COLLECTION_ID,
        [Query.orderDesc('timestamp')]
      );

      return response.documents as AdminLog[];
    } catch (error) {
      console.error('Get admin logs error:', error);
      throw error;
    }
  }

  // File storage methods
  async uploadFile(file: File) {
    try {
      const response = await storage.createFile(
        APPWRITE_CONFIG.buckets.storyImages,
        ID.unique(),
        file
      );

      return response.$id;
    } catch (error) {
      console.error('Upload file error:', error);
      throw error;
    }
  }

  getFilePreview(fileId: string, width = 2000, height = 2000) {
    return storage.getFilePreview(
      APPWRITE_CONFIG.buckets.storyImages,
      fileId,
      width,
      height,
      'center',
      100 // quality
    );
  }

  async deleteFile(fileId: string) {
    try {
      await storage.deleteFile(APPWRITE_CONFIG.buckets.storyImages, fileId);
      return true;
    } catch (error) {
      console.error('Delete file error:', error);
      throw error;
    }
  }
  
  /**
   * Upload story images to storage bucket
   * @param images Array of base64 image data or URLs
   * @param userEmail User's email for filename generation
   * @returns Array of file IDs or URLs
   */
  async uploadStoryImages(images: string[], userEmail: string): Promise<string[]> {
    try {
      console.log(`Uploading ${images.length} images to storage bucket`);
      const fileIds = [];
      
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        
        // Skip external URLs (like placekitten fallbacks)
        if (image.startsWith('http')) {
          console.log(`Image ${i} is an external URL, skipping upload`);
          fileIds.push(image); // Store the URL directly
          continue;
        }
        
        try {
          // Convert base64 to file with custom filename format
          const filename = generateImageFilename(userEmail, i);
          console.log(`Converting image ${i} to file: ${filename}`);
          
          // Check if the image is a valid base64 string
          if (!image.startsWith('data:')) {
            console.error(`Image ${i} is not a valid base64 string, skipping`);
            continue;
          }
          
          const file = base64ToFile(image, filename);
          console.log(`File created: ${filename}, size: ${file.size} bytes, type: ${file.type}`);
          
          // Upload to storage bucket
          console.log(`Uploading file to bucket: ${APPWRITE_CONFIG.buckets.storyImages}`);
          const response = await storage.createFile(
            APPWRITE_CONFIG.buckets.storyImages,
            ID.unique(),
            file
          );
          
          console.log(`File uploaded successfully, ID: ${response.$id}`);
          
          // Store the file ID
          fileIds.push(response.$id);
        } catch (error) {
          console.error(`Error uploading image ${i}:`, error);
          // Continue with other images even if one fails
        }
      }
      
      console.log(`Successfully uploaded ${fileIds.length} images`);
      return fileIds;
    } catch (error) {
      console.error('Upload story images error:', error);
      // Return empty array instead of throwing to prevent story creation failure
      return [];
    }
  }
  
  /**
   * Get image URL from file ID or return URL as is
   * @param fileIdOrUrl File ID or URL
   * @returns Image URL
   */
  getImageUrl(fileIdOrUrl: string): string {
    // If it's already a URL (like placekitten fallbacks), return as is
    if (fileIdOrUrl.startsWith('http') || fileIdOrUrl.startsWith('data:')) {
      return fileIdOrUrl;
    }
    
    // Otherwise, get the file preview URL
    return this.getFilePreview(fileIdOrUrl).toString();
  }

  // Additional Admin methods
  async getAllUsers() {
    try {
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser || !currentUser.isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        [Query.limit(100)]
      );

      // Parse settings string to object for each user
      const users = response.documents.map(doc => {
        const user = { ...doc };
        
        // Parse settings if it's a string
        if (typeof user.settings === 'string') {
          try {
            user.settings = JSON.parse(user.settings);
          } catch (e) {
            console.error('Error parsing user settings JSON:', e);
            user.settings = {
              theme: 'light',
              language: 'en',
              onboardingCompleted: false
            };
          }
        }
        
        return user;
      });

      return users as User[];
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  }

  async getUserActivity(userId: string) {
    try {
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser || !currentUser.isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      // For now, we'll return mock activity data
      // In a real implementation, you would fetch this from a dedicated collection
      return [
        {
          type: 'Login',
          timestamp: new Date().toISOString(),
          details: 'User logged in successfully'
        },
        {
          type: 'Story Creation',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          details: 'User created a new story'
        },
        {
          type: 'Profile Update',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          details: 'User updated their profile information'
        }
      ];
    } catch (error) {
      console.error('Get user activity error:', error);
      throw error;
    }
  }

  async updateUserStatus(userId: string, disabled: boolean) {
    try {
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser || !currentUser.isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      // Update user status in the database
      await databases.updateDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        userId,
        { disabled }
      );

      return true;
    } catch (error) {
      console.error('Update user status error:', error);
      throw error;
    }
  }

  async getAdminMetrics() {
    try {
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser || !currentUser.isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      // Get all users
      const usersResponse = await databases.listDocuments(
        DATABASE_ID,
        USERS_COLLECTION_ID
      );
      
      // Get all stories
      const storiesResponse = await databases.listDocuments(
        DATABASE_ID,
        STORIES_COLLECTION_ID
      );

      // Calculate metrics
      const totalUsers = usersResponse.total;
      
      // Calculate new users (registered in the last 24 hours)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const newUsers = usersResponse.documents.filter(
        user => new Date(user.createdAt) > oneDayAgo
      ).length;
      
      // Calculate active users (logged in in the last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const activeUsers = usersResponse.documents.filter(user => 
        user.lastLogin && new Date(user.lastLogin) > sevenDaysAgo
      ).length;
      
      // Total stories
      const storyCount = storiesResponse.total;
      
      // Get error count from error logs
      let errorCount = 0;
      try {
        const errorResponse = await databases.listDocuments(
          DATABASE_ID,
          ERROR_LOGS_COLLECTION_ID,
          [Query.equal('resolved', false)]
        );
        errorCount = errorResponse.total;
      } catch (error) {
        // If error logs collection doesn't exist, default to 0
        errorCount = 0;
      }

      return {
        totalUsers,
        newUsers,
        activeUsers,
        storyCount,
        errorCount
      };
    } catch (error) {
      console.error('Get admin metrics error:', error);
      throw error;
    }
  }

  // Error logging methods
  async createErrorReport(errorData: {
    type: 'frontend' | 'backend' | 'api';
    message: string;
    stack?: string;
    userId?: string;
    context: Record<string, any>;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }) {
    try {
      const errorLog = {
        type: errorData.type,
        message: errorData.message,
        stack: errorData.stack || '',
        userId: errorData.userId || '',
        timestamp: new Date().toISOString(),
        context: JSON.stringify(errorData.context),
        severity: errorData.severity || 'medium',
        resolved: false
      };

      const response = await databases.createDocument(
        DATABASE_ID,
        ERROR_LOGS_COLLECTION_ID,
        ID.unique(),
        errorLog
      );

      return response;
    } catch (error) {
      console.error('Create error report error:', error);
      throw error;
    }
  }

  async getErrorLogs() {
    try {
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser || !currentUser.isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        ERROR_LOGS_COLLECTION_ID,
        [Query.orderDesc('timestamp'), Query.limit(100)]
      );

      // Parse context back to object for each error
      const errorLogs = response.documents.map(doc => {
        const errorLog = { ...doc };
        
        // Parse context if it's a string
        if (typeof errorLog.context === 'string') {
          try {
            errorLog.context = JSON.parse(errorLog.context);
          } catch (e) {
            console.error('Error parsing error context JSON:', e);
            errorLog.context = {};
          }
        }
        
        return errorLog;
      });

      return errorLogs;
    } catch (error) {
      console.error('Get error logs error:', error);
      // Return mock data if collection doesn't exist
      return [
        {
          $id: '1',
          type: 'frontend',
          message: 'Failed to load user data',
          stack: 'Error: Failed to load user data\n    at loadUsers (UserManagement.tsx:45:12)',
          userId: 'user123',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          context: { component: 'UserManagement', action: 'loadUsers' },
          severity: 'high',
          resolved: false
        },
        {
          $id: '2',
          type: 'api',
          message: 'Gemini API rate limit exceeded',
          stack: '',
          userId: 'user456',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          context: { endpoint: '/api/generate-story', statusCode: 429 },
          severity: 'medium',
          resolved: false
        },
        {
          $id: '3',
          type: 'backend',
          message: 'Database connection timeout',
          stack: 'Error: Connection timeout\n    at Database.connect (db.js:23:8)',
          userId: '',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          context: { database: 'appwrite', timeout: 5000 },
          severity: 'critical',
          resolved: true
        }
      ];
    }
  }

  async resolveError(errorId: string) {
    try {
      const currentUser = await this.getCurrentUser();
      
      if (!currentUser || !currentUser.isAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      await databases.updateDocument(
        DATABASE_ID,
        ERROR_LOGS_COLLECTION_ID,
        errorId,
        { resolved: true }
      );

      return true;
    } catch (error) {
      console.error('Resolve error error:', error);
      throw error;
    }
  }
}

export const appwriteService = new AppwriteService();