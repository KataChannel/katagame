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
  nameEnglish?: string;
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
  title?: string;
  titleVietnamese: string;
  titleEnglish?: string;
  content: string;
  category: string;
  era?: string;
  dynasty?: string;
  historicalFigure?: string;
  provinceId?: number;
  heroId?: string;
  baseGoldReward?: number;
  baseRiceReward?: number;
  baseWoodReward?: number;
  culturePoints?: number;
  experienceReward?: number;
  iconUrl?: string;
  read?: boolean;
  quiz?: Quiz;
  createdAt?: Date;
  updatedAt?: Date;
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

// ==================== MVP2: SPRINT 1 TYPES ====================

/**
 * Story with daily unlock status
 */
export interface StoryWithUnlockStatus extends Story {
  isUnlocked: boolean;
  daysUntilUnlock: number;
  isCompleted: boolean;
  daysSinceRegistration: number;
}

/**
 * Enhanced quiz submission with x5 multiplier
 */
export interface QuizSubmissionResult {
  id: string;
  playerId: string;
  storyId: string;
  score: number;
  maxScore: number;
  answers: any;
  timeTaken?: number;
  rewards: {
    gold: number;
    rice: number;
    wood?: number;
    lumber?: number;
  };
  submittedAt: Date;
  // MVP2 Fields
  multiplier?: number;
  isPerfect?: boolean;
  correctCount?: number;
  totalQuestions?: number;
  perfectStreak?: number;
}

/**
 * Quiz stats with perfect streak tracking
 */
export interface QuizStats {
  totalQuizzes: number;
  perfectQuizzes: number;
  currentPerfectStreak: number;
  bestPerfectStreak: number;
  averageScore: number;
}

// ========================================
// MVP2 SPRINT 2: PROVINCE SKILLS TYPES
// ========================================

/**
 * Passive buff granted by province levels
 * Unlocks at levels 5, 10, 15
 */
export interface PassiveBuff {
  type: string; // e.g., 'GOLD_PRODUCTION', 'RICE_PRODUCTION'
  value: number; // Percentage bonus
  description: string; // Vietnamese description
  source: string; // e.g., 'FARMER_LEVEL_5'
  icon: string; // Emoji icon
}

/**
 * Active skill for province
 * Unlocks at development level 10
 * Has 24-hour cooldown
 */
export interface ActiveSkill {
  id: string; // e.g., 'RESOURCE_BOOST_1'
  name: string; // Vietnamese name
  description: string; // Vietnamese description
  multiplier: number; // Resource production multiplier (2x, 3x, 5x)
  duration_hours: number; // Effect duration in hours
  cooldown_hours: number; // Cooldown duration (24h)
  icon: string; // Emoji icon
}

/**
 * Cooldown status for active skill
 */
export interface SkillCooldownStatus {
  isOnCooldown: boolean;
  remainingSeconds: number;
  remainingHours?: number;
  canUse: boolean;
}

/**
 * Province with skills information
 * Extends Province with passive buffs and active skill
 */
export interface ProvinceWithSkills extends Province {
  provinceId: number;
  province?: Province;
  passiveBuffs: PassiveBuff[];
  activeSkill?: ActiveSkill;
  skillCooldown?: SkillCooldownStatus;
}

/**
 * Result of using active skill
 */
export interface UseActiveSkillResult {
  playerProvince: Province;
  skill: ActiveSkill;
}

// ==================== MVP2 SPRINT 3: HERO LEVELS & PET SYSTEM ====================

/**
 * Hero stats based on level (1-5)
 * Each level increases stats by 20%
 */
export interface HeroStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  level: number;
  baseHP?: number;
  baseAttack?: number;
  baseDefense?: number;
  baseSpeed?: number;
}

/**
 * Player hero with calculated stats
 */
export interface PlayerHeroWithStats extends Hero {
  stats: HeroStats;
  expForNextLevel: number;
  expProgress: number; // Current exp towards next level
}

/**
 * Result of granting experience to hero
 */
export interface GrantExpResult {
  playerHero: Hero;
  leveledUp: boolean;
  levelsGained: number;
}

/**
 * Pet bonuses based on pet type
 * 6 types: combat, resource, experience, luck, speed, generic
 */
export interface PetBonuses {
  // Combat bonuses
  attack?: number;
  defense?: number;
  hp?: number;
  
  // Resource bonuses
  goldBonus?: number;
  riceBonus?: number;
  woodBonus?: number;
  stoneBonus?: number;
  
  // Special bonuses
  expBonus?: number;
  learningSpeed?: number;
  luckBonus?: number;
  criticalChance?: number;
  
  // Speed bonuses
  speed?: number;
  buildingSpeed?: number;
  harvestSpeed?: number;
  
  // Generic bonuses
  allStats?: number;
  
  // Display
  icon: string;
  description: string;
}

/**
 * Pet with calculated bonuses
 */
