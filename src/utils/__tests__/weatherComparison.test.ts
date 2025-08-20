import { describe, it, expect } from 'vitest';
import { DifferenceCalculator } from '../weatherComparison';
import { Location, CurrentWeather } from '../../types';

const mockLocation1: Location = {
  id: '1',
  name: 'New York',
  country: 'United States',
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: 'America/New_York',
};

const mockLocation2: Location = {
  id: '2',
  name: 'Los Angeles',
  country: 'United States',
  latitude: 34.0522,
  longitude: -118.2437,
  timezone: 'America/Los_Angeles',
};

const mockWeather1: CurrentWeather = {
  temperature: 20,
  feelsLike: 18,
  humidity: 65,
  windSpeed: 5,
  windGust: 8,
  precipitation: {
    type: 'none',
    intensity: 0,
    probability: 0,
    rate: 0,
    total1h: 0,
    total24h: 0,
  },
  cloudCover: 25,
  pressure: 1013,
  uvIndex: 3,
  sunrise: '07:00',
  sunset: '17:00',
  timestamp: '2023-12-01T12:00:00Z',
  weatherCode: 1,
};

const mockWeather2: CurrentWeather = {
  temperature: 25,
  feelsLike: 23,
  humidity: 45,
  windSpeed: 8,
  windGust: 12,
  precipitation: {
    type: 'rain',
    intensity: 2,
    probability: 80,
    rate: 1,
    total1h: 1,
    total24h: 3,
  },
  cloudCover: 60,
  pressure: 1008,
  uvIndex: 2,
  sunrise: '06:30',
  sunset: '17:30',
  timestamp: '2023-12-01T12:00:00Z',
  weatherCode: 61,
};

describe('DifferenceCalculator', () => {
  describe('calculateDifferences', () => {
    it('calculates temperature differences correctly', () => {
      const comparison = DifferenceCalculator.calculateDifferences(
        mockLocation1,
        mockWeather1,
        mockLocation2,
        mockWeather2
      );

      const tempDiff = comparison.differences.find(d => d.type === 'temperature');
      expect(tempDiff).toBeDefined();
      expect(tempDiff?.value).toBe(5); // 25 - 20
      expect(tempDiff?.unit).toBe('°C');
      expect(tempDiff?.description).toContain('warmer');
    });

    it('calculates humidity differences correctly', () => {
      const comparison = DifferenceCalculator.calculateDifferences(
        mockLocation1,
        mockWeather1,
        mockLocation2,
        mockWeather2
      );

      const humidityDiff = comparison.differences.find(d => d.type === 'humidity');
      expect(humidityDiff).toBeDefined();
      expect(humidityDiff?.value).toBe(-20); // 45 - 65
      expect(humidityDiff?.unit).toBe('%');
      expect(humidityDiff?.description).toContain('less humid');
    });

    it('calculates wind differences correctly', () => {
      const comparison = DifferenceCalculator.calculateDifferences(
        mockLocation1,
        mockWeather1,
        mockLocation2,
        mockWeather2
      );

      const windDiff = comparison.differences.find(d => d.type === 'wind');
      expect(windDiff).toBeDefined();
      expect(windDiff?.value).toBe(3); // 8 - 5
      expect(windDiff?.unit).toBe('m/s');
      expect(windDiff?.description).toContain('windier');
    });

    it('calculates pressure differences correctly', () => {
      const comparison = DifferenceCalculator.calculateDifferences(
        mockLocation1,
        mockWeather1,
        mockLocation2,
        mockWeather2
      );

      const pressureDiff = comparison.differences.find(d => d.type === 'pressure');
      expect(pressureDiff).toBeDefined();
      expect(pressureDiff?.value).toBe(-5); // 1008 - 1013
      expect(pressureDiff?.unit).toBe('hPa');
      expect(pressureDiff?.description).toContain('lower pressure');
    });

    it('calculates precipitation differences correctly', () => {
      const comparison = DifferenceCalculator.calculateDifferences(
        mockLocation1,
        mockWeather1,
        mockLocation2,
        mockWeather2
      );

      const precipDiff = comparison.differences.find(d => d.type === 'precipitation');
      expect(precipDiff).toBeDefined();
      expect(precipDiff?.value).toBe(3); // 3 - 0
      expect(precipDiff?.unit).toBe('mm');
      expect(precipDiff?.description).toContain('wetter');
    });

    it('ignores small differences', () => {
      const similarWeather = {
        ...mockWeather1,
        temperature: 20.3, // Small difference
        humidity: 66, // Small difference
        windSpeed: 5.5, // Small difference
      };

      const comparison = DifferenceCalculator.calculateDifferences(
        mockLocation1,
        mockWeather1,
        mockLocation2,
        similarWeather
      );

      expect(comparison.differences).toHaveLength(0);
    });

    it('assigns correct severity levels', () => {
      const comparison = DifferenceCalculator.calculateDifferences(
        mockLocation1,
        mockWeather1,
        mockLocation2,
        mockWeather2
      );

      const tempDiff = comparison.differences.find(d => d.type === 'temperature');
      expect(tempDiff?.severity).toBe('medium'); // 5°C difference

      const humidityDiff = comparison.differences.find(d => d.type === 'humidity');
      expect(humidityDiff?.severity).toBe('medium'); // 20% difference
    });
  });

  describe('getWeatherDescription', () => {
    it('returns correct descriptions for weather codes', () => {
      expect(DifferenceCalculator.getWeatherDescription(0)).toBe('Clear sky');
      expect(DifferenceCalculator.getWeatherDescription(1)).toBe('Mainly clear');
      expect(DifferenceCalculator.getWeatherDescription(61)).toBe('Slight rain');
      expect(DifferenceCalculator.getWeatherDescription(95)).toBe('Thunderstorm');
      expect(DifferenceCalculator.getWeatherDescription(999)).toBe('Unknown conditions');
    });
  });

  describe('getComfortLevel', () => {
    it('returns comfortable for ideal conditions', () => {
      const comfort = DifferenceCalculator.getComfortLevel(22, 50);
      expect(comfort.level).toBe('comfortable');
      expect(comfort.description).toBe('Pleasant conditions');
    });

    it('returns uncomfortable for extreme temperatures', () => {
      const coldComfort = DifferenceCalculator.getComfortLevel(5, 50);
      expect(coldComfort.level).toBe('uncomfortable');
      expect(coldComfort.description).toBe('Too cold');

      const hotComfort = DifferenceCalculator.getComfortLevel(35, 50);
      expect(hotComfort.level).toBe('uncomfortable');
      expect(hotComfort.description).toBe('Too hot');
    });

    it('returns mild for high humidity', () => {
      const comfort = DifferenceCalculator.getComfortLevel(25, 80);
      expect(comfort.level).toBe('mild');
      expect(comfort.description).toBe('High humidity');
    });

    it('returns mild for low humidity', () => {
      const comfort = DifferenceCalculator.getComfortLevel(25, 20);
      expect(comfort.level).toBe('mild');
      expect(comfort.description).toBe('Low humidity');
    });

    it('returns mild for high heat index', () => {
      const comfort = DifferenceCalculator.getComfortLevel(28, 60);
      expect(comfort.level).toBe('mild');
      expect(comfort.description).toBe('Feels warm');
    });
  });
});