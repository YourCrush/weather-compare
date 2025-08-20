import React, { useState } from 'react';
import { useAppContext } from '../../context';
import { exportToPNG, exportToCSV, exportForecastToCSV, exportChartDataToCSV } from '../../utils/exportUtils';
import { generateShareableURL, generateShortShareCode, copyToClipboard } from '../../utils/shareUtils';

export const ExportModal: React.FC = () => {
  const { state, toggleExportModal } = useAppContext();
  const [isExporting, setIsExporting] = useState(false);
  const [shareURL, setShareURL] = useState<string>('');
  const [shareCode, setShareCode] = useState<string>('');

  if (!state.ui.exportModalOpen) {
    return null;
  }

  const handleExportPNG = async () => {
    setIsExporting(true);
    try {
      await exportToPNG();
    } catch (error) {
      console.error('PNG export failed:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCurrentCSV = async () => {
    setIsExporting(true);
    try {
      await exportToCSV(state.locations, state.weatherData);
    } catch (error) {
      console.error('CSV export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportForecastCSV = async () => {
    setIsExporting(true);
    try {
      await exportForecastToCSV(state.locations, state.weatherData);
    } catch (error) {
      console.error('Forecast CSV export failed:', error);
      alert('Failed to export forecast data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateShareURL = async () => {
    try {
      const url = generateShareableURL(state.locations, state.settings);
      setShareURL(url);
    } catch (error) {
      console.error('Failed to generate share URL:', error);
      alert('Failed to generate share link. Please try again.');
    }
  };

  const handleGenerateShareCode = async () => {
    try {
      const code = await generateShortShareCode(state.locations, state.settings);
      setShareCode(code);
    } catch (error) {
      console.error('Failed to generate share code:', error);
      alert('Failed to generate share code. Please try again.');
    }
  };

  const handleCopyURL = async () => {
    try {
      await copyToClipboard(shareURL);
      alert('Share link copied to clipboard!');
    } catch (error) {
      alert('Failed to copy link. Please copy manually.');
    }
  };

  const handleCopyCode = async () => {
    try {
      await copyToClipboard(shareCode);
      alert('Share code copied to clipboard!');
    } catch (error) {
      alert('Failed to copy code. Please copy manually.');
    }
  };

  const hasData = state.locations.length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={toggleExportModal}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Export & Share
              </h2>
              <button
                onClick={toggleExportModal}
                className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close export modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {!hasData ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">
                  Add locations to enable export and sharing
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Export Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Export Data
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleExportPNG}
                      disabled={isExporting}
                      className="w-full btn-secondary flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{isExporting ? 'Exporting...' : 'Export as PNG Image'}</span>
                    </button>

                    <button
                      onClick={handleExportCurrentCSV}
                      disabled={isExporting}
                      className="w-full btn-secondary flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{isExporting ? 'Exporting...' : 'Export Current Data (CSV)'}</span>
                    </button>

                    <button
                      onClick={handleExportForecastCSV}
                      disabled={isExporting}
                      className="w-full btn-secondary flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 2m8-2l2 2m-2 4h.01M12 19l-3-3h2l1 1 1-1h2l-3 3z" />
                      </svg>
                      <span>{isExporting ? 'Exporting...' : 'Export Forecast Data (CSV)'}</span>
                    </button>
                  </div>
                </div>

                {/* Share Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Share Comparison
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Share URL */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Share Link
                        </label>
                        <button
                          onClick={handleGenerateShareURL}
                          className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                        >
                          Generate
                        </button>
                      </div>
                      {shareURL && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={shareURL}
                            readOnly
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          />
                          <button
                            onClick={handleCopyURL}
                            className="px-3 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
                          >
                            Copy
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Share Code */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Share Code
                        </label>
                        <button
                          onClick={handleGenerateShareCode}
                          className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                        >
                          Generate
                        </button>
                      </div>
                      {shareCode && (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={shareCode}
                            readOnly
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono"
                          />
                          <button
                            onClick={handleCopyCode}
                            className="px-3 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
                          >
                            Copy
                          </button>
                        </div>
                      )}
                      {shareCode && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Others can enter this code to view your comparison
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};