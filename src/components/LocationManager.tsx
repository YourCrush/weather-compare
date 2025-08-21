import React, { useState } from 'react';
import { useAppContext } from '../context';
import { LocationList } from './LocationList';

export const LocationManager: React.FC = () => {
  const { state, addLocation, removeLocation } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleAddLocation = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // For now, create a mock location
      const mockLocation = {
        id: Date.now().toString(),
        name: searchQuery,
        country: 'Unknown',
        latitude: 0,
        longitude: 0,
        timezone: 'UTC',
        region: undefined,
      };

      addLocation(mockLocation);
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to add location:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddLocation();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Add Locations
        </h2>
        
        <div className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter city name..."
              className="input flex-1"
              disabled={isSearching || state.locations.length >= 3}
            />
            <button
              onClick={handleAddLocation}
              disabled={!searchQuery.trim() || isSearching || state.locations.length >= 3}
              className="btn-primary"
            >
              {isSearching ? 'Adding...' : 'Add'}
            </button>
          </div>
          
          {state.locations.length >= 3 && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Maximum of 3 locations can be compared at once.
            </p>
          )}
        </div>
      </div>

      {state.locations.length > 0 && (
        <LocationList
          locations={state.locations}
          onRemoveLocation={removeLocation}
        />
      )}
    </div>
  );
};