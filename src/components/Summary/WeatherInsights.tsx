import React from 'react';
import { useWeatherComparison, useSettings } from '../../context';

export const WeatherInsights: React.FC = () => {
  const { extremes, locationsWithData } = useWeatherComparison();
  const { formatTemperature, formatSpeed, formatPressure } = useSettings();

  if (!extremes || locationsWithData.length < 2) {
    return null;
  }

  const insights = [
    {
      title: 'Temperature Range',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l3-3 3 3v13a7 7 0 11-6 0z" />
        </svg>
      ),
      data: [
        {
          label: 'Hottest',
          value: `${extremes.hottest.temperature.value}${extremes.hottest.temperature.unit}`,
          location: extremes.hottest.location.name,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
        },
        {
          label: 'Coldest',
          value: `${extremes.coldest.temperature.value}${extremes.coldest.temperature.unit}`,
          location: extremes.coldest.location.name,
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        },
      ],
    },
    {
      title: 'Humidity Levels',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      ),
      data: [
        {
          label: 'Most Humid',
          value: `${extremes.mostHumid.humidity}%`,
          location: extremes.mostHumid.location.name,
          color: 'text-cyan-600 dark:text-cyan-400',
          bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
        },
        {
          label: 'Least Humid',
          value: `${extremes.leastHumid.humidity}%`,
          location: extremes.leastHumid.location.name,
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        },
      ],
    },
    {
      title: 'Wind Conditions',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h1m4 0h1M9 6h1m4 0h1" />
        </svg>
      ),
      data: [
        {
          label: 'Windiest',
          value: `${extremes.windiest.windSpeed.value} ${extremes.windiest.windSpeed.unit}`,
          location: extremes.windiest.location.name,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
        },
        {
          label: 'Calmest',
          value: `${extremes.calmest.windSpeed.value} ${extremes.calmest.windSpeed.unit}`,
          location: extremes.calmest.location.name,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-800',
        },
      ],
    },
  ];

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
        <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Weather Extremes
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {insights.map((insight, index) => (
          <div key={index} className="space-y-4">
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              {insight.icon}
              <h3 className="font-medium">{insight.title}</h3>
            </div>
            
            <div className="space-y-3">
              {insight.data.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className={`${item.bgColor} rounded-lg p-4 border border-gray-200 dark:border-gray-600`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {item.label}
                    </span>
                    <span className={`text-lg font-bold ${item.color}`}>
                      {item.value}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {item.location}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Additional insights */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
        <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">
          Quick Facts
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {locationsWithData.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Locations
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {Math.abs(extremes.hottest.temperature.value - extremes.coldest.temperature.value)}°
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Temp Range
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {Math.abs(extremes.mostHumid.humidity - extremes.leastHumid.humidity)}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Humidity Range
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {Math.abs(extremes.windiest.windSpeed.value - extremes.calmest.windSpeed.value)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Wind Range
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};