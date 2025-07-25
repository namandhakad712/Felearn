/**
 * Error mapping utilities for Firebase and Appwrite errors
 */

// Firebase error code mappings
const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'This email is already registered. Please use a different email or try logging in.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
  'auth/weak-password': 'Password is too weak. Please choose a stronger password with at least 6 characters.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/too-many-requests': 'Too many failed login attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Please check your connection and try again.',
  'auth/requires-recent-login': 'This operation requires recent authentication. Please log in again.',
  'auth/invalid-action-code': 'The action code is invalid. This can happen if the code is malformed or has expired.',
  'auth/expired-action-code': 'The action code has expired. Please request a new one.',
  'auth/invalid-continue-uri': 'The continue URL provided is invalid.',
  'auth/unauthorized-continue-uri': 'The domain of the continue URL is not whitelisted.',
};

// Appwrite error code mappings
const APPWRITE_ERROR_MESSAGES: Record<number, string> = {
  400: 'Bad request. Please check your input and try again.',
  401: 'Authentication failed. Please log in again.',
  403: 'Access denied. You do not have permission to perform this action.',
  404: 'Resource not found.',
  409: 'Conflict. The resource already exists.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Internal server error. Please try again later.',
  503: 'Service unavailable. Please try again later.',
};

// Generic error messages
const GENERIC_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
};

/**
 * Maps Firebase error codes to user-friendly messages
 * @param error Firebase error object
 * @returns User-friendly error message
 */
export function mapFirebaseError(error: any): string {
  if (!error) {
    return GENERIC_ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  // Check if it's a Firebase error with a code
  if (error.code && FIREBASE_ERROR_MESSAGES[error.code]) {
    return FIREBASE_ERROR_MESSAGES[error.code];
  }

  // Check for network errors
  if (error.message?.toLowerCase().includes('network')) {
    return GENERIC_ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Check for timeout errors
  if (error.message?.toLowerCase().includes('timeout')) {
    return GENERIC_ERROR_MESSAGES.TIMEOUT_ERROR;
  }

  // Return the original message if it's user-friendly, otherwise return generic message
  if (error.message && error.message.length < 200 && !error.message.includes('Error:')) {
    return error.message;
  }

  return GENERIC_ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Maps Appwrite error codes to user-friendly messages
 * @param error Appwrite error object
 * @returns User-friendly error message
 */
export function mapAppwriteError(error: any): string {
  if (!error) {
    return GENERIC_ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  // Check if it's an Appwrite error with a status code
  if (error.code && APPWRITE_ERROR_MESSAGES[error.code]) {
    return APPWRITE_ERROR_MESSAGES[error.code];
  }

  // Check for specific Appwrite error types
  if (error.type) {
    switch (error.type) {
      case 'user_already_exists':
        return 'An account with this email already exists.';
      case 'user_not_found':
        return 'User not found.';
      case 'user_unauthorized':
        return 'You are not authorized to perform this action.';
      case 'document_not_found':
        return 'The requested data was not found.';
      case 'document_already_exists':
        return 'This data already exists.';
      case 'collection_not_found':
        return 'Data collection not found.';
      case 'attribute_not_found':
        return 'Required data field is missing.';
      case 'index_not_found':
        return 'Data index not found.';
      default:
        break;
    }
  }

  // Check for network errors
  if (error.message?.toLowerCase().includes('network') || error.message?.toLowerCase().includes('fetch')) {
    return GENERIC_ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Return the original message if it's user-friendly
  if (error.message && error.message.length < 200 && !error.message.includes('Error:')) {
    return error.message;
  }

  return GENERIC_ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Generic error mapper that handles both Firebase and Appwrite errors
 * @param error Error object from Firebase or Appwrite
 * @returns User-friendly error message
 */
export function mapError(error: any): string {
  if (!error) {
    return GENERIC_ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  // Try Firebase error mapping first
  if (error.code && error.code.startsWith('auth/')) {
    return mapFirebaseError(error);
  }

  // Try Appwrite error mapping
  if (error.code && typeof error.code === 'number') {
    return mapAppwriteError(error);
  }

  // Try Appwrite error mapping by type
  if (error.type) {
    return mapAppwriteError(error);
  }

  // Fallback to generic mapping
  if (error.message?.toLowerCase().includes('network')) {
    return GENERIC_ERROR_MESSAGES.NETWORK_ERROR;
  }

  if (error.message?.toLowerCase().includes('timeout')) {
    return GENERIC_ERROR_MESSAGES.TIMEOUT_ERROR;
  }

  // Return the original message if it seems user-friendly
  if (error.message && error.message.length < 200 && !error.message.includes('Error:')) {
    return error.message;
  }

  return GENERIC_ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Creates a standardized error object
 * @param message Error message
 * @param code Optional error code
 * @param type Optional error type
 * @returns Standardized error object
 */
export function createError(message: string, code?: string | number, type?: string): Error {
  const error = new Error(message);
  (error as any).code = code;
  (error as any).type = type;
  return error;
}

export default {
  mapFirebaseError,
  mapAppwriteError,
  mapError,
  createError,
};