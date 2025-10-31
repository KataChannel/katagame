/**
 * 🔔 Advanced Notification System
 * Senior-level resource notification with detailed breakdown
 */

import { Resource } from './types';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  details?: string[];
  duration?: number;
  timestamp: number;
}

export interface ResourceDeficit {
  resource: keyof Resource;
  required: number;
  available: number;
  deficit: number;
}

// Resource display configuration
const RESOURCE_CONFIG: Record<keyof Resource, { icon: string; label: string; color: string }> = {
  gold: { icon: '🏅', label: 'Vàng', color: 'text-yellow-500' },
  rice: { icon: '🌾', label: 'Lúa', color: 'text-green-500' },
  lumber: { icon: '🪵', label: 'Gỗ', color: 'text-amber-600' },
  stone: { icon: '🪨', label: 'Đá', color: 'text-gray-400' },
  bazan: { icon: '🌋', label: 'Đất Đỏ Bazan', color: 'text-red-500' },
  culture: { icon: '📜', label: 'Văn Hóa', color: 'text-purple-500' },
  gems: { icon: '💎', label: 'Ngọc', color: 'text-blue-400' },
};

/**
 * Calculate resource deficits
 */
export function calculateDeficits(
  available: Resource,
  required: Resource
): ResourceDeficit[] {
  const deficits: ResourceDeficit[] = [];
  
  const resourceKeys: (keyof Resource)[] = ['gold', 'rice', 'lumber', 'stone', 'bazan', 'culture'];
  
  resourceKeys.forEach((key) => {
    const requiredAmount = required[key] || 0;
    const availableAmount = available[key] || 0;
    
    if (requiredAmount > 0 && availableAmount < requiredAmount) {
      deficits.push({
        resource: key,
        required: requiredAmount,
        available: availableAmount,
        deficit: requiredAmount - availableAmount,
      });
    }
  });
  
  return deficits;
}

/**
 * Format number with Vietnamese locale
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return Math.floor(num).toLocaleString('vi-VN');
}

/**
 * Create detailed insufficient resources message
 */
export function createInsufficientResourcesNotification(
  available: Resource,
  required: Resource,
  action: string = 'thực hiện hành động này'
): Notification {
  const deficits = calculateDeficits(available, required);
  
  if (deficits.length === 0) {
    return {
      id: `notification-${Date.now()}`,
      type: 'success',
      title: '✅ Đủ tài nguyên',
      message: `Bạn có đủ tài nguyên để ${action}`,
      duration: 3000,
      timestamp: Date.now(),
    };
  }
  
  // Create detailed breakdown
  const details = deficits.map((deficit) => {
    const config = RESOURCE_CONFIG[deficit.resource];
    return `${config.icon} ${config.label}: Thiếu ${formatNumber(deficit.deficit)} (Cần ${formatNumber(deficit.required)}, Có ${formatNumber(deficit.available)})`;
  });
  
  // Summary message
  const resourceNames = deficits.map(d => RESOURCE_CONFIG[d.resource].label).join(', ');
  const message = deficits.length === 1
    ? `Bạn không đủ ${resourceNames} để ${action}`
    : `Bạn thiếu ${deficits.length} loại tài nguyên để ${action}`;
  
  return {
    id: `notification-${Date.now()}`,
    type: 'error',
    title: '⚠️ Không đủ tài nguyên',
    message,
    details,
    duration: 5000,
    timestamp: Date.now(),
  };
}

/**
 * Create success notification for resource operations
 */
export function createSuccessNotification(
  action: string,
  resourcesSpent?: Resource
): Notification {
  let details: string[] | undefined;
  
  if (resourcesSpent) {
    details = [];
    const resourceKeys: (keyof Resource)[] = ['gold', 'rice', 'lumber', 'stone', 'bazan', 'culture'];
    
    resourceKeys.forEach((key) => {
      const amount = resourcesSpent[key];
      if (amount && amount > 0) {
        const config = RESOURCE_CONFIG[key];
        details!.push(`${config.icon} ${config.label}: -${formatNumber(amount)}`);
      }
    });
  }
  
  return {
    id: `notification-${Date.now()}`,
    type: 'success',
    title: '✅ Thành công',
    message: action,
    details,
    duration: 3000,
    timestamp: Date.now(),
  };
}

/**
 * Create info notification
 */
export function createInfoNotification(
  title: string,
  message: string,
  details?: string[]
): Notification {
  return {
    id: `notification-${Date.now()}`,
    type: 'info',
    title: `ℹ️ ${title}`,
    message,
    details,
    duration: 4000,
    timestamp: Date.now(),
  };
}

/**
 * Create warning notification
 */
export function createWarningNotification(
  title: string,
  message: string,
  details?: string[]
): Notification {
  return {
    id: `notification-${Date.now()}`,
    type: 'warning',
    title: `⚠️ ${title}`,
    message,
    details,
    duration: 4000,
    timestamp: Date.now(),
  };
}

/**
 * Get resource cost display string
 */
export function getResourceCostDisplay(cost: Resource): string {
  const parts: string[] = [];
  const resourceKeys: (keyof Resource)[] = ['gold', 'rice', 'lumber', 'stone', 'bazan', 'culture'];
  
  resourceKeys.forEach((key) => {
    const amount = cost[key];
    if (amount && amount > 0) {
      const config = RESOURCE_CONFIG[key];
      parts.push(`${config.icon} ${formatNumber(amount)}`);
    }
  });
  
  return parts.join(' | ');
}

/**
 * Check if player can afford and return user-friendly message
 */
export function checkAffordability(
  available: Resource,
  required: Resource
): { canAfford: boolean; message?: string; deficits?: ResourceDeficit[] } {
  const deficits = calculateDeficits(available, required);
  
  if (deficits.length === 0) {
    return { canAfford: true };
  }
  
  const resourceNames = deficits.map(d => RESOURCE_CONFIG[d.resource].label).join(', ');
  const message = deficits.length === 1
    ? `Thiếu ${resourceNames}`
    : `Thiếu ${deficits.length} loại tài nguyên`;
  
  return {
    canAfford: false,
    message,
    deficits,
  };
}
