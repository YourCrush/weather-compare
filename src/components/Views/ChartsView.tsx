import React from 'react';
import { useAppContext } from '../../context';

export const ChartsView: React.FC = () => {
  const { state } = useAppContext();

  if (state.locations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="card p-8 max-w-md mx-auto">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Charts View
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Add locations to see interactive weather charts and comparisons.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Weather Charts
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Interactive visualizations and weather trends
        </p>
      </div>

      <div className="grid gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Temperature Comparison
          </h3>
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-500 dark:text-gray-400">
              Charts will appear here once weather data is loaded
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};