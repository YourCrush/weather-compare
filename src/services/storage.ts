import { StorageService } from '../types/api';
import { UserSettings, Location } from '../types';

export class LocalStorageService implements StorageService {
  private prefix = 'weather-compare:';

  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error(`Failed to get item from localStorage: ${key}`, error);
      return null;
    }
  }

  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to set item in localStorage: ${key}`, error);
      // Handle quota exceeded error
      if (error instanceof DOMException && error.code === 22) {
        console.warn('localStorage quota exceeded, clearing old data');
        this.clearOldData();
        try {
          localStorage.setItem(this.prefix + key, JSON.stringify(value));
        } catch (retryError) {
          console.error('Failed to set item after clearing old data', retryError);
        }
      }
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error(`Failed to remove item from localStorage: ${key}`, error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear localStorage', error);
    }
  }

  private clearOldData(): void {
    // Remove items older than 7 days
    const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const parsed = JSON.parse(item);
            if (parsed.timestamp && parsed.timestamp < cutoffTime) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // If we can't parse it, it might be corrupted, so remove it
          localStorage.removeItem(key);
        }
      }
    });
  }

  // Check if localStorage is available
  isAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  // Get storage usage info
  getStorageInfo(): { used: number; available: number } {
    let used = 0;
    try {
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith(this.prefix)) {
          used += localStorage[key].length + key.length;
        }
      }
    } catch (error) {
      console.error('Failed to calculate storage usage', error);
    }

    // Estimate available space (most browsers have ~5-10MB limit)
    const estimated = 5 * 1024 * 1024; // 5MB
    return { used, available: Math.max(0, estimated - used) };
  }
}

// Settings-specific storage utilities
export class SettingsStorage {
  private storage: StorageService;
  private readonly SETTINGS_KEY = 'settings';
  private readonly FAVORITES_KEY = 'favorites';
  private readonly LAST_LOCATIONS_KEY = 'lastLocations';

  constructor(storage: StorageService) {
    this.storage = storage;
  }

  getSettings(): Partial<UserSettings> | null {
    return this.storage.getItem<Partial<UserSettings>>(this.SETTINGS_KEY);
  }

  saveSettings(settings: Partial<UserSettings>): void {
    const existing = this.getSettings() || {};
    const updated = { ...existing, ...settings, timestamp: Date.now() };
    this.storage.setItem(this.SETTINGS_KEY, updated);
  }

  getFavorites(): Location[] {
    const data = this.storage.getItem<{ favorites: Location[]; timestamp: number }>(this.FAVORITES_KEY);
    return data?.favorites || [];
  }

  saveFavorites(favorites: Location[]): void {
    this.storage.setItem(this.FAVORITES_KEY, { 
      favorites, 
      timestamp: Date.now() 
    });
  }

  addFavorite(location: Location): void {
    const favorites = this.getFavorites();
    const exists = favorites.some(fav => fav.id === location.id);
    
    if (!exists) {
      favorites.push(location);
      this.saveFavorites(favorites);
    }
  }

  removeFavorite(locationId: string): void {
    const favorites = this.getFavorites();
    const filtered = favorites.filter(fav => fav.id !== locationId);
    this.saveFavorites(filtered);
  }

  getLastLocations(): Location[] {
    const data = this.storage.getItem<{ locations: Location[]; timestamp: number }>(this.LAST_LOCATIONS_KEY);
    return data?.locations || [];
  }

  saveLastLocations(locations: Location[]): void {
    // Only save up to 3 locations (current limit)
    const limited = locations.slice(0, 3);
    this.storage.setItem(this.LAST_LOCATIONS_KEY, {
      locations: limited,
      timestamp: Date.now()
    });
  }

  clearAllData(): void {
    this.storage.removeItem(this.SETTINGS_KEY);
    this.storage.removeItem(this.FAVORITES_KEY);
    this.storage.removeItem(this.LAST_LOCATIONS_KEY);
  }
}

// Default settings
export const defaultSettings: UserSettings = {
  units: 'metric',
  theme: 'system',
  favorites: [],
  defaultView: 'summary',
  chartSettings: {
    sharedYAxis: false,
    showGrid: true,
    showLegend: true,
    animationEnabled: true,
  },
  autoRefresh: true,
  refreshInterval: 15, // minutes
};

// Singleton instances
export const storageService = new LocalStorageService();
export const settingsStorage = new SettingsStorage(storageService);