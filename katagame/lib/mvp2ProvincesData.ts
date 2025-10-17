/**
 * MVP 2: 6 Tỉnh Mới
 * Huế, Đà Nẵng, TP.HCM, Cần Thơ, Đà Lạt, Phú Quốc
 */

import { Province, ElementType, Resource } from './types';
import { v4 as uuidv4 } from 'uuid';

const createEmptyResource = (): Resource => ({
  gold: 0,
  rice: 0,
  lumber: 0,
  stone: 0,
  culture: 0,
});

export const mvp2Provinces: Province[] = [
  // 1. Huế - Imperial City (Thổ - Earth)
  {
    id: 'hue',
    name: 'hue',
    displayName: 'Huế',
    description: 'Cố đô Huế - Kinh đô xưa, di sản văn hóa thế giới',
    unlocked: false,
    level: 0,
    maxLevel: 15,
    resources: createEmptyResource(),
    resourcesPerSecond: { gold: 2.5, rice: 1, lumber: 0.8, stone: 2, culture: 3 },
    specialties: ['Lịch sử', 'Văn hóa triều Nguyễn', 'Ẩm thực cung đình'],
    culturalBonus: 'Bonus +50% Culture generation - Imperial Heritage',
    farmers: [],
    buildings: [],
    element: 'earth',
    region: 'central',
    unlockRequirement: {
      level: 5,
      gold: 500,
      provinces: ['hanoi', 'nghean'],
    },
  },

  // 2. Đà Nẵng - Technology Hub (Kim - Metal)
  {
    id: 'danang',
    name: 'danang',
    displayName: 'Đà Nẵng',
    description: 'Thành phố đáng sống - Cầu Rồng, Bà Nà, công nghệ cao',
    unlocked: false,
    level: 0,
    maxLevel: 15,
    resources: createEmptyResource(),
    resourcesPerSecond: { gold: 3.5, rice: 1.2, lumber: 1, stone: 1.5, culture: 2 },
    specialties: ['Công nghệ', 'Du lịch', 'Thương mại'],
    culturalBonus: 'Bonus +30% Gold production - Tech Innovation',
    farmers: [],
    buildings: [],
    element: 'metal',
    region: 'central',
    unlockRequirement: {
      level: 6,
      gold: 600,
      provinces: ['hue'],
    },
  },

  // 3. TP.HCM - Commerce Capital (Hỏa - Fire)
  {
    id: 'hochiminh',
    name: 'hochiminh',
    displayName: 'TP. Hồ Chí Minh',
    description: 'Sài Gòn - Trung tâm kinh tế, thương mại sôi động',
    unlocked: false,
    level: 0,
    maxLevel: 15,
    resources: createEmptyResource(),
    resourcesPerSecond: { gold: 5, rice: 0.8, lumber: 0.5, stone: 1, culture: 2.5 },
    specialties: ['Thương mại', 'Kinh doanh', 'Văn hóa đô thị'],
    culturalBonus: 'Bonus +60% Gold production - Economic Powerhouse',
    farmers: [],
    buildings: [],
    element: 'fire',
    region: 'south',
    unlockRequirement: {
      level: 7,
      gold: 800,
      provinces: ['danang'],
    },
  },

  // 4. Cần Thơ - Mekong Delta (Thủy - Water)
  {
    id: 'cantho',
    name: 'cantho',
    displayName: 'Cần Thơ',
    description: 'Miền Tây sông nước - Chợ nổi, vườn trái cây',
    unlocked: false,
    level: 0,
    maxLevel: 15,
    resources: createEmptyResource(),
    resourcesPerSecond: { gold: 2, rice: 4, lumber: 1.5, stone: 0.5, culture: 1.8 },
    specialties: ['Nông nghiệp', 'Thủy sản', 'Trái cây'],
    culturalBonus: 'Bonus +70% Rice production - Mekong Breadbasket',
    farmers: [],
    buildings: [],
    element: 'water',
    region: 'south',
    unlockRequirement: {
      level: 8,
      gold: 700,
      provinces: ['hochiminh'],
    },
  },

  // 5. Đà Lạt - Highland Paradise (Mộc - Wood)
  {
    id: 'dalat',
    name: 'dalat',
    displayName: 'Đà Lạt',
    description: 'Thành phố ngàn hoa - Khí hậu mát mẻ, thiên nhiên tuyệt đẹp',
    unlocked: false,
    level: 0,
    maxLevel: 15,
    resources: createEmptyResource(),
    resourcesPerSecond: { gold: 2.5, rice: 1.5, lumber: 3, stone: 1, culture: 2.2 },
    specialties: ['Hoa', 'Du lịch', 'Nông sản cao nguyên'],
    culturalBonus: 'Bonus +50% Lumber production - Highland Resources',
    farmers: [],
    buildings: [],
    element: 'wood',
    region: 'central',
    unlockRequirement: {
      level: 8,
      gold: 650,
      provinces: ['hochiminh'],
    },
  },

  // 6. Phú Quốc - Island Paradise (Thủy - Water)
  {
    id: 'phuquoc',
    name: 'phuquoc',
    displayName: 'Phú Quốc',
    description: 'Đảo ngọc - Biển xanh, cát trắng, nước mắm đặc sản',
    unlocked: false,
    level: 0,
    maxLevel: 15,
    resources: createEmptyResource(),
    resourcesPerSecond: { gold: 3, rice: 0.8, lumber: 1.2, stone: 0.8, culture: 2.5 },
    specialties: ['Du lịch biển', 'Hải sản', 'Nước mắm'],
    culturalBonus: 'Bonus +40% Gold from tourism - Island Paradise',
    farmers: [],
    buildings: [],
    element: 'water',
    region: 'south',
    unlockRequirement: {
      level: 9,
      gold: 900,
      provinces: ['cantho', 'hochiminh'],
    },
  },
];

