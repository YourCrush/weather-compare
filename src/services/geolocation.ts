import { Location } from '../types';
import { LocationError } from '../types/errors';
import { weatherService } from './weather-api';

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface IPLocationResponse {
  ip: string;
  city: string;
  region: string;
  country: string;
  loc: string; // "lat,lon"
  timezone: string;
}

export class GeolocationService {
  private readonly ipLocationUrl = 'https://ipinfo.io/json';

  /**
   * Get user's current location using browser geolocation API
   */
  async getCurrentLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new LocationError('Geolocation is not supported by this browser', 'NOT_SUPPORTED'));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 5 * 60 * 1000, // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          let errorCode: string;
          let errorMessage: string;

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorCode = 'PERMISSION_DENIED';
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorCode = 'POSITION_UNAVAILABLE';
              errorMessage = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              errorCode = 'TIMEOUT';
              errorMessage = 'Location request timed out';
              break;
            default:
              errorCode = 'UNKNOWN_ERROR';
              errorMessage = 'An unknown error occurred while retrieving location';
              break;
          }

          reject(new LocationError(errorMessage, errorCode));
        },
        options
      );
    });
  }

  /**
   * Get approximate location based on IP address
   */
  async getLocationByIP(): Promise<GeolocationPosition> {
    try {
      const response = await fetch(this.ipLocationUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: IPLocationResponse = await response.json();
      
      if (!data.loc) {
        throw new Error('Location data not available from IP service');
      }

      const [lat, lon] = data.loc.split(',').map(Number);
      
      if (isNaN(lat) || isNaN(lon)) {
        throw new Error('Invalid location coordinates from IP service');
      }

      return {
        latitude: lat,
        longitude: lon,
      };
    } catch (error) {
      throw new LocationError(
        `Failed to get location by IP: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'IP_LOCATION_FAILED'
      );
    }
  }

  /**
   * Get location with fallback strategy: browser geolocation -> IP-based -> manual entry
   */
  async getLocationWithFallback(): Promise<{
    position: GeolocationPosition;
    method: 'geolocation' | 'ip' | 'manual';
    location?: Location;
  }> {
    // Try browser geolocation first
    try {
      const position = await this.getCurrentLocation();
      const location = await this.reverseGeocode(position);
      
      return {
        position,
        method: 'geolocation',
        location,
      };
    } catch (geolocationError) {
      console.warn('Browser geolocation failed:', geolocationError);
      
      // Fallback to IP-based location
      try {
        const position = await this.getLocationByIP();
        const location = await this.reverseGeocode(position);
        
        return {
          position,
          method: 'ip',
          location,
        };
      } catch (ipError) {
        console.warn('IP-based location failed:', ipError);
        
        // Return indication that manual entry is needed
        return {
          position: { latitude: 0, longitude: 0 },
          method: 'manual',
        };
      }
    }
  }

  /**
   * Convert coordinates to location information using reverse geocoding
   */
  private async reverseGeocode(position: GeolocationPosition): Promise<Location | undefined> {
    try {
      // Use a nearby city search to get location details
      // This is a workaround since Open-Meteo doesn't have reverse geocoding
      const locations = await weatherService.searchLocations(
        `${position.latitude.toFixed(2)},${position.longitude.toFixed(2)}`
      );
      
      if (locations.length > 0) {
        // Find the closest location
        const closest = locations.reduce((prev, curr) => {
          const prevDistance = this.calculateDistance(
            position.latitude,
            position.longitude,
            prev.latitude,
            prev.longitude
          );
          const currDistance = this.calculateDistance(
            position.latitude,
            position.longitude,
            curr.latitude,
            curr.longitude
          );
          return currDistance < prevDistance ? curr : prev;
        });
        
        return closest;
      }
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
    }
    
    // Return a generic location if reverse geocoding fails
    return {
      id: `${position.latitude}-${position.longitude}`,
      name: 'Current Location',
      country: 'Unknown',
      latitude: position.latitude,
      longitude: position.longitude,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Check if geolocation is supported and permissions
   */
  async checkGeolocationSupport(): Promise<{
    supported: boolean;
    permission?: PermissionState;
  }> {
    if (!navigator.geolocation) {
      return { supported: false };
    }

    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        return {
          supported: true,
          permission: permission.state,
        };
      }
    } catch (error) {
      console.warn('Could not check geolocation permission:', error);
    }

    return { supported: true };
  }
}

// Singleton instance
export const geolocationService = new GeolocationService();