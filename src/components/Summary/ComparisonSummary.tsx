import React, { useState } from 'react';
import { useAppContext } from '../../context';
import { formatTemperature, formatSpeed, formatPressure } from '../../utils/units';
import { ComparisonChart } from '../Charts/ComparisonChart';

interface ComparisonSummaryProps {
  viewMode?: 'current' | 'historical' | 'average';
  selectedDate?: string;
}

export const ComparisonSummary: React.FC<ComparisonSummaryProps> = ({ 
  viewMode = 'current', 
  selectedDate = new Date().toISOString().split('T')[0] 
}) => {
  const { state } = useAppContext();
  const units = state.settings.units;
  const [viewMode, setViewMode] = useState<'insights' | 'chart'>('insights');



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
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {location.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date().toLocaleTimeString('en-US', {
                      timeZone: weatherData?.weekly?.timezone || 'UTC',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })} local time
                  </p>
                </div>
                <div className="text-2xl">🌤️</div>
              </div>
              
              {current ? (
                <div className="space-y-3">
                  {/* Current Temperature with High/Low */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Temperature:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatTemperature(current.temperature, units)}
                      </span>
                    </div>
                    {weatherData?.weekly?.daily?.[0] && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-500">High / Low:</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {formatTemperature(weatherData.weekly.daily[0].tempMax, units)} / {formatTemperature(weatherData.weekly.daily[0].tempMin, units)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Feels like:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatTemperature(current.feelsLike, units)}
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
                      {formatSpeed(current.windSpeed, units)}
                    </span>
                  </div>
                  
                  {/* Rain Information */}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Rain chance:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {current.precipitation.probability}%
                    </span>
                  </div>
                  
                  {current.precipitation.probability > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-500">Rain today:</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {current.precipitation.total24h > 0 
                          ? `${current.precipitation.total24h.toFixed(1)}mm` 
                          : 'None yet'
                        }
                      </span>
                    </div>
                  )}
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

      {state.locations.length > 1 && (() => {
        // Get all locations with weather data
        const locationsWithData = state.locations
          .map(location => ({
            location,
            weather: state.weatherData.get(location.id)?.current
          }))
          .filter(item => item.weather);

        if (locationsWithData.length < 2) {
          return (
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
          );
        }

        // Calculate comparisons
        const temperatures = locationsWithData.map(item => ({ 
          name: item.location.name, 
          value: item.weather!.temperature 
        }));
        const humidity = locationsWithData.map(item => ({ 
          name: item.location.name, 
          value: item.weather!.humidity 
        }));
        const windSpeeds = locationsWithData.map(item => ({ 
          name: item.location.name, 
          value: item.weather!.windSpeed 
        }));
        const rainChances = locationsWithData.map(item => ({ 
          name: item.location.name, 
          value: item.weather!.precipitation.probability 
        }));

        const hottest = temperatures.reduce((max, curr) => curr.value > max.value ? curr : max);
        const coldest = temperatures.reduce((min, curr) => curr.value < min.value ? curr : min);
        const mostHumid = humidity.reduce((max, curr) => curr.value > max.value ? curr : max);
        const windiest = windSpeeds.reduce((max, curr) => curr.value > max.value ? curr : max);
        const mostLikelyRain = rainChances.reduce((max, curr) => curr.value > max.value ? curr : max);
        const leastLikelyRain = rainChances.reduce((min, curr) => curr.value < min.value ? curr : min);

        // Prepare chart data
        const chartData = locationsWithData.map(item => ({
          name: item.location.name,
          temperature: item.weather!.temperature,
          humidity: item.weather!.humidity,
          windSpeed: item.weather!.windSpeed,
          rainChance: item.weather!.precipitation.probability,
        }));

        return (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Comparison Insights
              </h3>
              
              {/* View Toggle */}
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('insights')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'insights'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <span>📊</span>
                    <span>Cards</span>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('chart')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'chart'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <span>📈</span>
                    <span>Chart</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Render based on view mode */}
            {viewMode === 'insights' ? (
              <div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">🌡️</span>
                  <span className="font-medium text-red-700 dark:text-red-300">Hottest</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{hottest.name}</p>
                <p className="text-lg font-semibold text-red-800 dark:text-red-200">
                  {formatTemperature(hottest.value, units)}
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">❄️</span>
                  <span className="font-medium text-blue-700 dark:text-blue-300">Coldest</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{coldest.name}</p>
                <p className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                  {formatTemperature(coldest.value, units)}
                </p>
              </div>

              <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">💧</span>
                  <span className="font-medium text-cyan-700 dark:text-cyan-300">Most Humid</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{mostHumid.name}</p>
                <p className="text-lg font-semibold text-cyan-800 dark:text-cyan-200">
                  {mostHumid.value}%
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">🌬️</span>
                  <span className="font-medium text-yellow-700 dark:text-yellow-300">Windiest</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{windiest.name}</p>
                <p className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                  {formatSpeed(windiest.value, units)}
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">🌧️</span>
                  <span className="font-medium text-purple-700 dark:text-purple-300">Most Likely Rain</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{mostLikelyRain.name}</p>
                <p className="text-lg font-semibold text-purple-800 dark:text-purple-200">
                  {mostLikelyRain.value}%
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-2xl">☀️</span>
                  <span className="font-medium text-green-700 dark:text-green-300">Least Likely Rain</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{leastLikelyRain.name}</p>
                <p className="text-lg font-semibold text-green-800 dark:text-green-200">
                  {leastLikelyRain.value}%
                </p>
              </div>
            </div>

                {/* Temperature difference insight */}
                {hottest.value !== coldest.value && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xl">🌡️</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Temperature Range</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      There's a {formatTemperature(Math.abs(hottest.value - coldest.value), units).replace(/[°CF]/g, '°')} difference between the hottest and coldest locations.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <ComparisonChart data={chartData} units={units} />
            )}
          </div>
        );
      })()}
    </div>
  );
};