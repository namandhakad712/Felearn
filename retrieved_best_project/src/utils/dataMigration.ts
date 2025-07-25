import { ID } from 'appwrite';
import { databaseService } from '../services';
import { APPWRITE_CONFIG } from '../config/appwrite';
import { User, Story } from '../types';

/**
 * Data Migration Utilities
 * Handles migration of data from Firebase to Appwrite
 */
export class DataMigration {
  /**
   * Migrate user data from Firebase to Appwrite
   * @param firebaseUsers Array of Firebase user data
   * @returns Promise with migration results
   */
  static async migrateUsers(firebaseUsers: any[]): Promise<{
    total: number;
    successful: number;
    failed: number;
    errors: any[];
  }> {
    const results = {
      total: firebaseUsers.length,
      successful: 0,
      failed: 0,
      errors: [] as any[]
    };
    
    for (const firebaseUser of firebaseUsers) {
      try {
        // Transform Firebase user to Appwrite user format
        const appwriteUser = this.transformFirebaseUser(firebaseUser);
        
        // Create user document in Appwrite
        await databaseService.createDocument<User>(
          APPWRITE_CONFIG.collections.users,
          appwriteUser,
          appwriteUser.$id
        );
        
        results.successful++;
      } catch (error) {
        console.error(`Failed to migrate user ${firebaseUser.uid}:`, error);
        results.failed++;
        results.errors.push({
          userId: firebaseUser.uid,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    return results;
  }

  /**
   * Migrate story data from Firebase to Appwrite
   * @param firebaseStories Array of Firebase story data
   * @returns Promise with migration results
   */
  static async migrateStories(firebaseStories: any[]): Promise<{
    total: number;
    successful: number;
    failed: number;
    errors: any[];
  }> {
    const results = {
      total: firebaseStories.length,
      successful: 0,
      failed: 0,
      errors: [] as any[]
    };
    
    for (const firebaseStory of firebaseStories) {
      try {
        // Transform Firebase story to Appwrite story format
        const appwriteStory = this.transformFirebaseStory(firebaseStory);
        
        // Create story document in Appwrite
        await databaseService.createDocument<Story>(
          APPWRITE_CONFIG.collections.stories,
          appwriteStory,
          appwriteStory.$id
        );
        
        results.successful++;
      } catch (error) {
        console.error(`Failed to migrate story ${firebaseStory.id}:`, error);
        results.failed++;
        results.errors.push({
          storyId: firebaseStory.id,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    return results;
  }

  /**
   * Transform Firebase user to Appwrite user format
   * @param firebaseUser Firebase user data
   * @returns Appwrite user data
   */
  private static transformFirebaseUser(firebaseUser: any): Partial<User> {
    // Extract Firebase user data
    const {
      uid,
      email,
      displayName,
      metadata,
      providerData,
      emailVerified,
      disabled
    } = firebaseUser;
    
    // Create default settings
    const settings = {
      theme: 'light',
      language: 'en',
      onboardingCompleted: true // Assume completed for migrated users
    };
    
    // Determine OAuth provider if any
    let oauthProvider = undefined;
    if (providerData && providerData.length > 0) {
      const provider = providerData[0].providerId;
      if (provider !== 'password') {
        oauthProvider = provider.replace('.com', '');
      }
    }
    
    // Create Appwrite user
    return {
      $id: uid,
      email,
      name: displayName || email.split('@')[0],
      createdAt: metadata.creationTime || new Date().toISOString(),
      lastLogin: metadata.lastSignInTime || new Date().toISOString(),
      oauthProvider,
      settings,
      geminiKey: '', // Empty by default
      emailVerification: emailVerified,
      disabled
    };
  }

  /**
   * Transform Firebase story to Appwrite story format
   * @param firebaseStory Firebase story data
   * @returns Appwrite story data
   */
  private static transformFirebaseStory(firebaseStory: any): Partial<Story> {
    // Extract Firebase story data
    const {
      id,
      userId,
      title,
      content,
      images,
      createdAt,
      isPinned,
      tags
    } = firebaseStory;
    
    // Create Appwrite story
    return {
      $id: id || ID.unique(),
      userId,
      title,
      content,
      images: images || [],
      createdAt: createdAt || new Date().toISOString(),
      isPinned: isPinned || false,
      tags: tags || []
    };
  }
}

export default DataMigration;