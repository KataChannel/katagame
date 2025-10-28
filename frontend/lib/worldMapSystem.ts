// World Map & Expeditions System
// Vietnam map with provinces, boss raids, dungeons, stamina, and loot

import { Hero, Pet } from './types';

// ============= TYPE DEFINITIONS =============

export type ProvinceStatus = 'locked' | 'unlocked' | 'completed';
export type BossDifficulty = 'easy' | 'normal' | 'hard' | 'nightmare';
export type LootRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type RewardType = 'hero_fragment' | 'pet_egg' | 'gold' | 'gems' | 'exp_book' | 'culture' | 'skin' | 'equipment';

export interface WorldProvince {
  id: string;
  name: string;
  element: string;
  status: ProvinceStatus;
  level: number;
  boss?: ProvinceBoss;
  requiredProvinces?: string[]; // IDs of provinces that must be completed first
  rewards: ProvinceReward[];
  coordinates: { x: number; y: number }; // For map positioning
}

export interface ProvinceBoss {
  id: string;
  name: string;
  level: number;
  element: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  difficulty: BossDifficulty;
  staminaCost: number;
  firstClearRewards: LootDrop[];
  regularRewards: LootDrop[];
  defeatedCount: number;
}

export interface LootDrop {
  type: RewardType;
  itemId?: string; // For specific items (hero fragments, skins)
  itemName?: string;
  quantity: number;
  rarity: LootRarity;
  dropRate: number; // 0-100 percentage
}

export interface ProvinceReward {
  type: RewardType;
  itemId?: string;
  itemName?: string;
  quantity: number;
  rarity: LootRarity;
}

export interface Expedition {
  id: string;
  floor: number;
  name: string;
  difficulty: number; // 1-10 scale
  recommendedPower: number;
  staminaCost: number;
  enemyLevel: number;
  rewards: LootDrop[];
  completed: boolean;
  bestTime?: number; // Seconds
}

export interface ExpeditionRun {
  expeditionId: string;
  floor: number;
  startTime: number;
  endTime?: number;
  heroes: string[]; // Hero IDs
  autoMode: boolean;
  result?: 'victory' | 'defeat' | 'in_progress';
  loots: LootDrop[];
  experience: number;
  gold: number;
}

export interface StaminaState {
  current: number;
  max: number;
  lastUpdate: number; // Timestamp
  regenRate: number; // Minutes per stamina
}

export interface WorldMapState {
  provinces: WorldProvince[];
  currentProvince: string | null;
  unlockedProvinces: string[];
  completedProvinces: string[];
  expeditions: Expedition[];
  currentExpedition?: ExpeditionRun;
  expeditionHistory: ExpeditionRun[];
  stamina: StaminaState;
  totalLoot: Record<string, number>; // itemId -> quantity
  bossVictories: Record<string, number>; // bossId -> count
}

// ============= CONSTANTS =============

export const STAMINA_CONFIG = {
  MAX_STAMINA: 100,
  REGEN_RATE: 5, // Minutes per 1 stamina
  EXPEDITION_COST: 10,
  BOSS_COST_EASY: 15,
  BOSS_COST_NORMAL: 20,
  BOSS_COST_HARD: 30,
  BOSS_COST_NIGHTMARE: 50,
};

export const EXPEDITION_CONFIG = {
  TOTAL_FLOORS: 50,
  BASE_DIFFICULTY: 1,
  DIFFICULTY_SCALING: 0.15, // Per floor
  BASE_STAMINA_COST: 10,
  AUTO_BATTLE_SPEED: 2000, // ms per battle
};

export const LOOT_DROP_RATES = {
  common: { min: 50, max: 100 },
  rare: { min: 20, max: 50 },
  epic: { min: 5, max: 20 },
  legendary: { min: 1, max: 5 },
};

