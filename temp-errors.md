encryption.ts:227 Decryption error: OperationError

encryption.ts:227 Decryption error: OperationError
encryption.ts:288 Failed to decrypt with key v1_1753985645101: OperationError
encryption.ts:233 Fallback decryption error: Error: Failed to decrypt data with any available key
    at EncryptionService.decryptWithOlderKeys (encryption.ts:292:11)
    at async EncryptionService.decrypt (encryption.ts:231:16)
    at async decryptApiKey (encryption.ts:44:14)
    at async loadApiKey (ApiKeyManager.tsx:37:32)
encryption.ts:46 Secure decryption failed, trying fallback decryption: Error: Failed to decrypt data
    at EncryptionService.decrypt (encryption.ts:234:15)
    at async decryptApiKey (encryption.ts:44:14)
    at async loadApiKey (ApiKeyManager.tsx:37:32)
encryption.ts:288 Failed to decrypt with key v1_1753985645101: OperationError
encryption.ts:233 Fallback decryption error: Error: Failed to decrypt data with any available key
    at EncryptionService.decryptWithOlderKeys (encryption.ts:292:11)
    at async EncryptionService.decrypt (encryption.ts:231:16)
    at async decryptApiKey (encryption.ts:44:14)
    at async loadApiKey (ApiKeyManager.tsx:37:32)
encryption.ts:46 Secure decryption failed, trying fallback decryption: Error: Failed to decrypt data
    at EncryptionService.decrypt (encryption.ts:234:15)
    at async decryptApiKey (encryption.ts:44:14)
    at async loadApiKey (ApiKeyManager.tsx:37:32)