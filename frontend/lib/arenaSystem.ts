/**
 * Arena System - PvP Battle System
 * 
 * Features:
 * - ELO Rating System
 * - Matchmaking (find 5 similar opponents)
 * - Battle Simulation
 * - Rank Tiers (Bronze → Legend)
 * - Arena Rewards (daily/weekly gems)
 * - Arena Shop (8 items with arena coins)
 * - Defense Team Setup
 * - Battle History
 * - Leaderboard (top 100)
 */

import { Hero, Pet } from './types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ArenaRank = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legend';

export interface ArenaPlayer {
  playerId: string;
  playerName: string;
  playerLevel: number;
  rating: number; // ELO rating
  rank: ArenaRank;
  wins: number;
  losses: number;
  winStreak: number; // Current win streak
  highestRating: number;
  defenseTeam: {
    heroIds: string[];
    petId?: string;
    teamPower: number; // Total power of defense team
  };
  lastBattleTime: number;
}

export interface ArenaBattle {
  id: string;
  attackerId: string;
  attackerName: string;
  defenderId: string;
  defenderName: string;
  attackerRating: number;
  defenderRating: number;
  result: 'win' | 'loss';
  ratingChange: number; // Can be positive or negative
  rewardCoins: number;
  timestamp: number;
  battleLog?: string[]; // Optional battle replay log
}

export interface ArenaRewards {
  rank: ArenaRank;
  dailyCoins: number;
  weeklyGems: number;
  seasonGems: number;
}