// Vietnam provinces data (63 provinces)
export const VIETNAM_PROVINCES_DATA = [
  // North Vietnam (Bắc Bộ) - 25 provinces
  { id: 'hanoi', name: 'Hà Nội', element: 'fire', level: 1, region: 'north', x: 50, y: 20 },
  { id: 'haiphong', name: 'Hải Phòng', element: 'water', level: 2, region: 'north', x: 60, y: 22 },
  { id: 'quangninh', name: 'Quảng Ninh', element: 'earth', level: 3, region: 'north', x: 65, y: 18 },
  { id: 'bacninh', name: 'Bắc Ninh', element: 'metal', level: 2, region: 'north', x: 52, y: 22 },
  { id: 'bacgiang', name: 'Bắc Giang', element: 'wood', level: 3, region: 'north', x: 55, y: 18 },
  { id: 'laocai', name: 'Lào Cai', element: 'metal', level: 10, region: 'north', x: 30, y: 10 },
  { id: 'hagiang', name: 'Hà Giang', element: 'earth', level: 12, region: 'north', x: 38, y: 8 },
  { id: 'caobang', name: 'Cao Bằng', element: 'wood', level: 11, region: 'north', x: 48, y: 10 },
  { id: 'langson', name: 'Lạng Sơn', element: 'metal', level: 8, region: 'north', x: 58, y: 14 },
  { id: 'thaibinh', name: 'Thái Bình', element: 'water', level: 4, region: 'north', x: 56, y: 26 },
  { id: 'namdinh', name: 'Nam Định', element: 'earth', level: 4, region: 'north', x: 54, y: 28 },
  { id: 'ninhbinh', name: 'Ninh Bình', element: 'fire', level: 5, region: 'north', x: 52, y: 30 },
  { id: 'thanhhoa', name: 'Thanh Hóa', element: 'wood', level: 6, region: 'north', x: 48, y: 35 },
  { id: 'nghean', name: 'Nghệ An', element: 'fire', level: 8, region: 'north', x: 46, y: 40 },
  { id: 'hatinh', name: 'Hà Tĩnh', element: 'earth', level: 7, region: 'north', x: 48, y: 42 },
  { id: 'sonla', name: 'Sơn La', element: 'metal', level: 9, region: 'north', x: 35, y: 22 },
  { id: 'dienbien', name: 'Điện Biên', element: 'fire', level: 11, region: 'north', x: 28, y: 20 },
  { id: 'laichau', name: 'Lai Châu', element: 'wood', level: 10, region: 'north', x: 32, y: 15 },
  { id: 'yenbai', name: 'Yên Bái', element: 'earth', level: 7, region: 'north', x: 38, y: 20 },
  { id: 'phuyen', name: 'Phú Yên', element: 'water', level: 14, region: 'north', x: 42, y: 18 },
  { id: 'tuyenquang', name: 'Tuyên Quang', element: 'wood', level: 6, region: 'north', x: 45, y: 15 },
  { id: 'backan', name: 'Bắc Kạn', element: 'metal', level: 9, region: 'north', x: 50, y: 12 },
  { id: 'thainguyen', name: 'Thái Nguyên', element: 'fire', level: 5, region: 'north', x: 52, y: 16 },
  { id: 'hoabinh', name: 'Hòa Bình', element: 'earth', level: 6, region: 'north', x: 42, y: 25 },
  { id: 'hungyen', name: 'Hưng Yên', element: 'water', level: 3, region: 'north', x: 54, y: 24 },

  // Central Vietnam (Trung Bộ) - 19 provinces
  { id: 'quangbinh', name: 'Quảng Bình', element: 'water', level: 9, region: 'central', x: 50, y: 46 },
  { id: 'quangtri', name: 'Quảng Trị', element: 'metal', level: 10, region: 'central', x: 50, y: 50 },
  { id: 'hue', name: 'Thừa Thiên Huế', element: 'fire', level: 12, region: 'central', x: 50, y: 52 },
  { id: 'danang', name: 'Đà Nẵng', element: 'water', level: 15, region: 'central', x: 50, y: 56 },
  { id: 'quangnam', name: 'Quảng Nam', element: 'earth', level: 13, region: 'central', x: 48, y: 58 },
  { id: 'quangngai', name: 'Quảng Ngãi', element: 'wood', level: 14, region: 'central', x: 50, y: 60 },
  { id: 'binhdinh', name: 'Bình Định', element: 'metal', level: 15, region: 'central', x: 52, y: 64 },
  { id: 'phuyen_central', name: 'Phú Yên', element: 'water', level: 16, region: 'central', x: 52, y: 67 },
  { id: 'khanhhoa', name: 'Khánh Hòa', element: 'fire', level: 18, region: 'central', x: 52, y: 70 },
  { id: 'ninhthuan', name: 'Ninh Thuận', element: 'earth', level: 19, region: 'central', x: 50, y: 73 },
  { id: 'binhthuan', name: 'Bình Thuận', element: 'wood', level: 20, region: 'central', x: 52, y: 75 },
  { id: 'kontum', name: 'Kon Tum', element: 'metal', level: 17, region: 'central', x: 45, y: 60 },
  { id: 'gialai', name: 'Gia Lai', element: 'fire', level: 18, region: 'central', x: 45, y: 64 },
  { id: 'daklak', name: 'Đắk Lắk', element: 'earth', level: 19, region: 'central', x: 46, y: 68 },
  { id: 'daknong', name: 'Đắk Nông', element: 'wood', level: 20, region: 'central', x: 47, y: 71 },
  { id: 'lamdong', name: 'Lâm Đồng', element: 'water', level: 21, region: 'central', x: 48, y: 74 },
  { id: 'binhphuoc', name: 'Bình Phước', element: 'metal', level: 22, region: 'central', x: 42, y: 77 },
  { id: 'tayninh', name: 'Tây Ninh', element: 'fire', level: 23, region: 'central', x: 38, y: 80 },
  { id: 'binhduong', name: 'Bình Dương', element: 'earth', level: 24, region: 'central', x: 42, y: 82 },

  // South Vietnam (Nam Bộ) - 19 provinces
  { id: 'hochiminh', name: 'TP Hồ Chí Minh', element: 'fire', level: 25, region: 'south', x: 44, y: 85 },
  { id: 'baria', name: 'Bà Rịa - Vũng Tàu', element: 'water', level: 24, region: 'south', x: 48, y: 86 },
  { id: 'dongnai', name: 'Đồng Nai', element: 'wood', level: 23, region: 'south', x: 46, y: 84 },
  { id: 'longan', name: 'Long An', element: 'earth', level: 22, region: 'south', x: 40, y: 86 },
  { id: 'tiengiang', name: 'Tiền Giang', element: 'water', level: 21, region: 'south', x: 38, y: 88 },
  { id: 'bentre', name: 'Bến Tre', element: 'metal', level: 20, region: 'south', x: 40, y: 90 },
  { id: 'travinh', name: 'Trà Vinh', element: 'wood', level: 19, region: 'south', x: 42, y: 91 },
  { id: 'vinhlong', name: 'Vĩnh Long', element: 'fire', level: 20, region: 'south', x: 38, y: 90 },
  { id: 'dongthap', name: 'Đồng Tháp', element: 'earth', level: 21, region: 'south', x: 36, y: 88 },
  { id: 'angiang', name: 'An Giang', element: 'water', level: 22, region: 'south', x: 32, y: 87 },
  { id: 'kiengiang', name: 'Kiên Giang', element: 'metal', level: 24, region: 'south', x: 28, y: 90 },
  { id: 'cantho', name: 'Cần Thơ', element: 'wood', level: 23, region: 'south', x: 36, y: 91 },
  { id: 'haugiang', name: 'Hậu Giang', element: 'fire', level: 22, region: 'south', x: 34, y: 92 },
  { id: 'soctrang', name: 'Sóc Trăng', element: 'earth', level: 21, region: 'south', x: 38, y: 93 },
  { id: 'baclieu', name: 'Bạc Liêu', element: 'water', level: 20, region: 'south', x: 36, y: 94 },
  { id: 'camau', name: 'Cà Mau', element: 'metal', level: 25, region: 'south', x: 34, y: 96 },
  { id: 'phutho', name: 'Phú Thọ', element: 'wood', level: 5, region: 'north', x: 45, y: 22 },
  { id: 'vinhphuc', name: 'Vĩnh Phúc', element: 'fire', level: 4, region: 'north', x: 48, y: 23 },
  { id: 'haiduong', name: 'Hải Dương', element: 'water', level: 3, region: 'north', x: 56, y: 23 },
];

