import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, Gift } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'reward';
  title: string;
  message: string;
  duration?: number;
  icon?: React.ReactNode;
}

interface NotificationSystemProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const NotificationSystem = ({ notifications, onRemove }: NotificationSystemProps) => {
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration !== 0) {
        const timer = setTimeout(() => {
          onRemove(notification.id);
        }, notification.duration || 4000);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, onRemove]);

  const getIcon = (type: string, customIcon?: React.ReactNode) => {
    if (customIcon) return customIcon;
    
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5" />;
      case 'error': return <AlertCircle className="h-5 w-5" />;
      case 'reward': return <Gift className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white border-green-600';
      case 'error':
        return 'bg-red-500 text-white border-red-600';
      case 'reward':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-yellow-600';
      default:
        return 'bg-blue-500 text-white border-blue-600';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`p-4 rounded-lg shadow-lg border-l-4 ${getStyles(notification.type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getIcon(notification.type, notification.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm">{notification.title}</h4>
                  <p className="text-sm opacity-90 mt-1">{notification.message}</p>
                </div>
              </div>
              <button
                onClick={() => onRemove(notification.id)}
                className="flex-shrink-0 ml-2 opacity-70 hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hook for managing notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showSuccess = (title: string, message: string) => {
    addNotification({ type: 'success', title, message });
  };

  const showError = (title: string, message: string) => {
    addNotification({ type: 'error', title, message });
  };

  const showInfo = (title: string, message: string) => {
    addNotification({ type: 'info', title, message });
  };

  const showReward = (title: string, message: string, icon?: React.ReactNode) => {
    addNotification({ type: 'reward', title, message, icon });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showInfo,
    showReward,
    NotificationComponent: () => (
      <NotificationSystem 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
    )
  };
};

export default NotificationSystem;