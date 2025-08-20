import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, AppAction, APP_ACTIONS, UserSettings, Location, WeatherData } from '../types';
import { defaultSettings, settingsStorage } from '../services/storage';
import { LocationError } from '../types/errors';
import { FavoritesValidator } from '../utils/favoritesValidation';

// Initial state
const initialState: AppState = {
  locations: [],
  weatherData: new Map(),
  settings: defaultSettings,
  ui: {
    activeView: 'summary',
    loading: false,
    errors: [],
    selectedTimeRange: '7d',
    sidebarOpen: false,
    exportModalOpen: false,
  },
};

// App reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case APP_ACTIONS.ADD_LOCATION:
      return {
        ...state,
        locations: [...state.locations, action.payload],
        ui: { ...state.ui, errors: [] },
      };

    case APP_ACTIONS.REMOVE_LOCATION:
      const filteredLocations = state.locations.filter(loc => loc.id !== action.payload);
      const newWeatherData = new Map(state.weatherData);
      newWeatherData.delete(action.payload);
      
      return {
        ...state,
        locations: filteredLocations,
        weatherData: newWeatherData,
      };

    case APP_ACTIONS.UPDATE_LOCATION:
      return {
        ...state,
        locations: state.locations.map(loc =>
          loc.id === action.payload.id ? { ...loc, ...action.payload.updates } : loc
        ),
      };

    case APP_ACTIONS.SET_LOCATIONS:
      return {
        ...state,
        locations: action.payload,
      };

    case APP_ACTIONS.SET_WEATHER_DATA:
      const updatedWeatherData = new Map(state.weatherData);
      updatedWeatherData.set(action.payload.locationId, action.payload.data);
      
      return {
        ...state,
        weatherData: updatedWeatherData,
      };

    case APP_ACTIONS.UPDATE_WEATHER_DATA:
      const existingData = state.weatherData.get(action.payload.locationId);
      const mergedData = existingData 
        ? { ...existingData, ...action.payload.data }
        : action.payload.data;
      
      const mergedWeatherData = new Map(state.weatherData);
      mergedWeatherData.set(action.payload.locationId, mergedData);
      
      return {
        ...state,
        weatherData: mergedWeatherData,
      };

    case APP_ACTIONS.CLEAR_WEATHER_DATA:
      return {
        ...state,
        weatherData: new Map(),
      };

    case APP_ACTIONS.UPDATE_SETTINGS:
      const newSettings = { ...state.settings, ...action.payload };
      return {
        ...state,
        settings: newSettings,
      };

    case APP_ACTIONS.SET_THEME:
      return {
        ...state,
        settings: {
          ...state.settings,
          theme: action.payload,
        },
      };

    case APP_ACTIONS.SET_UNITS:
      return {
        ...state,
        settings: {
          ...state.settings,
          units: action.payload,
        },
      };

    case APP_ACTIONS.ADD_FAVORITE:
      const existingFavorites = state.settings.favorites;
      const validation = FavoritesValidator.canAddFavorite(existingFavorites, action.payload);
      
      if (!validation.canAdd) {
        console.warn('Cannot add favorite:', validation.reason);
        return state;
      }
      
      return {
        ...state,
        settings: {
          ...state.settings,
          favorites: [...existingFavorites, action.payload],
        },
      };

    case APP_ACTIONS.REMOVE_FAVORITE:
      const removeValidation = FavoritesValidator.canRemoveFavorite(state.settings.favorites, action.payload);
      
      if (!removeValidation.canRemove) {
        console.warn('Cannot remove favorite:', removeValidation.reason);
        return state;
      }
      
      return {
        ...state,
        settings: {
          ...state.settings,
          favorites: state.settings.favorites.filter(fav => fav.id !== action.payload),
        },
      };

    case APP_ACTIONS.SET_ACTIVE_VIEW:
      return {
        ...state,
        ui: {
          ...state.ui,
          activeView: action.payload,
        },
      };

    case APP_ACTIONS.SET_LOADING:
      return {
        ...state,
        ui: {
          ...state.ui,
          loading: action.payload,
        },
      };

    case APP_ACTIONS.ADD_ERROR:
      const newError = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        dismissed: false,
        ...action.payload,
      };
      
      return {
        ...state,
        ui: {
          ...state.ui,
          errors: [...state.ui.errors, newError],
        },
      };

    case APP_ACTIONS.DISMISS_ERROR:
      return {
        ...state,
        ui: {
          ...state.ui,
          errors: state.ui.errors.map(error =>
            error.id === action.payload ? { ...error, dismissed: true } : error
          ),
        },
      };

    case APP_ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        ui: {
          ...state.ui,
          errors: [],
        },
      };

    case APP_ACTIONS.SET_TIME_RANGE:
      return {
        ...state,
        ui: {
          ...state.ui,
          selectedTimeRange: action.payload,
        },
      };

    case APP_ACTIONS.TOGGLE_SIDEBAR:
      return {
        ...state,
        ui: {
          ...state.ui,
          sidebarOpen: !state.ui.sidebarOpen,
        },
      };

    case APP_ACTIONS.TOGGLE_EXPORT_MODAL:
      return {
        ...state,
        ui: {
          ...state.ui,
          exportModalOpen: !state.ui.exportModalOpen,
        },
      };

    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Convenience action creators
  addLocation: (location: Location) => void;
  removeLocation: (locationId: string) => void;
  updateLocation: (locationId: string, updates: Partial<Location>) => void;
  setLocations: (locations: Location[]) => void;
  
  setWeatherData: (locationId: string, data: WeatherData) => void;
  updateWeatherData: (locationId: string, data: Partial<WeatherData>) => void;
  clearWeatherData: () => void;
  
  updateSettings: (settings: Partial<UserSettings>) => void;
  setTheme: (theme: UserSettings['theme']) => void;
  setUnits: (units: UserSettings['units']) => void;
  addFavorite: (location: Location) => void;
  removeFavorite: (locationId: string) => void;
  
  setActiveView: (view: AppState['ui']['activeView']) => void;
  setLoading: (loading: boolean) => void;
  addError: (error: Omit<AppState['ui']['errors'][0], 'id' | 'timestamp' | 'dismissed'>) => void;
  dismissError: (errorId: string) => void;
  clearErrors: () => void;
  setTimeRange: (range: AppState['ui']['selectedTimeRange']) => void;
  toggleSidebar: () => void;
  toggleExportModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load persisted data on mount
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        // Load settings
        const savedSettings = settingsStorage.getSettings();
        if (savedSettings) {
          dispatch({
            type: APP_ACTIONS.UPDATE_SETTINGS,
            payload: savedSettings,
          });
        }

        // Load favorites
        const savedFavorites = settingsStorage.getFavorites();
        if (savedFavorites.length > 0) {
          // Sanitize favorites to remove any invalid entries
          const sanitizedFavorites = FavoritesValidator.sanitizeFavorites(
            savedFavorites.filter(FavoritesValidator.isValidLocation)
          );
          
          dispatch({
            type: APP_ACTIONS.UPDATE_SETTINGS,
            payload: { favorites: sanitizedFavorites },
          });
        }

        // Load last locations
        const lastLocations = settingsStorage.getLastLocations();
        if (lastLocations.length > 0) {
          dispatch({
            type: APP_ACTIONS.SET_LOCATIONS,
            payload: lastLocations,
          });
        }
      } catch (error) {
        console.error('Failed to load persisted data:', error);
        dispatch({
          type: APP_ACTIONS.ADD_ERROR,
          payload: {
            type: 'system',
            message: 'Failed to load saved data',
            details: error instanceof Error ? error.message : 'Unknown error',
          },
        });
      }
    };

    loadPersistedData();
  }, []);

  // Persist settings when they change
  useEffect(() => {
    try {
      settingsStorage.saveSettings(state.settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [state.settings]);

  // Persist favorites when they change
  useEffect(() => {
    try {
      settingsStorage.saveFavorites(state.settings.favorites);
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }, [state.settings.favorites]);

  // Persist locations when they change
  useEffect(() => {
    try {
      settingsStorage.saveLastLocations(state.locations);
    } catch (error) {
      console.error('Failed to save locations:', error);
    }
  }, [state.locations]);

  // Apply theme to document
  useEffect(() => {
    const applyTheme = () => {
      const { theme } = state.settings;
      const root = document.documentElement;
      
      if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', prefersDark);
      } else {
        root.classList.toggle('dark', theme === 'dark');
      }
    };

    applyTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (state.settings.theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [state.settings.theme]);

  // Action creators
  const addLocation = (location: Location) => {
    dispatch({ type: APP_ACTIONS.ADD_LOCATION, payload: location });
  };

  const removeLocation = (locationId: string) => {
    dispatch({ type: APP_ACTIONS.REMOVE_LOCATION, payload: locationId });
  };

  const updateLocation = (locationId: string, updates: Partial<Location>) => {
    dispatch({ type: APP_ACTIONS.UPDATE_LOCATION, payload: { id: locationId, updates } });
  };

  const setLocations = (locations: Location[]) => {
    dispatch({ type: APP_ACTIONS.SET_LOCATIONS, payload: locations });
  };

  const setWeatherData = (locationId: string, data: WeatherData) => {
    dispatch({ type: APP_ACTIONS.SET_WEATHER_DATA, payload: { locationId, data } });
  };

  const updateWeatherData = (locationId: string, data: Partial<WeatherData>) => {
    dispatch({ type: APP_ACTIONS.UPDATE_WEATHER_DATA, payload: { locationId, data } });
  };

  const clearWeatherData = () => {
    dispatch({ type: APP_ACTIONS.CLEAR_WEATHER_DATA });
  };

  const updateSettings = (settings: Partial<UserSettings>) => {
    dispatch({ type: APP_ACTIONS.UPDATE_SETTINGS, payload: settings });
  };

  const setTheme = (theme: UserSettings['theme']) => {
    dispatch({ type: APP_ACTIONS.SET_THEME, payload: theme });
  };

  const setUnits = (units: UserSettings['units']) => {
    dispatch({ type: APP_ACTIONS.SET_UNITS, payload: units });
  };

  const addFavorite = (location: Location) => {
    dispatch({ type: APP_ACTIONS.ADD_FAVORITE, payload: location });
  };

  const removeFavorite = (locationId: string) => {
    dispatch({ type: APP_ACTIONS.REMOVE_FAVORITE, payload: locationId });
  };

  const setActiveView = (view: AppState['ui']['activeView']) => {
    dispatch({ type: APP_ACTIONS.SET_ACTIVE_VIEW, payload: view });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: APP_ACTIONS.SET_LOADING, payload: loading });
  };

  const addError = (error: Omit<AppState['ui']['errors'][0], 'id' | 'timestamp' | 'dismissed'>) => {
    dispatch({ type: APP_ACTIONS.ADD_ERROR, payload: error });
  };

  const dismissError = (errorId: string) => {
    dispatch({ type: APP_ACTIONS.DISMISS_ERROR, payload: errorId });
  };

  const clearErrors = () => {
    dispatch({ type: APP_ACTIONS.CLEAR_ERRORS });
  };

  const setTimeRange = (range: AppState['ui']['selectedTimeRange']) => {
    dispatch({ type: APP_ACTIONS.SET_TIME_RANGE, payload: range });
  };

  const toggleSidebar = () => {
    dispatch({ type: APP_ACTIONS.TOGGLE_SIDEBAR });
  };

  const toggleExportModal = () => {
    dispatch({ type: APP_ACTIONS.TOGGLE_EXPORT_MODAL });
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    
    // Action creators
    addLocation,
    removeLocation,
    updateLocation,
    setLocations,
    
    setWeatherData,
    updateWeatherData,
    clearWeatherData,
    
    updateSettings,
    setTheme,
    setUnits,
    addFavorite,
    removeFavorite,
    
    setActiveView,
    setLoading,
    addError,
    dismissError,
    clearErrors,
    setTimeRange,
    toggleSidebar,
    toggleExportModal,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the app context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};