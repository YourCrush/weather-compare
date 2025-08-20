import React, { useEffect, useState } from 'react';
import { memoryOptimization } from '../../utils/performance';

interface PerformanceMetrics {
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  renderTime: number;
  componentCount: number;
  lastUpdate: number;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  interval?: number;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = process.env.NODE_ENV === 'development',
  interval = 5000,
  onMetricsUpdate,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    componentCount: 0,
    lastUpdate: Date.now(),
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const updateMetrics = () => {
      const startTime = performance.now();
      
      const newMetrics: PerformanceMetrics = {
        renderTime: performance.now() - startTime,
        componentCount: document.querySelectorAll('[data-react-component]').length,
        lastUpdate: Date.now(),
      };

      // Get memory info if available
      const memoryInfo = memoryOptimization.getMemoryInfo();
      if (memoryInfo) {
        newMetrics.memoryUsage = {
          usedJSHeapSize: memoryInfo.usedJSHeapSize,
          totalJSHeapSize: memoryInfo.totalJSHeapSize,
          jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit,
        };
      }

      setMetrics(newMetrics);
      onMetricsUpdate?.(newMetrics);
    };

    updateMetrics();
    const intervalId = setInterval(updateMetrics, interval);

    return () => clearInterval(intervalId);
  }, [enabled, interval, onMetricsUpdate]);

  if (!enabled) return null;

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getMemoryUsagePercentage = (): number => {
    if (!metrics.memoryUsage) return 0;
    return (metrics.memoryUsage.usedJSHeapSize / metrics.memoryUsage.totalJSHeapSize) * 100;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="Performance Monitor"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </button>

      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl p-4 min-w-80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Performance Monitor
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Render Time:</span>
              <span className="font-mono text-gray-900 dark:text-gray-100">
                {metrics.renderTime.toFixed(2)}ms
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Components:</span>
              <span className="font-mono text-gray-900 dark:text-gray-100">
                {metrics.componentCount}
              </span>
            </div>

            {metrics.memoryUsage && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Memory Used:</span>
                  <span className="font-mono text-gray-900 dark:text-gray-100">
                    {formatBytes(metrics.memoryUsage.usedJSHeapSize)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Memory Total:</span>
                  <span className="font-mono text-gray-900 dark:text-gray-100">
                    {formatBytes(metrics.memoryUsage.totalJSHeapSize)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Memory Limit:</span>
                  <span className="font-mono text-gray-900 dark:text-gray-100">
                    {formatBytes(metrics.memoryUsage.jsHeapSizeLimit)}
                  </span>
                </div>

                <div className="mt-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Memory Usage:</span>
                    <span className="font-mono text-gray-900 dark:text-gray-100">
                      {getMemoryUsagePercentage().toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        getMemoryUsagePercentage() > 80
                          ? 'bg-red-500'
                          : getMemoryUsagePercentage() > 60
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${getMemoryUsagePercentage()}%` }}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Last Update:</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">
                  {new Date(metrics.lastUpdate).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};