// Element Data (Ngũ Hành)
export const elements = {
  fire: {
    type: 'fire' as ElementType,
    name: 'fire',
    displayName: 'Hỏa',
    icon: '🔥',
    color: '#ef4444',
    counters: 'metal' as ElementType,
    weakTo: 'water' as ElementType,
    bonuses: {
      production: 20, // +20% crafting speed
      combat: 15, // +15% attack
      defense: 0,
    },
  },
  water: {
    type: 'water' as ElementType,
    name: 'water',
    displayName: 'Thủy',
    icon: '💧',
    color: '#3b82f6',
    counters: 'fire' as ElementType,
    weakTo: 'earth' as ElementType,
    bonuses: {
      production: 15, // +15% fishing yield
      combat: 10,
      defense: 15, // +15% defense
    },
  },
  wood: {
    type: 'wood' as ElementType,
    name: 'wood',
    displayName: 'Mộc',
    icon: '🌳',
    color: '#10b981',
    counters: 'earth' as ElementType,
    weakTo: 'metal' as ElementType,
    bonuses: {
      production: 25, // +25% farming output
      combat: 5,
      defense: 10,
    },
  },
  metal: {
    type: 'metal' as ElementType,
    name: 'metal',
    displayName: 'Kim',
    icon: '⚔️',
    color: '#94a3b8',
    counters: 'wood' as ElementType,
    weakTo: 'fire' as ElementType,
    bonuses: {
      production: 20, // +20% mining & crafting
      combat: 20, // +20% attack
      defense: 5,
    },
  },
  earth: {
    type: 'earth' as ElementType,
    name: 'earth',
    displayName: 'Thổ',
    icon: '⛰️',
    color: '#78716c',
    counters: 'water' as ElementType,
    weakTo: 'wood' as ElementType,
    bonuses: {
      production: 15,
      combat: 5,
      defense: 25, // +25% defense & stability
    },
  },
};

// Helper function to calculate element bonus
export const calculateElementBonus = (
  attackElement: ElementType,
  defenseElement: ElementType
): number => {
  const attacker = elements[attackElement];
  if (attacker.counters === defenseElement) {
    return 1.5; // 50% bonus damage
  } else if (attacker.weakTo === defenseElement) {
    return 0.75; // 25% reduced damage
  }
  return 1.0; // Normal damage
};

// Get provinces by region
export const getProvincesByRegion = (region: 'north' | 'central' | 'south') => {
  return mvp2Provinces.filter((p) => p.region === region);
};

// Get provinces by element
export const getProvincesByElement = (element: ElementType) => {
  return mvp2Provinces.filter((p) => p.element === element);
};
