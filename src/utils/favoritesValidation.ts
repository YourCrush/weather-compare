import { Location } from '../types';

export class FavoritesValidator {
  private static readonly MAX_FAVORITES = 10;

  /**
   * Validates if a location can be added to favorites
   */
  static canAddFavorite(favorites: Location[], location: Location): {
    canAdd: boolean;
    reason?: string;
  } {
    // Check if already exists
    const exists = favorites.some(fav => fav.id === location.id);
    if (exists) {
      return {
        canAdd: false,
        reason: 'Location is already in favorites',
      };
    }

    // Check if at limit
    if (favorites.length >= this.MAX_FAVORITES) {
      return {
        canAdd: false,
        reason: `Maximum of ${this.MAX_FAVORITES} favorites allowed`,
      };
    }

    return { canAdd: true };
  }

  /**
   * Validates if a location can be removed from favorites
   */
  static canRemoveFavorite(favorites: Location[], locationId: string): {
    canRemove: boolean;
    reason?: string;
  } {
    const exists = favorites.some(fav => fav.id === locationId);
    if (!exists) {
      return {
        canRemove: false,
        reason: 'Location is not in favorites',
      };
    }

    return { canRemove: true };
  }

  /**
   * Sanitizes favorites list by removing duplicates and enforcing limits
   */
  static sanitizeFavorites(favorites: Location[]): Location[] {
    // Remove duplicates based on ID
    const unique = favorites.filter((location, index, array) => 
      array.findIndex(l => l.id === location.id) === index
    );

    // Enforce limit
    return unique.slice(0, this.MAX_FAVORITES);
  }

  /**
   * Validates a location object has required fields
   */
  static isValidLocation(location: any): location is Location {
    return (
      location &&
      typeof location.id === 'string' &&
      typeof location.name === 'string' &&
      typeof location.country === 'string' &&
      typeof location.latitude === 'number' &&
      typeof location.longitude === 'number' &&
      typeof location.timezone === 'string' &&
      location.id.length > 0 &&
      location.name.length > 0 &&
      location.country.length > 0 &&
      !isNaN(location.latitude) &&
      !isNaN(location.longitude) &&
      location.latitude >= -90 &&
      location.latitude <= 90 &&
      location.longitude >= -180 &&
      location.longitude <= 180
    );
  }

  /**
   * Gets the maximum number of favorites allowed
   */
  static getMaxFavorites(): number {
    return this.MAX_FAVORITES;
  }

  /**
   * Checks if favorites list is at capacity
   */
  static isAtCapacity(favorites: Location[]): boolean {
    return favorites.length >= this.MAX_FAVORITES;
  }

  /**
   * Gets remaining favorite slots
   */
  static getRemainingSlots(favorites: Location[]): number {
    return Math.max(0, this.MAX_FAVORITES - favorites.length);
  }
}