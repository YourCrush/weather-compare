import React, { useState } from 'react';
import { useAppContext, useSettings } from '../../context';
import { Location } from '../../types';

interface FavoritesQuickSelectProps {
  className?: string;
  compact?: boolean;
}

export const FavoritesQuickSelect: React.FC<FavoritesQuickSelectProps> = ({
  className = '',
  compact = false,
}) => {
  const { state, addLocation } = useAppContext();
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  const handleAddToComparison = (location: Location) => {
    // Check if location is already in comparison
    const isAlreadyAdded = state.locations.some(loc => loc.id === location.id);
    
    if (!isAlreadyAdded) {
      // Check if we're at the limit
      if (state.locations.length >= 3) {
        // Could show a toast or modal here
        alert('Maximum of 3 locations can be compared at once. Remove a location first.');
        return;
      }
      
      addLocation(location);
    }
    
    setIsOpen(false);
  };

  const availableFavorites = settings.favorites.filter(
    favorite => !state.locations.some(loc => loc.id === favorite.id)
  );

  if (settings.favorites.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center space-x-2 px-3 py-2 text-sm font-medium 
          text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 
          hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200
          ${compact ? 'px-2 py-1' : ''}
        `}
        aria-label="Quick select from favorites"
        title="Quick select from favorites"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        {!compact && (
          <>
            <span className="hidden sm:inline">Quick Add</span>
            {availableFavorites.length > 0 && (
              <span className="bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs px-2 py-1 rounded-full">
                {availableFavorites.length}
              </span>
            )}
          </>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Quick Add Favorites
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  aria-label="Close quick select"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {availableFavorites.length === 0 ? (
                <div className="text-center py-6">
                  <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    All favorites are already in comparison
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableFavorites.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => handleAddToComparison(location)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 text-left"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {location.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {location.region && `${location.region}, `}{location.country}
                          </p>
                        </div>
                      </div>

                      <svg className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}

              {availableFavorites.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Click to add to comparison ({state.locations.length}/3 locations)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  );
};