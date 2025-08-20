import React from 'react';

interface LoadingCardProps {
  className?: string;
  lines?: number;
  showAvatar?: boolean;
  showButton?: boolean;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  className = '',
  lines = 3,
  showAvatar = false,
  showButton = false,
}) => {
  return (
    <div className={`card p-6 animate-pulse ${className}`}>
      {showAvatar && (
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`h-4 bg-gray-200 dark:bg-gray-700 rounded ${
              index === lines - 1 ? 'w-2/3' : 'w-full'
            }`}
          ></div>
        ))}
      </div>

      {showButton && (
        <div className="mt-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        </div>
      )}
    </div>
  );
};