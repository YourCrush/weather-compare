import React, { useState } from 'react';
import { useAppContext } from '../../context';
import { ComparisonSummary } from '../Summary/ComparisonSummary';

export const SummaryView: React.FC = () => {
  const { state } = useAppContext();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'current' | 'historical' | 'average'>('current');

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Weather Summary
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Compare weather conditions across your selected locations
          </p>
        </div>

        {/* Historical Data Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('current')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'current'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Current
            </button>
            <button
              onClick={() => setViewMode('historical')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'historical'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              Historical
            </button>
            <button
              onClick={() => setViewMode('average')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'average'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              7-Day Avg
            </button>
          </div>

          {/* Date Picker (only show for historical mode) */}
          {viewMode === 'historical' && (
            <div className="flex items-center space-x-2">
              <label htmlFor="date-picker" className="text-sm text-gray-600 dark:text-gray-400">
                Date:
              </label>
              <input
                id="date-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>
      </div>

      <ComparisonSummary viewMode={viewMode} selectedDate={selectedDate} />
    </div>
  );
};