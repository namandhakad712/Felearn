/**
 * Utility functions for encrypting and decrypting sensitive data
 * This is a wrapper around the encryption service to maintain backward compatibility
 */
import { encryptionService } from '../services/encryption';

/**
 * Encrypt an API key
 * @param apiKey API key to encrypt
 * @returns Encrypted API key
 */
export const encryptApiKey = async (apiKey: string): Promise<string> => {
  if (!apiKey) return '';
  
  // Check if Web Crypto API is supported
  if (encryptionService.isSupported()) {
    try {
      // Use the secure encryption service
      return await encryptionService.encrypt(apiKey);
    } catch (error) {
      console.error('Secure encryption failed, falling back to basic encryption:', error);
      // Fall back to basic encryption
      return encryptionService.fallbackEncrypt(apiKey);
    }
  } else {
    // Fall back to basic encryption for unsupported browsers
    console.warn('Web Crypto API not supported, using fallback encryption');
    return encryptionService.fallbackEncrypt(apiKey);
  }
};

/**
 * Decrypt an API key
 * @param encryptedKey Encrypted API key
 * @returns Decrypted API key
 */
export const decryptApiKey = async (encryptedKey: string): Promise<string> => {
  if (!encryptedKey) return '';
  
  // Check if Web Crypto API is supported
  if (encryptionService.isSupported()) {
    try {
      // Try secure decryption first
      return await encryptionService.decrypt(encryptedKey);
    } catch (error) {
      console.error('Secure decryption failed, trying fallback decryption:', error);
      // Try fallback decryption
      return encryptionService.fallbackDecrypt(encryptedKey);
    }
  } else {
    // Fall back to basic decryption for unsupported browsers
    console.warn('Web Crypto API not supported, using fallback decryption');
    return encryptionService.fallbackDecrypt(encryptedKey);
  }
};

/**
 * Mask the API key for display
 * @param apiKey API key to mask
 * @returns Masked API key
 */
export const maskApiKey = (apiKey: string): string => {
  return encryptionService.maskApiKey(apiKey);
};