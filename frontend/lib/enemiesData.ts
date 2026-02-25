/**
 * Enemies Data - Vietnamese Mythical Creatures
 * 
 * Features enemies based on Vietnamese folklore and mythology
 */

import { Enemy, ElementType, Resource } from './types';
import { v4 as uuidv4 } from 'uuid';

const createEmptyResource = (): Resource => ({
  gold: 0,
  rice: 0,
  lumber: 0,
  stone: 0,
  culture: 0,
  bazan: 0,
});

// ============================================================================
// COMMON ENEMIES (Easy)
// ============================================================================

export const enemies: Enemy[] = [
  // 1. Thuồng Luồng (Water Monster) - Water
  {
    id: 'thuong-luong',
    name: 'thuong-luong',
    displayName: 'Thuồng Luồng',
    element: 'water',
    level: 1,
    hp: 350,
    maxHp: 350,
    attack: 45,
    defense: 25,
    loot: {
      gold: 50,
      rice: 20,
      lumber: 10,
      stone: 5,
      culture: 5,
      bazan: 0,
    },
    skills: ['water-bite'],
  },

  // 2. Giặc Ân (Yin Invader) - Earth/Metal
  {
    id: 'giac-an',
    name: 'giac-an',
    displayName: 'Giặc Ân',
    element: 'earth',
    level: 2,
    hp: 450,
    maxHp: 450,
    attack: 55,
    defense: 40,
    loot: {
      gold: 70,
      rice: 15,
      lumber: 15,
      stone: 30,
      culture: 10,
      bazan: 0,
    },
    skills: ['spear-thrust'],
  },

  // 3. Hồ Tinh (Fox Spirit) - Wood
  {
    id: 'ho-tinh',
    name: 'ho-tinh',
    displayName: 'Hồ Tinh (Cáo 9 Đuôi)',
    element: 'wood',
    level: 2,
    hp: 380,
    maxHp: 380,
    attack: 65,
    defense: 30,
    loot: {
      gold: 60,
      rice: 25,
      lumber: 40,
      stone: 10,
      culture: 15,
      bazan: 0,
    },
    skills: ['charm', 'claw-scratch'],
  },

  // 4. Lính Triệu Đà (Zhao Tuo Soldier) - Metal
  {
    id: 'linh-trieu-da',
    name: 'linh-trieu-da',
    displayName: 'Lính Triệu Đà',
    element: 'metal',
    level: 3,
    hp: 500,
    maxHp: 500,
    attack: 75,
    defense: 45,
    loot: {
      gold: 100,
      rice: 10,
      lumber: 20,
      stone: 20,
      culture: 10,
      bazan: 0,
    },
    skills: ['sword-slash'],
  },

  // 5. Hỏa Tinh (Fire Spirit) - Fire
  {
    id: 'hoa-tinh',
    name: 'hoa-tinh',
    displayName: 'Hỏa Tinh',
    element: 'fire',
    level: 3,
    hp: 340,
    maxHp: 340,
    attack: 90,
    defense: 25,
    loot: {
      gold: 80,
      rice: 20,
      lumber: 15,
      stone: 10,
      culture: 15,
      bazan: 0,
    },
    skills: ['burn'],
  },
];

// ============================================================================
// ELITE ENEMIES (Medium)
// ============================================================================

export const eliteEnemies: Enemy[] = [
  // 6. Ma Thủy (Water Demon)
  {
    id: 'water-demon',
    name: 'water-demon',
    displayName: 'Ma Thủy',
    element: 'water',
    level: 5,
    hp: 800,
    maxHp: 800,
    attack: 90,
    defense: 50,
    loot: {
      gold: 200,
      rice: 50,
      lumber: 30,
      stone: 30,
      culture: 30,
      bazan: 0,
    },
    skills: ['tidal-wave', 'water-prison'],
  },

  // 7. Thạch Nhân (Stone Golem)
  {
    id: 'stone-golem',
    name: 'stone-golem',
    displayName: 'Thạch Nhân',
    element: 'earth',
    level: 6,
    hp: 1200,
    maxHp: 1200,
    attack: 70,
    defense: 80,
    loot: {
      gold: 150,
      rice: 20,
      lumber: 20,
      stone: 100,
      culture: 20,
      bazan: 0,
    },
    skills: ['earthquake', 'stone-armor'],
  },

  // 8. Mộc Tinh (Tree Spirit)
  {
    id: 'moc-tinh',
    name: 'moc-tinh',
    displayName: 'Mộc Tinh (Yêu Cây)',
    element: 'wood',
    level: 5,
    hp: 750,
    maxHp: 750,
    attack: 85,
    defense: 50,
    loot: {
      gold: 120,
      rice: 60,
      lumber: 80,
      stone: 20,
      culture: 25,
      bazan: 0,
    },
    skills: ['vine-whip', 'regeneration'],
  },
];

