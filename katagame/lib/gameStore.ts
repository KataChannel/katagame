import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Resource, Province, Farmer, Player, GameState, PremiumPass, Achievement } from './types';
import { v4 as uuidv4 } from 'uuid';
import { SoundManager } from './soundManager';

// Helper functions
const createEmptyResource = (): Resource => ({
  gold: 0,
  rice: 0,
  lumber: 0,
  stone: 0,
  culture: 0,
});

const addResources = (a: Resource, b: Resource): Resource => ({
  gold: a.gold + b.gold,
  rice: a.rice + b.rice,
  lumber: a.lumber + b.lumber,
  stone: a.stone + b.stone,
  culture: a.culture + b.culture,
});

const subtractResources = (a: Resource, b: Resource): Resource => ({
  gold: a.gold - b.gold,
  rice: a.rice - b.rice,
  lumber: a.lumber - b.lumber,
  stone: a.stone - b.stone,
  culture: a.culture - b.culture,
});

const canAfford = (available: Resource, cost: Resource): boolean => {
  return available.gold >= cost.gold &&
         available.rice >= cost.rice &&
         available.lumber >= cost.lumber &&
         available.stone >= cost.stone &&
         available.culture >= cost.culture;
};

// Initial game data cho MVP 1
const initialProvinces: Province[] = [
  {
    id: 'hanoi',
    name: 'hanoi',
    displayName: 'Hà Nội',
    description: 'Thủ đô ngàn năm văn hiến, trung tâm chính trị và văn hóa',
    unlocked: true,
    level: 1,
    maxLevel: 10,
    resources: createEmptyResource(),
    resourcesPerSecond: { gold: 2, rice: 1.5, lumber: 1, stone: 0.5, culture: 1.2 },
    specialties: ['Văn hóa', 'Giáo dục', 'Thủ công mỹ nghệ'],
    culturalBonus: 'Bonus +20% Culture generation',
    farmers: [],
    buildings: [],
  },
  {
    id: 'nghean',
    name: 'nghean',
    displayName: 'Nghệ An',
    description: 'Quê hương Bác Hồ, vùng đất anh hùng',
    unlocked: false,
    level: 0,
    maxLevel: 10,
    resources: createEmptyResource(),
    resourcesPerSecond: { gold: 1.5, rice: 2.5, lumber: 1.2, stone: 0.8, culture: 1.5 },
    specialties: ['Nông nghiệp', 'Cách mạng', 'Văn học'],
    culturalBonus: 'Bonus +30% Rice production',
    farmers: [],
    buildings: [],
  },
  {
    id: 'quangninh',
    name: 'quangninh',
    displayName: 'Quảng Ninh',
    description: 'Vịnh Hạ Long kỳ quan thế giới, mỏ than phong phú',
    unlocked: false,
    level: 0,
    maxLevel: 10,
    resources: createEmptyResource(),
    resourcesPerSecond: { gold: 3, rice: 0.8, lumber: 0.5, stone: 2, culture: 1 },
    specialties: ['Khai mỏ', 'Du lịch', 'Hải sản'],
    culturalBonus: 'Bonus +25% Gold and Stone production',
    farmers: [],
    buildings: [],
  },
];

const initialPlayer: Player = {
  id: uuidv4(),
  name: 'Người chơi',
  level: 1,
  experience: 0,
  totalResources: { gold: 200, rice: 100, lumber: 50, stone: 30, culture: 20 },
  unlockedProvinces: ['hanoi'],
  premiumPass: null,
  achievements: [],
};

interface GameStore extends GameState {
  // Actions
  clickFarm: (provinceId: string, resourceType: keyof Resource) => void;
  buyFarmer: (provinceId: string, farmerType: 'manual' | 'auto') => void;
  upgradeFarmer: (provinceId: string, farmerId: string) => void;
  unlockProvince: (provinceId: string) => void;
  upgradeProvince: (provinceId: string) => void;
  purchasePremiumPass: (passType: 'basic' | 'premium' | 'royal') => void;
  updateResources: () => void;
  setGameSpeed: (speed: number) => void;
  completeAchievement: (achievementId: string) => void;
  addExperience: (amount: number) => void;
  startTutorial: () => void;
  nextTutorialStep: () => void;
  completeTutorial: () => void;
  // Notifications
  notifications: Array<{id: string, type: string, title: string, message: string}>;
  addNotification: (notification: {type: string, title: string, message: string}) => void;
  removeNotification: (id: string) => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      player: initialPlayer,
      provinces: initialProvinces,
      gameSpeed: 1,
      lastUpdateTime: Date.now(),
      tutorial: {
        completed: false,
        currentStep: 0,
      },
      notifications: [],

