import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Resource, Province, Farmer, Player, GameState, PremiumPass, Achievement, Hero, Pet, CombatResult, BattlePassProgress } from './types';
import { v4 as uuidv4 } from 'uuid';
import { SoundManager } from './soundManager';
import { calculateTotalProduction, getProductionBonus } from './elementSystem';
import { 
  Notification, 
  createInsufficientResourcesNotification,
  createSuccessNotification,
  createInfoNotification,
  createWarningNotification,
} from './notifications';
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
import {
  createGuild,
  GuildState,
  GUILD_CREATE_COST,
  donateToGuild as guildDonate,
  upgradeGuildBuff as guildUpgradeBuff,
  purchaseGuildShopItem,
  claimGuildQuestRewards,
  createGuildWar,
  addGuildExp,
} from './guildSystem';
import {
  initializeArenaState,
  generateMatchmakingOpponents,
  processArenaBattle,
  setDefenseTeam as arenaSetDefense,
  purchaseArenaShopItem,
  checkDailyReset,
  ArenaState,
} from './arenaSystem';
import {
  initializeWorldMapState,
  unlockProvince as worldUnlockProvince,
  completeProvince as worldCompleteProvince,
  travelToProvince as worldTravelProvince,
  challengeBoss,
  startExpedition,
  completeExpedition,
  updateStamina,
  refillStamina,
  WorldMapState,
} from './worldMapSystem';
import {
  initializeDailyMissionState,
  updateMissionProgress,
  claimMissionRewards,
  checkLoginReward,
  claimLoginReward,
  shouldResetDaily,
  shouldResetWeekly,
  resetDailyMissions,
  resetWeeklyMissions,
  updateEvents,
  addEvent as addDailyEvent,
  getActiveEvents,
  DailyMissionState,
  MissionType,
  EventType,
  MissionReward,
  createEvent,
} from './dailyMissionSystem';
import {
  initializeFriendSystemState,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  sendChatMessage,
  markMessagesAsRead,
  sendGiftToFriend,
  claimGift,
  claimAllGifts,
  shouldResetGifts,
  resetDailyGifts,
  visitFriendProvince,
  cleanupExpiredVisits,
  updateFriendLeaderboard,
  FriendSystemState,
  GiftType,
  DailyGift,
} from './friendSystem';
import {
  initializeEnhancedShopState,
  shouldRefreshDailyShop,
  shouldRefreshWeeklyShop,
  refreshDailyShop,
  refreshWeeklyShop,
  purchaseShopItem,
  purchaseBundle,
  startFlashSale,
  updateFlashSales,
  EnhancedShopState,
} from './enhancedShopSystem';
import {
  initializeCustomizationState,
  generateHeroSkins,
  generatePetVariants,
  unlockHeroSkin,
  equipHeroSkin,
  unlockPetVariant,
  equipPetVariant,
  unlockProvinceTheme,
  activateProvinceTheme,
  switchUITheme,
  unlockAvatarFrame,
  equipAvatarFrame,
  startPreview,
  endPreview,
  CustomizationState,
} from './customizationSystem';

// Helper functions - Updated for MVP1 mechanics
const createEmptyResource = (): Resource => ({
  gold: 0,
  rice: 0,
  lumber: 0,
  stone: 0,
  bazan: 0,
  culture: 0,
  gems: 0,
});

const addResources = (a: Resource, b: Resource): Resource => {
  // Handle undefined or null values defensively
  const safeA = a || createEmptyResource();
  const safeB = b || createEmptyResource();
  
  return {
    gold: (safeA.gold || 0) + (safeB.gold || 0),
    rice: (safeA.rice || 0) + (safeB.rice || 0),
    lumber: (safeA.lumber || 0) + (safeB.lumber || 0),
    stone: (safeA.stone || 0) + (safeB.stone || 0),
    bazan: (safeA.bazan || 0) + (safeB.bazan || 0),
    culture: (safeA.culture || 0) + (safeB.culture || 0),
    gems: (safeA.gems || 0) + (safeB.gems || 0),
  };
};

const subtractResources = (a: Resource, b: Resource): Resource => {
  // Handle undefined or null values defensively
  const safeA = a || createEmptyResource();
  const safeB = b || createEmptyResource();
  
  return {
    gold: (safeA.gold || 0) - (safeB.gold || 0),
    rice: (safeA.rice || 0) - (safeB.rice || 0),
    lumber: (safeA.lumber || 0) - (safeB.lumber || 0),
    stone: (safeA.stone || 0) - (safeB.stone || 0),
    bazan: (safeA.bazan || 0) - (safeB.bazan || 0),
    culture: (safeA.culture || 0) - (safeB.culture || 0),
    gems: (safeA.gems || 0) - (safeB.gems || 0),
  };
};

