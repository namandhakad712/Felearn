/**
 * Secure data transfer utilities
 */

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input User input string
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validates email format
 * @param email Email string to validate
 * @returns Boolean indicating if email is valid
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validates password strength
 * @param password Password to validate
 * @returns Validation result with score and feedback
 */
export function validatePassword(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }

  if (password.length >= 12) {
    score += 1;
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add uppercase letters');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add lowercase letters');
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add numbers');
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add special characters');
  }

  // Check for common patterns
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Avoid repeating characters');
    score -= 1;
  }

  if (/123|abc|qwe/i.test(password)) {
    feedback.push('Avoid common sequences');
    score -= 1;
  }

  const isValid = score >= 4 && password.length >= 8;

  return {
    isValid,
    score: Math.max(0, score),
    feedback,
  };
}

/**
 * Removes sensitive information from user data before logging or displaying
 * @param userData User data object
 * @returns Sanitized user data
 */
export function sanitizeUserData(userData: any): any {
  if (!userData || typeof userData !== 'object') {
    return userData;
  }

  const sanitized = { ...userData };
  
  // Remove sensitive fields
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'key',
    'apiKey',
    'geminiKey',
    'accessToken',
    'refreshToken',
  ];

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  // Mask email partially
  if (sanitized.email && typeof sanitized.email === 'string') {
    const [localPart, domain] = sanitized.email.split('@');
    if (localPart && domain) {
      const maskedLocal = localPart.length > 2 
        ? localPart[0] + '*'.repeat(localPart.length - 2) + localPart[localPart.length - 1]
        : localPart;
      sanitized.email = `${maskedLocal}@${domain}`;
    }
  }

  return sanitized;
}

/**
 * Validates and sanitizes form data
 * @param formData Form data object
 * @param rules Validation rules
 * @returns Validation result
 */
export function validateFormData(
  formData: Record<string, any>,
  rules: Record<string, {
    required?: boolean;
    type?: 'email' | 'password' | 'string' | 'number';
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  }>
): {
  isValid: boolean;
  errors: Record<string, string>;
  sanitizedData: Record<string, any>;
} {
  const errors: Record<string, string> = {};
  const sanitizedData: Record<string, any> = {};

  for (const [field, rule] of Object.entries(rules)) {
    const value = formData[field];

    // Check required fields
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[field] = `${field} is required`;
      continue;
    }

    // Skip validation if field is not required and empty
    if (!rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      sanitizedData[field] = '';
      continue;
    }

    // Type validation
    if (rule.type === 'email') {
      if (!validateEmail(value)) {
        errors[field] = 'Please enter a valid email address';
        continue;
      }
      sanitizedData[field] = value.toLowerCase().trim();
    } else if (rule.type === 'password') {
      const passwordValidation = validatePassword(value);
      if (!passwordValidation.isValid) {
        errors[field] = passwordValidation.feedback.join(', ');
        continue;
      }
      sanitizedData[field] = value; // Don't sanitize passwords
    } else if (rule.type === 'string') {
      sanitizedData[field] = sanitizeInput(value);
    } else if (rule.type === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        errors[field] = `${field} must be a number`;
        continue;
      }
      sanitizedData[field] = numValue;
    } else {
      sanitizedData[field] = sanitizeInput(value);
    }

    // Length validation
    if (rule.minLength && sanitizedData[field].length < rule.minLength) {
      errors[field] = `${field} must be at least ${rule.minLength} characters long`;
      continue;
    }

    if (rule.maxLength && sanitizedData[field].length > rule.maxLength) {
      errors[field] = `${field} must be no more than ${rule.maxLength} characters long`;
      continue;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(sanitizedData[field])) {
      errors[field] = `${field} format is invalid`;
      continue;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData,
  };
}

/**
 * Creates a secure headers object for API requests
 * @param additionalHeaders Additional headers to include
 * @returns Headers object
 */
export function createSecureHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...additionalHeaders,
  };
}

/**
 * Checks if a URL is safe for redirection
 * @param url URL to check
 * @param allowedDomains List of allowed domains
 * @returns Boolean indicating if URL is safe
 */
export function isSafeRedirectUrl(url: string, allowedDomains: string[] = []): boolean {
  try {
    const urlObj = new URL(url, window.location.origin);
    
    // Only allow same origin or explicitly allowed domains
    if (urlObj.origin === window.location.origin) {
      return true;
    }
    
    return allowedDomains.some(domain => urlObj.hostname === domain);
  } catch {
    // If URL parsing fails, it's not safe
    return false;
  }
}

/**
 * Generates a secure random string
 * @param length Length of the string
 * @returns Random string
 */
export function generateSecureRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

export default {
  sanitizeInput,
  validateEmail,
  validatePassword,
  sanitizeUserData,
  validateFormData,
  createSecureHeaders,
  isSafeRedirectUrl,
  generateSecureRandomString,
};