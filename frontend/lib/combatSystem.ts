/**
 * Combat System - Turn-based Battle Engine
 * 
 * Features:
 * - Turn-based combat mechanics
 * - Element-based damage calculation
 * - Hero skills execution
 * - Enemy AI
 * - Battle state management
 * - Rewards system
 */

import { Hero, Enemy, HeroSkill, ElementType, Resource, CombatResult } from './types';
import { 
  calculateDamageWithElement, 
  getEffectiveElement,
  calculateElementBonus 
} from './elementSystem';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// COMBAT STATE TYPES
// ============================================================================

export interface CombatState {
  id: string;
  phase: 'setup' | 'hero-turn' | 'enemy-turn' | 'victory' | 'defeat';
  turn: number;
  maxTurns: number;
  heroes: CombatantHero[];
  enemies: CombatantEnemy[];
  battleLog: BattleLogEntry[];
  rewards?: Resource;
}

export interface CombatantHero extends Hero {
  currentHp: number;
  currentMana: number;
  maxMana: number;
  buffs: StatusEffect[];
  debuffs: StatusEffect[];
  skillCooldowns: Map<string, number>;
  isDead: boolean;
}

export interface CombatantEnemy extends Enemy {
  currentHp: number;
  buffs: StatusEffect[];
  debuffs: StatusEffect[];
  isDead: boolean;
}

export interface StatusEffect {
  id: string;
  type: 'buff' | 'debuff';
  name: string;
  effect: {
    stat: 'attack' | 'defense' | 'speed' | 'hp';
    modifier: number; // percentage or flat value
    isPercentage: boolean;
  };
  duration: number; // turns remaining
  stackable: boolean;
  stacks: number;
}

export interface BattleLogEntry {
  turn: number;
  timestamp: number;
  actor: 'hero' | 'enemy';
  actorName: string;
  action: 'attack' | 'skill' | 'defend' | 'buff' | 'debuff' | 'heal';
  target: string;
  damage?: number;
  heal?: number;
  effect?: string;
  isCritical?: boolean;
  elementBonus?: number;
}

// ============================================================================
// COMBAT INITIALIZATION
// ============================================================================

/**
 * Initialize a new combat encounter
 */
export function initializeCombat(
  heroes: Hero[],
  enemies: Enemy[],
  maxTurns: number = 30
): CombatState {
  return {
    id: uuidv4(),
    phase: 'setup',
    turn: 1,
    maxTurns,
    heroes: heroes.map(hero => ({
      ...hero,
      currentHp: hero.stats.hp,
      currentMana: 100,
      maxMana: 100,
      buffs: [],
      debuffs: [],
      skillCooldowns: new Map(),
      isDead: false,
    })),
    enemies: enemies.map(enemy => ({
      ...enemy,
      currentHp: enemy.hp,
      buffs: [],
      debuffs: [],
      isDead: false,
    })),
    battleLog: [],
  };
}

/**
 * Convert CombatantHero back to Hero (for saving after battle)
 */
export function toCombatantHero(hero: Hero): CombatantHero {
  return {
    ...hero,
    currentHp: hero.stats.hp,
    currentMana: 100,
    maxMana: 100,
    buffs: [],
    debuffs: [],
    skillCooldowns: new Map(),
    isDead: false,
  };
}

// ============================================================================
// TURN RESOLUTION
// ============================================================================

/**
 * Process a hero's turn
 */
export function processHeroTurn(
  state: CombatState,
  heroId: string,
  action: 'attack' | 'skill',
  targetId: string,
  skillId?: string
): CombatState {
  const hero = state.heroes.find(h => h.id === heroId);
  const target = state.enemies.find(e => e.id === targetId);

  if (!hero || !target || hero.isDead || target.isDead) {
    return state;
  }

  const newState = { ...state };
  
  if (action === 'attack') {
    // Basic attack
    const damage = calculateBasicAttackDamage(hero, target);
    const isCrit = Math.random() < hero.stats.critRate;
    const finalDamage = isCrit ? damage * (hero.stats.critDamage / 100) : damage;
    
    applyDamage(newState, targetId, 'enemy', Math.floor(finalDamage));
    
    addBattleLog(newState, {
      turn: state.turn,
      timestamp: Date.now(),
      actor: 'hero',
      actorName: hero.displayName,
      action: 'attack',
      target: target.displayName,
      damage: Math.floor(finalDamage),
      isCritical: isCrit,
      elementBonus: calculateElementBonus(hero.element, target.element),
    });
  } else if (action === 'skill' && skillId) {
    // Use skill
    const skill = hero.skills.find(s => s.id === skillId);
    if (!skill) return state;
    
    // Check cooldown
    const cooldown = hero.skillCooldowns.get(skillId) || 0;
    if (cooldown > 0) return state;
    
    // Execute skill
    executeSkill(newState, hero, skill, target);
    
    // Set cooldown
    hero.skillCooldowns.set(skillId, skill.cooldown);
  }
  
  // Check for victory/defeat
  newState.phase = checkBattleEnd(newState);
  
  return newState;
}

