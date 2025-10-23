/**
 * MVP 2: Battle Pass System
 * 50-level progression with Free and Premium tracks
 * Season-based (30 days per season)
 * XP from combat, quests, daily tasks
 */

import { BattlePassProgress, BattlePassReward, Hero, Pet, Resource } from './types';

// Constants
export const MAX_LEVEL = 50;
export const SEASON_DURATION_DAYS = 30;
export const XP_PER_LEVEL_BASE = 1000;
export const XP_MULTIPLIER_PER_LEVEL = 1.1;

// XP Sources
export const XP_REWARDS = {
  combat: {
    easyWin: 50,
    mediumWin: 100,
    hardWin: 200,
    defeat: 10,
  },
  daily: {
    login: 100,
    firstCombat: 50,
    threeWins: 150,
    provinceUpgrade: 75,
  },
  quests: {
    easy: 200,
    medium: 500,
    hard: 1000,
    legendary: 2000,
  },
  milestones: {
    level10: 500,
    level25: 1000,
    level40: 1500,
    level50: 3000,
  },
};

// Battle Pass Rewards (50 levels)
export const battlePassRewards: BattlePassReward[] = [
  // Level 1-10: Early rewards
  {
    level: 1,
    freeReward: {
      type: 'resource',
      value: { gold: 500, rice: 300 },
    },
    premiumReward: {
      type: 'resource',
      value: { gold: 1000, rice: 600, gems: 50 },
    },
  },
  {
    level: 2,
    freeReward: {
      type: 'resource',
      value: { lumber: 200, stone: 150 },
    },
    premiumReward: {
      type: 'resource',
      value: { lumber: 400, stone: 300, gems: 50 },
    },
  },
  {
    level: 3,
    freeReward: {
      type: 'resource',
      value: { gold: 600, culture: 100 },
    },
    premiumReward: {
      type: 'pet',
      value: 'golden-fish', // Rare pet
    },
  },
  {
    level: 4,
    freeReward: {
      type: 'resource',
      value: { rice: 500, lumber: 300 },
    },
    premiumReward: {
      type: 'resource',
      value: { gold: 1500, rice: 1000, gems: 75 },
    },
  },
  {
    level: 5,
    freeReward: {
      type: 'resource',
      value: { gold: 800, stone: 200 },
    },
    premiumReward: {
      type: 'resource',
      value: { gold: 2000, gems: 100 },
    },
  },
  {
    level: 6,
    freeReward: {
      type: 'resource',
      value: { culture: 150, gold: 700 },
    },
    premiumReward: {
      type: 'pet',
      value: 'buffalo', // Rare pet
    },
  },
  {
    level: 7,
    freeReward: {
      type: 'resource',
      value: { gold: 1000, rice: 600 },
    },
    premiumReward: {
      type: 'resource',
      value: { gold: 2500, rice: 1500, gems: 100 },
    },
  },
  {
    level: 8,
    freeReward: {
      type: 'resource',
      value: { lumber: 400, stone: 300 },
    },
    premiumReward: {
      type: 'resource',
      value: { lumber: 800, stone: 600, gems: 75 },
    },
  },
  {
    level: 9,
    freeReward: {
      type: 'resource',
      value: { gold: 1200, culture: 200 },
    },
    premiumReward: {
      type: 'pet',
      value: 'crane', // Rare pet
    },
  },
  {
    level: 10,
    freeReward: {
      type: 'resource',
      value: { gold: 1500, gems: 50 },
    },
    premiumReward: {
      type: 'pet',
      value: 'turtle', // Epic pet - MILESTONE
    },
  },

  // Level 11-20: Mid-tier rewards
  {
    level: 11,
    freeReward: {
      type: 'resource',
      value: { rice: 800, lumber: 500 },
    },
    premiumReward: {
      type: 'resource',
      value: { gold: 3000, rice: 1500, gems: 125 },
    },
  },
  {
    level: 12,
    freeReward: {
      type: 'resource',
      value: { gold: 1600, stone: 400 },
    },
    premiumReward: {
      type: 'resource',
      value: { gold: 3500, stone: 800, gems: 100 },
    },
  },
  {
    level: 13,
    freeReward: {
      type: 'resource',
      value: { culture: 250, gold: 1400 },
    },
    premiumReward: {
      type: 'resource',
      value: { culture: 500, gold: 3000, gems: 150 },
    },
  },
  {
    level: 14,
    freeReward: {
      type: 'resource',
      value: { gold: 1800, rice: 1000 },
    },
    premiumReward: {
      type: 'resource',
      value: { gold: 4000, rice: 2000, gems: 125 },
    },
  },
  {
    level: 15,
    freeReward: {
      type: 'resource',
      value: { lumber: 600, stone: 500 },
    },
    premiumReward: {
      type: 'pet',
      value: 'qilin', // Epic pet
    },
  },
  {
    level: 16,
    freeReward: {
      type: 'resource',
      value: { gold: 2000, culture: 300 },
    },
    premiumReward: {
      type: 'resource',
      value: { gold: 4500, culture: 600, gems: 150 },
    },
  },
  {
    level: 17,
    freeReward: {
      type: 'resource',
      value: { rice: 1200, lumber: 700 },
    },
    premiumReward: {
      type: 'resource',
      value: { rice: 2500, lumber: 1400, gems: 175 },
    },
  },
  {
    level: 18,
    freeReward: {
      type: 'resource',
      value: { gold: 2200, stone: 600 },
    },
    premiumReward: {
      type: 'resource',
      value: { gold: 5000, stone: 1200, gems: 150 },
    },
  },
  {
    level: 19,
    freeReward: {
      type: 'resource',
      value: { culture: 350, gold: 2000 },
    },
    premiumReward: {
      type: 'resource',
      value: { culture: 700, gold: 4500, gems: 200 },
    },
  },
  {
    level: 20,
    freeReward: {
      type: 'resource',
      value: { gold: 2500, gems: 75 },
    },
    premiumReward: {
      type: 'pet',
      value: 'tiger', // Epic pet - MILESTONE
    },
  },

  // Level 21-30: High-tier rewards
  {
    level: 21,
    freeReward: {
      type: 'resource',
      value: { gold: 2600, rice: 1400 },
    },
    premiumReward: {
      type: 'resource',
      value: { gold: 5500, rice: 2800, gems: 200 },
    },
  },
  {
    level: 22,
    freeReward: {
      type: 'resource',
      value: { lumber: 800, stone: 700 },
    },
    premiumReward: {
      type: 'resource',
      value: { lumber: 1600, stone: 1400, gems: 175 },
    },
  },
  {
    level: 23,
    freeReward: {
      type: 'resource',
      value: { gold: 2800, culture: 400 },
    },
    premiumReward: {
      type: 'resource',
      value: { gold: 6000, culture: 800, gems: 225 },
    },
  },
  {
    level: 24,
    freeReward: {
      type: 'resource',
      value: { rice: 1600, lumber: 900 },
    },
    premiumReward: {
      type: 'resource',
      value: { rice: 3200, lumber: 1800, gems: 200 },
    },
  },
  {
    level: 25,
    freeReward: {
      type: 'resource',
      value: { gold: 3000, gems: 100 },
    },
    premiumReward: {
      type: 'hero',
      value: 'lac-long-quan', // Legendary hero - MILESTONE
    },
  },
  {
    level: 26,
    freeReward: {
      type: 'resource',
      value: { gold: 3200, stone: 800 },
    },
    premiumReward: {
      type: 'resource',
      value: { gold: 6500, stone: 1600, gems: 225 },
    },
  },
  {
    level: 27,
    freeReward: {
      type: 'resource',
      value: { culture: 450, gold: 2800 },
    },
    premiumReward: {
      type: 'resource',
      value: { culture: 900, gold: 5500, gems: 250 },
    },
  },
  {
    level: 28,
    freeReward: {
      type: 'resource',
      value: { rice: 1800, lumber: 1000 },
    },
    premiumReward: {
      type: 'resource',
      value: { rice: 3600, lumber: 2000, gems: 225 },
    },
  },
  {
    level: 29,
    freeReward: {
      type: 'resource',
      value: { gold: 3400, culture: 500 },
    },
    premiumReward: {
      type: 'resource',
      value: { gold: 7000, culture: 1000, gems: 275 },
    },
  },
  {
    level: 30,
    freeReward: {
      type: 'hero',
      value: 'hai-ba-trung', // Legendary hero - MILESTONE
    },
    premiumReward: {
      type: 'pet',
      value: 'phoenix', // Legendary pet - MILESTONE
    },
  },

  // Level 31-40: Elite rewards
  {
    level: 31,
    freeReward: {
      type: 'resource',
      value: { gold: 3600, rice: 2000 },
    },
    premiumReward: {
      type: 'resource',
      value: { gold: 7500, rice: 4000, gems: 275 },
    },
  },
  {
    level: 32,
    freeReward: {
      type: 'resource',
      value: { lumber: 1100, stone: 900 },
    },
    premiumReward: {
      type: 'resource',
      value: { lumber: 2200, stone: 1800, gems: 250 },
    },
  },
  {
    level: 33,
    freeReward: {
      type: 'resource',
      value: { gold: 3800, culture: 550 },
    },
    premiumReward: {
      type: 'resource',
      value: { gold: 8000, culture: 1100, gems: 300 },
    },
  },
  {
    level: 34,
    freeReward: {
      type: 'resource',
      value: { rice: 2200, lumber: 1200 },
    },
    premiumReward: {
      type: 'resource',
      value: { rice: 4400, lumber: 2400, gems: 275 },
    },
  },
  {
    level: 35,
    freeReward: {
      type: 'resource',
      value: { gold: 4000, gems: 125 },
    },
    premiumReward: {
      type: 'hero',
      value: 'son-tinh', // Legendary hero
    },
  },
  {
    level: 36,
    freeReward: {
      type: 'resource',
      value: { gold: 4200, stone: 1000 },
    },
    premiumReward: {
      type: 'resource',
      value: { gold: 8500, stone: 2000, gems: 300 },
    },
  },
  {
    level: 37,
    freeReward: {
      type: 'resource',
      value: { culture: 600, gold: 3800 },
    },
    premiumReward: {
      type: 'resource',
      value: { culture: 1200, gold: 7500, gems: 325 },
    },
  },
  {
    level: 38,
    freeReward: {
      type: 'resource',
      value: { rice: 2400, lumber: 1300 },
    },
    premiumReward: {
      type: 'resource',
      value: { rice: 4800, lumber: 2600, gems: 300 },
    },
  },
  {
    level: 39,
    freeReward: {
      type: 'resource',
      value: { gold: 4400, culture: 650 },
    },
    premiumReward: {
      type: 'resource',
      value: { gold: 9000, culture: 1300, gems: 350 },
    },
  },
  {
    level: 40,
    freeReward: {
      type: 'resource',
      value: { gold: 4500, gems: 150 },
    },
    premiumReward: {
      type: 'pet',
      value: 'dragon', // Legendary pet - MILESTONE (if not owned)
    },
  },

  // Level 41-50: Ultimate rewards
  {
    level: 41,
    freeReward: {
      type: 'resource',
      value: { gold: 4600, rice: 2600 },
    },
    premiumReward: {
      type: 'resource',
      value: { gold: 9500, rice: 5200, gems: 350 },
    },
  },
  {
    level: 42,
    freeReward: {
      type: 'resource',
      value: { lumber: 1400, stone: 1100 },
    },
    premiumReward: {
      type: 'resource',
      value: { lumber: 2800, stone: 2200, gems: 325 },
    },
  },
  {
    level: 43,
    freeReward: {
      type: 'resource',
      value: { gold: 4800, culture: 700 },
    },
    premiumReward: {
      type: 'resource',
      value: { gold: 10000, culture: 1400, gems: 375 },
    },
  },
  {
    level: 44,
    freeReward: {
      type: 'resource',
      value: { rice: 2800, lumber: 1500 },
    },
    premiumReward: {
      type: 'resource',
      value: { rice: 5600, lumber: 3000, gems: 350 },
    },
  },
  {
    level: 45,
    freeReward: {
      type: 'resource',
      value: { gold: 5000, gems: 175 },
    },
    premiumReward: {
      type: 'hero',
      value: 'ly-thuong-kiet', // Legendary hero
    },
  },
  {
    level: 46,
    freeReward: {
      type: 'resource',
      value: { gold: 5200, stone: 1200 },
    },
    premiumReward: {
      type: 'resource',
      value: { gold: 11000, stone: 2400, gems: 375 },
    },
  },
  {
    level: 47,
    freeReward: {
      type: 'resource',
      value: { culture: 750, gold: 4800 },
    },
    premiumReward: {
      type: 'resource',
      value: { culture: 1500, gold: 9500, gems: 400 },
    },
  },
  {
    level: 48,
    freeReward: {
      type: 'resource',
      value: { rice: 3000, lumber: 1600 },
    },
    premiumReward: {
      type: 'resource',
      value: { rice: 6000, lumber: 3200, gems: 375 },
    },
  },
  {
    level: 49,
    freeReward: {
      type: 'resource',
      value: { gold: 5400, culture: 800 },
    },
    premiumReward: {
      type: 'resource',
      value: { gold: 11500, culture: 1600, gems: 425 },
    },
  },
  {
    level: 50,
    freeReward: {
      type: 'resource',
      value: { gold: 10000, gems: 500 },
    },
    premiumReward: {
      type: 'resource',
      value: { gold: 25000, gems: 2000 }, // ULTIMATE MILESTONE
    },
  },
];

