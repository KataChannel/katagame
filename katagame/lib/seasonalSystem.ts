// Seasonal Content & Battle Pass System
// MVP 4 - Feature #4

export type SeasonStatus = 'upcoming' | 'active' | 'ended';
export type BattlePassTier = 'free' | 'premium';
export type RewardType = 'hero' | 'skin' | 'emote' | 'banner' | 'title' | 'currency' | 'booster' | 'chest' | 'exclusive';
export type EventType = 'daily' | 'weekly' | 'limited_time' | 'special';
export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';
export type LeaderboardType = 'battle_pass_xp' | 'event_points' | 'challenges_completed';

export interface Season {
  id: string;
  number: number;
  name: string;
  theme: string;
  description: string;
  startDate: number;
  endDate: number;
  status: SeasonStatus;
  duration: number; // in days
  
  // Visual
  bannerImage: string;
  backgroundColor: string;
  accentColor: string;
  
  // Battle Pass
  battlePassLevels: number;
  maxLevel: number;
  freeRewards: number;
  premiumRewards: number;
  premiumCost: number; // in gems
  
  // Events
  totalEvents: number;
  specialEvents: string[];
  
  // Stats
  totalPlayers: number;
  premiumPurchases: number;
  averageLevel: number;
}

export interface BattlePassLevel {
  level: number;
  xpRequired: number;
  cumulativeXp: number;
  
  freeRewards: BattlePassReward[];
  premiumRewards: BattlePassReward[];
  
  specialMilestone: boolean;
  milestoneBonus?: {
    type: string;
    value: number;
  };
}

export interface BattlePassReward {
  id: string;
  type: RewardType;
  tier: BattlePassTier;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  quantity: number;
  exclusive: boolean;
  
  // Item details
  itemId?: string;
  imageUrl?: string;
  
  // Currency rewards
  gold?: number;
  gems?: number;
  seasonPoints?: number;
}

export interface PlayerBattlePass {
  playerId: string;
  seasonId: string;
  currentLevel: number;
  currentXp: number;
  hasPremium: boolean;
  premiumPurchasedAt: number | null;
  
  // Progress
  claimedFreeRewards: Set<number>;
  claimedPremiumRewards: Set<number>;
  
  // Stats
  totalXpEarned: number;
  questsCompleted: number;
  eventsParticipated: number;
  dailyStreakDays: number;
  lastLoginDate: number;
  
  // Challenges
  weeklyChallengesCompleted: number;
  specialChallengesCompleted: number;
}

export interface SeasonalQuest {
  id: string;
  seasonId: string;
  title: string;
  description: string;
  difficulty: QuestDifficulty;
  type: EventType;
  
  // Requirements
  objectives: {
    type: string;
    description: string;
    target: number;
    current: number;
    completed: boolean;
  }[];
  
  // Rewards
  xpReward: number;
  seasonPointsReward: number;
  additionalRewards: {
    gold?: number;
    gems?: number;
    items?: string[];
  };
  
  // Timing
  startTime: number;
  expiresAt: number;
  isActive: boolean;
  isCompleted: boolean;
  
  // Requirements
  requiredLevel?: number;
  requiredBattlePassLevel?: number;
  premiumOnly: boolean;
}

export interface SeasonalEvent {
  id: string;
  seasonId: string;
  name: string;
  description: string;
  type: EventType;
  theme: string;
  
  // Timing
  startTime: number;
  endTime: number;
  duration: number;
  isActive: boolean;
  
  // Gameplay
  specialRules: string[];
  bonusMultipliers: {
    xp: number;
    gold: number;
    seasonPoints: number;
  };
  
  // Rewards
  participationReward: BattlePassReward[];
  leaderboardRewards: {
    rank: number;
    rewards: BattlePassReward[];
  }[];
  
  // Stats
  totalParticipants: number;
  averageScore: number;
}

export interface SeasonalLeaderboard {
  seasonId: string;
  type: LeaderboardType;
  entries: {
    rank: number;
    playerId: string;
    playerName: string;
    score: number;
    level: number;
    hasPremium: boolean;
    lastUpdate: number;
  }[];
  lastUpdate: number;
}

