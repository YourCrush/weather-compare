import React from 'react';
import { Location, WeatherData } from '../../types';
import { useSettings } from '../../context';
import { DifferenceCalculator } from '../../utils/weatherComparison';
import { CurrentConditions } from './CurrentConditions';
import { WeeklyForecast } from './WeeklyForecast';
import { HistoricalSummary } from './HistoricalSummary';

interface CityWeatherCardProps {
  location: Location;
  weatherData: WeatherData;
  isLoading?: boolean;
  className?: string;
}

export const CityWeatherCard: React.FC<CityWeatherCardProps> = ({
  location,
  weatherData,
  isLoading = false,
  className = '',
}) => {
  const { formatTemperature } = useSettings();

  if (isLoading) {
    return (
      <div className={`card p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const temp = formatTemperature(weatherData.current.temperature);
  const condition = DifferenceCalculator.getWeatherDescription(weatherData.current.weatherCode);
  const comfort = DifferenceCalculator.getComfortLevel(
    weatherData.current.temperature,
    weatherData.current.humidity
  );

  return (
    <div className={`card overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{location.name}</h2>
            <p className="text-primary-100 text-sm">
              {location.region && `${location.region}, `}{location.country}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {temp.value}{temp.unit}
            </div>
            <p className="text-primary-100 text-sm">{condition}</p>
          </div>
        </div>
        
        {/* Comfort indicator */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              comfort.level === 'comfortable' ? 'bg-green-300' :
              comfort.level === 'mild' ? 'bg-yellow-300' :
              'bg-red-300'
            }`} />
            <span className="text-primary-100 text-sm">{comfort.description}</span>
          </div>
          <div className="text-primary-100 text-xs">
            {new Date(weatherData.current.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Content sections */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {/* Current conditions */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            Current Conditions
          </h3>
          <CurrentConditions weather={weatherData.current} />
        </div>

        {/* Weekly forecast */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            7-Day Forecast
          </h3>
          <WeeklyForecast forecast={weatherData.weekly} />
        </div>

        {/* Historical summary */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Historical Overview
          </h3>
          <HistoricalSummary historical={weatherData.historical} />
        </div>
      </div>
    </div>
  );
};