import { Location, UserSettings } from '../types';

/**
 * Generate a shareable URL with encoded location and settings data
 */
export const generateShareableURL = (
  locations: Location[],
  settings: UserSettings
): string => {
  try {
    const baseURL = window.location.origin + window.location.pathname;
    
    // Create share data object
    const shareData = {
      locations: locations.map(loc => ({
        id: loc.id,
        name: loc.name,
        country: loc.country,
        region: loc.region,
        latitude: loc.latitude,
        longitude: loc.longitude,
        timezone: loc.timezone,
      })),
      settings: {
        units: settings.units,
        theme: settings.theme,
        defaultView: settings.defaultView,
      },
      timestamp: Date.now(),
    };

    // Encode the data
    const encodedData = encodeShareData(shareData);
    
    // Create URL with parameters
    const url = new URL(baseURL);
    url.searchParams.set('share', encodedData);
    
    return url.toString();
    
  } catch (error) {
    console.error('Failed to generate shareable URL:', error);
    throw new Error('Failed to generate share link');
  }
};

/**
 * Parse shared URL parameters and restore state
 */
export const parseSharedURL = (): {
  locations: Location[];
  settings: Partial<UserSettings>;
} | null => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const shareParam = urlParams.get('share');
    
    if (!shareParam) {
      return null;
    }

    const shareData = decodeShareData(shareParam);
    
    if (!shareData || !isValidShareData(shareData)) {
      console.warn('Invalid share data');
      return null;
    }

    // Check if data is not too old (30 days)
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    if (Date.now() - shareData.timestamp > maxAge) {
      console.warn('Share data is too old');
      return null;
    }

    return {
      locations: shareData.locations,
      settings: shareData.settings,
    };
    
  } catch (error) {
    console.error('Failed to parse shared URL:', error);
    return null;
  }
};

/**
 * Encode share data to a URL-safe string
 */
function encodeShareData(data: any): string {
  try {
    const jsonString = JSON.stringify(data);
    const compressed = compressString(jsonString);
    return btoa(compressed).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (error) {
    throw new Error('Failed to encode share data');
  }
}

/**
 * Decode share data from URL parameter
 */
function decodeShareData(encoded: string): any {
  try {
    // Restore base64 padding and characters
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    
    const compressed = atob(padded);
    const jsonString = decompressString(compressed);
    
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error('Failed to decode share data');
  }
}

/**
 * Simple string compression using LZ-like algorithm
 */
function compressString(str: string): string {
  // Simple compression - in a real app, you might use a library like pako
  // For now, just return the original string
  return str;
}

/**
 * Decompress string
 */
function decompressString(str: string): string {
  // Simple decompression - matches compressString
  return str;
}

/**
 * Validate share data structure
 */
function isValidShareData(data: any): boolean {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.locations) &&
    data.locations.every(isValidLocationData) &&
    data.settings &&
    typeof data.settings === 'object' &&
    typeof data.timestamp === 'number'
  );
}

/**
 * Validate location data structure
 */
function isValidLocationData(location: any): boolean {
  return (
    location &&
    typeof location.id === 'string' &&
    typeof location.name === 'string' &&
    typeof location.country === 'string' &&
    typeof location.latitude === 'number' &&
    typeof location.longitude === 'number' &&
    typeof location.timezone === 'string' &&
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    location.longitude >= -180 &&
    location.longitude <= 180
  );
}

/**
 * Generate a short share code for easier sharing
 */
export const generateShortShareCode = async (
  locations: Location[],
  settings: UserSettings
): Promise<string> => {
  try {
    // In a real application, this would make an API call to store the data
    // and return a short code. For now, we'll generate a pseudo-random code
    const shareData = { locations, settings, timestamp: Date.now() };
    const dataString = JSON.stringify(shareData);
    
    // Generate a hash-like code (not cryptographically secure)
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to base36 and take first 8 characters
    const code = Math.abs(hash).toString(36).substring(0, 8).toUpperCase();
    
    // Store in localStorage for demo purposes
    localStorage.setItem(`share-${code}`, dataString);
    
    return code;
    
  } catch (error) {
    console.error('Failed to generate short share code:', error);
    throw new Error('Failed to generate share code');
  }
};

/**
 * Resolve a short share code to full data
 */
export const resolveShortShareCode = (code: string): {
  locations: Location[];
  settings: Partial<UserSettings>;
} | null => {
  try {
    // In a real application, this would make an API call
    const dataString = localStorage.getItem(`share-${code.toUpperCase()}`);
    
    if (!dataString) {
      return null;
    }

    const shareData = JSON.parse(dataString);
    
    if (!isValidShareData(shareData)) {
      return null;
    }

    return {
      locations: shareData.locations,
      settings: shareData.settings,
    };
    
  } catch (error) {
    console.error('Failed to resolve share code:', error);
    return null;
  }
};

/**
 * Check if the current URL contains share parameters
 */
export const hasShareParameters = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('share') || urlParams.has('code');
};

/**
 * Clear share parameters from URL without page reload
 */
export const clearShareParameters = (): void => {
  const url = new URL(window.location.href);
  url.searchParams.delete('share');
  url.searchParams.delete('code');
  
  window.history.replaceState({}, document.title, url.toString());
};

/**
 * Copy text to clipboard with fallback
 */
export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers or non-HTTPS
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (!successful) {
        throw new Error('Copy command failed');
      }
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    throw new Error('Failed to copy to clipboard');
  }
};