// Calculate XP required for a specific level
export function calculateXPForLevel(level: number): number {
  if (level <= 1) return 0;
  let totalXP = 0;
  for (let i = 1; i < level; i++) {
    totalXP += Math.floor(XP_PER_LEVEL_BASE * Math.pow(XP_MULTIPLIER_PER_LEVEL, i - 1));
  }
  return totalXP;
}

// Calculate current level from total XP
export function calculateLevelFromXP(totalXP: number): number {
  let level = 1;
  let xpForNextLevel = calculateXPForLevel(2);
  
  while (totalXP >= xpForNextLevel && level < MAX_LEVEL) {
    level++;
    xpForNextLevel = calculateXPForLevel(level + 1);
  }
  
  return level;
}

// Get XP needed for next level
export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= MAX_LEVEL) return 0;
  return Math.floor(XP_PER_LEVEL_BASE * Math.pow(XP_MULTIPLIER_PER_LEVEL, currentLevel - 1));
}

// Get current level progress (0-100%)
export function getLevelProgress(totalXP: number): number {
  const currentLevel = calculateLevelFromXP(totalXP);
  if (currentLevel >= MAX_LEVEL) return 100;
  
  const xpForCurrentLevel = calculateXPForLevel(currentLevel);
  const xpForNextLevel = calculateXPForLevel(currentLevel + 1);
  const xpIntoCurrentLevel = totalXP - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  
  return Math.floor((xpIntoCurrentLevel / xpNeededForLevel) * 100);
}

