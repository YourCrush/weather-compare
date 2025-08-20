import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useWeatherComparison } from '../useWeatherComparison';
import { Location, WeatherData } from '../../types';

// Mock the context hooks
const mockAppContext = {
  state: {
    locations: [] as Location[],
  },
};

const mockWeatherData = {
  isLocationDataLoading: vi.fn(),
  getLocationWeatherData: vi.fn(),
};

const mockSettings = {
  formatTemperature: vi.fn(),
  formatSpeed: vi.fn(),
};

vi.mock('../../context', () => ({
  useAppContext: () => mockAppContext,
  useWeatherData: () => mockWeatherData,
  useSettings: () => mockSettings,
}));

const mockLocation1: Location = {
  id: '1',
  name: 'New York',
  country: 'United States',
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: 'America/New_York',
  region: 'New York',
};

const mockLocation2: Location = {
  id: '2',
  name: 'Los Angeles',
  country: 'United States',
  latitude: 34.0522,
  longitude: -118.2437,
  timezone: 'America/Los_Angeles',
  region: 'California',
};

const mockWeatherData1: WeatherData = {
  current: {
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
  },
  weekly: { daily: [], location: 'New York', timezone: 'America/New_York' },
  historical: { monthly: [], location: 'New York', startDate: '2022-01-01', endDate: '2023-12-01' },
  lastUpdated: '2023-12-01T12:00:00Z',
};

const mockWeatherData2: WeatherData = {
  current: {
    temperature: 25, // 5 degrees warmer
    feelsLike: 23,
    humidity: 45, // 20% less humid
    windSpeed: 8, // 3 m/s windier
    windGust: 12,
    precipitation: {
      type: 'none',
      intensity: 0,
      probability: 0,
      rate: 0,
      total1h: 0,
      total24h: 0,
    },
    cloudCover: 15,
    pressure: 1015,
    uvIndex: 5,
    sunrise: '06:30',
    sunset: '17:30',
    timestamp: '2023-12-01T12:00:00Z',
    weatherCode: 1,
  },
  weekly: { daily: [], location: 'Los Angeles', timezone: 'America/Los_Angeles' },
  historical: { monthly: [], location: 'Los Angeles', startDate: '2022-01-01', endDate: '2023-12-01' },
  lastUpdated: '2023-12-01T12:00:00Z',
};

