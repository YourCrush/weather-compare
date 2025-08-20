import React from 'react';
import { Location, WeatherData } from '../../types';
import { useSettings } from '../../context';

interface SeasonalComparisonProps {
  locationsWithData: Array<{ location: Location; data: WeatherData }>;
}

export const SeasonalComparison: React.FC<SeasonalComparisonProps> = ({
  locationsWithData,
}) => {
  const { formatTemperature } = useSettings();

  // Get current month and same month last year
  const getCurrentMonthComparison = (data: WeatherData) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastYear = currentYear - 1;

    // Find current month data from historical records
    const currentMonthThisYear = data.historical.monthly.find(month => {
      const monthDate = new Date(month.month);
      return monthDate.getMonth() === currentMonth && monthDate.getFullYear() === currentYear;
    });

    const currentMonthLastYear = data.historical.monthly.find(month => {
      const monthDate = new Date(month.month);
      return monthDate.getMonth() === currentMonth && monthDate.getFullYear() === lastYear;
    });

    return {
      thisYear: currentMonthThisYear,
      lastYear: currentMonthLastYear,
      monthName: now.toLocaleDateString('en-US', { month: 'long' }),
    };
  };

  const getSeasonalInsight = (thisYear: number, lastYear: number) => {
    const diff = thisYear - lastYear;
    const absDiff = Math.abs(diff);
    
    if (absDiff < 1) {
      return { message: 'Similar to last year', severity: 'low', color: 'text-gray-600 dark:text-gray-400' };
    } else if (absDiff < 3) {
      return { 
        message: `${diff > 0 ? 'Warmer' : 'Cooler'} than last year`, 
        severity: 'medium',
        color: diff > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'
      };
    } else {
      return { 
        message: `Much ${diff > 0 ? 'warmer' : 'cooler'} than last year`, 
        severity: 'high',
        color: diff > 0 ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'
      };
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
        <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        This Month vs Last Year
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locationsWithData.map(({ location, data }) => {
          const comparison = getCurrentMonthComparison(data);
          
          if (!comparison.thisYear || !comparison.lastYear) {
            return (
              <div key={location.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {location.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Insufficient historical data for comparison
                </p>
              </div>
            );
          }

          const thisYearTemp = formatTemperature(comparison.thisYear.tempMean);
          const lastYearTemp = formatTemperature(comparison.lastYear.tempMean);
          const insight = getSeasonalInsight(comparison.thisYear.tempMean, comparison.lastYear.tempMean);

          return (
            <div key={location.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                {location.name}
              </h3>

              <div className="space-y-4">
                {/* Temperature comparison */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {comparison.monthName} Temperature
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {thisYearTemp.value}{thisYearTemp.unit}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        This year
                      </div>
                    </div>
                    
                    <div className="flex-1 mx-4">
                      <div className="flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-600 dark:text-gray-400">
                        {lastYearTemp.value}{lastYearTemp.unit}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Last year
                      </div>
                    </div>
                  </div>
                </div>

                {/* Insight */}
                <div className={`text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800`}>
                  <p className={`text-sm font-medium ${insight.color}`}>
                    {insight.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {Math.abs(comparison.thisYear.tempMean - comparison.lastYear.tempMean).toFixed(1)}° difference
                  </p>
                </div>

                {/* Additional metrics */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {Math.round(comparison.thisYear.precipitationTotal)}mm
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">Precipitation</div>
                  </div>
                  
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {comparison.thisYear.precipitationDays}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">Rainy days</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary insights */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          Seasonal Insights
        </h3>
        <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <p>• Comparing current month with the same month from last year</p>
          <p>• Temperature differences help identify seasonal variations</p>
          <p>• Precipitation patterns show changing weather trends</p>
        </div>
      </div>
    </div>
  );
};