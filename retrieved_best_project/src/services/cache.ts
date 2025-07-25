/**
 * Cache service for storing and retrieving API responses
 */
class CacheService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Set a value in the cache
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in milliseconds (default: 5 minutes)
   */
  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns Cached data or null if not found or expired
   */
  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if the item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  /**
   * Check if a key exists in the cache and is not expired
   * @param key Cache key
   * @returns True if the key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a key from the cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Cached fetch function
   * @param url URL to fetch
   * @param options Fetch options
   * @param ttl Cache TTL in milliseconds
   * @returns Promise with the response data
   */
  async cachedFetch(url: string, options?: RequestInit, ttl?: number): Promise<any> {
    const cacheKey = `fetch:${url}:${JSON.stringify(options)}`;
    
    // Check if we have cached data
    const cachedData = this.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    
    // Fetch new data
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Cache the response
      this.set(cacheKey, data, ttl);
      
      return data;
    } catch (error) {
      console.error('Cached fetch error:', error);
      throw error;
    }
  }

  /**
   * Cached async function wrapper
   * @param key Cache key
   * @param fn Async function to cache
   * @param ttl Cache TTL in milliseconds
   * @returns Promise with the function result
   */
  async cachedFunction<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    // Check if we have cached data
    const cachedData = this.get(key);
    if (cachedData) {
      return cachedData;
    }
    
    // Execute the function
    try {
      const result = await fn();
      
      // Cache the result
      this.set(key, result, ttl);
      
      return result;
    } catch (error) {
      console.error('Cached function error:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const cacheService = new CacheService();

// Set up automatic cleanup every 10 minutes
setInterval(() => {
  cacheService.cleanup();
}, 10 * 60 * 1000);