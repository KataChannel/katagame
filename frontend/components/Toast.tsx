'use client';

/**
 * 🎨 Professional Toast Notification Component
 * Senior-level UI with animations and detailed breakdown
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Notification, NotificationType } from '@/lib/notifications';

interface ToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

const ICON_MAP: Record<NotificationType, React.ComponentType<any>> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLOR_MAP: Record<NotificationType, { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'bg-green-500/10 backdrop-blur-md',
    border: 'border-green-500/50',
    icon: 'text-green-500',
  },
  error: {
    bg: 'bg-red-500/10 backdrop-blur-md',
    border: 'border-red-500/50',
    icon: 'text-red-500',
  },
  warning: {
    bg: 'bg-yellow-500/10 backdrop-blur-md',
    border: 'border-yellow-500/50',
    icon: 'text-yellow-500',
  },
  info: {
    bg: 'bg-blue-500/10 backdrop-blur-md',
    border: 'border-blue-500/50',
    icon: 'text-blue-500',
  },
};

export function Toast({ notification, onClose }: ToastProps) {
  // Validate notification type and provide fallback
  const validType: NotificationType = 
    (notification.type === 'success' || 
     notification.type === 'error' || 
     notification.type === 'warning' || 
     notification.type === 'info') 
    ? notification.type 
    : 'info'; // Default fallback

  const Icon = ICON_MAP[validType];
  const colors = COLOR_MAP[validType];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`
        ${colors.bg} ${colors.border}
        border-2 rounded-lg shadow-2xl
        p-4 min-w-[320px] max-w-[420px]
        relative overflow-hidden
      `}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-20">
        <div className={`absolute inset-0 ${colors.icon} blur-3xl`} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-1">
            <Icon className={`h-5 w-5 ${colors.icon} flex-shrink-0`} />
            <h4 className="font-bold text-white text-sm">{notification.title}</h4>
          </div>
          
          <button
            onClick={() => onClose(notification.id)}
            className="text-white/60 hover:text-white transition-colors flex-shrink-0 z-20 cursor-pointer"
            aria-label="Đóng thông báo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Message */}
        <p className="text-white/90 text-sm mb-2 pl-7">{notification.message}</p>

        {/* Details breakdown */}
        {notification.details && notification.details.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-3 pl-7 space-y-1"
          >
            <div className="text-xs text-white/70 font-semibold mb-1">Chi tiết:</div>
            {notification.details.map((detail, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="text-xs text-white/80 bg-black/20 rounded px-2 py-1 font-mono"
              >
                {detail}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Progress bar */}
        {notification.duration && (
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: notification.duration / 1000, ease: 'linear' }}
            className={`absolute bottom-0 left-0 h-1 ${colors.icon} origin-left`}
            style={{ width: '100%', opacity: 0.5 }}
          />
        )}
      </div>
    </motion.div>
  );
}

interface ToastContainerProps {
  notifications: Notification[];
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function ToastContainer({ 
  notifications, 
  onClose,
  position = 'top-right'
}: ToastContainerProps) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-[9999] flex flex-col gap-3`}>
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <Toast
            key={notification.id}
            notification={notification}
            onClose={onClose}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
