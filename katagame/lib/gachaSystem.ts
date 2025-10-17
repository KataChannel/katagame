/**
 * Gacha System for Kata Game
 * 
 * Features:
 * - Single pull (100 gems) and 10-pull (900 gems + 1 guaranteed rare+)
 * - Pity system: Guaranteed legendary after 50 pulls without one
 * - Rarity distribution: Common 50%, Rare 30%, Epic 15%, Legendary 5%
 * - Daily free pull (resets at midnight)
 * - Pull history tracking
 * - Hero skins and pet variants
 */

import { Hero, Pet } from './types';

// Gacha Constants
export const SINGLE_PULL_COST = 100; // gems
export const TEN_PULL_COST = 900; // gems (10% discount)
export const PITY_COUNTER_MAX = 50; // guaranteed legendary after 50 pulls
export const DAILY_FREE_PULL_RESET_HOUR = 0; // midnight

// Rarity percentages
export const RARITY_RATES = {
  common: 0.50,    // 50%
  rare: 0.30,      // 30%
  epic: 0.15,      // 15%
  legendary: 0.05, // 5%
};

// Rarity type
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

// Gacha item types
export type GachaItemType = 'hero' | 'pet' | 'hero-skin' | 'pet-variant' | 'resource';

// Gacha item interface
export interface GachaItem {
  id: string;
  type: GachaItemType;
  rarity: Rarity;
  name: string;
  displayName: string;
  description: string;
  imageUrl?: string;
  // For heroes and pets
  baseId?: string; // The base hero/pet this is a variant of
  // For resources
  resourceType?: string;
  resourceAmount?: number;
}

// Pull result interface
export interface PullResult {
  item: GachaItem;
  isNew: boolean; // First time getting this item
  isPity: boolean; // Was this a pity legendary?
}

// Pull history entry
export interface PullHistoryEntry {
  timestamp: number;
  items: PullResult[];
  pullType: 'single' | 'ten' | 'free';
  gemsCost: number;
}

// Gacha state interface
export interface GachaState {
  pullHistory: PullHistoryEntry[];
  pityCounter: number; // Pulls since last legendary
  lastFreePullDate: number; // Unix timestamp
  ownedItems: string[]; // IDs of items already owned
}

// ============================================================================
// GACHA POOL DEFINITIONS
// ============================================================================

