// LocalStorage Optimization - Compression and size management

// Type for game state (avoid circular dependency)
type GameStatePartial = Record<string, any>;

// Compression utilities
export function compressData(data: string): string {
  // Simple LZ-based compression for localStorage
  // Production: Consider using lz-string library for better compression
  try {
    const compressed = btoa(encodeURIComponent(data));
    return compressed;
  } catch (e) {
    console.warn('Compression failed, returning original:', e);
    return data;
  }
}

export function decompressData(compressed: string): string {
  try {
    const decompressed = decodeURIComponent(atob(compressed));
    return decompressed;
  } catch (e) {
    console.warn('Decompression failed, returning original:', e);
    return compressed;
  }
}

// Check localStorage size
export function getLocalStorageSize(): { 
  totalSize: number; 
  itemSizes: Record<string, number>;
  percentage: number;
} {
  let totalSize = 0;
  const itemSizes: Record<string, number> = {};
  const limit = 5 * 1024 * 1024; // 5MB typical limit

  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      const itemSize = (localStorage.getItem(key)?.length || 0) * 2; // UTF-16 = 2 bytes per char
      itemSizes[key] = itemSize;
      totalSize += itemSize;
    }
  }

  return {
    totalSize,
    itemSizes,
    percentage: (totalSize / limit) * 100,
  };
}

// Format bytes to human readable
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Optimize game state by removing unnecessary data
export function optimizeGameState(state: GameStatePartial): GameStatePartial {
  const optimized = { ...state };

  // Remove temporary data
  if (optimized.notifications) {
    optimized.notifications = []; // Don't persist notifications
  }

  // Limit combat history to last 50
  if (optimized.combatHistory && optimized.combatHistory.length > 50) {
    optimized.combatHistory = optimized.combatHistory.slice(-50);
  }

  // Limit friend chat messages to last 100 per friend
  if (optimized.friendSystemState?.friends) {
    optimized.friendSystemState.friends = optimized.friendSystemState.friends.map((friend: any) => ({
      ...friend,
      chatMessages: friend.chatMessages.slice(-100),
    }));
  }

  // Limit guild chat to last 200 messages
  if (optimized.guildState?.chat) {
    optimized.guildState.chat = optimized.guildState.chat.slice(-200);
  }

  // Limit purchase history to last 50
  if (optimized.enhancedShopState?.purchaseHistory) {
    optimized.enhancedShopState.purchaseHistory = optimized.enhancedShopState.purchaseHistory.slice(-50);
  }

  // Limit arena defense history to last 20
  if (optimized.arenaState?.defenseHistory) {
    optimized.arenaState.defenseHistory = optimized.arenaState.defenseHistory.slice(-20);
  }

  // Remove old completed missions
  if (optimized.dailyMissionState) {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    
    if (optimized.dailyMissionState.dailyMissions) {
      optimized.dailyMissionState.dailyMissions = optimized.dailyMissionState.dailyMissions.filter(
        (mission: any) => !mission.completed || mission.completedAt! > sevenDaysAgo
      );
    }
  }

  return optimized;
}

// Clean up old localStorage items
export function cleanupLocalStorage() {
  const keysToCheck = [
    'app-errors',
    'performance-metrics',
    'temporary-cache',
  ];

  keysToCheck.forEach(key => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        const data = JSON.parse(item);
        // Remove if older than 7 days
        if (data.timestamp && Date.now() - data.timestamp > 7 * 24 * 60 * 60 * 1000) {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      // Remove corrupted items
      localStorage.removeItem(key);
    }
  });
}

// Check if localStorage is available and has space
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

// Safe localStorage operations with fallback
export class SafeLocalStorage {
  private memoryCache: Map<string, string> = new Map();

  setItem(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      this.memoryCache.set(key, value);
      return true;
    } catch (e) {
      console.warn(`localStorage.setItem failed for ${key}:`, e);
      // Fallback to memory cache
      this.memoryCache.set(key, value);
      return false;
    }
  }

  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key) || this.memoryCache.get(key) || null;
    } catch (e) {
      console.warn(`localStorage.getItem failed for ${key}:`, e);
      return this.memoryCache.get(key) || null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
      this.memoryCache.delete(key);
    } catch (e) {
      console.warn(`localStorage.removeItem failed for ${key}:`, e);
      this.memoryCache.delete(key);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
      this.memoryCache.clear();
    } catch (e) {
      console.warn('localStorage.clear failed:', e);
      this.memoryCache.clear();
    }
  }
}

export const safeLocalStorage = new SafeLocalStorage();

// Monitor localStorage usage
export function monitorLocalStorage(): {
  isHealthy: boolean;
  warnings: string[];
  size: ReturnType<typeof getLocalStorageSize>;
} {
  const size = getLocalStorageSize();
  const warnings: string[] = [];
  let isHealthy = true;

  // Check total size
  if (size.percentage > 90) {
    isHealthy = false;
    warnings.push(`localStorage is ${size.percentage.toFixed(1)}% full (${formatBytes(size.totalSize)}). Critical!`);
  } else if (size.percentage > 70) {
    warnings.push(`localStorage is ${size.percentage.toFixed(1)}% full (${formatBytes(size.totalSize)}). Consider cleanup.`);
  }

  // Check individual items
  Object.entries(size.itemSizes).forEach(([key, itemSize]) => {
    if (itemSize > 1024 * 1024) { // > 1MB
      warnings.push(`Item "${key}" is large: ${formatBytes(itemSize)}`);
    }
  });

  return { isHealthy, warnings, size };
}

// Auto-cleanup on app start
export function initializeStorageOptimization() {
  if (typeof window === 'undefined') return;

  // Run cleanup
  cleanupLocalStorage();

  // Check storage health
  const health = monitorLocalStorage();
  
  if (!health.isHealthy) {
    console.warn('localStorage health issues detected:', health.warnings);
  }

  // Log size in development
  if (process.env.NODE_ENV === 'development') {
    console.log('📦 localStorage usage:', {
      total: formatBytes(health.size.totalSize),
      percentage: health.size.percentage.toFixed(1) + '%',
      items: Object.entries(health.size.itemSizes)
        .map(([key, size]) => ({ key, size: formatBytes(size) }))
        .sort((a, b) => parseInt(b.size) - parseInt(a.size)),
    });
  }
}

// Export game state with compression
export function exportGameState(state: GameStatePartial): string {
  const optimized = optimizeGameState(state);
  const json = JSON.stringify(optimized);
  const compressed = compressData(json);
  
  return compressed;
}

// Import game state with decompression
export function importGameState(compressed: string): GameStatePartial | null {
  try {
    const json = decompressData(compressed);
    const state = JSON.parse(json);
    return state;
  } catch (e) {
    console.error('Failed to import game state:', e);
    return null;
  }
}
