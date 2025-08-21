import React from 'react';
import { useAppContext } from '../../context';
import { ComparisonSummary } from '../Summary/ComparisonSummary';

export const SummaryView: React.FC = () => {
  const { state } = useAppContext();

  if (state.locations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="card p-8 max-w-md mx-auto">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Locations Added
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Add locations using the sidebar to start comparing weather conditions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Weather Summary
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Compare weather conditions across your selected locations
        </p>
      </div>

      <ComparisonSummary />
    </div>
  );
};