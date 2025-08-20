import React from 'react';
import { useWeatherComparison } from '../../hooks/useWeatherComparison';
import { ComparisonSummary } from '../Summary/ComparisonSummary';
import { WeatherInsights } from '../Summary/WeatherInsights';

export const SummaryView: React.FC = () => {
  const { locationsWithData, isLoading } = useWeatherComparison();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading weather data...</span>
      </div>
    );
  }

  if (locationsWithData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="card p-8 max-w-md mx-auto">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Weather Data
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No weather data available yet. Please wait while we fetch the latest information for your locations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Weather Summary
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      {/* Weather insights with extremes */}
      <WeatherInsights />
      
      {/* Detailed comparison summary */}
      <ComparisonSummary />
    </div>
  );
};