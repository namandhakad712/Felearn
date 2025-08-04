import AuthLogger from './authLogger';

/**
 * Rate limiting configuration for different authentication operations
 */
interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

/**
 * Rate limit data structure
 */
// interface RateLimitData {
//   attempts: number;
//   windowStart: number;
//   blockedUntil: number | null;
// }

/**
 * Authentication Rate Limiter
 * Prevents abuse of authentication endpoints by implementing client-side rate limiting
 */
export class AuthRateLimiter {
  // Storage keys
  private static readonly STORAGE_PREFIX = 'auth_rate_limit_';
  
  // Default rate limit configurations
  private static readonly DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
    login: {
      maxAttempts: 5,
      windowMs: 5 * 60 * 1000, // 5 minutes
      blockDurationMs: 15 * 60 * 1000 // 15 minutes
    },
    registration: {
      maxAttempts: 3,
      windowMs: 60 * 60 * 1000, // 1 hour
      blockDurationMs: 24 * 60 * 60 * 1000 // 24 hours
    },
    password_reset: {
      maxAttempts: 3,
      windowMs: 60 * 60 * 1000, // 1 hour
      blockDurationMs: 60 * 60 * 1000 // 1 hour
    },
    default: {
      maxAttempts: 10,
      windowMs: 10 * 60 * 1000, // 10 minutes
      blockDurationMs: 30 * 60 * 1000 // 30 minutes
    }
  };
  
  /**
   * Check if an operation is rate limited
   * @param operation Operation name (login, registration, etc.)
   * @param identifier Unique identifier (email, IP, etc.)
   * @returns Whether the operation is currently rate limited
   */
  static isRateLimited(operation: string, identifier: string): boolean {
    try {
      const key = this.getStorageKey(operation, identifier);
      const storedData = localStorage.getItem(key);
      
      if (!storedData) {
        return false;
      }
      
      const data = JSON.parse(storedData);
      const now = Date.now();
      
      // Check if currently blocked
      if (data.blockedUntil && data.blockedUntil > now) {
        const remainingMinutes = Math.ceil((data.blockedUntil - now) / (60 * 1000));
        AuthLogger.warn(`Rate limit exceeded for ${operation}`, {
          identifier,
          remainingMinutes,
          operation
        });
        return true;
      }
      
      // Check if window has expired
      const config = this.getConfig(operation);
      if (data.windowStart && (now - data.windowStart) > config.windowMs) {
        // Window expired, reset attempts
        this.resetAttempts(operation, identifier);
        return false;
      }
      
      // Check if max attempts reached
      if (data.attempts >= config.maxAttempts) {
        // Block the operation
        this.blockOperation(operation, identifier);
        return true;
      }
      
      return false;
    } catch (error) {
      // If there's an error (e.g., localStorage not available), don't rate limit
      AuthLogger.error('Rate limit check failed', error, { operation, identifier });
      return false;
    }
  }
  
  /**
   * Record an attempt for rate limiting
   * @param operation Operation name (login, registration, etc.)
   * @param identifier Unique identifier (email, IP, etc.)
   * @returns Number of attempts remaining before rate limit
   */
  static recordAttempt(operation: string, identifier: string): number {
    try {
      const key = this.getStorageKey(operation, identifier);
      const now = Date.now();
      const config = this.getConfig(operation);
      
      // Get current data or initialize
      let data: {
        attempts: number;
        windowStart: number;
        blockedUntil: number | null;
      } = {
        attempts: 0,
        windowStart: now,
        blockedUntil: null
      };
      
      const storedData = localStorage.getItem(key);
      if (storedData) {
        data = JSON.parse(storedData);
        
        // Check if window has expired
        if (data.windowStart && (now - data.windowStart) > config.windowMs) {
          // Window expired, reset attempts
          data = {
            attempts: 0,
            windowStart: now,
            blockedUntil: null
          };
        }
      }
      
      // Increment attempts
      data.attempts++;
      
      // Check if max attempts reached
      if (data.attempts >= config.maxAttempts) {
        data.blockedUntil = now + config.blockDurationMs;
        
        AuthLogger.warn(`Rate limit triggered for ${operation}`, {
          identifier,
          attempts: data.attempts,
          blockedUntil: data.blockedUntil ? new Date(data.blockedUntil).toISOString() : null,
          operation
        });
      }
      
      // Save updated data
      localStorage.setItem(key, JSON.stringify(data));
      
      // Return attempts remaining
      return Math.max(0, config.maxAttempts - data.attempts);
    } catch (error) {
      // If there's an error, log it but don't block the operation
      AuthLogger.error('Failed to record rate limit attempt', error, { operation, identifier });
      return 999; // Return a high number to indicate no rate limiting
    }
  }
  
  /**
   * Reset attempts for an operation
   * @param operation Operation name (login, registration, etc.)
   * @param identifier Unique identifier (email, IP, etc.)
   */
  static resetAttempts(operation: string, identifier: string): void {
    try {
      const key = this.getStorageKey(operation, identifier);
      localStorage.removeItem(key);
      
      AuthLogger.debug(`Rate limit attempts reset for ${operation}`, {
        identifier,
        operation
      });
    } catch (error) {
      // If there's an error, just log it
      AuthLogger.error('Failed to reset rate limit attempts', error, { operation, identifier });
    }
  }
  
  /**
   * Block an operation for the configured duration
   * @param operation Operation name (login, registration, etc.)
   * @param identifier Unique identifier (email, IP, etc.)
   */
  private static blockOperation(operation: string, identifier: string): void {
    try {
      const key = this.getStorageKey(operation, identifier);
      const config = this.getConfig(operation);
      const now = Date.now();
      
      const data = {
        attempts: config.maxAttempts,
        windowStart: now,
        blockedUntil: now + config.blockDurationMs
      };
      
      localStorage.setItem(key, JSON.stringify(data));
      
      const blockMinutes = Math.ceil(config.blockDurationMs / (60 * 1000));
      AuthLogger.warn(`Operation ${operation} blocked for ${blockMinutes} minutes`, {
        identifier,
        operation,
        blockMinutes,
        blockedUntil: data.blockedUntil ? new Date(data.blockedUntil).toISOString() : null
      });
    } catch (error) {
      // If there's an error, just log it
      AuthLogger.error('Failed to block operation', error, { operation, identifier });
    }
  }
  
  /**
   * Get storage key for an operation and identifier
   * @param operation Operation name
   * @param identifier Unique identifier
   * @returns Storage key
   */
  private static getStorageKey(operation: string, identifier: string): string {
    // Hash the identifier to avoid storing PII directly
    const hashedIdentifier = this.hashString(identifier);
    return `${this.STORAGE_PREFIX}${operation}_${hashedIdentifier}`;
  }
  
  /**
   * Get rate limit configuration for an operation
   * @param operation Operation name
   * @returns Rate limit configuration
   */
  private static getConfig(operation: string): RateLimitConfig {
    return this.DEFAULT_CONFIGS[operation] || this.DEFAULT_CONFIGS.default;
  }
  
  /**
   * Simple string hashing function
   * @param str String to hash
   * @returns Hashed string
   */
  private static hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }
}

export default AuthRateLimiter;