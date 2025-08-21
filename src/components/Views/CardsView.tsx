import React from 'react';
import { useAppContext } from '../../context';

export const CardsView: React.FC = () => {
  const { state } = useAppContext();

  if (state.locations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="card p-8 max-w-md mx-auto">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Cards View
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Add locations to see detailed weather cards for each location.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Weather Cards
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Detailed weather information for each location
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {state.locations.map((location) => (
          <div key={location.id} className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {location.name}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              {location.region && `${location.region}, `}{location.country}
            </p>
            <div className="text-center py-8">
              <div className="text-3xl mb-2">🌤️</div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Weather data loading...
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};