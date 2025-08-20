import React from 'react';

export const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        {/* Weather icon */}
        <div className="mx-auto w-24 h-24 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Compare Weather Across Cities
        </h2>
        
        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          Get started by adding your first location using the sidebar. You can compare weather conditions, 
          forecasts, and historical data for up to 3 cities side-by-side.
        </p>
        
        {/* Features list */}
        <div className="text-left space-y-3 mb-8">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Current weather conditions and forecasts
          </div>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            24 months of historical weather data
          </div>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Interactive charts and visualizations
          </div>
          
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Export and share your comparisons
          </div>
        </div>
        
        {/* Call to action */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>
            👈 Use the sidebar to add your first location
          </p>
        </div>
      </div>
    </div>
  );
};