export interface LimitedCosmetic {
  id: string;
  seasonId: string;
  name: string;
  description: string;
  type: 'skin' | 'emote' | 'banner' | 'title' | 'effect';
  rarity: 'rare' | 'epic' | 'legendary' | 'mythic';
  
  // Availability
  exclusive: boolean;
  battlePassLevel?: number;
  eventExclusive?: string;
  
  // Purchase (if not exclusive)
  purchasable: boolean;
  cost?: number;
  currency?: 'gems' | 'season_points';
  
  // Stats
  totalOwned: number;
  limitedQuantity?: number;
}

export interface WeeklyChallenge {
  id: string;
  weekNumber: number;
  seasonId: string;
  title: string;
  description: string;
  difficulty: QuestDifficulty;
  
  objectives: {
    type: string;
    description: string;
    target: number;
    current: number;
  }[];
  
  rewards: {
    xp: number;
    seasonPoints: number;
    gold: number;
    bonus?: BattlePassReward;
  };
  
  startTime: number;
  endTime: number;
  isActive: boolean;
  
  // Stats
  completionRate: number;
  totalAttempts: number;
}

export interface SeasonStats {
  seasonId: string;
  
  // Engagement
  totalPlayers: number;
  activePlayersToday: number;
  premiumOwners: number;
  premiumConversionRate: number;
  
  // Progress
  averageLevel: number;
  maxLevelReached: number;
  totalXpEarned: number;
  
  // Revenue
  premiumSales: number;
  levelBoosters: number;
  cosmeticSales: number;
  totalRevenue: number;
  
  // Completion
  level50Reached: number;
  level100Reached: number;
  allQuestsCompleted: number;
  allEventsParticipated: number;
}

// Configuration
export const SEASONAL_CONFIG = {
  // Season Settings
  SEASON_DURATION_DAYS: 90,
  BATTLE_PASS_MAX_LEVEL: 100,
  XP_PER_LEVEL_BASE: 1000,
  XP_SCALING_FACTOR: 1.05,
  
  // Premium
  PREMIUM_COST_GEMS: 950,
  PREMIUM_XP_BONUS: 1.5, // +50% XP
  PREMIUM_INSTANT_LEVELS: 0,
  
  // Level Booster
  LEVEL_BOOSTER_COST: 150, // gems per level
  MAX_BOOSTER_PURCHASE: 25,
  
  // Daily Rewards
  DAILY_LOGIN_XP: 500,
  DAILY_QUEST_XP: 1000,
  DAILY_STREAK_BONUS_MULTIPLIER: 1.1, // +10% per day
  MAX_STREAK_BONUS: 2.0, // Max 2x at 10 day streak
  
  // Weekly Challenges
  WEEKLY_CHALLENGES_COUNT: 7,
  WEEKLY_CHALLENGE_XP: 2500,
  WEEKLY_RESET_DAY: 1, // Monday
  
  // Events
  SPECIAL_EVENTS_PER_SEASON: 6,
  EVENT_DURATION_HOURS: 48,
  EVENT_XP_MULTIPLIER: 2.0,
  
  // Rewards
  FREE_REWARDS_PER_SEASON: 50,
  PREMIUM_REWARDS_PER_SEASON: 100,
  MILESTONE_LEVELS: [10, 25, 50, 75, 100],
  
  // Leaderboard
  LEADERBOARD_UPDATE_INTERVAL: 300000, // 5 minutes
  TOP_LEADERBOARD_REWARDS: 100,
  
  // Season Points
  SEASON_POINTS_PER_LEVEL: 100,
  SEASON_POINTS_QUEST_BASE: 50,
  SEASON_POINTS_EVENT_BASE: 200,
};

class SeasonalSystem {
  private static instance: SeasonalSystem;
  
  private seasons: Map<string, Season> = new Map();
  private currentSeason: Season | null = null;
  private battlePassLevels: Map<string, BattlePassLevel[]> = new Map(); // seasonId -> levels
  private playerProgress: Map<string, PlayerBattlePass> = new Map();
  private seasonalQuests: Map<string, SeasonalQuest[]> = new Map();
  private seasonalEvents: Map<string, SeasonalEvent[]> = new Map();
  private weeklyChallenges: Map<string, WeeklyChallenge[]> = new Map();
  private leaderboards: Map<string, SeasonalLeaderboard> = new Map();
  private limitedCosmetics: Map<string, LimitedCosmetic[]> = new Map();
  private seasonStats: Map<string, SeasonStats> = new Map();
  
