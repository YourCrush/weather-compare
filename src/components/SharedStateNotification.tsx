import React from 'react';
import { useSharedState } from '../hooks/useSharedState';

export const SharedStateNotification: React.FC = () => {
  const { isLoading, hasSharedData, error, applySharedState, dismissSharedState } = useSharedState();

  if (isLoading) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Loading shared comparison...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-600 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Share Error
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {error}
            </p>
          </div>
          <button
            onClick={dismissSharedState}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            aria-label="Dismiss error"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  if (hasSharedData) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 border border-primary-200 dark:border-primary-600 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Shared Comparison
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Someone shared a weather comparison with you. Would you like to load it?
            </p>
            <div className="flex items-center space-x-2 mt-3">
              <button
                onClick={applySharedState}
                className="px-3 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Load Comparison
              </button>
              <button
                onClick={dismissSharedState}
                className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button
            onClick={dismissSharedState}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            aria-label="Dismiss notification"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return null;
};