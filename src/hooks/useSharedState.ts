import { useEffect, useState } from 'react';
import { useAppContext } from '../context';
import { parseSharedURL, resolveShortShareCode, hasShareParameters, clearShareParameters } from '../utils/shareUtils';
import { Location, UserSettings } from '../types';

interface SharedStateResult {
  isLoading: boolean;
  hasSharedData: boolean;
  error: string | null;
  applySharedState: () => void;
  dismissSharedState: () => void;
}

export const useSharedState = (): SharedStateResult => {
  const { setLocations, updateSettings } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [sharedData, setSharedData] = useState<{
    locations: Location[];
    settings: Partial<UserSettings>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSharedState = async () => {
      if (!hasShareParameters()) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const urlParams = new URLSearchParams(window.location.search);
        let data = null;

        // Try to parse share URL parameter
        if (urlParams.has('share')) {
          data = parseSharedURL();
        }
        
        // Try to resolve share code
        if (!data && urlParams.has('code')) {
          const code = urlParams.get('code');
          if (code) {
            data = resolveShortShareCode(code);
          }
        }

        if (data) {
          setSharedData(data);
        } else {
          setError('Invalid or expired share link');
        }
      } catch (err) {
        console.error('Failed to load shared state:', err);
        setError('Failed to load shared comparison');
      } finally {
        setIsLoading(false);
      }
    };

    loadSharedState();
  }, []);

  const applySharedState = () => {
    if (!sharedData) return;

    try {
      // Apply locations
      if (sharedData.locations.length > 0) {
        setLocations(sharedData.locations);
      }

      // Apply settings
      if (sharedData.settings) {
        updateSettings(sharedData.settings);
      }

      // Clear URL parameters
      clearShareParameters();
      
      // Clear shared data
      setSharedData(null);
      setError(null);
    } catch (err) {
      console.error('Failed to apply shared state:', err);
      setError('Failed to apply shared comparison');
    }
  };

  const dismissSharedState = () => {
    setSharedData(null);
    setError(null);
    clearShareParameters();
  };

  return {
    isLoading,
    hasSharedData: !!sharedData,
    error,
    applySharedState,
    dismissSharedState,
  };
};