// Initialize new season
export function initializeSeason(seasonNumber: number): BattlePassProgress {
  const now = Date.now();
  const seasonEnd = now + (SEASON_DURATION_DAYS * 24 * 60 * 60 * 1000);
  
  return {
    currentLevel: 1,
    totalXP: 0,
    isPremium: false,
    claimedRewards: {
      free: [],
      premium: [],
    },
    seasonNumber,
    seasonStartDate: now,
    seasonEndDate: seasonEnd,
  };
}

// Check if season is active
export function isSeasonActive(battlePass: BattlePassProgress): boolean {
  return Date.now() < battlePass.seasonEndDate;
}

// Get days remaining in season
export function getDaysRemaining(battlePass: BattlePassProgress): number {
  const msRemaining = battlePass.seasonEndDate - Date.now();
  return Math.max(0, Math.ceil(msRemaining / (24 * 60 * 60 * 1000)));
}

// Add XP to battle pass
export function addXP(battlePass: BattlePassProgress, xpAmount: number): BattlePassProgress {
  const newTotalXP = battlePass.totalXP + xpAmount;
  const newLevel = calculateLevelFromXP(newTotalXP);
  
  return {
    ...battlePass,
    totalXP: newTotalXP,
    currentLevel: Math.min(newLevel, MAX_LEVEL),
  };
}

