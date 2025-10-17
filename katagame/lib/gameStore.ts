import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Resource, Province, Farmer, Player, GameState, PremiumPass, Achievement, Hero, Pet, CombatResult, BattlePassProgress } from './types';
import { v4 as uuidv4 } from 'uuid';
import { SoundManager } from './soundManager';
import { calculateTotalProduction, getProductionBonus } from './elementSystem';
import {
  initializeSeason,
  addXP,
  claimReward,
  getAvailableRewards,
  upgradeToPremium,
  isSeasonActive,
  getDaysRemaining,
} from './battlePassSystem';
import {
  initializeGachaState,
  performSinglePull,
  performTenPull,
  updateGachaStateAfterPull,
  isDailyFreePullAvailable,
  SINGLE_PULL_COST,
  TEN_PULL_COST,
  PullResult,
} from './gachaSystem';

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
  totalResources: { gold: 200, rice: 100, lumber: 50, stone: 30, culture: 20, gems: 1500 },
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
  // MVP 2: Hero & Pet Actions
  addHero: (hero: Hero) => void;
  upgradeHero: (heroId: string) => void;
  addPet: (pet: Pet) => void;
  equipPet: (petId: string, provinceId?: string) => void;
  recordCombat: (result: CombatResult) => void;
  // Notifications
  notifications: Array<{id: string, type: string, title: string, message: string}>;
  addNotification: (notification: {type: string, title: string, message: string}) => void;
  removeNotification: (id: string) => void;
  // Battle Pass System
  initializeBattlePass: (seasonNumber: number) => void;
  addBattlePassXP: (amount: number) => void;
  claimBattlePassReward: (level: number, trackType: 'free' | 'premium') => void;
  upgradeBattlePassPremium: () => void;
  // Gacha System
  initializeGacha: () => void;
  performGachaPull: () => PullResult | null;
  performGachaTenPull: () => PullResult[] | null;
  performDailyFreePull: () => PullResult | null;
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
      // MVP 2: New state
      heroes: [],
      pets: [],
      battlePass: undefined,
      combatHistory: [],
      gacha: undefined,
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

      // MVP 2: Hero Management
      addHero: (hero: Hero) => {
        set((state) => ({
          heroes: [...(state.heroes || []), hero],
        }));
        get().addNotification({
          type: 'success',
          title: 'Anh Hùng Mới!',
          message: `${hero.displayName} đã gia nhập đội ngũ của bạn!`,
        });
      },

      upgradeHero: (heroId: string) => {
        set((state) => ({
          heroes: (state.heroes || []).map(hero =>
            hero.id === heroId
              ? {
                  ...hero,
                  level: hero.level + 1,
                  stats: {
                    ...hero.stats,
                    maxHp: hero.stats.maxHp + 100,
                    hp: hero.stats.hp + 100,
                    attack: hero.stats.attack + 10,
                    defense: hero.stats.defense + 5,
                  },
                }
              : hero
          ),
        }));
      },

      // MVP 2: Pet Management
      addPet: (pet: Pet) => {
        set((state) => ({
          pets: [...(state.pets || []), pet],
        }));
        get().addNotification({
          type: 'success',
          title: 'Thú Cưng Mới!',
          message: `${pet.displayName} đã theo bạn!`,
        });
      },

      equipPet: (petId: string, provinceId?: string) => {
        set((state) => ({
          pets: (state.pets || []).map(pet =>
            pet.id === petId
              ? { ...pet, equipped: true, assignedProvince: provinceId }
              : pet
          ),
        }));
      },

      // MVP 2: Combat System
      recordCombat: (result: CombatResult) => {
        set((state) => ({
          combatHistory: [...(state.combatHistory || []), result],
        }));
        
        if (result.victory) {
          // Add rewards
          get().addNotification({
            type: 'success',
            title: 'Chiến Thắng!',
            message: `Đánh bại ${result.enemyType}. Nhận được phần thưởng!`,
          });
          
          // Add experience (50 XP per victory)
          get().addExperience(50);
          
          // Add battle pass XP based on enemy difficulty
          const battlePassXP = result.enemyType === 'boss' ? 200 :
                               result.enemyType === 'elite' ? 100 : 50;
          get().addBattlePassXP(battlePassXP);
          
          // Add rewards to player resources
          set((state) => ({
            player: {
              ...state.player,
              totalResources: addResources(state.player.totalResources, result.rewards),
            },
          }));
        }
      },

      // Battle Pass System
      initializeBattlePass: (seasonNumber: number) => {
        const newSeason = initializeSeason(seasonNumber);
        set({ battlePass: newSeason });
        get().addNotification({
          type: 'info',
          title: 'Mùa Battle Pass Mới!',
          message: `Mùa ${seasonNumber} đã bắt đầu! Hoàn thành thử thách để nhận phần thưởng!`,
        });
      },

      addBattlePassXP: (amount: number) => {
        const state = get();
        if (!state.battlePass) return;

        // Check if season is still active
        if (!isSeasonActive(state.battlePass)) {
          get().addNotification({
            type: 'warning',
            title: 'Mùa Đã Kết Thúc',
            message: 'Mùa Battle Pass hiện tại đã kết thúc. Chờ mùa mới!',
          });
          return;
        }

        const oldLevel = state.battlePass.currentLevel;
        const updatedBattlePass = addXP(state.battlePass, amount);
        const newLevel = updatedBattlePass.currentLevel;

        set({ battlePass: updatedBattlePass });

        // Notify XP gain
        get().addNotification({
          type: 'info',
          title: 'Battle Pass XP',
          message: `+${amount} XP nhận được!`,
        });

        // If leveled up, show special notification
        if (newLevel > oldLevel) {
          get().addNotification({
            type: 'success',
            title: 'Battle Pass Lên Cấp!',
            message: `Chúc mừng! Bạn đã đạt cấp ${newLevel}!`,
          });
        }
      },

      claimBattlePassReward: (level: number, trackType: 'free' | 'premium') => {
        const state = get();
        if (!state.battlePass) return;

        try {
          const result = claimReward(state.battlePass, level, trackType);
          
          if (!result.success) {
            get().addNotification({
              type: 'error',
              title: 'Không Thể Nhận Thưởng',
              message: result.message,
            });
            return;
          }

          // Update battle pass state
          set((state) => ({
            battlePass: {
              ...state.battlePass!,
              claimedRewards: {
                ...state.battlePass!.claimedRewards,
                [trackType]: [...state.battlePass!.claimedRewards[trackType], level],
              },
            },
          }));

          // Apply reward to player
          const reward = result.reward;
          if (reward && reward.type === 'resource' && reward.value) {
            set((state) => ({
              player: {
                ...state.player,
                totalResources: addResources(state.player.totalResources, reward.value as Resource),
              },
            }));
          } else if (reward && reward.type === 'hero' && typeof reward.value === 'string') {
            // Find hero by ID and add it
            // Note: This requires hero data - for now just show notification
            get().addNotification({
              type: 'success',
              title: 'Anh Hùng Mới!',
              message: `Nhận được anh hùng từ Battle Pass cấp ${level}!`,
            });
          } else if (reward && reward.type === 'pet' && typeof reward.value === 'string') {
            // Find pet by ID and add it
            // Note: This requires pet data - for now just show notification
            get().addNotification({
              type: 'success',
              title: 'Thú Cưng Mới!',
              message: `Nhận được thú cưng từ Battle Pass cấp ${level}!`,
            });
          }

          get().addNotification({
            type: 'success',
            title: 'Nhận Thưởng Thành Công!',
            message: `Đã nhận phần thưởng Battle Pass cấp ${level}!`,
          });
        } catch (error) {
          get().addNotification({
            type: 'error',
            title: 'Lỗi',
            message: error instanceof Error ? error.message : 'Không thể nhận thưởng',
          });
        }
      },

      upgradeBattlePassPremium: () => {
        const state = get();
        if (!state.battlePass) return;

        // Check if player has enough gems (1000 gems required)
        const gemsRequired = 1000;
        const currentGems = state.player.totalResources.gems || 0;

        if (currentGems < gemsRequired) {
          get().addNotification({
            type: 'error',
            title: 'Không Đủ Gems',
            message: `Cần ${gemsRequired} gems để mở khóa Premium. Bạn có ${currentGems} gems.`,
          });
          return;
        }

        // Deduct gems
        set((state) => ({
          player: {
            ...state.player,
            totalResources: {
              ...state.player.totalResources,
              gems: (state.player.totalResources.gems || 0) - gemsRequired,
            },
          },
        }));

        // Upgrade to premium
        const upgradedBattlePass = upgradeToPremium(state.battlePass);
        set({ battlePass: upgradedBattlePass });

        get().addNotification({
          type: 'success',
          title: 'Premium Đã Mở Khóa!',
          message: 'Chúc mừng! Bạn đã mở khóa Premium Battle Pass!',
        });
      },

      // Gacha System
      initializeGacha: () => {
        const newGacha = initializeGachaState();
        set({ gacha: newGacha });
        get().addNotification({
          type: 'info',
          title: 'Gacha Đã Sẵn Sàng!',
          message: 'Hệ thống Gacha đã được mở khóa. Bắt đầu triệu hồi ngay!',
        });
      },

      performGachaPull: (): PullResult | null => {
        const state = get();
        if (!state.gacha) {
          get().addNotification({
            type: 'error',
            title: 'Lỗi',
            message: 'Hệ thống Gacha chưa sẵn sàng',
          });
          return null;
        }

        const gems = state.player.totalResources.gems || 0;
        if (gems < SINGLE_PULL_COST) {
          get().addNotification({
            type: 'error',
            title: 'Không Đủ Gems',
            message: `Cần ${SINGLE_PULL_COST} gems để thực hiện pull`,
          });
          return null;
        }

        // Perform pull
        const result = performSinglePull(state.gacha);
        const updatedGacha = updateGachaStateAfterPull(state.gacha, [result], 'single', SINGLE_PULL_COST);

        // Deduct gems
        set((state) => ({
          player: {
            ...state.player,
            totalResources: {
              ...state.player.totalResources,
              gems: (state.player.totalResources.gems || 0) - SINGLE_PULL_COST,
            },
          },
          gacha: updatedGacha,
        }));

        return result;
      },

      performGachaTenPull: (): PullResult[] | null => {
        const state = get();
        if (!state.gacha) {
          get().addNotification({
            type: 'error',
            title: 'Lỗi',
            message: 'Hệ thống Gacha chưa sẵn sàng',
          });
          return null;
        }

        const gems = state.player.totalResources.gems || 0;
        if (gems < TEN_PULL_COST) {
          get().addNotification({
            type: 'error',
            title: 'Không Đủ Gems',
            message: `Cần ${TEN_PULL_COST} gems để thực hiện 10-pull`,
          });
          return null;
        }

        // Perform 10-pull
        const results = performTenPull(state.gacha);
        const updatedGacha = updateGachaStateAfterPull(state.gacha, results, 'ten', TEN_PULL_COST);

        // Deduct gems
        set((state) => ({
          player: {
            ...state.player,
            totalResources: {
              ...state.player.totalResources,
              gems: (state.player.totalResources.gems || 0) - TEN_PULL_COST,
            },
          },
          gacha: updatedGacha,
        }));

        // Show summary notification
        const legendaryCount = results.filter(r => r.item.rarity === 'legendary').length;
        const epicCount = results.filter(r => r.item.rarity === 'epic').length;
        
        if (legendaryCount > 0) {
          get().addNotification({
            type: 'success',
            title: 'Huyền Thoại!',
            message: `Nhận được ${legendaryCount} vật phẩm Huyền Thoại!`,
          });
        } else if (epicCount > 0) {
          get().addNotification({
            type: 'success',
            title: 'Sử Thi!',
            message: `Nhận được ${epicCount} vật phẩm Sử Thi!`,
          });
        }

        return results;
      },

      performDailyFreePull: (): PullResult | null => {
        const state = get();
        if (!state.gacha) {
          get().addNotification({
            type: 'error',
            title: 'Lỗi',
            message: 'Hệ thống Gacha chưa sẵn sàng',
          });
          return null;
        }

        if (!isDailyFreePullAvailable(state.gacha)) {
          get().addNotification({
            type: 'error',
            title: 'Chưa Sẵn Sàng',
            message: 'Daily free pull chưa được reset. Quay lại sau!',
          });
          return null;
        }

        // Perform free pull
        const result = performSinglePull(state.gacha);
        const updatedGacha = updateGachaStateAfterPull(state.gacha, [result], 'free', 0);

        set({ gacha: updatedGacha });

        get().addNotification({
          type: 'success',
          title: 'Free Pull!',
          message: `Nhận được ${result.item.displayName}!`,
        });

        return result;
      },
    }),
    {
      name: 'katagame-store',
      version: 1,
    }
  )
);