  private constructor() {
    this.initializeSeasons();
    this.startBackgroundProcesses();
  }
  
  public static getSeasonalSystem(): SeasonalSystem {
    if (!SeasonalSystem.instance) {
      SeasonalSystem.instance = new SeasonalSystem();
    }
    return SeasonalSystem.instance;
  }
  
  // ============ SEASON MANAGEMENT ============
  
  private initializeSeasons() {
    // Season 1: Dragon's Legacy
    const season1: Season = {
      id: 'season_1',
      number: 1,
      name: "Dragon's Legacy",
      theme: 'Ancient Vietnamese Dynasties',
      description: 'Discover the power of ancient Vietnamese dragons and legendary heroes',
      startDate: Date.now(),
      endDate: Date.now() + (SEASONAL_CONFIG.SEASON_DURATION_DAYS * 24 * 60 * 60 * 1000),
      status: 'active',
      duration: SEASONAL_CONFIG.SEASON_DURATION_DAYS,
      bannerImage: '/season1_banner.jpg',
      backgroundColor: '#1a0a2e',
      accentColor: '#ff6b35',
      battlePassLevels: SEASONAL_CONFIG.BATTLE_PASS_MAX_LEVEL,
      maxLevel: SEASONAL_CONFIG.BATTLE_PASS_MAX_LEVEL,
      freeRewards: SEASONAL_CONFIG.FREE_REWARDS_PER_SEASON,
      premiumRewards: SEASONAL_CONFIG.PREMIUM_REWARDS_PER_SEASON,
      premiumCost: SEASONAL_CONFIG.PREMIUM_COST_GEMS,
      totalEvents: 6,
      specialEvents: ['Tet Festival', 'Mid-Autumn', 'Hung Kings', 'Trung Sisters', 'Hai Ba Trung', 'National Day'],
      totalPlayers: 0,
      premiumPurchases: 0,
      averageLevel: 1,
    };
    
    this.seasons.set(season1.id, season1);
    this.currentSeason = season1;
    
    // Initialize battle pass levels
    this.initializeBattlePass(season1.id);
    
    // Initialize quests and events
    this.initializeQuests(season1.id);
    this.initializeEvents(season1.id);
    this.initializeLimitedCosmetics(season1.id);
  }
  
  private initializeBattlePass(seasonId: string) {
    const levels: BattlePassLevel[] = [];
    let cumulativeXp = 0;
    
    for (let i = 1; i <= SEASONAL_CONFIG.BATTLE_PASS_MAX_LEVEL; i++) {
      const xpRequired = Math.floor(
        SEASONAL_CONFIG.XP_PER_LEVEL_BASE * Math.pow(SEASONAL_CONFIG.XP_SCALING_FACTOR, i - 1)
      );
      cumulativeXp += xpRequired;
      
      const level: BattlePassLevel = {
        level: i,
        xpRequired,
        cumulativeXp,
        freeRewards: this.generateFreeRewards(i),
        premiumRewards: this.generatePremiumRewards(i),
        specialMilestone: SEASONAL_CONFIG.MILESTONE_LEVELS.includes(i),
        milestoneBonus: SEASONAL_CONFIG.MILESTONE_LEVELS.includes(i) ? {
          type: 'gems',
          value: 100 * (i / 25),
        } : undefined,
      };
      
      levels.push(level);
    }
    
    this.battlePassLevels.set(seasonId, levels);
  }
  
  private generateFreeRewards(level: number): BattlePassReward[] {
    // Every other level has a free reward
    if (level % 2 !== 0) return [];
    
    const rewards: BattlePassReward[] = [];
    
    if (level % 10 === 0) {
      // Major milestone - chest
      rewards.push({
        id: `free_${level}_chest`,
        type: 'chest',
        tier: 'free',
        name: 'Season Chest',
        description: 'Contains random rewards',
        rarity: 'rare',
        quantity: 1,
        exclusive: false,
        gold: 5000,
        gems: 50,
      });
    } else {
      // Regular rewards
      rewards.push({
        id: `free_${level}_gold`,
        type: 'currency',
        tier: 'free',
        name: 'Gold',
        description: 'In-game currency',
        rarity: 'common',
        quantity: level * 100,
        exclusive: false,
        gold: level * 100,
      });
    }
    
    return rewards;
  }
  
