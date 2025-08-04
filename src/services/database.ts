import { Client, Databases } from 'appwrite';
import { appConfig } from '@/config/app';
import { appwriteConfig } from '../../appwrite.config';

const client = new Client()
  .setEndpoint(appConfig.api.appwrite.endpoint)
  .setProject(appConfig.api.appwrite.project);

const databases = new Databases(client);

export interface UserDocument {
  $id?: string;
  email: string;
  name: string;
  bio?: string;
  geminiKey: string;
  lastLogin?: string;
  isAdmin: boolean;
  createdAt: string;
  settings: string; // JSON string
  oauthProvider?: string;
  emailVerification?: boolean;
  disabled: boolean;
  onboardingcompleted: boolean;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  autoSave: boolean;
  language: string;
}

export class DatabaseService {
  private databaseId = appwriteConfig.database.id;
  private usersCollectionId = 'users';

  /**
   * Create user document in users collection
   */
  async createUserDocument(userId: string, userData: Partial<UserDocument>): Promise<UserDocument> {
    try {
      const defaultSettings: UserSettings = {
        theme: 'light',
        notifications: true,
        autoSave: true,
        language: 'en'
      };

      const document = await databases.createDocument(
        this.databaseId,
        this.usersCollectionId,
        userId, // Use auth user ID as document ID
        {
          email: userData.email || '',
          name: userData.name || '',
          bio: userData.bio || '',
          geminiKey: userData.geminiKey || '',
          lastLogin: userData.lastLogin || new Date().toISOString(),
          isAdmin: userData.isAdmin || false,
          createdAt: userData.createdAt || new Date().toISOString(),
          settings: userData.settings || JSON.stringify(defaultSettings),
          oauthProvider: userData.oauthProvider || '',
          emailVerification: userData.emailVerification || false,
          disabled: userData.disabled || false,
          onboardingcompleted: userData.onboardingcompleted || false
        }
      );

      return document as UserDocument;
    } catch (error) {
      console.error('Create user document error:', error);
      throw error;
    }
  }

  /**
   * Update user document in users collection
   */
  async updateUserDocument(userId: string, userData: Partial<UserDocument>): Promise<UserDocument> {
    try {
      // Filter out document keys that shouldn't be updated
      const { $id, $createdAt, $updatedAt, $permissions, $collectionId, $databaseId, ...updateData } = userData;
      
      const document = await databases.updateDocument(
        this.databaseId,
        this.usersCollectionId,
        userId,
        updateData
      );

      return document as UserDocument;
    } catch (error) {
      console.error('Update user document error:', error);
      throw error;
    }
  }

  /**
   * Get user document from users collection
   */
  async getUserDocument(userId: string): Promise<UserDocument | null> {
    try {
      const document = await databases.getDocument(
        this.databaseId,
        this.usersCollectionId,
        userId
      );

      return document as UserDocument;
    } catch (error) {
      console.error('Get user document error:', error);
      return null;
    }
  }

  /**
   * Update user settings
   */
  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
    try {
      // Get current user document
      const userDoc = await this.getUserDocument(userId);
      if (!userDoc) {
        throw new Error('User document not found');
      }

      // Parse current settings
      let currentSettings: UserSettings;
      try {
        currentSettings = JSON.parse(userDoc.settings);
      } catch {
        currentSettings = {
          theme: 'light',
          notifications: true,
          autoSave: true,
          language: 'en'
        };
      }

      // Merge with new settings
      const updatedSettings = { ...currentSettings, ...settings };

      // Update document
      await this.updateUserDocument(userId, {
        settings: JSON.stringify(updatedSettings)
      });
    } catch (error) {
      console.error('Update user settings error:', error);
      throw error;
    }
  }

  /**
   * Get user settings
   */
  async getUserSettings(userId: string): Promise<UserSettings> {
    try {
      const userDoc = await this.getUserDocument(userId);
      if (!userDoc) {
        throw new Error('User document not found');
      }

      return JSON.parse(userDoc.settings);
    } catch (error) {
      console.error('Get user settings error:', error);
      // Return default settings if error
      return {
        theme: 'light',
        notifications: true,
        autoSave: true,
        language: 'en'
      };
    }
  }
}

export const databaseService = new DatabaseService();