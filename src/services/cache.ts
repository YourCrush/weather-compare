export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export enum CacheKeys {
  CURRENT_WEATHER = 'current_weather',
  FORECAST = 'forecast',
  HISTORICAL = 'historical',
  GEOCODING = 'geocoding',
}

export enum CacheTTL {
  CURRENT_WEATHER = 15, // 15 minutes
  FORECAST = 60, // 1 hour
  HISTORICAL = 1440, // 24 hours
  GEOCODING = 10080, // 1 week
}

export class CacheService {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttlMinutes: number = 15): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000, // Convert to milliseconds
    };
    this.cache.set(key, entry);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const cacheService = new CacheService();