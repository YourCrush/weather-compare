import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { UserSettings, Units, Theme, ViewMode, ChartSettings, Location } from '../types';
import { useAppContext } from './AppContext';

interface SettingsContextType {
  settings: UserSettings;
  
  // Theme management
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
  
  // Units management
  setUnits: (units: Units) => void;
  toggleUnits: () => void;
  
  // View management
  setDefaultView: (view: ViewMode) => void;
  
  // Chart settings
  updateChartSettings: (settings: Partial<ChartSettings>) => void;
  toggleChartSetting: (setting: keyof ChartSettings) => void;
  
  // Auto-refresh settings
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (minutes: number) => void;
  
  // Favorites management
  addFavorite: (location: Location) => void;
  removeFavorite: (locationId: string) => void;
  
  // Utility functions
  formatTemperature: (celsius: number) => { value: number; unit: string };
  formatSpeed: (mps: number) => { value: number; unit: string };
  formatPressure: (hpa: number) => { value: number; unit: string };
  formatDistance: (km: number) => { value: number; unit: string };
  
  // Reset settings
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const { state, updateSettings, setTheme: setAppTheme, setUnits: setAppUnits, addFavorite: addAppFavorite, removeFavorite: removeAppFavorite } = useAppContext();
  const { settings } = state;

  // Theme management
  const setTheme = useCallback((theme: Theme) => {
    setAppTheme(theme);
  }, [setAppTheme]);

  const toggleTheme = useCallback(() => {
    const currentTheme = settings.theme;
    let newTheme: Theme;
    
    if (currentTheme === 'system') {
      // If system, switch to opposite of current system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      newTheme = prefersDark ? 'light' : 'dark';
    } else {
      newTheme = currentTheme === 'light' ? 'dark' : 'light';
    }
    
    setTheme(newTheme);
  }, [settings.theme, setTheme]);

  const isDarkMode = React.useMemo(() => {
    if (settings.theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return settings.theme === 'dark';
  }, [settings.theme]);

  // Units management
  const setUnits = useCallback((units: Units) => {
    setAppUnits(units);
  }, [setAppUnits]);

  const toggleUnits = useCallback(() => {
    const newUnits = settings.units === 'metric' ? 'imperial' : 'metric';
    setUnits(newUnits);
  }, [settings.units, setUnits]);

  // View management
  const setDefaultView = useCallback((view: ViewMode) => {
    updateSettings({ defaultView: view });
  }, [updateSettings]);

  // Chart settings
  const updateChartSettings = useCallback((chartSettings: Partial<ChartSettings>) => {
    updateSettings({
      chartSettings: {
        ...settings.chartSettings,
        ...chartSettings,
      },
    });
  }, [settings.chartSettings, updateSettings]);

  const toggleChartSetting = useCallback((setting: keyof ChartSettings) => {
    updateChartSettings({
      [setting]: !settings.chartSettings[setting],
    });
  }, [settings.chartSettings, updateChartSettings]);

  // Auto-refresh settings
  const setAutoRefresh = useCallback((enabled: boolean) => {
    updateSettings({ autoRefresh: enabled });
  }, [updateSettings]);

  const setRefreshInterval = useCallback((minutes: number) => {
    // Clamp between 1 and 60 minutes
    const clampedMinutes = Math.max(1, Math.min(60, minutes));
    updateSettings({ refreshInterval: clampedMinutes });
  }, [updateSettings]);

  // Unit conversion utilities
  const formatTemperature = useCallback((celsius: number): { value: number; unit: string } => {
    if (settings.units === 'imperial') {
      return {
        value: Math.round((celsius * 9/5) + 32),
        unit: '°F',
      };
    }
    return {
      value: Math.round(celsius),
      unit: '°C',
    };
  }, [settings.units]);

  const formatSpeed = useCallback((mps: number): { value: number; unit: string } => {
    if (settings.units === 'imperial') {
      // Convert m/s to mph
      return {
        value: Math.round(mps * 2.237),
        unit: 'mph',
      };
    }
    // Convert m/s to km/h
    return {
      value: Math.round(mps * 3.6),
      unit: 'km/h',
    };
  }, [settings.units]);

  const formatPressure = useCallback((hpa: number): { value: number; unit: string } => {
    if (settings.units === 'imperial') {
      // Convert hPa to inHg
      return {
        value: Math.round((hpa * 0.02953) * 100) / 100,
        unit: 'inHg',
      };
    }
    return {
      value: Math.round(hpa),
      unit: 'hPa',
    };
  }, [settings.units]);

  const formatDistance = useCallback((km: number): { value: number; unit: string } => {
    if (settings.units === 'imperial') {
      return {
        value: Math.round(km * 0.621371),
        unit: 'mi',
      };
    }
    return {
      value: Math.round(km),
      unit: 'km',
    };
  }, [settings.units]);

  // Favorites management
  const addFavorite = useCallback((location: Location) => {
    addAppFavorite(location);
  }, [addAppFavorite]);

  const removeFavorite = useCallback((locationId: string) => {
    removeAppFavorite(locationId);
  }, [removeAppFavorite]);

  // Reset settings
  const resetSettings = useCallback(() => {
    const { defaultSettings } = require('../services/storage');
    updateSettings(defaultSettings);
  }, [updateSettings]);

  const contextValue: SettingsContextType = {
    settings,
    
    // Theme management
    setTheme,
    toggleTheme,
    isDarkMode,
    
    // Units management
    setUnits,
    toggleUnits,
    
    // View management
    setDefaultView,
    
    // Chart settings
    updateChartSettings,
    toggleChartSetting,
    
    // Auto-refresh settings
    setAutoRefresh,
    setRefreshInterval,
    
    // Favorites management
    addFavorite,
    removeFavorite,
    
    // Utility functions
    formatTemperature,
    formatSpeed,
    formatPressure,
    formatDistance,
    
    // Reset settings
    resetSettings,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

// Hook to use the settings context
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};