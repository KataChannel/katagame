// Leaderboard & Ranking System for Vietnamese History Game
// Global and regional leaderboards with rank tiers and rewards

export type LeaderboardType = 'power' | 'pvp' | 'guild' | 'seasonal' | 'wealth';
export type RankTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'grandmaster' | 'legend';
export type Region = 'north' | 'central' | 'south' | 'global';
export type TimeFrame = 'weekly' | 'monthly' | 'all-time';

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  score: number;
  tier: RankTier;
  region: Region;
  
  // Additional stats
  level: number;
  guildName?: string;
  titleName?: string;
  avatarUrl?: string;
  
  // Change tracking
  previousRank?: number;
  rankChange: number; // positive = up, negative = down
  
  // Meta
  lastUpdated: number;
}

export interface PlayerRanking {
  playerId: string;
  
  // Scores by type
  powerScore: number;
  pvpScore: number;
  guildScore: number;
  seasonalScore: number;
  wealthScore: number;
  
  // Current ranks
  powerRank?: number;
  pvpRank?: number;
  guildRank?: number;
  seasonalRank?: number;
  wealthRank?: number;
  
  // Tiers
  powerTier: RankTier;
  pvpTier: RankTier;
  guildTier: RankTier;
  seasonalTier: RankTier;
  wealthTier: RankTier;
  
  // Region
  region: Region;
  
  // Activity
  lastActiveDate: number;
  consecutiveDaysActive: number;
  
  // Rewards
  unclaimedRewards: Map<string, any>;
  totalRewardsClaimed: number;
  
  lastUpdated: number;
}

export interface RankTierConfig {
  tier: RankTier;
  minScore: number;
  maxScore: number;
  color: string;
  icon: string;
  
  rewards: {
    dailyGold: number;
    dailyGems: number;
    weeklyBonus: number;
    monthlyChest: string;
  };
  
  benefits: string[];
  nextTier?: RankTier;
}

export interface LeaderboardReward {
  id: string;
  leaderboardType: LeaderboardType;
  timeFrame: TimeFrame;
  rankStart: number;
  rankEnd: number;
  
  rewards: {
    gold: number;
    gems: number;
    exp: number;
    titleId?: string;
    cosmeticId?: string;
    specialItem?: string;
  };
  
  claimedBy: Set<string>;
  expiresAt: number;
}

export interface PlayerProfile {
  playerId: string;
  playerName: string;
  level: number;
  region: Region;
  
  // Rankings
  rankings: PlayerRanking;
  
  // Statistics
  stats: {
    totalBattles: number;
    battlesWon: number;
    winRate: number;
    
    totalPvpBattles: number;
    pvpWins: number;
    pvpWinRate: number;
    
    totalGold: number;
    totalGems: number;
    totalPower: number;
    
    achievementsUnlocked: number;
    titlesUnlocked: number;
    
    guildContribution: number;
    seasonalPoints: number;
  };
  
  // History
  rankHistory: {
    date: number;
    powerRank: number;
    pvpRank: number;
  }[];
  
  // Badges
  badges: string[];
  
  lastUpdated: number;
}

