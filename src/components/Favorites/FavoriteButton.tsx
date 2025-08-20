import React from 'react';
import { useSettings } from '../../context';
import { Location } from '../../types';

interface FavoriteButtonProps {
  location: Location;
  className?: string;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  location,
  className = '',
}) => {
  const { settings, addFavorite, removeFavorite } = useSettings();
  
  const isFavorite = settings.favorites.some(fav => fav.id === location.id);

  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFavorite(location.id);
    } else {
      addFavorite(location);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      className={`
        p-2 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500
        ${isFavorite 
          ? 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' 
          : 'text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700'
        }
        ${className}
      `}
      aria-label={isFavorite ? `Remove ${location.name} from favorites` : `Add ${location.name} to favorites`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorite ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )}
    </button>
  );
};