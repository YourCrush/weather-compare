import { describe, it, expect } from 'vitest';
import { FavoritesValidator } from '../favoritesValidation';
import { Location } from '../../types';

const mockLocation1: Location = {
  id: '1',
  name: 'New York',
  country: 'United States',
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: 'America/New_York',
  region: 'New York',
};

const mockLocation2: Location = {
  id: '2',
  name: 'London',
  country: 'United Kingdom',
  latitude: 51.5074,
  longitude: -0.1278,
  timezone: 'Europe/London',
  region: 'England',
};

describe('FavoritesValidator', () => {
  describe('canAddFavorite', () => {
    it('allows adding new location to empty favorites', () => {
      const result = FavoritesValidator.canAddFavorite([], mockLocation1);
      expect(result.canAdd).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('allows adding new location to non-empty favorites', () => {
      const result = FavoritesValidator.canAddFavorite([mockLocation1], mockLocation2);
      expect(result.canAdd).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('prevents adding duplicate location', () => {
      const result = FavoritesValidator.canAddFavorite([mockLocation1], mockLocation1);
      expect(result.canAdd).toBe(false);
      expect(result.reason).toBe('Location is already in favorites');
    });

    it('prevents adding when at maximum capacity', () => {
      const maxFavorites = Array.from({ length: 10 }, (_, i) => ({
        ...mockLocation1,
        id: `location-${i}`,
        name: `Location ${i}`,
      }));

      const result = FavoritesValidator.canAddFavorite(maxFavorites, mockLocation2);
      expect(result.canAdd).toBe(false);
      expect(result.reason).toBe('Maximum of 10 favorites allowed');
    });
  });

  describe('canRemoveFavorite', () => {
    it('allows removing existing favorite', () => {
      const result = FavoritesValidator.canRemoveFavorite([mockLocation1], '1');
      expect(result.canRemove).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('prevents removing non-existent favorite', () => {
      const result = FavoritesValidator.canRemoveFavorite([mockLocation1], '999');
      expect(result.canRemove).toBe(false);
      expect(result.reason).toBe('Location is not in favorites');
    });

    it('prevents removing from empty favorites', () => {
      const result = FavoritesValidator.canRemoveFavorite([], '1');
      expect(result.canRemove).toBe(false);
      expect(result.reason).toBe('Location is not in favorites');
    });
  });

  describe('sanitizeFavorites', () => {
    it('removes duplicate locations', () => {
      const duplicates = [mockLocation1, mockLocation2, mockLocation1];
      const result = FavoritesValidator.sanitizeFavorites(duplicates);
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });

    it('enforces maximum limit', () => {
      const tooMany = Array.from({ length: 15 }, (_, i) => ({
        ...mockLocation1,
        id: `location-${i}`,
        name: `Location ${i}`,
      }));

      const result = FavoritesValidator.sanitizeFavorites(tooMany);
      expect(result).toHaveLength(10);
    });

    it('returns empty array for empty input', () => {
      const result = FavoritesValidator.sanitizeFavorites([]);
      expect(result).toEqual([]);
    });

    it('preserves order when sanitizing', () => {
      const locations = [mockLocation1, mockLocation2];
      const result = FavoritesValidator.sanitizeFavorites(locations);
      
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });
  });

  describe('isValidLocation', () => {
    it('validates correct location object', () => {
      expect(FavoritesValidator.isValidLocation(mockLocation1)).toBe(true);
    });

    it('rejects null or undefined', () => {
      expect(FavoritesValidator.isValidLocation(null)).toBe(false);
      expect(FavoritesValidator.isValidLocation(undefined)).toBe(false);
    });

    it('rejects location with missing required fields', () => {
      const incomplete = { ...mockLocation1 };
      delete (incomplete as any).id;
      expect(FavoritesValidator.isValidLocation(incomplete)).toBe(false);
    });

    it('rejects location with empty string fields', () => {
      const emptyName = { ...mockLocation1, name: '' };
      expect(FavoritesValidator.isValidLocation(emptyName)).toBe(false);
    });

    it('rejects location with invalid coordinates', () => {
      const invalidLat = { ...mockLocation1, latitude: 91 };
      expect(FavoritesValidator.isValidLocation(invalidLat)).toBe(false);

      const invalidLng = { ...mockLocation1, longitude: 181 };
      expect(FavoritesValidator.isValidLocation(invalidLng)).toBe(false);

      const nanLat = { ...mockLocation1, latitude: NaN };
      expect(FavoritesValidator.isValidLocation(nanLat)).toBe(false);
    });

    it('accepts location without region', () => {
      const noRegion = { ...mockLocation1 };
      delete (noRegion as any).region;
      expect(FavoritesValidator.isValidLocation(noRegion)).toBe(true);
    });
  });

  describe('utility methods', () => {
    it('returns correct maximum favorites', () => {
      expect(FavoritesValidator.getMaxFavorites()).toBe(10);
    });

    it('correctly identifies when at capacity', () => {
      const maxFavorites = Array.from({ length: 10 }, (_, i) => ({
        ...mockLocation1,
        id: `location-${i}`,
      }));

      expect(FavoritesValidator.isAtCapacity(maxFavorites)).toBe(true);
      expect(FavoritesValidator.isAtCapacity([mockLocation1])).toBe(false);
      expect(FavoritesValidator.isAtCapacity([])).toBe(false);
    });

    it('calculates remaining slots correctly', () => {
      expect(FavoritesValidator.getRemainingSlots([])).toBe(10);
      expect(FavoritesValidator.getRemainingSlots([mockLocation1])).toBe(9);
      
      const maxFavorites = Array.from({ length: 10 }, (_, i) => ({
        ...mockLocation1,
        id: `location-${i}`,
      }));
      expect(FavoritesValidator.getRemainingSlots(maxFavorites)).toBe(0);
    });
  });
});