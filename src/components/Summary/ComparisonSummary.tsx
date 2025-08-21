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
        {state.locations.map((location) => (
          <div key={location.id} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {location.name}
              </h3>
              <div className="text-2xl">🌤️</div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Temperature:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">--°</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Humidity:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">--%</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Wind:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">-- km/h</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Weather data will load here
              </p>
            </div>
          </div>
        ))}
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