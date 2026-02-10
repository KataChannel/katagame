/**
 * Resource Checker Utility
 * Checks if player has enough resources for actions
 */

export interface ResourceRequirement {
  gold?: number;
  rice?: number;
  lumber?: number;
  stone?: number;
  bazan?: number;
  gems?: number;
  culture?: number;
}

export interface ResourceCheckResult {
  canAfford: boolean;
  missingResources: Array<{
    resource: string;
    required: number;
    available: number;
    deficit: number;
  }>;
}

/**
 * Check if player has enough resources
 */
export function checkResourceAvailability(
  playerResources: ResourceRequirement,
  requiredResources: ResourceRequirement
): ResourceCheckResult {
  const missingResources: ResourceCheckResult['missingResources'] = [];
  
  // Check each resource type
  const resourceTypes: (keyof ResourceRequirement)[] = [
    'gold', 'rice', 'lumber', 'stone', 'bazan', 'gems', 'culture'
  ];
  
  for (const resourceType of resourceTypes) {
    const required = requiredResources[resourceType] || 0;
    const available = playerResources[resourceType] || 0;
    
    if (required > 0 && available < required) {
      missingResources.push({
        resource: resourceType,
        required,
        available,
        deficit: required - available,
      });
    }
  }
  
  return {
    canAfford: missingResources.length === 0,
    missingResources,
  };
}

/**
 * Calculate upgrade costs for province
 * Based on backend logic in province.service.ts
 */
export function calculateUpgradeCosts(currentLevel: number, upgradeType: 'farmer' | 'resource' | 'development'): ResourceRequirement {
  switch (upgradeType) {
    case 'farmer':
      return {
        gold: 500 * currentLevel,
        rice: 300 * currentLevel,
      };
    
    case 'resource':
      return {
        gold: 800 * currentLevel,
        lumber: 400 * currentLevel,
      };
    
    case 'development':
      return {
        gold: 1000 * currentLevel,
        rice: 500 * currentLevel,
        lumber: 300 * currentLevel,
        stone: 200 * currentLevel,
      };
    
    default:
      return {};
  }
}

/**
 * Calculate hero level up cost
 * Based on backend logic in hero.service.ts
 */
export function calculateHeroLevelUpCost(currentLevel: number): ResourceRequirement {
  const baseCost = 150;
  const multiplier = 2;
  const cost = Math.floor(baseCost * Math.pow(multiplier, currentLevel - 1));

  return {
    gold: cost,
    rice: Math.floor(cost * 1.2),
    lumber: Math.floor(cost * 0.6),
    stone: Math.floor(cost * 0.4),
    bazan: Math.floor(cost * 0.5),
  };
}

/**
 * Format resource name in Vietnamese
 */
export function getResourceNameVN(resourceKey: string): string {
  const names: Record<string, string> = {
    gold: 'Vàng',
    rice: 'Lúa',
    lumber: 'Gỗ',
    stone: 'Đá',
    bazan: 'Đất Đỏ Bazan',
    gems: 'Kim Cương',
    culture: 'Văn hóa',
  };
  return names[resourceKey] || resourceKey;
}

/**
 * Format resource with icon
 */
export function formatResourceWithIcon(resourceKey: string, amount: number): string {
  const icons: Record<string, string> = {
    gold: '💰',
    rice: '🌾',
    lumber: '🪵',
    stone: '🪨',
    bazan: '💎',
    gems: '💎',
    culture: '🏛️',
  };
  
  const icon = icons[resourceKey] || '📦';
  return `${icon} ${amount}`;
}
