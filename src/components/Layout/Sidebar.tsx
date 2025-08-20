import React from 'react';
import { useAppContext } from '../../context';
import { LocationManager } from '../LocationManager';
import { LocationList } from '../LocationList';
import { useLocationManager } from '../../hooks/useLocationManager';

export const Sidebar: React.FC = () => {
  const { state, toggleSidebar } = useAppContext();
  const {
    locations,
    addLocation,
    removeLocation,
    reorderLocations,
    error,
    clearError,
  } = useLocationManager({
    maxLocations: 3,
    autoDetectOnMount: true,
    persistLocations: true,
  });

  const handleLocationError = (error: any) => {
    console.error('Location error:', error);
  };

  return (
    <>
      {/* Mobile overlay */}
      {state.ui.sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:static inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out
          ${state.ui.sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 md:hidden">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Locations
            </h2>
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Location Manager */}
            <LocationManager
              onLocationSelected={addLocation}
              onLocationError={handleLocationError}
              maxLocations={3}
              currentLocations={locations}
            />

            {/* Location List */}
            {locations.length > 0 && (
              <LocationList
                locations={locations}
                onRemoveLocation={removeLocation}
                onReorderLocations={reorderLocations}
                showReorder={true}
              />
            )}

            {/* Error display */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {error.message}
                    </p>
                    <button
                      onClick={clearError}
                      className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};