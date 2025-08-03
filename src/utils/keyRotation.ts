import { encryptionService } from '../services/encryption';
import { appwriteService } from '../services/appwrite';
// import { User } from '../types';
import { encryptApiKey, decryptApiKey } from './encryption';

/**
 * Utility for managing encryption key rotation
 */
export class KeyRotationUtil {
  /**
   * Rotate encryption keys and re-encrypt all sensitive data
   * @returns Promise indicating success
   */
  static async rotateKeys(): Promise<boolean> {
    try {
      // Check if user is admin
      const currentUser = await appwriteService.getCurrentUser();
      if (!currentUser?.isAdmin) {
        throw new Error('Only administrators can rotate encryption keys');
      }
      
      // Get all users to re-encrypt their API keys
      const users = await appwriteService.getAllUsers();
      
      // Store the API keys before rotation
      const apiKeys = new Map<string, string>();
      
      // Decrypt all API keys with the current key
      for (const user of users) {
        if (user.geminiKey) {
          try {
            const decryptedKey = await decryptApiKey(user.geminiKey);
            if (decryptedKey) {
              apiKeys.set(user.$id, decryptedKey);
            }
          } catch (error) {
            console.error(`Failed to decrypt API key for user ${user.$id}:`, error);
          }
        }
      }
      
      // Rotate the encryption keys
      await encryptionService.rotateKeys();
      
      // Re-encrypt all API keys with the new key
      for (const user of users) {
        const apiKey = apiKeys.get(user.$id);
        if (apiKey) {
          try {
            const newEncryptedKey = await encryptApiKey(apiKey);
            
            // Update the user document with the re-encrypted key
            await appwriteService.updateUserDocument(user.$id, {
              geminiKey: newEncryptedKey
            });
          } catch (error) {
            console.error(`Failed to re-encrypt API key for user ${user.$id}:`, error);
          }
        }
      }
      
      console.log('Key rotation completed successfully');
      return true;
    } catch (error) {
      console.error('Key rotation error:', error);
      throw error;
    }
  }

  /**
   * Check if key rotation is needed based on the last rotation date
   * @param rotationDays Number of days between rotations
   * @returns Boolean indicating if rotation is needed
   */
  static isRotationNeeded(rotationDays: number = 90): boolean {
    try {
      // Get the last rotation date from localStorage
      const lastRotation = localStorage.getItem('last_key_rotation');
      
      if (!lastRotation) {
        // No rotation has been done yet
        return true;
      }
      
      const lastRotationDate = new Date(lastRotation);
      const now = new Date();
      
      // Calculate the difference in days
      const diffTime = now.getTime() - lastRotationDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays >= rotationDays;
    } catch (error) {
      console.error('Error checking key rotation:', error);
      return false;
    }
  }

  /**
   * Update the last rotation date
   */
  static updateLastRotationDate(): void {
    try {
      localStorage.setItem('last_key_rotation', new Date().toISOString());
    } catch (error) {
      console.error('Error updating last rotation date:', error);
    }
  }
}

// Export a function to check if key rotation is needed on app startup
export const checkKeyRotation = async (): Promise<void> => {
  try {
    // Check if the user is an admin
    const currentUser = await appwriteService.getCurrentUser();
    if (currentUser?.isAdmin) {
      // Check if rotation is needed
      if (KeyRotationUtil.isRotationNeeded()) {
        console.log('Encryption key rotation is recommended');
        // In a real app, you might show a notification to the admin
      }
    }
  } catch (error) {
    console.error('Error checking key rotation:', error);
  }
};