'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Clock,
  Database,
  Zap,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Trash2,
} from 'lucide-react';
import {
  performanceMonitor,
  getPerformanceScore,
  logPerformanceMetrics,
} from '../lib/performanceMonitor';
import {
  getLocalStorageSize,
  formatBytes,
  monitorLocalStorage,
  cleanupLocalStorage,
} from '../lib/storageOptimization';
import { getStoredErrors, clearStoredErrors } from './ErrorBoundary';

export default function AnalyticsTab() {
  const [performanceScore, setPerformanceScore] = useState(getPerformanceScore());
  const [storageHealth, setStorageHealth] = useState(monitorLocalStorage());
  const [componentMetrics, setComponentMetrics] = useState(performanceMonitor.getComponentMetrics());
  const [errors, setErrors] = useState(getStoredErrors());
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Update metrics every 5 seconds
    const interval = setInterval(() => {
      setPerformanceScore(getPerformanceScore());
      setStorageHealth(monitorLocalStorage());
      setComponentMetrics(performanceMonitor.getComponentMetrics());
      setErrors(getStoredErrors());
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    logPerformanceMetrics();
  };

  const handleCleanup = () => {
    cleanupLocalStorage();
    setStorageHealth(monitorLocalStorage());
  };

  const handleClearErrors = () => {
    clearStoredErrors();
    setErrors([]);
  };

  const handleExportMetrics = () => {
    const data = performanceMonitor.exportMetrics();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'excellent':
      case 'good':
        return <CheckCircle className="w-6 h-6" />;
      case 'needs-improvement':
        return <AlertTriangle className="w-6 h-6" />;
      case 'poor':
        return <TrendingDown className="w-6 h-6" />;
      default:
        return <BarChart3 className="w-6 h-6" />;
    }
  };

  const slowestComponents = performanceMonitor.getSlowestComponents(5);
  const pageMetrics = performanceMonitor.getPageLoadMetrics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 mb-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-white" />
            <div>
              <h2 className="text-white font-bold text-xl">Analytics & Performance</h2>
              <p className="text-indigo-200 text-sm">Monitor app health and optimization</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleExportMetrics}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Performance Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 mb-4 shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-gray-900">Performance Score</h3>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getRatingColor(performanceScore.rating)}`}>
            {getRatingIcon(performanceScore.rating)}
            <span className="font-bold text-lg">{performanceScore.score}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <motion.div
            className={`h-4 rounded-full ${
              performanceScore.score >= 90 ? 'bg-green-500' :
              performanceScore.score >= 70 ? 'bg-blue-500' :
              performanceScore.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${performanceScore.score}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>

        <div className="text-center mb-4">
          <span className={`text-lg font-bold ${getRatingColor(performanceScore.rating).split(' ')[0]}`}>
            {performanceScore.rating.toUpperCase().replace('-', ' ')}
          </span>
        </div>

        {/* Recommendations */}
        {performanceScore.recommendations.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Recommendations
            </h4>
            <ul className="space-y-1">
              {performanceScore.recommendations.map((rec, index) => (
                <li key={index} className="text-yellow-700 text-sm flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>

      {/* Page Load Metrics */}
      {pageMetrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 mb-4 shadow-lg"
        >
          <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Page Load Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard
              label="Page Load Time"
              value={pageMetrics.pageLoadTime?.toFixed(0) + 'ms'}
              icon={<Zap className="w-5 h-5" />}
              color="blue"
            />
            <MetricCard
              label="Time to Interactive"
              value={pageMetrics.timeToInteractive?.toFixed(0) + 'ms'}
              icon={<TrendingUp className="w-5 h-5" />}
              color="green"
            />
            {pageMetrics.memoryUsage && (
              <MetricCard
                label="Memory Usage"
                value={formatBytes(pageMetrics.memoryUsage.usedJSHeapSize)}
                icon={<Database className="w-5 h-5" />}
                color="purple"
              />
            )}
          </div>
        </motion.div>
      )}

      {/* Storage Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl p-6 mb-4 shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-600" />
            localStorage Health
          </h3>
          <button
            onClick={handleCleanup}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Cleanup
          </button>
        </div>

        {/* Storage usage bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Storage Used: {formatBytes(storageHealth.size.totalSize)}</span>
            <span>{storageHealth.size.percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className={`h-3 rounded-full ${
                storageHealth.size.percentage > 90 ? 'bg-red-500' :
                storageHealth.size.percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(storageHealth.size.percentage, 100)}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        {/* Warnings */}
        {storageHealth.warnings.length > 0 && (
          <div className={`${storageHealth.isHealthy ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4`}>
            <h4 className={`font-bold ${storageHealth.isHealthy ? 'text-yellow-800' : 'text-red-800'} mb-2 flex items-center gap-2`}>
              <AlertTriangle className="w-5 h-5" />
              Warnings
            </h4>
            <ul className="space-y-1">
              {storageHealth.warnings.map((warning, index) => (
                <li key={index} className={`${storageHealth.isHealthy ? 'text-yellow-700' : 'text-red-700'} text-sm flex items-start gap-2`}>
                  <span className={storageHealth.isHealthy ? 'text-yellow-500' : 'text-red-500'}>•</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Storage items breakdown */}
        <div className="mt-4">
          <h4 className="font-semibold text-gray-700 mb-2">Storage Breakdown</h4>
          <div className="space-y-2">
            {Object.entries(storageHealth.size.itemSizes)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([key, size]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate mr-2">{key}</span>
                  <span className="text-gray-900 font-medium">{formatBytes(size)}</span>
                </div>
              ))}
          </div>
        </div>
      </motion.div>

      {/* Component Performance */}
      {slowestComponents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 mb-4 shadow-lg"
        >
          <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-orange-600" />
            Slowest Components
          </h3>
          <div className="space-y-3">
            {slowestComponents.map((comp, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{comp.componentName}</div>
                  <div className="text-sm text-gray-500">
                    Rendered {comp.renderCount} times
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                  comp.renderTime > 100 ? 'bg-red-100 text-red-700' :
                  comp.renderTime > 50 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {comp.renderTime.toFixed(2)}ms
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Error Log */}
      {errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 mb-4 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              Error Log ({errors.length})
            </h3>
            <button
              onClick={handleClearErrors}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {errors.map((error: any, index: number) => (
              <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="font-medium text-red-900 mb-1">{error.message}</div>
                <div className="text-sm text-red-600 mb-2">{new Date(error.timestamp).toLocaleString()}</div>
                {error.stack && (
                  <details className="text-xs text-gray-600">
                    <summary className="cursor-pointer font-medium">Stack Trace</summary>
                    <pre className="mt-2 overflow-x-auto">{error.stack}</pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Metric Card Component
function MetricCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colors = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100',
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${colors[color]} mb-2`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}
