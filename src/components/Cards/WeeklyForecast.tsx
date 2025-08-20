import React from 'react';
import { WeeklyForecast as WeeklyForecastType } from '../../types';
import { useSettings } from '../../context';
import { DifferenceCalculator } from '../../utils/weatherComparison';

interface WeeklyForecastProps {
  forecast: WeeklyForecastType;
}

export const WeeklyForecast: React.FC<WeeklyForecastProps> = ({ forecast }) => {
  const { formatTemperature, formatSpeed } = useSettings();

  const getWeatherIcon = (weatherCode: number) => {
    // Simplified weather icon mapping
    if (weatherCode === 0 || weatherCode === 1) {
      return (
        <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>
      );
    } else if (weatherCode >= 61 && weatherCode <= 67) {
      return (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      );
    } else if (weatherCode >= 71 && weatherCode <= 77) {
      return (
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="space-y-3">
      {forecast.daily.slice(0, 7).map((day, index) => {
        const minTemp = formatTemperature(day.tempMin);
        const maxTemp = formatTemperature(day.tempMax);
        const wind = formatSpeed(day.windSpeed);
        const condition = DifferenceCalculator.getWeatherDescription(day.weatherCode);

        return (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-16 text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatDate(day.date)}
              </div>
              
              <div className="flex items-center space-x-2">
                {getWeatherIcon(day.weatherCode)}
                <div className="hidden sm:block">
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-24 truncate">
                    {condition}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <span className="text-gray-500 dark:text-gray-400">
                  {day.precipitation.probability}%
                </span>
              </div>

              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h1m4 0h1M9 6h1m4 0h1" />
                </svg>
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  {wind.value}
                </span>
              </div>

              <div className="flex items-center space-x-2 min-w-0">
                <span className="text-gray-500 dark:text-gray-400">
                  {minTemp.value}°
                </span>
                <div className="w-8 h-1 bg-gradient-to-r from-blue-400 to-red-400 rounded-full"></div>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {maxTemp.value}°
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};