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
});

// ============================================================================
// COMMON ENEMIES (Easy)
// ============================================================================

export const enemies: Enemy[] = [
  // 1. Cướp Biển (Pirate Raider) - Water
  {
    id: 'pirate-raider',
    name: 'pirate-raider',
    displayName: 'Cướp Biển',
    element: 'water',
    level: 1,
    hp: 300,
    maxHp: 300,
    attack: 40,
    defense: 20,
    loot: {
      gold: 50,
      rice: 20,
      lumber: 10,
      stone: 5,
      culture: 5,
    },
    skills: ['splash-attack'],
  },

  // 2. Sơn Tặc (Mountain Bandit) - Earth
  {
    id: 'mountain-bandit',
    name: 'mountain-bandit',
    displayName: 'Sơn Tặc',
    element: 'earth',
    level: 2,
    hp: 400,
    maxHp: 400,
    attack: 50,
    defense: 35,
    loot: {
      gold: 70,
      rice: 15,
      lumber: 15,
      stone: 30,
      culture: 5,
    },
    skills: ['rock-throw'],
  },

  // 3. Thợ Săn Hoang Dã (Wild Hunter) - Wood
  {
    id: 'wild-hunter',
    name: 'wild-hunter',
    displayName: 'Thợ Săn Hoang Dã',
    element: 'wood',
    level: 2,
    hp: 350,
    maxHp: 350,
    attack: 60,
    defense: 25,
    loot: {
      gold: 60,
      rice: 25,
      lumber: 40,
      stone: 10,
      culture: 5,
    },
    skills: ['arrow-shot'],
  },

  // 4. Thợ Rèn Phản Loạn (Rogue Blacksmith) - Metal
  {
    id: 'rogue-blacksmith',
    name: 'rogue-blacksmith',
    displayName: 'Thợ Rèn Phản Loạn',
    element: 'metal',
    level: 3,
    hp: 450,
    maxHp: 450,
    attack: 70,
    defense: 40,
    loot: {
      gold: 100,
      rice: 10,
      lumber: 20,
      stone: 20,
      culture: 10,
    },
    skills: ['hammer-strike'],
  },

  // 5. Pháp Sư Lửa (Fire Mage) - Fire
  {
    id: 'fire-mage',
    name: 'fire-mage',
    displayName: 'Pháp Sư Lửa',
    element: 'fire',
    level: 3,
    hp: 320,
    maxHp: 320,
    attack: 85,
    defense: 30,
    loot: {
      gold: 80,
      rice: 20,
      lumber: 15,
      stone: 10,
      culture: 15,
    },
    skills: ['fireball'],
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
    },
    skills: ['earthquake', 'stone-armor'],
  },

  // 8. Yêu Mộc (Tree Spirit)
  {
    id: 'tree-spirit',
    name: 'tree-spirit',
    displayName: 'Yêu Mộc',
    element: 'wood',
    level: 5,
    hp: 700,
    maxHp: 700,
    attack: 80,
    defense: 45,
    loot: {
      gold: 120,
      rice: 60,
      lumber: 80,
      stone: 20,
      culture: 25,
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
    },
    skills: ['tsunami', 'monsoon', 'water-shield'],
  },

  // 10. Chín Đầu Xà (Nine-Headed Serpent)
  {
    id: 'nine-headed-serpent',
    name: 'nine-headed-serpent',
    displayName: 'Chín Đầu Xà',
    element: 'earth',
    level: 12,
    hp: 2500,
    maxHp: 2500,
    attack: 120,
    defense: 120,
    loot: {
      gold: 600,
      rice: 100,
      lumber: 100,
      stone: 150,
      culture: 150,
    },
    skills: ['multi-bite', 'poison-breath', 'regenerate-head'],
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
