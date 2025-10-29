// Frontend API Service for Navigation
import MVP1ApiClient from './graphqlApiClient';

export interface NavigationItem {
  key: string
  label: string
  labelVietnamese: string
  icon: string
  color: string
  unlockLevel: number
  unlockRequirement?: string
  isUnlocked: boolean
  order: number
  category: 'core' | 'combat' | 'social' | 'premium' | 'settings'
}

export interface NavigationResponse {
  success: boolean
  data: {
    playerId: string
    navigation: NavigationItem[]
    locked: NavigationItem[]
    totalUnlocked: number
    totalLocked: number
  }
}

/**
 * Fetch player navigation from backend API via MVP1ApiClient
 */
export async function getPlayerNavigation(token: string): Promise<NavigationResponse> {
  try {
    // Set auth token if provided
    if (token) {
      MVP1ApiClient.setAuthToken(token);
    }

    // Use centralized API client
    const result = await MVP1ApiClient.getPlayerNavigation();

    if (result.success && result.data) {
      return {
        success: true,
        data: result.data as {
          playerId: string
          navigation: NavigationItem[]
          locked: NavigationItem[]
          totalUnlocked: number
          totalLocked: number
        }
      };
    }

    throw new Error(result.message || 'Failed to fetch navigation');
  } catch (error) {
    console.error('Navigation API error:', error);
    throw error;
  }
}

/**
 * Static navigation fallback (for offline or error states)
 */
export const DEFAULT_NAVIGATION: NavigationItem[] = [
  {
    key: 'game',
    label: 'Home',
    labelVietnamese: 'Trang Chủ',
    icon: 'Home',
    color: '#10b981',
    unlockLevel: 1,
    isUnlocked: true,
    order: 1,
    category: 'core',
  },
  {
    key: 'worldmap',
    label: 'World Map',
    labelVietnamese: 'Bản Đồ',
    icon: 'Map',
    color: '#10b981',
    unlockLevel: 1,
    isUnlocked: true,
    order: 2,
    category: 'core',
  },
  {
    key: 'changelog',
    label: 'Changelog',
    labelVietnamese: 'Cập Nhật',
    icon: 'Book',
    color: '#3b82f6',
    unlockLevel: 1,
    isUnlocked: true,
    order: 3,
    category: 'core',
  },
  {
    key: 'settings',
    label: 'Settings',
    labelVietnamese: 'Cài Đặt',
    icon: 'Settings',
    color: '#6b7280',
    unlockLevel: 1,
    isUnlocked: true,
    order: 99,
    category: 'settings',
  },
]
