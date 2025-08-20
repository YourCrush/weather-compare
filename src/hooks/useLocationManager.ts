import { useState, useCallback, useEffect } from 'react';
import { Location } from '../types';
import { LocationError } from '../types/errors';
import { geolocationService } from '../services/geolocation';
import { settingsStorage } from '../services/storage';

interface UseLocationManagerOptions {
  maxLocations?: number;
  autoDetectOnMount?: boolean;
  persistLocations?: boolean;
}

interface LocationManagerState {
  locations: Location[];
  isDetecting: boolean;
  error: LocationError | null;
  detectionMethod: 'none' | 'geolocation' | 'ip' | 'manual';
}

export const useLocationManager = (options: UseLocationManagerOptions = {}) => {
  const {
    maxLocations = 3,
    autoDetectOnMount = true,
    persistLocations = true,
  } = options;

  const [state, setState] = useState<LocationManagerState>({
    locations: [],
    isDetecting: false,
    error: null,
    detectionMethod: 'none',
  });

  // Load persisted locations on mount
  useEffect(() => {
    if (persistLocations) {
      const savedLocations = settingsStorage.getLastLocations();
      if (savedLocations.length > 0) {
        setState(prev => ({
          ...prev,
          locations: savedLocations.slice(0, maxLocations),
        }));
        return; // Don't auto-detect if we have saved locations
      }
    }

    // Auto-detect current location if no saved locations
    if (autoDetectOnMount) {
      detectCurrentLocation();
    }
  }, [maxLocations, autoDetectOnMount, persistLocations]);

  // Persist locations when they change
  useEffect(() => {
    if (persistLocations && state.locations.length > 0) {
      settingsStorage.saveLastLocations(state.locations);
    }
  }, [state.locations, persistLocations]);

  const detectCurrentLocation = useCallback(async () => {
    if (state.isDetecting) return;

    setState(prev => ({
      ...prev,
      isDetecting: true,
      error: null,
    }));

    try {
      const result = await geolocationService.getLocationWithFallback();
      
      setState(prev => ({
        ...prev,
        isDetecting: false,
        detectionMethod: result.method,
      }));

      if (result.location) {
        addLocation(result.location);
      }
    } catch (error) {
      const locationError = error instanceof LocationError 
        ? error 
        : new LocationError('Failed to detect location', 'DETECTION_FAILED');

      setState(prev => ({
        ...prev,
        isDetecting: false,
        error: locationError,
        detectionMethod: 'manual',
      }));
    }
  }, [state.isDetecting]);

  const addLocation = useCallback((location: Location) => {
    setState(prev => {
      // Check if we've reached the maximum
      if (prev.locations.length >= maxLocations) {
        return {
          ...prev,
          error: new LocationError(
            `Maximum of ${maxLocations} locations allowed`,
            'MAX_LOCATIONS_EXCEEDED'
          ),
        };
      }

      // Check for duplicates
      const isDuplicate = prev.locations.some(
        existing => existing.id === location.id ||
        (Math.abs(existing.latitude - location.latitude) < 0.01 &&
         Math.abs(existing.longitude - location.longitude) < 0.01)
      );

      if (isDuplicate) {
        return {
          ...prev,
          error: new LocationError(
            'This location is already added',
            'DUPLICATE_LOCATION'
          ),
        };
      }

      return {
        ...prev,
        locations: [...prev.locations, location],
        error: null,
      };
    });
  }, [maxLocations]);

  const removeLocation = useCallback((locationId: string) => {
    setState(prev => ({
      ...prev,
      locations: prev.locations.filter(loc => loc.id !== locationId),
      error: null,
    }));
  }, []);

  const updateLocation = useCallback((locationId: string, updates: Partial<Location>) => {
    setState(prev => ({
      ...prev,
      locations: prev.locations.map(loc =>
        loc.id === locationId ? { ...loc, ...updates } : loc
      ),
    }));
  }, []);

  const reorderLocations = useCallback((fromIndex: number, toIndex: number) => {
    setState(prev => {
      const newLocations = [...prev.locations];
      const [removed] = newLocations.splice(fromIndex, 1);
      newLocations.splice(toIndex, 0, removed);
      
      return {
        ...prev,
        locations: newLocations,
      };
    });
  }, []);

  const clearLocations = useCallback(() => {
    setState(prev => ({
      ...prev,
      locations: [],
      error: null,
    }));

    if (persistLocations) {
      settingsStorage.saveLastLocations([]);
    }
  }, [persistLocations]);

  const clearError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  const canAddMoreLocations = state.locations.length < maxLocations;
  const hasLocations = state.locations.length > 0;

  return {
    // State
    locations: state.locations,
    isDetecting: state.isDetecting,
    error: state.error,
    detectionMethod: state.detectionMethod,
    canAddMoreLocations,
    hasLocations,
    
    // Actions
    detectCurrentLocation,
    addLocation,
    removeLocation,
    updateLocation,
    reorderLocations,
    clearLocations,
    clearError,
  };
};