import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ComparisonSummary } from '../ComparisonSummary';

// Mock the hooks
const mockWeatherComparison = {
  locationsWithData: [],
  insights: [],
  extremes: null,
  isLoading: false,
};

const mockSettings = {
  formatTemperature: vi.fn((celsius: number) => ({ value: Math.round(celsius), unit: '°C' })),
  formatSpeed: vi.fn((mps: number) => ({ value: Math.round(mps * 3.6), unit: 'km/h' })),
  formatPressure: vi.fn((hpa: number) => ({ value: Math.round(hpa), unit: 'hPa' })),
};

vi.mock('../../../context', () => ({
  useWeatherComparison: () => mockWeatherComparison,
  useSettings: () => mockSettings,
}));

const mockLocation1 = {
  id: '1',
  name: 'New York',
  country: 'United States',
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: 'America/New_York',
};

const mockLocation2 = {
  id: '2',
  name: 'Los Angeles',
  country: 'United States',
  latitude: 34.0522,
  longitude: -118.2437,
  timezone: 'America/Los_Angeles',
};

const mockWeatherData1 = {
  current: {
    temperature: 20,
    feelsLike: 18,
    humidity: 65,
    windSpeed: 5,
    windGust: 8,
    precipitation: { type: 'none', intensity: 0, probability: 0, rate: 0, total1h: 0, total24h: 0 },
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

const mockWeatherData2 = {
  current: {
    temperature: 25,
    feelsLike: 23,
    humidity: 45,
    windSpeed: 8,
    windGust: 12,
    precipitation: { type: 'none', intensity: 0, probability: 0, rate: 0, total1h: 0, total24h: 0 },
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

describe('ComparisonSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state', () => {
    mockWeatherComparison.isLoading = true;
    
    render(<ComparisonSummary />);
    
    expect(screen.getByText('Analyzing weather patterns...')).toBeInTheDocument();
  });

  it('shows message when less than 2 locations', () => {
    mockWeatherComparison.isLoading = false;
    mockWeatherComparison.locationsWithData = [
      { location: mockLocation1, data: mockWeatherData1, isLoading: false }
    ];
    
    render(<ComparisonSummary />);
    
    expect(screen.getByText('Add More Locations')).toBeInTheDocument();
    expect(screen.getByText('Add at least 2 locations to see weather comparisons and insights.')).toBeInTheDocument();
  });

  it('displays insights when available', () => {
    mockWeatherComparison.isLoading = false;
    mockWeatherComparison.locationsWithData = [
      { location: mockLocation1, data: mockWeatherData1, isLoading: false },
      { location: mockLocation2, data: mockWeatherData2, isLoading: false }
    ];
    mockWeatherComparison.insights = [
      {
        type: 'temperature',
        message: 'Los Angeles is 5° warmer than New York',
        difference: 5,
        unit: '°C',
      }
    ];
    
    render(<ComparisonSummary />);
    
    expect(screen.getByText('Key Insights')).toBeInTheDocument();
    expect(screen.getByText('Los Angeles is 5° warmer than New York')).toBeInTheDocument();
  });

  it('displays current conditions for all locations', () => {
    mockWeatherComparison.isLoading = false;
    mockWeatherComparison.locationsWithData = [
      { location: mockLocation1, data: mockWeatherData1, isLoading: false },
      { location: mockLocation2, data: mockWeatherData2, isLoading: false }
    ];
    mockWeatherComparison.insights = [];
    
    render(<ComparisonSummary />);
    
    expect(screen.getByText('Current Conditions')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();
    expect(screen.getByText('Los Angeles')).toBeInTheDocument();
    
    // Check temperature formatting
    expect(mockSettings.formatTemperature).toHaveBeenCalledWith(20);
    expect(mockSettings.formatTemperature).toHaveBeenCalledWith(25);
  });

  it('shows comfort levels and weather descriptions', () => {
    mockWeatherComparison.isLoading = false;
    mockWeatherComparison.locationsWithData = [
      { location: mockLocation1, data: mockWeatherData1, isLoading: false }
    ];
    
    render(<ComparisonSummary />);
    
    expect(screen.getByText('Conditions:')).toBeInTheDocument();
    expect(screen.getByText('Comfort:')).toBeInTheDocument();
  });

  it('generates detailed comparisons between locations', () => {
    mockWeatherComparison.isLoading = false;
    mockWeatherComparison.locationsWithData = [
      { location: mockLocation1, data: mockWeatherData1, isLoading: false },
      { location: mockLocation2, data: mockWeatherData2, isLoading: false }
    ];
    
    render(<ComparisonSummary />);
    
    expect(screen.getByText('New York vs Los Angeles')).toBeInTheDocument();
  });

  it('handles locations with similar weather conditions', () => {
    const similarWeatherData = {
      ...mockWeatherData2,
      current: {
        ...mockWeatherData2.current,
        temperature: 20.2, // Very similar to mockWeatherData1
        humidity: 66,
        windSpeed: 5.1,
      }
    };
    
    mockWeatherComparison.isLoading = false;
    mockWeatherComparison.locationsWithData = [
      { location: mockLocation1, data: mockWeatherData1, isLoading: false },
      { location: mockLocation2, data: similarWeatherData, isLoading: false }
    ];
    
    render(<ComparisonSummary />);
    
    expect(screen.getByText('Weather conditions are very similar between these locations.')).toBeInTheDocument();
  });
});