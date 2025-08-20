import React, { useState, useEffect, useCallback } from 'react';
import { Location } from '../types';
import { geolocationService } from '../services/geolocation';
import { weatherService } from '../services/weather-api';
import { LocationError } from '../types/errors';
import { LocationSearch } from './LocationSearch';
import { LocationPermissionPrompt } from './LocationPermissionPrompt';

interface LocationManagerProps {
  onLocationSelected: (location: Location) => void;
  onLocationError: (error: LocationError) => void;
  maxLocations?: number;
  currentLocations?: Location[];
  className?: string;
}

export const LocationManager: React.FC<LocationManagerProps> = ({
  onLocationSelected,
  onLocationError,
  maxLocations = 3,
  currentLocations = [],
  className = '',
}) => {
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationMethod, setLocationMethod] = useState<'none' | 'geolocation' | 'ip' | 'manual'>('none');
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [geolocationSupport, setGeolocationSupport] = useState<{
    supported: boolean;
    permission?: PermissionState;
  }>({ supported: false });

  // Check geolocation support on mount
  useEffect(() => {
    const checkSupport = async () => {
      const support = await geolocationService.checkGeolocationSupport();
      setGeolocationSupport(support);
      
      if (support.permission === 'denied') {
        setShowPermissionPrompt(true);
      }
    };
    
    checkSupport();
  }, []);

  const detectCurrentLocation = useCallback(async () => {
    if (isDetectingLocation) return;
    
    setIsDetectingLocation(true);
    
    try {
      const result = await geolocationService.getLocationWithFallback();
      setLocationMethod(result.method);
      
      if (result.location) {
        onLocationSelected(result.location);
      } else if (result.method === 'manual') {
        // Show manual search interface
        setLocationMethod('manual');
      }
    } catch (error) {
      const locationError = error instanceof LocationError 
        ? error 
        : new LocationError('Failed to detect location', 'DETECTION_FAILED');
      
      onLocationError(locationError);
      setLocationMethod('manual');
    } finally {
      setIsDetectingLocation(false);
    }
  }, [isDetectingLocation, onLocationSelected, onLocationError]);

  const handleLocationSearch = useCallback((location: Location) => {
    if (currentLocations.length >= maxLocations) {
      onLocationError(new LocationError(
        `Maximum of ${maxLocations} locations allowed`,
        'MAX_LOCATIONS_EXCEEDED'
      ));
      return;
    }
    
    // Check for duplicates
    const isDuplicate = currentLocations.some(
      existing => existing.id === location.id ||
      (Math.abs(existing.latitude - location.latitude) < 0.01 &&
       Math.abs(existing.longitude - location.longitude) < 0.01)
    );
    
    if (isDuplicate) {
      onLocationError(new LocationError(
        'This location is already added',
        'DUPLICATE_LOCATION'
      ));
      return;
    }
    
    onLocationSelected(location);
  }, [currentLocations, maxLocations, onLocationSelected, onLocationError]);

  const canAddMoreLocations = currentLocations.length < maxLocations;

  return (
    <div className={`location-manager ${className}`}>
      {/* Permission prompt for denied geolocation */}
      {showPermissionPrompt && geolocationSupport.permission === 'denied' && (
        <LocationPermissionPrompt
          onDismiss={() => setShowPermissionPrompt(false)}
          onManualSearch={() => {
            setShowPermissionPrompt(false);
            setLocationMethod('manual');
          }}
        />
      )}

      {/* Current location detection */}
      {currentLocations.length === 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
            Get Started
          </h3>
          
          {geolocationSupport.supported && geolocationSupport.permission !== 'denied' && (
            <button
              onClick={detectCurrentLocation}
              disabled={isDetectingLocation}
              className="btn-primary mr-3 mb-3"
              aria-label="Detect current location automatically"
            >
              {isDetectingLocation ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Detecting Location...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Use Current Location
                </>
              )}
            </button>
          )}
          
          <button
            onClick={() => setLocationMethod('manual')}
            className="btn-secondary mb-3"
            aria-label="Search for a location manually"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search Location
          </button>
          
          {locationMethod !== 'none' && locationMethod !== 'manual' && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {locationMethod === 'geolocation' && 'Using your device location'}
                {locationMethod === 'ip' && 'Using approximate location based on your internet connection'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add more locations */}
      {canAddMoreLocations && (locationMethod === 'manual' || currentLocations.length > 0) && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
            {currentLocations.length === 0 ? 'Search for a Location' : 'Add Another Location'}
          </h3>
          
          <LocationSearch
            onLocationSelected={handleLocationSearch}
            placeholder={currentLocations.length === 0 
              ? "Search for a city..." 
              : "Add another city to compare..."
            }
            maxResults={8}
          />
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {currentLocations.length} of {maxLocations} locations added
          </p>
        </div>
      )}

      {/* Location limit reached */}
      {!canAddMoreLocations && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Maximum of {maxLocations} locations reached. Remove a location to add a new one.
          </p>
        </div>
      )}
    </div>
  );
};