// ============= INITIALIZATION FUNCTIONS =============

export function initializeWorldMapState(playerLevel: number): WorldMapState {
  const provinces = initializeProvinces(playerLevel);
  const expeditions = initializeExpeditions();

  return {
    provinces,
    currentProvince: 'hanoi', // Start at Hanoi
    unlockedProvinces: ['hanoi'], // Start with Hanoi unlocked
    completedProvinces: [],
    expeditions,
    expeditionHistory: [],
    stamina: {
      current: STAMINA_CONFIG.MAX_STAMINA,
      max: STAMINA_CONFIG.MAX_STAMINA,
      lastUpdate: Date.now(),
      regenRate: STAMINA_CONFIG.REGEN_RATE,
    },
    totalLoot: {},
    bossVictories: {},
  };
}

function initializeProvinces(playerLevel: number): WorldProvince[] {
  return VIETNAM_PROVINCES_DATA.map((data) => {
    const isUnlocked = data.id === 'hanoi'; // Only Hanoi starts unlocked
    const boss = generateProvinceBoss(data);

    return {
      id: data.id,
      name: data.name,
      element: data.element,
      status: isUnlocked ? 'unlocked' : 'locked',
      level: data.level,
      boss,
      requiredProvinces: getRequiredProvinces(data.id),
      rewards: generateProvinceRewards(data.level, data.element),
      coordinates: { x: data.x, y: data.y },
    };
  });
}

