/**
 * MVP1 Game Types - Real API Data Structures
 * These types match the backend database schema and API responses
 */

// ==================== CORE TYPES ====================

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type ElementType = 'fire' | 'water' | 'wood' | 'metal' | 'earth';
export type BattleType = 'pvp' | 'pve' | 'guild_war' | 'arena';
export type BattleResult = 'attacker_win' | 'defender_win' | 'draw';
export type GuildRank = 'leader' | 'officer' | 'member';

// ==================== PET ====================

export interface Pet {
  id: string;
  playerId: string;
  name: string;
  petType: string;
  rarity: Rarity;
  level: number;
  experience: number;
  element?: ElementType;
  bonusAttack?: number;
  bonusDefense?: number;
  bonusHP?: number;
  bonusSpeed?: number;
  owned?: boolean;
  equipped?: boolean;
  provinceId?: string;
  acquiredAt: Date;
}

// ==================== ACHIEVEMENT ====================

export interface Achievement {
  id: string;
  name: string;
  nameVietnamese?: string;
  description: string;
  category: string;
  rarity: Rarity;
  points: number;
  iconUrl?: string;
  progress?: number;
  maxProgress?: number;
  unlocked: boolean;
  unlockedAt?: Date;
  reward?: {
    gold?: number;
    gems?: number;
    experience?: number;
  };
}

// ==================== BATTLE ====================

export interface Battle {
  id: string;
  attackerId: string;
  defenderId: string;
  attackerName?: string;
  defenderName?: string;
  battleType: BattleType;
  result: BattleResult;
  durationSeconds?: number;
  battleLog?: {
    turns: BattleTurn[];
    summary: string;
  };
  attackerReward?: Reward;
  defenderReward?: Reward;
  createdAt: Date;
}

export interface BattleTurn {
  turn: number;
  attacker: string;
  defender: string;
  damage: number;
  attackerHP: number;
  defenderHP: number;
  action: string;
}

export interface Reward {
  gold?: number;
  gems?: number;
  experience?: number;
  items?: string[];
}

// ==================== GUILD ====================

export interface Guild {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  leaderId: string;
  leaderName?: string;
  level: number;
  totalPower: number;
  membersCount: number;
  maxMembers?: number;
  treasury: {
    gold: number;
    gems: number;
    guildCoins: number;
  };
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GuildMember {
  id: string;
  guildId: string;
  playerId: string;
  playerName: string;
  rank: GuildRank;
  contributionPoints: number;
  joinedAt: Date;
}

export interface GuildWar {
  id: string;
  attackerGuildId: string;
  defenderGuildId: string;
  provinceId: number;
  status: 'active' | 'completed';
  result?: 'attacker_win' | 'defender_win';
  startedAt: Date;
  endedAt?: Date;
}

// ==================== HERO ====================

export interface Hero {
  id: string;
  playerId?: string;
  name: string;
  nameVietnamese?: string;
  nameEnglish?: string;
  rarity: Rarity;
  element?: ElementType;
  era?: string;
  level: number;
  experience: number;
  hp: number;
  baseHP?: number;
  attack: number;
  baseAttack?: number;
  defense: number;
  baseDefense?: number;
  speed: number;
  baseSpeed?: number;
  skills?: string[];
  owned?: boolean;
  provinceId?: string | number;
  acquiredAt?: Date;
}

// ==================== PROVINCE ====================

export interface Province {
  id: number;
  name: string;
  nameVietnamese?: string;
  region?: string;
  level?: number;
  maxLevel?: number;
  farmerLevel?: number;
  resourceLevel?: number;
  developmentLevel?: number;
  baseGoldRate?: number;
  baseCultureRate?: number;
  baseRiceRate?: number;
  controlledByGuildId?: string;
  controlSince?: Date;
  isCapital?: boolean;
  powerBonus?: number;
  ownedByPlayer?: boolean;
  heroId?: string;
  resources?: {
    farmers?: number;
    buildings?: any[];
  };
  discoveredAt?: Date;
}

// ==================== RESOURCE ====================

export interface Resource {
  type: string;
  name: string;
  nameVietnamese?: string;
  amount: number;
  icon?: string;
  description?: string;
  baseHarvest?: number;
  harvestCooldown?: number;
  nextHarvestAt?: Date;
}

export interface PlayerResources {
  playerId: string;
  gold: number;
  rice: number;
  lumber: number;
  stone: number;
  culture: number;
  gems: number;
  [key: string]: string | number;
}

// ==================== STORY & QUIZ ====================

export interface Story {
  id: string;
  day: number;
  title: string;
  titleVietnamese?: string;
  content: string;
  category: string;
  dynasty?: string;
  historicalFigure?: string;
  culturePoints: number;
  experienceReward: number;
  iconUrl?: string;
  read?: boolean;
  quiz?: Quiz;
}

export interface Quiz {
  id: string;
  storyId: string;
  questions: QuizQuestion[];
  difficulty: 'easy' | 'normal' | 'hard';
  timeLimit?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface QuizStats {
  playerId: string;
  totalQuizzes: number;
  completedQuizzes: number;
  correctAnswers: number;
  totalAnswers: number;
  accuracy: number;
  totalPoints: number;
  rank?: number;
}

// ==================== PLAYER ====================

export interface Player {
  id: string;
  username: string;
  email: string;
  level: number;
  experience: number;
  totalPower: number;
  resources: PlayerResources;
  status: string;
  region: string;
  premiumPassActive: boolean;
  premiumExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
}

// ==================== NAVIGATION ====================

export interface NavigationItem {
  key: string;
  label: string;
  labelVietnamese: string;
  icon: string;
  color: string;
  unlockLevel: number;
  unlockRequirement?: string;
  isUnlocked: boolean;
  order: number;
  category: 'core' | 'combat' | 'social' | 'premium' | 'settings';
}

// ==================== API RESPONSES ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  score: number;
  change?: number;
}

// ==================== GAME CONFIG ====================

export interface GameConfig {
  version: string;
  resources: Record<string, any>;
  buildings: Record<string, any>;
  heroes: Hero[];
  achievements: Achievement[];
  battlePass: any;
  quiz: any;
  dailyActivities: any;
}

// ==================== AGGREGATED DATA ====================

export interface MVP1GameData {
  // Public data
  stories: Story[];
  resources: Resource[];
  heroes: Hero[];
  provinces: Province[];
  gameConfig: GameConfig;
  
  // Player-specific data
  playerResources?: PlayerResources;
  playerHeroes?: Hero[];
  playerProvinces?: Province[];
  playerPets?: Pet[];
  playerAchievements?: Achievement[];
  playerBattles?: Battle[];
  playerGuild?: Guild;
  quizStats?: QuizStats;
  
  // Meta
  isLoading: boolean;
  error: string | null;
}
