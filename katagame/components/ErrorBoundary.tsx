'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, componentName } = this.props;

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error in ${componentName || 'Component'}:`, error);
      console.error('Error Info:', errorInfo);
    }

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Track error count
    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Log to external service (optional)
    this.logErrorToService(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys } = this.props;
    const { hasError } = this.state;

    // Reset error boundary if resetKeys change
    if (hasError && resetKeys && prevProps.resetKeys) {
      const hasChangedKeys = resetKeys.some(
        (key, index) => key !== prevProps.resetKeys![index]
      );

      if (hasChangedKeys) {
        this.reset();
      }
    }
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };

    // Store in localStorage for debugging
    try {
      const errors = JSON.parse(localStorage.getItem('app-errors') || '[]');
      errors.push(errorData);
      // Keep only last 10 errors
      if (errors.length > 10) errors.shift();
      localStorage.setItem('app-errors', JSON.stringify(errors));
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  private reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    const { hasError, error, errorInfo, errorCount } = this.state;
    const { children, fallback, componentName } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 rounded-full p-6">
                <AlertTriangle className="w-16 h-16 text-red-600" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
              Oops! Có lỗi xảy ra
            </h1>

            {/* Description */}
            <p className="text-gray-600 text-center mb-6">
              {componentName 
                ? `Lỗi trong component: ${componentName}`
                : 'Ứng dụng gặp sự cố không mong muốn'}
            </p>

            {/* Error count warning */}
            {errorCount > 1 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <p className="text-orange-800 text-sm text-center">
                  ⚠️ Lỗi đã xảy ra {errorCount} lần. Có thể cần reload trang.
                </p>
              </div>
            )}

            {/* Error details (development only) */}
            {process.env.NODE_ENV === 'development' && error && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 overflow-auto max-h-64">
                <p className="font-mono text-sm text-red-600 mb-2">
                  <strong>Error:</strong> {error.message}
                </p>
                {error.stack && (
                  <pre className="font-mono text-xs text-gray-700 overflow-x-auto">
                    {error.stack}
                  </pre>
                )}
                {errorInfo?.componentStack && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-700 mb-2">
                      Component Stack
                    </summary>
                    <pre className="font-mono text-xs text-gray-600 overflow-x-auto">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={this.reset}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Thử Lại
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors"
              >
                <Home className="w-5 h-5" />
                Về Trang Chủ
              </button>
              {errorCount > 2 && (
                <button
                  onClick={this.handleReload}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Reload Trang
                </button>
              )}
            </div>

            {/* Help text */}
            <p className="text-gray-500 text-sm text-center mt-6">
              Nếu vấn đề vẫn tiếp diễn, vui lòng liên hệ hỗ trợ.
            </p>
          </div>
        </div>
      );
    }

    return children;
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Utility to get stored errors from localStorage
export function getStoredErrors(): Array<{
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
}> {
  if (typeof window === 'undefined') return [];
  
  try {
    const errors = localStorage.getItem('app-errors');
    return errors ? JSON.parse(errors) : [];
  } catch (e) {
    return [];
  }
}

// Utility to clear stored errors
export function clearStoredErrors() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('app-errors');
  }
}
