import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppProvider, useAppContext } from '../AppContext';
import { Location, WeatherData } from '../../types';

// Mock storage service
vi.mock('../../services/storage', () => ({
  settingsStorage: {
    getSettings: vi.fn(),
    getLastLocations: vi.fn(),
    saveSettings: vi.fn(),
    saveLastLocations: vi.fn(),
  },
  defaultSettings: {
    units: 'metric',
    theme: 'system',
    favorites: [],
    defaultView: 'summary',
    chartSettings: {
      sharedYAxis: false,
      showGrid: true,
      showLegend: true,
      animationEnabled: true,
    },
    autoRefresh: true,
    refreshInterval: 15,
  },
}));

const mockLocation: Location = {
  id: '1',
  name: 'New York',
  country: 'United States',
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: 'America/New_York',
  region: 'New York',
};

const mockWeatherData: WeatherData = {
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
  weekly: {
    daily: [],
    location: 'New York',
    timezone: 'America/New_York',
  },
  historical: {
    monthly: [],
    location: 'New York',
    startDate: '2022-01-01',
    endDate: '2023-12-01',
  },
  lastUpdated: '2023-12-01T12:00:00Z',
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

describe('AppContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    const { settingsStorage } = require('../../services/storage');
    settingsStorage.getSettings.mockReturnValue(null);
    settingsStorage.getLastLocations.mockReturnValue([]);
  });

  it('provides initial state', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    expect(result.current.state.locations).toEqual([]);
    expect(result.current.state.weatherData.size).toBe(0);
    expect(result.current.state.ui.activeView).toBe('summary');
    expect(result.current.state.ui.loading).toBe(false);
    expect(result.current.state.ui.errors).toEqual([]);
  });

  it('loads persisted settings on mount', () => {
    const { settingsStorage } = require('../../services/storage');
    const savedSettings = { units: 'imperial', theme: 'dark' };
    settingsStorage.getSettings.mockReturnValue(savedSettings);

    const { result } = renderHook(() => useAppContext(), { wrapper });

    expect(result.current.state.settings.units).toBe('imperial');
    expect(result.current.state.settings.theme).toBe('dark');
  });

  it('loads persisted locations on mount', () => {
    const { settingsStorage } = require('../../services/storage');
    settingsStorage.getLastLocations.mockReturnValue([mockLocation]);

    const { result } = renderHook(() => useAppContext(), { wrapper });

    expect(result.current.state.locations).toEqual([mockLocation]);
  });

  it('adds locations', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    act(() => {
      result.current.addLocation(mockLocation);
    });

    expect(result.current.state.locations).toEqual([mockLocation]);
  });

  it('removes locations', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    act(() => {
      result.current.addLocation(mockLocation);
    });

    expect(result.current.state.locations).toHaveLength(1);

    act(() => {
      result.current.removeLocation(mockLocation.id);
    });

    expect(result.current.state.locations).toHaveLength(0);
  });

  it('updates locations', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    act(() => {
      result.current.addLocation(mockLocation);
    });

    const updates = { name: 'Updated Name' };

    act(() => {
      result.current.updateLocation(mockLocation.id, updates);
    });

    expect(result.current.state.locations[0].name).toBe('Updated Name');
  });

  it('sets weather data', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    act(() => {
      result.current.setWeatherData(mockLocation.id, mockWeatherData);
    });

    expect(result.current.state.weatherData.get(mockLocation.id)).toEqual(mockWeatherData);
  });

  it('updates weather data', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    act(() => {
      result.current.setWeatherData(mockLocation.id, mockWeatherData);
    });

    const updates = { lastUpdated: '2023-12-01T13:00:00Z' };

    act(() => {
      result.current.updateWeatherData(mockLocation.id, updates);
    });

    const updatedData = result.current.state.weatherData.get(mockLocation.id);
    expect(updatedData?.lastUpdated).toBe('2023-12-01T13:00:00Z');
  });

  it('clears weather data', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    act(() => {
      result.current.setWeatherData(mockLocation.id, mockWeatherData);
    });

    expect(result.current.state.weatherData.size).toBe(1);

    act(() => {
      result.current.clearWeatherData();
    });

    expect(result.current.state.weatherData.size).toBe(0);
  });

  it('updates settings', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    act(() => {
      result.current.updateSettings({ units: 'imperial' });
    });

    expect(result.current.state.settings.units).toBe('imperial');
  });

  it('sets theme', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.state.settings.theme).toBe('dark');
  });

  it('sets units', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    act(() => {
      result.current.setUnits('imperial');
    });

    expect(result.current.state.settings.units).toBe('imperial');
  });

  it('manages favorites', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    act(() => {
      result.current.addFavorite(mockLocation);
    });

    expect(result.current.state.settings.favorites).toEqual([mockLocation]);

    act(() => {
      result.current.removeFavorite(mockLocation.id);
    });

    expect(result.current.state.settings.favorites).toEqual([]);
  });

  it('prevents duplicate favorites', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    act(() => {
      result.current.addFavorite(mockLocation);
      result.current.addFavorite(mockLocation); // Same location
    });

    expect(result.current.state.settings.favorites).toHaveLength(1);
  });

  it('manages UI state', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    act(() => {
      result.current.setActiveView('charts');
    });

    expect(result.current.state.ui.activeView).toBe('charts');

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.state.ui.loading).toBe(true);

    act(() => {
      result.current.toggleSidebar();
    });

    expect(result.current.state.ui.sidebarOpen).toBe(true);
  });

  it('manages errors', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper });

    act(() => {
      result.current.addError({
        type: 'network',
        message: 'Test error',
      });
    });

    expect(result.current.state.ui.errors).toHaveLength(1);
    expect(result.current.state.ui.errors[0].message).toBe('Test error');

    const errorId = result.current.state.ui.errors[0].id;

    act(() => {
      result.current.dismissError(errorId);
    });

    expect(result.current.state.ui.errors[0].dismissed).toBe(true);

    act(() => {
      result.current.clearErrors();
    });

    expect(result.current.state.ui.errors).toHaveLength(0);
  });

  it('throws error when used outside provider', () => {
    expect(() => {
      renderHook(() => useAppContext());
    }).toThrow('useAppContext must be used within an AppProvider');
  });
});