import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner = ({ size = 'md', className = '' }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={className}
    >
      <Loader2 className={`${sizeClasses[size]} text-red-500`} />
    </motion.div>
  );
};

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen = ({ message = 'Đang tải...' }: LoadingScreenProps) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-red-50 via-yellow-50 to-orange-50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <div className="mb-4">
          <LoadingSpinner size="lg" className="mx-auto" />
        </div>
        <h2 className="text-xl font-bold text-red-800 mb-2">🇻🇳 Đất Việt Truyền Thuyết</h2>
        <p className="text-gray-600">{message}</p>
        
        {/* Vietnamese cultural loading messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-4 text-sm text-gray-500"
        >
          Đang chuẩn bị hành trình khám phá văn hóa Việt Nam...
        </motion.div>
      </motion.div>
    </div>
  );
};

interface ProgressBarProps {
  progress: number;
  max: number;
  label?: string;
  color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple';
  showPercentage?: boolean;
  animated?: boolean;
}

export const ProgressBar = ({ 
  progress, 
  max, 
  label, 
  color = 'red', 
  showPercentage = true,
  animated = true 
}: ProgressBarProps) => {
  const percentage = Math.min((progress / max) * 100, 100);
  
  const colorClasses = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-semibold text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-600">{progress}/{max}</span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={animated ? { duration: 0.5, ease: 'easeOut' } : { duration: 0 }}
          className={`h-2.5 rounded-full ${colorClasses[color]} transition-all duration-300`}
        />
      </div>
      {showPercentage && (
        <div className="text-xs text-gray-500 mt-1 text-center">
          {percentage.toFixed(0)}%
        </div>
      )}
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Game Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">😢</div>
            <h2 className="text-2xl font-bold text-red-800 mb-4">Oops! Có lỗi xảy ra</h2>
            <p className="text-gray-600 mb-6">
              Game gặp sự cố kỹ thuật. Vui lòng tải lại trang để tiếp tục chơi.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
            >
              🔄 Tải Lại Game
            </button>
            <div className="mt-4 text-sm text-gray-500">
              <p>Nếu lỗi tiếp tục, vui lòng liên hệ hỗ trợ:</p>
              <p>📧 support@katagame.vn</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Need to import React
import React from 'react';

export default LoadingSpinner;