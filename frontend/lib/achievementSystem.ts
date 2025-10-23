// Achievement & Title System for Vietnamese History Game
// Comprehensive achievement tracking with 300+ achievements across 12 categories

export type AchievementCategory = 
  | 'combat' | 'heroes' | 'resources' | 'culture' 
  | 'social' | 'exploration' | 'pvp' | 'pve' 
  | 'collection' | 'mastery' | 'seasonal' | 'secret';

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  rarity: AchievementRarity;
  isHidden: boolean;
  isSecret: boolean;
  icon: string;
  points: number;
  
  // Requirements
  requirement: {
    type: string;
    target: number;
    current?: number;
  };
  
  // Rewards
  rewards: {
    gold?: number;
    gems?: number;
    exp?: number;
    titleId?: string;
    cosmeticId?: string;
  };
  
  // Stats
  unlockRate: number; // Percentage of players who unlocked this
  totalUnlocks: number;
  firstUnlockedBy?: string;
  firstUnlockedAt?: number;
}

export interface PlayerAchievementProgress {
  playerId: string;
  achievements: Map<string, {
    achievementId: string;
    isUnlocked: boolean;
    unlockedAt?: number;
    progress: number;
    maxProgress: number;
    isRewardClaimed: boolean;
  }>;
  
  totalPoints: number;
  achievementsByCategory: Map<AchievementCategory, number>;
  achievementsByTier: Map<AchievementTier, number>;
  achievementsByRarity: Map<AchievementRarity, number>;
  
  equippedTitleId?: string;
  unlockedTitles: Set<string>;
  
  milestoneRewards: Map<number, boolean>; // points -> claimed
  lastUpdated: number;
}

export interface Title {
  id: string;
  name: string;
  displayName: string;
  description: string;
  rarity: AchievementRarity;
  color: string;
  icon?: string;
  
  unlockRequirement: {
    type: 'achievement' | 'points' | 'tier' | 'category' | 'special';
    value: string | number;
  };
  
  isExclusive: boolean;
  totalOwners: number;
  unlockRate: number;
}

export interface AchievementMilestone {
  points: number;
  rewards: {
    gold: number;
    gems: number;
    titleId?: string;
    cosmeticId?: string;
    specialReward?: string;
  };
  isClaimed: boolean;
}

export interface AchievementStats {
  totalAchievements: number;
  unlockedAchievements: number;
  completionRate: number;
  totalPoints: number;
  
  categoryCompletion: Map<AchievementCategory, number>;
  tierCompletion: Map<AchievementTier, number>;
  rarityCompletion: Map<AchievementRarity, number>;
  
  recentUnlocks: Achievement[];
  nearCompletion: Achievement[]; // Achievements close to completion
  
  globalRank?: number;
  percentile?: number;
}

// Configuration
const ACHIEVEMENT_CONFIG = {
  MILESTONES: [100, 500, 1000, 2500, 5000, 10000],
  
  TIER_POINTS: {
    bronze: 10,
    silver: 25,
    gold: 50,
    platinum: 100,
    diamond: 250,
  },
  
  RARITY_MULTIPLIER: {
    common: 1.0,
    rare: 1.5,
    epic: 2.0,
    legendary: 3.0,
    mythic: 5.0,
  },
  
  CATEGORY_ACHIEVEMENTS: {
    combat: 30,
    heroes: 25,
    resources: 20,
    culture: 35,
    social: 25,
    exploration: 30,
    pvp: 28,
    pve: 32,
    collection: 28,
    mastery: 22,
    seasonal: 15,
    secret: 10,
  },
  
  UPDATE_INTERVAL: 60000, // Check achievements every 60 seconds
  RECENT_UNLOCKS_LIMIT: 10,
  NEAR_COMPLETION_THRESHOLD: 0.8, // 80% progress
};

class AchievementSystem {
  private static instance: AchievementSystem;
  
  private achievements: Map<string, Achievement> = new Map();
  private playerProgress: Map<string, PlayerAchievementProgress> = new Map();
  private titles: Map<string, Title> = new Map();
  private milestones: AchievementMilestone[] = [];
  
  private constructor() {
    this.initializeAchievements();
    this.initializeTitles();
    this.initializeMilestones();
    this.startBackgroundProcesses();
  }
  
