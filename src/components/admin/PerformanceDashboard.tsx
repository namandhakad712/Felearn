import React, { useState, useEffect } from 'react';
import { Card } from '../ui';

/**
 * Performance dashboard component for admin panel
 */
const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Record<string, any>>({});
  const [memoryUsage, setMemoryUsage] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<{ size: number; keys: string[] }>({ size: 0, keys: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPerformanceData();

    // Refresh data every 30 seconds
    const interval = setInterval(loadPerformanceData, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadPerformanceData = () => {
    try {
      setIsLoading(true);

      // Mock performance metrics
      setMetrics({
        'LCP': { avg: 2100, min: 1200, max: 3500, count: 150 },
        'FID': { avg: 45, min: 10, max: 120, count: 120 },
        'CLS': { avg: 0.08, min: 0.01, max: 0.25, count: 150 },
        'TTFB': { avg: 320, min: 180, max: 750, count: 150 },
        'FCP': { avg: 1200, min: 800, max: 2200, count: 150 },
        'TTI': { avg: 3500, min: 2200, max: 5800, count: 150 },
      });

      // Mock memory usage
      setMemoryUsage({
        usedJSHeapSize: 25000000,
        totalJSHeapSize: 35000000,
        jsHeapSizeLimit: 2200000000
      });

      // Mock cache statistics
      setCacheStats({ size: 0, keys: [] });

    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatMs = (ms: number): string => {
    return `${ms.toFixed(2)}ms`;
  };

  const getPerformanceColor = (metric: string, value: number): string => {
    switch (metric) {
      case 'LCP':
        return value > 2500 ? 'text-red-500' : value > 1500 ? 'text-yellow-500' : 'text-green-500';
      case 'FID':
        return value > 100 ? 'text-red-500' : value > 50 ? 'text-yellow-500' : 'text-green-500';
      case 'CLS':
        return value > 0.1 ? 'text-red-500' : value > 0.05 ? 'text-yellow-500' : 'text-green-500';
      default:
        return 'text-gray-900 dark:text-white';
    }
  };

  const clearCache = () => {
    setCacheStats({ size: 0, keys: [] });
  };

  if (isLoading) {
    return (
      <Card>
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading performance data...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Performance Dashboard
        </h2>
        <button
          onClick={loadPerformanceData}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Core Web Vitals */}
      <Card>
        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">
          Core Web Vitals
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['LCP', 'FID', 'CLS'].map((vital) => {
            const metric = metrics[vital];
            if (!metric) return null;

            return (
              <div key={vital} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {vital === 'LCP' ? 'Largest Contentful Paint' :
                    vital === 'FID' ? 'First Input Delay' :
                      'Cumulative Layout Shift'}
                </h4>
                <p className={`text-2xl font-bold ${getPerformanceColor(vital, metric.avg)}`}>
                  {vital === 'CLS' ? metric.avg.toFixed(3) : formatMs(metric.avg)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Min: {vital === 'CLS' ? metric.min.toFixed(3) : formatMs(metric.min)} |
                  Max: {vital === 'CLS' ? metric.max.toFixed(3) : formatMs(metric.max)}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">
          Performance Metrics
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Metric
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Average
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Min
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Max
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Count
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {Object.entries(metrics).map(([name, metric]) => (
                <tr key={name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatMs(metric.avg)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatMs(metric.min)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatMs(metric.max)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {metric.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Memory Usage */}
      {memoryUsage && (
        <Card>
          <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">
            Memory Usage
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Used JS Heap Size
              </h4>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatBytes(memoryUsage.usedJSHeapSize)}
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Total JS Heap Size
              </h4>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatBytes(memoryUsage.totalJSHeapSize)}
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                JS Heap Size Limit
              </h4>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatBytes(memoryUsage.jsHeapSizeLimit)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Cache Statistics */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-medium text-gray-900 dark:text-white">
            Cache Statistics
          </h3>
          <button
            onClick={clearCache}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Clear Cache
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Cached Items
            </h4>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {cacheStats.size}
            </p>
          </div>

          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Cache Keys
            </h4>
            <div className="max-h-32 overflow-y-auto">
              {cacheStats.keys.length > 0 ? (
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  {cacheStats.keys.map((key, index) => (
                    <li key={index} className="truncate">{key}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No cached items</p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PerformanceDashboard;