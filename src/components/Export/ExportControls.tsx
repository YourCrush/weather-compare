import React, { useState } from 'react';
import { useAppContext } from '../../context';

interface ExportControlsProps {
  className?: string;
  compact?: boolean;
}

export const ExportControls: React.FC<ExportControlsProps> = ({
  className = '',
  compact = false,
}) => {
  const { state, toggleExportModal } = useAppContext();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPNG = async () => {
    setIsExporting(true);
    try {
      const { exportToPNG } = await import('../../utils/exportUtils');
      await exportToPNG();
    } catch (error) {
      console.error('Failed to export PNG:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const { exportToCSV } = await import('../../utils/exportUtils');
      await exportToCSV(state.locations, state.weatherData);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    try {
      const { generateShareableURL } = await import('../../utils/shareUtils');
      const shareURL = generateShareableURL(state.locations, state.settings);
      
      if (navigator.share) {
        await navigator.share({
          title: 'Weather Comparison',
          text: 'Check out this weather comparison',
          url: shareURL,
        });
      } else {
        await navigator.clipboard.writeText(shareURL);
        alert('Share link copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to share:', error);
      alert('Failed to generate share link. Please try again.');
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <button
          onClick={handleShare}
          disabled={state.locations.length === 0}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Share comparison"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
        </button>
        
        <button
          onClick={toggleExportModal}
          disabled={state.locations.length === 0}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Export options"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className={`export-controls ${className}`}>
      <div className="flex items-center space-x-3">
        <button
          onClick={handleShare}
          disabled={state.locations.length === 0}
          className="btn-secondary flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
          <span>Share</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportPNG}
            disabled={state.locations.length === 0 || isExporting}
            className="btn-secondary flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{isExporting ? 'Exporting...' : 'PNG'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={state.locations.length === 0 || isExporting}
            className="btn-secondary flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{isExporting ? 'Exporting...' : 'CSV'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};