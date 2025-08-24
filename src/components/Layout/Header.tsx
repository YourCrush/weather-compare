import React from 'react';
import { useAppContext } from '../../context';

export const Header: React.FC = () => {
  const { state, toggleSidebar, setUnits } = useAppContext();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Weather Compare
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {state.locations.length}/3 locations
          </span>
          
          {/* Unit Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Units:</span>
            <button
              onClick={() => setUnits(state.settings.units === 'metric' ? 'imperial' : 'metric')}
              className="flex items-center space-x-1 px-2 py-1 text-sm rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={`Switch to ${state.settings.units === 'metric' ? 'Imperial' : 'Metric'} units`}
            >
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {state.settings.units === 'metric' ? 'Metric' : 'Imperial'}
              </span>
              <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};