// Hero Gacha Pool
export const HERO_GACHA_POOL: GachaItem[] = [
  // Legendary Heroes (5%)
  {
    id: 'hero-lac-long-quan',
    type: 'hero',
    rarity: 'legendary',
    name: 'lac-long-quan',
    displayName: 'Lạc Long Quân',
    description: 'Thủy tổ Việt Nam, con Kinh Dương Vương, cha Hùng Vương',
  },
  {
    id: 'hero-au-co',
    type: 'hero',
    rarity: 'legendary',
    name: 'au-co',
    displayName: 'Âu Cơ',
    description: 'Tiên nữ núi cao, mẹ 100 người con',
  },
  {
    id: 'hero-thanh-giong',
    type: 'hero',
    rarity: 'legendary',
    name: 'thanh-giong',
    displayName: 'Thánh Gióng',
    description: 'Anh hùng diệt giặc Ân, một trong Tứ Bất Tử',
  },
  {
    id: 'hero-ly-thuong-kiet',
    type: 'hero',
    rarity: 'legendary',
    name: 'ly-thuong-kiet',
    displayName: 'Lý Thường Kiệt',
    description: 'Danh tướng triều Lý, tác giả bài thơ "Nam quốc sơn hà"',
  },
  {
    id: 'hero-tran-hung-dao',
    type: 'hero',
    rarity: 'legendary',
    name: 'tran-hung-dao',
    displayName: 'Trần Hưng Đạo',
    description: 'Đại thắng quân Nguyên Mông 3 lần, danh tướng vĩ đại',
  },

  // Epic Heroes (15%)
  {
    id: 'hero-hai-ba-trung',
    type: 'hero',
    rarity: 'epic',
    name: 'hai-ba-trung',
    displayName: 'Hai Bà Trưng',
    description: 'Trưng Trắc, Trưng Nhị - khởi nghĩa chống Đông Hán',
  },
  {
    id: 'hero-ba-trieu',
    type: 'hero',
    rarity: 'epic',
    name: 'ba-trieu',
    displayName: 'Bà Triệu',
    description: 'Nữ tướng Triệu Ẩu, khởi nghĩa chống Đông Ngô',
  },
  {
    id: 'hero-ngo-quyen',
    type: 'hero',
    rarity: 'epic',
    name: 'ngo-quyen',
    displayName: 'Ngô Quyền',
    description: 'Đại thắng quân Nam Hán tại Bạch Đằng, lập nên độc lập',
  },
  {
    id: 'hero-le-loi',
    type: 'hero',
    rarity: 'epic',
    name: 'le-loi',
    displayName: 'Lê Lợi',
    description: 'Lãnh đạo Lam Sơn khởi nghĩa, đuổi quân Minh',
  },
  {
    id: 'hero-quang-trung',
    type: 'hero',
    rarity: 'epic',
    name: 'quang-trung',
    displayName: 'Quang Trung',
    description: 'Nguyễn Huệ, đại phá quân Thanh tại Ngọc Hồi - Đống Đa',
  },

  // Rare Heroes (30%)
  {
    id: 'hero-tran-quoc-tuan',
    type: 'hero',
    rarity: 'rare',
    name: 'tran-quoc-tuan',
    displayName: 'Trần Quốc Tuấn',
    description: 'Danh tướng triều Trần',
  },
  {
    id: 'hero-le-hoan',
    type: 'hero',
    rarity: 'rare',
    name: 'le-hoan',
    displayName: 'Lê Hoàn',
    description: 'Vua Đại Hành, đánh bại quân Tống',
  },
  {
    id: 'hero-ly-cong-uan',
    type: 'hero',
    rarity: 'rare',
    name: 'ly-cong-uan',
    displayName: 'Lý Công Uẩn',
    description: 'Lý Thái Tổ, dời đô về Thăng Long',
  },
  {
    id: 'hero-tran-binh-trong',
    type: 'hero',
    rarity: 'rare',
    name: 'tran-binh-trong',
    displayName: 'Trần Bình Trọng',
    description: 'Thiếu niên anh hùng triều Trần',
  },
  {
    id: 'hero-le-thanh-tong',
    type: 'hero',
    rarity: 'rare',
    name: 'le-thanh-tong',
    displayName: 'Lê Thánh Tông',
    description: 'Vua hiền triều Lê, vua thơ',
  },

  // Common Heroes (50%)
  {
    id: 'hero-tran-khanh-du',
    type: 'hero',
    rarity: 'common',
    name: 'tran-khanh-du',
    displayName: 'Trần Khánh Dư',
    description: 'Tướng triều Trần',
  },
  {
    id: 'hero-pham-ngu-lao',
    type: 'hero',
    rarity: 'common',
    name: 'pham-ngu-lao',
    displayName: 'Phạm Ngũ Lão',
    description: 'Danh tướng triều Trần',
  },
  {
    id: 'hero-nguyen-trai',
    type: 'hero',
    rarity: 'common',
    name: 'nguyen-trai',
    displayName: 'Nguyễn Trãi',
    description: 'Đại thi hào, quân sư Lam Sơn',
  },
  {
    id: 'hero-son-tinh',
    type: 'hero',
    rarity: 'common',
    name: 'son-tinh',
    displayName: 'Sơn Tinh',
    description: 'Thần núi, chồng công chúa Mỵ Nương',
  },
  {
    id: 'hero-thuy-tinh',
    type: 'hero',
    rarity: 'common',
    name: 'thuy-tinh',
    displayName: 'Thủy Tinh',
    description: 'Thần nước, tranh công chúa với Sơn Tinh',
  },
];

