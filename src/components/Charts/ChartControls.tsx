import React from 'react';
import { useSettings } from '../../context';

interface ChartControlsProps {
  sharedYAxis: boolean;
  onToggleSharedYAxis: (shared: boolean) => void;
  showGrid: boolean;
  onToggleGrid: (show: boolean) => void;
  showLegend: boolean;
  onToggleLegend: (show: boolean) => void;
  animationEnabled: boolean;
  onToggleAnimation: (enabled: boolean) => void;
}

export const ChartControls: React.FC<ChartControlsProps> = ({
  sharedYAxis,
  onToggleSharedYAxis,
  showGrid,
  onToggleGrid,
  showLegend,
  onToggleLegend,
  animationEnabled,
  onToggleAnimation,
}) => {
  const { toggleUnits, settings } = useSettings();

  const ToggleButton: React.FC<{
    label: string;
    enabled: boolean;
    onToggle: () => void;
    icon: React.ReactNode;
  }> = ({ label, enabled, onToggle, icon }) => (
    <button
      onClick={onToggle}
      className={`
        flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${enabled 
          ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800' 
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
        }
      `}
      aria-pressed={enabled}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
        <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
        Chart Settings
      </h3>

      <div className="space-y-4">
        {/* Display options */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Display Options
          </h4>
          <div className="flex flex-wrap gap-2">
            <ToggleButton
              label="Shared Y-Axis"
              enabled={sharedYAxis}
              onToggle={() => onToggleSharedYAxis(!sharedYAxis)}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />

            <ToggleButton
              label="Grid Lines"
              enabled={showGrid}
              onToggle={() => onToggleGrid(!showGrid)}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              }
            />

            <ToggleButton
              label="Legend"
              enabled={showLegend}
              onToggle={() => onToggleLegend(!showLegend)}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              }
            />

            <ToggleButton
              label="Animations"
              enabled={animationEnabled}
              onToggle={() => onToggleAnimation(!animationEnabled)}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h1m4 0h1M9 6h1m4 0h1" />
                </svg>
              }
            />
          </div>
        </div>

        {/* Units toggle */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Units
          </h4>
          <button
            onClick={toggleUnits}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>
              Switch to {settings.units === 'metric' ? 'Imperial' : 'Metric'}
            </span>
          </button>
        </div>

        {/* Chart info */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p>• Shared Y-Axis: Use same scale for all locations</p>
            <p>• Grid Lines: Show background grid for easier reading</p>
            <p>• Legend: Display location names and colors</p>
            <p>• Animations: Enable smooth chart transitions</p>
          </div>
        </div>
      </div>
    </div>
  );
};