const RANK_TIER_CONFIG: Record<RankTier, RankTierConfig> = {
  bronze: {
    tier: 'bronze',
    minScore: 0,
    maxScore: 1000,
    color: '#CD7F32',
    icon: '🥉',
    rewards: {
      dailyGold: 500,
      dailyGems: 5,
      weeklyBonus: 5000,
      monthlyChest: 'Bronze Chest',
    },
    benefits: ['Daily login rewards', 'Basic leaderboard access'],
    nextTier: 'silver',
  },
  silver: {
    tier: 'silver',
    minScore: 1001,
    maxScore: 2500,
    color: '#C0C0C0',
    icon: '🥈',
    rewards: {
      dailyGold: 1000,
      dailyGems: 10,
      weeklyBonus: 12000,
      monthlyChest: 'Silver Chest',
    },
    benefits: ['Increased rewards', 'Silver badge', 'Priority matchmaking'],
    nextTier: 'gold',
  },
  gold: {
    tier: 'gold',
    minScore: 2501,
    maxScore: 5000,
    color: '#FFD700',
    icon: '🥇',
    rewards: {
      dailyGold: 2000,
      dailyGems: 20,
      weeklyBonus: 30000,
      monthlyChest: 'Gold Chest',
    },
    benefits: ['Gold rewards', 'Exclusive cosmetics', 'VIP chat access'],
    nextTier: 'platinum',
  },
  platinum: {
    tier: 'platinum',
    minScore: 5001,
    maxScore: 10000,
    color: '#E5E4E2',
    icon: '💎',
    rewards: {
      dailyGold: 4000,
      dailyGems: 40,
      weeklyBonus: 70000,
      monthlyChest: 'Platinum Chest',
    },
    benefits: ['Premium rewards', 'Platinum badge', 'Early access features'],
    nextTier: 'diamond',
  },
  diamond: {
    tier: 'diamond',
    minScore: 10001,
    maxScore: 20000,
    color: '#B9F2FF',
    icon: '💠',
    rewards: {
      dailyGold: 8000,
      dailyGems: 80,
      weeklyBonus: 150000,
      monthlyChest: 'Diamond Chest',
    },
    benefits: ['Elite rewards', 'Diamond aura', 'Premium support'],
    nextTier: 'master',
  },
  master: {
    tier: 'master',
    minScore: 20001,
    maxScore: 40000,
    color: '#FF1493',
    icon: '⭐',
    rewards: {
      dailyGold: 15000,
      dailyGems: 150,
      weeklyBonus: 300000,
      monthlyChest: 'Master Chest',
    },
    benefits: ['Master rewards', 'Exclusive title', 'Custom emotes'],
    nextTier: 'grandmaster',
  },
  grandmaster: {
    tier: 'grandmaster',
    minScore: 40001,
    maxScore: 80000,
    color: '#8B00FF',
    icon: '🌟',
    rewards: {
      dailyGold: 30000,
      dailyGems: 300,
      weeklyBonus: 600000,
      monthlyChest: 'Grandmaster Chest',
    },
    benefits: ['Grandmaster status', 'Legendary cosmetics', 'Personal manager'],
    nextTier: 'legend',
  },
  legend: {
    tier: 'legend',
    minScore: 80001,
    maxScore: Infinity,
    color: '#FFD700',
    icon: '👑',
    rewards: {
      dailyGold: 50000,
      dailyGems: 500,
      weeklyBonus: 1000000,
      monthlyChest: 'Legendary Chest',
    },
    benefits: ['Legend status', 'Mythic rewards', 'Hall of Fame', 'Developer access'],
  },
};

const LEADERBOARD_CONFIG = {
  MAX_ENTRIES: 500,
  TOP_DISPLAY: 100,
  UPDATE_INTERVAL: 300000, // 5 minutes
  DECAY_INTERVAL: 604800000, // 1 week
  DECAY_AMOUNT: 50,
  INACTIVITY_THRESHOLD: 604800000, // 1 week
  
  SCORE_CALCULATIONS: {
    power: (player: any) => player.power || 0,
    pvp: (player: any) => player.pvpRating || 0,
    guild: (player: any) => player.guildContribution || 0,
    seasonal: (player: any) => player.seasonalPoints || 0,
    wealth: (player: any) => (player.gold || 0) + (player.gems || 0) * 100,
  },
  
  REGIONS: {
    north: ['Hanoi', 'Haiphong', 'Quangninh', 'Thaibinh', 'Namdinh'],
    central: ['Danang', 'Hue', 'Quangnam', 'Quangngai', 'Nghean'],
    south: ['Hochiminh', 'Binhduong', 'Dongnai', 'Vungtau', 'Cantho'],
  },
};

class LeaderboardSystem {
  private static instance: LeaderboardSystem;
  
  private leaderboards: Map<string, LeaderboardEntry[]> = new Map();
  private playerRankings: Map<string, PlayerRanking> = new Map();
  private playerProfiles: Map<string, PlayerProfile> = new Map();
  private rewards: Map<string, LeaderboardReward> = new Map();
  
  private constructor() {
    this.initializeLeaderboards();
    this.initializeRewards();
    this.startBackgroundProcesses();
  }
  
  public static getInstance(): LeaderboardSystem {
    if (!LeaderboardSystem.instance) {
      LeaderboardSystem.instance = new LeaderboardSystem();
    }
    return LeaderboardSystem.instance;
  }
  
  private initializeLeaderboards(): void {
    const types: LeaderboardType[] = ['power', 'pvp', 'guild', 'seasonal', 'wealth'];
    const timeFrames: TimeFrame[] = ['weekly', 'monthly', 'all-time'];
    const regions: Region[] = ['north', 'central', 'south', 'global'];
    
    types.forEach(type => {
      timeFrames.forEach(timeFrame => {
        regions.forEach(region => {
          const key = `${type}_${timeFrame}_${region}`;
          this.leaderboards.set(key, []);
        });
      });
    });
  }
  