/**
 * Process enemy turn (AI)
 */
export function processEnemyTurn(state: CombatState, enemyId: string): CombatState {
  const enemy = state.enemies.find(e => e.id === enemyId);
  if (!enemy || enemy.isDead) return state;
  
  // Simple AI: Attack random alive hero
  const aliveHeroes = state.heroes.filter(h => !h.isDead);
  if (aliveHeroes.length === 0) return state;
  
  const target = aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];
  const damage = calculateBasicAttackDamage(enemy, target);
  
  const newState = { ...state };
  applyDamage(newState, target.id, 'hero', Math.floor(damage));
  
  addBattleLog(newState, {
    turn: state.turn,
    timestamp: Date.now(),
    actor: 'enemy',
    actorName: enemy.displayName,
    action: 'attack',
    target: target.displayName,
    damage: Math.floor(damage),
    elementBonus: calculateElementBonus(enemy.element, target.element),
  });
  
  newState.phase = checkBattleEnd(newState);
  
  return newState;
}

/**
 * Advance to next turn
 */
export function nextTurn(state: CombatState): CombatState {
  const newState = { ...state, turn: state.turn + 1 };
  
  // Reduce cooldowns
  newState.heroes.forEach(hero => {
    hero.skillCooldowns.forEach((cooldown, skillId) => {
      if (cooldown > 0) {
        hero.skillCooldowns.set(skillId, cooldown - 1);
      }
    });
  });
  
  // Tick status effects
  tickStatusEffects(newState);
  
  // Check max turns
  if (newState.turn > newState.maxTurns) {
    newState.phase = 'defeat'; // Timeout = defeat
  }
  
  return newState;
}

// ============================================================================
// DAMAGE CALCULATION
// ============================================================================

/**
 * Calculate basic attack damage
 */
function calculateBasicAttackDamage(
  attacker: CombatantHero | CombatantEnemy,
  defender: CombatantHero | CombatantEnemy
): number {
  const attackerElement = attacker.element;
  const defenderElement = defender.element;
  
  const baseAttack = 'stats' in attacker ? attacker.stats.attack : attacker.attack;
  const defense = 'stats' in defender ? defender.stats.defense : defender.defense;
  
  return calculateDamageWithElement(
    baseAttack,
    attackerElement,
    defenderElement,
    defense
  );
}

/**
 * Execute a hero skill
 */
function executeSkill(
  state: CombatState,
  hero: CombatantHero,
  skill: HeroSkill,
  target: CombatantEnemy
): void {
  const baseDamage = skill.damage;
  const damage = calculateDamageWithElement(
    baseDamage,
    hero.element,
    target.element,
    target.defense
  );
  
  applyDamage(state, target.id, 'enemy', Math.floor(damage));
  
  addBattleLog(state, {
    turn: state.turn,
    timestamp: Date.now(),
    actor: 'hero',
    actorName: hero.displayName,
    action: 'skill',
    target: target.displayName,
    damage: Math.floor(damage),
    effect: skill.name,
    elementBonus: calculateElementBonus(hero.element, target.element),
  });
  
  // Apply skill effects (buffs/debuffs/heal)
  if (skill.effects && skill.effects.length > 0) {
    applySkillEffects(state, hero, skill, target);
  }
}

/**
 * Apply skill effects (buff/debuff/heal)
 */
function applySkillEffects(
  state: CombatState,
  hero: CombatantHero,
  skill: HeroSkill,
  target: CombatantEnemy
): void {
  if (!skill.effects) return;
  
  skill.effects.forEach(effect => {
    const { type, value, duration } = effect;
    
    if (type === 'heal') {
      // Heal hero
      hero.currentHp = Math.min(hero.currentHp + value, hero.stats.maxHp);
      addBattleLog(state, {
        turn: state.turn,
        timestamp: Date.now(),
        actor: 'hero',
        actorName: hero.displayName,
        action: 'heal',
        target: hero.displayName,
        heal: value,
      });
    } else if (type === 'buff') {
      // Apply buff to hero
      const buff: StatusEffect = {
        id: uuidv4(),
        type: 'buff',
        name: skill.name,
        effect: {
          stat: 'attack',
          modifier: value,
          isPercentage: true,
        },
        duration: duration || 3,
        stackable: false,
        stacks: 1,
      };
      hero.buffs.push(buff);
    } else if (type === 'debuff') {
      // Apply debuff to enemy
      const debuff: StatusEffect = {
        id: uuidv4(),
        type: 'debuff',
        name: skill.name,
        effect: {
          stat: 'defense',
          modifier: -value,
          isPercentage: true,
        },
        duration: duration || 3,
        stackable: false,
        stacks: 1,
      };
      target.debuffs.push(debuff);
    }
  });
}

