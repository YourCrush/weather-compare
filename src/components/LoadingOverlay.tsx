import React from 'react';

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = 'Loading weather data...' 
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 shadow-xl">
        <div className="flex items-center space-x-4">
          {/* Spinner */}
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          
          {/* Message */}
          <div>
            <p className="text-gray-900 dark:text-gray-100 font-medium">
              {message}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Please wait...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};