function getRequiredProvinces(provinceId: string): string[] | undefined {
  // Define unlock requirements for provinces
  const requirements: Record<string, string[]> = {
    haiphong: ['hanoi'],
    quangninh: ['haiphong'],
    bacninh: ['hanoi'],
    bacgiang: ['bacninh'],
    thaibinh: ['hanoi', 'bacninh'],
    namdinh: ['thaibinh'],
    ninhbinh: ['namdinh'],
    thanhhoa: ['ninhbinh'],
    nghean: ['thanhhoa'],
    hatinh: ['nghean'],
    quangbinh: ['hatinh'],
    quangtri: ['quangbinh'],
    hue: ['quangtri'],
    danang: ['hue'],
    quangnam: ['danang'],
    quangngai: ['quangnam'],
    binhdinh: ['quangngai'],
    phuyen_central: ['binhdinh'],
    khanhhoa: ['phuyen_central'],
    ninhthuan: ['khanhhoa'],
    binhthuan: ['ninhthuan'],
    // Add more as needed - this creates a progression path
  };

  return requirements[provinceId];
}

function generateProvinceBoss(data: any): ProvinceBoss {
  const difficulty = getBossDifficulty(data.level);
  const staminaCost = getBossStaminaCost(difficulty);

  // Boss names based on Vietnamese mythology
  const bossNames = [
    'Rồng Thần', 'Hổ Bạch', 'Phượng Hoàng', 'Quy Thần',
    'Long Vương', 'Sơn Tinh', 'Thủy Tinh', 'Thánh Gióng',
    'Chử Đồng Tử', 'Tiên Dung', 'Âu Cơ', 'Lạc Long Quân',
  ];

  const bossName = `${bossNames[Math.floor(Math.random() * bossNames.length)]} ${data.name}`;
  const baseHp = 1000 + data.level * 500;
  const baseAttack = 50 + data.level * 20;
  const baseDefense = 30 + data.level * 15;

  return {
    id: `boss_${data.id}`,
    name: bossName,
    level: data.level,
    element: data.element,
    hp: baseHp,
    maxHp: baseHp,
    attack: baseAttack,
    defense: baseDefense,
    difficulty,
    staminaCost,
    firstClearRewards: generateBossRewards(data.level, data.element, true),
    regularRewards: generateBossRewards(data.level, data.element, false),
    defeatedCount: 0,
  };
}

function getBossDifficulty(level: number): BossDifficulty {
  if (level <= 5) return 'easy';
  if (level <= 12) return 'normal';
  if (level <= 20) return 'hard';
  return 'nightmare';
}

function getBossStaminaCost(difficulty: BossDifficulty): number {
  switch (difficulty) {
    case 'easy': return STAMINA_CONFIG.BOSS_COST_EASY;
    case 'normal': return STAMINA_CONFIG.BOSS_COST_NORMAL;
    case 'hard': return STAMINA_CONFIG.BOSS_COST_HARD;
    case 'nightmare': return STAMINA_CONFIG.BOSS_COST_NIGHTMARE;
  }
}

function generateBossRewards(level: number, element: string, isFirstClear: boolean): LootDrop[] {
  const rewards: LootDrop[] = [];

  if (isFirstClear) {
    // First clear gives guaranteed epic/legendary rewards
    rewards.push({
      type: 'hero_fragment',
      itemId: `${element}_hero_fragment`,
      itemName: `Mảnh Tướng ${element.toUpperCase()}`,
      quantity: 10 + level * 2,
      rarity: level > 15 ? 'legendary' : 'epic',
      dropRate: 100,
    });
    rewards.push({
      type: 'gems',
      quantity: 50 + level * 5,
      rarity: 'rare',
      dropRate: 100,
    });
    rewards.push({
      type: 'gold',
      quantity: 10000 + level * 1000,
      rarity: 'common',
      dropRate: 100,
    });
  }

  // Regular rewards
  rewards.push({
    type: 'hero_fragment',
    itemId: `${element}_hero_fragment`,
    itemName: `Mảnh Tướng ${element.toUpperCase()}`,
    quantity: 3 + Math.floor(level / 3),
    rarity: level > 20 ? 'legendary' : level > 10 ? 'epic' : 'rare',
    dropRate: level > 15 ? 30 : 50,
  });

  rewards.push({
    type: 'pet_egg',
    itemId: `${element}_pet_egg`,
    itemName: `Trứng Pet ${element.toUpperCase()}`,
    quantity: 1,
    rarity: level > 20 ? 'legendary' : level > 10 ? 'epic' : 'rare',
    dropRate: level > 15 ? 15 : 25,
  });

  rewards.push({
    type: 'gold',
    quantity: 5000 + level * 500,
    rarity: 'common',
    dropRate: 100,
  });

  rewards.push({
    type: 'exp_book',
    itemName: 'Sách Kinh Nghiệm',
    quantity: Math.floor(level / 2) + 1,
    rarity: 'rare',
    dropRate: 60,
  });

  if (level > 10) {
    rewards.push({
      type: 'culture',
      quantity: level * 10,
      rarity: 'rare',
      dropRate: 40,
    });
  }

  if (level > 20) {
    rewards.push({
      type: 'skin',
      itemId: `${element}_boss_skin`,
      itemName: `Skin Boss ${element.toUpperCase()}`,
      quantity: 1,
      rarity: 'legendary',
      dropRate: 5,
    });
  }

  return rewards;
}

