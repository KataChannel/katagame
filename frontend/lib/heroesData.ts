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

  // 4. An Dương Vương - Metal Marksman
  {
    id: 'an-duong-vuong',
    name: 'anduongvuong',
    displayName: 'An Dương Vương',
    title: 'Vua Nước Âu Lạc',
    element: 'metal',
    rarity: 'legendary',
    level: 1,
    experience: 0,
    stats: {
      hp: 1100,
      maxHp: 1100,
      attack: 160,
      defense: 100,
      speed: 110,
      critRate: 35,
      critDamage: 210,
    },
    skills: [
      {
        id: 'adv-skill-1',
        name: 'Nỏ Thần Liên Châu',
        description: 'Bắn một mũi tên xuyên thấu, gây 200% sát thương Kim',
        damage: 200,
        cooldown: 3,
        currentCooldown: 0,
        element: 'metal',
        targetType: 'single',
      },
      {
        id: 'adv-skill-2',
        name: 'Loa Thành Kiên Cố',
        description: 'Tăng 40% phòng thủ và phản lại 30% sát thương nhận vào',
        damage: 0,
        cooldown: 5,
        currentCooldown: 0,
        element: 'metal',
        targetType: 'self',
        effects: [
          {
            type: 'buff',
            value: 40,
            duration: 3,
          },
        ],
      },
    ],
    owned: false,
    unlockMethod: 'gacha',
    lore: 'An Dương Vương (Thục Phán) là người lập nên nước Âu Lạc, xây dựng thành Cổ Loa và chế tạo nỏ thần (nhờ sự giúp đỡ của Thần Kim Quy) để chống giặc ngoại xâm.',
    icon: '🏰',
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

  // 6. Ngô Quyền - Water Warrior
  {
    id: 'ngo-quyen',
    name: 'ngoquyen',
    displayName: 'Ngô Quyền',
    title: 'Vua Mở Cõi',
    element: 'water',
    rarity: 'legendary',
    level: 1,
    experience: 0,
    stats: {
      hp: 1300,
      maxHp: 1300,
      attack: 180,
      defense: 110,
      speed: 100,
      critRate: 20,
      critDamage: 180,
    },
    skills: [
      {
        id: 'nq-skill-1',
        name: 'Bạch Đằng Giao Long',
        description: 'Triệu hồi cọc gỗ gây 200% sát thương Thủy và làm choáng 1 lượt',
        damage: 200,
        cooldown: 4,
        currentCooldown: 0,
        element: 'water',
        targetType: 'single',
        effects: [{ type: 'debuff', value: 100, duration: 1 }],
      },
      {
        id: 'nq-skill-2',
        name: 'Thủy Triều Dâng',
        description: 'Tăng 30% tốc độ cho toàn đội trong 2 lượt',
        damage: 0,
        cooldown: 3,
        currentCooldown: 0,
        element: 'water',
        targetType: 'self',
        effects: [{ type: 'buff', value: 30, duration: 2 }],
      },
    ],
    owned: false,
    unlockMethod: 'quest',
    lore: 'Ngô Quyền là vị vua sáng lập nhà Ngô, người đã chỉ huy tiêu diệt quân Nam Hán trên sông Bạch Đằng năm 938, chám dứt hơn 1000 năm Bắc thuộc.',
    icon: '🌊',
  },

  // 7. Đinh Bộ Lĩnh - Earth Warrior
  {
    id: 'dinh-bo-linh',
    name: 'dinhbolinh',
    displayName: 'Đinh Bộ Lĩnh',
    title: 'Cờ Lau Dẹp Loạn',
    element: 'earth',
    rarity: 'legendary',
    level: 1,
    experience: 0,
    stats: {
      hp: 1400,
      maxHp: 1400,
      attack: 150,
      defense: 130,
      speed: 90,
      critRate: 15,
      critDamage: 150,
    },
    skills: [
      {
        id: 'dbl-skill-1',
        name: 'Cờ Lau Tập Trận',
        description: 'Triệu hồi trâu vàng hất văng địch, gây 180% sát thương Thổ',
        damage: 180,
        cooldown: 3,
        currentCooldown: 0,
        element: 'earth',
        targetType: 'single',
      },
      {
        id: 'dbl-skill-2',
        name: 'Thống Nhất Sơn Hà',
        description: 'Tăng 40% chỉ số tấn công và phòng thủ của bản thân',
        damage: 0,
        cooldown: 5,
        currentCooldown: 0,
        element: 'earth',
        targetType: 'self',
        effects: [{ type: 'buff', value: 40, duration: 3 }],
      },
    ],
    owned: false,
    unlockMethod: 'quest',
    lore: 'Đinh Bộ Lĩnh, tức Đinh Tiên Hoàng, là người có công dẹp loạn 12 sứ quân, thống nhất đất nước, lập ra triều đại nhà Đinh và nước Đại Cồ Việt.',
    icon: '🐃',
  },

  // 8. Lê Hoàn - Fire Tank
  {
    id: 'le-hoan',
    name: 'lehoan',
    displayName: 'Lê Hoàn',
    title: 'Thập Đạo Tướng Quân',
    element: 'fire',
    rarity: 'epic',
    level: 1,
    experience: 0,
    stats: {
      hp: 1600,
      maxHp: 1600,
      attack: 130,
      defense: 150,
      speed: 80,
      critRate: 10,
      critDamage: 130,
    },
    skills: [
      {
        id: 'lh-skill-1',
        name: 'Phá Tống',
        description: 'Xung phong càn quét gây sát thương Hỏa lên toàn bộ địch',
        damage: 120,
        cooldown: 4,
        currentCooldown: 0,
        element: 'fire',
        targetType: 'all',
      },
      {
        id: 'lh-skill-2',
        name: 'Bình Chiêm',
        description: 'Tạo giáp ảo bằng 20% HP Tối đa và thu hút sát thương',
        damage: 0,
        cooldown: 4,
        currentCooldown: 0,
        element: 'fire',
        targetType: 'self',
        effects: [{ type: 'buff', value: 20, duration: 2 }],
      },
    ],
    owned: false,
    unlockMethod: 'gacha',
    lore: 'Lê Hoàn (Lê Đại Hành) xuất thân là Thập đạo tướng quân, người đã lãnh đạo nhân dân đánh tống bình chiêm, giữ vững bờ cõi Đại Cồ Việt.',
    icon: '🐯',
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
