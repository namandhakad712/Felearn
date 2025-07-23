import { ID, Query } from 'appwrite';
import { databaseService } from './databaseService';
import { APPWRITE_CONFIG } from '../config/appwrite';
import { User, UserSettings } from '../types';

/**
 * User Service
 * Handles all user-related database operations
 */
export class UserService {
  private readonly collectionId: string;
  
  constructor() {
    this.collectionId = APPWRITE_CONFIG.collections.users;
  }

  /**
   * Get a user by ID
   * @param userId User ID
   * @returns Promise with the user data
   */
  async getUser(userId: string): Promise<User> {
    return databaseService.getDocument<User>(this.collectionId, userId);
  }

  /**
   * Create a new user document
   * @param userId User ID (from authentication)
   * @param email User email
   * @param name Optional user name
   * @returns Promise with the created user
   */
  async createUser(userId: string, email: string, name?: string): Promise<User> {
    // Create default settings
    const settings: UserSettings = {
      theme: 'light',
      language: 'en',
      onboardingCompleted: false
    };
    
    // Create user data
    const userData: Partial<User> = {
      $id: userId,
      email,
      name: name || email.split('@')[0], // Use part before @ as default name
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      settings,
      geminiKey: '', // Empty by default
      emailVerification: false
    };
    
    return databaseService.createDocument<User>(
      this.collectionId,
      userData,
      userId
    );
  }

  /**
   * Update a user document
   * @param userId User ID
   * @param userData User data to update
   * @returns Promise with the updated user
   */
  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    return databaseService.updateDocument<User>(
      this.collectionId,
      userId,
      userData
    );
  }

  /**
   * Update user settings
   * @param userId User ID
   * @param settings Settings to update
   * @returns Promise with the updated user
   */
  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<User> {
    // First get the current user to merge settings
    const user = await this.getUser(userId);
    
    // Merge with existing settings
    const updatedSettings = {
      ...user.settings,
      ...settings
    };
    
    return this.updateUser(userId, { settings: updatedSettings });
  }

  /**
   * Delete a user
   * @param userId User ID
   * @returns Promise indicating success
   */
  async deleteUser(userId: string): Promise<boolean> {
    return databaseService.deleteDocument(this.collectionId, userId);
  }

  /**
   * Get all users (admin only)
   * @param limit Optional limit of users to return
   * @param offset Optional offset for pagination
   * @returns Promise with users and total count
   */
  async getAllUsers(limit: number = 100, offset: number = 0): Promise<{ users: User[]; total: number }> {
    const result = await databaseService.listDocuments<User>(
      this.collectionId,
      [
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc('$createdAt')
      ]
    );
    
    return {
      users: result.documents,
      total: result.total
    };
  }

  /**
   * Search for users by name or email
   * @param query Search query
   * @param limit Optional limit of results
   * @returns Promise with matching users
   */
  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    // Search in both name and email fields
    const nameResults = await databaseService.searchDocuments<User>(
      this.collectionId,
      'name',
      query,
      limit
    );
    
    const emailResults = await databaseService.searchDocuments<User>(
      this.collectionId,
      'email',
      query,
      limit
    );
    
    // Combine results and remove duplicates
    const combinedResults = [...nameResults, ...emailResults];
    const uniqueResults = combinedResults.filter((user, index, self) =>
      index === self.findIndex(u => u.$id === user.$id)
    );
    
    return uniqueResults.slice(0, limit);
  }

  /**
   * Update user's last login timestamp
   * @param userId User ID
   * @returns Promise with the updated user
   */
  async updateLastLogin(userId: string): Promise<User> {
    return this.updateUser(userId, {
      lastLogin: new Date().toISOString()
    });
  }

  /**
   * Set user as admin (admin only)
   * @param userId User ID
   * @param isAdmin Whether the user should be an admin
   * @returns Promise with the updated user
   */
  async setUserAdmin(userId: string, isAdmin: boolean): Promise<User> {
    return this.updateUser(userId, { isAdmin });
  }

  /**
   * Set user account status (admin only)
   * @param userId User ID
   * @param disabled Whether the user account should be disabled
   * @returns Promise with the updated user
   */
  async setUserStatus(userId: string, disabled: boolean): Promise<User> {
    return this.updateUser(userId, { disabled });
  }
}

// Create and export a singleton instance
export const userService = new UserService();