function generateProvinceRewards(level: number, element: string): ProvinceReward[] {
  return [
    {
      type: 'gold',
      quantity: 2000 + level * 200,
      rarity: 'common',
    },
    {
      type: 'culture',
      quantity: level * 5,
      rarity: 'rare',
    },
    {
      type: 'gems',
      quantity: 10 + level,
      rarity: 'rare',
    },
  ];
}

function initializeExpeditions(): Expedition[] {
  const expeditions: Expedition[] = [];

  for (let floor = 1; floor <= EXPEDITION_CONFIG.TOTAL_FLOORS; floor++) {
    const difficulty = EXPEDITION_CONFIG.BASE_DIFFICULTY + (floor - 1) * EXPEDITION_CONFIG.DIFFICULTY_SCALING;
    const recommendedPower = Math.floor(100 + floor * 50 + difficulty * 100);
    const enemyLevel = floor;

    expeditions.push({
      id: `expedition_floor_${floor}`,
      floor,
      name: `Tầng ${floor}${floor % 10 === 0 ? ' - Boss' : ''}`,
      difficulty,
      recommendedPower,
      staminaCost: EXPEDITION_CONFIG.BASE_STAMINA_COST,
      enemyLevel,
      rewards: generateExpeditionRewards(floor),
      completed: false,
    });
  }

  return expeditions;
}

function generateExpeditionRewards(floor: number): LootDrop[] {
  const rewards: LootDrop[] = [];
  const isBossFloor = floor % 10 === 0;

  // Gold (always drops)
  rewards.push({
    type: 'gold',
    quantity: 1000 + floor * 200,
    rarity: 'common',
    dropRate: 100,
  });

  // Experience books
  rewards.push({
    type: 'exp_book',
    itemName: 'Sách Kinh Nghiệm',
    quantity: 1 + Math.floor(floor / 10),
    rarity: floor > 30 ? 'epic' : 'rare',
    dropRate: 70,
  });

  // Hero fragments (better drop on boss floors)
  const elements = ['fire', 'water', 'earth', 'metal', 'wood'];
  const randomElement = elements[Math.floor(Math.random() * elements.length)];
  
  rewards.push({
    type: 'hero_fragment',
    itemId: `${randomElement}_hero_fragment`,
    itemName: `Mảnh Tướng ${randomElement.toUpperCase()}`,
    quantity: isBossFloor ? 5 + Math.floor(floor / 10) : 2,
    rarity: floor > 40 ? 'legendary' : floor > 25 ? 'epic' : 'rare',
    dropRate: isBossFloor ? 60 : 30,
  });

  // Pet eggs (rare, better on boss floors)
  if (floor > 10) {
    rewards.push({
      type: 'pet_egg',
      itemId: `${randomElement}_pet_egg`,
      itemName: `Trứng Pet ${randomElement.toUpperCase()}`,
      quantity: 1,
      rarity: floor > 40 ? 'legendary' : floor > 25 ? 'epic' : 'rare',
      dropRate: isBossFloor ? 25 : 10,
    });
  }

  // Gems (better on boss floors)
  if (isBossFloor) {
    rewards.push({
      type: 'gems',
      quantity: 20 + floor,
      rarity: 'epic',
      dropRate: 80,
    });
  }

  // Culture (for higher floors)
  if (floor > 20) {
    rewards.push({
      type: 'culture',
      quantity: floor * 5,
      rarity: 'rare',
      dropRate: 50,
    });
  }

  // Legendary rewards for high floors
  if (floor > 40 && isBossFloor) {
    rewards.push({
      type: 'skin',
      itemId: `expedition_floor_${floor}_skin`,
      itemName: `Skin Tầng ${floor}`,
      quantity: 1,
      rarity: 'legendary',
      dropRate: 10,
    });
  }

  return rewards;
}

