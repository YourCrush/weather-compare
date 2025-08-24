import {
  WeatherService,
  OpenMeteoCurrentResponse,
  OpenMeteoForecastResponse,
  OpenMeteoHistoricalResponse,
  OpenMeteoGeocodingResponse,
} from '../types/api';
import {
  CurrentWeather,
  WeeklyForecast,
  HistoricalData,
  Location,
  PrecipitationData,
} from '../types';
import { WeatherApiError } from '../types/errors';
import { cacheService, CacheKeys, CacheTTL } from './cache';

export class OpenMeteoWeatherService implements WeatherService {
  private readonly baseUrl = 'https://api.open-meteo.com/v1';
  private readonly geocodingUrl = 'https://geocoding-api.open-meteo.com/v1';

  async getCurrentWeather(lat: number, lon: number): Promise<CurrentWeather> {
    const cacheKey = CacheKeys.currentWeather(lat, lon);
    const cached = cacheService.get<CurrentWeather>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lon.toString(),
        current: [
          'temperature_2m',
          'relative_humidity_2m',
          'apparent_temperature',
          'is_day',
          'precipitation',
          'rain',
          'showers',
          'snowfall',
          'weather_code',
          'cloud_cover',
          'pressure_msl',
          'surface_pressure',
          'wind_speed_10m',
          'wind_direction_10m',
          'wind_gusts_10m',
        ].join(','),
        daily: 'sunrise,sunset',
        timezone: 'auto',
        forecast_days: '1',
      });

      const response = await this.fetchWithRetry(
        `${this.baseUrl}/forecast?${params}`
      );
      
      if (!response.ok) {
        throw new WeatherApiError(
          `Failed to fetch current weather: ${response.statusText}`,
          response.status
        );
      }

      const data: OpenMeteoCurrentResponse & { daily: { sunrise: string[]; sunset: string[] } } = 
        await response.json();

      const currentWeather = this.transformCurrentWeather(data);
      
      // Cache the result
      cacheService.set(cacheKey, currentWeather, CacheTTL.CURRENT_WEATHER);
      
      return currentWeather;
    } catch (error) {
      if (error instanceof WeatherApiError) {
        throw error;
      }
      throw new WeatherApiError(
        `Failed to fetch current weather: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getWeeklyForecast(lat: number, lon: number): Promise<WeeklyForecast> {
    const cacheKey = CacheKeys.weeklyForecast(lat, lon);
    const cached = cacheService.get<WeeklyForecast>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lon.toString(),
        daily: [
          'weather_code',
          'temperature_2m_max',
          'temperature_2m_min',
          'apparent_temperature_max',
          'apparent_temperature_min',
          'sunrise',
          'sunset',
          'uv_index_max',
          'precipitation_sum',
          'rain_sum',
          'showers_sum',
          'snowfall_sum',
          'precipitation_hours',
          'precipitation_probability_max',
          'wind_speed_10m_max',
          'wind_gusts_10m_max',
          'wind_direction_10m_dominant',
        ].join(','),
        timezone: 'auto',
        forecast_days: '10',
      });

      const response = await this.fetchWithRetry(
        `${this.baseUrl}/forecast?${params}`
      );
      
      if (!response.ok) {
        throw new WeatherApiError(
          `Failed to fetch weekly forecast: ${response.statusText}`,
          response.status
        );
      }

      const data: OpenMeteoForecastResponse = await response.json();
      const weeklyForecast = this.transformWeeklyForecast(data);
      
      // Cache the result
      cacheService.set(cacheKey, weeklyForecast, CacheTTL.WEEKLY_FORECAST);
      
      return weeklyForecast;
    } catch (error) {
      if (error instanceof WeatherApiError) {
        throw error;
      }
      throw new WeatherApiError(
        `Failed to fetch weekly forecast: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getHistoricalData(lat: number, lon: number, months: number): Promise<HistoricalData> {
    const cacheKey = CacheKeys.historicalData(lat, lon, months);
    const cached = cacheService.get<HistoricalData>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // For historical data, we need to ensure we're not requesting data that's too recent
      // Open-Meteo archive API has a delay of about 5 days for recent data
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 7); // Go back 7 days to be safe
      
      const startDate = new Date(endDate);
      startDate.setMonth(startDate.getMonth() - months);

      const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lon.toString(),
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        monthly: [
          'temperature_2m_mean',
          'temperature_2m_max',
          'temperature_2m_min',
          'precipitation_sum',
          'rain_sum',
          'snowfall_sum',
          'precipitation_hours',
          'wind_speed_10m_max',
        ].join(','),
        timezone: 'auto',
      });

      const response = await this.fetchWithRetry(
        `${this.baseUrl}/archive?${params}`
      );
      
      if (!response.ok) {
        throw new WeatherApiError(
          `Failed to fetch historical data: ${response.statusText}`,
          response.status
        );
      }

      const data: OpenMeteoHistoricalResponse = await response.json();
      const historicalData = this.transformHistoricalData(data);
      
      // Cache the result
      cacheService.set(cacheKey, historicalData, CacheTTL.HISTORICAL_DATA);
      
      return historicalData;
    } catch (error) {
      if (error instanceof WeatherApiError) {
        throw error;
      }
      throw new WeatherApiError(
        `Failed to fetch historical data: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async searchLocations(query: string): Promise<Location[]> {
    if (!query.trim()) {
      return [];
    }

    const cacheKey = CacheKeys.locationSearch(query);
    const cached = cacheService.get<Location[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const params = new URLSearchParams({
        name: query,
        count: '10',
        language: 'en',
        format: 'json',
      });

      const response = await this.fetchWithRetry(
        `${this.geocodingUrl}/search?${params}`
      );
      
      if (!response.ok) {
        throw new WeatherApiError(
          `Failed to search locations: ${response.statusText}`,
          response.status
        );
      }

      const data: OpenMeteoGeocodingResponse = await response.json();
      const locations = this.transformLocationResults(data);
      
      // Cache the result
      cacheService.set(cacheKey, locations, CacheTTL.LOCATION_SEARCH);
      
      return locations;
    } catch (error) {
      if (error instanceof WeatherApiError) {
        throw error;
      }
      throw new WeatherApiError(
        `Failed to search locations: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<Response> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'WeatherCompareApp/1.0',
            ...options.headers,
          },
        });

        // Don't retry on client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          return response;
        }

        // Retry on server errors (5xx) and network errors
        if (response.ok || attempt === maxRetries) {
          return response;
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new WeatherApiError(
      `Request failed after ${maxRetries + 1} attempts: ${lastError.message}`,
      undefined,
      'RETRY_EXHAUSTED'
    );
  }

  private transformCurrentWeather(
    data: OpenMeteoCurrentResponse & { daily: { sunrise: string[]; sunset: string[] } }
  ): CurrentWeather {
    const current = data.current;
    
    return {
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      windGust: current.wind_gusts_10m,
      precipitation: this.transformPrecipitation({
        rain: current.rain,
        showers: current.showers,
        snowfall: current.snowfall,
        precipitation: current.precipitation,
      }),
      cloudCover: current.cloud_cover,
      pressure: current.pressure_msl,
      uvIndex: 0, // Not available in current weather, would need separate UV API call
      sunrise: data.daily.sunrise[0] || '',
      sunset: data.daily.sunset[0] || '',
      timestamp: current.time,
      weatherCode: current.weather_code,
      visibility: undefined, // Not available in Open-Meteo
    };
  }

  private transformWeeklyForecast(data: OpenMeteoForecastResponse): WeeklyForecast {
    const daily = data.daily;
    const forecastDays = daily.time.map((date, index) => ({
      date,
      tempMin: daily.temperature_2m_min[index],
      tempMax: daily.temperature_2m_max[index],
      precipitation: this.transformPrecipitation({
        rain: daily.rain_sum[index],
        showers: daily.showers_sum[index],
        snowfall: daily.snowfall_sum[index],
        precipitation: daily.precipitation_sum[index],
        probability: daily.precipitation_probability_max[index],
        hours: daily.precipitation_hours[index],
      }),
      humidity: 0, // Not available in daily forecast
      windSpeed: daily.wind_speed_10m_max[index],
      windGust: daily.wind_gusts_10m_max[index],
      weatherCode: daily.weather_code[index],
      uvIndexMax: daily.uv_index_max[index],
      sunrise: daily.sunrise[index],
      sunset: daily.sunset[index],
    }));

    return {
      daily: forecastDays,
      location: `${data.latitude}, ${data.longitude}`,
      timezone: data.timezone,
    };
  }

  private transformHistoricalData(data: OpenMeteoHistoricalResponse): HistoricalData {
    const monthly = data.monthly;
    const monthlyAverages = monthly.time.map((month, index) => ({
      month,
      year: new Date(month).getFullYear(),
      tempMin: monthly.temperature_2m_min[index],
      tempMax: monthly.temperature_2m_max[index],
      tempMean: monthly.temperature_2m_mean[index],
      precipitationTotal: monthly.precipitation_sum[index],
      precipitationDays: monthly.precipitation_hours[index] / 24, // Rough estimate
      humidity: 0, // Not available in historical data
      windSpeed: monthly.wind_speed_10m_max[index],
    }));

    return {
      monthly: monthlyAverages,
      location: `${data.latitude}, ${data.longitude}`,
      startDate: monthly.time[0] || '',
      endDate: monthly.time[monthly.time.length - 1] || '',
    };
  }

  private transformLocationResults(data: OpenMeteoGeocodingResponse): Location[] {
    if (!data.results) {
      return [];
    }

    return data.results.map(result => ({
      id: `${result.latitude}-${result.longitude}`,
      name: result.name,
      country: result.country,
      latitude: result.latitude,
      longitude: result.longitude,
      timezone: result.timezone,
      region: result.admin1,
      admin1: result.admin1,
      admin2: result.admin2,
    }));
  }

  private transformPrecipitation(data: {
    rain?: number;
    showers?: number;
    snowfall?: number;
    precipitation?: number;
    probability?: number;
    hours?: number;
  }): PrecipitationData {
    const rain = data.rain || 0;
    const showers = data.showers || 0;
    const snowfall = data.snowfall || 0;
    const total = data.precipitation || rain + showers + snowfall;

    let type: PrecipitationData['type'] = 'none';
    if (snowfall > 0 && (rain > 0 || showers > 0)) {
      type = 'mixed';
    } else if (snowfall > 0) {
      type = 'snow';
    } else if (rain > 0 || showers > 0) {
      type = 'rain';
    }

    return {
      type,
      intensity: total,
      probability: data.probability || 0,
      rate: total / (data.hours || 1),
      total1h: total,
      total24h: total,
    };
  }
}

// Singleton instance
export const weatherService = new OpenMeteoWeatherService();