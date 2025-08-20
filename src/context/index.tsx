import React, { ReactNode } from 'react';
import { AppProvider } from './AppContext';
import { WeatherDataProvider } from './WeatherDataProvider';
import { SettingsProvider } from './SettingsContext';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Combined provider component that wraps the app with all necessary contexts
 */
export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <AppProvider>
      <SettingsProvider>
        <WeatherDataProvider>
          {children}
        </WeatherDataProvider>
      </SettingsProvider>
    </AppProvider>
  );
};

// Re-export all hooks and contexts for easy importing
export { useAppContext } from './AppContext';
export { useWeatherData } from './WeatherDataProvider';
export { useSettings } from './SettingsContext';

// Re-export provider components
export { AppProvider } from './AppContext';
export { WeatherDataProvider } from './WeatherDataProvider';
export { SettingsProvider } from './SettingsContext';