export interface PetWithBonuses extends Pet {
  bonuses: PetBonuses;
}

/**
 * Result of assigning pet to hero
 */
export interface AssignPetResult {
  playerHero: Hero;
  pet: Pet;
  bonuses: PetBonuses;
  cooldownEnds: Date;
  effectEnds: Date;
}

// ==================== MVP2 SPRINT 4: RESOURCE SYNERGY & ERA PROGRESSION ====================

/**
 * Wu Xing (Five Elements) synergy information
 */
export interface ResourceSynergy {
  sourceResource: string;
  targetResource: string;
  sourceElement: string;
  targetElement: string;
  bonusPercentage: number;
  affectedProvinces: number;
  description: string;
  icon: string;
}

/**
 * Player's synergy status
 */
export interface PlayerSynergies {
  playerId: string;
  totalProvinces: number;
  activeSynergies: ResourceSynergy[];
  totalBonusPercentage: number;
  cycleCompletion: number;
}

/**
 * Wu Xing cycle node
 */
export interface WuXingNode {
  element: string;
  elementName: string;
  emoji: string;
  resource: string;
  resourceNameVN: string;
  nextElement: string;
  nextResource: string;
  isActive: boolean;
  bonusPercentage: number;
}

/**
 * Wu Xing cycle data
 */
export interface WuXingCycleData {
  playerId: string;
  cycleNodes: WuXingNode[];
  activeSynergies: ResourceSynergy[];
  cycleCompletion: number;
  totalBonus: number;
  description: string;
}

/**
 * Era benefits
 */
export interface EraBenefits {
  goldBonus: number;
  riceBonus: number;
  woodBonus: number;
  stoneBonus: number;
  expBonus: number;
  unlockHeroes: string[];
}

/**
 * Era information
 */
export interface EraInfo {
  id: string;
  name: string;
  nameEnglish: string;
  description: string;
  emoji: string;
  color: string;
  minStories: number;
  maxStories: number;
  benefits: EraBenefits;
  landmarks: string[];
  isUnlocked: boolean;
  isCurrent: boolean;
  progressPercentage: number;
  requiredStories: number;
  remainingStories: number;
}

/**
 * Player's current era
 */
export interface PlayerCurrentEra {
  playerId: string;
  currentEra: string;
  eraName: string;
  eraEmoji: string;
  completedStories: number;
  benefits: EraBenefits;
  isMaxEra: boolean;
}

/**
 * Era timeline
 */
export interface EraTimeline {
  playerId: string;
  completedStories: number;
  timeline: EraInfo[];
  currentEraIndex: number;
}

// ==================== PROVINCE DATA (Sprint 5) ====================

export interface ProvinceData {
  id: number;
  name: string;
  nameEnglish?: string;
  region: string; // 'Miền Bắc' | 'Miền Trung' | 'Miền Nam'
  description?: string;
  isCapital?: boolean;
  baseGoldRate?: number;
  baseRiceRate?: number;
  baseWoodRate?: number;
  baseStoneRate?: number;
  baseBazanRate?: number;
  historicalEras?: string[];
  unlockOrder?: number;
  unlockStoryDay?: number;
  isOwned: boolean;
  ownershipStatus: 'owned' | 'available' | 'locked';
}

export interface ProvincePlayerData {
  farmerLevel: number;
  resourceLevel: number;
  developmentLevel: number;
  buildingsCount: number;
  passiveBuffs: string[];
  activeSkillLevel: number;
  deployedHero?: Hero;
}

export interface ProvinceProductionRates {
  gold: number;
  rice: number;
  wood: number;
  stone: number;
  bazan: number;
}

export interface StoryInfo {
  id: string;
  titleVietnamese: string;
  day: number;
  isAvailable: boolean;
}

export interface ProvinceDetails {
  id: number;
  name: string;
  nameEnglish?: string;
  region: string;
  description?: string;
  isCapital?: boolean;
  baseGoldRate?: number;
  baseRiceRate?: number;
  baseWoodRate?: number;
  baseStoneRate?: number;
  baseBazanRate?: number;
  historicalEras?: string[];
  unlockOrder?: number;
  unlockStoryDay?: number;
  isOwned: boolean;
  ownershipStatus: 'owned' | 'available' | 'locked';
  playerData?: ProvincePlayerData;
  productionRates: ProvinceProductionRates;
  stories: StoryInfo[];
}

export interface RegionStatistic {
  total: number;
  owned: number;
  available: number;
  locked: number;
}

export interface RegionStatistics {
  north: RegionStatistic;
  central: RegionStatistic;
  south: RegionStatistic;
  overall: RegionStatistic;
}

export interface ProvinceUnlockInfo {
  provinceId: number;
  provinceName: string;
  unlockOrder?: number;
  unlockStoryDay?: number;
  requiredStory?: StoryInfo;
  isStartingProvince: boolean;
  requirementsDescription: string;
}
