import { initDatabase } from './database.service'

/**
 * Navigation Service
 * Manages dynamic navigation based on player progression and game features
 */

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

export class NavigationService {
  /**
   * Get navigation items for a player based on their level and progression
   */
  async getPlayerNavigation(playerId: string): Promise<NavigationItem[]> {
    // Ensure database is initialized
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame'
    const db = initDatabase(databaseUrl)
    
    // Get player data
    const playerQuery = await db.query(
      `SELECT level, resources, premium_pass_active 
       FROM players WHERE id = $1`,
      [playerId]
    )
    
    if (playerQuery.rows.length === 0) {
      throw new Error('Player not found')
    }
    
    const player = playerQuery.rows[0]
    const playerLevel = player.level
    const isPremium = player.premium_pass_active
    const resources = player.resources || {}
    
    // Get player tutorial progress
    const tutorialQuery = await db.query(
      `SELECT tutorial_completed, tutorial_step 
       FROM player_stats WHERE player_id = $1`,
      [playerId]
    )
    
    const tutorialCompleted = tutorialQuery.rows[0]?.tutorial_completed || false
    const tutorialStep = tutorialQuery.rows[0]?.tutorial_step || 1
    
    // Define all navigation items with unlock requirements
    const allNavItems: NavigationItem[] = [
      // CORE FEATURES
      {
        key: 'game',
        label: 'Home',
        labelVietnamese: 'Trang Chủ',
        icon: 'Home',
        color: '#10b981',
        unlockLevel: 1,
        isUnlocked: true, // Always unlocked
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
        unlockRequirement: 'tutorial_step_1',
        isUnlocked: tutorialStep >= 1,
        order: 2,
        category: 'core',
      },
      {
        key: 'culture',
        label: 'Stories',
        labelVietnamese: 'Văn Hóa',
        icon: 'Book',
        color: '#8b5cf6',
        unlockLevel: 2,
        unlockRequirement: 'tutorial_step_5',
        isUnlocked: playerLevel >= 2 && tutorialStep >= 5,
        order: 3,
        category: 'core',
      },
      {
        key: 'missions',
        label: 'Missions',
        labelVietnamese: 'Nhiệm Vụ',
        icon: 'Target',
        color: '#f59e0b',
        unlockLevel: 3,
        isUnlocked: playerLevel >= 3,
        order: 4,
        category: 'core',
      },
      
      // COMBAT & HEROES
      {
        key: 'heroes',
        label: 'Heroes',
        labelVietnamese: 'Anh Hùng',
        icon: 'UsersIcon',
        color: '#7c3aed',
        unlockLevel: 3,
        unlockRequirement: 'tutorial_step_4',
        isUnlocked: playerLevel >= 3 && tutorialStep >= 4,
        order: 5,
        category: 'combat',
      },
      {
        key: 'combat',
        label: 'Combat',
        labelVietnamese: 'Chiến Đấu',
        icon: 'Swords',
        color: '#dc2626',
        unlockLevel: 5,
        unlockRequirement: 'has_hero',
        isUnlocked: playerLevel >= 5,
        order: 6,
        category: 'combat',
      },
      {
        key: 'arena',
        label: 'Arena',
        labelVietnamese: 'Đấu Trường',
        icon: 'Trophy',
        color: '#ef4444',
        unlockLevel: 10,
        isUnlocked: playerLevel >= 10,
        order: 7,
        category: 'combat',
      },
      
      // SOCIAL FEATURES
      {
        key: 'friends',
        label: 'Friends',
        labelVietnamese: 'Bạn Bè',
        icon: 'UserPlus',
        color: '#3b82f6',
        unlockLevel: 5,
        isUnlocked: playerLevel >= 5,
        order: 8,
        category: 'social',
      },
      {
        key: 'guild',
        label: 'Guild',
        labelVietnamese: 'Bang Hội',
        icon: 'Shield',
        color: '#f59e0b',
        unlockLevel: 8,
        isUnlocked: playerLevel >= 8,
        order: 9,
        category: 'social',
      },
      {
        key: 'multiplayer',
        label: 'Multiplayer',
        labelVietnamese: 'Nhiều Người',
        icon: 'Radio',
        color: '#a855f7',
        unlockLevel: 12,
        isUnlocked: playerLevel >= 12,
        order: 10,
        category: 'social',
      },
      
      // PREMIUM & SHOP
      {
        key: 'shop',
        label: 'Shop',
        labelVietnamese: 'Cửa Hàng',
        icon: 'ShoppingCart',
        color: '#8b5cf6',
        unlockLevel: 2,
        isUnlocked: playerLevel >= 2,
        order: 11,
        category: 'premium',
      },
      {
        key: 'marketplace',
        label: 'Marketplace',
        labelVietnamese: 'Chợ',
        icon: 'Store',
        color: '#ec4899',
        unlockLevel: 6,
        isUnlocked: playerLevel >= 6,
        order: 12,
        category: 'premium',
      },
      {
        key: 'gacha',
        label: 'Gacha',
        labelVietnamese: 'Triệu Hồi',
        icon: 'Gem',
        color: '#a855f7',
        unlockLevel: 7,
        unlockRequirement: 'achievement_hero_collector',
        isUnlocked: playerLevel >= 7,
        order: 13,
        category: 'premium',
      },
      {
        key: 'battlepass',
        label: 'Battle Pass',
        labelVietnamese: 'Thẻ Chiến Đấu',
        icon: 'Sparkles',
        color: '#d946ef',
        unlockLevel: 5,
        isUnlocked: playerLevel >= 5,
        order: 14,
        category: 'premium',
      },
      {
        key: 'premium',
        label: 'Premium',
        labelVietnamese: 'VIP',
        icon: 'Crown',
        color: '#fbbf24',
        unlockLevel: 1,
        isUnlocked: true, // Always show premium
        order: 15,
        category: 'premium',
      },
      
      // ADDITIONAL FEATURES
      {
        key: 'achievements',
        label: 'Achievements',
        labelVietnamese: 'Thành Tựu',
        icon: 'Trophy',
        color: '#fbbf24',
        unlockLevel: 4,
        isUnlocked: playerLevel >= 4,
        order: 16,
        category: 'core',
      },
      {
        key: 'customization',
        label: 'Customization',
        labelVietnamese: 'Tùy Chỉnh',
        icon: 'Palette',
        color: '#ec4899',
        unlockLevel: 15,
        isUnlocked: isPremium && playerLevel >= 15,
        order: 17,
        category: 'premium',
      },
      {
        key: 'analytics',
        label: 'Analytics',
        labelVietnamese: 'Thống Kê',
        icon: 'BarChart3',
        color: '#06b6d4',
        unlockLevel: 10,
        isUnlocked: playerLevel >= 10,
        order: 18,
        category: 'core',
      },
      
      // SETTINGS (Always unlocked)
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
    
    // Filter to only unlocked items and sort by order
    const unlockedItems = allNavItems
      .filter(item => item.isUnlocked)
      .sort((a, b) => a.order - b.order)
    
    return unlockedItems
  }
  
  /**
   * Check if a specific feature is unlocked for a player
   */
  async isFeatureUnlocked(
    playerId: string,
    featureKey: string
  ): Promise<boolean> {
    const navItems = await this.getPlayerNavigation(playerId)
    const feature = navItems.find(item => item.key === featureKey)
    return feature?.isUnlocked || false
  }
  
  /**
   * Get locked features with unlock requirements
   */
  async getLockedFeatures(playerId: string): Promise<NavigationItem[]> {
    // Ensure database is initialized
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame'
    const db = initDatabase(databaseUrl)
    
    const playerQuery = await db.query(
      `SELECT level FROM players WHERE id = $1`,
      [playerId]
    )
    
    if (playerQuery.rows.length === 0) {
      throw new Error('Player not found')
    }
    
    const playerLevel = playerQuery.rows[0].level
    
    // Return features that are close to being unlocked (within 5 levels)
    const allNavItems = await this.getPlayerNavigation(playerId)
    
    return allNavItems.filter(
      item => !item.isUnlocked && item.unlockLevel <= playerLevel + 5
    )
  }
}

// Export singleton instance
let navigationService: NavigationService | null = null

export function getNavigationService(): NavigationService {
  if (!navigationService) {
    navigationService = new NavigationService()
  }
  return navigationService
}
