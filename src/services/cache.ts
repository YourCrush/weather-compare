import { CacheService, CacheEntry } from '../types/api';
import { CacheError } from '../types/errors';

export class MemoryCacheService implements CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(cleanupIntervalMs = 5 * 60 * 1000) { // 5 minutes
    this.startCleanup(cleanupIntervalMs);
  }

  get<T>(key: string): T | null {
    try {
      const entry = this.cache.get(key);
      
      if (!entry) {
        return null;
      }

      const now = Date.now();
      if (now > entry.timestamp + entry.ttl) {
        this.cache.delete(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Cache get error:', error);
      throw new CacheError(`Failed to get cache entry for key: ${key}`, 'get');
    }
  }

  set<T>(key: string, data: T, ttl: number): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };

      this.cache.set(key, entry);
    } catch (error) {
      console.error('Cache set error:', error);
      throw new CacheError(`Failed to set cache entry for key: ${key}`, 'set');
    }
  }

  invalidate(pattern: string): void {
    try {
      const regex = new RegExp(pattern);
      const keysToDelete: string[] = [];

      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach(key => this.cache.delete(key));
    } catch (error) {
      console.error('Cache invalidate error:', error);
      throw new CacheError(`Failed to invalidate cache with pattern: ${pattern}`, 'invalidate');
    }
  }

  clear(): void {
    try {
      this.cache.clear();
    } catch (error) {
      console.error('Cache clear error:', error);
      throw new CacheError('Failed to clear cache', 'clear');
    }
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  private startCleanup(intervalMs: number): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, intervalMs);
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));

    if (expiredKeys.length > 0) {
      console.log(`Cache cleanup: removed ${expiredKeys.length} expired entries`);
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// Cache key generators
export const CacheKeys = {
  currentWeather: (lat: number, lon: number) => `weather:current:${lat}:${lon}`,
  weeklyForecast: (lat: number, lon: number) => `weather:weekly:${lat}:${lon}`,
  historicalData: (lat: number, lon: number, months: number) => `weather:historical:${lat}:${lon}:${months}`,
  locationSearch: (query: string) => `location:search:${encodeURIComponent(query)}`,
  geocoding: (lat: number, lon: number) => `location:geocoding:${lat}:${lon}`,
} as const;

// Cache TTL constants (in milliseconds)
export const CacheTTL = {
  CURRENT_WEATHER: 15 * 60 * 1000, // 15 minutes
  WEEKLY_FORECAST: 15 * 60 * 1000, // 15 minutes
  HISTORICAL_DATA: 24 * 60 * 60 * 1000, // 24 hours
  LOCATION_SEARCH: 60 * 60 * 1000, // 1 hour
  GEOCODING: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Singleton instance
export const cacheService = new MemoryCacheService();