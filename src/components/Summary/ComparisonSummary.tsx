import React from 'react';
import { useAppContext } from '../../context';

export const ComparisonSummary: React.FC = () => {
  const { state } = useAppContext();

  if (state.locations.length === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Add locations to see weather comparison summary
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {state.locations.map((location) => {
          const weatherData = state.weatherData.get(location.id);
          const current = weatherData?.current;
          
          return (
            <div key={location.id} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {location.name}
                </h3>
                <div className="text-2xl">🌤️</div>
              </div>
              
              {current ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Temperature:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {Math.round(current.temperature)}°C
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Feels like:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {Math.round(current.feelsLike)}°C
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Humidity:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {current.humidity}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Wind:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {Math.round(current.windSpeed)} km/h
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Pressure:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {Math.round(current.pressure)} hPa
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Temperature:</span>
                    <span className="font-medium text-gray-400">Loading...</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Humidity:</span>
                    <span className="font-medium text-gray-400">Loading...</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Wind:</span>
                    <span className="font-medium text-gray-400">Loading...</span>
                  </div>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {current ? `Updated: ${new Date(weatherData.lastUpdated).toLocaleTimeString()}` : 'Loading weather data...'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {state.locations.length > 1 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Comparison Insights
          </h3>
          <div className="text-center py-8">
            <div className="text-3xl mb-2">📊</div>
            <p className="text-gray-500 dark:text-gray-400">
              Weather comparison insights will appear here once data is loaded
            </p>
          </div>
        </div>
      )}
    </div>
  );
};