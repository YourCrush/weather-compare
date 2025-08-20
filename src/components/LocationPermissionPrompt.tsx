import React from 'react';

interface LocationPermissionPromptProps {
  onDismiss: () => void;
  onManualSearch: () => void;
}

export const LocationPermissionPrompt: React.FC<LocationPermissionPromptProps> = ({
  onDismiss,
  onManualSearch,
}) => {
  return (
    <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Location Access Blocked
          </h3>
          
          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
            <p className="mb-3">
              Location access has been denied. To use your current location for weather comparisons:
            </p>
            
            <ol className="list-decimal list-inside space-y-1 mb-4">
              <li>Click the location icon in your browser's address bar</li>
              <li>Select "Allow" for location access</li>
              <li>Refresh the page</li>
            </ol>
            
            <p>
              Alternatively, you can search for locations manually.
            </p>
          </div>
          
          <div className="mt-4 flex space-x-3">
            <button
              onClick={onManualSearch}
              className="btn-primary text-sm"
            >
              Search Manually
            </button>
            
            <button
              onClick={onDismiss}
              className="btn-secondary text-sm"
            >
              Dismiss
            </button>
          </div>
        </div>
        
        <div className="ml-auto pl-3">
          <button
            onClick={onDismiss}
            className="inline-flex text-yellow-400 hover:text-yellow-500 focus:outline-none focus:text-yellow-500"
            aria-label="Close notification"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};