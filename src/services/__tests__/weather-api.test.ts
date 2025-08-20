import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OpenMeteoWeatherService } from '../weather-api';
import { WeatherApiError } from '../../types/errors';
import { cacheService } from '../cache';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock cache service
vi.mock('../cache', () => ({
  cacheService: {
    get: vi.fn(),
    set: vi.fn(),
  },
  CacheKeys: {
    currentWeather: (lat: number, lon: number) => `weather:current:${lat}:${lon}`,
    weeklyForecast: (lat: number, lon: number) => `weather:weekly:${lat}:${lon}`,
    historicalData: (lat: number, lon: number, months: number) => `weather:historical:${lat}:${lon}:${months}`,
    locationSearch: (query: string) => `location:search:${encodeURIComponent(query)}`,
  },
  CacheTTL: {
    CURRENT_WEATHER: 15 * 60 * 1000,
    WEEKLY_FORECAST: 15 * 60 * 1000,
    HISTORICAL_DATA: 24 * 60 * 60 * 1000,
    LOCATION_SEARCH: 60 * 60 * 1000,
  },
}));

describe('OpenMeteoWeatherService', () => {
  let weatherService: OpenMeteoWeatherService;
  const mockLat = 40.7128;
  const mockLon = -74.0060;

  beforeEach(() => {
    weatherService = new OpenMeteoWeatherService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getCurrentWeather', () => {
    const mockCurrentWeatherResponse = {
      latitude: mockLat,
      longitude: mockLon,
      current: {
        time: '2023-12-01T12:00',
        temperature_2m: 20.5,
        relative_humidity_2m: 65,
        apparent_temperature: 18.2,
        precipitation: 0,
        rain: 0,
        showers: 0,
        snowfall: 0,
        weather_code: 1,
        cloud_cover: 25,
        pressure_msl: 1013.2,
        wind_speed_10m: 5.5,
        wind_gusts_10m: 8.2,
        wind_direction_10m: 180,
      },
      daily: {
        sunrise: ['2023-12-01T07:00'],
        sunset: ['2023-12-01T17:00'],
      },
    };

    it('should return cached data if available', async () => {
      const cachedData = {
        temperature: 20.5,
        feelsLike: 18.2,
        humidity: 65,
        timestamp: '2023-12-01T12:00',
      };

      (cacheService.get as any).mockReturnValue(cachedData);

      const result = await weatherService.getCurrentWeather(mockLat, mockLon);

      expect(result).toEqual(cachedData);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should fetch and cache new data when not cached', async () => {
      (cacheService.get as any).mockReturnValue(null);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCurrentWeatherResponse),
      });

      const result = await weatherService.getCurrentWeather(mockLat, mockLon);

      expect(result).toMatchObject({
        temperature: 20.5,
        feelsLike: 18.2,
        humidity: 65,
        windSpeed: 5.5,
        windGust: 8.2,
        cloudCover: 25,
        pressure: 1013.2,
        weatherCode: 1,
        sunrise: '2023-12-01T07:00',
        sunset: '2023-12-01T17:00',
        timestamp: '2023-12-01T12:00',
      });

      expect(cacheService.set).toHaveBeenCalledWith(
        expect.stringContaining('weather:current'),
        result,
        15 * 60 * 1000
      );
    });

    it('should handle API errors', async () => {
      (cacheService.get as any).mockReturnValue(null);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(weatherService.getCurrentWeather(mockLat, mockLon))
        .rejects.toThrow(WeatherApiError);
    });

    it('should handle network errors', async () => {
      (cacheService.get as any).mockReturnValue(null);
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(weatherService.getCurrentWeather(mockLat, mockLon))
        .rejects.toThrow(WeatherApiError);
    });
  });

  describe('getWeeklyForecast', () => {
    const mockForecastResponse = {
      latitude: mockLat,
      longitude: mockLon,
      timezone: 'America/New_York',
      daily: {
        time: ['2023-12-01', '2023-12-02'],
        weather_code: [1, 2],
        temperature_2m_max: [22.5, 18.3],
        temperature_2m_min: [15.2, 12.1],
        precipitation_sum: [0, 2.5],
        rain_sum: [0, 2.5],
        showers_sum: [0, 0],
        snowfall_sum: [0, 0],
        precipitation_probability_max: [0, 80],
        precipitation_hours: [0, 4],
        wind_speed_10m_max: [6.2, 8.5],
        wind_gusts_10m_max: [9.1, 12.3],
        uv_index_max: [3.2, 2.1],
        sunrise: ['2023-12-01T07:00', '2023-12-02T07:01'],
        sunset: ['2023-12-01T17:00', '2023-12-02T16:59'],
        wind_direction_10m_dominant: [180, 220],
        apparent_temperature_max: [20.1, 16.8],
        apparent_temperature_min: [13.5, 10.2],
      },
    };

    it('should return cached forecast if available', async () => {
      const cachedForecast = {
        daily: [{ date: '2023-12-01', tempMax: 22.5, tempMin: 15.2 }],
        location: `${mockLat}, ${mockLon}`,
        timezone: 'America/New_York',
      };

      (cacheService.get as any).mockReturnValue(cachedForecast);

      const result = await weatherService.getWeeklyForecast(mockLat, mockLon);

      expect(result).toEqual(cachedForecast);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should fetch and transform forecast data', async () => {
      (cacheService.get as any).mockReturnValue(null);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockForecastResponse),
      });

      const result = await weatherService.getWeeklyForecast(mockLat, mockLon);

      expect(result.daily).toHaveLength(2);
      expect(result.daily[0]).toMatchObject({
        date: '2023-12-01',
        tempMax: 22.5,
        tempMin: 15.2,
        weatherCode: 1,
        uvIndexMax: 3.2,
      });
      expect(result.timezone).toBe('America/New_York');
    });
  });

  describe('getHistoricalData', () => {
    const mockHistoricalResponse = {
      latitude: mockLat,
      longitude: mockLon,
      timezone: 'America/New_York',
      monthly: {
        time: ['2023-01-01', '2023-02-01'],
        temperature_2m_mean: [5.2, 8.1],
        temperature_2m_max: [10.5, 13.2],
        temperature_2m_min: [-0.3, 2.8],
        precipitation_sum: [45.2, 38.7],
        rain_sum: [40.1, 35.2],
        snowfall_sum: [5.1, 3.5],
        precipitation_hours: [120, 96],
        wind_speed_10m_max: [15.2, 12.8],
      },
    };

    it('should fetch and transform historical data', async () => {
      (cacheService.get as any).mockReturnValue(null);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockHistoricalResponse),
      });

      const result = await weatherService.getHistoricalData(mockLat, mockLon, 24);

      expect(result.monthly).toHaveLength(2);
      expect(result.monthly[0]).toMatchObject({
        month: '2023-01-01',
        year: 2023,
        tempMean: 5.2,
        tempMax: 10.5,
        tempMin: -0.3,
        precipitationTotal: 45.2,
        windSpeed: 15.2,
      });
    });
  });

  describe('searchLocations', () => {
    const mockGeocodingResponse = {
      results: [
        {
          id: 1,
          name: 'New York',
          latitude: 40.7128,
          longitude: -74.0060,
          country: 'United States',
          admin1: 'New York',
          admin2: 'New York County',
          timezone: 'America/New_York',
          feature_code: 'PPL',
          country_code: 'US',
          country_id: 1,
        },
      ],
      generationtime_ms: 0.5,
    };

    it('should return empty array for empty query', async () => {
      const result = await weatherService.searchLocations('');
      expect(result).toEqual([]);
    });

    it('should search and transform location results', async () => {
      (cacheService.get as any).mockReturnValue(null);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGeocodingResponse),
      });

      const result = await weatherService.searchLocations('New York');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        name: 'New York',
        country: 'United States',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York',
        region: 'New York',
      });
    });

    it('should handle empty search results', async () => {
      (cacheService.get as any).mockReturnValue(null);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ results: undefined }),
      });

      const result = await weatherService.searchLocations('NonexistentCity');
      expect(result).toEqual([]);
    });
  });

  describe('retry mechanism', () => {
    it('should retry on server errors', async () => {
      (cacheService.get as any).mockReturnValue(null);
      
      // First call fails with 500, second succeeds
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            latitude: mockLat,
            longitude: mockLon,
            current: {
              time: '2023-12-01T12:00',
              temperature_2m: 20.5,
              relative_humidity_2m: 65,
              apparent_temperature: 18.2,
              precipitation: 0,
              rain: 0,
              showers: 0,
              snowfall: 0,
              weather_code: 1,
              cloud_cover: 25,
              pressure_msl: 1013.2,
              wind_speed_10m: 5.5,
              wind_gusts_10m: 8.2,
              wind_direction_10m: 180,
            },
            daily: {
              sunrise: ['2023-12-01T07:00'],
              sunset: ['2023-12-01T17:00'],
            },
          }),
        });

      const result = await weatherService.getCurrentWeather(mockLat, mockLon);

      expect(result.temperature).toBe(20.5);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should not retry on client errors', async () => {
      (cacheService.get as any).mockReturnValue(null);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(weatherService.getCurrentWeather(mockLat, mockLon))
        .rejects.toThrow(WeatherApiError);

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});