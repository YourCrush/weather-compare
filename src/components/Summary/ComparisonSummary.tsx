import React from 'react';
import { useWeatherComparison, useSettings } from '../../context';
import { DifferenceCalculator } from '../../utils/weatherComparison';

export const ComparisonSummary: React.FC = () => {
  const { locationsWithData, insights, extremes, isLoading } = useWeatherComparison();
  const { formatTemperature, formatSpeed, formatPressure } = useSettings();

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            Analyzing weather patterns...
          </span>
        </div>
      </div>
    );
  }

  if (locationsWithData.length < 2) {
    return (
      <div className="card p-6">
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Add More Locations
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Add at least 2 locations to see weather comparisons and insights.
          </p>
        </div>
      </div>
    );
  }

  // Generate detailed comparisons
  const comparisons = [];
  for (let i = 0; i < locationsWithData.length - 1; i++) {
    for (let j = i + 1; j < locationsWithData.length; j++) {
      const comp1 = locationsWithData[i];
      const comp2 = locationsWithData[j];
      
      const comparison = DifferenceCalculator.calculateDifferences(
        comp1.location,
        comp1.data!.current,
        comp2.location,
        comp2.data!.current
      );
      
      comparisons.push(comparison);
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick insights */}
      {insights.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Key Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.slice(0, 6).map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'temperature' ? 'bg-red-50 dark:bg-red-900/20 border-red-400' :
                  insight.type === 'humidity' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400' :
                  insight.type === 'wind' ? 'bg-green-50 dark:bg-green-900/20 border-green-400' :
                  'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400'
                }`}
              >
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {insight.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed comparisons */}
      {comparisons.map((comparison, index) => (
        <div key={index} className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            {comparison.location1.name} vs {comparison.location2.name}
          </h3>
          
          {comparison.differences.length > 0 ? (
            <div className="space-y-3">
              {comparison.differences.map((diff, diffIndex) => (
                <div
                  key={diffIndex}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    diff.severity === 'high' ? 'bg-red-50 dark:bg-red-900/20' :
                    diff.severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                    'bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      diff.severity === 'high' ? 'bg-red-500' :
                      diff.severity === 'medium' ? 'bg-yellow-500' :
                      'bg-gray-400'
                    }`} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {diff.description}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {diff.value > 0 ? '+' : ''}{Math.abs(diff.value).toFixed(1)}{diff.unit}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              Weather conditions are very similar between these locations.
            </p>
          )}
        </div>
      ))}

      {/* Weather conditions overview */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          Current Conditions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locationsWithData.map(({ location, data }) => {
            const temp = formatTemperature(data!.current.temperature);
            const feelsLike = formatTemperature(data!.current.feelsLike);
            const wind = formatSpeed(data!.current.windSpeed);
            const pressure = formatPressure(data!.current.pressure);
            const comfort = DifferenceCalculator.getComfortLevel(
              data!.current.temperature,
              data!.current.humidity
            );
            const condition = DifferenceCalculator.getWeatherDescription(data!.current.weatherCode);

            return (
              <div key={location.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                  {location.name}
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Temperature:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {temp.value}{temp.unit}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Feels like:</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {feelsLike.value}{feelsLike.unit}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Humidity:</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {data!.current.humidity}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Wind:</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {wind.value} {wind.unit}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Pressure:</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {pressure.value} {pressure.unit}
                    </span>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 dark:text-gray-400">Conditions:</span>
                      <span className="text-gray-700 dark:text-gray-300 text-xs">
                        {condition}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-gray-500 dark:text-gray-400">Comfort:</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        comfort.level === 'comfortable' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
                        comfort.level === 'mild' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' :
                        'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      }`}>
                        {comfort.description}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};