export interface ArenaShopItem {
  id: string;
  type: 'hero' | 'pet' | 'resource' | 'skin';
  itemId: string; // Hero ID, Pet ID, etc.
  displayName: string;
  description: string;
  cost: number; // Arena coins
  stock: number; // -1 for unlimited
  refreshCooldown: number; // Milliseconds until stock refreshes
  lastPurchase?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface ArenaState {
  player: ArenaPlayer;
  dailyBattles: number; // Battles used today (max 5)
  dailyBattlesMax: number;
  arenaCoins: number;
  lastResetTime: number; // Last daily reset timestamp
  matchedOpponents: ArenaPlayer[]; // Current 5 opponents
  battleHistory: ArenaBattle[];
  shopItems: ArenaShopItem[];
  lastShopRefresh: number;
  season: {
    number: number;
    startTime: number;
    endTime: number;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const ARENA_CONSTANTS = {
  DAILY_BATTLES_MAX: 5,
  MATCHMAKING_POOL_SIZE: 5,
  ELO_K_FACTOR: 25, // Rating change multiplier
  INITIAL_RATING: 1000,
  BATTLE_REWARD_BASE: 10, // Base arena coins per battle
  BATTLE_REWARD_WIN_BONUS: 5,
  SHOP_REFRESH_HOURS: 24,
  SEASON_DURATION_DAYS: 30,
};

export const RANK_THRESHOLDS: Record<ArenaRank, { min: number; max: number; displayName: string; color: string }> = {
  bronze: { min: 0, max: 999, displayName: 'Đồng', color: '#cd7f32' },
  silver: { min: 1000, max: 1499, displayName: 'Bạc', color: '#c0c0c0' },
  gold: { min: 1500, max: 1999, displayName: 'Vàng', color: '#ffd700' },
  platinum: { min: 2000, max: 2499, displayName: 'Bạch Kim', color: '#e5e4e2' },
  diamond: { min: 2500, max: 2999, displayName: 'Kim Cương', color: '#b9f2ff' },
  legend: { min: 3000, max: 99999, displayName: 'Huyền Thoại', color: '#ff00ff' },
};

export const ARENA_REWARDS: Record<ArenaRank, ArenaRewards> = {
  bronze: { rank: 'bronze', dailyCoins: 50, weeklyGems: 100, seasonGems: 500 },
  silver: { rank: 'silver', dailyCoins: 75, weeklyGems: 150, seasonGems: 750 },
  gold: { rank: 'gold', dailyCoins: 100, weeklyGems: 200, seasonGems: 1000 },
  platinum: { rank: 'platinum', dailyCoins: 150, weeklyGems: 300, seasonGems: 1500 },
  diamond: { rank: 'diamond', dailyCoins: 200, weeklyGems: 400, seasonGems: 2000 },
  legend: { rank: 'legend', dailyCoins: 300, weeklyGems: 600, seasonGems: 3000 },
};

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Initialize Arena State for a new player
 */
export function initializeArenaState(playerId: string, playerName: string, playerLevel: number): ArenaState {
  const now = Date.now();
  const seasonStart = new Date();
  seasonStart.setDate(1); // Start of month
  seasonStart.setHours(0, 0, 0, 0);

  return {
    player: {
      playerId,
      playerName,
      playerLevel,
      rating: ARENA_CONSTANTS.INITIAL_RATING,
      rank: 'bronze',
      wins: 0,
      losses: 0,
      winStreak: 0,
      highestRating: ARENA_CONSTANTS.INITIAL_RATING,
      defenseTeam: {
        heroIds: [],
        teamPower: 0,
      },
      lastBattleTime: 0,
    },
    dailyBattles: 0,
    dailyBattlesMax: ARENA_CONSTANTS.DAILY_BATTLES_MAX,
    arenaCoins: 0,
    lastResetTime: now,
    matchedOpponents: [],
    battleHistory: [],
    shopItems: initializeArenaShop(),
    lastShopRefresh: now,
    season: {
      number: 1,
      startTime: seasonStart.getTime(),
      endTime: seasonStart.getTime() + (ARENA_CONSTANTS.SEASON_DURATION_DAYS * 24 * 60 * 60 * 1000),
    },
  };
}

/**
 * Get rank from ELO rating
 */
export function getRankFromRating(rating: number): ArenaRank {
  if (rating >= RANK_THRESHOLDS.legend.min) return 'legend';
  if (rating >= RANK_THRESHOLDS.diamond.min) return 'diamond';
  if (rating >= RANK_THRESHOLDS.platinum.min) return 'platinum';
  if (rating >= RANK_THRESHOLDS.gold.min) return 'gold';
  if (rating >= RANK_THRESHOLDS.silver.min) return 'silver';
  return 'bronze';
}

/**
 * Get rank details
 */
export function getRankDetails(rank: ArenaRank) {
  return RANK_THRESHOLDS[rank];
}

/**
 * Get rank rewards
 */
export function getRankRewards(rank: ArenaRank): ArenaRewards {
  return ARENA_REWARDS[rank];
}

/**
 * Calculate expected win probability (for ELO)
 */
function calculateExpectedScore(playerRating: number, opponentRating: number): number {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
}

/**
 * Calculate ELO rating change
 */
export function calculateELOChange(
  playerRating: number,
  opponentRating: number,
  won: boolean
): number {
  const expected = calculateExpectedScore(playerRating, opponentRating);
  const actual = won ? 1 : 0;
  const change = Math.round(ARENA_CONSTANTS.ELO_K_FACTOR * (actual - expected));
  return change;
}

/**
 * Update player rating after battle
 */
export function updatePlayerRating(
  player: ArenaPlayer,
  opponent: ArenaPlayer,
  won: boolean
): { updatedPlayer: ArenaPlayer; ratingChange: number } {
  const ratingChange = calculateELOChange(player.rating, opponent.rating, won);
  const newRating = Math.max(0, player.rating + ratingChange);
  const newRank = getRankFromRating(newRating);

  const updatedPlayer: ArenaPlayer = {
    ...player,
    rating: newRating,
    rank: newRank,
    wins: won ? player.wins + 1 : player.wins,
    losses: won ? player.losses : player.losses + 1,
    winStreak: won ? player.winStreak + 1 : 0,
    highestRating: Math.max(player.highestRating, newRating),
    lastBattleTime: Date.now(),
  };

  return { updatedPlayer, ratingChange };
}

/**
 * Generate matchmaking opponents
 * Finds 5 players with similar rating (±200 range)
 */
export function generateMatchmakingOpponents(
  playerRating: number,
  playerLevel: number,
  allPlayers?: ArenaPlayer[]
): ArenaPlayer[] {
  // If no players provided, generate mock opponents
  const ratingRange = 200;
  const minRating = Math.max(0, playerRating - ratingRange);
  const maxRating = playerRating + ratingRange;

  const opponents: ArenaPlayer[] = [];

  // Generate 5 opponents with varying ratings
  for (let i = 0; i < ARENA_CONSTANTS.MATCHMAKING_POOL_SIZE; i++) {
    const opponentRating = Math.floor(
      minRating + Math.random() * (maxRating - minRating)
    );
    const opponentRank = getRankFromRating(opponentRating);
    
    // Generate random defense team power (80-120% of player's implied power)
    const basePower = playerLevel * 100;
    const powerVariance = basePower * 0.4;
    const teamPower = Math.floor(basePower + (Math.random() - 0.5) * powerVariance);

    opponents.push({
      playerId: `opponent-${Date.now()}-${i}`,
      playerName: generateOpponentName(),
      playerLevel: Math.max(1, playerLevel + Math.floor((Math.random() - 0.5) * 5)),
      rating: opponentRating,
      rank: opponentRank,
      wins: Math.floor(Math.random() * 100),
      losses: Math.floor(Math.random() * 100),
      winStreak: Math.floor(Math.random() * 10),
      highestRating: opponentRating + Math.floor(Math.random() * 200),
      defenseTeam: {
        heroIds: [], // Would be populated with actual hero data
        teamPower,
      },
      lastBattleTime: Date.now() - Math.floor(Math.random() * 3600000),
    });
  }

  // Sort by rating (closest first)
  opponents.sort((a, b) => {
    const diffA = Math.abs(a.rating - playerRating);
    const diffB = Math.abs(b.rating - playerRating);
    return diffA - diffB;
  });

  return opponents;
}

/**
 * Generate random Vietnamese-themed opponent name
 */
function generateOpponentName(): string {
  const firstNames = ['Minh', 'Lan', 'Hùng', 'Mai', 'Tuấn', 'Hoa', 'Đức', 'Linh', 'Bình', 'Nga'];
  const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Đặng', 'Bùi', 'Đỗ'];
  const titles = ['Đại Tướng', 'Chiến Thần', 'Anh Hùng', 'Huyền Thoại', 'Bá Chủ', 'Cao Thủ'];
  
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  
  if (Math.random() > 0.7) {
    const title = titles[Math.floor(Math.random() * titles.length)];
    return `${title} ${lastName} ${firstName}`;
  }
  
  return `${lastName} ${firstName}`;
}

/**
 * Simulate battle between attacker and defender
 * Returns battle result and rewards
 */
export function simulateArenaBattle(
  attacker: ArenaPlayer,
  defender: ArenaPlayer,
  attackerHeroes: Hero[],
  defenderHeroes: Hero[]
): { result: 'win' | 'loss'; battleLog: string[] } {
  const battleLog: string[] = [];
  
  battleLog.push(`⚔️ ${attacker.playerName} (${attacker.rating}) vs ${defender.playerName} (${defender.rating})`);
  
  // Calculate team powers
  const attackerPower = attackerHeroes.reduce((sum, hero) => {
    const heroStats = hero.stats;
    return sum + (heroStats.attack + heroStats.defense + heroStats.hp) * hero.level;
  }, 0);
  
  const defenderPower = defender.defenseTeam.teamPower || defenderHeroes.reduce((sum, hero) => {
    const heroStats = hero.stats;
    return sum + (heroStats.attack + heroStats.defense + heroStats.hp) * hero.level;
  }, 0);
  
  battleLog.push(`💪 Sức mạnh: ${attackerPower} vs ${defenderPower}`);
  
  // Add some randomness (±20%)
  const attackerFinalPower = attackerPower * (0.9 + Math.random() * 0.2);
  const defenderFinalPower = defenderPower * (0.9 + Math.random() * 0.2);
  
  // Determine winner
  const attackerWins = attackerFinalPower > defenderFinalPower;
  
  if (attackerWins) {
    battleLog.push(`🎉 ${attacker.playerName} chiến thắng!`);
    battleLog.push(`💎 +${ARENA_CONSTANTS.BATTLE_REWARD_BASE + ARENA_CONSTANTS.BATTLE_REWARD_WIN_BONUS} Arena Coins`);
  } else {
    battleLog.push(`😔 ${attacker.playerName} bại trận!`);
    battleLog.push(`💎 +${ARENA_CONSTANTS.BATTLE_REWARD_BASE} Arena Coins (thua cuộc)`);
  }
  
  return {
    result: attackerWins ? 'win' : 'loss',
    battleLog,
  };
}

/**
 * Process arena battle and update state
 */
export function processArenaBattle(
  arenaState: ArenaState,
  opponentId: string,
  attackerHeroes: Hero[]
): {
  success: boolean;
  updatedState?: ArenaState;
  battle?: ArenaBattle;
  error?: string;
} {
  // Check daily battles limit
  if (arenaState.dailyBattles >= arenaState.dailyBattlesMax) {
    return {
      success: false,
      error: 'Đã hết lượt đánh hôm nay! Quay lại vào ngày mai.',
    };
  }

  // Find opponent
  const opponent = arenaState.matchedOpponents.find(opp => opp.playerId === opponentId);
  if (!opponent) {
    return {
      success: false,
      error: 'Không tìm thấy đối thủ!',
    };
  }

  // Check attacker has heroes
  if (attackerHeroes.length === 0) {
    return {
      success: false,
      error: 'Cần ít nhất 1 hero để chiến đấu!',
    };
  }

  // Simulate battle
  const battleResult = simulateArenaBattle(
    arenaState.player,
    opponent,
    attackerHeroes,
    [] // Defender heroes would come from opponent.defenseTeam
  );

  // Calculate rating changes
  const { updatedPlayer, ratingChange } = updatePlayerRating(
    arenaState.player,
    opponent,
    battleResult.result === 'win'
  );

  // Calculate rewards
  const rewardCoins = battleResult.result === 'win'
    ? ARENA_CONSTANTS.BATTLE_REWARD_BASE + ARENA_CONSTANTS.BATTLE_REWARD_WIN_BONUS
    : ARENA_CONSTANTS.BATTLE_REWARD_BASE;

  // Create battle record
  const battle: ArenaBattle = {
    id: `battle-${Date.now()}`,
    attackerId: arenaState.player.playerId,
    attackerName: arenaState.player.playerName,
    defenderId: opponent.playerId,
    defenderName: opponent.playerName,
    attackerRating: arenaState.player.rating,
    defenderRating: opponent.rating,
    result: battleResult.result,
    ratingChange,
    rewardCoins,
    timestamp: Date.now(),
    battleLog: battleResult.battleLog,
  };

  // Update state
  const updatedState: ArenaState = {
    ...arenaState,
    player: updatedPlayer,
    dailyBattles: arenaState.dailyBattles + 1,
    arenaCoins: arenaState.arenaCoins + rewardCoins,
    battleHistory: [battle, ...arenaState.battleHistory].slice(0, 50), // Keep last 50
  };

  return {
    success: true,
    updatedState,
    battle,
  };
}

/**
 * Set defense team
 */
export function setDefenseTeam(
  arenaState: ArenaState,
  heroIds: string[],
  heroes: Hero[],
  petId?: string
): { success: boolean; updatedState?: ArenaState; error?: string } {
  if (heroIds.length === 0) {
    return { success: false, error: 'Cần ít nhất 1 hero cho đội phòng thủ!' };
  }

  if (heroIds.length > 3) {
    return { success: false, error: 'Tối đa 3 heroes cho đội phòng thủ!' };
  }

  // Calculate team power
  const teamPower = heroes
    .filter(h => heroIds.includes(h.id))
    .reduce((sum, hero) => {
      const heroStats = hero.stats;
      return sum + (heroStats.attack + heroStats.defense + heroStats.hp) * hero.level;
    }, 0);

  const updatedPlayer: ArenaPlayer = {
    ...arenaState.player,
    defenseTeam: {
      heroIds,
      petId,
      teamPower,
    },
  };

  return {
    success: true,
    updatedState: {
      ...arenaState,
      player: updatedPlayer,
    },
  };
}

/**
 * Check and reset daily battles if needed
 */
export function checkDailyReset(arenaState: ArenaState): ArenaState {
  const now = Date.now();
  const lastReset = new Date(arenaState.lastResetTime);
  const currentDay = new Date(now);

  // Reset if it's a new day
  if (lastReset.getDate() !== currentDay.getDate()) {
    return {
      ...arenaState,
      dailyBattles: 0,
      lastResetTime: now,
    };
  }

  return arenaState;
}

// ============================================================================
// ARENA SHOP
// ============================================================================

/**
 * Initialize Arena Shop with 8 items
 */
export function initializeArenaShop(): ArenaShopItem[] {
  return [
    {
      id: 'hero-fragments-legendary',
      type: 'hero',
      itemId: 'random-legendary',
      displayName: 'Mảnh Hero Huyền Thoại',
      description: 'Nhận ngẫu nhiên 10 mảnh hero huyền thoại',
      cost: 500,
      stock: 3,
      refreshCooldown: 24 * 60 * 60 * 1000,
      rarity: 'legendary',
    },
    {
      id: 'hero-fragments-epic',
      type: 'hero',
      itemId: 'random-epic',
      displayName: 'Mảnh Hero Epic',
      description: 'Nhận ngẫu nhiên 15 mảnh hero epic',
      cost: 300,
      stock: 5,
      refreshCooldown: 24 * 60 * 60 * 1000,
      rarity: 'epic',
    },
    {
      id: 'pet-egg-legendary',
      type: 'pet',
      itemId: 'random-legendary-pet',
      displayName: 'Trứng Pet Huyền Thoại',
      description: 'Trứng pet huyền thoại ngẫu nhiên',
      cost: 600,
      stock: 2,
      refreshCooldown: 24 * 60 * 60 * 1000,
      rarity: 'legendary',
    },
    {
      id: 'gems-bundle',
      type: 'resource',
      itemId: 'gems',
      displayName: 'Túi Gems',
      description: 'Nhận 100 gems',
      cost: 200,
      stock: -1, // Unlimited
      refreshCooldown: 0,
      rarity: 'rare',
    },
    {
      id: 'gold-bundle',
      type: 'resource',
      itemId: 'gold',
      displayName: 'Túi Vàng Lớn',
      description: 'Nhận 50,000 gold',
      cost: 150,
      stock: -1,
      refreshCooldown: 0,
      rarity: 'common',
    },
    {
      id: 'arena-skin-warrior',
      type: 'skin',
      itemId: 'warrior-arena-skin',
      displayName: 'Skin Đấu Sĩ Arena',
      description: 'Skin độc quyền cho hero warrior',
      cost: 800,
      stock: 1,
      refreshCooldown: 7 * 24 * 60 * 60 * 1000, // Weekly
      rarity: 'legendary',
    },
    {
      id: 'culture-bundle',
      type: 'resource',
      itemId: 'culture',
      displayName: 'Túi Văn Hóa',
      description: 'Nhận 5,000 culture',
      cost: 100,
      stock: -1,
      refreshCooldown: 0,
      rarity: 'common',
    },
    {
      id: 'hero-exp-book',
      type: 'resource',
      itemId: 'hero-exp',
      displayName: 'Sách Kinh Nghiệm Hero',
      description: 'Tăng 10,000 EXP cho hero',
      cost: 250,
      stock: 10,
      refreshCooldown: 24 * 60 * 60 * 1000,
      rarity: 'rare',
    },
  ];
}

/**
 * Purchase item from arena shop
 */
export function purchaseArenaShopItem(
  arenaState: ArenaState,
  itemId: string
): {
  success: boolean;
  updatedState?: ArenaState;
  item?: ArenaShopItem;
  error?: string;
} {
  const item = arenaState.shopItems.find(i => i.id === itemId);
  
  if (!item) {
    return { success: false, error: 'Vật phẩm không tồn tại!' };
  }

  if (item.stock === 0) {
    return { success: false, error: 'Đã hết hàng!' };
  }

  if (arenaState.arenaCoins < item.cost) {
    return { success: false, error: `Không đủ Arena Coins! Cần ${item.cost} coins.` };
  }

  // Update item stock
  const updatedShopItems = arenaState.shopItems.map(shopItem => {
    if (shopItem.id === itemId && shopItem.stock !== -1) {
      return {
        ...shopItem,
        stock: shopItem.stock - 1,
        lastPurchase: Date.now(),
      };
    }
    return shopItem;
  });

  return {
    success: true,
    updatedState: {
      ...arenaState,
      arenaCoins: arenaState.arenaCoins - item.cost,
      shopItems: updatedShopItems,
    },
    item,
  };
}

/**
 * Check if shop needs refresh
 */
export function shouldRefreshShop(arenaState: ArenaState): boolean {
  const now = Date.now();
  const timeSinceRefresh = now - arenaState.lastShopRefresh;
  return timeSinceRefresh >= ARENA_CONSTANTS.SHOP_REFRESH_HOURS * 60 * 60 * 1000;
}

/**
 * Refresh arena shop (restock items)
 */
export function refreshArenaShop(arenaState: ArenaState): ArenaState {
  const refreshedItems = arenaState.shopItems.map(item => {
    // Only refresh items with cooldown expired
    if (item.stock !== -1 && item.lastPurchase) {
      const timeSincePurchase = Date.now() - item.lastPurchase;
      if (timeSincePurchase >= item.refreshCooldown) {
        return {
          ...item,
          stock: initializeArenaShop().find(i => i.id === item.id)?.stock || item.stock,
          lastPurchase: undefined,
        };
      }
    }
    return item;
  });

  return {
    ...arenaState,
    shopItems: refreshedItems,
    lastShopRefresh: Date.now(),
  };
}

// ============================================================================
// LEADERBOARD
// ============================================================================

/**
 * Generate mock leaderboard (top 100 players)
 * In production, this would fetch from server
 */
export function generateLeaderboard(playerRating: number): ArenaPlayer[] {
  const leaderboard: ArenaPlayer[] = [];
  
  // Add current player
  leaderboard.push({
    playerId: 'current-player',
    playerName: 'Bạn',
    playerLevel: 50,
    rating: playerRating,
    rank: getRankFromRating(playerRating),
    wins: 100,
    losses: 50,
    winStreak: 5,
    highestRating: playerRating + 100,
    defenseTeam: { heroIds: [], teamPower: 5000 },
    lastBattleTime: Date.now(),
  });

  // Generate 99 other players
  for (let i = 0; i < 99; i++) {
    const rating = 3500 - (i * 25); // Descending ratings
    leaderboard.push({
      playerId: `player-${i}`,
      playerName: generateOpponentName(),
      playerLevel: Math.floor(40 + Math.random() * 20),
      rating,
      rank: getRankFromRating(rating),
      wins: Math.floor(200 + Math.random() * 500),
      losses: Math.floor(50 + Math.random() * 200),
      winStreak: Math.floor(Math.random() * 20),
      highestRating: rating + Math.floor(Math.random() * 300),
      defenseTeam: { heroIds: [], teamPower: 4000 + Math.floor(Math.random() * 2000) },
      lastBattleTime: Date.now() - Math.floor(Math.random() * 86400000),
    });
  }

  // Sort by rating
  leaderboard.sort((a, b) => b.rating - a.rating);

  return leaderboard;
}

/**
 * Get player's rank position in leaderboard
 */
export function getPlayerRankPosition(leaderboard: ArenaPlayer[], playerId: string): number {
  return leaderboard.findIndex(p => p.playerId === playerId) + 1;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format rating with color based on rank
 */
export function formatRating(rating: number): { rating: number; rank: ArenaRank; color: string } {
  const rank = getRankFromRating(rating);
  const color = RANK_THRESHOLDS[rank].color;
  return { rating, rank, color };
}

/**
 * Calculate win rate percentage
 */
export function calculateWinRate(wins: number, losses: number): number {
  const total = wins + losses;
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
}

/**
 * Get battles remaining today
 */
export function getBattlesRemaining(arenaState: ArenaState): number {
  return Math.max(0, arenaState.dailyBattlesMax - arenaState.dailyBattles);
}

/**
 * Format time until next reset
 */
export function getTimeUntilReset(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
}
