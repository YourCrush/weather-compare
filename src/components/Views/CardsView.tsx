import React from 'react';
import { useWeatherComparison, useWeatherData } from '../../context';
import { CityWeatherCard } from '../Cards/CityWeatherCard';

export const CardsView: React.FC = () => {
  const { locationsWithData, isLoading } = useWeatherComparison();
  const { isLocationDataLoading } = useWeatherData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading weather cards...</span>
      </div>
    );
  }

  if (locationsWithData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="card p-8 max-w-md mx-auto">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Weather Data
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Add locations to see detailed weather cards with current conditions, forecasts, and historical data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Side-by-Side Cards
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {locationsWithData.length} location{locationsWithData.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Cards grid */}
      <div className={`grid gap-6 ${
        locationsWithData.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' :
        locationsWithData.length === 2 ? 'grid-cols-1 lg:grid-cols-2' :
        'grid-cols-1 xl:grid-cols-3'
      }`}>
        {locationsWithData.map(({ location, data }) => (
          <CityWeatherCard
            key={location.id}
            location={location}
            weatherData={data!}
            isLoading={isLocationDataLoading(location.id)}
            className="h-fit"
          />
        ))}
      </div>

      {/* Responsive note */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
        <p>
          Cards automatically adjust layout based on screen size and number of locations.
        </p>
      </div>
    </div>
  );
};