// Claim reward for a level
export function claimReward(
  battlePass: BattlePassProgress,
  level: number,
  trackType: 'free' | 'premium'
): { success: boolean; reward?: any; message: string } {
  // Validate level
  if (level < 1 || level > MAX_LEVEL) {
    return { success: false, message: 'Invalid level' };
  }
  
  // Check if level is reached
  if (battlePass.currentLevel < level) {
    return { success: false, message: 'Level not reached yet' };
  }
  
  // Check if premium track requires premium pass
  if (trackType === 'premium' && !battlePass.isPremium) {
    return { success: false, message: 'Premium Battle Pass required' };
  }
  
  // Check if already claimed
  const claimedArray = trackType === 'free' 
    ? battlePass.claimedRewards.free 
    : battlePass.claimedRewards.premium;
    
  if (claimedArray.includes(level)) {
    return { success: false, message: 'Reward already claimed' };
  }
  
  // Get reward
  const rewardData = battlePassRewards.find(r => r.level === level);
  if (!rewardData) {
    return { success: false, message: 'Reward not found' };
  }
  
  const reward = trackType === 'free' ? rewardData.freeReward : rewardData.premiumReward;
  
  return {
    success: true,
    reward,
    message: 'Reward claimed successfully',
  };
}

// Get all available rewards to claim
export function getAvailableRewards(battlePass: BattlePassProgress): {
  free: number[];
  premium: number[];
} {
  const freeRewards: number[] = [];
  const premiumRewards: number[] = [];
  
  for (let level = 1; level <= battlePass.currentLevel; level++) {
    if (!battlePass.claimedRewards.free.includes(level)) {
      freeRewards.push(level);
    }
    
    if (battlePass.isPremium && !battlePass.claimedRewards.premium.includes(level)) {
      premiumRewards.push(level);
    }
  }
  
  return { free: freeRewards, premium: premiumRewards };
}

