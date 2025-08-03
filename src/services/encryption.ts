import { ENCRYPTION_CONFIG } from '../config/encryption';

/**
 * Service for securely encrypting and decrypting sensitive data using Web Crypto API
 * Implements AES-256-GCM encryption for API keys and other sensitive data
 */
class EncryptionService {
  private readonly algorithm = 'AES-GCM';
  private readonly keyLength = 256; // AES-256
  private readonly saltLength = 16; // 16 bytes salt
  private readonly ivLength = 12; // 12 bytes IV for AES-GCM
  private readonly tagLength = 128; // 128 bits authentication tag
  private readonly iterations = 100000; // PBKDF2 iterations
  private readonly pepper = ENCRYPTION_CONFIG.pepper; // Server-side secret to add to the encryption
  private readonly storageKeyPrefix = 'encryption_key_';
  private readonly currentKeyVersion = 'v1'; // For key rotation

  /**
   * Generate a cryptographic key from a password
   * @param password Password to derive key from
   * @param salt Salt for key derivation
   * @returns Promise with CryptoKey
   */
  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    // Use the pepper to add server-side security
    const passwordWithPepper = password + this.pepper;
    
    // Convert password to key material
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(passwordWithPepper);
    
    // Import key material
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      passwordData,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    
    // Derive the actual encryption key using PBKDF2
    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: this.iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: this.algorithm, length: this.keyLength },
      false, // Not extractable
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generate a random encryption key and store it securely
   * @returns Promise with the key identifier
   */
  private async generateAndStoreKey(): Promise<string> {
    try {
      // Generate a random key
      const key = await window.crypto.subtle.generateKey(
        {
          name: this.algorithm,
          length: this.keyLength
        },
        true, // Extractable
        ['encrypt', 'decrypt']
      );
      
      // Export the key to raw format
      const rawKey = await window.crypto.subtle.exportKey('raw', key);
      
      // Convert to base64 for storage
      const base64Key = btoa(String.fromCharCode(...new Uint8Array(rawKey)));
      
      // Generate a unique key ID
      const keyId = `${this.currentKeyVersion}_${Date.now()}`;
      
      // Store the key in localStorage with the key ID
      localStorage.setItem(`${this.storageKeyPrefix}${keyId}`, base64Key);
      
      // Store the current key ID
      localStorage.setItem(`${this.storageKeyPrefix}current`, keyId);
      
      return keyId;
    } catch (error) {
      console.error('Error generating encryption key:', error);
      throw new Error('Failed to generate encryption key');
    }
  }

  /**
   * Get the current encryption key
   * @returns Promise with the current CryptoKey
   */
  private async getCurrentKey(): Promise<CryptoKey> {
    try {
      // Get the current key ID
      const keyId = localStorage.getItem(`${this.storageKeyPrefix}current`);
      
      if (!keyId) {
        // No key exists, generate a new one
        const newKeyId = await this.generateAndStoreKey();
        return this.getKeyById(newKeyId);
      }
      
      return this.getKeyById(keyId);
    } catch (error) {
      console.error('Error getting current encryption key:', error);
      throw new Error('Failed to get encryption key');
    }
  }

  /**
   * Get a specific encryption key by ID
   * @param keyId Key identifier
   * @returns Promise with the CryptoKey
   */
  private async getKeyById(keyId: string): Promise<CryptoKey> {
    try {
      // Get the key from localStorage
      const base64Key = localStorage.getItem(`${this.storageKeyPrefix}${keyId}`);
      
      if (!base64Key) {
        throw new Error(`Encryption key not found: ${keyId}`);
      }
      
      // Convert from base64 to Uint8Array
      const rawKey = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
      
      // Import the key
      return window.crypto.subtle.importKey(
        'raw',
        rawKey,
        {
          name: this.algorithm,
          length: this.keyLength
        },
        false, // Not extractable
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error(`Error getting encryption key ${keyId}:`, error);
      throw new Error('Failed to get encryption key');
    }
  }

  /**
   * Encrypt data using AES-256-GCM
   * @param data Data to encrypt
   * @returns Promise with encrypted data as a string
   */
  async encrypt(data: string): Promise<string> {
    try {
      if (!data) return '';
      
      // Get the current encryption key
      const key = await this.getCurrentKey();
      
      // Generate a random IV
      const iv = window.crypto.getRandomValues(new Uint8Array(this.ivLength));
      
      // Encode the data
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      // Encrypt the data
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv,
          tagLength: this.tagLength
        },
        key,
        dataBuffer
      );
      
      // Combine IV and encrypted data
      const result = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      result.set(iv);
      result.set(new Uint8Array(encryptedBuffer), iv.length);
      
      // Convert to base64 for storage
      return btoa(String.fromCharCode(...result));
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   * @param encryptedData Encrypted data as a string
   * @returns Promise with decrypted data
   */
  async decrypt(encryptedData: string): Promise<string> {
    try {
      if (!encryptedData) return '';
      
      // Convert from base64 to Uint8Array
      const data = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      
      // Extract IV and encrypted data
      const iv = data.slice(0, this.ivLength);
      const encryptedBuffer = data.slice(this.ivLength);
      
      // Get the current encryption key
      const key = await this.getCurrentKey();
      
      // Decrypt the data
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv,
          tagLength: this.tagLength
        },
        key,
        encryptedBuffer
      );
      
      // Decode the data
      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      console.error('Decryption error:', error);
      
      // Try to decrypt with older keys if available
      try {
        return await this.decryptWithOlderKeys(encryptedData);
      } catch (fallbackError) {
        console.error('Fallback decryption error:', fallbackError);
        throw new Error('Failed to decrypt data');
      }
    }
  }

  /**
   * Attempt to decrypt data using older encryption keys
   * @param encryptedData Encrypted data as a string
   * @returns Promise with decrypted data
   */
  private async decryptWithOlderKeys(encryptedData: string): Promise<string> {
    // Get all key IDs from localStorage
    const keyIds: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.storageKeyPrefix) && key !== `${this.storageKeyPrefix}current`) {
        keyIds.push(key.substring(this.storageKeyPrefix.length));
      }
    }
    
    // Try each key
    for (const keyId of keyIds) {
      try {
        // Convert from base64 to Uint8Array
        const data = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
        
        // Extract IV and encrypted data
        const iv = data.slice(0, this.ivLength);
        const encryptedBuffer = data.slice(this.ivLength);
        
        // Get the key
        const key = await this.getKeyById(keyId);
        
        // Decrypt the data
        const decryptedBuffer = await window.crypto.subtle.decrypt(
          {
            name: this.algorithm,
            iv,
            tagLength: this.tagLength
          },
          key,
          encryptedBuffer
        );
        
        // Decode the data
        const decoder = new TextDecoder();
        const decryptedData = decoder.decode(decryptedBuffer);
        
        // Re-encrypt with the current key for future use
        await this.reEncryptData(decryptedData);
        
        return decryptedData;
      } catch (error) {
        // Continue to the next key
        console.warn(`Failed to decrypt with key ${keyId}:`, error);
      }
    }
    
    throw new Error('Failed to decrypt data with any available key');
  }

  /**
   * Re-encrypt data with the current key
   * @param data Data to re-encrypt
   * @returns Promise with the re-encrypted data
   */
  private async reEncryptData(data: string): Promise<string> {
    return this.encrypt(data);
  }

  /**
   * Rotate encryption keys
   * @returns Promise indicating success
   */
  async rotateKeys(): Promise<boolean> {
    try {
      // Generate a new key
      const newKeyId = await this.generateAndStoreKey();
      console.log(`Generated new encryption key: ${newKeyId}`);
      
      // Set it as the current key
      localStorage.setItem(`${this.storageKeyPrefix}current`, newKeyId);
      
      return true;
    } catch (error) {
      console.error('Key rotation error:', error);
      throw new Error('Failed to rotate encryption keys');
    }
  }

  /**
   * Clear all encryption keys (useful when keys are corrupted)
   * @returns Promise indicating success
   */
  async clearAllKeys(): Promise<boolean> {
    try {
      // Get all key IDs from localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storageKeyPrefix)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all encryption keys
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log(`Cleared ${keysToRemove.length} encryption keys`);
      return true;
    } catch (error) {
      console.error('Error clearing encryption keys:', error);
      return false;
    }
  }

  /**
   * Check if the browser supports the required crypto APIs
   * @returns Boolean indicating support
   */
  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      window.crypto &&
      window.crypto.subtle &&
      typeof window.crypto.subtle.encrypt === 'function' &&
      typeof window.crypto.subtle.decrypt === 'function'
    );
  }

  /**
   * Fallback encryption for browsers that don't support Web Crypto API
   * @param data Data to encrypt
   * @returns Encrypted data
   */
  fallbackEncrypt(data: string): string {
    if (!data) return '';
    
    // Add a prefix to make it harder to recognize
    const prefixed = `gemini_key_${data}`;
    
    // Convert to Base64
    return btoa(prefixed);
  }

  /**
   * Fallback decryption for browsers that don't support Web Crypto API
   * @param encryptedData Encrypted data
   * @returns Decrypted data
   */
  fallbackDecrypt(encryptedData: string): string {
    if (!encryptedData) return '';
    
    try {
      // Decode from Base64
      const decoded = atob(encryptedData);
      
      // Remove the prefix
      const prefix = 'gemini_key_';
      if (decoded.startsWith(prefix)) {
        return decoded.substring(prefix.length);
      }
      
      return '';
    } catch (error) {
      console.error('Fallback decryption error:', error);
      return '';
    }
  }

  /**
   * Mask the API key for display
   * @param apiKey API key to mask
   * @returns Masked API key
   */
  maskApiKey(apiKey: string): string {
    if (!apiKey) return '';
    
    // Show only the first 4 and last 4 characters
    if (apiKey.length <= 8) {
      return '••••••••';
    }
    
    const firstFour = apiKey.substring(0, 4);
    const lastFour = apiKey.substring(apiKey.length - 4);
    
    return `${firstFour}${'•'.repeat(apiKey.length - 8)}${lastFour}`;
  }
}

// Create and export a singleton instance
export const encryptionService = new EncryptionService();