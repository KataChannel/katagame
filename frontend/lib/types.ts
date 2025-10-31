// Game Types cho MVP 1 - Updated for 0-GAME_MECHANICS_ROADMAP_COMPLETE.md
export interface Resource {
  gold: number;      // 🏅 Vàng (Kim - Metal)
  rice: number;      // 🌾 Lúa (Thủy - Water) 
  lumber: number;    // 🪵 Gỗ (Mộc - Wood)
  stone: number;     // 🪨 Đá (Thổ - Earth)
  bazan: number;     // 🌋 Đất đỏ Bazan (Hỏa - Fire)
  culture: number;   // 📜 Văn hóa (Hero recruitment)
  gems?: number;     // 💎 Ngọc (Premium currency)
}

// MVP 2: Element System (Ngũ Hành)
export type ElementType = 'fire' | 'water' | 'wood' | 'metal' | 'earth';

export interface Element {
  type: ElementType;
  name: string;
  displayName: string;
  icon: string;
  color: string;
  counters: ElementType; // What this element is strong against
  weakTo: ElementType; // What this element is weak to
  bonuses: {
    production?: number; // % bonus
    combat?: number; // % bonus
    defense?: number; // % bonus
  };
}

export interface Province {
  id: string;
  name: string;
  displayName: string;
  description: string;
  unlocked: boolean;
  level: number;
  maxLevel: number;
  resources: Resource;
  resourcesPerSecond: Resource;
  specialties: string[];
  culturalBonus: string;
  farmers: Farmer[];
  buildings: Building[];
  // MVP 2 additions
  element?: ElementType;
  region?: 'north' | 'central' | 'south';
  unlockRequirement?: {
    level?: number;
    gold?: number;
    provinces?: string[];
  };
}

export interface Farmer {
  id: string;
  name: string;
  type: 'manual' | 'auto';
  level: number;
  efficiency: number;
  cost: Resource;
  assignedResource: keyof Resource | null;
  isWorking: boolean;
}

export interface Building {
  id: string;
  name: string;
  type: string;
  level: number;
  maxLevel: number;
  cost: Resource;
  production: Resource;
  unlocked: boolean;
}

export interface Player {
  id: string;
  name: string;
  level: number;
  experience: number;
  totalResources: Resource;
  resources?: Resource; // MVP1 GraphQL - JSON field from backend
  unlockedProvinces: string[];
  premiumPass: PremiumPass | null;
  achievements: Achievement[];
}

export interface PremiumPass {
  id: string;
  type: 'basic' | 'premium' | 'royal';
  name: string;
  price: number;
  benefits: string[];
  duration: number; // days
  purchaseDate: Date;
  active: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rewards: Resource;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export interface GameState {
  player: Player;
  provinces: Province[];
  gameSpeed: number;
  lastUpdateTime: number;
  tutorial: {
    completed: boolean;
    currentStep: number;
  };
  // MVP 2 additions
  heroes?: Hero[];
  pets?: Pet[];
  battlePass?: BattlePassProgress;
  combatHistory?: CombatResult[];
  gacha?: import('./gachaSystem').GachaState;
}

// MVP 2: Hero System
export interface Hero {
  id: string;
  name: string;
  displayName: string;
  title: string;
  element: ElementType;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  level: number;
  experience: number;
  stats: {
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    speed: number;
    critRate: number;
    critDamage: number;
  };
  skills: HeroSkill[];
  owned: boolean;
  unlockMethod: 'default' | 'quest' | 'gacha' | 'battlepass';
  lore: string;
  icon: string;
}

export interface HeroSkill {
  id: string;
  name: string;
  description: string;
  damage: number;
  cooldown: number;
  currentCooldown: number;
  element: ElementType;
  targetType: 'single' | 'all' | 'self';
  effects?: {
    type: 'buff' | 'debuff' | 'heal' | 'damage';
    value: number;
    duration: number;
  }[];
}

// MVP 2: Pet System
export interface Pet {
  id: string;
  name: string;
  displayName: string;
  element: ElementType;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  level: number;
  experience: number;
  owned: boolean;
  passiveBonus: {
    type: 'production' | 'combat' | 'collection';
    value: number;
    resource?: keyof Resource;
  };
  activeSkill?: {
    name: string;
    description: string;
    cooldown: number;
    effect: string;
  };
  lore: string;
  icon: string;
}

// MVP 2: Combat System
export interface CombatResult {
  id: string;
  timestamp: Date;
  enemyType: string;
  victory: boolean;
  rewards: Resource;
  heroesUsed: string[];
  duration: number;
}

export interface Enemy {
  id: string;
  name: string;
  displayName: string;
  element: ElementType;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  loot: Resource;
  skills: string[];
}

// MVP 2: Battle Pass System
export interface BattlePassProgress {
  currentLevel: number;
  totalXP: number;
  isPremium: boolean;
  claimedRewards: {
    free: number[];
    premium: number[];
  };
  seasonNumber: number;
  seasonStartDate: number;
  seasonEndDate: number;
}

export interface BattlePassReward {
  level: number;
  freeReward: {
    type: 'resource' | 'hero' | 'pet' | 'cosmetic';
    value: any;
  };
  premiumReward?: {
    type: 'resource' | 'hero' | 'pet' | 'cosmetic';
    value: any;
  };
}

// MVP 2: Gacha System
export interface GachaPool {
  id: string;
  name: string;
  type: 'hero' | 'pet' | 'cosmetic';
  cost: number;
  items: GachaItem[];
  pityCounter: number;
  pityThreshold: number;
}

export interface GachaItem {
  id: string;
  type: 'hero' | 'pet' | 'skin';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  dropRate: number;
  item: string;
}

export interface GachaPull {
  id: string;
  timestamp: Date;
  poolId: string;
  result: GachaItem;
  isPity: boolean;
}