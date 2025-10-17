// Game Types cho MVP 1
export interface Resource {
  gold: number;
  rice: number;
  lumber: number;
  stone: number;
  culture: number; // Điểm văn hóa
}

export interface Province {
  id: string;
  name: string;
  displayName: string;
  description: string;
  unlocked: boolean;
  level: number;
  maxLevel: number;
  resources: Resource;
  resourcesPerSecond: Resource;
  specialties: string[];
  culturalBonus: string;
  farmers: Farmer[];
  buildings: Building[];
}

export interface Farmer {
  id: string;
  name: string;
  type: 'manual' | 'auto';
  level: number;
  efficiency: number;
  cost: Resource;
  assignedResource: keyof Resource | null;
  isWorking: boolean;
}

export interface Building {
  id: string;
  name: string;
  type: string;
  level: number;
  maxLevel: number;
  cost: Resource;
  production: Resource;
  unlocked: boolean;
}

export interface Player {
  id: string;
  name: string;
  level: number;
  experience: number;
  totalResources: Resource;
  unlockedProvinces: string[];
  premiumPass: PremiumPass | null;
  achievements: Achievement[];
}

export interface PremiumPass {
  id: string;
  type: 'basic' | 'premium' | 'royal';
  name: string;
  price: number;
  benefits: string[];
  duration: number; // days
  purchaseDate: Date;
  active: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rewards: Resource;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export interface GameState {
  player: Player;
  provinces: Province[];
  gameSpeed: number;
  lastUpdateTime: number;
  tutorial: {
    completed: boolean;
    currentStep: number;
  };
}