// Pet Gacha Pool
export const PET_GACHA_POOL: GachaItem[] = [
  // Legendary Pets (5%)
  {
    id: 'pet-dragon-gold',
    type: 'pet',
    rarity: 'legendary',
    name: 'dragon',
    displayName: 'Rồng Vàng',
    description: 'Biểu tượng thiêng liêng của dân tộc Việt',
  },
  {
    id: 'pet-phoenix-fire',
    type: 'pet',
    rarity: 'legendary',
    name: 'phoenix',
    displayName: 'Phượng Hoàng Lửa',
    description: 'Linh điểu bất tử, mang lại may mắn',
  },
  {
    id: 'pet-qilin-divine',
    type: 'pet',
    rarity: 'legendary',
    name: 'qilin',
    displayName: 'Kỳ Lân Thần',
    description: 'Thần thú cát tường, đem lại hòa bình',
  },

  // Epic Pets (15%)
  {
    id: 'pet-turtle-golden',
    type: 'pet',
    rarity: 'epic',
    name: 'turtle',
    displayName: 'Rùa Vàng Hồ Gươm',
    description: 'Thần rùa thu Thuận Thiên kiếm của vua Lê',
  },
  {
    id: 'pet-tiger-white',
    type: 'pet',
    rarity: 'epic',
    name: 'tiger',
    displayName: 'Bạch Hổ',
    description: 'Hổ trắng linh thiêng, thủ hộ phương Tây',
  },
  {
    id: 'pet-elephant-war',
    type: 'pet',
    rarity: 'epic',
    name: 'elephant',
    displayName: 'Voi Chiến',
    description: 'Voi chiến dũng mãnh của quân Đại Việt',
  },
  {
    id: 'pet-horse-red',
    type: 'pet',
    rarity: 'epic',
    name: 'horse',
    displayName: 'Xích Thố',
    description: 'Tuấn mã đỏ, ngựa chiến của danh tướng',
  },

  // Rare Pets (30%)
  {
    id: 'pet-crane-silver',
    type: 'pet',
    rarity: 'rare',
    name: 'crane',
    displayName: 'Hạc Bạc',
    description: 'Hạc trắng, biểu tượng của sự trường thọ',
  },
  {
    id: 'pet-buffalo-water',
    type: 'pet',
    rarity: 'rare',
    name: 'buffalo',
    displayName: 'Trâu Nước',
    description: 'Người bạn thân thiết của nông dân Việt',
  },
  {
    id: 'pet-fish-carp',
    type: 'pet',
    rarity: 'rare',
    name: 'fish',
    displayName: 'Cá Chép Vàng',
    description: 'Cá chép hóa rồng, biểu tượng của thành công',
  },
  {
    id: 'pet-monkey-stone',
    type: 'pet',
    rarity: 'rare',
    name: 'monkey',
    displayName: 'Khỉ Đá',
    description: 'Khỉ thông minh, linh hoạt',
  },

  // Common Pets (50%)
  {
    id: 'pet-dog-village',
    type: 'pet',
    rarity: 'common',
    name: 'dog',
    displayName: 'Chó Làng',
    description: 'Người bạn trung thành canh giữ nhà cửa',
  },
  {
    id: 'pet-cat-lucky',
    type: 'pet',
    rarity: 'common',
    name: 'cat',
    displayName: 'Mèo May Mắn',
    description: 'Mèo đen, xua đuổi chuột và tà khí',
  },
  {
    id: 'pet-chicken-golden',
    type: 'pet',
    rarity: 'common',
    name: 'chicken',
    displayName: 'Gà Đồng',
    description: 'Gà trống báo hiệu bình minh',
  },
  {
    id: 'pet-pig-prosperity',
    type: 'pet',
    rarity: 'common',
    name: 'pig',
    displayName: 'Lợn Phú Quý',
    description: 'Biểu tượng của sự sung túc',
  },
  {
    id: 'pet-duck-mandarin',
    type: 'pet',
    rarity: 'common',
    name: 'duck',
    displayName: 'Vịt Trời',
    description: 'Vịt trời bay về từ phương Bắc',
  },
];

// Resource Gacha Pool (for when you don't get a hero/pet)
export const RESOURCE_GACHA_POOL: GachaItem[] = [
  // Legendary Resources (5%)
  {
    id: 'resource-legendary-bundle',
    type: 'resource',
    rarity: 'legendary',
    name: 'legendary-bundle',
    displayName: 'Kho Báu Huyền Thoại',
    description: 'Nguồn tài nguyên khổng lồ',
    resourceType: 'bundle',
    resourceAmount: 10000,
  },

  // Epic Resources (15%)
  {
    id: 'resource-epic-bundle',
    type: 'resource',
    rarity: 'epic',
    name: 'epic-bundle',
    displayName: 'Kho Báu Quý Hiếm',
    description: 'Nguồn tài nguyên lớn',
    resourceType: 'bundle',
    resourceAmount: 5000,
  },

  // Rare Resources (30%)
  {
    id: 'resource-rare-bundle',
    type: 'resource',
    rarity: 'rare',
    name: 'rare-bundle',
    displayName: 'Kho Báu Hiếm',
    description: 'Nguồn tài nguyên trung bình',
    resourceType: 'bundle',
    resourceAmount: 2000,
  },

  // Common Resources (50%)
  {
    id: 'resource-common-bundle',
    type: 'resource',
    rarity: 'common',
    name: 'common-bundle',
    displayName: 'Kho Báu Nhỏ',
    description: 'Nguồn tài nguyên cơ bản',
    resourceType: 'bundle',
    resourceAmount: 500,
  },
];

