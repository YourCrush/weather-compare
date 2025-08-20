import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WeatherService } from '../../services/weatherService';
import { CacheService } from '../../services/cache';

// Mock fetch for integration tests
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('WeatherService Integration Tests', () => {
  let weatherService: WeatherService;
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = new CacheService();
    weatherService = new WeatherService(cacheService);
    vi.clearAllMocks();
  });

  afterEach(() => {
    cacheService.clear();
  });

  describe('getCurrentWeather', () => {
    it('fetches and caches weather data successfully', async () => {
      const mockWeatherResponse = {
        current_weather: {
          temperature: 20,
          windspeed: 5,
          winddirection: 180,
          weathercode: 1,
          is_day: 1,
          time: '2023-12-01T12:00',
        },
        hourly: {
          time: ['2023-12-01T12:00'],
          temperature_2m: [20],
          relative_humidity_2m: [65],
          apparent_temperature: [18],
          precipitation: [0],
          rain: [0],
          showers: [0],
          snowfall: [0],
          weather_code: [1],
          cloud_cover: [25],
          pressure_msl: [1013],
          surface_pressure: [1013],
          wind_speed_10m: [5],
          wind_direction_10m: [180],
          wind_gusts_10m: [8],
          uv_index: [3],
        },
        daily: {
          time: ['2023-12-01'],
          sunrise: ['2023-12-01T07:00'],
          sunset: ['2023-12-01T17:00'],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockWeatherResponse),
      });

      const result = await weatherService.getCurrentWeather(40.7128, -74.0060);

      expect(result).toBeDefined();
      expect(result.current.temperature).toBe(20);
      expect(result.current.windSpeed).toBe(5);
      expect(result.current.humidity).toBe(65);

      // Verify caching
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const cachedResult = await weatherService.getCurrentWeather(40.7128, -74.0060);
      expect(cachedResult).toEqual(result);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still only 1 call
    });

    it('handles API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        weatherService.getCurrentWeather(40.7128, -74.0060)
      ).rejects.toThrow('Failed to fetch current weather data');
    });

    it('handles invalid API responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(
        weatherService.getCurrentWeather(40.7128, -74.0060)
      ).rejects.toThrow('Weather API request failed: 404 Not Found');
    });

    it('validates coordinate parameters', async () => {
      await expect(
        weatherService.getCurrentWeather(91, 0) // Invalid latitude
      ).rejects.toThrow('Invalid coordinates');

      await expect(
        weatherService.getCurrentWeather(0, 181) // Invalid longitude
      ).rejects.toThrow('Invalid coordinates');
    });
  });

  describe('getWeeklyForecast', () => {
    it('fetches and processes weekly forecast data', async () => {
      const mockForecastResponse = {
        daily: {
          time: [
            '2023-12-01',
            '2023-12-02',
            '2023-12-03',
            '2023-12-04',
            '2023-12-05',
            '2023-12-06',
            '2023-12-07',
          ],
          temperature_2m_max: [22, 24, 21, 19, 20, 23, 25],
          temperature_2m_min: [15, 17, 14, 12, 13, 16, 18],
          weather_code: [1, 2, 3, 61, 1, 2, 0],
          precipitation_sum: [0, 0, 0, 5.2, 0, 0, 0],
          precipitation_probability_max: [0, 10, 20, 80, 5, 15, 0],
          wind_speed_10m_max: [5, 7, 6, 12, 4, 6, 3],
          wind_gusts_10m_max: [8, 10, 9, 18, 6, 9, 5],
        },
        timezone: 'America/New_York',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockForecastResponse),
      });

      const result = await weatherService.getWeeklyForecast(40.7128, -74.0060);

      expect(result).toBeDefined();
      expect(result.daily).toHaveLength(7);
      expect(result.daily[0].tempMax).toBe(22);
      expect(result.daily[0].tempMin).toBe(15);
      expect(result.daily[3].precipitation.total24h).toBe(5.2);
      expect(result.timezone).toBe('America/New_York');
    });
  });

  describe('getHistoricalData', () => {
    it('fetches and processes historical data', async () => {
      const mockHistoricalResponse = {
        daily: {
          time: ['2023-01-01', '2023-01-02', '2023-01-03'],
          temperature_2m_max: [18, 20, 22],
          temperature_2m_min: [10, 12, 14],
          temperature_2m_mean: [14, 16, 18],
          precipitation_sum: [0, 2.5, 0],
          precipitation_hours: [0, 4, 0],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockHistoricalResponse),
      });

      const startDate = '2023-01-01';
      const endDate = '2023-01-03';
      const result = await weatherService.getHistoricalData(40.7128, -74.0060, startDate, endDate);

      expect(result).toBeDefined();
      expect(result.monthly).toHaveLength(1); // Should aggregate into monthly data
      expect(result.startDate).toBe(startDate);
      expect(result.endDate).toBe(endDate);
    });
  });

  describe('Cache integration', () => {
    it('respects cache TTL for different data types', async () => {
      const mockResponse = {
        current_weather: {
          temperature: 20,
          windspeed: 5,
          winddirection: 180,
          weathercode: 1,
          is_day: 1,
          time: '2023-12-01T12:00',
        },
        hourly: {
          time: ['2023-12-01T12:00'],
          temperature_2m: [20],
          relative_humidity_2m: [65],
          apparent_temperature: [18],
          precipitation: [0],
          rain: [0],
          showers: [0],
          snowfall: [0],
          weather_code: [1],
          cloud_cover: [25],
          pressure_msl: [1013],
          surface_pressure: [1013],
          wind_speed_10m: [5],
          wind_direction_10m: [180],
          wind_gusts_10m: [8],
          uv_index: [3],
        },
        daily: {
          time: ['2023-12-01'],
          sunrise: ['2023-12-01T07:00'],
          sunset: ['2023-12-01T17:00'],
        },
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // First call
      await weatherService.getCurrentWeather(40.7128, -74.0060);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call within cache TTL
      await weatherService.getCurrentWeather(40.7128, -74.0060);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Should use cache

      // Simulate cache expiration
      vi.advanceTimersByTime(16 * 60 * 1000); // 16 minutes

      // Third call after cache expiration
      await weatherService.getCurrentWeather(40.7128, -74.0060);
      expect(mockFetch).toHaveBeenCalledTimes(2); // Should make new request
    });

    it('handles cache errors gracefully', async () => {
      // Mock cache to throw error
      const mockCacheGet = vi.spyOn(cacheService, 'get').mockImplementation(() => {
        throw new Error('Cache error');
      });

      const mockResponse = {
        current_weather: {
          temperature: 20,
          windspeed: 5,
          winddirection: 180,
          weathercode: 1,
          is_day: 1,
          time: '2023-12-01T12:00',
        },
        hourly: {
          time: ['2023-12-01T12:00'],
          temperature_2m: [20],
          relative_humidity_2m: [65],
          apparent_temperature: [18],
          precipitation: [0],
          rain: [0],
          showers: [0],
          snowfall: [0],
          weather_code: [1],
          cloud_cover: [25],
          pressure_msl: [1013],
          surface_pressure: [1013],
          wind_speed_10m: [5],
          wind_direction_10m: [180],
          wind_gusts_10m: [8],
          uv_index: [3],
        },
        daily: {
          time: ['2023-12-01'],
          sunrise: ['2023-12-01T07:00'],
          sunset: ['2023-12-01T17:00'],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // Should still work despite cache error
      const result = await weatherService.getCurrentWeather(40.7128, -74.0060);
      expect(result).toBeDefined();
      expect(result.current.temperature).toBe(20);

      mockCacheGet.mockRestore();
    });
  });

  describe('Error handling and retry logic', () => {
    it('retries failed requests with exponential backoff', async () => {
      // First two calls fail, third succeeds
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            current_weather: {
              temperature: 20,
              windspeed: 5,
              winddirection: 180,
              weathercode: 1,
              is_day: 1,
              time: '2023-12-01T12:00',
            },
            hourly: {
              time: ['2023-12-01T12:00'],
              temperature_2m: [20],
              relative_humidity_2m: [65],
              apparent_temperature: [18],
              precipitation: [0],
              rain: [0],
              showers: [0],
              snowfall: [0],
              weather_code: [1],
              cloud_cover: [25],
              pressure_msl: [1013],
              surface_pressure: [1013],
              wind_speed_10m: [5],
              wind_direction_10m: [180],
              wind_gusts_10m: [8],
              uv_index: [3],
            },
            daily: {
              time: ['2023-12-01'],
              sunrise: ['2023-12-01T07:00'],
              sunset: ['2023-12-01T17:00'],
            },
          }),
        });

      const result = await weatherService.getCurrentWeather(40.7128, -74.0060);
      
      expect(result).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('gives up after maximum retry attempts', async () => {
      mockFetch.mockRejectedValue(new Error('Persistent network error'));

      await expect(
        weatherService.getCurrentWeather(40.7128, -74.0060)
      ).rejects.toThrow('Failed to fetch current weather data');

      // Should have tried multiple times
      expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });
});