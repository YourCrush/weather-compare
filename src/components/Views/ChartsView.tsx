import React, { useState } from 'react';
import { useWeatherComparison, useSettings } from '../../context';
import { TemperatureChart, PrecipitationChart, WindChart, HistoricalChart, ChartControls } from '../Charts';
import { ChartDataTransformer } from '../../utils/chartData';

export const ChartsView: React.FC = () => {
  const { locationsWithData, isLoading } = useWeatherComparison();
  const { settings, updateChartSettings } = useSettings();
  
  const [activeChart, setActiveChart] = useState<'temperature' | 'precipitation' | 'wind' | 'historical'>('temperature');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading chart data...</span>
      </div>
    );
  }

  if (locationsWithData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="card p-8 max-w-md mx-auto">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No Chart Data
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Add locations to see interactive charts comparing weather data across cities.
          </p>
        </div>
      </div>
    );
  }

  // Transform data for charts
  const temperatureData = ChartDataTransformer.transformTemperatureData(locationsWithData);
  const precipitationData = ChartDataTransformer.transformPrecipitationData(locationsWithData);
  const windData = ChartDataTransformer.transformWindData(locationsWithData);
  const historicalData = ChartDataTransformer.transformHistoricalData(locationsWithData);
  
  const locationNames = locationsWithData.map(({ location }) => location.name);

  const chartTabs = [
    {
      key: 'temperature' as const,
      label: 'Temperature',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l3-3 3 3v13a7 7 0 11-6 0z" />
        </svg>
      ),
    },
    {
      key: 'precipitation' as const,
      label: 'Precipitation',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
    {
      key: 'wind' as const,
      label: 'Wind',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h1m4 0h1M9 6h1m4 0h1" />
        </svg>
      ),
    },
    {
      key: 'historical' as const,
      label: 'Historical',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  const renderChart = () => {
    const chartProps = {
      locations: locationNames,
      showGrid: settings.chartSettings.showGrid,
      showLegend: settings.chartSettings.showLegend,
      height: 400,
    };

    switch (activeChart) {
      case 'temperature':
        return <TemperatureChart data={temperatureData} {...chartProps} />;
      case 'precipitation':
        return <PrecipitationChart data={precipitationData} {...chartProps} />;
      case 'wind':
        return <WindChart data={windData} {...chartProps} />;
      case 'historical':
        return <HistoricalChart data={historicalData} {...chartProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Charts & Graphs
        </h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {locationsWithData.length} location{locationsWithData.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chart controls */}
        <div className="lg:col-span-1">
          <ChartControls
            sharedYAxis={settings.chartSettings.sharedYAxis}
            onToggleSharedYAxis={(shared) => updateChartSettings({ sharedYAxis: shared })}
            showGrid={settings.chartSettings.showGrid}
            onToggleGrid={(show) => updateChartSettings({ showGrid: show })}
            showLegend={settings.chartSettings.showLegend}
            onToggleLegend={(show) => updateChartSettings({ showLegend: show })}
            animationEnabled={settings.chartSettings.animationEnabled}
            onToggleAnimation={(enabled) => updateChartSettings({ animationEnabled: enabled })}
          />
        </div>

        {/* Chart area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Chart tabs */}
          <div className="card p-1">
            <div className="flex space-x-1" role="tablist">
              {chartTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveChart(tab.key)}
                  className={`
                    flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex-1 justify-center
                    ${
                      activeChart === tab.key
                        ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }
                  `}
                  role="tab"
                  aria-selected={activeChart === tab.key}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chart container */}
          <div className="card p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {chartTabs.find(tab => tab.key === activeChart)?.label} Comparison
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {activeChart === 'temperature' && 'Average daily temperatures across locations'}
                {activeChart === 'precipitation' && 'Daily precipitation amounts for each location'}
                {activeChart === 'wind' && 'Wind speed patterns across different cities'}
                {activeChart === 'historical' && '24-month temperature trends and patterns'}
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              {renderChart()}
            </div>
          </div>

          {/* Chart accessibility table */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Data Summary
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Current Temp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Humidity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Wind Speed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Precipitation
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {ChartDataTransformer.getCurrentConditionsSummary(locationsWithData).map((summary, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {summary.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {Math.round(summary.temperature)}°C
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {summary.humidity}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {Math.round(summary.windSpeed * 3.6)} km/h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {summary.precipitation.toFixed(1)}mm
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};