import React from 'react';
import { useWeatherComparison, useSettings } from '../../context';
import { SeasonalComparison } from './SeasonalComparison';
import { YearOverYearChart } from './YearOverYearChart';
import { SeasonalTrends } from './SeasonalTrends';

export const SeasonalOutlook: React.FC = () => {
  const { locationsWithData, isLoading } = useWeatherComparison();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading seasonal data...</span>
      </div>
    );
  }

  if (locationsWithData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="card p-8 max-w-md mx-auto">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Seasonal Data
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Add locations to see seasonal weather patterns and year-over-year comparisons.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Seasonal Outlook
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Comparing current patterns with historical data
        </div>
      </div>

      {/* Current vs Last Year Comparison */}
      <SeasonalComparison locationsWithData={locationsWithData} />

      {/* Year-over-Year Chart */}
      <YearOverYearChart locationsWithData={locationsWithData} />

      {/* Seasonal Trends Analysis */}
      <SeasonalTrends locationsWithData={locationsWithData} />
    </div>
  );
};