      addNotification: (notification) => {
        const id = Date.now().toString();
        set((state) => ({
          notifications: [...state.notifications, { ...notification, id }],
        }));
        // Auto remove after 4 seconds
        setTimeout(() => {
          get().removeNotification(id);
        }, 4000);
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id),
        }));
      },

      clickFarm: (provinceId, resourceType) => {
        const state = get();
        const province = state.provinces.find(p => p.id === provinceId);
        if (!province || !province.unlocked) return;

        const baseAmount = Math.floor(Math.random() * 5) + 2; // 2-6 resources per click
        const clickAmount = {
          ...createEmptyResource(),
          [resourceType]: baseAmount * province.level,
        };

        set((state) => ({
          player: {
            ...state.player,
            totalResources: addResources(state.player.totalResources, clickAmount),
          },
          provinces: state.provinces.map(p =>
            p.id === provinceId
              ? { ...p, resources: addResources(p.resources, clickAmount) }
              : p
          ),
        }));

        // Add experience
        get().addExperience(1);
        
        // Play sound and show notification
        SoundManager.getInstance().playSound('click');
        if (Math.random() < 0.1) { // 10% chance for bonus notification
          get().addNotification({
            type: 'success',
            title: 'Bonus!',
            message: `Thu thập được ${baseAmount} ${resourceType} từ ${province.displayName}!`
          });
        }
      },

      buyFarmer: (provinceId, farmerType) => {
        const state = get();
        const province = state.provinces.find(p => p.id === provinceId);
        if (!province) return;

        const farmerCost: Resource = farmerType === 'auto'
          ? { gold: 30, rice: 15, lumber: 8, stone: 3, culture: 3 }
          : { gold: 10, rice: 5, lumber: 3, stone: 2, culture: 1 };

        if (!canAfford(state.player.totalResources, farmerCost)) return;

        const newFarmer: Farmer = {
          id: uuidv4(),
          name: farmerType === 'auto' ? 'Nông dân tự động' : 'Nông dân thủ công',
          type: farmerType,
          level: 1,
          efficiency: farmerType === 'auto' ? 2 : 1,
          cost: farmerCost,
          assignedResource: 'rice',
          isWorking: true,
        };

        set((state) => ({
          player: {
            ...state.player,
            totalResources: subtractResources(state.player.totalResources, farmerCost),
          },
          provinces: state.provinces.map(p =>
            p.id === provinceId
              ? { ...p, farmers: [...p.farmers, newFarmer] }
              : p
          ),
        }));
        
        // Play sound and show notification
        SoundManager.getInstance().playSound('purchase');
        get().addNotification({
          type: 'success',
          title: 'Thuê Nông Dân Thành Công!',
          message: `Đã thuê ${newFarmer.name} cho ${province.displayName}`
        });
      },

      upgradeFarmer: (provinceId, farmerId) => {
        const state = get();
        const province = state.provinces.find(p => p.id === provinceId);
        const farmer = province?.farmers.find(f => f.id === farmerId);
        if (!province || !farmer) return;

        const upgradeCost: Resource = {
          gold: farmer.level * 25,
          rice: farmer.level * 10,
          lumber: farmer.level * 5,
          stone: farmer.level * 3,
          culture: farmer.level * 2,
        };

        if (!canAfford(state.player.totalResources, upgradeCost)) return;

        set((state) => ({
          player: {
            ...state.player,
            totalResources: subtractResources(state.player.totalResources, upgradeCost),
          },
          provinces: state.provinces.map(p =>
            p.id === provinceId
              ? {
                  ...p,
                  farmers: p.farmers.map(f =>
                    f.id === farmerId
                      ? { ...f, level: f.level + 1, efficiency: f.efficiency * 1.2 }
                      : f
                  ),
                }
              : p
          ),
        }));
        
        SoundManager.getInstance().playSound('upgrade');
        get().addNotification({
          type: 'success',
          title: 'Nâng Cấp Thành Công!',
          message: `Nông dân đã lên cấp ${farmer.level + 1}`
        });
      },

      unlockProvince: (provinceId) => {
        const state = get();
        const province = state.provinces.find(p => p.id === provinceId);
        if (!province || province.unlocked) return;

        const unlockCost: Resource = { gold: 150, rice: 75, lumber: 35, stone: 20, culture: 30 };

        if (!canAfford(state.player.totalResources, unlockCost)) return;

        set((state) => ({
          player: {
            ...state.player,
            totalResources: subtractResources(state.player.totalResources, unlockCost),
            unlockedProvinces: [...state.player.unlockedProvinces, provinceId],
          },
          provinces: state.provinces.map(p =>
            p.id === provinceId ? { ...p, unlocked: true, level: 1 } : p
          ),
        }));

        get().addExperience(50);
        
        SoundManager.getInstance().playSound('unlock');
        get().addNotification({
          type: 'reward',
          title: '🎆 Mở Khóa Tỉnh Mới!',
          message: `Chào mừng đến với ${province.displayName}! +50 EXP`
        });
      },

      upgradeProvince: (provinceId) => {
        const state = get();
        const province = state.provinces.find(p => p.id === provinceId);
        if (!province || !province.unlocked || province.level >= province.maxLevel) return;

        const upgradeCost: Resource = {
          gold: province.level * 100,
          rice: province.level * 50,
          lumber: province.level * 25,
          stone: province.level * 15,
          culture: province.level * 20,
        };

        if (!canAfford(state.player.totalResources, upgradeCost)) return;

        set((state) => ({
          player: {
            ...state.player,
            totalResources: subtractResources(state.player.totalResources, upgradeCost),
          },
          provinces: state.provinces.map(p =>
            p.id === provinceId
              ? {
                  ...p,
                  level: p.level + 1,
                  resourcesPerSecond: {
                    gold: p.resourcesPerSecond.gold * 1.15,
                    rice: p.resourcesPerSecond.rice * 1.15,
                    lumber: p.resourcesPerSecond.lumber * 1.15,
                    stone: p.resourcesPerSecond.stone * 1.15,
                    culture: p.resourcesPerSecond.culture * 1.15,
                  },
                }
              : p
          ),
        }));

        get().addExperience(25);
        
        SoundManager.getInstance().playSound('upgrade');
        get().addNotification({
          type: 'success',
          title: 'Nâng Cấp Tỉnh!',
          message: `${province.displayName} lên cấp ${province.level + 1}! +25 EXP`
        });
      },

      purchasePremiumPass: (passType) => {
        const passPrices = { basic: 99000, premium: 299000, royal: 999000 };
        const passNames = { basic: 'Basic Pass', premium: 'Premium Pass', royal: 'Royal Pass' };
        const passBenefits = {
          basic: ['+50% resource generation', 'Daily rewards', 'Remove ads'],
          premium: ['+100% resource generation', 'Daily rewards', 'Exclusive farmers', 'Fast progress'],
          royal: ['+200% resource generation', 'VIP support', 'Exclusive content', 'Premium currency'],
        };

        const newPass: PremiumPass = {
          id: uuidv4(),
          type: passType,
          name: passNames[passType],
          price: passPrices[passType],
          benefits: passBenefits[passType],
          duration: 30,
          purchaseDate: new Date(),
          active: true,
        };

        set((state) => ({
          player: {
            ...state.player,
            premiumPass: newPass,
          },
        }));
        
        SoundManager.getInstance().playSound('purchase');
        get().addNotification({
          type: 'reward',
          title: '👑 Premium Pass Kích Hoạt!',
          message: `Chúc mừng! Bạn đã kích hoạt ${newPass.name}`
        });
      },

      updateResources: () => {
        const state = get();
        const currentTime = Date.now();
        const deltaTime = (currentTime - state.lastUpdateTime) / 1000; // seconds

        if (deltaTime < 1) return; // Update every second minimum

        const passMultiplier = state.player.premiumPass?.active
          ? (state.player.premiumPass.type === 'basic' ? 1.5 :
             state.player.premiumPass.type === 'premium' ? 2 : 3)
          : 1;

        set((state) => {
          const updatedProvinces = state.provinces.map(province => {
            if (!province.unlocked) return province;

            let totalProduction = { ...province.resourcesPerSecond };

            // Add farmer production
            province.farmers.forEach(farmer => {
              if (farmer.isWorking && farmer.assignedResource) {
                const production = farmer.efficiency * farmer.level * deltaTime;
                totalProduction[farmer.assignedResource] += production;
              }
            });

            // Apply multipliers
            Object.keys(totalProduction).forEach(key => {
              totalProduction[key as keyof Resource] *= passMultiplier * state.gameSpeed;
            });

            return {
              ...province,
              resources: addResources(province.resources, totalProduction),
            };
          });

          const totalResourceGain = updatedProvinces.reduce((total, province) => {
            return addResources(total, province.resources);
          }, createEmptyResource());

          return {
            ...state,
            provinces: updatedProvinces,
            player: {
              ...state.player,
              totalResources: addResources(state.player.totalResources, totalResourceGain),
            },
            lastUpdateTime: currentTime,
          };
        });
      },

      setGameSpeed: (speed) => set({ gameSpeed: speed }),

      completeAchievement: (achievementId) => {
        set((state) => ({
          player: {
            ...state.player,
            achievements: state.player.achievements.map(achievement =>
              achievement.id === achievementId
                ? { ...achievement, unlocked: true }
                : achievement
            ),
          },
        }));
      },

      addExperience: (amount) => {
        set((state) => {
          const newExp = state.player.experience + amount;
          const newLevel = Math.floor(newExp / 100) + 1;

          return {
            player: {
              ...state.player,
              experience: newExp,
              level: newLevel,
            },
          };
        });
      },

      startTutorial: () => set({ tutorial: { completed: false, currentStep: 0 } }),
      nextTutorialStep: () => set((state) => ({
        tutorial: { ...state.tutorial, currentStep: state.tutorial.currentStep + 1 }
      })),
      completeTutorial: () => set({ tutorial: { completed: true, currentStep: -1 } }),
    }),
    {
      name: 'katagame-store',
      version: 1,
    }
  )
);