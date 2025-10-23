/**
 * Element System (Ngũ Hành) - Tương Sinh Tương Khắc
 * 
 * Vietnamese Five Elements System with counter mechanics:
 * Thủy (Water) → Hỏa (Fire) → Kim (Metal) → Mộc (Wood) → Thổ (Earth) → Thủy
 * 
 * Features:
 * - Element counter system (1.5x damage when countering)
 * - Element weakness system (0.75x damage when weak)
 * - Production bonuses based on element
 * - Combat damage calculation with elements
 * - Element combo bonuses
 */

import { ElementType, Element, Hero, Pet, Province } from '@/lib/types';
import { elements } from '@/lib/mvp2ProvincesData';

// ============================================================================
// ELEMENT COUNTER MECHANICS
// ============================================================================

/**
 * Get the element that this element is strong against (counters)
 */
export function getElementCounters(element: ElementType): ElementType {
  const counterMap: Record<ElementType, ElementType> = {
    water: 'fire',    // Thủy khắc Hỏa
    fire: 'metal',    // Hỏa khắc Kim
    metal: 'wood',    // Kim khắc Mộc
    wood: 'earth',    // Mộc khắc Thổ
    earth: 'water',   // Thổ khắc Thủy
  };
  
  return counterMap[element];
}

/**
 * Get the element that this element is weak against
 */
export function getElementWeakness(element: ElementType): ElementType {
  const weaknessMap: Record<ElementType, ElementType> = {
    water: 'earth',   // Thủy yếu với Thổ
    fire: 'water',    // Hỏa yếu với Thủy
    metal: 'fire',    // Kim yếu với Hỏa
    wood: 'metal',    // Mộc yếu với Kim
    earth: 'wood',    // Thổ yếu với Mộc
  };
  
  return weaknessMap[element];
}

/**
 * Calculate element bonus multiplier in combat
 * @returns multiplier (1.5 if counter, 0.75 if weak, 1.0 if neutral)
 */
export function calculateElementBonus(
  attackerElement: ElementType,
  defenderElement: ElementType
): number {
  // Strong against (counter)
  if (getElementCounters(attackerElement) === defenderElement) {
    return 1.5; // +50% damage
  }
  
  // Weak against
  if (getElementWeakness(attackerElement) === defenderElement) {
    return 0.75; // -25% damage
  }
  
  // Neutral
  return 1.0;
}

/**
 * Get element data by type
 */
export function getElementData(elementType: ElementType): Element {
  return elements[elementType];
}

// ============================================================================
// COMBAT DAMAGE CALCULATION
// ============================================================================

/**
 * Calculate final damage with element bonus
 */
export function calculateDamageWithElement(
  baseDamage: number,
  attackerElement: ElementType,
  defenderElement: ElementType,
  defenderDefense: number = 0
): number {
  // Apply element bonus/penalty
  const elementMultiplier = calculateElementBonus(attackerElement, defenderElement);
  const elementDamage = baseDamage * elementMultiplier;
  
  // Apply defense reduction (defense reduces damage by percentage)
  const defenseReduction = defenderDefense / (defenderDefense + 100);
  const finalDamage = elementDamage * (1 - defenseReduction);
  
  return Math.max(1, Math.floor(finalDamage)); // Minimum 1 damage
}

/**
 * Calculate effective element for hero + pet combo
 * Pet element takes precedence if present
 */
export function getEffectiveElement(hero: Hero, pet?: Pet): ElementType {
  // If pet has same element as hero, bonus applies
  if (pet && pet.element === hero.element) {
    // Same element combo - could add bonus in future
    return hero.element;
  }
  
  // Pet element overrides if different (tactical choice)
  return pet ? pet.element : hero.element;
}

// ============================================================================
// PRODUCTION BONUSES
// ============================================================================

/**
 * Calculate production bonus from element
 * Each element provides bonus to specific resource types
 */
export function getProductionBonus(
  province: Province,
  resourceType: 'gold' | 'rice' | 'lumber' | 'stone' | 'culture'
): number {
  if (!province.element) {
    return 1.0; // No element = no bonus
  }
  
  const element = getElementData(province.element);
  
  // Apply production bonus based on element type
  const productionBonus = 1 + (element.bonuses.production || 0) / 100;
  
  switch (element.type) {
    case 'fire':
      // Hỏa: Crafting speed & Gold production
      return resourceType === 'gold' ? productionBonus : 1.0;
      
    case 'water':
      // Thủy: Fishing & Rice production
      return resourceType === 'rice' ? productionBonus : 1.0;
      
    case 'wood':
      // Mộc: Farming & Lumber production
      return resourceType === 'lumber' ? productionBonus : 1.0;
      
    case 'earth':
      // Thổ: Mining & Stone production
      return resourceType === 'stone' ? productionBonus : 1.0;
      
    case 'metal':
      // Kim: General production & Gold
      return resourceType === 'gold' ? productionBonus : 1.0;
      
    default:
      return 1.0;
  }
}

/**
 * Calculate total production with all bonuses
 */
export function calculateTotalProduction(
  baseProduction: number,
  province: Province,
  resourceType: 'gold' | 'rice' | 'lumber' | 'stone' | 'culture',
  additionalMultipliers: number[] = []
): number {
  // Element bonus
  const elementBonus = getProductionBonus(province, resourceType);
  
  // Combine all multipliers
  const totalMultiplier = [elementBonus, ...additionalMultipliers].reduce(
    (acc, mult) => acc * mult,
    1.0
  );
  
  return baseProduction * totalMultiplier;
}

// ============================================================================
// ELEMENT COMBO SYSTEM
// ============================================================================

/**
 * Check if provinces create an element combo
 * Combo = 3+ provinces of same element unlocked
 */
