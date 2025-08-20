import { Location } from './location';
import { CurrentWeather, WeeklyForecast, HistoricalData } from './weather';

// Open-Meteo API response types
export interface OpenMeteoCurrentResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
    relative_humidity_2m: string;
    apparent_temperature: string;
    is_day: string;
    precipitation: string;
    rain: string;
    showers: string;
    snowfall: string;
    weather_code: string;
    cloud_cover: string;
    pressure_msl: string;
    surface_pressure: string;
    wind_speed_10m: string;
    wind_direction_10m: string;
    wind_gusts_10m: string;
  };
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    rain: number;
    showers: number;
    snowfall: number;
    weather_code: number;
    cloud_cover: number;
    pressure_msl: number;
    surface_pressure: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
  };
}

export interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  daily_units: {
    time: string;
    weather_code: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
    apparent_temperature_max: string;
    apparent_temperature_min: string;
    sunrise: string;
    sunset: string;
    uv_index_max: string;
    precipitation_sum: string;
    rain_sum: string;
    showers_sum: string;
    snowfall_sum: string;
    precipitation_hours: string;
    precipitation_probability_max: string;
    wind_speed_10m_max: string;
    wind_gusts_10m_max: string;
    wind_direction_10m_dominant: string;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    apparent_temperature_max: number[];
    apparent_temperature_min: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
    precipitation_sum: number[];
    rain_sum: number[];
    showers_sum: number[];
    snowfall_sum: number[];
    precipitation_hours: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    wind_gusts_10m_max: number[];
    wind_direction_10m_dominant: number[];
  };
}

export interface OpenMeteoHistoricalResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  monthly_units: {
    time: string;
    temperature_2m_mean: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
    precipitation_sum: string;
    rain_sum: string;
    snowfall_sum: string;
    precipitation_hours: string;
    wind_speed_10m_max: string;
  };
  monthly: {
    time: string[];
    temperature_2m_mean: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    rain_sum: number[];
    snowfall_sum: number[];
    precipitation_hours: number[];
    wind_speed_10m_max: number[];
  };
}

export interface OpenMeteoGeocodingResponse {
  results?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    elevation: number;
    feature_code: string;
    country_code: string;
    admin1_id?: number;
    admin2_id?: number;
    admin3_id?: number;
    admin4_id?: number;
    timezone: string;
    population?: number;
    postcodes?: string[];
    country_id: number;
    country: string;
    admin1?: string;
    admin2?: string;
    admin3?: string;
    admin4?: string;
  }>;
  generationtime_ms: number;
}

// Service interfaces
export interface WeatherService {
  getCurrentWeather(lat: number, lon: number): Promise<CurrentWeather>;
  getWeeklyForecast(lat: number, lon: number): Promise<WeeklyForecast>;
  getHistoricalData(lat: number, lon: number, months: number): Promise<HistoricalData>;
  searchLocations(query: string): Promise<Location[]>;
}

export interface CacheService {
  get<T>(key: string): T | null;
  set<T>(key: string, data: T, ttl: number): void;
  invalidate(pattern: string): void;
  clear(): void;
}

export interface StorageService {
  getItem<T>(key: string): T | null;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
  clear(): void;
}

// API Error types
export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}