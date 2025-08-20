import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LocalStorageService, SettingsStorage, defaultSettings } from '../storage';
import { Location, UserSettings } from '../../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => Object.keys(store)[index] || null,
    get length() {
      return Object.keys(store).length;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('LocalStorageService', () => {
  let storageService: LocalStorageService;

  beforeEach(() => {
    storageService = new LocalStorageService();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('basic operations', () => {
    it('should store and retrieve data', () => {
      const key = 'test-key';
      const data = { value: 'test-data', number: 42 };

      storageService.setItem(key, data);
      const retrieved = storageService.getItem(key);

      expect(retrieved).toEqual(data);
    });

    it('should return null for non-existent keys', () => {
      const result = storageService.getItem('non-existent-key');
      expect(result).toBeNull();
    });

    it('should remove items', () => {
      const key = 'test-key';
      const data = { value: 'test-data' };

      storageService.setItem(key, data);
      expect(storageService.getItem(key)).toEqual(data);

      storageService.removeItem(key);
      expect(storageService.getItem(key)).toBeNull();
    });

    it('should clear all prefixed items', () => {
      storageService.setItem('key1', 'data1');
      storageService.setItem('key2', 'data2');
      localStorage.setItem('other-key', 'other-data'); // Non-prefixed

      storageService.clear();

      expect(storageService.getItem('key1')).toBeNull();
      expect(storageService.getItem('key2')).toBeNull();
      expect(localStorage.getItem('other-key')).toBe('other-data');
    });
  });

  describe('error handling', () => {
    it('should handle JSON parse errors gracefully', () => {
      const key = 'weather-compare:corrupted-key';
      localStorage.setItem(key, 'invalid-json{');

      const result = storageService.getItem('corrupted-key');
      expect(result).toBeNull();
    });

    it('should handle localStorage quota exceeded', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock localStorage.setItem to throw quota exceeded error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn().mockImplementation(() => {
        const error = new DOMException('QuotaExceededError');
        (error as any).code = 22;
        throw error;
      });

      // This should not throw but handle the error gracefully
      expect(() => {
        storageService.setItem('test-key', 'test-data');
      }).not.toThrow();

      localStorage.setItem = originalSetItem;
      consoleSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('utility methods', () => {
    it('should detect localStorage availability', () => {
      expect(storageService.isAvailable()).toBe(true);
    });

    it('should calculate storage usage', () => {
      storageService.setItem('key1', 'data1');
      storageService.setItem('key2', 'data2');

      const info = storageService.getStorageInfo();
      expect(info.used).toBeGreaterThan(0);
      expect(info.available).toBeGreaterThan(0);
    });
  });
});

describe('SettingsStorage', () => {
  let storageService: LocalStorageService;
  let settingsStorage: SettingsStorage;

  const mockLocation: Location = {
    id: '1',
    name: 'New York',
    country: 'US',
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: 'America/New_York',
  };

  beforeEach(() => {
    localStorage.clear();
    storageService = new LocalStorageService();
    settingsStorage = new SettingsStorage(storageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('settings management', () => {
    it('should save and retrieve settings', () => {
      const settings: Partial<UserSettings> = {
        units: 'imperial',
        theme: 'dark',
      };

      settingsStorage.saveSettings(settings);
      const retrieved = settingsStorage.getSettings();

      expect(retrieved).toMatchObject(settings);
      expect(retrieved?.timestamp).toBeDefined();
    });

    it('should merge settings with existing ones', () => {
      const initialSettings: Partial<UserSettings> = {
        units: 'metric',
        theme: 'light',
      };

      const updateSettings: Partial<UserSettings> = {
        theme: 'dark',
      };

      settingsStorage.saveSettings(initialSettings);
      settingsStorage.saveSettings(updateSettings);

      const retrieved = settingsStorage.getSettings();
      expect(retrieved?.units).toBe('metric');
      expect(retrieved?.theme).toBe('dark');
    });

    it('should return null for non-existent settings', () => {
      const result = settingsStorage.getSettings();
      expect(result).toBeNull();
    });
  });

  describe('favorites management', () => {
    it('should save and retrieve favorites', () => {
      const favorites = [mockLocation];

      settingsStorage.saveFavorites(favorites);
      const retrieved = settingsStorage.getFavorites();

      expect(retrieved).toEqual(favorites);
    });

    it('should add favorite without duplicates', () => {
      const favorites = [mockLocation];
      settingsStorage.saveFavorites(favorites);

      // Try to add the same location again
      settingsStorage.addFavorite(mockLocation);

      const retrieved = settingsStorage.getFavorites();
      expect(retrieved).toHaveLength(1);
    });

    it('should remove favorite by id', () => {
      const favorites = [mockLocation];
      settingsStorage.saveFavorites(favorites);

      settingsStorage.removeFavorite(mockLocation.id);

      const retrieved = settingsStorage.getFavorites();
      expect(retrieved).toHaveLength(0);
    });

    it('should return empty array for non-existent favorites', () => {
      const result = settingsStorage.getFavorites();
      expect(result).toEqual([]);
    });
  });

  describe('last locations management', () => {
    it('should save and retrieve last locations', () => {
      const locations = [mockLocation];

      settingsStorage.saveLastLocations(locations);
      const retrieved = settingsStorage.getLastLocations();

      expect(retrieved).toEqual(locations);
    });

    it('should limit to 3 locations', () => {
      const locations = [
        { ...mockLocation, id: '1', name: 'Location 1' },
        { ...mockLocation, id: '2', name: 'Location 2' },
        { ...mockLocation, id: '3', name: 'Location 3' },
        { ...mockLocation, id: '4', name: 'Location 4' },
      ];

      settingsStorage.saveLastLocations(locations);
      const retrieved = settingsStorage.getLastLocations();

      expect(retrieved).toHaveLength(3);
      expect(retrieved.map(l => l.id)).toEqual(['1', '2', '3']);
    });

    it('should return empty array for non-existent last locations', () => {
      const result = settingsStorage.getLastLocations();
      expect(result).toEqual([]);
    });
  });

  describe('data management', () => {
    it('should clear all data', () => {
      settingsStorage.saveSettings({ units: 'metric' });
      settingsStorage.saveFavorites([mockLocation]);
      settingsStorage.saveLastLocations([mockLocation]);

      settingsStorage.clearAllData();

      expect(settingsStorage.getSettings()).toBeNull();
      expect(settingsStorage.getFavorites()).toEqual([]);
      expect(settingsStorage.getLastLocations()).toEqual([]);
    });
  });
});

describe('defaultSettings', () => {
  it('should have correct default values', () => {
    expect(defaultSettings.units).toBe('metric');
    expect(defaultSettings.theme).toBe('system');
    expect(defaultSettings.favorites).toEqual([]);
    expect(defaultSettings.defaultView).toBe('summary');
    expect(defaultSettings.autoRefresh).toBe(true);
    expect(defaultSettings.refreshInterval).toBe(15);
    expect(defaultSettings.chartSettings).toEqual({
      sharedYAxis: false,
      showGrid: true,
      showLegend: true,
      animationEnabled: true,
    });
  });
});