// Upgrade to premium
export function upgradeToPremium(battlePass: BattlePassProgress): BattlePassProgress {
  return {
    ...battlePass,
    isPremium: true,
  };
}

// Get milestone levels (every 10 levels)
export function getMilestoneLevels(): number[] {
  return [10, 20, 30, 40, 50];
}

// Check if level is a milestone
export function isMilestone(level: number): boolean {
  return getMilestoneLevels().includes(level);
}

// Get reward preview for a level
export function getRewardPreview(level: number, trackType: 'free' | 'premium'): any {
  const rewardData = battlePassRewards.find(r => r.level === level);
  if (!rewardData) return null;
  
  return trackType === 'free' ? rewardData.freeReward : rewardData.premiumReward;
}

// Calculate total rewards if claimed all
export function calculateTotalRewards(
  endLevel: number,
  isPremium: boolean
): { resources: Resource; heroes: string[]; pets: string[] } {
  const resources: Resource = {
    gold: 0,
    rice: 0,
    lumber: 0,
    stone: 0,
    culture: 0,
    gems: 0,
  };
  const heroes: string[] = [];
  const pets: string[] = [];
  
  for (let level = 1; level <= endLevel; level++) {
    const rewardData = battlePassRewards.find(r => r.level === level);
    if (!rewardData) continue;
    
    // Free rewards
    const freeReward = rewardData.freeReward;
    if (freeReward.type === 'resource' && freeReward.value) {
      Object.entries(freeReward.value).forEach(([key, value]) => {
        resources[key as keyof Resource] = (resources[key as keyof Resource] || 0) + (value as number);
      });
    } else if (freeReward.type === 'hero') {
      heroes.push(freeReward.value as string);
    } else if (freeReward.type === 'pet') {
      pets.push(freeReward.value as string);
    }
    
    // Premium rewards
    if (isPremium && rewardData.premiumReward) {
      const premiumReward = rewardData.premiumReward;
      if (premiumReward.type === 'resource' && premiumReward.value) {
        Object.entries(premiumReward.value).forEach(([key, value]) => {
          resources[key as keyof Resource] = (resources[key as keyof Resource] || 0) + (value as number);
        });
      } else if (premiumReward.type === 'hero') {
        heroes.push(premiumReward.value as string);
      } else if (premiumReward.type === 'pet') {
        pets.push(premiumReward.value as string);
      }
    }
  }
  
  return { resources, heroes, pets };
}

// Helper: Format XP for display
export function formatXP(xp: number): string {
  if (xp >= 1000000) {
    return `${(xp / 1000000).toFixed(1)}M`;
  } else if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`;
  }
  return xp.toString();
}

// Helper: Format time remaining
export function formatTimeRemaining(battlePass: BattlePassProgress): string {
  const days = getDaysRemaining(battlePass);
  if (days === 0) return 'Season ending soon!';
  if (days === 1) return '1 day remaining';
  return `${days} days remaining`;
}
