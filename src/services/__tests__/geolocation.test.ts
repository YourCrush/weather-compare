import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GeolocationService } from '../geolocation';
import { LocationError } from '../../types/errors';

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

// Mock navigator.permissions
const mockPermissions = {
  query: vi.fn(),
};

Object.defineProperty(global.navigator, 'permissions', {
  value: mockPermissions,
  writable: true,
});

// Mock fetch for IP location
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock Intl.DateTimeFormat
Object.defineProperty(global.Intl, 'DateTimeFormat', {
  value: vi.fn(() => ({
    resolvedOptions: () => ({ timeZone: 'America/New_York' }),
  })),
  writable: true,
});

describe('GeolocationService', () => {
  let geolocationService: GeolocationService;

  beforeEach(() => {
    geolocationService = new GeolocationService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getCurrentLocation', () => {
    it('should get current location successfully', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 10,
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const result = await geolocationService.getCurrentLocation();

      expect(result).toEqual({
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10,
      });
    });

    it('should handle permission denied error', async () => {
      const mockError = {
        code: 1, // PERMISSION_DENIED
        message: 'User denied geolocation',
      };

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError);
      });

      await expect(geolocationService.getCurrentLocation())
        .rejects.toThrow(LocationError);
    });

    it('should handle position unavailable error', async () => {
      const mockError = {
        code: 2, // POSITION_UNAVAILABLE
        message: 'Position unavailable',
      };

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError);
      });

      await expect(geolocationService.getCurrentLocation())
        .rejects.toThrow(LocationError);
    });

    it('should handle timeout error', async () => {
      const mockError = {
        code: 3, // TIMEOUT
        message: 'Timeout',
      };

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError);
      });

      await expect(geolocationService.getCurrentLocation())
        .rejects.toThrow(LocationError);
    });

    it('should handle unsupported browser', async () => {
      // Temporarily remove geolocation support
      const originalGeolocation = global.navigator.geolocation;
      delete (global.navigator as any).geolocation;

      await expect(geolocationService.getCurrentLocation())
        .rejects.toThrow(LocationError);

      // Restore geolocation
      global.navigator.geolocation = originalGeolocation;
    });
  });

  describe('getLocationByIP', () => {
    it('should get location by IP successfully', async () => {
      const mockIPResponse = {
        ip: '192.168.1.1',
        city: 'New York',
        region: 'New York',
        country: 'US',
        loc: '40.7128,-74.0060',
        timezone: 'America/New_York',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockIPResponse),
      });

      const result = await geolocationService.getLocationByIP();

      expect(result).toEqual({
        latitude: 40.7128,
        longitude: -74.0060,
      });
    });

    it('should handle missing location data', async () => {
      const mockIPResponse = {
        ip: '192.168.1.1',
        city: 'New York',
        region: 'New York',
        country: 'US',
        // loc is missing
        timezone: 'America/New_York',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockIPResponse),
      });

      await expect(geolocationService.getLocationByIP())
        .rejects.toThrow(LocationError);
    });

    it('should handle invalid coordinates', async () => {
      const mockIPResponse = {
        ip: '192.168.1.1',
        city: 'New York',
        region: 'New York',
        country: 'US',
        loc: 'invalid,coordinates',
        timezone: 'America/New_York',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockIPResponse),
      });

      await expect(geolocationService.getLocationByIP())
        .rejects.toThrow(LocationError);
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(geolocationService.getLocationByIP())
        .rejects.toThrow(LocationError);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(geolocationService.getLocationByIP())
        .rejects.toThrow(LocationError);
    });
  });

  describe('getLocationWithFallback', () => {
    it('should use geolocation when available', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 10,
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const result = await geolocationService.getLocationWithFallback();

      expect(result.method).toBe('geolocation');
      expect(result.position).toEqual({
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10,
      });
    });

    it('should fallback to IP location when geolocation fails', async () => {
      // Mock geolocation failure
      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error({ code: 1, message: 'Permission denied' });
      });

      // Mock successful IP location
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          ip: '192.168.1.1',
          city: 'New York',
          region: 'New York',
          country: 'US',
          loc: '40.7128,-74.0060',
          timezone: 'America/New_York',
        }),
      });

      const result = await geolocationService.getLocationWithFallback();

      expect(result.method).toBe('ip');
      expect(result.position).toEqual({
        latitude: 40.7128,
        longitude: -74.0060,
      });
    });

    it('should indicate manual entry when all methods fail', async () => {
      // Mock geolocation failure
      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error({ code: 1, message: 'Permission denied' });
      });

      // Mock IP location failure
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const result = await geolocationService.getLocationWithFallback();

      expect(result.method).toBe('manual');
      expect(result.position).toEqual({
        latitude: 0,
        longitude: 0,
      });
    });
  });

  describe('checkGeolocationSupport', () => {
    it('should detect geolocation support', async () => {
      const result = await geolocationService.checkGeolocationSupport();

      expect(result.supported).toBe(true);
    });

    it('should detect lack of geolocation support', async () => {
      // Temporarily remove geolocation support
      const originalGeolocation = global.navigator.geolocation;
      delete (global.navigator as any).geolocation;

      const result = await geolocationService.checkGeolocationSupport();

      expect(result.supported).toBe(false);

      // Restore geolocation
      global.navigator.geolocation = originalGeolocation;
    });

    it('should check permissions when available', async () => {
      mockPermissions.query.mockResolvedValue({
        state: 'granted',
      });

      const result = await geolocationService.checkGeolocationSupport();

      expect(result.supported).toBe(true);
      expect(result.permission).toBe('granted');
    });

    it('should handle permission query errors', async () => {
      mockPermissions.query.mockRejectedValue(new Error('Permission query failed'));

      const result = await geolocationService.checkGeolocationSupport();

      expect(result.supported).toBe(true);
      expect(result.permission).toBeUndefined();
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between coordinates', () => {
      // Test with known coordinates (New York to Los Angeles)
      const nyLat = 40.7128;
      const nyLon = -74.0060;
      const laLat = 34.0522;
      const laLon = -118.2437;

      // Use reflection to access private method
      const distance = (geolocationService as any).calculateDistance(nyLat, nyLon, laLat, laLon);

      // Distance should be approximately 3944 km
      expect(distance).toBeGreaterThan(3900);
      expect(distance).toBeLessThan(4000);
    });

    it('should return 0 for same coordinates', () => {
      const distance = (geolocationService as any).calculateDistance(40.7128, -74.0060, 40.7128, -74.0060);
      expect(distance).toBe(0);
    });
  });
});