export function checkElementCombo(
  unlockedProvinces: Province[],
  elementType: ElementType
): boolean {
  const sameElementCount = unlockedProvinces.filter(
    p => p.element === elementType
  ).length;
  
  return sameElementCount >= 3;
}

/**
 * Get combo bonus multiplier
 * @returns 1.2 (20% bonus) if combo active, 1.0 otherwise
 */
export function getComboBonus(
  unlockedProvinces: Province[],
  elementType: ElementType
): number {
  return checkElementCombo(unlockedProvinces, elementType) ? 1.2 : 1.0;
}

/**
 * Get all active element combos
 */
export function getActiveElementCombos(
  unlockedProvinces: Province[]
): ElementType[] {
  const allElements: ElementType[] = ['fire', 'water', 'wood', 'metal', 'earth'];
  
  return allElements.filter(element => 
    checkElementCombo(unlockedProvinces, element)
  );
}

// ============================================================================
// ELEMENT DISPLAY HELPERS
// ============================================================================

/**
 * Get element color for UI
 */
export function getElementColor(elementType: ElementType): string {
  const colorMap: Record<ElementType, string> = {
    fire: '#EF4444',    // Red
    water: '#3B82F6',   // Blue
    wood: '#22C55E',    // Green
    metal: '#94A3B8',   // Gray/Silver
    earth: '#A16207',   // Brown/Gold
  };
  
  return colorMap[elementType];
}

/**
 * Get element emoji for UI
 */
export function getElementEmoji(elementType: ElementType): string {
  const emojiMap: Record<ElementType, string> = {
    fire: '🔥',
    water: '💧',
    wood: '🌳',
    metal: '⚔️',
    earth: '⛰️',
  };
  
  return emojiMap[elementType];
}

/**
 * Get element icon class (for Tailwind)
 */
export function getElementIconClass(elementType: ElementType): string {
  const classMap: Record<ElementType, string> = {
    fire: 'bg-red-500 text-white',
    water: 'bg-blue-500 text-white',
    wood: 'bg-green-500 text-white',
    metal: 'bg-slate-400 text-white',
    earth: 'bg-yellow-700 text-white',
  };
  
  return classMap[elementType];
}

/**
 * Get element relationship display text
 */
export function getElementRelationship(
  element1: ElementType,
  element2: ElementType
): {
  relationship: 'counter' | 'weak' | 'neutral';
  text: string;
  multiplier: number;
} {
  const multiplier = calculateElementBonus(element1, element2);
  
  if (multiplier > 1) {
    return {
      relationship: 'counter',
      text: 'Mạnh',
      multiplier,
    };
  }
  
  if (multiplier < 1) {
    return {
      relationship: 'weak',
      text: 'Yếu',
      multiplier,
    };
  }
  
  return {
    relationship: 'neutral',
    text: 'Trung lập',
    multiplier,
  };
}

// ============================================================================
// ELEMENT STATS SUMMARY
// ============================================================================

/**
 * Get summary of element bonuses for a hero
 */
export function getHeroElementSummary(hero: Hero): {
  element: Element;
  strongAgainst: ElementType;
  weakAgainst: ElementType;
  combatBonus: number;
  defenseBonus: number;
} {
  const element = getElementData(hero.element);
  const strongAgainst = getElementCounters(hero.element);
  const weakAgainst = getElementWeakness(hero.element);
  
  return {
    element,
    strongAgainst,
    weakAgainst,
    combatBonus: element.bonuses.combat || 0,
    defenseBonus: element.bonuses.defense || 0,
  };
}

/**
 * Get summary of element bonuses for a province
 */
export function getProvinceElementSummary(province: Province): {
  element: Element | null;
  productionBonus: number;
  resourceType: string;
} | null {
  if (!province.element) {
    return null;
  }
  
  const element = getElementData(province.element);
  
  // Determine which resource gets bonus
  const resourceMap: Record<ElementType, string> = {
    fire: 'Vàng (Gold)',
    water: 'Lúa (Rice)',
    wood: 'Gỗ (Lumber)',
    earth: 'Đá (Stone)',
    metal: 'Vàng (Gold)',
  };
  
  return {
    element,
    productionBonus: 1 + (element.bonuses.production || 0) / 100,
    resourceType: resourceMap[element.type],
  };
}

// ============================================================================
// TESTING & VALIDATION
// ============================================================================

/**
 * Validate element counter circle (should form complete loop)
 */
export function validateElementCounters(): boolean {
  const allElements: ElementType[] = ['fire', 'water', 'wood', 'metal', 'earth'];
  const visited = new Set<ElementType>();
  
  let current: ElementType = 'water';
  for (let i = 0; i < 5; i++) {
    visited.add(current);
    current = getElementCounters(current);
  }
  
  // Should visit all 5 elements and loop back
  return visited.size === 5 && current === 'water';
}

/**
 * Get element system test data
 */
export function getElementSystemTestData() {
  const allElements = Object.values(elements);
  
  return {
    isValid: validateElementCounters(),
    elements: allElements.length,
    counterChain: ['water', 'fire', 'metal', 'wood', 'earth', 'water'].map(
      e => `${getElementEmoji(e as ElementType)} ${e}`
    ),
    damageExamples: [
      {
        scenario: 'Water vs Fire (counter)',
        damage: calculateDamageWithElement(100, 'water', 'fire'),
        expected: 150,
      },
      {
        scenario: 'Fire vs Water (weak)',
        damage: calculateDamageWithElement(100, 'fire', 'water'),
        expected: 75,
      },
      {
        scenario: 'Fire vs Wood (neutral)',
        damage: calculateDamageWithElement(100, 'fire', 'wood'),
        expected: 100,
      },
    ],
  };
}

// Export validation result
export const ELEMENT_SYSTEM_VALID = validateElementCounters();
