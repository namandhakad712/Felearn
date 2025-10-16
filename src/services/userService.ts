import { Query } from 'appwrite';
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
      onboardingcompleted: false
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
      emailVerification: false,
      // Initialize quota system (using existing fields only)
      quota: 15
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
      index === self.findIndex((u: any) => u.$id === user.$id)
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
   * Check and reset daily quota if needed
   * @param userId User ID
   * @returns Promise with the updated user and whether quota was reset
   */
  async checkAndResetQuota(userId: string): Promise<{ user: User; wasReset: boolean }> {
    const user = await this.getUser(userId);
    
    // Admin users have unlimited quota
    if (user.isAdmin) {
      return { user, wasReset: false };
    }
    
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // Get YYYY-MM-DD
    
    // Check if quota needs to be reset
    let needsReset = false;
    
    if (!user.lastLogin) {
      // First time - initialize quota
      needsReset = true;
    } else {
      const lastLoginDate = user.lastLogin.split('T')[0];
      if (lastLoginDate !== today) {
        // New day - reset quota
        needsReset = true;
      }
    }
    
    if (needsReset) {
      const updatedUser = await this.updateUser(userId, {
        quota: 15,
        lastLogin: now.toISOString()
      });
      return { user: updatedUser, wasReset: true };
    }
    
    return { user, wasReset: false };
  }

  /**
   * Decrement user's daily quota
   * @param userId User ID
   * @returns Promise with the updated user
   * @throws Error if quota is exceeded
   */
  async decrementQuota(userId: string): Promise<User> {
    // First check and reset quota if needed
    const { user } = await this.checkAndResetQuota(userId);
    
    // Admin users have unlimited quota
    if (user.isAdmin) {
      return user;
    }
    
    // Initialize quota if not set
    const currentQuota = user.quota ?? 15;
    
    if (currentQuota <= 0) {
      throw new Error('Daily story generation quota exceeded. Please try again tomorrow.');
    }
    
    // Decrement quota
    const updatedUser = await this.updateUser(userId, {
      quota: currentQuota - 1
    });
    
    return updatedUser;
  }

  /**
   * Get user's remaining quota
   * @param userId User ID
   * @returns Promise with remaining quota count
   */
  async getRemainingQuota(userId: string): Promise<number> {
    const { user } = await this.checkAndResetQuota(userId);
    
    // Admin users have unlimited quota
    if (user.isAdmin) {
      return 999;
    }
    
    return user.quota ?? 15;
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

  /**
   * Check if user's quota needs to be reset (daily reset)
   * @param user User object
   * @returns Whether quota was reset
   */
  private needsQuotaReset(user: User): boolean {
    if (!user.lastLogin) return true;
    
    const lastLogin = new Date(user.lastLogin);
    const now = new Date();
    
    // Check if it's a new day (reset at midnight)
    return lastLogin.toDateString() !== now.toDateString();
  }

  /**
   * Get user's remaining quota (with automatic daily reset)
   * @param userId User ID
   * @returns Promise with remaining quota count
   */
  async getUserQuota(userId: string): Promise<{ remaining: number; total: number; resetsAt: string }> {
    const user = await this.getUser(userId);
    const DAILY_QUOTA_LIMIT = 15;
    
    // Admins have unlimited quota
    if (user.isAdmin) {
      return {
        remaining: 999,
        total: 999,
        resetsAt: new Date().toISOString()
      };
    }
    
    // Check if quota needs reset
    if (this.needsQuotaReset(user)) {
      await this.resetUserQuota(userId);
      return {
        remaining: DAILY_QUOTA_LIMIT,
        total: DAILY_QUOTA_LIMIT,
        resetsAt: this.getNextMidnight().toISOString()
      };
    }
    
    const remaining = user.quota ?? DAILY_QUOTA_LIMIT;
    
    return {
      remaining,
      total: DAILY_QUOTA_LIMIT,
      resetsAt: this.getNextMidnight().toISOString()
    };
  }

  /**
   * Reset user's daily quota
   * @param userId User ID
   * @returns Promise with the updated user
   */
  async resetUserQuota(userId: string): Promise<User> {
    const DAILY_QUOTA_LIMIT = 15;
    
    return this.updateUser(userId, {
      quota: DAILY_QUOTA_LIMIT,
      lastLogin: new Date().toISOString()
    });
  }

  /**
   * Decrement user's quota after successful story generation
   * @param userId User ID
   * @returns Promise with the updated user and remaining quota
   */
  async decrementQuota(userId: string): Promise<{ user: User; remaining: number }> {
    const user = await this.getUser(userId);
    
    // Admins have unlimited quota
    if (user.isAdmin) {
      return { user, remaining: 999 };
    }
    
    // Check if quota needs reset first
    if (this.needsQuotaReset(user)) {
      await this.resetUserQuota(userId);
      const updatedUser = await this.getUser(userId);
      return { user: updatedUser, remaining: updatedUser.quota ?? 15 };
    }
    
    const currentQuota = user.quota ?? 15;
    const newQuota = Math.max(0, currentQuota - 1);
    
    const updatedUser = await this.updateUser(userId, {
      quota: newQuota
    });
    
    return { user: updatedUser, remaining: newQuota };
  }

  /**
   * Check if user has quota remaining
   * @param userId User ID
   * @returns Promise with boolean indicating if user can generate stories
   */
  async hasQuotaRemaining(userId: string): Promise<boolean> {
    const { remaining } = await this.getUserQuota(userId);
    return remaining > 0;
  }

  /**
   * Get next midnight time for quota reset
   * @returns Date object for next midnight
   */
  private getNextMidnight(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }
}

// Create and export a singleton instance
export const userService = new UserService();
