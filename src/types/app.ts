import { Location } from './location';
import { WeatherData } from './weather';

export type ViewMode = 'summary' | 'cards' | 'charts' | 'seasonal';
export type Units = 'metric' | 'imperial';
export type Theme = 'light' | 'dark' | 'system';
export type TimeRange = '7d' | '14d' | '30d' | '3m' | '6m' | '12m' | '24m';

export interface ChartSettings {
  sharedYAxis: boolean;
  showGrid: boolean;
  showLegend: boolean;
  animationEnabled: boolean;
}

export interface UserSettings {
  units: Units;
  theme: Theme;
  favorites: Location[];
  defaultView: ViewMode;
  chartSettings: ChartSettings;
  autoRefresh: boolean;
  refreshInterval: number; // minutes
}

export interface UIState {
  activeView: ViewMode;
  loading: boolean;
  errors: ErrorState[];
  selectedTimeRange: TimeRange;
  sidebarOpen: boolean;
  exportModalOpen: boolean;
}

export interface ErrorState {
  id: string;
  type: 'network' | 'data' | 'user' | 'system';
  message: string;
  details?: string;
  timestamp: string;
  dismissed: boolean;
}

export interface AppState {
  locations: Location[];
  weatherData: Map<string, WeatherData>;
  settings: UserSettings;
  ui: UIState;
}

export interface AppAction {
  type: string;
  payload?: any;
}

// Action types
export const APP_ACTIONS = {
  // Location actions
  ADD_LOCATION: 'ADD_LOCATION',
  REMOVE_LOCATION: 'REMOVE_LOCATION',
  UPDATE_LOCATION: 'UPDATE_LOCATION',
  SET_LOCATIONS: 'SET_LOCATIONS',
  
  // Weather data actions
  SET_WEATHER_DATA: 'SET_WEATHER_DATA',
  UPDATE_WEATHER_DATA: 'UPDATE_WEATHER_DATA',
  CLEAR_WEATHER_DATA: 'CLEAR_WEATHER_DATA',
  
  // Settings actions
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  SET_THEME: 'SET_THEME',
  SET_UNITS: 'SET_UNITS',
  ADD_FAVORITE: 'ADD_FAVORITE',
  REMOVE_FAVORITE: 'REMOVE_FAVORITE',
  
  // UI actions
  SET_ACTIVE_VIEW: 'SET_ACTIVE_VIEW',
  SET_LOADING: 'SET_LOADING',
  ADD_ERROR: 'ADD_ERROR',
  DISMISS_ERROR: 'DISMISS_ERROR',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
  SET_TIME_RANGE: 'SET_TIME_RANGE',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  TOGGLE_EXPORT_MODAL: 'TOGGLE_EXPORT_MODAL',
} as const;