  private initializeRewards(): void {
    const types: LeaderboardType[] = ['power', 'pvp', 'guild', 'seasonal', 'wealth'];
    const timeFrames: TimeFrame[] = ['weekly', 'monthly'];
    
    const rewardTiers = [
      { ranks: [1, 1], gold: 100000, gems: 1000, exp: 500000, title: 'Champion' },
      { ranks: [2, 3], gold: 75000, gems: 750, exp: 400000 },
      { ranks: [4, 10], gold: 50000, gems: 500, exp: 300000 },
      { ranks: [11, 50], gold: 25000, gems: 250, exp: 150000 },
      { ranks: [51, 100], gold: 10000, gems: 100, exp: 75000 },
    ];
    
    types.forEach(type => {
      timeFrames.forEach(timeFrame => {
        rewardTiers.forEach((tier, index) => {
          const reward: LeaderboardReward = {
            id: `${type}_${timeFrame}_${tier.ranks[0]}_${tier.ranks[1]}`,
            leaderboardType: type,
            timeFrame,
            rankStart: tier.ranks[0],
            rankEnd: tier.ranks[1],
            rewards: {
              gold: tier.gold * (timeFrame === 'monthly' ? 4 : 1),
              gems: tier.gems * (timeFrame === 'monthly' ? 4 : 1),
              exp: tier.exp * (timeFrame === 'monthly' ? 4 : 1),
              titleId: index === 0 && tier.title ? `title_${type}_${timeFrame}_${tier.title.toLowerCase()}` : undefined,
            },
            claimedBy: new Set(),
            expiresAt: Date.now() + (timeFrame === 'weekly' ? 7 : 30) * 86400000,
          };
          this.rewards.set(reward.id, reward);
        });
      });
    });
  }
  
  public initializePlayerRanking(playerId: string, region: Region = 'global'): PlayerRanking {
    const ranking: PlayerRanking = {
      playerId,
      powerScore: 0,
      pvpScore: 0,
      guildScore: 0,
      seasonalScore: 0,
      wealthScore: 0,
      powerTier: 'bronze',
      pvpTier: 'bronze',
      guildTier: 'bronze',
      seasonalTier: 'bronze',
      wealthTier: 'bronze',
      region,
      lastActiveDate: Date.now(),
      consecutiveDaysActive: 1,
      unclaimedRewards: new Map(),
      totalRewardsClaimed: 0,
      lastUpdated: Date.now(),
    };
    
    this.playerRankings.set(playerId, ranking);
    return ranking;
  }
  
  public getPlayerRanking(playerId: string): PlayerRanking | undefined {
    return this.playerRankings.get(playerId);
  }
  
  public updatePlayerScore(
    playerId: string,
    type: LeaderboardType,
    score: number
  ): void {
    let ranking = this.playerRankings.get(playerId);
    if (!ranking) {
      ranking = this.initializePlayerRanking(playerId);
    }
    
    const scoreKey = `${type}Score` as keyof PlayerRanking;
    (ranking as any)[scoreKey] = score;
    
    const tierKey = `${type}Tier` as keyof PlayerRanking;
    (ranking as any)[tierKey] = this.calculateTier(score);
    
    ranking.lastActiveDate = Date.now();
    ranking.lastUpdated = Date.now();
  }
  
