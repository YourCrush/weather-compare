import React, { useState } from 'react';
import { Location } from '../types';
import { useSettings } from '../context';
import { FavoritesValidator } from '../utils/favoritesValidation';

interface LocationListProps {
  locations: Location[];
  onRemoveLocation: (locationId: string) => void;
  onReorderLocations?: (fromIndex: number, toIndex: number) => void;
  className?: string;
  showReorder?: boolean;
  showFavorites?: boolean;
}

export const LocationList: React.FC<LocationListProps> = ({
  locations,
  onRemoveLocation,
  onReorderLocations,
  className = '',
  showReorder = false,
  showFavorites = true,
}) => {
  const { settings, addFavorite, removeFavorite } = useSettings();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!showReorder || !onReorderLocations) return;
    
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', ''); // Required for Firefox
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!showReorder || !onReorderLocations || draggedIndex === null) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (!showReorder || !onReorderLocations || draggedIndex === null) return;
    
    e.preventDefault();
    
    if (draggedIndex !== dropIndex) {
      onReorderLocations(draggedIndex, dropIndex);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleToggleFavorite = (location: Location) => {
    const isFavorite = settings.favorites.some(fav => fav.id === location.id);
    
    if (isFavorite) {
      removeFavorite(location.id);
    } else {
      const validation = FavoritesValidator.canAddFavorite(settings.favorites, location);
      if (!validation.canAdd) {
        alert(validation.reason || 'Cannot add to favorites');
        return;
      }
      addFavorite(location);
    }
  };

  const isFavorite = (locationId: string) => {
    return settings.favorites.some(fav => fav.id === locationId);
  };

  if (locations.length === 0) {
    return null;
  }

  return (
    <div className={`location-list ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
        Selected Locations ({locations.length})
      </h3>
      
      <div className="space-y-2">
        {locations.map((location, index) => (
          <div
            key={location.id}
            draggable={showReorder && onReorderLocations}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              card p-4 flex items-center justify-between
              ${showReorder && onReorderLocations ? 'cursor-move' : ''}
              ${draggedIndex === index ? 'opacity-50' : ''}
              ${dragOverIndex === index && draggedIndex !== index ? 'border-primary-300 dark:border-primary-600' : ''}
              transition-all duration-200
            `}
          >
            <div className="flex items-center space-x-3">
              {/* Drag handle */}
              {showReorder && onReorderLocations && (
                <div className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </div>
              )}
              
              {/* Location icon */}
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              
              {/* Location details */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {location.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {location.region && `${location.region}, `}{location.country}
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </div>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center space-x-2">
              {/* Favorite button */}
              {showFavorites && (
                <button
                  onClick={() => handleToggleFavorite(location)}
                  className={`flex-shrink-0 p-1 transition-colors duration-200 focus:outline-none ${
                    isFavorite(location.id)
                      ? 'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300'
                      : 'text-gray-400 hover:text-red-500 dark:hover:text-red-400'
                  }`}
                  aria-label={isFavorite(location.id) ? `Remove ${location.name} from favorites` : `Add ${location.name} to favorites`}
                  title={isFavorite(location.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <svg className="w-5 h-5" fill={isFavorite(location.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              )}
              
              {/* Remove button */}
              <button
                onClick={() => onRemoveLocation(location.id)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 focus:outline-none focus:text-red-500 dark:focus:text-red-400 transition-colors duration-200"
                aria-label={`Remove ${location.name}`}
                title="Remove from comparison"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Location count indicator */}
      <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        {showReorder && onReorderLocations && (
          <p>Drag locations to reorder them</p>
        )}
      </div>
    </div>
  );
};