const canAfford = (available: Resource, cost: Resource): boolean => {
  // Handle undefined or null values defensively
  const safeAvailable = available || createEmptyResource();
  const safeCost = cost || createEmptyResource();
  
  return (safeAvailable.gold || 0) >= (safeCost.gold || 0) &&
         (safeAvailable.rice || 0) >= (safeCost.rice || 0) &&
         (safeAvailable.lumber || 0) >= (safeCost.lumber || 0) &&
         (safeAvailable.stone || 0) >= (safeCost.stone || 0) &&
         (safeAvailable.bazan || 0) >= (safeCost.bazan || 0) &&
         (safeAvailable.culture || 0) >= (safeCost.culture || 0);
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
    resourcesPerSecond: { gold: 2, rice: 1.5, lumber: 1, stone: 0.5, bazan: 0.3, culture: 1.2 },
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
    resourcesPerSecond: { gold: 1.5, rice: 2.5, lumber: 1.2, stone: 0.8, bazan: 0.4, culture: 1.5 },
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
    resourcesPerSecond: { gold: 3, rice: 0.8, lumber: 0.5, stone: 2, bazan: 0.2, culture: 1 },
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
  totalResources: { gold: 10, rice: 10, lumber: 10, stone: 10, bazan: 10, culture: 0, gems: 0 },
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
  // Notifications - Enhanced with detailed resource breakdown
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'> & Partial<Pick<Notification, 'id' | 'timestamp'>>) => void;
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
  // Guild System
  guildState?: GuildState;
  initializeGuild: () => void;
  createNewGuild: (name: string, tag: string, description: string, icon: string) => void;
  leaveGuild: () => void;
  donateToGuild: (resources: Resource) => void;
  upgradeGuildBuff: (buffId: string) => void;
  purchaseFromGuildShop: (itemId: string) => void;
  claimGuildQuest: (questId: string) => void;
  startGuildWar: (opponentGuildId: string) => void;
  // Arena System
  arenaState?: ArenaState;
  initializeArena: () => void;
  findArenaOpponents: () => void;
  attackArenaOpponent: (opponentId: string, attackHeroes: Hero[]) => { success: boolean; battle?: any; error?: string };
  setArenaDefense: (heroIds: string[]) => void;
  purchaseFromArenaShop: (itemId: string) => void;
  // World Map System
  worldMapState?: WorldMapState;
  initializeWorldMap: () => void;
  travelToProvince: (provinceId: string) => void;
  challengeBoss: (provinceId: string, heroes: Hero[]) => { success: boolean; result?: 'victory' | 'defeat'; rewards?: any[]; error?: string };
  startExpedition: (floor: number, heroes: Hero[], autoMode?: boolean) => { success: boolean; error?: string };
  completeExpedition: (heroes: Hero[]) => { success: boolean; result?: 'victory' | 'defeat'; rewards?: any[]; error?: string };
  refillStaminaWithGems: (amount: number) => void;
  // Daily Mission System
  dailyMissionState?: DailyMissionState;
  initializeDailyMissions: () => void;
  updateMission: (type: MissionType, amount?: number) => void;
  claimMissionReward: (missionId: string) => { success: boolean; rewards?: MissionReward[]; error?: string };
  claimDailyLoginReward: (dayNumber: number) => { success: boolean; rewards?: MissionReward[]; error?: string };
  checkAndResetMissions: () => void;
  startEvent: (type: EventType, durationHours: number) => void;
  // Friend System
  friendSystemState?: FriendSystemState;
  initializeFriendSystem: () => void;
  sendFriendRequestAction: (toPlayerId: string, message?: string) => void;
  acceptFriendRequestAction: (requestId: string) => void;
  declineFriendRequestAction: (requestId: string) => void;
  removeFriendAction: (friendId: string) => void;
  sendChatMessageAction: (toPlayerId: string, message: string) => void;
  markChatAsRead: (friendId: string) => void;
  sendGiftAction: (friendId: string, giftType: GiftType, message?: string) => void;
  claimGiftAction: (giftId: string) => void;
  claimAllGiftsAction: () => void;
  visitFriendProvinceAction: (friendId: string, provinceId: string, helpType: 'production' | 'defense' | 'speedup') => void;
  updateFriendLeaderboardAction: () => void;
  checkAndResetFriendGifts: () => void;
  // Enhanced Shop System
  enhancedShopState?: EnhancedShopState;
  initializeEnhancedShop: () => void;
  purchaseShopItemAction: (itemId: string, shopType: 'daily' | 'weekly' | 'flash') => void;
  purchaseBundleAction: (bundleId: string) => void;
  checkAndRefreshShops: () => void;
  startFlashSaleAction: () => void;
  // Customization System
  customizationState?: CustomizationState;
  initializeCustomization: () => void;
  generateHeroSkinsForHero: (heroId: string, heroType: 'warrior' | 'archer' | 'mage') => void;
  generatePetVariantsForPet: (petId: string, petType: 'dragon' | 'phoenix') => void;
  unlockHeroSkinAction: (skinId: string) => void;
  equipHeroSkinAction: (skinId: string) => void;
  unlockPetVariantAction: (variantId: string) => void;
  equipPetVariantAction: (variantId: string) => void;
  unlockProvinceThemeAction: (themeId: string) => void;
  activateProvinceThemeAction: (themeId: string) => void;
  switchUIThemeAction: (theme: 'light' | 'dark') => void;
  unlockAvatarFrameAction: (frameId: string) => void;
  equipAvatarFrameAction: (frameId: string) => void;
  startPreviewAction: (type: 'skin' | 'variant' | 'theme' | 'frame', itemId: string) => void;
  endPreviewAction: () => void;
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
      guildState: undefined,
      arenaState: undefined,
      worldMapState: undefined,
      dailyMissionState: undefined,
      friendSystemState: undefined,
      enhancedShopState: undefined,
      customizationState: undefined,
      notifications: [],

      addNotification: (notification) => {
        const fullNotification: Notification = {
          ...notification,
          id: notification.id || `notification-${Date.now()}`,
          timestamp: notification.timestamp || Date.now(),
          duration: notification.duration || 4000, // ✅ Đảm bảo luôn có duration
        };
        
        console.log('➕ Adding notification:', {
          id: fullNotification.id,
          title: fullNotification.title,
          duration: fullNotification.duration,
          timestamp: fullNotification.timestamp,
        });
        
        set((state) => ({
          notifications: [...state.notifications, fullNotification],
        }));
        
        // ✅ Auto remove - NotificationProvider sẽ xử lý, không cần setTimeout ở đây
        // Xóa setTimeout để tránh conflict với interval cleanup
      },

      removeNotification: (id) => {
        console.log('➖ Removing notification:', id);
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
          ? { gold: 30, rice: 15, lumber: 8, stone: 3, bazan: 2, culture: 3 }
          : { gold: 10, rice: 5, lumber: 3, stone: 2, bazan: 1, culture: 1 };

        // Check affordability with detailed message
        if (!canAfford(state.player.totalResources, farmerCost)) {
          get().addNotification(
            createInsufficientResourcesNotification(
              state.player.totalResources,
              farmerCost,
              `thuê ${farmerType === 'auto' ? 'Nông dân tự động' : 'Nông dân thủ công'}`
            )
          );
          return;
        }

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
        
        // Play sound and show success notification with cost breakdown
        SoundManager.getInstance().playSound('purchase');
        get().addNotification(
          createSuccessNotification(
            `Đã thuê ${newFarmer.name} cho ${province.displayName}`,
            farmerCost
          )
        );
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
          bazan: farmer.level * 2,
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

        const unlockCost: Resource = { gold: 150, rice: 75, lumber: 35, stone: 20, bazan: 10, culture: 30 };

        if (!canAfford(state.player.totalResources, unlockCost)) {
          get().addNotification(
            createInsufficientResourcesNotification(
              state.player.totalResources,
              unlockCost,
              `mở khóa ${province.displayName}`
            )
          );
          return;
        }

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
        get().addNotification(
          createSuccessNotification(
            `🎆 Mở khóa ${province.displayName} thành công! +50 EXP`,
            unlockCost
          )
        );
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
          bazan: province.level * 10,
          culture: province.level * 20,
        };

        if (!canAfford(state.player.totalResources, upgradeCost)) {
          get().addNotification(
            createInsufficientResourcesNotification(
              state.player.totalResources,
              upgradeCost,
              `nâng cấp ${province.displayName}`
            )
          );
          return;
        }

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
                    bazan: p.resourcesPerSecond.bazan * 1.15,
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
          type: 'success',
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
        
        // Update daily mission progress
        get().updateMission('upgrade_hero', 1);
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
          
          // Update daily mission progress
          get().updateMission('win_battles', 1);
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
        
        // Update daily mission progress
        get().updateMission('gacha_pull', 1);

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

      // === Guild System Methods ===
      initializeGuild: () => {
        const state = get();
        if (!state.guildState) {
          set({
            guildState: {
              currentGuild: undefined,
              guildId: undefined,
              myRole: undefined,
              joinRequests: [],
              myApplications: [],
              chatMessages: [],
              unreadChatCount: 0,
              lastChatCheck: Date.now(),
            },
          });
        }
      },

      createNewGuild: (name: string, tag: string, description: string, icon: string) => {
        const state = get();
        
        // Check if player already in a guild
        if (state.guildState?.currentGuild) {
          get().addNotification({
            type: 'error',
            title: 'Lỗi',
            message: 'Bạn đã ở trong một guild!',
          });
          return;
        }

        // Check if player has enough gems
        const gems = state.player.totalResources.gems || 0;
        if (gems < GUILD_CREATE_COST) {
          get().addNotification({
            type: 'error',
            title: 'Không Đủ Gems',
            message: `Cần ${GUILD_CREATE_COST} gems để tạo guild!`,
          });
          return;
        }

        // Create new guild with correct parameters
        const newGuild = createGuild(
          state.player.id,
          state.player.name,
          state.player.level,
          name,
          tag,
          description,
          icon
        );

        // Deduct gems
        const newResources = {
          ...state.player.totalResources,
          gems: gems - GUILD_CREATE_COST,
        };

        // Update state
        set({
          player: {
            ...state.player,
            totalResources: newResources,
          },
          guildState: {
            currentGuild: newGuild,
            guildId: newGuild.id,
            myRole: 'leader',
            joinRequests: [],
            myApplications: [],
            chatMessages: [],
            unreadChatCount: 0,
            lastChatCheck: Date.now(),
          },
        });

        get().addNotification({
          type: 'success',
          title: 'Guild Đã Tạo!',
          message: `Chào mừng đến ${newGuild.name} [${newGuild.tag}]!`,
        });
      },

      leaveGuild: () => {
        const state = get();
        
        if (!state.guildState?.currentGuild) {
          return;
        }

        const guild = state.guildState.currentGuild;
        
        // Leaders cannot leave (they must disband or transfer leadership)
        if (state.guildState.myRole === 'leader') {
          get().addNotification({
            type: 'error',
            title: 'Không Thể Rời',
            message: 'Guild Leader không thể rời guild. Hãy chuyển giao quyền lãnh đạo hoặc giải tán guild.',
          });
          return;
        }

        // Confirm leave
        const confirmed = window.confirm(`Bạn có chắc muốn rời khỏi ${guild.name}?`);
        if (!confirmed) return;

        // Remove from guild
        set({
          guildState: {
            currentGuild: undefined,
            guildId: undefined,
            myRole: undefined,
            joinRequests: [],
            myApplications: [],
            chatMessages: [],
            unreadChatCount: 0,
            lastChatCheck: Date.now(),
          },
        });

        get().addNotification({
          type: 'info',
          title: 'Đã Rời Guild',
          message: `Bạn đã rời khỏi ${guild.name}`,
        });
      },

      donateToGuild: (resources: Resource) => {
        const state = get();
        
        if (!state.guildState?.currentGuild) {
          get().addNotification({
            type: 'error',
            title: 'Lỗi',
            message: 'Bạn chưa tham gia guild!',
          });
          return;
        }

        // Check if player has enough resources
        const playerResources = state.player.totalResources;
        if (
          playerResources.gold < resources.gold ||
          playerResources.rice < resources.rice ||
          playerResources.lumber < resources.lumber ||
          playerResources.stone < resources.stone ||
          playerResources.culture < resources.culture
        ) {
          get().addNotification({
            type: 'error',
            title: 'Không Đủ Tài Nguyên',
            message: 'Bạn không đủ tài nguyên để quyên góp!',
          });
          return;
        }

        try {
          const member = state.guildState.currentGuild.members.find(
            m => m.playerId === state.player.id
          );
          
          if (!member) {
            throw new Error('Không tìm thấy thành viên');
          }

          // Donate to guild
          const donationResult = guildDonate(state.guildState.currentGuild, state.player.id, resources);

          // Deduct resources from player
          const newResources = subtractResources(playerResources, resources);

          set({
            player: {
              ...state.player,
              totalResources: newResources,
            },
            guildState: {
              ...state.guildState,
              currentGuild: donationResult.guild,
            },
          });

          get().addNotification({
            type: 'success',
            title: 'Quyên Góp Thành Công',
            message: `Đã quyên góp tài nguyên cho guild!`,
          });
          
          // Update daily mission progress
          get().updateMission('donate_guild', 1);
        } catch (error) {
          get().addNotification({
            type: 'error',
            title: 'Lỗi',
            message: error instanceof Error ? error.message : 'Không thể quyên góp',
          });
        }
      },

      upgradeGuildBuff: (buffId: string) => {
        const state = get();
        
        if (!state.guildState?.currentGuild) {
          get().addNotification({
            type: 'error',
            title: 'Lỗi',
            message: 'Bạn chưa tham gia guild!',
          });
          return;
        }

        try {
          const updatedGuild = guildUpgradeBuff(state.guildState.currentGuild, buffId);

          set({
            guildState: {
              ...state.guildState,
              currentGuild: updatedGuild,
            },
          });

          get().addNotification({
            type: 'success',
            title: 'Nâng Cấp Thành Công',
            message: 'Đã nâng cấp buff guild!',
          });
        } catch (error) {
          get().addNotification({
            type: 'error',
            title: 'Lỗi',
            message: error instanceof Error ? error.message : 'Không thể nâng cấp buff',
          });
        }
      },

      purchaseFromGuildShop: (itemId: string) => {
        const state = get();
        
        if (!state.guildState?.currentGuild) {
          get().addNotification({
            type: 'error',
            title: 'Lỗi',
            message: 'Bạn chưa tham gia guild!',
          });
          return;
        }

        const member = state.guildState.currentGuild.members.find(
          m => m.playerId === state.player.id
        );
        
        if (!member) {
          get().addNotification({
            type: 'error',
            title: 'Lỗi',
            message: 'Không tìm thấy thành viên!',
          });
          return;
        }

        const result = purchaseGuildShopItem(state.guildState.currentGuild, member, itemId);

        if (!result.success) {
          get().addNotification({
            type: 'error',
            title: 'Lỗi',
            message: result.error || 'Không thể mua vật phẩm',
          });
          return;
        }

        if (result.updatedGuild) {
          set({
            guildState: {
              ...state.guildState,
              currentGuild: result.updatedGuild,
            },
          });

          get().addNotification({
            type: 'success',
            title: 'Mua Thành Công',
            message: 'Đã mua vật phẩm từ Guild Shop!',
          });
        }
      },

      claimGuildQuest: (questId: string) => {
        const state = get();
        
        if (!state.guildState?.currentGuild) {
          get().addNotification({
            type: 'error',
            title: 'Lỗi',
            message: 'Bạn chưa tham gia guild!',
          });
          return;
        }

        const result = claimGuildQuestRewards(state.guildState.currentGuild, questId);

        if (!result.success) {
          get().addNotification({
            type: 'error',
            title: 'Lỗi',
            message: result.error || 'Không thể nhận thưởng',
          });
          return;
        }

        if (result.updatedGuild) {
          set({
            guildState: {
              ...state.guildState,
              currentGuild: result.updatedGuild,
            },
          });

          get().addNotification({
            type: 'success',
            title: 'Nhận Thưởng Thành Công',
            message: 'Đã nhận phần thưởng nhiệm vụ guild!',
          });
        }
      },

      startGuildWar: (opponentGuildId: string) => {
        const state = get();
        
        if (!state.guildState?.currentGuild) {
          get().addNotification({
            type: 'error',
            title: 'Lỗi',
            message: 'Bạn chưa tham gia guild!',
          });
          return;
        }

        if (state.guildState.myRole !== 'leader') {
          get().addNotification({
            type: 'error',
            title: 'Không Có Quyền',
            message: 'Chỉ Guild Master mới có thể bắt đầu Guild War!',
          });
          return;
        }

        if (state.guildState.currentGuild.activeWar) {
          get().addNotification({
            type: 'error',
            title: 'Lỗi',
            message: 'Guild đang trong một trận chiến tranh!',
          });
          return;
        }

        const newWar = createGuildWar(
          state.guildState.currentGuild.id,
          opponentGuildId,
          72 // 72 hours
        );

        set({
          guildState: {
            ...state.guildState,
            currentGuild: {
              ...state.guildState.currentGuild,
              activeWar: newWar,
            },
          },
        });

        get().addNotification({
          type: 'success',
          title: 'Chiến Tranh Bắt Đầu!',
          message: 'Guild War đã bắt đầu! Thời gian: 72 giờ',
        });
      },

      // ============================================================================
      // ARENA SYSTEM METHODS
      // ============================================================================

      initializeArena: () => {
        const state = get();
        if (state.arenaState) return; // Already initialized

        const newArenaState = initializeArenaState(
          state.player.id,
          state.player.name,
          state.player.level
        );

        set({ arenaState: newArenaState });

        get().addNotification({
          type: 'info',
          title: 'Đấu Trường Mở!',
          message: 'Chào mừng đến với Arena PvP! Bắt đầu chiến đấu để leo rank.',
        });
      },

      findArenaOpponents: () => {
        const state = get();
        
        if (!state.arenaState) {
          get().initializeArena();
          return;
        }

        // Check daily reset
        const resetState = checkDailyReset(state.arenaState);

        // Generate new opponents
        const newOpponents = generateMatchmakingOpponents(
          resetState.player.rating,
          resetState.player.playerLevel
        );

        set({
          arenaState: {
            ...resetState,
            matchedOpponents: newOpponents,
          },
        });

        get().addNotification({
          type: 'success',
          title: 'Tìm Đối Thủ',
          message: `Đã tìm thấy ${newOpponents.length} đối thủ phù hợp!`,
        });
      },

      attackArenaOpponent: (opponentId: string, attackHeroes: Hero[]) => {
        const state = get();
        
        if (!state.arenaState) {
          get().addNotification({
            type: 'error',
            title: 'Lỗi',
            message: 'Chưa khởi tạo Arena!',
          });
          return { success: false, error: 'Chưa khởi tạo Arena!' };
        }

        const result = processArenaBattle(state.arenaState, opponentId, attackHeroes);

        if (!result.success) {
          get().addNotification({
            type: 'error',
            title: 'Không Thể Chiến Đấu',
            message: result.error || 'Đã xảy ra lỗi!',
          });
          return result;
        }

        // Update state
        set({ arenaState: result.updatedState });

        // Add notification
        if (result.battle) {
          get().addNotification({
            type: result.battle.result === 'win' ? 'success' : 'info',
            title: result.battle.result === 'win' ? '🎉 Chiến Thắng!' : '😔 Thất Bại',
            message: `Rating: ${result.battle.ratingChange > 0 ? '+' : ''}${result.battle.ratingChange} • Coins: +${result.battle.rewardCoins}`,
          });
          
          // Update daily mission progress if won
          if (result.battle.result === 'win') {
            get().updateMission('win_arena', 1);
          }
        }

        return result;
      },

      setArenaDefense: (heroIds: string[]) => {
        const state = get();
        
        if (!state.arenaState) {
          get().addNotification({
            type: 'error',
            title: 'Lỗi',
            message: 'Chưa khởi tạo Arena!',
          });
          return;
        }

        const result = arenaSetDefense(
          state.arenaState,
          heroIds,
          state.heroes || []
        );

        if (!result.success) {
          get().addNotification({
            type: 'error',
            title: 'Không Thể Lưu',
            message: result.error || 'Đã xảy ra lỗi!',
          });
          return;
        }

        set({ arenaState: result.updatedState });

        get().addNotification({
          type: 'success',
          title: 'Đội Phòng Thủ Đã Lưu',
          message: `Đã cài đặt ${heroIds.length} heroes cho đội phòng thủ!`,
        });
      },

      purchaseFromArenaShop: (itemId: string) => {
        const state = get();
        
        if (!state.arenaState) {
          get().addNotification({
            type: 'error',
            title: 'Lỗi',
            message: 'Chưa khởi tạo Arena!',
          });
          return;
        }

        const result = purchaseArenaShopItem(state.arenaState, itemId);

        if (!result.success) {
          get().addNotification({
            type: 'error',
            title: 'Không Thể Mua',
            message: result.error || 'Đã xảy ra lỗi!',
          });
          return;
        }

        set({ arenaState: result.updatedState });

        get().addNotification({
          type: 'success',
          title: 'Mua Thành Công!',
          message: `Đã mua ${result.item?.displayName}!`,
        });
      },

      // World Map System Methods
      initializeWorldMap: () => {
        const state = get();
        
        if (state.worldMapState) {
          return; // Already initialized
        }

        const worldMapState = initializeWorldMapState(state.player.level);

        set({ worldMapState });

        get().addNotification({
          type: 'success',
          title: 'Bản Đồ Mở!',
          message: 'Khám phá 63 tỉnh thành Việt Nam!',
        });
      },

      travelToProvince: (provinceId: string) => {
        const state = get();
        
        if (!state.worldMapState) {
          get().initializeWorldMap();
          return;
        }

        const result = worldTravelProvince(state.worldMapState, provinceId);

        if (!result.success) {
          get().addNotification({
            type: 'error',
            title: 'Không Thể Di Chuyển',
            message: result.error || 'Đã xảy ra lỗi!',
          });
          return;
        }

        set({ worldMapState: result.state });

        const province = result.state!.provinces.find((p: any) => p.id === provinceId);
        get().addNotification({
          type: 'info',
          title: 'Di Chuyển',
          message: `Đã đến ${province?.name}!`,
        });
      },

      challengeBoss: (provinceId: string, heroes: Hero[]) => {
        const state = get();
        
        if (!state.worldMapState) {
          get().addNotification({
            type: 'error',
            title: 'Lỗi',
            message: 'Chưa khởi tạo Bản Đồ!',
          });
          return { success: false, error: 'World map not initialized' };
        }

        const result = challengeBoss(state.worldMapState, provinceId, heroes);

        if (!result.success) {
          get().addNotification({
            type: 'error',
            title: 'Thách Đấu Thất Bại',
            message: result.error || 'Đã xảy ra lỗi!',
          });
          return result;
        }

        set({ worldMapState: result.state });

        const province = state.worldMapState.provinces.find((p: any) => p.id === provinceId);
        const boss = province?.boss;

        if (result.result === 'victory') {
          get().addNotification({
            type: 'success',
            title: '🎉 Chiến Thắng Boss!',
            message: `Đã đánh bại ${boss?.name}! +${result.rewards?.length || 0} phần thưởng`,
          });
          
          // Update daily mission progress
          get().updateMission('challenge_boss', 1);
        } else {
          get().addNotification({
            type: 'warning',
            title: '😔 Thất Bại',
            message: `Thua ${boss?.name}. Hãy nâng cấp tướng và thử lại!`,
          });
        }

        return result;
      },

      startExpedition: (floor: number, heroes: Hero[], autoMode: boolean = false) => {
        const state = get();
        
        if (!state.worldMapState) {
          get().addNotification({
            type: 'error',
            title: 'Lỗi',
            message: 'Chưa khởi tạo Bản Đồ!',
          });
          return { success: false, error: 'World map not initialized' };
        }

        const result = startExpedition(state.worldMapState, floor, heroes, autoMode);

        if (!result.success) {
          get().addNotification({
            type: 'error',
            title: 'Không Thể Thám Hiểm',
            message: result.error || 'Đã xảy ra lỗi!',
          });
          return result;
        }

        set({ worldMapState: result.state });

        get().addNotification({
          type: 'info',
          title: '⚔️ Bắt Đầu Thám Hiểm',
          message: `Tầng ${floor} - ${autoMode ? 'Chế độ tự động' : 'Thủ công'}`,
        });

        return result;
      },

      completeExpedition: (heroes: Hero[]) => {
        const state = get();
        
        if (!state.worldMapState) {
          get().addNotification({
            type: 'error',
            title: 'Lỗi',
            message: 'Chưa khởi tạo Bản Đồ!',
          });
          return { success: false, error: 'World map not initialized' };
        }

        const result = completeExpedition(state.worldMapState, heroes);

        if (!result.success) {
          get().addNotification({
            type: 'error',
            title: 'Lỗi Thám Hiểm',
            message: result.error || 'Đã xảy ra lỗi!',
          });
          return result;
        }

        set({ worldMapState: result.state });

        if (result.result === 'victory') {
          get().addNotification({
            type: 'success',
            title: '🎉 Thám Hiểm Thành Công!',
            message: `+${result.rewards?.length || 0} phần thưởng đã nhận!`,
          });
          
          // Update daily mission progress
          get().updateMission('complete_expeditions', 1);
        } else {
          get().addNotification({
            type: 'warning',
            title: '😔 Thám Hiểm Thất Bại',
            message: 'Sức mạnh không đủ. Hãy nâng cấp tướng!',
          });
        }

        return result;
      },

      refillStaminaWithGems: (amount: number) => {
        const state = get();
        
        if (!state.worldMapState) {
          return;
        }

        const gemCost = amount * 10; // 10 gems per stamina
        
        if (state.player.totalResources.gems! < gemCost) {
          get().addNotification({
            type: 'error',
            title: 'Không Đủ Gems',
            message: `Cần ${gemCost} gems để nạp ${amount} stamina!`,
          });
          return;
        }

        const updatedStamina = refillStamina(state.worldMapState.stamina, amount);

        set({
          worldMapState: {
            ...state.worldMapState,
            stamina: updatedStamina,
          },
          player: {
            ...state.player,
            totalResources: {
              ...state.player.totalResources,
              gems: state.player.totalResources.gems! - gemCost,
            },
          },
        });

        get().addNotification({
          type: 'success',
          title: 'Nạp Stamina',
          message: `Đã nạp ${amount} stamina! -${gemCost} gems`,
        });
      },

      // ============= DAILY MISSION SYSTEM =============

      initializeDailyMissions: () => {
        const state = get();
        
        if (state.dailyMissionState) {
          // Check if reset needed
          get().checkAndResetMissions();
          return;
        }

        const dailyMissionState = initializeDailyMissionState();
        
        set({
          dailyMissionState,
        });

        get().addNotification({
          type: 'success',
          title: '🎯 Nhiệm Vụ Mới!',
          message: 'Nhiệm vụ hàng ngày đã được tạo!',
        });
      },

      updateMission: (type: MissionType, amount: number = 1) => {
        const state = get();
        
        if (!state.dailyMissionState) {
          return;
        }

        const updatedState = updateMissionProgress(state.dailyMissionState, type, amount);
        
        set({
          dailyMissionState: updatedState,
        });
      },

      claimMissionReward: (missionId: string) => {
        const state = get();
        
        if (!state.dailyMissionState) {
          return { success: false, error: 'Chưa khởi tạo hệ thống nhiệm vụ' };
        }

        const result = claimMissionRewards(state.dailyMissionState, missionId);
        
        if (!result.success) {
          get().addNotification({
            type: 'error',
            title: 'Không Thể Nhận Thưởng',
            message: result.error || 'Đã xảy ra lỗi!',
          });
          return result;
        }

        // Add rewards to player
        const rewards = result.rewards!;
        let updatedResources = { ...state.player.totalResources };

        rewards.forEach((reward) => {
          switch (reward.type) {
            case 'gold':
              updatedResources.gold += reward.quantity;
              break;
            case 'gems':
              updatedResources.gems = (updatedResources.gems || 0) + reward.quantity;
              break;
            case 'exp':
              // EXP handled through addExperience method
              get().addExperience(reward.quantity);
              break;
            case 'hero_fragment':
              // Add hero fragments (simplified)
              break;
            case 'pet_egg':
              // Add pet egg (simplified)
              break;
            case 'culture':
              updatedResources.culture += reward.quantity;
              break;
            case 'stamina':
              if (state.worldMapState) {
                const updatedStamina = refillStamina(state.worldMapState.stamina, reward.quantity);
                set({
                  worldMapState: {
                    ...state.worldMapState,
                    stamina: updatedStamina,
                  },
                });
              }
              break;
          }
        });

        set({
          dailyMissionState: result.state,
          player: {
            ...state.player,
            totalResources: updatedResources,
          },
        });

        get().addNotification({
          type: 'success',
          title: '🎉 Nhận Thưởng Thành Công!',
          message: `Đã nhận ${rewards.length} phần thưởng!`,
        });

        return { success: true, rewards };
      },

      claimDailyLoginReward: (dayNumber: number) => {
        const state = get();
        
        if (!state.dailyMissionState) {
          return { success: false, error: 'Chưa khởi tạo hệ thống nhiệm vụ' };
        }

        // Check login first
        const loginCheck = checkLoginReward(state.dailyMissionState);
        
        const result = claimLoginReward(state.dailyMissionState, dayNumber);
        
        if (!result.success) {
          get().addNotification({
            type: 'error',
            title: 'Không Thể Nhận Thưởng',
            message: result.error || 'Đã xảy ra lỗi!',
          });
          return result;
        }

        // Add rewards to player
        const rewards = result.rewards!;
        let updatedResources = { ...state.player.totalResources };

        rewards.forEach((reward) => {
          switch (reward.type) {
            case 'gold':
              updatedResources.gold += reward.quantity;
              break;
            case 'gems':
              updatedResources.gems = (updatedResources.gems || 0) + reward.quantity;
              break;
            case 'exp':
              // EXP handled through addExperience method
              get().addExperience(reward.quantity);
              break;
            case 'hero_fragment':
              // Add hero fragments (simplified)
              break;
            case 'pet_egg':
              // Add pet egg (simplified)
              break;
            case 'culture':
              updatedResources.culture += reward.quantity;
              break;
            case 'stamina':
              if (state.worldMapState) {
                const updatedStamina = refillStamina(state.worldMapState.stamina, reward.quantity);
                set({
                  worldMapState: {
                    ...state.worldMapState,
                    stamina: updatedStamina,
                  },
                });
              }
              break;
          }
        });

        set({
          dailyMissionState: result.state!,
          player: {
            ...state.player,
            totalResources: updatedResources,
          },
        });

        get().addNotification({
          type: 'success',
          title: `🔥 Điểm Danh Ngày ${dayNumber}!`,
          message: `Streak: ${result.state!.loginRewards.currentStreak} ngày!`,
        });

        return { success: true, rewards };
      },

      checkAndResetMissions: () => {
        const state = get();
        
        if (!state.dailyMissionState) {
          return;
        }

        let updated = { ...state.dailyMissionState };
        let resetOccurred = false;

        // Check daily reset
        if (shouldResetDaily(updated.lastDailyReset)) {
          updated = resetDailyMissions(updated);
          resetOccurred = true;
          
          get().addNotification({
            type: 'info',
            title: '🌅 Nhiệm Vụ Mới!',
            message: 'Nhiệm vụ hàng ngày đã được làm mới!',
          });
        }

        // Check weekly reset
        if (shouldResetWeekly(updated.lastWeeklyReset)) {
          updated = resetWeeklyMissions(updated);
          resetOccurred = true;
          
          get().addNotification({
            type: 'info',
            title: '📅 Nhiệm Vụ Tuần Mới!',
            message: 'Nhiệm vụ hàng tuần đã được làm mới!',
          });
        }

        // Update events
        updated = updateEvents(updated);

        if (resetOccurred) {
          set({
            dailyMissionState: updated,
          });
        }
      },

      startEvent: (type: EventType, durationHours: number) => {
        const state = get();
        
        if (!state.dailyMissionState) {
          return;
        }

        const newEvent = createEvent(type, durationHours);
        const updatedState = addDailyEvent(state.dailyMissionState, newEvent);

        set({
          dailyMissionState: updatedState,
        });

        get().addNotification({
          type: 'success',
          title: '🎉 Sự Kiện Mới!',
          message: `${newEvent.name} đã bắt đầu!`,
        });
      },

      // ============= FRIEND SYSTEM =============

      initializeFriendSystem: () => {
        const state = get();
        
        if (state.friendSystemState) {
          // Already initialized, just cleanup expired visits
          const cleaned = cleanupExpiredVisits(state.friendSystemState);
          set({ friendSystemState: cleaned });
          return;
        }

        const friendSystemState = initializeFriendSystemState();
        
        set({ friendSystemState });

        get().addNotification({
          type: 'success',
          title: '👥 Hệ Thống Bạn Bè',
          message: 'Đã khởi tạo hệ thống bạn bè!',
        });
      },

      sendFriendRequestAction: (toPlayerId: string, message?: string) => {
        const state = get();
        
        if (!state.friendSystemState) {
          return;
        }

        const result = sendFriendRequest(
          state.friendSystemState,
          state.player.id,
          state.player.name,
          state.player.level,
          0, // Player power (would calculate from heroes/pets)
          toPlayerId,
          message
        );

        if (!result.success) {
          get().addNotification({
            type: 'error',
            title: 'Không Thể Gửi Lời Mời',
            message: result.error || 'Đã xảy ra lỗi!',
          });
          return;
        }

        set({ friendSystemState: result.state });

        get().addNotification({
          type: 'success',
          title: '📤 Đã Gửi Lời Mời',
          message: 'Lời mời kết bạn đã được gửi!',
        });
      },

      acceptFriendRequestAction: (requestId: string) => {
        const state = get();
        
        if (!state.friendSystemState) {
          return;
        }

        const result = acceptFriendRequest(state.friendSystemState, requestId, state.player.id);

        if (!result.success) {
          get().addNotification({
            type: 'error',
            title: 'Không Thể Chấp Nhận',
            message: result.error || 'Đã xảy ra lỗi!',
          });
          return;
        }

        set({ friendSystemState: result.state });

        get().addNotification({
          type: 'success',
          title: '🎉 Kết Bạn Thành Công!',
          message: 'Bạn đã có thêm người bạn mới!',
        });
      },

      declineFriendRequestAction: (requestId: string) => {
        const state = get();
        
        if (!state.friendSystemState) {
          return;
        }

        const result = declineFriendRequest(state.friendSystemState, requestId);

        if (!result.success) {
          get().addNotification({
            type: 'error',
            title: 'Lỗi',
            message: result.error || 'Đã xảy ra lỗi!',
          });
          return;
        }

        set({ friendSystemState: result.state });
      },

      removeFriendAction: (friendId: string) => {
        const state = get();
        
        if (!state.friendSystemState) {
          return;
        }

        const result = removeFriend(state.friendSystemState, friendId);

        if (!result.success) {
          get().addNotification({
            type: 'error',
            title: 'Không Thể Xóa',
            message: result.error || 'Đã xảy ra lỗi!',
          });
          return;
        }

        set({ friendSystemState: result.state });

        get().addNotification({
          type: 'info',
          title: 'Đã Xóa Bạn Bè',
          message: 'Đã xóa khỏi danh sách bạn bè!',
        });
      },

      sendChatMessageAction: (toPlayerId: string, message: string) => {
        const state = get();
        
        if (!state.friendSystemState) {
          return;
        }

        const result = sendChatMessage(
          state.friendSystemState,
          state.player.id,
          state.player.name,
          toPlayerId,
          message
        );

        if (!result.success) {
          get().addNotification({
            type: 'error',
            title: 'Không Thể Gửi',
            message: result.error || 'Đã xảy ra lỗi!',
          });
          return;
        }

        set({ friendSystemState: result.state });
      },

      markChatAsRead: (friendId: string) => {
        const state = get();
        
        if (!state.friendSystemState) {
          return;
        }

        const updatedState = markMessagesAsRead(state.friendSystemState, friendId);
        set({ friendSystemState: updatedState });
      },

      sendGiftAction: (friendId: string, giftType: GiftType, message?: string) => {
        const state = get();
        
        if (!state.friendSystemState) {
          return;
        }

        const result = sendGiftToFriend(
          state.friendSystemState,
          state.player.id,
          state.player.name,
          friendId,
          giftType,
          message
        );

        if (!result.success) {
          get().addNotification({
            type: 'error',
            title: 'Không Thể Tặng Quà',
            message: result.error || 'Đã xảy ra lỗi!',
          });
          return;
        }

        set({ friendSystemState: result.state });

        get().addNotification({
          type: 'success',
          title: '🎁 Đã Gửi Quà!',
          message: 'Quà tặng đã được gửi đến bạn bè!',
        });
      },

      claimGiftAction: (giftId: string) => {
        const state = get();
        
        if (!state.friendSystemState) {
          return;
        }

        const result = claimGift(state.friendSystemState, giftId);

        if (!result.success) {
          get().addNotification({
            type: 'error',
            title: 'Không Thể Nhận',
            message: result.error || 'Đã xảy ra lỗi!',
          });
          return;
        }

        // Add gift rewards to player
        const gift = result.gift!;
        let updatedResources = { ...state.player.totalResources };

        switch (gift.giftType) {
          case 'gold':
            updatedResources.gold += gift.quantity;
            break;
          case 'gems':
            updatedResources.gems = (updatedResources.gems || 0) + gift.quantity;
            break;
          case 'stamina':
            if (state.worldMapState) {
              const updatedStamina = refillStamina(state.worldMapState.stamina, gift.quantity);
              set({
                worldMapState: {
                  ...state.worldMapState,
                  stamina: updatedStamina,
                },
              });
            }
            break;
          case 'hero_fragment':
            // Add hero fragments (simplified)
            break;
          case 'pet_egg':
            // Add pet egg (simplified)
            break;
        }

        set({
          friendSystemState: result.state,
          player: {
            ...state.player,
            totalResources: updatedResources,
          },
        });

        get().addNotification({
          type: 'success',
          title: '🎁 Đã Nhận Quà!',
          message: `Đã nhận quà từ ${gift.fromPlayerName}!`,
        });
      },

      claimAllGiftsAction: () => {
        const state = get();
        
        if (!state.friendSystemState) {
          return;
        }

        const result = claimAllGifts(state.friendSystemState);

        if (!result.success) {
          get().addNotification({
            type: 'error',
            title: 'Không Thể Nhận',
            message: result.error || 'Đã xảy ra lỗi!',
          });
          return;
        }

        // Add all gift rewards to player
        const gifts = result.gifts!;
        let updatedResources = { ...state.player.totalResources };
        let totalStamina = 0;

        gifts.forEach((gift) => {
          switch (gift.giftType) {
            case 'gold':
              updatedResources.gold += gift.quantity;
              break;
            case 'gems':
              updatedResources.gems = (updatedResources.gems || 0) + gift.quantity;
              break;
            case 'stamina':
              totalStamina += gift.quantity;
              break;
          }
        });

        // Apply stamina if any
        if (totalStamina > 0 && state.worldMapState) {
          const updatedStamina = refillStamina(state.worldMapState.stamina, totalStamina);
          set({
            worldMapState: {
              ...state.worldMapState,
              stamina: updatedStamina,
            },
          });
        }

        set({
          friendSystemState: result.state,
          player: {
            ...state.player,
            totalResources: updatedResources,
          },
        });

        get().addNotification({
          type: 'success',
          title: '🎉 Nhận Tất Cả Quà!',
          message: `Đã nhận ${gifts.length} món quà!`,
        });
      },

      visitFriendProvinceAction: (friendId: string, provinceId: string, helpType: 'production' | 'defense' | 'speedup') => {
        const state = get();
        
        if (!state.friendSystemState) {
          return;
        }

        const result = visitFriendProvince(
          state.friendSystemState,
          state.player.id,
          state.player.name,
          friendId,
          provinceId,
          helpType
        );

        if (!result.success) {
          get().addNotification({
            type: 'error',
            title: 'Không Thể Viếng Thăm',
            message: result.error || 'Đã xảy ra lỗi!',
          });
          return;
        }

        set({ friendSystemState: result.state });

        get().addNotification({
          type: 'success',
          title: '👋 Viếng Thăm Thành Công!',
          message: `Bạn đã giúp đỡ bạn bè trong 60 phút!`,
        });
      },

      updateFriendLeaderboardAction: () => {
        const state = get();
        
        if (!state.friendSystemState) {
          return;
        }

        const updatedState = updateFriendLeaderboard(
          state.friendSystemState,
          state.friendSystemState.friends,
          {
            level: state.player.level,
            power: 0, // Would calculate from heroes/pets
            achievements: 0,
            guildName: state.guildState?.currentGuild?.name,
            arenaRank: state.arenaState?.player?.rating,
          }
        );

        set({ friendSystemState: updatedState });
      },

      checkAndResetFriendGifts: () => {
        const state = get();
        
        if (!state.friendSystemState) {
          return;
        }

        if (shouldResetGifts(state.friendSystemState.lastGiftReset)) {
          const updatedState = resetDailyGifts(state.friendSystemState);
          
          set({ friendSystemState: updatedState });
          
          get().addNotification({
            type: 'info',
            title: '🎁 Làm Mới Quà Tặng',
            message: 'Có thể gửi quà cho bạn bè!',
          });
        }
      },

      // Enhanced Shop System Methods
      initializeEnhancedShop: () => {
        const state = get();
        
        if (state.enhancedShopState) {
          return;
        }

        const newState = initializeEnhancedShopState();
        set({ enhancedShopState: newState });
        
        get().addNotification({
          type: 'success',
          title: '🏪 Cửa Hàng Đã Mở',
          message: 'Khám phá các ưu đãi đặc biệt!',
        });
      },

      purchaseShopItemAction: (itemId: string, shopType: 'daily' | 'weekly' | 'flash') => {
        const state = get();
        
        if (!state.enhancedShopState) {
          get().addNotification({
            type: 'error',
            title: '❌ Lỗi',
            message: 'Cửa hàng chưa được khởi tạo',
          });
          return;
        }

        const result = purchaseShopItem(
          state.enhancedShopState,
          itemId,
          shopType,
          { gold: state.player.totalResources.gold, gems: state.player.totalResources.gems || 0 }
        );

        if (!result.success) {
          get().addNotification({
            type: 'error',
            title: '❌ Mua Thất Bại',
            message: result.error || 'Không thể mua vật phẩm',
          });
          return;
        }

        // Update shop state
        set({ enhancedShopState: result.state });

        // Deduct currency from player
        const item = shopType === 'daily' 
          ? state.enhancedShopState.dailyShop.items.find(i => i.id === itemId)
          : shopType === 'weekly'
          ? state.enhancedShopState.weeklyShop.items.find(i => i.id === itemId)
          : state.enhancedShopState.flashSales.find(s => s.active)?.items.find(i => i.id === itemId);

        if (item) {
          const vipDiscount = state.enhancedShopState.vipSystem.benefits.shopDiscountPercent;
          const finalPrice = Math.floor(item.currentPrice * (1 - vipDiscount / 100));
          
          if (item.currency === 'gold') {
            set((state) => ({
              player: {
                ...state.player,
                totalResources: {
                  ...state.player.totalResources,
                  gold: state.player.totalResources.gold - finalPrice,
                },
              },
            }));
          } else if (item.currency === 'gems') {
            set((state) => ({
              player: {
                ...state.player,
                totalResources: {
                  ...state.player.totalResources,
                  gems: (state.player.totalResources.gems || 0) - finalPrice,
                },
              },
            }));
          }
        }

        // Add rewards to player
        if (result.rewards) {
          const rewards = result.rewards;
          set((state) => ({
            player: {
              ...state.player,
              totalResources: {
                ...state.player.totalResources,
                gold: state.player.totalResources.gold + (rewards.gold || 0),
                gems: (state.player.totalResources.gems || 0) + (rewards.gems || 0),
              },
            },
          }));

          // Handle stamina
          if (rewards.stamina && state.worldMapState) {
            const updatedStamina = refillStamina(state.worldMapState.stamina, rewards.stamina);
            set({ worldMapState: { ...state.worldMapState, stamina: updatedStamina } });
          }

          get().addNotification({
            type: 'success',
            title: '✅ Mua Thành Công',
            message: `Đã mua ${item?.name}!`,
          });
        }
      },

      purchaseBundleAction: (bundleId: string) => {
        const state = get();
        
        if (!state.enhancedShopState) {
          get().addNotification({
            type: 'error',
            title: '❌ Lỗi',
            message: 'Cửa hàng chưa được khởi tạo',
          });
          return;
        }

        const result = purchaseBundle(
          state.enhancedShopState,
          bundleId,
          { gems: state.player.totalResources.gems || 0 }
        );

        if (!result.success) {
          get().addNotification({
            type: 'error',
            title: '❌ Mua Thất Bại',
            message: result.error || 'Không thể mua gói',
          });
          return;
        }

        // Update shop state
        set({ enhancedShopState: result.state });

        // Deduct gems from player
        const bundle = state.enhancedShopState.bundles.find(b => b.id === bundleId);
        if (bundle) {
          const vipDiscount = state.enhancedShopState.vipSystem.benefits.shopDiscountPercent;
          const finalPrice = Math.floor(bundle.currentPrice * (1 - vipDiscount / 100));
          
          set((state) => ({
            player: {
              ...state.player,
              totalResources: {
                ...state.player.totalResources,
                gems: (state.player.totalResources.gems || 0) - finalPrice,
              },
            },
          }));
        }

        // Add rewards to player
        if (result.rewards) {
          const rewards = result.rewards;
          set((state) => ({
            player: {
              ...state.player,
              totalResources: {
                ...state.player.totalResources,
                gold: state.player.totalResources.gold + (rewards.gold || 0),
                gems: (state.player.totalResources.gems || 0) + (rewards.gems || 0),
              },
            },
          }));

          // Handle stamina
          if (rewards.stamina && state.worldMapState) {
            const updatedStamina = refillStamina(state.worldMapState.stamina, rewards.stamina);
            set({ worldMapState: { ...state.worldMapState, stamina: updatedStamina } });
          }

          get().addNotification({
            type: 'success',
            title: '✅ Mua Gói Thành Công',
            message: `Đã mua ${bundle?.name}!`,
          });
        }
      },

      checkAndRefreshShops: () => {
        const state = get();
        
        if (!state.enhancedShopState) {
          return;
        }

        let updated = state.enhancedShopState;
        let didRefresh = false;

        // Check daily shop
        if (shouldRefreshDailyShop(updated)) {
          updated = refreshDailyShop(updated);
          didRefresh = true;
          get().addNotification({
            type: 'info',
            title: '🏪 Cửa Hàng Ngày Đã Làm Mới',
            message: 'Kiểm tra các vật phẩm mới!',
          });
        }

        // Check weekly shop
        if (shouldRefreshWeeklyShop(updated)) {
          updated = refreshWeeklyShop(updated);
          didRefresh = true;
          get().addNotification({
            type: 'info',
            title: '🏪 Cửa Hàng Tuần Đã Làm Mới',
            message: 'Khám phá ưu đãi tuần mới!',
          });
        }

        // Update flash sales
        updated = updateFlashSales(updated);

        if (didRefresh || updated !== state.enhancedShopState) {
          set({ enhancedShopState: updated });
        }
      },

      startFlashSaleAction: () => {
        const state = get();
        
        if (!state.enhancedShopState) {
          get().addNotification({
            type: 'error',
            title: '❌ Lỗi',
            message: 'Cửa hàng chưa được khởi tạo',
          });
          return;
        }

        const updatedState = startFlashSale(state.enhancedShopState);
        set({ enhancedShopState: updatedState });

        get().addNotification({
          type: 'success',
          title: '⚡ Flash Sale Đã Bắt Đầu',
          message: 'Giảm giá lên đến 80% trong 2 giờ!',
        });
      },

      // ========================================
      // Customization System Actions
      // ========================================

      initializeCustomization: () => {
        const state = get();
        if (state.customizationState) {
          return; // Already initialized
        }

        const newState = initializeCustomizationState();
        set({ customizationState: newState });

        get().addNotification({
          type: 'success',
          title: '🎨 Tùy Chỉnh Đã Mở',
          message: 'Bắt đầu cá nhân hóa trải nghiệm!',
        });
      },

      generateHeroSkinsForHero: (heroId: string, heroType: 'warrior' | 'archer' | 'mage') => {
        const state = get();
        if (!state.customizationState) {
          get().initializeCustomization();
          return;
        }

        const newSkins = generateHeroSkins(heroId, heroType);
        set((state) => ({
          customizationState: {
            ...state.customizationState!,
            heroSkins: [...state.customizationState!.heroSkins, ...newSkins],
          },
        }));
      },

      generatePetVariantsForPet: (petId: string, petType: 'dragon' | 'phoenix') => {
        const state = get();
        if (!state.customizationState) {
          get().initializeCustomization();
          return;
        }

        const newVariants = generatePetVariants(petId, petType);
        set((state) => ({
          customizationState: {
            ...state.customizationState!,
            petVariants: [...state.customizationState!.petVariants, ...newVariants],
          },
        }));
      },

      unlockHeroSkinAction: (skinId: string) => {
        const state = get();
        if (!state.customizationState) {
          get().addNotification({
            type: 'error',
            title: '❌ Lỗi',
            message: 'Hệ thống tùy chỉnh chưa được khởi tạo',
          });
          return;
        }

        const result = unlockHeroSkin(
          state.customizationState,
          skinId,
          {
            gems: state.player.totalResources.gems || 0,
            gold: state.player.totalResources.gold,
          }
        );

        if (!result.success) {
          get().addNotification({
            type: 'error',
            title: '❌ Không Thể Mở Khóa',
            message: result.error || 'Không đủ tài nguyên',
          });
          return;
        }

        if (result.state) {
          set({ customizationState: result.state });
        }

        // Deduct cost
        if (result.cost) {
          set((state) => ({
            player: {
              ...state.player,
              totalResources: {
                ...state.player.totalResources,
                gems: (state.player.totalResources.gems || 0) - (result.cost!.gems || 0),
                gold: state.player.totalResources.gold - (result.cost!.gold || 0),
              },
            },
          }));
        }

        get().addNotification({
          type: 'success',
          title: '✨ Mở Khóa Thành Công',
          message: 'Trang phục đã được mở khóa!',
        });
      },

      equipHeroSkinAction: (skinId: string) => {
        const state = get();
        if (!state.customizationState) {
          return;
        }

        const result = equipHeroSkin(state.customizationState, skinId);
        if (result.success && result.state) {
          set({ customizationState: result.state });
          get().addNotification({
            type: 'success',
            title: '✅ Đã Trang Bị',
            message: 'Trang phục đã được trang bị!',
          });
        } else {
          get().addNotification({
            type: 'error',
            title: '❌ Lỗi',
            message: result.error || 'Không thể trang bị',
          });
        }
      },

      unlockPetVariantAction: (variantId: string) => {
        const state = get();
        if (!state.customizationState) {
          get().addNotification({
            type: 'error',
            title: '❌ Lỗi',
            message: 'Hệ thống tùy chỉnh chưa được khởi tạo',
          });
          return;
        }

        // TODO: Get petEggs from player resources
        const result = unlockPetVariant(
          state.customizationState,
          variantId,
          {
            gems: state.player.totalResources.gems || 0,
            petEggs: 0, // TODO: Add to player resources
          }
        );

        if (!result.success) {
          get().addNotification({
            type: 'error',
            title: '❌ Không Thể Mở Khóa',
            message: result.error || 'Không đủ tài nguyên',
          });
          return;
        }

        if (result.state) {
          set({ customizationState: result.state });
        }

        // Deduct cost
        if (result.cost) {
          set((state) => ({
            player: {
              ...state.player,
              totalResources: {
                ...state.player.totalResources,
                gems: (state.player.totalResources.gems || 0) - (result.cost!.gems || 0),
              },
            },
          }));
        }

        get().addNotification({
          type: 'success',
          title: '✨ Mở Khóa Thành Công',
          message: 'Màu sắc mới đã được mở khóa!',
        });
      },

      equipPetVariantAction: (variantId: string) => {
        const state = get();
        if (!state.customizationState) {
          return;
        }

        const result = equipPetVariant(state.customizationState, variantId);
        if (result.success && result.state) {
          set({ customizationState: result.state });
          get().addNotification({
            type: 'success',
            title: '✅ Đã Trang Bị',
            message: 'Màu sắc đã được áp dụng!',
          });
        } else {
          get().addNotification({
            type: 'error',
            title: '❌ Lỗi',
            message: result.error || 'Không thể trang bị',
          });
        }
      },

      unlockProvinceThemeAction: (themeId: string) => {
        const state = get();
        if (!state.customizationState) {
          get().addNotification({
            type: 'error',
            title: '❌ Lỗi',
            message: 'Hệ thống tùy chỉnh chưa được khởi tạo',
          });
          return;
        }

        const result = unlockProvinceTheme(
          state.customizationState,
          themeId,
          {
            gems: state.player.totalResources.gems || 0,
            gold: state.player.totalResources.gold,
          }
        );

        if (!result.success) {
          get().addNotification({
            type: 'error',
            title: '❌ Không Thể Mở Khóa',
            message: result.error || 'Không đủ tài nguyên',
          });
          return;
        }

        if (result.state) {
          set({ customizationState: result.state });
        }

        // Deduct cost
        if (result.cost) {
          set((state) => ({
            player: {
              ...state.player,
              totalResources: {
                ...state.player.totalResources,
                gems: (state.player.totalResources.gems || 0) - (result.cost!.gems || 0),
                gold: state.player.totalResources.gold - (result.cost!.gold || 0),
              },
            },
          }));
        }

        get().addNotification({
          type: 'success',
          title: '✨ Mở Khóa Thành Công',
          message: 'Chủ đề mới đã được mở khóa!',
        });
      },

      activateProvinceThemeAction: (themeId: string) => {
        const state = get();
        if (!state.customizationState) {
          return;
        }

        const result = activateProvinceTheme(state.customizationState, themeId);
        if (result.success && result.state) {
          set({ customizationState: result.state });
          get().addNotification({
            type: 'success',
            title: '✅ Đã Áp Dụng',
            message: 'Chủ đề đã được áp dụng!',
          });
        } else {
          get().addNotification({
            type: 'error',
            title: '❌ Lỗi',
            message: result.error || 'Không thể áp dụng',
          });
        }
      },

      switchUIThemeAction: (theme: 'light' | 'dark') => {
        const state = get();
        if (!state.customizationState) {
          get().initializeCustomization();
        }

        const result = switchUITheme(state.customizationState!, theme);
        if (result.success && result.state) {
          set({ customizationState: result.state });
          get().addNotification({
            type: 'success',
            title: theme === 'dark' ? '🌙 Giao Diện Tối' : '☀️ Giao Diện Sáng',
            message: 'Đã chuyển giao diện!',
          });
        }
      },

      unlockAvatarFrameAction: (frameId: string) => {
        const state = get();
        if (!state.customizationState) {
          get().addNotification({
            type: 'error',
            title: '❌ Lỗi',
            message: 'Hệ thống tùy chỉnh chưa được khởi tạo',
          });
          return;
        }

        // TODO: Get achievement points from player
        const result = unlockAvatarFrame(
          state.customizationState,
          frameId,
          {
            gems: state.player.totalResources.gems || 0,
            achievementPoints: 0, // TODO: Add to player
          }
        );

        if (!result.success) {
          get().addNotification({
            type: 'error',
            title: '❌ Không Thể Mở Khóa',
            message: result.error || 'Không đủ tài nguyên',
          });
          return;
        }

        if (result.state) {
          set({ customizationState: result.state });
        }

        // Deduct cost
        if (result.cost) {
          set((state) => ({
            player: {
              ...state.player,
              totalResources: {
                ...state.player.totalResources,
                gems: (state.player.totalResources.gems || 0) - (result.cost!.gems || 0),
              },
            },
          }));
        }

        get().addNotification({
          type: 'success',
          title: '✨ Mở Khóa Thành Công',
          message: 'Khung avatar đã được mở khóa!',
        });
      },

      equipAvatarFrameAction: (frameId: string) => {
        const state = get();
        if (!state.customizationState) {
          return;
        }

        const result = equipAvatarFrame(state.customizationState, frameId);
        if (result.success && result.state) {
          set({ customizationState: result.state });
          get().addNotification({
            type: 'success',
            title: '✅ Đã Trang Bị',
            message: 'Khung avatar đã được trang bị!',
          });
        } else {
          get().addNotification({
            type: 'error',
            title: '❌ Lỗi',
            message: result.error || 'Không thể trang bị',
          });
        }
      },

      startPreviewAction: (type: 'skin' | 'variant' | 'theme' | 'frame', itemId: string) => {
        const state = get();
        if (!state.customizationState) {
          return;
        }

        const result = startPreview(state.customizationState, type, itemId);
        if (result.success && result.state) {
          set({ customizationState: result.state });
        }
      },

      endPreviewAction: () => {
        const state = get();
        if (!state.customizationState) {
          return;
        }

        const result = endPreview(state.customizationState);
        if (result.success && result.state) {
          set({ customizationState: result.state });
        }
      },
    }),
    {
      name: 'katagame-store',
      version: 1,
    }
  )
);