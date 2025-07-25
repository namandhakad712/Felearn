/**
 * Configuration for encryption service
 */
export const ENCRYPTION_CONFIG = {
  // Server-side secret to add to the encryption (in a real app, this would be an environment variable)
  pepper: 'storytelling-platform-secret-pepper-value',
  
  // Key rotation interval in days (0 means no automatic rotation)
  keyRotationDays: 90,
  
  // Maximum number of old keys to keep for decryption of legacy data
  maxOldKeys: 3
};