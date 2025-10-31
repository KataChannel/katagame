'use client';

/**
 * 🧪 Test Toast Notifications
 * Demo component để test notification system
 */

import { useGameStore } from '@/lib/gameStore';
import { createInsufficientResourcesNotification, createSuccessNotification } from '@/lib/notifications';

export function NotificationTest() {
  const addNotification = useGameStore((state) => state.addNotification);
  const player = useGameStore((state) => state.player);

  const testInsufficientResources = () => {
    const required = {
      gold: 100,
      rice: 50,
      lumber: 30,
      stone: 20,
      bazan: 10,
      culture: 5,
    };

    addNotification(
      createInsufficientResourcesNotification(
        player.totalResources,
        required,
        'test hành động'
      )
    );
  };

  const testSuccess = () => {
    addNotification(
      createSuccessNotification(
        'Test thành công!',
        { gold: 10, rice: 5, lumber: 3, stone: 2, bazan: 1, culture: 1 }
      )
    );
  };

  const testError = () => {
    addNotification({
      type: 'error',
      title: 'Lỗi Test',
      message: 'Đây là thông báo lỗi test',
      details: ['Chi tiết lỗi 1', 'Chi tiết lỗi 2'],
    });
  };

  const testWarning = () => {
    addNotification({
      type: 'warning',
      title: 'Cảnh báo Test',
      message: 'Đây là thông báo cảnh báo test',
    });
  };

  const testInfo = () => {
    addNotification({
      type: 'info',
      title: 'Thông tin Test',
      message: 'Đây là thông báo thông tin test',
      details: ['Info 1', 'Info 2', 'Info 3'],
    });
  };

  return (
    <div className="fixed bottom-4 left-4 z-[10000] bg-black/80 backdrop-blur-md p-4 rounded-lg border border-white/20">
      <h3 className="text-white font-bold mb-3">🧪 Test Notifications</h3>
      <div className="flex flex-col gap-2">
        <button
          onClick={testInsufficientResources}
          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded"
        >
          Test Insufficient Resources
        </button>
        <button
          onClick={testSuccess}
          className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded"
        >
          Test Success
        </button>
        <button
          onClick={testError}
          className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
        >
          Test Error
        </button>
        <button
          onClick={testWarning}
          className="px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded"
        >
          Test Warning
        </button>
        <button
          onClick={testInfo}
          className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded"
        >
          Test Info
        </button>
      </div>
      <p className="text-xs text-white/60 mt-3">
        Click buttons để test các loại thông báo
      </p>
    </div>
  );
}
