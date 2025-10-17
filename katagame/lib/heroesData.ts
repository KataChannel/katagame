/**
 * MVP 2: Heroes System
 * 5 Vietnamese Legendary Heroes
 */

import { Hero, HeroSkill, ElementType } from './types';
import { v4 as uuidv4 } from 'uuid';

export const heroes: Hero[] = [
  // 1. Thánh Gióng - Fire DPS
  {
    id: 'thanh-giong',
    name: 'thanhgiong',
    displayName: 'Thánh Gióng',
    title: 'Vị Thánh Bảo Vệ Đất Việt',
    element: 'fire',
    rarity: 'legendary',
    level: 1,
    experience: 0,
    stats: {
      hp: 1000,
      maxHp: 1000,
      attack: 150,
      defense: 80,
      speed: 120,
      critRate: 25,
      critDamage: 180,
    },
    skills: [
      {
        id: 'giong-skill-1',
        name: 'Thiên Lôi Chém',
        description: 'Chém mạnh gây 200% sát thương Hỏa, 30% tỷ lệ choáng',
        damage: 200,
        cooldown: 3,
        currentCooldown: 0,
        element: 'fire',
        targetType: 'single',
        effects: [
          {
            type: 'debuff',
            value: 30,
            duration: 1,
          },
        ],
      },
      {
        id: 'giong-skill-2',
        name: 'Nộ Hỏa Thiên Thần',
        description: 'Tấn công tất cả kẻ địch, gây 150% sát thương Hỏa',
        damage: 150,
        cooldown: 5,
        currentCooldown: 0,
        element: 'fire',
        targetType: 'all',
      },
    ],
    owned: true, // Default hero
    unlockMethod: 'default',
    lore: 'Thánh Gióng là vị thánh thứ hai trong Tứ Bất Tử của tín ngưỡng dân gian Việt Nam. Người đã cưỡi ngựa sắt, đeo áo giáp sắt, cầm roi sắt đánh bại quân xâm lược Ân, giúp Hùng Vương giữ vững non sông.',
    icon: '🗡️',
  },

  // 2. Lạc Long Quân - Water Tank
  {
    id: 'lac-long-quan',
    name: 'laclongquan',
    displayName: 'Lạc Long Quân',
    title: 'Ông Tổ Dân Tộc Việt',
    element: 'water',
    rarity: 'legendary',
    level: 1,
    experience: 0,
    stats: {
      hp: 1500,
      maxHp: 1500,
      attack: 100,
      defense: 140,
      speed: 80,
      critRate: 15,
      critDamage: 150,
    },
    skills: [
      {
        id: 'llq-skill-1',
        name: 'Rồng Thần Hộ Giá',
        description: 'Tăng 50% phòng thủ cho toàn đội trong 3 lượt',
        damage: 0,
        cooldown: 4,
        currentCooldown: 0,
        element: 'water',
        targetType: 'self',
        effects: [
          {
            type: 'buff',
            value: 50,
            duration: 3,
          },
        ],
      },
      {
        id: 'llq-skill-2',
        name: 'Thủy Long Nộ',
        description: 'Triệu hồi rồng nước, gây 180% sát thương Thủy',
        damage: 180,
        cooldown: 3,
        currentCooldown: 0,
        element: 'water',
        targetType: 'single',
      },
    ],
    owned: false,
    unlockMethod: 'quest',
    lore: 'Lạc Long Quân là thủy tổ của người Việt, con Kinh Dương Vương, cháu Thần Nông. Người có tài phép phi thường, giúp dân trừ yêu trừ quái, dạy dân trồng lúa nước.',
    icon: '🐉',
  },

  // 3. Hai Bà Trưng - Wood Support
  {
    id: 'hai-ba-trung',
    name: 'haibatrung',
    displayName: 'Hai Bà Trưng',
    title: 'Nữ Tướng Anh Hùng',
    element: 'wood',
    rarity: 'legendary',
    level: 1,
    experience: 0,
    stats: {
      hp: 1200,
      maxHp: 1200,
      attack: 120,
      defense: 100,
      speed: 110,
      critRate: 20,
      critDamage: 160,
    },
    skills: [
      {
        id: 'hbt-skill-1',
        name: 'Khí Phách Anh Hùng',
        description: 'Hồi 30% HP và tăng 40% tấn công cho toàn đội',
        damage: 0,
        cooldown: 5,
        currentCooldown: 0,
        element: 'wood',
        targetType: 'self',
        effects: [
          {
            type: 'heal',
            value: 30,
            duration: 1,
          },
          {
            type: 'buff',
            value: 40,
            duration: 2,
          },
        ],
      },
      {
        id: 'hbt-skill-2',
        name: 'Song Kiếm Hợp Bích',
        description: 'Tấn công 2 lần, mỗi lần 140% sát thương Mộc',
        damage: 140,
        cooldown: 3,
        currentCooldown: 0,
        element: 'wood',
        targetType: 'single',
      },
    ],
    owned: false,
    unlockMethod: 'battlepass',
    lore: 'Hai Bà Trưng - Trưng Trắc và Trưng Nhị là hai nữ tướng anh hùng đã khởi nghĩa chống quân Đông Hán, lập nên nước Việt độc lập năm 40 - 43 SCN.',
    icon: '🏹',
  },

  // 4. Lý Thường Kiệt - Metal Warrior
  {
    id: 'ly-thuong-kiet',
    name: 'lythuongkiet',
    displayName: 'Lý Thường Kiệt',
    title: 'Thống Soái Thiên Tài',
    element: 'metal',
    rarity: 'legendary',
    level: 1,
    experience: 0,
    stats: {
      hp: 1100,
      maxHp: 1100,
      attack: 140,
      defense: 110,
      speed: 100,
      critRate: 30,
      critDamage: 200,
    },
    skills: [
      {
        id: 'ltk-skill-1',
        name: 'Nam Quốc Sơn Hà',
        description: 'Tấn công phản công, gây 250% sát thương Kim nếu bị tấn công',
        damage: 250,
        cooldown: 4,
        currentCooldown: 0,
        element: 'metal',
        targetType: 'single',
      },
      {
        id: 'ltk-skill-2',
        name: 'Thiết Mã Xung Phong',
        description: 'Tấn công đâm xuyên, gây 180% sát thương cho 2 kẻ địch',
        damage: 180,
        cooldown: 3,
        currentCooldown: 0,
        element: 'metal',
        targetType: 'single',
      },
    ],
    owned: false,
    unlockMethod: 'gacha',
    lore: 'Lý Thường Kiệt là danh tướng triều Lý, người đã viết bài thơ "Nam quốc sơn hà nam đế cư", khẳng định chủ quyền dân tộc, đánh bại quân Tống xâm lược.',
    icon: '⚔️',
  },

  // 5. Sơn Tinh - Earth Tank/Control
  {
    id: 'son-tinh',
    name: 'sontinh',
    displayName: 'Sơn Tinh',
    title: 'Thần Núi Bảo Hộ',
    element: 'earth',
    rarity: 'legendary',
    level: 1,
    experience: 0,
    stats: {
      hp: 1600,
      maxHp: 1600,
      attack: 90,
      defense: 150,
      speed: 70,
      critRate: 10,
      critDamage: 140,
    },
    skills: [
      {
        id: 'st-skill-1',
        name: 'Núi Non Bất Động',
        description: 'Tạo lá chắn hấp thụ 40% sát thương trong 3 lượt',
        damage: 0,
        cooldown: 5,
        currentCooldown: 0,
        element: 'earth',
        targetType: 'self',
        effects: [
          {
            type: 'buff',
            value: 40,
            duration: 3,
          },
        ],
      },
      {
        id: 'st-skill-2',
        name: 'Thạch Nhũ Trấn Áp',
        description: 'Gây 160% sát thương Thổ và làm chậm 50% tốc độ kẻ địch',
        damage: 160,
        cooldown: 3,
        currentCooldown: 0,
        element: 'earth',
        targetType: 'single',
        effects: [
          {
            type: 'debuff',
            value: 50,
            duration: 2,
          },
        ],
      },
    ],
    owned: false,
    unlockMethod: 'quest',
    lore: 'Sơn Tinh là vị thần núi trong truyền thuyết Việt Nam, người đã tranh giành Mị Nương với Thủy Tinh và mãi mãi bảo vệ dân làng khỏi lũ lụt.',
    icon: '⛰️',
  },
];

// Helper functions
export const getHeroById = (id: string): Hero | undefined => {
  return heroes.find((h) => h.id === id);
};

export const getHeroesByElement = (element: ElementType): Hero[] => {
  return heroes.filter((h) => h.element === element);
};

export const getHeroesByRarity = (
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
): Hero[] => {
  return heroes.filter((h) => h.rarity === rarity);
};

export const getOwnedHeroes = (): Hero[] => {
  return heroes.filter((h) => h.owned);
};

// Calculate hero power level
export const calculateHeroPower = (hero: Hero): number => {
  return (
    hero.stats.maxHp * 0.5 +
    hero.stats.attack * 2 +
    hero.stats.defense * 1.5 +
    hero.stats.speed * 1 +
    hero.stats.critRate * 3 +
    hero.stats.critDamage * 2
  );
};
