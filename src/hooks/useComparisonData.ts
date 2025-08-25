import * as React from 'react';
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
    console.log('🎣 useComparisonData hook called with:', { viewMode, selectedDate });
    const { state } = useAppContext();
    const [todayForecasts, setTodayForecasts] = React.useState<Map<string, TodayForecast>>(new Map());
    const [locationNames, setLocationNames] = React.useState<Map<string, string>>(new Map());
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        console.log('🔍 useComparisonData effect triggered:', { viewMode, selectedDate, locationsCount: state.locations.length });
        const fetchComparisonData = async () => {
            if (state.locations.length === 0) return;

            setIsLoading(true);
            setError(null);
            
            // Clear existing data when switching modes
            setTodayForecasts(new Map());
            setLocationNames(new Map());

            try {
                const newTodayForecasts = new Map<string, TodayForecast>();
                const newLocationNames = new Map<string, string>();

                for (const location of state.locations) {
                    let forecastData: TodayForecast | null = null;

                    console.log(`📊 Processing ${location.name} for viewMode: ${viewMode}`);

                    if (viewMode === 'current') {
                        // Use existing today's data from weather data
                        const weatherData = state.weatherData.get(location.id);
                        if (weatherData?.today) {
                            forecastData = weatherData.today;
                            console.log(`✅ Using current data for ${location.name}`);
                        }
                    } else if (viewMode === 'average') {
                        // Fetch 7-day average data
                        console.log(`📈 Fetching 7-day average for ${location.name}...`);
                        try {
                            forecastData = await weatherService.getWeeklyAverageData(
                                location.latitude,
                                location.longitude
                            );
                            console.log(`✅ Got 7-day average data for ${location.name}:`, forecastData);
                        } catch (err) {
                            console.warn(`❌ Failed to fetch 7-day average for ${location.name}:`, err);
                        }
                    } else if (viewMode === 'historical' && selectedDate) {
                        // Fetch historical data for selected date
                        console.log(`📅 Fetching historical data for ${location.name} on ${selectedDate}...`);
                        try {
                            forecastData = await weatherService.getHistoricalDayData(
                                location.latitude,
                                location.longitude,
                                selectedDate
                            );
                            console.log(`✅ Got historical data for ${location.name}:`, forecastData);
                        } catch (err) {
                            console.warn(`❌ Failed to fetch historical data for ${location.name}:`, err);
                        }
                    }

                    if (forecastData) {
                        newTodayForecasts.set(location.id, forecastData);
                        newLocationNames.set(location.id, location.name);
                    }
                }

                console.log(`📊 Final data for viewMode ${viewMode}:`, {
                    forecastsCount: newTodayForecasts.size,
                    locationNamesCount: newLocationNames.size,
                    firstLocationData: Array.from(newTodayForecasts.values())[0]?.hourly?.slice(0, 3) // Show first 3 hours for debugging
                });
                
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