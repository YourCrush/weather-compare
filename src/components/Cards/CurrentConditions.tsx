import React from 'react';
import { CurrentWeather } from '../../types';
import { useSettings } from '../../context';

interface CurrentConditionsProps {
  weather: CurrentWeather;
}

export const CurrentConditions: React.FC<CurrentConditionsProps> = ({ weather }) => {
  const { formatTemperature, formatSpeed, formatPressure } = useSettings();

  const feelsLike = formatTemperature(weather.feelsLike);
  const windSpeed = formatSpeed(weather.windSpeed);
  const windGust = formatSpeed(weather.windGust);
  const pressure = formatPressure(weather.pressure);

  const conditions = [
    {
      label: 'Feels Like',
      value: `${feelsLike.value}${feelsLike.unit}`,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l3-3 3 3v13a7 7 0 11-6 0z" />
        </svg>
      ),
    },
    {
      label: 'Humidity',
      value: `${weather.humidity}%`,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      ),
    },
    {
      label: 'Wind Speed',
      value: `${windSpeed.value} ${windSpeed.unit}`,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h1m4 0h1M9 6h1m4 0h1" />
        </svg>
      ),
    },
    {
      label: 'Wind Gusts',
      value: `${windGust.value} ${windGust.unit}`,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h1m4 0h1M9 6h1m4 0h1" />
        </svg>
      ),
    },
    {
      label: 'Pressure',
      value: `${pressure.value} ${pressure.unit}`,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      label: 'Cloud Cover',
      value: `${weather.cloudCover}%`,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      ),
    },
    {
      label: 'UV Index',
      value: weather.uvIndex.toString(),
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      label: 'Precipitation',
      value: `${weather.precipitation.total24h.toFixed(1)}mm`,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {conditions.map((condition, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-primary-600 dark:text-primary-400">
            {condition.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {condition.label}
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {condition.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};