// Combined gacha pool (70% hero, 20% pet, 10% resource)
export const FULL_GACHA_POOL: GachaItem[] = [
  ...HERO_GACHA_POOL,
  ...PET_GACHA_POOL,
  ...RESOURCE_GACHA_POOL,
];

// ============================================================================
// GACHA LOGIC FUNCTIONS
// ============================================================================

/**
 * Initialize gacha state
 */
export function initializeGachaState(): GachaState {
  return {
    pullHistory: [],
    pityCounter: 0,
    lastFreePullDate: 0,
    ownedItems: [],
  };
}

/**
 * Check if daily free pull is available
 */
export function isDailyFreePullAvailable(gachaState: GachaState): boolean {
  const now = Date.now();
  const lastPull = new Date(gachaState.lastFreePullDate);
  const today = new Date(now);

  // Check if it's a different day
  return (
    lastPull.getDate() !== today.getDate() ||
    lastPull.getMonth() !== today.getMonth() ||
    lastPull.getFullYear() !== today.getFullYear()
  );
}

/**
 * Get next free pull reset time
 */
export function getNextFreePullResetTime(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(DAILY_FREE_PULL_RESET_HOUR, 0, 0, 0);
  return tomorrow.getTime();
}

/**
 * Get time remaining until next free pull (in milliseconds)
 */
export function getTimeUntilNextFreePull(gachaState: GachaState): number {
  if (isDailyFreePullAvailable(gachaState)) {
    return 0;
  }
  return getNextFreePullResetTime() - Date.now();
}

/**
 * Format time remaining for display
 */