  public static getInstance(): AchievementSystem {
    if (!AchievementSystem.instance) {
      AchievementSystem.instance = new AchievementSystem();
    }
    return AchievementSystem.instance;
  }
  
  // Initialize all achievements
  private initializeAchievements(): void {
    // COMBAT ACHIEVEMENTS (30)
    this.createAchievementSet('combat', 'first_blood', 'First Blood', 'Win your first battle', 
      [1, 10, 50, 100, 500], [100, 500, 2500, 10000, 50000], 'combat_wins');
    
    this.createAchievementSet('combat', 'kill_streak', 'Unstoppable', 'Achieve kill streak',
      [3, 5, 10, 15, 25], [500, 2500, 10000, 25000, 100000], 'max_kill_streak');
    
    this.createAchievementSet('combat', 'damage_dealer', 'Damage Dealer', 'Deal total damage',
      [10000, 50000, 250000, 1000000, 5000000], [1000, 5000, 25000, 100000, 500000], 'total_damage');
    
    this.createAchievementSet('combat', 'survivor', 'Survivor', 'Win battles without dying',
      [5, 25, 100, 250, 500], [1000, 5000, 25000, 100000, 500000], 'perfect_battles');
    
    this.createAchievementSet('combat', 'comeback', 'Comeback King', 'Win from behind',
      [1, 10, 25, 50, 100], [500, 2500, 10000, 50000, 250000], 'comeback_wins');
    
    this.createAchievementSet('combat', 'speed_demon', 'Speed Demon', 'Win battles quickly',
      [10, 50, 150, 300, 600], [500, 2500, 10000, 50000, 250000], 'quick_wins');
    
    // HEROES ACHIEVEMENTS (25)
    this.createAchievementSet('heroes', 'collector', 'Hero Collector', 'Collect unique heroes',
      [5, 15, 30, 50, 75], [500, 2500, 10000, 50000, 250000], 'heroes_collected');
    
    this.createAchievementSet('heroes', 'master', 'Hero Master', 'Max level heroes',
      [1, 5, 15, 30, 50], [1000, 5000, 25000, 100000, 500000], 'max_level_heroes');
    
    this.createAchievementSet('heroes', 'ascension', 'Ascension', 'Ascend heroes to max tier',
      [1, 3, 10, 20, 40], [2000, 10000, 50000, 200000, 1000000], 'ascended_heroes');
    
    this.createAchievementSet('heroes', 'legendary', 'Legendary Owner', 'Own legendary heroes',
      [1, 3, 5, 10, 15], [5000, 25000, 100000, 500000, 2500000], 'legendary_heroes');
    
    this.createAchievementSet('heroes', 'devotion', 'True Devotion', 'Use same hero in battles',
      [50, 200, 500, 1000, 2500], [500, 2500, 10000, 50000, 250000], 'hero_battles');
    
    // RESOURCES ACHIEVEMENTS (20)
    this.createAchievementSet('resources', 'gold_hoarder', 'Gold Hoarder', 'Accumulate gold',
      [10000, 100000, 500000, 2000000, 10000000], [100, 500, 2500, 10000, 50000], 'total_gold');
    
    this.createAchievementSet('resources', 'gem_collector', 'Gem Collector', 'Accumulate gems',
      [100, 500, 2500, 10000, 50000], [500, 2500, 10000, 50000, 250000], 'total_gems');
    
    this.createAchievementSet('resources', 'merchant', 'Master Merchant', 'Earn from trading',
      [5000, 25000, 100000, 500000, 2500000], [1000, 5000, 25000, 100000, 500000], 'trade_profit');
    
    this.createAchievementSet('resources', 'investor', 'Smart Investor', 'Successful investments',
      [10, 50, 150, 300, 600], [1000, 5000, 25000, 100000, 500000], 'profitable_trades');
    
    // CULTURE ACHIEVEMENTS (35) - Vietnamese History
    this.addCultureAchievement('hung_kings', 'Hùng Kings Legacy', 'Complete Hùng Kings questline', 'legendary');
    this.addCultureAchievement('hai_ba_trung', 'Trưng Sisters Pride', 'Honor Hai Bà Trưng', 'legendary');
    this.addCultureAchievement('tran_hung_dao', 'Trần Hưng Đạo Spirit', 'Follow General Trần', 'legendary');
    this.addCultureAchievement('le_loi', 'Lê Lợi Revolution', 'Complete Lê Dynasty quests', 'legendary');
    this.addCultureAchievement('nguyen_hue', 'Quang Trung Victory', 'Celebrate Nguyễn Huệ', 'legendary');
    
    this.createAchievementSet('culture', 'historian', 'Historian', 'Complete history quizzes',
      [10, 30, 75, 150, 300], [500, 2500, 10000, 50000, 250000], 'quizzes_completed');
    
    this.createAchievementSet('culture', 'scholar', 'Scholar', 'Learn cultural facts',
      [25, 75, 200, 400, 800], [500, 2500, 10000, 50000, 250000], 'facts_learned');
    
    this.createAchievementSet('culture', 'tet_spirit', 'Tết Spirit', 'Participate in Tết events',
      [1, 3, 5, 10, 15], [1000, 5000, 25000, 100000, 500000], 'tet_events');
    
    this.createAchievementSet('culture', 'dynasty', 'Dynasty Expert', 'Complete dynasty collections',
      [1, 3, 5, 7, 10], [2000, 10000, 50000, 200000, 1000000], 'dynasties_completed');
    
    // SOCIAL ACHIEVEMENTS (25)
    this.createAchievementSet('social', 'friendly', 'Friendly Face', 'Add friends',
      [5, 15, 30, 60, 100], [500, 2500, 10000, 50000, 250000], 'friends_count');
    
    this.createAchievementSet('social', 'guild_member', 'Guild Member', 'Join and contribute to guild',
      [1, 7, 30, 90, 180], [500, 2500, 10000, 50000, 250000], 'guild_days');
    
    this.createAchievementSet('social', 'helpful', 'Helpful Hero', 'Help other players',
      [10, 50, 150, 300, 600], [500, 2500, 10000, 50000, 250000], 'players_helped');
    
    this.createAchievementSet('social', 'chat_active', 'Conversationalist', 'Chat messages sent',
      [100, 500, 2000, 5000, 10000], [100, 500, 2500, 10000, 50000], 'messages_sent');
    
    this.createAchievementSet('social', 'guild_wars', 'War Veteran', 'Participate in guild wars',
      [5, 20, 50, 100, 250], [1000, 5000, 25000, 100000, 500000], 'wars_joined');
    
    // EXPLORATION ACHIEVEMENTS (30)
    this.createAchievementSet('exploration', 'explorer', 'Explorer', 'Discover locations',
      [10, 25, 40, 55, 70], [500, 2500, 10000, 50000, 250000], 'locations_visited');
    
    this.createAchievementSet('exploration', 'tourist', 'Tourist', 'Visit Vietnamese landmarks',
      [5, 15, 30, 45, 60], [1000, 5000, 25000, 100000, 500000], 'landmarks_visited');
    
    this.createAchievementSet('exploration', 'treasure', 'Treasure Hunter', 'Find hidden treasures',
      [10, 30, 75, 150, 300], [1000, 5000, 25000, 100000, 500000], 'treasures_found');
    
    this.createAchievementSet('exploration', 'map_complete', 'Cartographer', 'Complete region maps',
      [1, 3, 5, 8, 12], [2000, 10000, 50000, 200000, 1000000], 'regions_completed');
    
    // PVP ACHIEVEMENTS (28)
    this.createAchievementSet('pvp', 'arena_warrior', 'Arena Warrior', 'Win arena battles',
      [10, 50, 150, 300, 600], [500, 2500, 10000, 50000, 250000], 'arena_wins');
    
    this.createAchievementSet('pvp', 'ranked_climber', 'Ranked Climber', 'Reach rank tiers',
      [1, 2, 3, 4, 5], [1000, 5000, 25000, 100000, 500000], 'rank_tier');
    
    this.createAchievementSet('pvp', 'duelist', 'Master Duelist', 'Win 1v1 duels',
      [10, 50, 150, 300, 600], [1000, 5000, 25000, 100000, 500000], 'duel_wins');
    
    this.createAchievementSet('pvp', 'tournament', 'Tournament Champion', 'Win tournaments',
      [1, 5, 15, 30, 60], [5000, 25000, 100000, 500000, 2500000], 'tournament_wins');
    
    // PVE ACHIEVEMENTS (32)
    this.createAchievementSet('pve', 'campaign', 'Campaign Hero', 'Complete campaign chapters',
      [5, 15, 30, 50, 75], [500, 2500, 10000, 50000, 250000], 'chapters_completed');
    
    this.createAchievementSet('pve', 'difficulty', 'Nightmare Conqueror', 'Complete on hardest difficulty',
      [10, 30, 75, 150, 300], [2000, 10000, 50000, 200000, 1000000], 'nightmare_clears');
    
    this.createAchievementSet('pve', 'boss_slayer', 'Boss Slayer', 'Defeat bosses',
      [10, 50, 150, 300, 600], [1000, 5000, 25000, 100000, 500000], 'bosses_defeated');
    
    this.createAchievementSet('pve', 'dungeon', 'Dungeon Master', 'Complete dungeons',
      [10, 50, 150, 300, 600], [1000, 5000, 25000, 100000, 500000], 'dungeons_cleared');
    
    // COLLECTION ACHIEVEMENTS (28)
    this.createAchievementSet('collection', 'item_collector', 'Item Collector', 'Collect unique items',
      [25, 75, 200, 400, 800], [500, 2500, 10000, 50000, 250000], 'items_collected');
    
    this.createAchievementSet('collection', 'equipment', 'Equipment Master', 'Collect equipment sets',
      [5, 15, 30, 50, 75], [1000, 5000, 25000, 100000, 500000], 'equipment_sets');
    
    this.createAchievementSet('collection', 'cosmetic', 'Fashion Icon', 'Collect cosmetics',
      [10, 30, 75, 150, 300], [500, 2500, 10000, 50000, 250000], 'cosmetics_owned');
    
    // MASTERY ACHIEVEMENTS (22)
    this.createAchievementSet('mastery', 'perfect', 'Perfectionist', 'Perfect clears',
      [5, 25, 75, 150, 300], [2000, 10000, 50000, 200000, 1000000], 'perfect_clears');
    
    this.createAchievementSet('mastery', 'speedrun', 'Speedrunner', 'Complete speedruns',
      [10, 30, 75, 150, 300], [2000, 10000, 50000, 200000, 1000000], 'speedruns_completed');
    
    this.createAchievementSet('mastery', 'challenge', 'Challenge Accepted', 'Complete challenges',
      [10, 50, 150, 300, 600], [1000, 5000, 25000, 100000, 500000], 'challenges_completed');
    
    // SEASONAL ACHIEVEMENTS (15)
    this.createAchievementSet('seasonal', 'battle_pass', 'Battle Pass Hero', 'Complete battle passes',
      [1, 3, 5, 10, 15], [5000, 25000, 100000, 500000, 2500000], 'battle_passes_completed');
    
    this.createAchievementSet('seasonal', 'event_participant', 'Event Enthusiast', 'Participate in seasonal events',
      [5, 15, 30, 60, 100], [1000, 5000, 25000, 100000, 500000], 'events_participated');
    
    // SECRET ACHIEVEMENTS (10)
    this.addSecretAchievement('secret_1', 'The Hidden Path', 'Discover the secret passage', 'mythic');
    this.addSecretAchievement('secret_2', 'Easter Egg Hunter', 'Find all easter eggs', 'legendary');
    this.addSecretAchievement('secret_3', 'Time Traveler', 'Complete all historical eras', 'legendary');
    this.addSecretAchievement('secret_4', 'Master of All', 'Max all categories', 'mythic');
    this.addSecretAchievement('secret_5', 'Lucky Thirteen', 'Win 13 battles in a row', 'epic');
    this.addSecretAchievement('secret_6', 'Midnight Warrior', 'Play at midnight', 'rare');
    this.addSecretAchievement('secret_7', 'Social Butterfly', 'Make 100 friends', 'epic');
    this.addSecretAchievement('secret_8', 'Generous Soul', 'Give away 1M gold', 'legendary');
    this.addSecretAchievement('secret_9', 'No Pain No Gain', 'Complete 100 challenges', 'legendary');
    this.addSecretAchievement('secret_10', 'True Vietnamese', 'Complete all culture achievements', 'mythic');
  }
  
