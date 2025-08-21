import React from 'react';
import { useAppContext } from '../../context';

export const SeasonalView: React.FC = () => {
  const { state } = useAppContext();

  if (state.locations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="card p-8 max-w-md mx-auto">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 2m8-2l2 2m-2 4h.01M12 19l-3-3h2l1 1 1-1h2l-3 3z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Seasonal View
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Add locations to see seasonal weather patterns and historical trends.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Seasonal Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Historical weather patterns and seasonal trends
        </p>
      </div>

      <div className="grid gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Year-over-Year Comparison
          </h3>
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📈</div>
            <p className="text-gray-500 dark:text-gray-400">
              Seasonal data will appear here once weather information is loaded
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};