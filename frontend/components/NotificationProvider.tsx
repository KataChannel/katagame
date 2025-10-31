'use client';

/**
 * 🔔 Notification Provider
 * Manages global toast notifications
 */

import { useEffect } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { ToastContainer } from './Toast';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const notifications = useGameStore((state) => state.notifications);
  const removeNotification = useGameStore((state) => state.removeNotification);

  // Auto-cleanup old notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      notifications.forEach((notif) => {
        const age = now - notif.timestamp;
        const maxAge = notif.duration || 4000; // ✅ Fallback 4s nếu không có duration
        if (age > maxAge) {
          console.log(`🗑️ Auto-removing notification: ${notif.id} (age: ${age}ms, maxAge: ${maxAge}ms)`);
          removeNotification(notif.id);
        }
      });
    }, 500); // ✅ Check mỗi 500ms để responsive hơn

    return () => clearInterval(interval);
  }, [notifications, removeNotification]);

  return (
    <>
      {children}
      <ToastContainer 
        notifications={notifications} 
        onClose={removeNotification}
        position="top-right"
      />
    </>
  );
}