export function formatTimeRemaining(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

/**
 * Determine rarity based on rates and pity counter
 */
function determineRarity(pityCounter: number, guaranteedRare: boolean = false): Rarity {
  // Pity system: guaranteed legendary at 50 pulls
  if (pityCounter >= PITY_COUNTER_MAX) {
    return 'legendary';
  }

  // 10-pull guaranteed rare or higher
  if (guaranteedRare) {
    const roll = Math.random();
    const legendaryChance = RARITY_RATES.legendary / (1 - RARITY_RATES.common);
    const epicChance = RARITY_RATES.epic / (1 - RARITY_RATES.common);
    const rareChance = RARITY_RATES.rare / (1 - RARITY_RATES.common);

    if (roll < legendaryChance) return 'legendary';
    if (roll < legendaryChance + epicChance) return 'epic';
    return 'rare';
  }

  // Normal rarity roll
  const roll = Math.random();
  if (roll < RARITY_RATES.legendary) return 'legendary';
  if (roll < RARITY_RATES.legendary + RARITY_RATES.epic) return 'epic';
  if (roll < RARITY_RATES.legendary + RARITY_RATES.epic + RARITY_RATES.rare) return 'rare';
  return 'common';
}

/**
 * Get random item from pool by rarity
 */
function getRandomItemByRarity(rarity: Rarity): GachaItem {
  const pool = FULL_GACHA_POOL.filter((item) => item.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Perform a single pull
 */
export function performSinglePull(
  gachaState: GachaState,
  guaranteedRare: boolean = false
): PullResult {
  const rarity = determineRarity(gachaState.pityCounter, guaranteedRare);
  const item = getRandomItemByRarity(rarity);
  const isNew = !gachaState.ownedItems.includes(item.id);
  const isPity = gachaState.pityCounter >= PITY_COUNTER_MAX && rarity === 'legendary';

  return {
    item,
    isNew,
    isPity,
  };
}

/**
 * Perform a 10-pull (guaranteed at least 1 rare or higher)
 */
export function performTenPull(gachaState: GachaState): PullResult[] {
  const results: PullResult[] = [];
  let hasRareOrHigher = false;

  // Pull 9 times normally
  for (let i = 0; i < 9; i++) {
    const result = performSinglePull(gachaState);
    results.push(result);
    if (result.item.rarity !== 'common') {
      hasRareOrHigher = true;
    }
  }

  // Last pull: guaranteed rare or higher if none yet
  const lastPull = performSinglePull(gachaState, !hasRareOrHigher);
  results.push(lastPull);

  return results;
}

/**
 * Update gacha state after pull
 */
export function updateGachaStateAfterPull(
  gachaState: GachaState,
  results: PullResult[],
  pullType: 'single' | 'ten' | 'free',
  gemsCost: number
): GachaState {
  // Check if any legendary was pulled
  const gotLegendary = results.some((r) => r.item.rarity === 'legendary');

  // Update pity counter
  let newPityCounter = gachaState.pityCounter + results.length;
  if (gotLegendary) {
    newPityCounter = 0; // Reset pity counter
  }

  // Add new items to owned items
  const newOwnedItems = [...gachaState.ownedItems];
  results.forEach((result) => {
    if (result.isNew && !newOwnedItems.includes(result.item.id)) {
      newOwnedItems.push(result.item.id);
    }
  });

  // Create history entry
  const historyEntry: PullHistoryEntry = {
    timestamp: Date.now(),
    items: results,
    pullType,
    gemsCost,
  };

  // Update last free pull date if free pull
  const lastFreePullDate =
    pullType === 'free' ? Date.now() : gachaState.lastFreePullDate;

  return {
    ...gachaState,
    pullHistory: [historyEntry, ...gachaState.pullHistory].slice(0, 100), // Keep last 100 pulls
    pityCounter: newPityCounter,
    lastFreePullDate,
    ownedItems: newOwnedItems,
  };
}

/**
 * Get gacha statistics
 */
export function getGachaStatistics(gachaState: GachaState): {
  totalPulls: number;
  legendaryPulls: number;
  epicPulls: number;
  rarePulls: number;
  commonPulls: number;
  totalGemsSpent: number;
  legendaryRate: number;
  averageRarity: string;
} {
  let totalPulls = 0;
  let legendaryPulls = 0;
  let epicPulls = 0;
  let rarePulls = 0;
  let commonPulls = 0;
  let totalGemsSpent = 0;

  gachaState.pullHistory.forEach((entry) => {
    totalGemsSpent += entry.gemsCost;
    entry.items.forEach((result) => {
      totalPulls++;
      switch (result.item.rarity) {
        case 'legendary':
          legendaryPulls++;
          break;
        case 'epic':
          epicPulls++;
          break;
        case 'rare':
          rarePulls++;
          break;
        case 'common':
          commonPulls++;
          break;
      }
    });
  });

  const legendaryRate = totalPulls > 0 ? (legendaryPulls / totalPulls) * 100 : 0;

  // Calculate average rarity
  const rarityScore =
    legendaryPulls * 4 + epicPulls * 3 + rarePulls * 2 + commonPulls * 1;
  const avgScore = totalPulls > 0 ? rarityScore / totalPulls : 0;
  let averageRarity = 'common';
  if (avgScore >= 3.5) averageRarity = 'legendary';
  else if (avgScore >= 2.5) averageRarity = 'epic';
  else if (avgScore >= 1.5) averageRarity = 'rare';

  return {
    totalPulls,
    legendaryPulls,
    epicPulls,
    rarePulls,
    commonPulls,
    totalGemsSpent,
    legendaryRate,
    averageRarity,
  };
}

/**
 * Get rarity color for UI
 */
export function getRarityColor(rarity: Rarity): string {
  switch (rarity) {
    case 'legendary':
      return '#FFD700'; // Gold
    case 'epic':
      return '#9333EA'; // Purple
    case 'rare':
      return '#3B82F6'; // Blue
    case 'common':
      return '#9CA3AF'; // Gray
  }
}

/**
 * Get rarity gradient for UI
 */
export function getRarityGradient(rarity: Rarity): string {
  switch (rarity) {
    case 'legendary':
      return 'from-yellow-400 via-orange-500 to-pink-500';
    case 'epic':
      return 'from-purple-600 via-pink-600 to-purple-800';
    case 'rare':
      return 'from-blue-500 via-cyan-500 to-blue-700';
    case 'common':
      return 'from-gray-400 via-gray-500 to-gray-600';
  }
}

/**
 * Get rarity name in Vietnamese
 */
export function getRarityNameVi(rarity: Rarity): string {
  switch (rarity) {
    case 'legendary':
      return 'Huyền Thoại';
    case 'epic':
      return 'Sử Thi';
    case 'rare':
      return 'Hiếm';
    case 'common':
      return 'Thường';
  }
}
