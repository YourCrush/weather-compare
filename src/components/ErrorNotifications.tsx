import React from 'react';
import { useAppContext } from '../context';

export const ErrorNotifications: React.FC = () => {
  const { state, dismissError } = useAppContext();
  const activeErrors = state.ui.errors.filter(error => !error.dismissed);

  if (activeErrors.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {activeErrors.map((error) => (
        <div
          key={error.id}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 shadow-lg animate-slide-up"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                {error.type === 'network' && 'Network Error'}
                {error.type === 'data' && 'Data Error'}
                {error.type === 'user' && 'Input Error'}
                {error.type === 'system' && 'System Error'}
              </h3>
              
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {error.message}
              </p>
              
              {error.details && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {error.details}
                </p>
              )}
            </div>
            
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={() => dismissError(error.id)}
                className="inline-flex text-red-400 hover:text-red-500 focus:outline-none focus:text-red-500"
                aria-label="Dismiss error"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};