import React, { createContext, useContext, useCallback, useEffect, ReactNode } from 'react';
import { Location, WeatherData } from '../types';
import { weatherService } from '../services/weather-api';
import { CacheUtils } from '../utils/cache';
import { useAppContext } from './AppContext';
import { WeatherApiError } from '../types/errors';

interface WeatherDataContextType {
  fetchWeatherData: (location: Location) => Promise<WeatherData>;
  refreshWeatherData: (locationId: string) => Promise<void>;
  refreshAllWeatherData: () => Promise<void>;
  isLocationDataLoading: (locationId: string) => boolean;
  getLocationWeatherData: (locationId: string) => WeatherData | undefined;
}

const WeatherDataContext = createContext<WeatherDataContextType | undefined>(undefined);

interface WeatherDataProviderProps {
  children: ReactNode;
}

export const WeatherDataProvider: React.FC<WeatherDataProviderProps> = ({ children }) => {
  const { state, setWeatherData, updateWeatherData, setLoading, addError } = useAppContext();
  const [loadingLocations, setLoadingLocations] = React.useState<Set<string>>(new Set());

  // Fetch weather data for a location
  const fetchWeatherData = useCallback(async (location: Location): Promise<WeatherData> => {
    const locationId = location.id;
    
    // Check if already loading
    if (loadingLocations.has(locationId)) {
      throw new Error('Weather data is already being fetched for this location');
    }

    // Check cache first
    const cachedData = CacheUtils.getCachedWeatherData(location);
    if (cachedData && cachedData.current) {
      return cachedData as WeatherData;
    }

    // Set loading state
    setLoadingLocations(prev => new Set(prev).add(locationId));
    setLoading(true);

    try {
      // Fetch current and weekly data (required)
      const [current, weekly] = await Promise.all([
        weatherService.getCurrentWeather(location.latitude, location.longitude),
        weatherService.getWeeklyForecast(location.latitude, location.longitude),
      ]);

      // Fetch historical data (optional - don't fail if it's not available)
      let historical: any = null;
      try {
        historical = await weatherService.getHistoricalData(location.latitude, location.longitude, 24);
      } catch (historicalError) {
        console.warn(`Historical data not available for ${location.name}:`, historicalError);
        // Create a minimal historical data structure
        historical = {
          monthly: [],
          location: `${location.latitude}, ${location.longitude}`,
          startDate: '',
          endDate: '',
        };
      }

      const weatherData: WeatherData = {
        current,
        weekly,
        historical,
        lastUpdated: new Date().toISOString(),
      };

      // Cache the data
      CacheUtils.cacheWeatherData(location, weatherData);

      // Update app state
      setWeatherData(locationId, weatherData);

      return weatherData;
    } catch (error) {
      const errorMessage = error instanceof WeatherApiError 
        ? error.message 
        : 'Failed to fetch weather data';

      addError({
        type: 'network',
        message: `Failed to load weather data for ${location.name}`,
        details: errorMessage,
      });

      throw error;
    } finally {
      setLoadingLocations(prev => {
        const newSet = new Set(prev);
        newSet.delete(locationId);
        return newSet;
      });
      
      // Only set loading to false if no other locations are loading
      setLoadingLocations(current => {
        if (current.size === 0) {
          setLoading(false);
        }
        return current;
      });
    }
  }, [loadingLocations, setWeatherData, setLoading, addError]);

  // Refresh weather data for a specific location
  const refreshWeatherData = useCallback(async (locationId: string): Promise<void> => {
    const location = state.locations.find(loc => loc.id === locationId);
    if (!location) {
      throw new Error('Location not found');
    }

    // Invalidate cache for this location
    CacheUtils.invalidateLocationData(location);

    // Fetch fresh data
    await fetchWeatherData(location);
  }, [state.locations, fetchWeatherData]);

  // Refresh weather data for all locations
  const refreshAllWeatherData = useCallback(async (): Promise<void> => {
    if (state.locations.length === 0) {
      return;
    }

    // Invalidate all current weather cache
    CacheUtils.invalidateCurrentWeather();

    // Fetch data for all locations in parallel
    const promises = state.locations.map(location => 
      fetchWeatherData(location).catch(error => {
        console.error(`Failed to refresh data for ${location.name}:`, error);
        return null;
      })
    );

    await Promise.allSettled(promises);
  }, [state.locations, fetchWeatherData]);

  // Check if location data is loading
  const isLocationDataLoading = useCallback((locationId: string): boolean => {
    return loadingLocations.has(locationId);
  }, [loadingLocations]);

  // Get weather data for a location
  const getLocationWeatherData = useCallback((locationId: string): WeatherData | undefined => {
    return state.weatherData.get(locationId);
  }, [state.weatherData]);

  // Auto-fetch weather data when locations are added
  useEffect(() => {
    const fetchMissingData = async () => {
      const locationsNeedingData = state.locations.filter(location => {
        const hasData = state.weatherData.has(location.id);
        const isLoading = loadingLocations.has(location.id);
        return !hasData && !isLoading;
      });

      if (locationsNeedingData.length === 0) {
        return;
      }

      // Fetch data for locations that don't have it
      const promises = locationsNeedingData.map(location =>
        fetchWeatherData(location).catch(error => {
          console.error(`Failed to auto-fetch data for ${location.name}:`, error);
          return null;
        })
      );

      await Promise.allSettled(promises);
    };

    fetchMissingData();
  }, [state.locations, state.weatherData, loadingLocations, fetchWeatherData]);

  // Auto-refresh data based on settings
  useEffect(() => {
    if (!state.settings.autoRefresh || state.locations.length === 0) {
      return;
    }

    const intervalMs = state.settings.refreshInterval * 60 * 1000; // Convert minutes to ms
    
    const interval = setInterval(() => {
      // Only refresh if not currently loading
      if (loadingLocations.size === 0) {
        refreshAllWeatherData().catch(error => {
          console.error('Auto-refresh failed:', error);
        });
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [state.settings.autoRefresh, state.settings.refreshInterval, state.locations.length, loadingLocations.size, refreshAllWeatherData]);

  // Background refresh for stale data
  useEffect(() => {
    const backgroundRefresh = async () => {
      const staleLocations = state.locations.filter(location => {
        const data = state.weatherData.get(location.id);
        if (!data || !data.lastUpdated) return false;

        const lastUpdated = new Date(data.lastUpdated).getTime();
        const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
        
        return lastUpdated < tenMinutesAgo;
      });

      if (staleLocations.length > 0 && loadingLocations.size === 0) {
        console.log(`Background refreshing ${staleLocations.length} stale locations`);
        
        const promises = staleLocations.map(location =>
          fetchWeatherData(location).catch(error => {
            console.warn(`Background refresh failed for ${location.name}:`, error);
            return null;
          })
        );

        await Promise.allSettled(promises);
      }
    };

    // Run background refresh every 5 minutes
    const interval = setInterval(backgroundRefresh, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [state.locations, state.weatherData, loadingLocations.size, fetchWeatherData]);

  const contextValue: WeatherDataContextType = {
    fetchWeatherData,
    refreshWeatherData,
    refreshAllWeatherData,
    isLocationDataLoading,
    getLocationWeatherData,
  };

  return (
    <WeatherDataContext.Provider value={contextValue}>
      {children}
    </WeatherDataContext.Provider>
  );
};

// Hook to use the weather data context
export const useWeatherData = (): WeatherDataContextType => {
  const context = useContext(WeatherDataContext);
  if (context === undefined) {
    throw new Error('useWeatherData must be used within a WeatherDataProvider');
  }
  return context;
};