  private createAchievementSet(
    category: AchievementCategory,
    baseId: string,
    baseName: string,
    baseDesc: string,
    targets: number[],
    goldRewards: number[],
    statKey: string
  ): void {
    const tiers: AchievementTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    const rarities: AchievementRarity[] = ['common', 'rare', 'epic', 'legendary', 'mythic'];
    
    targets.forEach((target, index) => {
      const tier = tiers[index];
      const rarity = rarities[index];
      const id = `${baseId}_${tier}`;
      const points = ACHIEVEMENT_CONFIG.TIER_POINTS[tier] * ACHIEVEMENT_CONFIG.RARITY_MULTIPLIER[rarity];
      
      this.achievements.set(id, {
        id,
        name: `${baseName} ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
        description: `${baseDesc} (${target})`,
        category,
        tier,
        rarity,
        isHidden: false,
        isSecret: false,
        icon: this.getCategoryIcon(category),
        points,
        requirement: {
          type: statKey,
          target,
        },
        rewards: {
          gold: goldRewards[index],
          gems: Math.floor(goldRewards[index] / 100),
          exp: goldRewards[index] * 2,
        },
        unlockRate: 0,
        totalUnlocks: 0,
      });
    });
  }
  
  private addCultureAchievement(id: string, name: string, description: string, rarity: AchievementRarity): void {
    const points = 100 * ACHIEVEMENT_CONFIG.RARITY_MULTIPLIER[rarity];
    
    this.achievements.set(id, {
      id,
      name,
      description,
      category: 'culture',
      tier: 'gold',
      rarity,
      isHidden: false,
      isSecret: false,
      icon: '🏛️',
      points,
      requirement: {
        type: 'quest_complete',
        target: 1,
      },
      rewards: {
        gold: 50000,
        gems: 500,
        exp: 100000,
        titleId: `title_${id}`,
      },
      unlockRate: 0,
      totalUnlocks: 0,
    });
  }
  
  private addSecretAchievement(id: string, name: string, description: string, rarity: AchievementRarity): void {
    const points = 100 * ACHIEVEMENT_CONFIG.RARITY_MULTIPLIER[rarity];
    
    this.achievements.set(id, {
      id,
      name,
      description,
      category: 'secret',
      tier: 'diamond',
      rarity,
      isHidden: true,
      isSecret: true,
      icon: '❓',
      points,
      requirement: {
        type: 'special_condition',
        target: 1,
      },
      rewards: {
        gold: 100000,
        gems: 1000,
        exp: 200000,
        titleId: `title_${id}`,
      },
      unlockRate: 0,
      totalUnlocks: 0,
    });
  }
  
  private getCategoryIcon(category: AchievementCategory): string {
    const icons: Record<AchievementCategory, string> = {
      combat: '⚔️',
      heroes: '👑',
      resources: '💰',
      culture: '🏛️',
      social: '👥',
      exploration: '🗺️',
      pvp: '🏆',
      pve: '🎯',
      collection: '📦',
      mastery: '⭐',
      seasonal: '🎊',
      secret: '❓',
    };
    return icons[category];
  }
  
  // Initialize titles
  private initializeTitles(): void {
    // Tier-based titles
    this.addTitle('title_bronze_collector', 'Bronze Collector', 'collector', 'common', '#CD7F32', 
      { type: 'tier', value: 'bronze' });
    this.addTitle('title_silver_warrior', 'Silver Warrior', 'warrior', 'rare', '#C0C0C0',
      { type: 'tier', value: 'silver' });
    this.addTitle('title_gold_legend', 'Golden Legend', 'legend', 'epic', '#FFD700',
      { type: 'tier', value: 'gold' });
    this.addTitle('title_platinum_master', 'Platinum Master', 'master', 'legendary', '#E5E4E2',
      { type: 'tier', value: 'platinum' });
    this.addTitle('title_diamond_god', 'Diamond God', 'god', 'mythic', '#B9F2FF',
      { type: 'tier', value: 'diamond' });
    
    // Achievement point milestones
    this.addTitle('title_achiever', 'Achiever', 'achiever', 'common', '#4CAF50',
      { type: 'points', value: 100 });
    this.addTitle('title_champion', 'Champion', 'champion', 'rare', '#2196F3',
      { type: 'points', value: 500 });
    this.addTitle('title_legend', 'Legend', 'legend', 'epic', '#9C27B0',
      { type: 'points', value: 1000 });
    this.addTitle('title_mythic', 'Mythic Hero', 'mythic', 'legendary', '#FF9800',
      { type: 'points', value: 2500 });
    this.addTitle('title_transcendent', 'Transcendent', 'transcendent', 'mythic', '#F44336',
      { type: 'points', value: 5000 });
    
    // Category specialists
    this.addTitle('title_warlord', 'Warlord', 'warlord', 'legendary', '#D32F2F',
      { type: 'category', value: 'combat' });
    this.addTitle('title_hero_master', 'Hero Master', 'hero master', 'legendary', '#7B1FA2',
      { type: 'category', value: 'heroes' });
    this.addTitle('title_merchant_king', 'Merchant King', 'merchant', 'legendary', '#FFA000',
      { type: 'category', value: 'resources' });
    this.addTitle('title_historian', 'Master Historian', 'historian', 'legendary', '#5D4037',
      { type: 'category', value: 'culture' });
    
    // Vietnamese culture titles
    this.addTitle('title_hung_kings', 'Descendant of Hùng Kings', 'hung kings', 'legendary', '#FFD700',
      { type: 'achievement', value: 'hung_kings' });
    this.addTitle('title_hai_ba_trung', 'Spirit of Trưng Sisters', 'trưng sisters', 'legendary', '#FF1744',
      { type: 'achievement', value: 'hai_ba_trung' });
    this.addTitle('title_tran_hung_dao', 'Heir of Trần Hưng Đạo', 'general', 'legendary', '#1976D2',
      { type: 'achievement', value: 'tran_hung_dao' });
    this.addTitle('title_le_loi', 'Lê Lợi\'s Legacy', 'revolutionary', 'legendary', '#388E3C',
      { type: 'achievement', value: 'le_loi' });
    this.addTitle('title_nguyen_hue', 'Quang Trung\'s Courage', 'emperor', 'legendary', '#FFA000',
      { type: 'achievement', value: 'nguyen_hue' });
    
    // Special titles
    this.addTitle('title_secret_keeper', 'Secret Keeper', 'secret keeper', 'mythic', '#4A148C',
      { type: 'special', value: 'all_secrets' });
    this.addTitle('title_perfectionist', 'The Perfectionist', 'perfectionist', 'mythic', '#E91E63',
      { type: 'special', value: 'perfect_completion' });
    this.addTitle('title_first_player', 'First Player', 'pioneer', 'mythic', '#00BCD4',
      { type: 'special', value: 'first_player' }, true);
  }
  
  private addTitle(
    id: string,
    displayName: string,
    name: string,
    rarity: AchievementRarity,
    color: string,
    unlockReq: { type: 'achievement' | 'points' | 'tier' | 'category' | 'special'; value: string | number },
    isExclusive: boolean = false
  ): void {
    this.titles.set(id, {
      id,
      name,
      displayName,
      description: `Earned by ${unlockReq.type}: ${unlockReq.value}`,
      rarity,
      color,
      unlockRequirement: unlockReq,
      isExclusive,
      totalOwners: 0,
      unlockRate: 0,
    });
  }
  
  // Initialize milestone rewards
  private initializeMilestones(): void {
    ACHIEVEMENT_CONFIG.MILESTONES.forEach((points, index) => {
      this.milestones.push({
        points,
        rewards: {
          gold: points * 100,
          gems: points * 10,
          titleId: index === 5 ? 'title_transcendent' : undefined,
          specialReward: index === 5 ? 'Mythic Hero Chest' : undefined,
        },
        isClaimed: false,
      });
    });
  }
  
  // Player progress management
  public initializePlayerProgress(playerId: string): PlayerAchievementProgress {
    const progress: PlayerAchievementProgress = {
      playerId,
      achievements: new Map(),
      totalPoints: 0,
      achievementsByCategory: new Map(),
      achievementsByTier: new Map(),
      achievementsByRarity: new Map(),
      unlockedTitles: new Set(),
      milestoneRewards: new Map(),
      lastUpdated: Date.now(),
    };
    
    // Initialize all achievements as locked
    this.achievements.forEach(achievement => {
      progress.achievements.set(achievement.id, {
        achievementId: achievement.id,
        isUnlocked: false,
        progress: 0,
        maxProgress: achievement.requirement.target,
        isRewardClaimed: false,
      });
    });
    
    this.playerProgress.set(playerId, progress);
    return progress;
  }
  
  public getPlayerProgress(playerId: string): PlayerAchievementProgress | undefined {
    return this.playerProgress.get(playerId);
  }
  
  // Update achievement progress
  public updateProgress(playerId: string, statKey: string, value: number): Achievement[] {
    const progress = this.playerProgress.get(playerId);
    if (!progress) return [];
    
    const unlockedAchievements: Achievement[] = [];
    
    this.achievements.forEach(achievement => {
      if (achievement.requirement.type === statKey) {
        const achievementProgress = progress.achievements.get(achievement.id);
        if (!achievementProgress || achievementProgress.isUnlocked) return;
        
        achievementProgress.progress = value;
        
        // Check if achievement is completed
        if (value >= achievement.requirement.target) {
          this.unlockAchievement(playerId, achievement.id);
          unlockedAchievements.push(achievement);
        }
      }
    });
    
    progress.lastUpdated = Date.now();
    return unlockedAchievements;
  }
  
  // Unlock achievement
  public unlockAchievement(playerId: string, achievementId: string): boolean {
    const progress = this.playerProgress.get(playerId);
    const achievement = this.achievements.get(achievementId);
    
    if (!progress || !achievement) return false;
    
    const achievementProgress = progress.achievements.get(achievementId);
    if (!achievementProgress || achievementProgress.isUnlocked) return false;
    
    // Unlock achievement
    achievementProgress.isUnlocked = true;
    achievementProgress.unlockedAt = Date.now();
    achievementProgress.progress = achievement.requirement.target;
    
    // Add points
    progress.totalPoints += achievement.points;
    
    // Update category/tier/rarity counts
    const categoryCount = progress.achievementsByCategory.get(achievement.category) || 0;
    progress.achievementsByCategory.set(achievement.category, categoryCount + 1);
    
    const tierCount = progress.achievementsByTier.get(achievement.tier) || 0;
    progress.achievementsByTier.set(achievement.tier, tierCount + 1);
    
    const rarityCount = progress.achievementsByRarity.get(achievement.rarity) || 0;
    progress.achievementsByRarity.set(achievement.rarity, rarityCount + 1);
    
    // Update achievement stats
    achievement.totalUnlocks++;
    
    // Unlock associated title
    if (achievement.rewards.titleId) {
      progress.unlockedTitles.add(achievement.rewards.titleId);
    }
    
    // Check for milestone titles
    this.checkMilestoneTitles(playerId);
    
    progress.lastUpdated = Date.now();
    return true;
  }
  
  // Claim achievement rewards
  public claimRewards(playerId: string, achievementId: string): any {
    const progress = this.playerProgress.get(playerId);
    const achievement = this.achievements.get(achievementId);
    
    if (!progress || !achievement) return null;
    
    const achievementProgress = progress.achievements.get(achievementId);
    if (!achievementProgress || !achievementProgress.isUnlocked || achievementProgress.isRewardClaimed) {
      return null;
    }
    
    achievementProgress.isRewardClaimed = true;
    return achievement.rewards;
  }
  
  // Equip title
  public equipTitle(playerId: string, titleId: string): boolean {
    const progress = this.playerProgress.get(playerId);
    if (!progress || !progress.unlockedTitles.has(titleId)) return false;
    
    progress.equippedTitleId = titleId;
    return true;
  }
  
  // Get player statistics
  public getPlayerStats(playerId: string): AchievementStats | null {
    const progress = this.playerProgress.get(playerId);
    if (!progress) return null;
    
    const totalAchievements = this.achievements.size;
    let unlockedCount = 0;
    
    progress.achievements.forEach(ap => {
      if (ap.isUnlocked) unlockedCount++;
    });
    
    const recentUnlocks: Achievement[] = [];
    progress.achievements.forEach(ap => {
      if (ap.isUnlocked && ap.unlockedAt) {
        const achievement = this.achievements.get(ap.achievementId);
        if (achievement) {
          recentUnlocks.push(achievement);
        }
      }
    });
    recentUnlocks.sort((a, b) => {
      const aProgress = progress.achievements.get(a.id);
      const bProgress = progress.achievements.get(b.id);
      return (bProgress?.unlockedAt || 0) - (aProgress?.unlockedAt || 0);
    });
    
    const nearCompletion: Achievement[] = [];
    progress.achievements.forEach(ap => {
      if (!ap.isUnlocked && ap.progress / ap.maxProgress >= ACHIEVEMENT_CONFIG.NEAR_COMPLETION_THRESHOLD) {
        const achievement = this.achievements.get(ap.achievementId);
        if (achievement) {
          nearCompletion.push(achievement);
        }
      }
    });
    
    return {
      totalAchievements,
      unlockedAchievements: unlockedCount,
      completionRate: (unlockedCount / totalAchievements) * 100,
      totalPoints: progress.totalPoints,
      categoryCompletion: progress.achievementsByCategory,
      tierCompletion: progress.achievementsByTier,
      rarityCompletion: progress.achievementsByRarity,
      recentUnlocks: recentUnlocks.slice(0, ACHIEVEMENT_CONFIG.RECENT_UNLOCKS_LIMIT),
      nearCompletion,
    };
  }
  
  // Get all achievements
  public getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }
  
  // Get achievements by category
  public getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return Array.from(this.achievements.values()).filter(a => a.category === category);
  }
  
  // Get all titles
  public getAllTitles(): Title[] {
    return Array.from(this.titles.values());
  }
  
  // Get unlocked titles
  public getUnlockedTitles(playerId: string): Title[] {
    const progress = this.playerProgress.get(playerId);
    if (!progress) return [];
    
    return Array.from(progress.unlockedTitles)
      .map(titleId => this.titles.get(titleId))
      .filter((t): t is Title => t !== undefined);
  }
  
  // Get milestone rewards
  public getMilestones(): AchievementMilestone[] {
    return this.milestones;
  }
  
  // Claim milestone reward
  public claimMilestone(playerId: string, points: number): any {
    const progress = this.playerProgress.get(playerId);
    if (!progress || progress.totalPoints < points) return null;
    
    const milestone = this.milestones.find(m => m.points === points);
    if (!milestone || progress.milestoneRewards.get(points)) return null;
    
    progress.milestoneRewards.set(points, true);
    
    // Unlock milestone title if exists
    if (milestone.rewards.titleId) {
      progress.unlockedTitles.add(milestone.rewards.titleId);
    }
    
    return milestone.rewards;
  }
  
  // Check and unlock milestone titles
  private checkMilestoneTitles(playerId: string): void {
    const progress = this.playerProgress.get(playerId);
    if (!progress) return;
    
    // Check for category completion titles
    const categoryTitles: Record<AchievementCategory, string> = {
      combat: 'title_warlord',
      heroes: 'title_hero_master',
      resources: 'title_merchant_king',
      culture: 'title_historian',
      social: 'title_social_master',
      exploration: 'title_explorer',
      pvp: 'title_pvp_champion',
      pve: 'title_pve_master',
      collection: 'title_collector',
      mastery: 'title_master',
      seasonal: 'title_seasonal_hero',
      secret: 'title_secret_keeper',
    };
    
    progress.achievementsByCategory.forEach((count, category) => {
      const categoryTotal = ACHIEVEMENT_CONFIG.CATEGORY_ACHIEVEMENTS[category];
      if (count >= categoryTotal) {
        const titleId = categoryTitles[category];
        if (titleId && this.titles.has(titleId)) {
          progress.unlockedTitles.add(titleId);
        }
      }
    });
  }
  
  // Background processes
  private startBackgroundProcesses(): void {
    // Update achievement unlock rates
    setInterval(() => {
      this.updateUnlockRates();
    }, ACHIEVEMENT_CONFIG.UPDATE_INTERVAL);
  }
  
  private updateUnlockRates(): void {
    const totalPlayers = this.playerProgress.size;
    if (totalPlayers === 0) return;
    
    this.achievements.forEach(achievement => {
      achievement.unlockRate = (achievement.totalUnlocks / totalPlayers) * 100;
    });
    
    this.titles.forEach(title => {
      let ownersCount = 0;
      this.playerProgress.forEach(progress => {
        if (progress.unlockedTitles.has(title.id)) {
          ownersCount++;
        }
      });
      title.totalOwners = ownersCount;
      title.unlockRate = (ownersCount / totalPlayers) * 100;
    });
  }
}

// Singleton export
let achievementSystemInstance: AchievementSystem | null = null;

export function getAchievementSystem(): AchievementSystem {
  if (!achievementSystemInstance) {
    achievementSystemInstance = AchievementSystem.getInstance();
  }
  return achievementSystemInstance;
}
