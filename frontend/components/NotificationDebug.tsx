'use client';

/**
 * 🐛 Notification Debug Panel
 * Hiển thị tất cả notifications đang active để debug
 */

import { useGameStore } from '@/lib/gameStore';

export function NotificationDebug() {
  const notifications = useGameStore((state) => state.notifications);
  const removeNotification = useGameStore((state) => state.removeNotification);

  if (notifications.length === 0) {
    return (
      <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs">
        <div className="font-bold mb-2">🔔 Notifications Debug</div>
        <div className="text-gray-400">No active notifications</div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-md z-[10000]">
      <div className="font-bold mb-2">🔔 Active Notifications ({notifications.length})</div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {notifications.map((notif) => {
          const age = Date.now() - notif.timestamp;
          const maxAge = notif.duration || 4000;
          const remaining = Math.max(0, maxAge - age);
          
          return (
            <div key={notif.id} className="border border-gray-700 p-2 rounded">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <div className="font-semibold text-yellow-400">{notif.title}</div>
                  <div className="text-gray-300 text-xs">{notif.message}</div>
                  <div className="text-gray-500 text-xs mt-1">
                    ID: {notif.id} | Age: {age}ms | Remaining: {remaining}ms
                  </div>
                  {notif.details && (
                    <div className="text-gray-400 text-xs mt-1">
                      Details: {notif.details.length} items
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeNotification(notif.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                >
                  Kill
                </button>
              </div>
              {/* Progress bar */}
              <div className="mt-2 bg-gray-700 h-1 rounded overflow-hidden">
                <div
                  className="bg-green-500 h-full transition-all"
                  style={{ width: `${(remaining / maxAge) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <button
        onClick={() => {
          notifications.forEach((n) => removeNotification(n.id));
        }}
        className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs w-full"
      >
        Clear All ({notifications.length})
      </button>
    </div>
  );
}
