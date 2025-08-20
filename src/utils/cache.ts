import { cacheService, CacheKeys, CacheTTL } from '../services/cache';
import { WeatherData, Location } from '../types';

/**
 * Cache utility functions for weather data
 */
export class CacheUtils {
  /**
   * Get cached weather data for a location
   */
  static getCachedWeatherData(location: Location): Partial<WeatherData> | null {
    const { latitude, longitude } = location;
    
    const current = cacheService.get(CacheKeys.currentWeather(latitude, longitude));
    const weekly = cacheService.get(CacheKeys.weeklyForecast(latitude, longitude));
    const historical = cacheService.get(CacheKeys.historicalData(latitude, longitude, 24));

    if (!current && !weekly && !historical) {
      return null;
    }

    return {
      ...(current && { current }),
      ...(weekly && { weekly }),
      ...(historical && { historical }),
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Cache weather data for a location
   */
  static cacheWeatherData(location: Location, data: Partial<WeatherData>): void {
    const { latitude, longitude } = location;

    if (data.current) {
      cacheService.set(
        CacheKeys.currentWeather(latitude, longitude),
        data.current,
        CacheTTL.CURRENT_WEATHER
      );
    }

    if (data.weekly) {
      cacheService.set(
        CacheKeys.weeklyForecast(latitude, longitude),
        data.weekly,
        CacheTTL.WEEKLY_FORECAST
      );
    }

    if (data.historical) {
      cacheService.set(
        CacheKeys.historicalData(latitude, longitude, 24),
        data.historical,
        CacheTTL.HISTORICAL_DATA
      );
    }
  }

  /**
   * Invalidate all weather data for a location
   */
  static invalidateLocationData(location: Location): void {
    const { latitude, longitude } = location;
    
    cacheService.invalidate(`weather:.*:${latitude}:${longitude}`);
  }

  /**
   * Invalidate all current weather data (for refresh)
   */
  static invalidateCurrentWeather(): void {
    cacheService.invalidate('weather:current:.*');
  }

  /**
   * Invalidate all forecast data
   */
  static invalidateForecastData(): void {
    cacheService.invalidate('weather:weekly:.*');
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    size: number;
    keys: string[];
    weatherEntries: number;
    locationEntries: number;
  } {
    const keys = cacheService.keys();
    const weatherEntries = keys.filter(key => key.startsWith('weather:')).length;
    const locationEntries = keys.filter(key => key.startsWith('location:')).length;

    return {
      size: cacheService.size(),
      keys,
      weatherEntries,
      locationEntries,
    };
  }

  /**
   * Preload weather data for multiple locations
   */
  static async preloadWeatherData(
    locations: Location[],
    fetchFunction: (location: Location) => Promise<WeatherData>
  ): Promise<void> {
    const promises = locations.map(async (location) => {
      const cached = this.getCachedWeatherData(location);
      
      // Only fetch if we don't have recent data
      if (!cached || !cached.current) {
        try {
          const data = await fetchFunction(location);
          this.cacheWeatherData(location, data);
        } catch (error) {
          console.warn(`Failed to preload data for ${location.name}:`, error);
        }
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Check if location has fresh weather data
   */
  static hasRecentWeatherData(location: Location): boolean {
    const cached = this.getCachedWeatherData(location);
    return !!(cached && cached.current);
  }

  /**
   * Get cache hit rate for monitoring
   */
  static getCacheHitRate(): { hits: number; misses: number; rate: number } {
    // This would need to be implemented with counters in a real app
    // For now, return mock data
    return {
      hits: 0,
      misses: 0,
      rate: 0,
    };
  }
}

/**
 * Cache warming utility - preloads commonly accessed data
 */
export class CacheWarmer {
  private static warmupInProgress = false;

  /**
   * Warm up cache with user's favorite locations
   */
  static async warmupFavorites(
    favorites: Location[],
    fetchFunction: (location: Location) => Promise<WeatherData>
  ): Promise<void> {
    if (this.warmupInProgress || favorites.length === 0) {
      return;
    }

    this.warmupInProgress = true;

    try {
      console.log(`Warming up cache for ${favorites.length} favorite locations`);
      await CacheUtils.preloadWeatherData(favorites, fetchFunction);
      console.log('Cache warmup completed');
    } catch (error) {
      console.error('Cache warmup failed:', error);
    } finally {
      this.warmupInProgress = false;
    }
  }

  /**
   * Background refresh of cached data
   */
  static async backgroundRefresh(
    locations: Location[],
    fetchFunction: (location: Location) => Promise<WeatherData>
  ): Promise<void> {
    // Only refresh data that's getting close to expiration
    const locationsToRefresh = locations.filter(location => {
      const cached = CacheUtils.getCachedWeatherData(location);
      if (!cached || !cached.current) return true;

      // Refresh if data is older than 10 minutes (before 15-minute TTL expires)
      const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
      const lastUpdated = new Date(cached.lastUpdated || 0).getTime();
      
      return lastUpdated < tenMinutesAgo;
    });

    if (locationsToRefresh.length > 0) {
      console.log(`Background refreshing ${locationsToRefresh.length} locations`);
      await CacheUtils.preloadWeatherData(locationsToRefresh, fetchFunction);
    }
  }
}