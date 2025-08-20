import React, { useState } from 'react';
import { useSettings } from '../../context';
import { Units, Theme, ViewMode } from '../../types';

export const SettingsPanel: React.FC = () => {
  const {
    settings,
    setTheme,
    setUnits,
    setDefaultView,
    updateChartSettings,
    setAutoRefresh,
    setRefreshInterval,
    resetSettings,
  } = useSettings();

  const [isOpen, setIsOpen] = useState(false);

  const unitOptions: Array<{ value: Units; label: string; description: string }> = [
    { value: 'metric', label: 'Metric', description: 'Celsius, km/h, mm, hPa' },
    { value: 'imperial', label: 'Imperial', description: 'Fahrenheit, mph, inches, inHg' },
  ];

  const themeOptions: Array<{ value: Theme; label: string; description: string }> = [
    { value: 'light', label: 'Light', description: 'Always use light theme' },
    { value: 'dark', label: 'Dark', description: 'Always use dark theme' },
    { value: 'system', label: 'System', description: 'Follow system preference' },
  ];

  const viewOptions: Array<{ value: ViewMode; label: string; description: string }> = [
    { value: 'summary', label: 'Summary', description: 'Weather insights and comparisons' },
    { value: 'cards', label: 'Cards', description: 'Detailed weather cards' },
    { value: 'charts', label: 'Charts', description: 'Interactive data visualizations' },
    { value: 'seasonal', label: 'Seasonal', description: 'Year-over-year comparisons' },
  ];

  const refreshIntervalOptions = [
    { value: 5, label: '5 minutes' },
    { value: 10, label: '10 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
  ];

  const SettingsButton: React.FC = () => (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
      aria-label="Open settings"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>
  );

  if (!isOpen) {
    return <SettingsButton />;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50"
        onClick={() => setIsOpen(false)}
      />

      {/* Settings panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-96 bg-white dark:bg-gray-800 shadow-xl overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Settings
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-8">
            {/* Units */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Units
              </h3>
              <div className="space-y-3">
                {unitOptions.map((option) => (
                  <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="units"
                      value={option.value}
                      checked={settings.units === option.value}
                      onChange={() => setUnits(option.value)}
                      className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {option.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Theme
              </h3>
              <div className="space-y-3">
                {themeOptions.map((option) => (
                  <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="theme"
                      value={option.value}
                      checked={settings.theme === option.value}
                      onChange={() => setTheme(option.value)}
                      className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {option.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Default View */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Default View
              </h3>
              <div className="space-y-3">
                {viewOptions.map((option) => (
                  <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="defaultView"
                      value={option.value}
                      checked={settings.defaultView === option.value}
                      onChange={() => setDefaultView(option.value)}
                      className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {option.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Chart Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Chart Preferences
              </h3>
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.chartSettings.showGrid}
                    onChange={(e) => updateChartSettings({ showGrid: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Show Grid Lines
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Display background grid in charts
                    </div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.chartSettings.showLegend}
                    onChange={(e) => updateChartSettings({ showLegend: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Show Legend
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Display chart legend with location names
                    </div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.chartSettings.animationEnabled}
                    onChange={(e) => updateChartSettings({ animationEnabled: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Enable Animations
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Smooth transitions and chart animations
                    </div>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.chartSettings.sharedYAxis}
                    onChange={(e) => updateChartSettings({ sharedYAxis: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Shared Y-Axis Scale
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Use same scale for easier comparison
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Auto Refresh */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Auto Refresh
              </h3>
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Enable Auto Refresh
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Automatically update weather data
                    </div>
                  </div>
                </label>

                {settings.autoRefresh && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Refresh Interval
                    </label>
                    <select
                      value={settings.refreshInterval}
                      onChange={(e) => setRefreshInterval(Number(e.target.value))}
                      className="input-field"
                    >
                      {refreshIntervalOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Reset Settings */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => {
                  if (confirm('Reset all settings to default values?')) {
                    resetSettings();
                  }
                }}
                className="w-full btn-secondary text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};