  public updateLeaderboard(
    type: LeaderboardType,
    timeFrame: TimeFrame,
    region: Region = 'global'
  ): void {
    const key = `${type}_${timeFrame}_${region}`;
    const entries: LeaderboardEntry[] = [];
    
    this.playerRankings.forEach((ranking, playerId) => {
      if (region !== 'global' && ranking.region !== region) return;
      
      const score = this.getScoreByType(ranking, type);
      if (score <= 0) return;
      
      const profile = this.playerProfiles.get(playerId);
      
      entries.push({
        rank: 0,
        playerId,
        playerName: profile?.playerName || `Player ${playerId.substring(0, 8)}`,
        score,
        tier: this.calculateTier(score),
        region: ranking.region,
        level: profile?.level || 1,
        guildName: profile?.stats?.guildContribution ? 'Guild Name' : undefined,
        titleName: profile?.rankings ? 'Title' : undefined,
        rankChange: 0,
        lastUpdated: Date.now(),
      });
    });
    
    entries.sort((a, b) => b.score - a.score);
    
    const previousLeaderboard = this.leaderboards.get(key) || [];
    const previousRanks = new Map(previousLeaderboard.map(e => [e.playerId, e.rank]));
    
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
      entry.previousRank = previousRanks.get(entry.playerId);
      if (entry.previousRank) {
        entry.rankChange = entry.previousRank - entry.rank;
      }
    });
    
    this.leaderboards.set(key, entries.slice(0, LEADERBOARD_CONFIG.MAX_ENTRIES));
    
    entries.forEach(entry => {
      const ranking = this.playerRankings.get(entry.playerId);
      if (ranking) {
        const rankKey = `${type}Rank` as keyof PlayerRanking;
        (ranking as any)[rankKey] = entry.rank;
      }
    });
  }
  
  public getLeaderboard(
    type: LeaderboardType,
    timeFrame: TimeFrame,
    region: Region = 'global',
    limit: number = LEADERBOARD_CONFIG.TOP_DISPLAY
  ): LeaderboardEntry[] {
    const key = `${type}_${timeFrame}_${region}`;
    const leaderboard = this.leaderboards.get(key) || [];
    return leaderboard.slice(0, limit);
  }
  
  public getPlayerRank(
    playerId: string,
    type: LeaderboardType,
    timeFrame: TimeFrame,
    region: Region = 'global'
  ): LeaderboardEntry | undefined {
    const key = `${type}_${timeFrame}_${region}`;
    const leaderboard = this.leaderboards.get(key) || [];
    return leaderboard.find(e => e.playerId === playerId);
  }
  
  public getPlayerProfile(playerId: string): PlayerProfile | undefined {
    return this.playerProfiles.get(playerId);
  }
  
  public createPlayerProfile(
    playerId: string,
    playerName: string,
    level: number,
    region: Region = 'global'
  ): PlayerProfile {
    const ranking = this.playerRankings.get(playerId) || this.initializePlayerRanking(playerId, region);
    
    const profile: PlayerProfile = {
      playerId,
      playerName,
      level,
      region,
      rankings: ranking,
      stats: {
        totalBattles: 0,
        battlesWon: 0,
        winRate: 0,
        totalPvpBattles: 0,
        pvpWins: 0,
        pvpWinRate: 0,
        totalGold: 0,
        totalGems: 0,
        totalPower: 0,
        achievementsUnlocked: 0,
        titlesUnlocked: 0,
        guildContribution: 0,
        seasonalPoints: 0,
      },
      rankHistory: [],
      badges: [],
      lastUpdated: Date.now(),
    };
    
    this.playerProfiles.set(playerId, profile);
    return profile;
  }
  
  public updatePlayerStats(playerId: string, stats: Partial<PlayerProfile['stats']>): void {
    const profile = this.playerProfiles.get(playerId);
    if (!profile) return;
    
    Object.assign(profile.stats, stats);
    
    if (stats.battlesWon !== undefined && stats.totalBattles !== undefined) {
      profile.stats.winRate = (stats.battlesWon / stats.totalBattles) * 100;
    }
    
    if (stats.pvpWins !== undefined && stats.totalPvpBattles !== undefined) {
      profile.stats.pvpWinRate = (stats.pvpWins / stats.totalPvpBattles) * 100;
    }
    
    profile.lastUpdated = Date.now();
  }
  
  public addRankHistory(playerId: string): void {
    const profile = this.playerProfiles.get(playerId);
    const ranking = this.playerRankings.get(playerId);
    if (!profile || !ranking) return;
    
    profile.rankHistory.push({
      date: Date.now(),
      powerRank: ranking.powerRank || 0,
      pvpRank: ranking.pvpRank || 0,
    });
    
    if (profile.rankHistory.length > 30) {
      profile.rankHistory.shift();
    }
  }
  
  public awardBadge(playerId: string, badge: string): void {
    const profile = this.playerProfiles.get(playerId);
    if (!profile) return;
    
    if (!profile.badges.includes(badge)) {
      profile.badges.push(badge);
    }
  }
  
  public getTierConfig(tier: RankTier): RankTierConfig {
    return RANK_TIER_CONFIG[tier];
  }
  
  public getAllTierConfigs(): RankTierConfig[] {
    return Object.values(RANK_TIER_CONFIG);
  }
  
  public getRewardsForRank(
    type: LeaderboardType,
    timeFrame: TimeFrame,
    rank: number
  ): LeaderboardReward | undefined {
    const rewards = Array.from(this.rewards.values()).filter(
      r => r.leaderboardType === type &&
           r.timeFrame === timeFrame &&
           rank >= r.rankStart &&
           rank <= r.rankEnd
    );
    
    return rewards[0];
  }
  
  public claimReward(playerId: string, rewardId: string): any {
    const reward = this.rewards.get(rewardId);
    if (!reward || reward.claimedBy.has(playerId)) return null;
    
    reward.claimedBy.add(playerId);
    
    const ranking = this.playerRankings.get(playerId);
    if (ranking) {
      ranking.totalRewardsClaimed++;
    }
    
    return reward.rewards;
  }
  
  public getDailyRewards(playerId: string): any {
    const ranking = this.playerRankings.get(playerId);
    if (!ranking) return null;
    
    const tiers = {
      power: RANK_TIER_CONFIG[ranking.powerTier],
      pvp: RANK_TIER_CONFIG[ranking.pvpTier],
      guild: RANK_TIER_CONFIG[ranking.guildTier],
      seasonal: RANK_TIER_CONFIG[ranking.seasonalTier],
      wealth: RANK_TIER_CONFIG[ranking.wealthTier],
    };
    
    const totalGold = Object.values(tiers).reduce((sum, t) => sum + t.rewards.dailyGold, 0);
    const totalGems = Object.values(tiers).reduce((sum, t) => sum + t.rewards.dailyGems, 0);
    
    return {
      gold: totalGold,
      gems: totalGems,
      breakdown: tiers,
    };
  }
  
  private calculateTier(score: number): RankTier {
    const tiers = Object.values(RANK_TIER_CONFIG).reverse();
    for (const tier of tiers) {
      if (score >= tier.minScore) {
        return tier.tier;
      }
    }
    return 'bronze';
  }
  
  private getScoreByType(ranking: PlayerRanking, type: LeaderboardType): number {
    const scoreMap: Record<LeaderboardType, number> = {
      power: ranking.powerScore,
      pvp: ranking.pvpScore,
      guild: ranking.guildScore,
      seasonal: ranking.seasonalScore,
      wealth: ranking.wealthScore,
    };
    return scoreMap[type];
  }
  
  private applyDecay(): void {
    const now = Date.now();
    const inactivityThreshold = now - LEADERBOARD_CONFIG.INACTIVITY_THRESHOLD;
    
    this.playerRankings.forEach(ranking => {
      if (ranking.lastActiveDate < inactivityThreshold) {
        ranking.powerScore = Math.max(0, ranking.powerScore - LEADERBOARD_CONFIG.DECAY_AMOUNT);
        ranking.pvpScore = Math.max(0, ranking.pvpScore - LEADERBOARD_CONFIG.DECAY_AMOUNT);
        ranking.guildScore = Math.max(0, ranking.guildScore - LEADERBOARD_CONFIG.DECAY_AMOUNT);
        ranking.seasonalScore = Math.max(0, ranking.seasonalScore - LEADERBOARD_CONFIG.DECAY_AMOUNT);
        
        ranking.powerTier = this.calculateTier(ranking.powerScore);
        ranking.pvpTier = this.calculateTier(ranking.pvpScore);
        ranking.guildTier = this.calculateTier(ranking.guildScore);
        ranking.seasonalTier = this.calculateTier(ranking.seasonalScore);
      }
    });
  }
  
  private startBackgroundProcesses(): void {
    setInterval(() => {
      const types: LeaderboardType[] = ['power', 'pvp', 'guild', 'seasonal', 'wealth'];
      const timeFrames: TimeFrame[] = ['weekly', 'monthly', 'all-time'];
      const regions: Region[] = ['north', 'central', 'south', 'global'];
      
      types.forEach(type => {
        timeFrames.forEach(timeFrame => {
          regions.forEach(region => {
            this.updateLeaderboard(type, timeFrame, region);
          });
        });
      });
    }, LEADERBOARD_CONFIG.UPDATE_INTERVAL);
    
    setInterval(() => {
      this.applyDecay();
    }, LEADERBOARD_CONFIG.DECAY_INTERVAL);
  }
}

let leaderboardSystemInstance: LeaderboardSystem | null = null;

export function getLeaderboardSystem(): LeaderboardSystem {
  if (!leaderboardSystemInstance) {
    leaderboardSystemInstance = LeaderboardSystem.getInstance();
  }
  return leaderboardSystemInstance;
}