// ============================================================================
// COMBAT UTILITIES
// ============================================================================

/**
 * Apply damage to a combatant
 */
function applyDamage(
  state: CombatState,
  targetId: string,
  targetType: 'hero' | 'enemy',
  damage: number
): void {
  if (targetType === 'hero') {
    const hero = state.heroes.find(h => h.id === targetId);
    if (hero) {
      hero.currentHp = Math.max(0, hero.currentHp - damage);
      if (hero.currentHp === 0) {
        hero.isDead = true;
      }
    }
  } else {
    const enemy = state.enemies.find(e => e.id === targetId);
    if (enemy) {
      enemy.currentHp = Math.max(0, enemy.currentHp - damage);
      if (enemy.currentHp === 0) {
        enemy.isDead = true;
      }
    }
  }
}

/**
 * Add entry to battle log
 */
function addBattleLog(state: CombatState, entry: BattleLogEntry): void {
  state.battleLog.push(entry);
}

/**
 * Tick status effects (reduce duration)
 */
function tickStatusEffects(state: CombatState): void {
  state.heroes.forEach(hero => {
    hero.buffs = hero.buffs.filter(buff => {
      buff.duration--;
      return buff.duration > 0;
    });
    hero.debuffs = hero.debuffs.filter(debuff => {
      debuff.duration--;
      return debuff.duration > 0;
    });
  });
  
  state.enemies.forEach(enemy => {
    enemy.buffs = enemy.buffs.filter(buff => {
      buff.duration--;
      return buff.duration > 0;
    });
    enemy.debuffs = enemy.debuffs.filter(debuff => {
      debuff.duration--;
      return debuff.duration > 0;
    });
  });
}

/**
 * Check if battle has ended
 */
function checkBattleEnd(state: CombatState): CombatState['phase'] {
  const allHeroesDead = state.heroes.every(h => h.isDead);
  const allEnemiesDead = state.enemies.every(e => e.isDead);
  
  if (allEnemiesDead) return 'victory';
  if (allHeroesDead) return 'defeat';
  
  return state.phase;
}

// ============================================================================
// BATTLE REWARDS
// ============================================================================

/**
 * Calculate battle rewards
 */
export function calculateRewards(
  state: CombatState,
  baseRewards: Resource
): Resource {
  if (state.phase !== 'victory') {
    return { gold: 0, rice: 0, lumber: 0, stone: 0, culture: 0 };
  }
  
  // Bonus for remaining HP
  const totalHeroHp = state.heroes.reduce((sum, h) => sum + h.currentHp, 0);
  const maxHeroHp = state.heroes.reduce((sum, h) => sum + h.stats.maxHp, 0);
  const hpBonus = totalHeroHp / maxHeroHp;
  
  // Bonus for speed (fewer turns)
  const turnBonus = Math.max(0.5, 1 - (state.turn / state.maxTurns));
  
  const multiplier = 1 + (hpBonus * 0.5) + (turnBonus * 0.5);
  
  return {
    gold: Math.floor(baseRewards.gold * multiplier),
    rice: Math.floor(baseRewards.rice * multiplier),
    lumber: Math.floor(baseRewards.lumber * multiplier),
    stone: Math.floor(baseRewards.stone * multiplier),
    culture: Math.floor(baseRewards.culture * multiplier),
  };
}

/**
 * Create CombatResult for saving to history
 */
export function createCombatResult(
  state: CombatState,
  enemyType: string,
  rewards: Resource
): CombatResult {
  return {
    id: state.id,
    timestamp: new Date(),
    enemyType,
    victory: state.phase === 'victory',
    rewards,
    heroesUsed: state.heroes.map(h => h.id),
    duration: state.turn,
  };
}

// ============================================================================
// EXPORT VALIDATION
// ============================================================================

export const COMBAT_SYSTEM_VERSION = '1.0.0';
