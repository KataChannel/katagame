/**
 * MVP 2: Pets System
 * 5 Mythical Vietnamese Creatures
 */

import { Pet, ElementType } from './types';
import { v4 as uuidv4 } from 'uuid';

export const pets: Pet[] = [
  // 1. Rồng (Dragon) - Water
  {
    id: 'dragon',
    name: 'dragon',
    displayName: 'Rồng Thần',
    element: 'water',
    rarity: 'legendary',
    level: 1,
    experience: 0,
    owned: true, // Starter pet
    passiveBonus: {
      type: 'production',
      value: 25,
      resource: 'rice',
    },
    activeSkill: {
      name: 'Mưa Phước Lành',
      description: 'Tăng 50% tất cả tài nguyên trong 1 giờ',
      cooldown: 86400, // 24 hours in seconds
      effect: 'production_boost',
    },
    lore: 'Rồng là linh vật thiêng liêng nhất của người Việt, biểu tượng cho sức mạnh, trí tuệ và phúc lành. Con rồng mang mưa thuận gió hòa cho mùa màng bội thu.',
    icon: '🐉',
  },

  // 2. Phượng (Phoenix) - Fire
  {
    id: 'phoenix',
    name: 'phoenix',
    displayName: 'Phượng Hoàng',
    element: 'fire',
    rarity: 'legendary',
    level: 1,
    experience: 0,
    owned: false,
    passiveBonus: {
      type: 'production',
      value: 30,
      resource: 'gold',
    },
    activeSkill: {
      name: 'Lửa Tái Sinh',
      description: 'Hồi 100% HP cho tất cả heroes trong combat',
      cooldown: 3600, // 1 hour
      effect: 'heal_all',
    },
    lore: 'Phượng Hoàng là chim thần biểu tượng cho hoàng hậu và nữ giới cao quý. Loài chim này tượng trưng cho sự tái sinh, vẻ đẹp và quyền lực.',
    icon: '🦅',
  },

  // 3. Quy (Turtle) - Earth
  {
    id: 'turtle',
    name: 'turtle',
    displayName: 'Thần Quy',
    element: 'earth',
    rarity: 'epic',
    level: 1,
    experience: 0,
    owned: false,
    passiveBonus: {
      type: 'combat',
      value: 20,
    },
    activeSkill: {
      name: 'Long Thọ Bảo Hộ',
      description: 'Giảm 50% sát thương nhận vào trong 5 lượt combat',
      cooldown: 7200, // 2 hours
      effect: 'defense_boost',
    },
    lore: 'Thần Quy là biểu tượng của sự trường thọ, bền bỉ và trí tuệ. Rùa vàng Hồ Gươm là huyền thoại gắn liền với vua Lê Lợi và thanh kiếm Thuận Thiên.',
    icon: '🐢',
  },

  // 4. Lân (Qilin) - Wood
  {
    id: 'qilin',
    name: 'qilin',
    displayName: 'Kỳ Lân',
    element: 'wood',
    rarity: 'epic',
    level: 1,
    experience: 0,
    owned: false,
    passiveBonus: {
      type: 'production',
      value: 35,
      resource: 'lumber',
    },
    activeSkill: {
      name: 'Phúc Lộc Tăng Sinh',
      description: 'Nhân đôi tài nguyên thu hoạch trong 30 phút',
      cooldown: 43200, // 12 hours
      effect: 'double_resources',
    },
    lore: 'Kỳ Lân là con vật thần thoại mang lại may mắn và thịnh vượng. Theo tín ngưỡng, Lân chỉ xuất hiện khi thiên hạ thái bình, dân tộc hưng thịnh.',
    icon: '🦄',
  },

  // 5. Hổ (Tiger) - Metal
  {
    id: 'tiger',
    name: 'tiger',
    displayName: 'Bạch Hổ',
    element: 'metal',
    rarity: 'epic',
    level: 1,
    experience: 0,
    owned: false,
    passiveBonus: {
      type: 'combat',
      value: 30,
    },
    activeSkill: {
      name: 'Hổ Phách Thiên Oai',
      description: 'Tăng 100% critical rate cho toàn đội trong 3 lượt',
      cooldown: 5400, // 1.5 hours
      effect: 'crit_boost',
    },
    lore: 'Bạch Hổ là thần thú phương Tây trong Tứ Linh, biểu tượng cho dũng mãnh, uy quyền và sức mạnh. Hổ là vua của muôn thú.',
    icon: '🐅',
  },
];

// Additional pets for gacha/future content
export const rarePets: Pet[] = [
  {
    id: 'golden-fish',
    name: 'goldenfish',
    displayName: 'Cá Chép Vàng',
    element: 'water',
    rarity: 'rare',
    level: 1,
    experience: 0,
    owned: false,
    passiveBonus: {
      type: 'production',
      value: 15,
      resource: 'gold',
    },
    lore: 'Cá chép hóa rồng - Biểu tượng cho sự vươn lên, vượt qua khó khăn để đạt được thành công.',
    icon: '🐟',
  },
  {
    id: 'buffalo',
    name: 'buffalo',
    displayName: 'Trâu Thần',
    element: 'earth',
    rarity: 'rare',
    level: 1,
    experience: 0,
    owned: false,
    passiveBonus: {
      type: 'production',
      value: 20,
      resource: 'rice',
    },
    lore: 'Trâu là người bạn thân thiết của nông dân Việt Nam, biểu tượng cho sự cần cù, chịu khó.',
    icon: '🐃',
  },
  {
    id: 'crane',
    name: 'crane',
    displayName: 'Hạc Trắng',
    element: 'wood',
    rarity: 'rare',
    level: 1,
    experience: 0,
    owned: false,
    passiveBonus: {
      type: 'production',
      value: 18,
      resource: 'culture',
    },
    lore: 'Hạc trắng tượng trưng cho sự thanh cao, trường thọ và may mắn trong văn hóa Á Đông.',
    icon: '🦢',
  },
];

// Helper functions
export const getPetById = (id: string): Pet | undefined => {
  return [...pets, ...rarePets].find((p) => p.id === id);
};

export const getPetsByElement = (element: ElementType): Pet[] => {
  return [...pets, ...rarePets].filter((p) => p.element === element);
};

export const getPetsByRarity = (
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
): Pet[] => {
  return [...pets, ...rarePets].filter((p) => p.rarity === rarity);
};

export const getOwnedPets = (): Pet[] => {
  return [...pets, ...rarePets].filter((p) => p.owned);
};

// Calculate pet bonus value
export const calculatePetBonus = (pet: Pet, baseValue: number): number => {
  if (pet.passiveBonus.type === 'production') {
    return baseValue * (1 + pet.passiveBonus.value / 100);
  } else if (pet.passiveBonus.type === 'combat') {
    return baseValue * (1 + pet.passiveBonus.value / 100);
  }
  return baseValue;
};

// All pets combined
export const allPets = [...pets, ...rarePets];
