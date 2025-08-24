import React from 'react';
import { useAppContext } from '../context';
import { LocationList } from './LocationList';
import { LocationSearch } from './LocationSearch';
import { Location } from '../types';

export const LocationManager: React.FC = () => {
  const { state, addLocation, removeLocation } = useAppContext();

  const handleLocationSelected = (location: Location) => {
    if (state.locations.length >= 3) {
      return; // Don't add if already at max
    }
    addLocation(location);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Add Locations
        </h2>
        
        <div className="space-y-3">
          <LocationSearch
            onLocationSelected={handleLocationSelected}
            placeholder="Search for a city..."
            maxResults={5}
            className="w-full"
          />
          
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