// ============= STAMINA FUNCTIONS =============

export function updateStamina(stamina: StaminaState): StaminaState {
  const now = Date.now();
  const timePassed = now - stamina.lastUpdate; // milliseconds
  const minutesPassed = timePassed / 1000 / 60;
  const staminaGained = Math.floor(minutesPassed / stamina.regenRate);

  if (staminaGained > 0 && stamina.current < stamina.max) {
    const newCurrent = Math.min(stamina.current + staminaGained, stamina.max);
    return {
      ...stamina,
      current: newCurrent,
      lastUpdate: now,
    };
  }

  return stamina;
}

export function consumeStamina(stamina: StaminaState, amount: number): { success: boolean; stamina?: StaminaState; error?: string } {
  if (stamina.current < amount) {
    return {
      success: false,
      error: `Không đủ Stamina! Cần ${amount}, hiện có ${stamina.current}`,
    };
  }

  return {
    success: true,
    stamina: {
      ...stamina,
      current: stamina.current - amount,
      lastUpdate: Date.now(),
    },
  };
}

export function refillStamina(stamina: StaminaState, amount: number): StaminaState {
  return {
    ...stamina,
    current: Math.min(stamina.current + amount, stamina.max),
    lastUpdate: Date.now(),
  };
}

export function getTimeUntilFullStamina(stamina: StaminaState): number {
  const staminaNeeded = stamina.max - stamina.current;
  return staminaNeeded * stamina.regenRate * 60 * 1000; // milliseconds
}

