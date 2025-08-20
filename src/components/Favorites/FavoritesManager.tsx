import React, { useState } from 'react';
import { useAppContext, useSettings } from '../../context';
import { Location } from '../../types';
import { FavoritesValidator } from '../../utils/favoritesValidation';

export const FavoritesManager: React.FC = () => {
  const { state, addLocation } = useAppContext();
  const { settings, addFavorite, removeFavorite } = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  const handleAddToComparison = (location: Location) => {
    // Check if location is already in comparison
    const isAlreadyAdded = state.locations.some(loc => loc.id === location.id);
    
    if (isAlreadyAdded) {
      alert('This location is already in the comparison.');
      return;
    }
    
    // Check if we're at the limit
    if (state.locations.length >= 3) {
      alert('Maximum of 3 locations can be compared at once. Remove a location first.');
      return;
    }
    
    addLocation(location);
    setIsOpen(false);
  };

  const handleRemoveFavorite = (locationId: string) => {
    if (confirm('Remove this location from favorites?')) {
      removeFavorite(locationId);
    }
  };

  const FavoritesButton: React.FC = () => (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
      aria-label="Open favorites"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <span className="hidden sm:inline">Favorites</span>
      {settings.favorites.length > 0 && (
        <span className="bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs px-2 py-1 rounded-full">
          {settings.favorites.length}
        </span>
      )}
    </button>
  );

  if (!isOpen) {
    return <FavoritesButton />;
  }

  return (
    <div className="relative">
      <FavoritesButton />
      
      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Favorite Locations
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              aria-label="Close favorites"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {settings.favorites.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No favorite locations yet
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                Add locations to your comparison to save them as favorites
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {settings.favorites.map((location) => (
                <div
                  key={location.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
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
                  </div>

                  <div className="flex items-center space-x-2 ml-3">
                    <button
                      onClick={() => handleAddToComparison(location)}
                      className="p-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                      aria-label={`Add ${location.name} to comparison`}
                      title="Add to comparison"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>

                    <button
                      onClick={() => handleRemoveFavorite(location.id)}
                      className="p-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      aria-label={`Remove ${location.name} from favorites`}
                      title="Remove from favorites"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {settings.favorites.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span>Click + to add to comparison, or 🗑️ to remove from favorites</span>
                <span>{settings.favorites.length}/{FavoritesValidator.getMaxFavorites()}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};