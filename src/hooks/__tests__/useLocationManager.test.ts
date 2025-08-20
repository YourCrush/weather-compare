import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useLocationManager } from '../useLocationManager';
import { Location } from '../../types';
import { LocationError } from '../../types/errors';

// Mock services
vi.mock('../../services/geolocation', () => ({
  geolocationService: {
    getLocationWithFallback: vi.fn(),
  },
}));

vi.mock('../../services/storage', () => ({
  settingsStorage: {
    getLastLocations: vi.fn(),
    saveLastLocations: vi.fn(),
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

const mockLocation2: Location = {
  id: '2',
  name: 'Los Angeles',
  country: 'United States',
  latitude: 34.0522,
  longitude: -118.2437,
  timezone: 'America/Los_Angeles',
  region: 'California',
};

describe('useLocationManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock storage to return empty array by default
    const { settingsStorage } = require('../../services/storage');
    settingsStorage.getLastLocations.mockReturnValue([]);
  });

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useLocationManager({
      autoDetectOnMount: false,
      persistLocations: false,
    }));

    expect(result.current.locations).toEqual([]);
    expect(result.current.isDetecting).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.detectionMethod).toBe('none');
    expect(result.current.canAddMoreLocations).toBe(true);
    expect(result.current.hasLocations).toBe(false);
  });

  it('loads persisted locations on mount', () => {
    const { settingsStorage } = require('../../services/storage');
    settingsStorage.getLastLocations.mockReturnValue([mockLocation]);

    const { result } = renderHook(() => useLocationManager({
      persistLocations: true,
      autoDetectOnMount: false,
    }));

    expect(result.current.locations).toEqual([mockLocation]);
    expect(result.current.hasLocations).toBe(true);
  });

  it('auto-detects location on mount when no saved locations', async () => {
    const { geolocationService } = require('../../services/geolocation');
    geolocationService.getLocationWithFallback.mockResolvedValue({
      method: 'geolocation',
      position: { latitude: 40.7128, longitude: -74.0060 },
      location: mockLocation,
    });

    const { result } = renderHook(() => useLocationManager({
      autoDetectOnMount: true,
      persistLocations: false,
    }));

    // Should start detecting
    expect(result.current.isDetecting).toBe(true);

    // Wait for detection to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.locations).toEqual([mockLocation]);
    expect(result.current.isDetecting).toBe(false);
    expect(result.current.detectionMethod).toBe('geolocation');
  });

  it('handles location detection failure', async () => {
    const { geolocationService } = require('../../services/geolocation');
    const error = new LocationError('Permission denied', 'PERMISSION_DENIED');
    geolocationService.getLocationWithFallback.mockRejectedValue(error);

    const { result } = renderHook(() => useLocationManager({
      autoDetectOnMount: true,
      persistLocations: false,
    }));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBeInstanceOf(LocationError);
    expect(result.current.isDetecting).toBe(false);
    expect(result.current.detectionMethod).toBe('manual');
  });

  it('adds locations correctly', () => {
    const { result } = renderHook(() => useLocationManager({
      autoDetectOnMount: false,
      persistLocations: false,
    }));

    act(() => {
      result.current.addLocation(mockLocation);
    });

    expect(result.current.locations).toEqual([mockLocation]);
    expect(result.current.hasLocations).toBe(true);
  });

  it('prevents adding duplicate locations', () => {
    const { result } = renderHook(() => useLocationManager({
      autoDetectOnMount: false,
      persistLocations: false,
    }));

    act(() => {
      result.current.addLocation(mockLocation);
    });

    act(() => {
      result.current.addLocation(mockLocation); // Same location
    });

    expect(result.current.locations).toHaveLength(1);
    expect(result.current.error?.code).toBe('DUPLICATE_LOCATION');
  });

  it('prevents adding locations beyond maximum', () => {
    const { result } = renderHook(() => useLocationManager({
      maxLocations: 2,
      autoDetectOnMount: false,
      persistLocations: false,
    }));

    act(() => {
      result.current.addLocation(mockLocation);
      result.current.addLocation(mockLocation2);
    });

    expect(result.current.canAddMoreLocations).toBe(false);

    const thirdLocation = { ...mockLocation, id: '3', name: 'Chicago' };
    
    act(() => {
      result.current.addLocation(thirdLocation);
    });

    expect(result.current.locations).toHaveLength(2);
    expect(result.current.error?.code).toBe('MAX_LOCATIONS_EXCEEDED');
  });

  it('removes locations correctly', () => {
    const { result } = renderHook(() => useLocationManager({
      autoDetectOnMount: false,
      persistLocations: false,
    }));

    act(() => {
      result.current.addLocation(mockLocation);
      result.current.addLocation(mockLocation2);
    });

    expect(result.current.locations).toHaveLength(2);

    act(() => {
      result.current.removeLocation(mockLocation.id);
    });

    expect(result.current.locations).toHaveLength(1);
    expect(result.current.locations[0]).toEqual(mockLocation2);
  });

  it('updates locations correctly', () => {
    const { result } = renderHook(() => useLocationManager({
      autoDetectOnMount: false,
      persistLocations: false,
    }));

    act(() => {
      result.current.addLocation(mockLocation);
    });

    const updates = { name: 'Updated Name' };

    act(() => {
      result.current.updateLocation(mockLocation.id, updates);
    });

    expect(result.current.locations[0].name).toBe('Updated Name');
  });

  it('reorders locations correctly', () => {
    const { result } = renderHook(() => useLocationManager({
      autoDetectOnMount: false,
      persistLocations: false,
    }));

    act(() => {
      result.current.addLocation(mockLocation);
      result.current.addLocation(mockLocation2);
    });

    expect(result.current.locations[0]).toEqual(mockLocation);
    expect(result.current.locations[1]).toEqual(mockLocation2);

    act(() => {
      result.current.reorderLocations(0, 1);
    });

    expect(result.current.locations[0]).toEqual(mockLocation2);
    expect(result.current.locations[1]).toEqual(mockLocation);
  });

  it('clears all locations', () => {
    const { result } = renderHook(() => useLocationManager({
      autoDetectOnMount: false,
      persistLocations: false,
    }));

    act(() => {
      result.current.addLocation(mockLocation);
      result.current.addLocation(mockLocation2);
    });

    expect(result.current.locations).toHaveLength(2);

    act(() => {
      result.current.clearLocations();
    });

    expect(result.current.locations).toHaveLength(0);
    expect(result.current.hasLocations).toBe(false);
  });

  it('clears errors', () => {
    const { result } = renderHook(() => useLocationManager({
      maxLocations: 1,
      autoDetectOnMount: false,
      persistLocations: false,
    }));

    act(() => {
      result.current.addLocation(mockLocation);
      result.current.addLocation(mockLocation2); // Should cause error
    });

    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('persists locations when enabled', () => {
    const { settingsStorage } = require('../../services/storage');
    
    const { result } = renderHook(() => useLocationManager({
      autoDetectOnMount: false,
      persistLocations: true,
    }));

    act(() => {
      result.current.addLocation(mockLocation);
    });

    expect(settingsStorage.saveLastLocations).toHaveBeenCalledWith([mockLocation]);
  });

  it('does not persist locations when disabled', () => {
    const { settingsStorage } = require('../../services/storage');
    
    const { result } = renderHook(() => useLocationManager({
      autoDetectOnMount: false,
      persistLocations: false,
    }));

    act(() => {
      result.current.addLocation(mockLocation);
    });

    expect(settingsStorage.saveLastLocations).not.toHaveBeenCalled();
  });

  it('manually detects current location', async () => {
    const { geolocationService } = require('../../services/geolocation');
    geolocationService.getLocationWithFallback.mockResolvedValue({
      method: 'geolocation',
      position: { latitude: 40.7128, longitude: -74.0060 },
      location: mockLocation,
    });

    const { result } = renderHook(() => useLocationManager({
      autoDetectOnMount: false,
      persistLocations: false,
    }));

    await act(async () => {
      await result.current.detectCurrentLocation();
    });

    expect(result.current.locations).toEqual([mockLocation]);
    expect(result.current.detectionMethod).toBe('geolocation');
  });
});