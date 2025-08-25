import { useState, useEffect } from 'react';
import { useAppContext } from '../context';
import { weatherService } from '../services/weather-api';
import { TodayForecast } from '../types';

interface ComparisonData {
  todayForecasts: Map<string, TodayForecast>;
  locationNames: Map<string, string>;
  isLoading: boolean;
  error: string | null;
}

export const useComparisonData = (
  viewMode: 'current' | 'historical' | 'average',
  selectedDate?: string
): ComparisonData => {
  const { state } = useAppContext();
  const [todayForecasts, setTodayForecasts] = useState<Map<string, TodayForecast>>(new Map());
  const [locationNames, setLocationNames] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComparisonData = async () => {
      if (state.locations.length === 0) return;

      setIsLoading(true);
      setError(null);

      try {
        const newTodayForecasts = new Map<string, TodayForecast>();
        const newLocationNames = new Map<string, string>();

        for (const location of state.locations) {
          let forecastData: TodayForecast | null = null;

          if (viewMode === 'current') {
            // Use existing today's data from weather data
            const weatherData = state.weatherData.get(location.id);
            if (weatherData?.today) {
              forecastData = weatherData.today;
            }
          } else if (viewMode === 'average') {
            // Fetch 7-day average data
            try {
              forecastData = await weatherService.getWeeklyAverageData(
                location.latitude,
                location.longitude
              );
            } catch (err) {
              console.warn(`Failed to fetch 7-day average for ${location.name}:`, err);
            }
          } else if (viewMode === 'historical' && selectedDate) {
            // Fetch historical data for selected date
            try {
              forecastData = await weatherService.getHistoricalDayData(
                location.latitude,
                location.longitude,
                selectedDate
              );
            } catch (err) {
              console.warn(`Failed to fetch historical data for ${location.name}:`, err);
            }
          }

          if (forecastData) {
            newTodayForecasts.set(location.id, forecastData);
            newLocationNames.set(location.id, location.name);
          }
        }

        setTodayForecasts(newTodayForecasts);
        setLocationNames(newLocationNames);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch comparison data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchComparisonData();
  }, [state.locations, state.weatherData, viewMode, selectedDate]);

  return {
    todayForecasts,
    locationNames,
    isLoading,
    error,
  };
};