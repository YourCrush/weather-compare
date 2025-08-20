import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  className?: string;
  backdrop?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Loading...',
  className = '',
  backdrop = true,
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center
        ${backdrop ? 'bg-black bg-opacity-50' : ''}
        ${className}
      `}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm mx-4">
        <div className="flex items-center space-x-3">
          <LoadingSpinner size="lg" />
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};