// ============================================================================
// BOSS ENEMIES (Hard - Vietnamese Mythology)
// ============================================================================

export const bossEnemies: Enemy[] = [
  // 9. Thủy Tinh (Water God - Rival of Sơn Tinh)
  {
    id: 'thuy-tinh',
    name: 'thuy-tinh',
    displayName: 'Thủy Tinh - Thần Nước',
    element: 'water',
    level: 10,
    hp: 2000,
    maxHp: 2000,
    attack: 150,
    defense: 100,
    loot: {
      gold: 500,
      rice: 150,
      lumber: 100,
      stone: 100,
      culture: 100,
      bazan: 0,
    },
    skills: ['tsunami', 'monsoon', 'water-shield'],
  },

  // 10. Ngư Tinh (Giant Fish Monster)
  {
    id: 'ngu-tinh',
    name: 'ngu-tinh',
    displayName: 'Ngư Tinh (Cá Khổng Lồ)',
    element: 'water',
    level: 12,
    hp: 2500,
    maxHp: 2500,
    attack: 130,
    defense: 120,
    loot: {
      gold: 600,
      rice: 100,
      lumber: 100,
      stone: 150,
      culture: 150,
      bazan: 0,
    },
    skills: ['devour', 'tail-smash', 'tsunami'],
  },

  // 11. Phù Đổng Thiên Vương (Evil Version - Fire Demon)
  {
    id: 'fire-demon-king',
    name: 'fire-demon-king',
    displayName: 'Ma Vương Hỏa',
    element: 'fire',
    level: 15,
    hp: 3000,
    maxHp: 3000,
    attack: 200,
    defense: 120,
    loot: {
      gold: 1000,
      rice: 200,
      lumber: 150,
      stone: 150,
      culture: 200,
      bazan: 0,
    },
    skills: ['inferno', 'flame-burst', 'burning-aura'],
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all enemies
 */
export function getAllEnemies(): Enemy[] {
  return [...enemies, ...eliteEnemies, ...bossEnemies];
}

/**
 * Get enemy by ID
 */
export function getEnemyById(id: string): Enemy | undefined {
  return getAllEnemies().find(e => e.id === id);
}

/**
 * Get enemies by difficulty
 */
export function getEnemiesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Enemy[] {
  switch (difficulty) {
    case 'easy':
      return enemies;
    case 'medium':
      return eliteEnemies;
    case 'hard':
      return bossEnemies;
    default:
      return enemies;
  }
}

/**
 * Get random enemy by difficulty
 */
export function getRandomEnemy(difficulty: 'easy' | 'medium' | 'hard'): Enemy {
  const pool = getEnemiesByDifficulty(difficulty);
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Get enemies by element
 */
export function getEnemiesByElement(element: ElementType): Enemy[] {
  return getAllEnemies().filter(e => e.element === element);
}

/**
 * Scale enemy to level
 */
export function scaleEnemyToLevel(enemy: Enemy, targetLevel: number): Enemy {
  const levelDiff = targetLevel - enemy.level;
  const scaleFactor = 1 + (levelDiff * 0.15); // 15% per level
  
  return {
    ...enemy,
    id: uuidv4(), // New instance
    level: targetLevel,
    hp: Math.floor(enemy.hp * scaleFactor),
    maxHp: Math.floor(enemy.maxHp * scaleFactor),
    attack: Math.floor(enemy.attack * scaleFactor),
    defense: Math.floor(enemy.defense * scaleFactor),
    loot: {
      gold: Math.floor(enemy.loot.gold * scaleFactor),
      rice: Math.floor(enemy.loot.rice * scaleFactor),
      lumber: Math.floor(enemy.loot.lumber * scaleFactor),
      stone: Math.floor(enemy.loot.stone * scaleFactor),
      culture: Math.floor(enemy.loot.culture * scaleFactor),
      bazan: Math.floor((enemy.loot.bazan || 0) * scaleFactor),
    },
  };
}

/**
 * Generate encounter (1-3 enemies)
 */
export function generateEncounter(
  playerLevel: number,
  difficulty: 'easy' | 'medium' | 'hard'
): Enemy[] {
  const enemyCount = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
  const enemyPool = getEnemiesByDifficulty(difficulty);
  
  const encounter: Enemy[] = [];
  for (let i = 0; i < enemyCount; i++) {
    const baseEnemy = enemyPool[Math.floor(Math.random() * enemyPool.length)];
    const scaledEnemy = scaleEnemyToLevel(baseEnemy, playerLevel);
    encounter.push(scaledEnemy);
  }
  
  return encounter;
}

// ============================================================================
// EXPORT CONSTANTS
// ============================================================================

export const ENEMY_COUNT = getAllEnemies().length;
export const COMMON_ENEMY_COUNT = enemies.length;
export const ELITE_ENEMY_COUNT = eliteEnemies.length;
export const BOSS_ENEMY_COUNT = bossEnemies.length;