  private generatePremiumRewards(level: number): BattlePassReward[] {
    const rewards: BattlePassReward[] = [];
    
    // Every level has premium rewards
    if (level % 5 === 0) {
      // Every 5 levels - cosmetic
      const cosmetics = ['skin', 'emote', 'banner', 'title'];
      const type = cosmetics[Math.floor(level / 5) % cosmetics.length] as RewardType;
      
      rewards.push({
        id: `premium_${level}_cosmetic`,
        type,
        tier: 'premium',
        name: `Level ${level} ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        description: `Exclusive ${type} for reaching level ${level}`,
        rarity: level >= 75 ? 'legendary' : level >= 50 ? 'epic' : 'rare',
        quantity: 1,
        exclusive: true,
      });
    }
    
    // Currency rewards
    rewards.push({
      id: `premium_${level}_currency`,
      type: 'currency',
      tier: 'premium',
      name: 'Premium Bonus',
      description: 'Extra currency for premium players',
      rarity: 'common',
      quantity: 1,
      exclusive: false,
      gold: level * 200,
      gems: level >= 25 ? Math.floor(level / 5) : 0,
    });
    
    // Milestone rewards
    if (SEASONAL_CONFIG.MILESTONE_LEVELS.includes(level)) {
      rewards.push({
        id: `premium_${level}_hero`,
        type: 'hero',
        tier: 'premium',
        name: `Legendary Hero - Level ${level}`,
        description: 'Exclusive legendary hero',
        rarity: 'legendary',
        quantity: 1,
        exclusive: true,
      });
    }
    
    return rewards;
  }
  
  private initializeQuests(seasonId: string) {
    const quests: SeasonalQuest[] = [];
    const now = Date.now();
    
    // Daily quests
    for (let i = 0; i < 5; i++) {
      quests.push({
        id: `daily_${i}_${Date.now()}`,
        seasonId,
        title: `Daily Quest ${i + 1}`,
        description: 'Complete daily objectives for XP',
        difficulty: 'easy',
        type: 'daily',
        objectives: [
          {
            type: 'play_battles',
            description: 'Play 5 battles',
            target: 5,
            current: 0,
            completed: false,
          },
        ],
        xpReward: 500,
        seasonPointsReward: 50,
        additionalRewards: { gold: 1000 },
        startTime: now,
        expiresAt: now + (24 * 60 * 60 * 1000),
        isActive: true,
        isCompleted: false,
        premiumOnly: false,
      });
    }
    
    this.seasonalQuests.set(seasonId, quests);
  }
  
  private initializeEvents(seasonId: string) {
    const events: SeasonalEvent[] = [
      {
        id: 'tet_festival',
        seasonId,
        name: 'Tết Festival',
        description: 'Celebrate Vietnamese Lunar New Year',
        type: 'special',
        theme: 'Tết Nguyên Đán',
        startTime: Date.now() + (30 * 24 * 60 * 60 * 1000),
        endTime: Date.now() + (32 * 24 * 60 * 60 * 1000),
        duration: 48,
        isActive: false,
        specialRules: ['Double XP', 'Special lucky draws', 'Exclusive cosmetics'],
        bonusMultipliers: { xp: 2.0, gold: 1.5, seasonPoints: 2.0 },
        participationReward: [],
        leaderboardRewards: [],
        totalParticipants: 0,
        averageScore: 0,
      },
    ];
    
    this.seasonalEvents.set(seasonId, events);
  }
  
  private initializeLimitedCosmetics(seasonId: string) {
    const cosmetics: LimitedCosmetic[] = [
      {
        id: 'dragon_skin_legendary',
        seasonId,
        name: 'Ancient Dragon Skin',
        description: 'Legendary skin featuring ancient Vietnamese dragon',
        type: 'skin',
        rarity: 'legendary',
        exclusive: true,
        battlePassLevel: 100,
        purchasable: false,
        totalOwned: 0,
      },
      {
        id: 'tet_emote',
        seasonId,
        name: 'Tết Celebration Emote',
        description: 'Special emote for Tết festival',
        type: 'emote',
        rarity: 'epic',
        exclusive: true,
        eventExclusive: 'tet_festival',
        purchasable: false,
        totalOwned: 0,
      },
    ];
    
    this.limitedCosmetics.set(seasonId, cosmetics);
  }
  
  public getCurrentSeason(): Season | null {
    return this.currentSeason;
  }
  
  public getSeason(seasonId: string): Season | null {
    return this.seasons.get(seasonId) || null;
  }
  
  public getAllSeasons(): Season[] {
    return Array.from(this.seasons.values());
  }
  
  // ============ PLAYER BATTLE PASS ============
  
  public initializePlayerBattlePass(playerId: string, seasonId: string): PlayerBattlePass {
    const progress: PlayerBattlePass = {
      playerId,
      seasonId,
      currentLevel: 1,
      currentXp: 0,
      hasPremium: false,
      premiumPurchasedAt: null,
      claimedFreeRewards: new Set(),
      claimedPremiumRewards: new Set(),
      totalXpEarned: 0,
      questsCompleted: 0,
      eventsParticipated: 0,
      dailyStreakDays: 0,
      lastLoginDate: Date.now(),
      weeklyChallengesCompleted: 0,
      specialChallengesCompleted: 0,
    };
    
    this.playerProgress.set(playerId, progress);
    return progress;
  }
  
  public getPlayerProgress(playerId: string): PlayerBattlePass | null {
    return this.playerProgress.get(playerId) || null;
  }
  
  public purchasePremium(playerId: string): { success: boolean; error?: string } {
    const progress = this.playerProgress.get(playerId);
    if (!progress) {
      return { success: false, error: 'Player progress not found' };
    }
    
    if (progress.hasPremium) {
      return { success: false, error: 'Already have premium' };
    }
    
    progress.hasPremium = true;
    progress.premiumPurchasedAt = Date.now();
    
    // Update season stats
    const season = this.currentSeason;
    if (season) {
      season.premiumPurchases++;
    }
    
    return { success: true };
  }
  
  public addXp(playerId: string, xp: number, source: string): { 
    success: boolean; 
    leveledUp: boolean; 
    newLevel?: number;
    rewards?: BattlePassReward[];
  } {
    const progress = this.playerProgress.get(playerId);
    if (!progress || !this.currentSeason) {
      return { success: false, leveledUp: false };
    }
    
    // Apply premium bonus
    if (progress.hasPremium) {
      xp = Math.floor(xp * SEASONAL_CONFIG.PREMIUM_XP_BONUS);
    }
    
    progress.currentXp += xp;
    progress.totalXpEarned += xp;
    
    // Check for level up
    const levels = this.battlePassLevels.get(progress.seasonId);
    if (!levels) {
      return { success: true, leveledUp: false };
    }
    
    let leveledUp = false;
    let newLevel = progress.currentLevel;
    const rewards: BattlePassReward[] = [];
    
    while (newLevel < SEASONAL_CONFIG.BATTLE_PASS_MAX_LEVEL) {
      const nextLevel = levels[newLevel];
      if (!nextLevel || progress.currentXp < nextLevel.cumulativeXp) {
        break;
      }
      
      newLevel++;
      leveledUp = true;
      
      // Auto-claim rewards
      const levelRewards = this.claimRewards(playerId, newLevel);
      if (levelRewards.success && levelRewards.rewards) {
        rewards.push(...levelRewards.rewards);
      }
    }
    
    if (leveledUp) {
      progress.currentLevel = newLevel;
    }
    
    return { success: true, leveledUp, newLevel, rewards };
  }
  
  public claimRewards(playerId: string, level: number): {
    success: boolean;
    error?: string;
    rewards?: BattlePassReward[];
  } {
    const progress = this.playerProgress.get(playerId);
    if (!progress) {
      return { success: false, error: 'Player progress not found' };
    }
    
    if (level > progress.currentLevel) {
      return { success: false, error: 'Level not reached yet' };
    }
    
    const levels = this.battlePassLevels.get(progress.seasonId);
    if (!levels) {
      return { success: false, error: 'Season not found' };
    }
    
    const levelData = levels[level - 1];
    if (!levelData) {
      return { success: false, error: 'Level data not found' };
    }
    
    const rewards: BattlePassReward[] = [];
    
    // Claim free rewards
    if (!progress.claimedFreeRewards.has(level)) {
      rewards.push(...levelData.freeRewards);
      progress.claimedFreeRewards.add(level);
    }
    
    // Claim premium rewards if has premium
    if (progress.hasPremium && !progress.claimedPremiumRewards.has(level)) {
      rewards.push(...levelData.premiumRewards);
      progress.claimedPremiumRewards.add(level);
    }
    
    return { success: true, rewards };
  }
  
  public purchaseLevelBoost(playerId: string, levels: number): {
    success: boolean;
    error?: string;
    newLevel?: number;
  } {
    if (levels > SEASONAL_CONFIG.MAX_BOOSTER_PURCHASE) {
      return { success: false, error: `Maximum ${SEASONAL_CONFIG.MAX_BOOSTER_PURCHASE} levels per purchase` };
    }
    
    const progress = this.playerProgress.get(playerId);
    if (!progress) {
      return { success: false, error: 'Player progress not found' };
    }
    
    const newLevel = Math.min(
      progress.currentLevel + levels,
      SEASONAL_CONFIG.BATTLE_PASS_MAX_LEVEL
    );
    
    progress.currentLevel = newLevel;
    
    return { success: true, newLevel };
  }
  
  // ============ QUESTS & EVENTS ============
  
  public getActiveQuests(seasonId: string): SeasonalQuest[] {
    const quests = this.seasonalQuests.get(seasonId) || [];
    return quests.filter(q => q.isActive && !q.isCompleted && q.expiresAt > Date.now());
  }
  
  public completeQuestObjective(
    playerId: string,
    questId: string,
    objectiveIndex: number,
    progress: number
  ): { success: boolean; questCompleted: boolean; xpGained?: number } {
    const quests = this.seasonalQuests.get(this.currentSeason?.id || '');
    const quest = quests?.find(q => q.id === questId);
    
    if (!quest) {
      return { success: false, questCompleted: false };
    }
    
    const objective = quest.objectives[objectiveIndex];
    if (!objective) {
      return { success: false, questCompleted: false };
    }
    
    objective.current = Math.min(objective.current + progress, objective.target);
    objective.completed = objective.current >= objective.target;
    
    // Check if all objectives completed
    const allCompleted = quest.objectives.every(o => o.completed);
    
    if (allCompleted && !quest.isCompleted) {
      quest.isCompleted = true;
      
      const playerProgress = this.playerProgress.get(playerId);
      if (playerProgress) {
        playerProgress.questsCompleted++;
        this.addXp(playerId, quest.xpReward, `quest_${questId}`);
      }
      
      return { success: true, questCompleted: true, xpGained: quest.xpReward };
    }
    
    return { success: true, questCompleted: false };
  }
  
  public getActiveEvents(seasonId: string): SeasonalEvent[] {
    const events = this.seasonalEvents.get(seasonId) || [];
    const now = Date.now();
    return events.filter(e => e.startTime <= now && e.endTime >= now);
  }
  
  public participateInEvent(playerId: string, eventId: string): { success: boolean; error?: string } {
    const events = this.seasonalEvents.get(this.currentSeason?.id || '');
    const event = events?.find(e => e.id === eventId);
    
    if (!event) {
      return { success: false, error: 'Event not found' };
    }
    
    if (!event.isActive) {
      return { success: false, error: 'Event not active' };
    }
    
    const progress = this.playerProgress.get(playerId);
    if (progress) {
      progress.eventsParticipated++;
    }
    
    event.totalParticipants++;
    
    return { success: true };
  }
  
  // ============ LEADERBOARDS ============
  
  public updateLeaderboard(seasonId: string, type: LeaderboardType) {
    const entries = Array.from(this.playerProgress.values())
      .filter(p => p.seasonId === seasonId)
      .map(p => ({
        rank: 0,
        playerId: p.playerId,
        playerName: `Player ${p.playerId.substr(0, 8)}`,
        score: type === 'battle_pass_xp' ? p.totalXpEarned : 
               type === 'challenges_completed' ? p.questsCompleted : 0,
        level: p.currentLevel,
        hasPremium: p.hasPremium,
        lastUpdate: Date.now(),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, SEASONAL_CONFIG.TOP_LEADERBOARD_REWARDS);
    
    // Assign ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    const leaderboard: SeasonalLeaderboard = {
      seasonId,
      type,
      entries,
      lastUpdate: Date.now(),
    };
    
    this.leaderboards.set(`${seasonId}_${type}`, leaderboard);
  }
  
  public getLeaderboard(seasonId: string, type: LeaderboardType): SeasonalLeaderboard | null {
    return this.leaderboards.get(`${seasonId}_${type}`) || null;
  }
  
  // ============ COSMETICS ============
  
  public getLimitedCosmetics(seasonId: string): LimitedCosmetic[] {
    return this.limitedCosmetics.get(seasonId) || [];
  }
  
  public unlockCosmetic(playerId: string, cosmeticId: string): { success: boolean; error?: string } {
    const cosmetics = this.limitedCosmetics.get(this.currentSeason?.id || '');
    const cosmetic = cosmetics?.find(c => c.id === cosmeticId);
    
    if (!cosmetic) {
      return { success: false, error: 'Cosmetic not found' };
    }
    
    // Check requirements
    if (cosmetic.battlePassLevel) {
      const progress = this.playerProgress.get(playerId);
      if (!progress || progress.currentLevel < cosmetic.battlePassLevel) {
        return { success: false, error: 'Battle pass level requirement not met' };
      }
    }
    
    cosmetic.totalOwned++;
    
    return { success: true };
  }
  
  // ============ STATS ============
  
  public getSeasonStats(seasonId: string): SeasonStats | null {
    let stats = this.seasonStats.get(seasonId);
    
    if (!stats) {
      const season = this.seasons.get(seasonId);
      if (!season) return null;
      
      const players = Array.from(this.playerProgress.values()).filter(p => p.seasonId === seasonId);
      
      stats = {
        seasonId,
        totalPlayers: players.length,
        activePlayersToday: players.filter(p => Date.now() - p.lastLoginDate < 86400000).length,
        premiumOwners: players.filter(p => p.hasPremium).length,
        premiumConversionRate: players.length > 0 ? (players.filter(p => p.hasPremium).length / players.length) * 100 : 0,
        averageLevel: players.length > 0 ? players.reduce((sum, p) => sum + p.currentLevel, 0) / players.length : 0,
        maxLevelReached: Math.max(...players.map(p => p.currentLevel), 0),
        totalXpEarned: players.reduce((sum, p) => sum + p.totalXpEarned, 0),
        premiumSales: season.premiumPurchases * SEASONAL_CONFIG.PREMIUM_COST_GEMS,
        levelBoosters: 0,
        cosmeticSales: 0,
        totalRevenue: season.premiumPurchases * SEASONAL_CONFIG.PREMIUM_COST_GEMS,
        level50Reached: players.filter(p => p.currentLevel >= 50).length,
        level100Reached: players.filter(p => p.currentLevel >= 100).length,
        allQuestsCompleted: 0,
        allEventsParticipated: 0,
      };
      
      this.seasonStats.set(seasonId, stats);
    }
    
    return stats;
  }
  
  // ============ BACKGROUND PROCESSES ============
  
  private startBackgroundProcesses() {
    // Update leaderboards every 5 minutes
    setInterval(() => {
      if (this.currentSeason) {
        this.updateLeaderboard(this.currentSeason.id, 'battle_pass_xp');
        this.updateLeaderboard(this.currentSeason.id, 'challenges_completed');
      }
    }, SEASONAL_CONFIG.LEADERBOARD_UPDATE_INTERVAL);
    
    // Check for season end
    setInterval(() => {
      if (this.currentSeason && Date.now() >= this.currentSeason.endDate) {
        this.currentSeason.status = 'ended';
        // TODO: Start new season
      }
    }, 3600000); // Check every hour
    
    // Refresh daily quests
    setInterval(() => {
      if (this.currentSeason) {
        this.initializeQuests(this.currentSeason.id);
      }
    }, 86400000); // Daily
  }
}

export function getSeasonalSystem(): SeasonalSystem {
  return SeasonalSystem.getSeasonalSystem();
}