export function formatStaminaTime(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// ============= PROVINCE FUNCTIONS =============

export function unlockProvince(
  state: WorldMapState,
  provinceId: string
): { success: boolean; state?: WorldMapState; error?: string } {
  const province = state.provinces.find((p) => p.id === provinceId);
  
  if (!province) {
    return { success: false, error: 'Tỉnh không tồn tại!' };
  }

  if (province.status !== 'locked') {
    return { success: false, error: 'Tỉnh đã mở khóa!' };
  }

  // Check requirements
  if (province.requiredProvinces && province.requiredProvinces.length > 0) {
    const missingProvinces = province.requiredProvinces.filter(
      (reqId) => !state.completedProvinces.includes(reqId)
    );
    
    if (missingProvinces.length > 0) {
      const missingNames = missingProvinces
        .map((id) => state.provinces.find((p) => p.id === id)?.name)
        .join(', ');
      return {
        success: false,
        error: `Cần hoàn thành: ${missingNames}`,
      };
    }
  }

  // Unlock province
  const updatedProvinces = state.provinces.map((p) =>
    p.id === provinceId ? { ...p, status: 'unlocked' as ProvinceStatus } : p
  );

  return {
    success: true,
    state: {
      ...state,
      provinces: updatedProvinces,
      unlockedProvinces: [...state.unlockedProvinces, provinceId],
    },
  };
}

export function completeProvince(
  state: WorldMapState,
  provinceId: string
): { success: boolean; state?: WorldMapState; rewards?: ProvinceReward[]; error?: string } {
  const province = state.provinces.find((p) => p.id === provinceId);
  
  if (!province) {
    return { success: false, error: 'Tỉnh không tồn tại!' };
  }

  if (province.status !== 'unlocked') {
    return { success: false, error: 'Tỉnh chưa mở khóa!' };
  }

  // Mark as completed
  const updatedProvinces = state.provinces.map((p) =>
    p.id === provinceId ? { ...p, status: 'completed' as ProvinceStatus } : p
  );

  return {
    success: true,
    state: {
      ...state,
      provinces: updatedProvinces,
      completedProvinces: [...state.completedProvinces, provinceId],
    },
    rewards: province.rewards,
  };
}

export function travelToProvince(
  state: WorldMapState,
  provinceId: string
): { success: boolean; state?: WorldMapState; error?: string } {
  const province = state.provinces.find((p) => p.id === provinceId);
  
  if (!province) {
    return { success: false, error: 'Tỉnh không tồn tại!' };
  }

  if (province.status === 'locked') {
    return { success: false, error: 'Tỉnh chưa mở khóa!' };
  }

  return {
    success: true,
    state: {
      ...state,
      currentProvince: provinceId,
    },
  };
}

// ============= BOSS BATTLE FUNCTIONS =============

export function challengeBoss(
  state: WorldMapState,
  provinceId: string,
  heroes: Hero[]
): { success: boolean; state?: WorldMapState; result?: 'victory' | 'defeat'; rewards?: LootDrop[]; error?: string } {
  const province = state.provinces.find((p) => p.id === provinceId);
  
  if (!province || !province.boss) {
    return { success: false, error: 'Boss không tồn tại!' };
  }

  if (province.status === 'locked') {
    return { success: false, error: 'Tỉnh chưa mở khóa!' };
  }

  // Check stamina
  const staminaResult = consumeStamina(state.stamina, province.boss.staminaCost);
  if (!staminaResult.success) {
    return { success: false, error: staminaResult.error };
  }

  // Calculate hero power
  const heroPower = heroes.reduce((total, hero) => {
    return total + (hero.stats.attack + hero.stats.defense + hero.stats.hp) * hero.level;
  }, 0);

  // Calculate boss power
  const boss = province.boss;
  const bossPower = (boss.attack + boss.defense + boss.hp) * boss.level;

  // Battle simulation with RNG (±20%)
  const heroFinalPower = heroPower * (0.8 + Math.random() * 0.4);
  const bossFinalPower = bossPower * (0.8 + Math.random() * 0.4);

  const victory = heroFinalPower > bossFinalPower;
  
  // Determine rewards
  const isFirstClear = boss.defeatedCount === 0;
  const rewardPool = isFirstClear ? boss.firstClearRewards : boss.regularRewards;
  const droppedRewards = rollForLoot(rewardPool);

  // Update state
  const updatedBossVictories = {
    ...state.bossVictories,
    [boss.id]: (state.bossVictories[boss.id] || 0) + (victory ? 1 : 0),
  };

  const updatedTotalLoot = { ...state.totalLoot };
  droppedRewards.forEach((loot) => {
    const key = loot.itemId || loot.type;
    updatedTotalLoot[key] = (updatedTotalLoot[key] || 0) + loot.quantity;
  });

  // Update boss defeated count
  const updatedProvinces = state.provinces.map((p) => {
    if (p.id === provinceId && p.boss) {
      return {
        ...p,
        boss: {
          ...p.boss,
          defeatedCount: p.boss.defeatedCount + 1,
        },
      };
    }
    return p;
  });

  return {
    success: true,
    result: victory ? 'victory' : 'defeat',
    rewards: victory ? droppedRewards : [],
    state: {
      ...state,
      provinces: updatedProvinces,
      stamina: staminaResult.stamina!,
      bossVictories: updatedBossVictories,
      totalLoot: updatedTotalLoot,
    },
  };
}

// ============= EXPEDITION FUNCTIONS =============

export function startExpedition(
  state: WorldMapState,
  floor: number,
  heroes: Hero[],
  autoMode: boolean = false
): { success: boolean; state?: WorldMapState; expedition?: ExpeditionRun; error?: string } {
  const expedition = state.expeditions.find((e) => e.floor === floor);
  
  if (!expedition) {
    return { success: false, error: 'Tầng không tồn tại!' };
  }

  // Check stamina
  const staminaResult = consumeStamina(state.stamina, expedition.staminaCost);
  if (!staminaResult.success) {
    return { success: false, error: staminaResult.error };
  }

  if (heroes.length === 0) {
    return { success: false, error: 'Cần chọn ít nhất 1 tướng!' };
  }

  // Create expedition run
  const expeditionRun: ExpeditionRun = {
    expeditionId: expedition.id,
    floor,
    startTime: Date.now(),
    heroes: heroes.map((h) => h.id),
    autoMode,
    result: 'in_progress',
    loots: [],
    experience: 0,
    gold: 0,
  };

  return {
    success: true,
    state: {
      ...state,
      stamina: staminaResult.stamina!,
      currentExpedition: expeditionRun,
    },
    expedition: expeditionRun,
  };
}

export function completeExpedition(
  state: WorldMapState,
  heroes: Hero[]
): { success: boolean; state?: WorldMapState; result?: 'victory' | 'defeat'; rewards?: LootDrop[]; error?: string } {
  const currentExpedition = state.currentExpedition;
  
  if (!currentExpedition) {
    return { success: false, error: 'Không có thám hiểm đang chạy!' };
  }

  const expedition = state.expeditions.find((e) => e.id === currentExpedition.expeditionId);
  if (!expedition) {
    return { success: false, error: 'Thám hiểm không tồn tại!' };
  }

  // Calculate hero power
  const heroPower = heroes.reduce((total, hero) => {
    return total + (hero.stats.attack + hero.stats.defense + hero.stats.hp) * hero.level;
  }, 0);

  // Check if power is sufficient
  const victory = heroPower >= expedition.recommendedPower * 0.7; // 70% of recommended power needed

  // Roll for loot
  const droppedRewards = victory ? rollForLoot(expedition.rewards) : [];

  // Calculate gold and experience
  const baseGold = 1000 + expedition.floor * 200;
  const baseExp = 500 + expedition.floor * 100;

  const finalGold = victory ? baseGold : Math.floor(baseGold * 0.3);
  const finalExp = victory ? baseExp : Math.floor(baseExp * 0.3);

  // Update total loot
  const updatedTotalLoot = { ...state.totalLoot };
  droppedRewards.forEach((loot) => {
    const key = loot.itemId || loot.type;
    updatedTotalLoot[key] = (updatedTotalLoot[key] || 0) + loot.quantity;
  });
  updatedTotalLoot['gold'] = (updatedTotalLoot['gold'] || 0) + finalGold;

  // Complete expedition run
  const completedRun: ExpeditionRun = {
    ...currentExpedition,
    endTime: Date.now(),
    result: victory ? 'victory' : 'defeat',
    loots: droppedRewards,
    experience: finalExp,
    gold: finalGold,
  };

  // Update expedition completed status
  const updatedExpeditions = state.expeditions.map((e) =>
    e.id === expedition.id && victory ? { ...e, completed: true } : e
  );

  return {
    success: true,
    result: victory ? 'victory' : 'defeat',
    rewards: droppedRewards,
    state: {
      ...state,
      expeditions: updatedExpeditions,
      currentExpedition: undefined,
      expeditionHistory: [completedRun, ...state.expeditionHistory.slice(0, 49)], // Keep last 50
      totalLoot: updatedTotalLoot,
    },
  };
}

// ============= LOOT FUNCTIONS =============

export function rollForLoot(rewardPool: LootDrop[]): LootDrop[] {
  const dropped: LootDrop[] = [];

  rewardPool.forEach((loot) => {
    const roll = Math.random() * 100;
    if (roll <= loot.dropRate) {
      dropped.push({ ...loot });
    }
  });

  return dropped;
}

export function calculateLootValue(loot: LootDrop): number {
  // Base values for different item types
  const baseValues: Record<RewardType, number> = {
    hero_fragment: 100,
    pet_egg: 200,
    gold: 1,
    gems: 50,
    exp_book: 50,
    culture: 10,
    skin: 500,
    equipment: 150,
  };

  const rarityMultipliers: Record<LootRarity, number> = {
    common: 1,
    rare: 2,
    epic: 5,
    legendary: 10,
  };

  const baseValue = baseValues[loot.type] || 10;
  const rarityMult = rarityMultipliers[loot.rarity] || 1;

  return baseValue * rarityMult * loot.quantity;
}

export function getRarityColor(rarity: LootRarity): string {
  switch (rarity) {
    case 'legendary': return '#fbbf24'; // yellow-400
    case 'epic': return '#a855f7'; // purple-500
    case 'rare': return '#3b82f6'; // blue-500
    case 'common': return '#9ca3af'; // gray-400
  }
}

export function getRarityGradient(rarity: LootRarity): string {
  switch (rarity) {
    case 'legendary': return 'from-yellow-400 to-orange-500';
    case 'epic': return 'from-purple-400 to-pink-500';
    case 'rare': return 'from-blue-400 to-cyan-500';
    case 'common': return 'from-gray-300 to-gray-400';
  }
}

// ============= UTILITY FUNCTIONS =============

export function getProvincesByRegion(provinces: WorldProvince[], region: string): WorldProvince[] {
  // This would need region data from VIETNAM_PROVINCES_DATA
  return provinces; // Simplified - in real implementation, filter by region
}

export function calculateTotalStaminaUsed(state: WorldMapState): number {
  return state.expeditionHistory.reduce((total, run) => {
    const expedition = state.expeditions.find((e) => e.id === run.expeditionId);
    return total + (expedition?.staminaCost || 0);
  }, 0);
}

export function getExpeditionProgress(state: WorldMapState): number {
  const completed = state.expeditions.filter((e) => e.completed).length;
  return Math.floor((completed / EXPEDITION_CONFIG.TOTAL_FLOORS) * 100);
}

export function getBossVictoryRate(state: WorldMapState, bossId: string): number {
  const victories = state.bossVictories[bossId] || 0;
  // In real implementation, would track total attempts
  return victories;
}