describe('useWeatherComparison', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock returns
    mockWeatherData.isLocationDataLoading.mockReturnValue(false);
    mockWeatherData.getLocationWeatherData.mockReturnValue(undefined);
    mockSettings.formatTemperature.mockImplementation((celsius: number) => ({
      value: Math.round(celsius),
      unit: '°C',
    }));
    mockSettings.formatSpeed.mockImplementation((mps: number) => ({
      value: Math.round(mps * 3.6),
      unit: 'km/h',
    }));
  });

  it('returns empty comparisons when no locations', () => {
    mockAppContext.state.locations = [];

    const { result } = renderHook(() => useWeatherComparison());

    expect(result.current.comparisons).toEqual([]);
    expect(result.current.locationsWithData).toEqual([]);
    expect(result.current.hasEnoughData).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns comparisons for locations', () => {
    mockAppContext.state.locations = [mockLocation1, mockLocation2];
    mockWeatherData.getLocationWeatherData
      .mockReturnValueOnce(mockWeatherData1)
      .mockReturnValueOnce(mockWeatherData2);

    const { result } = renderHook(() => useWeatherComparison());

    expect(result.current.comparisons).toHaveLength(2);
    expect(result.current.comparisons[0].location).toEqual(mockLocation1);
    expect(result.current.comparisons[0].data).toEqual(mockWeatherData1);
    expect(result.current.comparisons[1].location).toEqual(mockLocation2);
    expect(result.current.comparisons[1].data).toEqual(mockWeatherData2);
  });

  it('filters locations with complete data', () => {
    mockAppContext.state.locations = [mockLocation1, mockLocation2];
    mockWeatherData.getLocationWeatherData
      .mockReturnValueOnce(mockWeatherData1)
      .mockReturnValueOnce(undefined); // No data for second location

    const { result } = renderHook(() => useWeatherComparison());

    expect(result.current.locationsWithData).toHaveLength(1);
    expect(result.current.locationsWithData[0].location).toEqual(mockLocation1);
    expect(result.current.hasEnoughData).toBe(false);
  });

  it('generates comparison insights', () => {
    mockAppContext.state.locations = [mockLocation1, mockLocation2];
    mockWeatherData.getLocationWeatherData
      .mockReturnValueOnce(mockWeatherData1)
      .mockReturnValueOnce(mockWeatherData2);

    const { result } = renderHook(() => useWeatherComparison());

    expect(result.current.insights).toHaveLength(3); // Temperature, humidity, wind
    
    const tempInsight = result.current.insights.find(i => i.type === 'temperature');
    expect(tempInsight?.message).toContain('warmer');
    expect(tempInsight?.difference).toBe(5);

    const humidityInsight = result.current.insights.find(i => i.type === 'humidity');
    expect(humidityInsight?.message).toContain('less humid');
    expect(humidityInsight?.difference).toBe(-20);

    const windInsight = result.current.insights.find(i => i.type === 'wind');
    expect(windInsight?.message).toContain('windier');
    expect(windInsight?.difference).toBe(3);
  });

  it('calculates extremes across locations', () => {
    mockAppContext.state.locations = [mockLocation1, mockLocation2];
    mockWeatherData.getLocationWeatherData
      .mockReturnValueOnce(mockWeatherData1)
      .mockReturnValueOnce(mockWeatherData2);

    const { result } = renderHook(() => useWeatherComparison());

    expect(result.current.extremes).toBeDefined();
    expect(result.current.extremes?.hottest.location).toEqual(mockLocation2);
    expect(result.current.extremes?.coldest.location).toEqual(mockLocation1);
    expect(result.current.extremes?.mostHumid.location).toEqual(mockLocation1);
    expect(result.current.extremes?.leastHumid.location).toEqual(mockLocation2);
    expect(result.current.extremes?.windiest.location).toEqual(mockLocation2);
    expect(result.current.extremes?.calmest.location).toEqual(mockLocation1);
  });

  it('detects loading state', () => {
    mockAppContext.state.locations = [mockLocation1];
    mockWeatherData.isLocationDataLoading.mockReturnValue(true);

    const { result } = renderHook(() => useWeatherComparison());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.comparisons[0].isLoading).toBe(true);
  });

  it('handles insufficient data for insights', () => {
    mockAppContext.state.locations = [mockLocation1];
    mockWeatherData.getLocationWeatherData.mockReturnValue(mockWeatherData1);

    const { result } = renderHook(() => useWeatherComparison());

    expect(result.current.insights).toEqual([]);
    expect(result.current.hasEnoughData).toBe(false);
  });

  it('ignores small differences in insights', () => {
    const similarWeatherData = {
      ...mockWeatherData2,
      current: {
        ...mockWeatherData2.current,
        temperature: 20.5, // Only 0.5 degree difference
        humidity: 67, // Only 2% difference
        windSpeed: 5.5, // Only 0.5 m/s difference
      },
    };

    mockAppContext.state.locations = [mockLocation1, mockLocation2];
    mockWeatherData.getLocationWeatherData
      .mockReturnValueOnce(mockWeatherData1)
      .mockReturnValueOnce(similarWeatherData);

    const { result } = renderHook(() => useWeatherComparison());

    expect(result.current.insights).toHaveLength(0); // No significant differences
  });

  it('returns null extremes when no data', () => {
    mockAppContext.state.locations = [mockLocation1];
    mockWeatherData.getLocationWeatherData.mockReturnValue(undefined);

    const { result } = renderHook(() => useWeatherComparison());

    expect(result.current.extremes).toBeNull();
  });
});