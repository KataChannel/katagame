// Frontend API Service for Navigation
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:11001'

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
 * Fetch player navigation from backend API
 */
export async function getPlayerNavigation(token: string): Promise<NavigationResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/navigation/player`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch navigation: ${response.statusText}`)
  }

  const result = await response.json()
  return result.body || result
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
