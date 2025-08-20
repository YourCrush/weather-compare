import { LRUCache } from '../utils/performance';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheOptions {
  ttl?: number;
  maxSize?: number;
  staleWhileRevalidate?: boolean;
  onEvict?: (key: string, entry: CacheEntry<any>) => void;
}

export class AdvancedCache<T = any> {
  private cache: Map<string, CacheEntry<T>>;
  private lru: LRUCache<string, boolean>;
  private options: Required<CacheOptions>;
  private cleanupInterval: NodeJS.Timeout;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: 15 * 60 * 1000, // 15 minutes default
      maxSize: 100,
      staleWhileRevalidate: true,
      onEvict: () => {},
      ...options,
    };

    this.cache = new Map();
    this.lru = new LRUCache(this.options.maxSize);

    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Get item from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired && !this.options.staleWhileRevalidate) {
      this.delete(key);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = now;
    this.lru.set(key, true);

    return entry.data;
  }

  /**
   * Set item in cache
   */
  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const entryTtl = ttl || this.options.ttl;

    // Check if we need to evict items
    if (this.cache.size >= this.options.maxSize && !this.cache.has(key)) {
      this.evictLeastUsed();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      ttl: entryTtl,
      accessCount: 0,
      lastAccessed: now,
    };

    this.cache.set(key, entry);
    this.lru.set(key, true);
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    
    if (isExpired && !this.options.staleWhileRevalidate) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (entry) {
      this.options.onEvict(key, entry);
    }

    this.lru.delete(key);
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.forEach((entry, key) => {
      this.options.onEvict(key, entry);
    });
    
    this.cache.clear();
    this.lru.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: Array<{ key: string; accessCount: number; age: number }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      accessCount: entry.accessCount,
      age: now - entry.timestamp,
    }));

    const totalAccesses = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    const hitRate = totalAccesses > 0 ? (totalAccesses / (totalAccesses + this.cache.size)) : 0;

    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      hitRate,
      entries,
    };
  }

  /**
   * Get or set with async function
   */
  async getOrSet<U extends T>(
    key: string,
    factory: () => Promise<U>,
    ttl?: number
  ): Promise<U> {
    const cached = this.get(key);
    
    if (cached !== null) {
      return cached as U;
    }

    try {
      const data = await factory();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      // Don't cache errors
      throw error;
    }
  }

  /**
   * Refresh cache entry in background
   */
  async refresh<U extends T>(
    key: string,
    factory: () => Promise<U>,
    ttl?: number
  ): Promise<void> {
    try {
      const data = await factory();
      this.set(key, data, ttl);
    } catch (error) {
      console.error(`Failed to refresh cache key ${key}:`, error);
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => {
      this.delete(key);
    });
  }

  /**
   * Evict least recently used item
   */
  private evictLeastUsed(): void {
    let leastUsedKey: string | null = null;
    let leastUsedScore = Infinity;

    this.cache.forEach((entry, key) => {
      // Score based on access count and recency
      const recencyScore = Date.now() - entry.lastAccessed;
      const accessScore = 1 / (entry.accessCount + 1);
      const score = recencyScore * accessScore;

      if (score < leastUsedScore) {
        leastUsedScore = score;
        leastUsedKey = key;
      }
    });

    if (leastUsedKey) {
      this.delete(leastUsedKey);
    }
  }

  /**
   * Destroy cache and cleanup
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

/**
 * Multi-level cache with memory and storage tiers
 */
export class MultiLevelCache<T = any> {
  private memoryCache: AdvancedCache<T>;
  private storageCache: Storage;
  private storagePrefix: string;

  constructor(
    memoryOptions: CacheOptions = {},
    storagePrefix: string = 'cache:'
  ) {
    this.memoryCache = new AdvancedCache(memoryOptions);
    this.storageCache = localStorage;
    this.storagePrefix = storagePrefix;
  }

  /**
   * Get from memory first, then storage
   */
  async get(key: string): Promise<T | null> {
    // Try memory cache first
    const memoryResult = this.memoryCache.get(key);
    if (memoryResult !== null) {
      return memoryResult;
    }

    // Try storage cache
    try {
      const storageKey = this.storagePrefix + key;
      const storageData = this.storageCache.getItem(storageKey);
      
      if (storageData) {
        const parsed = JSON.parse(storageData);
        const now = Date.now();
        
        if (now - parsed.timestamp < parsed.ttl) {
          // Promote to memory cache
          this.memoryCache.set(key, parsed.data, parsed.ttl - (now - parsed.timestamp));
          return parsed.data;
        } else {
          // Remove expired storage entry
          this.storageCache.removeItem(storageKey);
        }
      }
    } catch (error) {
      console.error('Storage cache read error:', error);
    }

    return null;
  }

  /**
   * Set in both memory and storage
   */
  set(key: string, data: T, ttl?: number): void {
    const actualTtl = ttl || 15 * 60 * 1000;
    
    // Set in memory cache
    this.memoryCache.set(key, data, actualTtl);

    // Set in storage cache
    try {
      const storageKey = this.storagePrefix + key;
      const storageData = {
        data,
        timestamp: Date.now(),
        ttl: actualTtl,
      };
      
      this.storageCache.setItem(storageKey, JSON.stringify(storageData));
    } catch (error) {
      console.error('Storage cache write error:', error);
    }
  }

  /**
   * Delete from both caches
   */
  delete(key: string): void {
    this.memoryCache.delete(key);
    
    try {
      const storageKey = this.storagePrefix + key;
      this.storageCache.removeItem(storageKey);
    } catch (error) {
      console.error('Storage cache delete error:', error);
    }
  }

  /**
   * Clear both caches
   */
  clear(): void {
    this.memoryCache.clear();
    
    try {
      const keys = Object.keys(this.storageCache);
      keys.forEach(key => {
        if (key.startsWith(this.storagePrefix)) {
          this.storageCache.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Storage cache clear error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      memory: this.memoryCache.getStats(),
      storage: this.getStorageStats(),
    };
  }

  private getStorageStats() {
    let count = 0;
    let totalSize = 0;

    try {
      const keys = Object.keys(this.storageCache);
      keys.forEach(key => {
        if (key.startsWith(this.storagePrefix)) {
          count++;
          const value = this.storageCache.getItem(key);
          if (value) {
            totalSize += value.length;
          }
        }
      });
    } catch (error) {
      console.error('Storage stats error:', error);
    }

    return { count, totalSize };
  }

  /**
   * Destroy cache
   */
  destroy(): void {
    this.memoryCache.destroy();
  }
}

// Export singleton instances
export const weatherCache = new MultiLevelCache<any>({
  ttl: 15 * 60 * 1000, // 15 minutes for weather data
  maxSize: 50,
}, 'weather:');

export const locationCache = new AdvancedCache<any>({
  ttl: 24 * 60 * 60 * 1000, // 24 hours for location data
  maxSize: 100,
});

export const chartCache = new AdvancedCache<any>({
  ttl: 5 * 60 * 1000, // 5 minutes for chart data
  maxSize: 20,
});