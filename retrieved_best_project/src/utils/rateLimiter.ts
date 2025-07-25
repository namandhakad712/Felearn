/**
 * Rate limiting utility for authentication attempts
 */

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
}

class RateLimiter {
  private attempts: Map<string, AttemptRecord> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    
    // Clean up old records periodically
    setInterval(() => {
      this.cleanup();
    }, this.config.windowMs);
  }

  /**
   * Check if an action is allowed for a given key
   * @param key Identifier (e.g., email address or IP)
   * @returns Object with allowed status and remaining time if blocked
   */
  isAllowed(key: string): { allowed: boolean; remainingTime?: number; attemptsLeft?: number } {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record) {
      return { allowed: true, attemptsLeft: this.config.maxAttempts - 1 };
    }

    // Check if currently blocked
    if (record.blockedUntil && now < record.blockedUntil) {
      return {
        allowed: false,
        remainingTime: record.blockedUntil - now,
      };
    }

    // Check if window has expired
    if (now - record.firstAttempt > this.config.windowMs) {
      // Reset the record
      this.attempts.delete(key);
      return { allowed: true, attemptsLeft: this.config.maxAttempts - 1 };
    }

    // Check if max attempts reached
    if (record.count >= this.config.maxAttempts) {
      // Block the key
      record.blockedUntil = now + this.config.blockDurationMs;
      return {
        allowed: false,
        remainingTime: this.config.blockDurationMs,
      };
    }

    return {
      allowed: true,
      attemptsLeft: this.config.maxAttempts - record.count - 1,
    };
  }

  /**
   * Record an attempt for a given key
   * @param key Identifier (e.g., email address or IP)
   */
  recordAttempt(key: string): void {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record) {
      this.attempts.set(key, {
        count: 1,
        firstAttempt: now,
      });
    } else {
      // Check if window has expired
      if (now - record.firstAttempt > this.config.windowMs) {
        // Reset the record
        this.attempts.set(key, {
          count: 1,
          firstAttempt: now,
        });
      } else {
        record.count++;
      }
    }
  }

  /**
   * Reset attempts for a given key (e.g., after successful login)
   * @param key Identifier to reset
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }

  /**
   * Clean up expired records
   */
  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, record] of this.attempts.entries()) {
      // Remove records that are outside the window and not blocked
      if (
        now - record.firstAttempt > this.config.windowMs &&
        (!record.blockedUntil || now > record.blockedUntil)
      ) {
        this.attempts.delete(key);
      }
    }
  }

  /**
   * Get current status for a key
   * @param key Identifier to check
   * @returns Current status information
   */
  getStatus(key: string): {
    attempts: number;
    maxAttempts: number;
    isBlocked: boolean;
    remainingTime?: number;
  } {
    const record = this.attempts.get(key);
    const now = Date.now();

    if (!record) {
      return {
        attempts: 0,
        maxAttempts: this.config.maxAttempts,
        isBlocked: false,
      };
    }

    const isBlocked = record.blockedUntil ? now < record.blockedUntil : false;
    const remainingTime = isBlocked ? record.blockedUntil! - now : undefined;

    return {
      attempts: record.count,
      maxAttempts: this.config.maxAttempts,
      isBlocked,
      remainingTime,
    };
  }
}

// Create rate limiters for different types of authentication attempts
export const loginRateLimiter = new RateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 30 * 60 * 1000, // 30 minutes
});

export const registrationRateLimiter = new RateLimiter({
  maxAttempts: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  blockDurationMs: 60 * 60 * 1000, // 1 hour
});

export const passwordResetRateLimiter = new RateLimiter({
  maxAttempts: 3,
  windowMs: 60 * 60 * 1000, // 1 hour
  blockDurationMs: 60 * 60 * 1000, // 1 hour
});

/**
 * Format remaining time for display
 * @param ms Milliseconds remaining
 * @returns Formatted time string
 */
export function formatRemainingTime(ms: number): string {
  const minutes = Math.ceil(ms / (60 * 1000));
  
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  }
  
  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours === 1 ? '' : 's'}`;
}

/**
 * Hook for using rate limiting in components
 * @param limiter Rate limiter instance
 * @param key Key to use for rate limiting
 * @returns Rate limiting utilities
 */
export function useRateLimit(limiter: RateLimiter, key: string) {
  const checkLimit = () => limiter.isAllowed(key);
  const recordAttempt = () => limiter.recordAttempt(key);
  const reset = () => limiter.reset(key);
  const getStatus = () => limiter.getStatus(key);

  return {
    checkLimit,
    recordAttempt,
    reset,
    getStatus,
  };
}

export { RateLimiter };
export default {
  loginRateLimiter,
  registrationRateLimiter,
  passwordResetRateLimiter,
  formatRemainingTime,
  useRateLimit,
  RateLimiter,
};