export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export const CacheKeys = {
  currentWeather: (lat: number, lon: number) => `weather:current:${lat}:${lon}`,
  weeklyForecast: (lat: number, lon: number) => `weather:weekly:${lat}:${lon}`,
  todayForecast: (lat: number, lon: number) => `weather:today:${lat}:${lon}`,
  historicalData: (lat: number, lon: number, months: number) => `weather:historical:${lat}:${lon}:${months}`,
  locationSearch: (query: string) => `location:search:${encodeURIComponent(query)}`,
};

export const CacheTTL = {
  CURRENT_WEATHER: 15, // 15 minutes
  WEEKLY_FORECAST: 60, // 1 hour
  HISTORICAL_DATA: 1440, // 24 hours
  LOCATION_SEARCH: 10080, // 1 week
  GEOCODING: 10080, // 1 week
};

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