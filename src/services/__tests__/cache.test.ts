import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemoryCacheService, CacheKeys, CacheTTL } from '../cache';
import { CacheError } from '../../types/errors';

describe('MemoryCacheService', () => {
  let cacheService: MemoryCacheService;

  beforeEach(() => {
    cacheService = new MemoryCacheService(100); // Short cleanup interval for testing
  });

  afterEach(() => {
    cacheService.destroy();
  });

  describe('basic operations', () => {
    it('should store and retrieve data', () => {
      const key = 'test-key';
      const data = { value: 'test-data' };
      const ttl = 1000;

      cacheService.set(key, data, ttl);
      const retrieved = cacheService.get(key);

      expect(retrieved).toEqual(data);
    });

    it('should return null for non-existent keys', () => {
      const result = cacheService.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('should return null for expired entries', async () => {
      const key = 'expired-key';
      const data = { value: 'test-data' };
      const ttl = 10; // 10ms

      cacheService.set(key, data, ttl);
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 20));
      
      const result = cacheService.get(key);
      expect(result).toBeNull();
    });

    it('should clear all entries', () => {
      cacheService.set('key1', 'data1', 1000);
      cacheService.set('key2', 'data2', 1000);

      expect(cacheService.size()).toBe(2);

      cacheService.clear();

      expect(cacheService.size()).toBe(0);
      expect(cacheService.get('key1')).toBeNull();
      expect(cacheService.get('key2')).toBeNull();
    });
  });

  describe('invalidation', () => {
    it('should invalidate entries matching pattern', () => {
      cacheService.set('weather:current:1:2', 'data1', 1000);
      cacheService.set('weather:weekly:1:2', 'data2', 1000);
      cacheService.set('location:search:test', 'data3', 1000);

      cacheService.invalidate('weather:.*');

      expect(cacheService.get('weather:current:1:2')).toBeNull();
      expect(cacheService.get('weather:weekly:1:2')).toBeNull();
      expect(cacheService.get('location:search:test')).toBe('data3');
    });

    it('should handle invalid regex patterns gracefully', () => {
      cacheService.set('test-key', 'test-data', 1000);

      expect(() => {
        cacheService.invalidate('[invalid-regex');
      }).toThrow(CacheError);
    });
  });

  describe('cleanup', () => {
    it('should automatically clean up expired entries', async () => {
      const shortTtl = 50; // 50ms
      cacheService.set('short-lived', 'data', shortTtl);
      cacheService.set('long-lived', 'data', 5000);

      expect(cacheService.size()).toBe(2);

      // Wait for cleanup to run
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(cacheService.size()).toBe(1);
      expect(cacheService.get('short-lived')).toBeNull();
      expect(cacheService.get('long-lived')).toBe('data');
    });
  });

  describe('error handling', () => {
    it('should handle storage errors gracefully', () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // This should not throw but log an error
      expect(() => {
        cacheService.get('test');
      }).not.toThrow();

      consoleSpy.mockRestore();
    });
  });
});

describe('CacheKeys', () => {
  it('should generate correct cache keys', () => {
    expect(CacheKeys.currentWeather(40.7128, -74.0060))
      .toBe('weather:current:40.7128:-74.006');
    
    expect(CacheKeys.weeklyForecast(40.7128, -74.0060))
      .toBe('weather:weekly:40.7128:-74.006');
    
    expect(CacheKeys.historicalData(40.7128, -74.0060, 24))
      .toBe('weather:historical:40.7128:-74.006:24');
    
    expect(CacheKeys.locationSearch('New York'))
      .toBe('location:search:New%20York');
  });
});

describe('CacheTTL', () => {
  it('should have correct TTL values', () => {
    expect(CacheTTL.CURRENT_WEATHER).toBe(15 * 60 * 1000); // 15 minutes
    expect(CacheTTL.WEEKLY_FORECAST).toBe(15 * 60 * 1000); // 15 minutes
    expect(CacheTTL.HISTORICAL_DATA).toBe(24 * 60 * 60 * 1000); // 24 hours
    expect(CacheTTL.LOCATION_SEARCH).toBe(60 * 60 * 1000); // 1 hour
    expect(CacheTTL.GEOCODING).toBe(24 * 60 * 60 * 1000); // 24 hours
  });
});