// Enhanced Shop System - Advanced shop with daily/weekly refreshes, flash sales, bundles, and VIP rewards

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'resource' | 'hero' | 'pet' | 'equipment' | 'bundle' | 'special';
  category: 'gold' | 'gems' | 'stamina' | 'hero_fragment' | 'pet_egg' | 'equipment' | 'bundle' | 'vip';
  
  // Rewards
  rewards: {
    gold?: number;
    gems?: number;
    stamina?: number;
    heroFragments?: number;
    petEggs?: number;
    equipment?: string[];
    vipPoints?: number;
  };
  
  // Pricing
  originalPrice: number;
  currentPrice: number;
  currency: 'gold' | 'gems' | 'vip_points';
  discount: number; // 0-100 percentage
  
  // Availability
  stock: number; // -1 for unlimited
  maxPurchasePerPlayer: number; // -1 for unlimited
  purchaseCount: number; // How many times player has purchased
  
  // Metadata
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  featured: boolean;
  new: boolean;
  hot: boolean;
  bestValue: boolean;
}

export interface DailyShopState {
  items: ShopItem[];
  lastRefreshDate: string; // YYYY-MM-DD format
  refreshTime: string; // HH:mm format (00:00 for midnight)
  nextRefreshTimestamp: number;
}

export interface WeeklyShopState {
  items: ShopItem[];
  lastRefreshDate: string; // ISO week start date
  weekNumber: number;
  nextRefreshTimestamp: number;
}

export interface FlashSale {
  id: string;
  title: string;
  description: string;
  items: ShopItem[];
  startTime: number;
  endTime: number;
  duration: number; // in milliseconds (e.g., 2 hours = 7200000)
  active: boolean;
}

export interface BundlePack {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'starter' | 'growth' | 'premium' | 'ultimate';
  
  // Contents
  contents: {
    gold: number;
    gems: number;
    stamina: number;
    heroFragments: number;
    petEggs: number;
    vipPoints: number;
    bonusItems?: string[];
  };
  
  // Pricing
  originalPrice: number;
  currentPrice: number;
  currency: 'gems' | 'vip_points';
  discount: number;
  
  // Availability
  available: boolean;
  oneTime: boolean; // Can only be purchased once
  purchased: boolean;
  featured: boolean;
  popular: boolean;
  
  // Display
  badgeText?: string; // e.g., "Best Value", "Most Popular", "Limited Time"
}

export interface PurchaseHistory {
  id: string;
  itemId: string;
  itemName: string;
  itemType: 'daily' | 'weekly' | 'flash' | 'bundle';
  price: number;
  currency: 'gold' | 'gems' | 'vip_points';
  timestamp: number;
  rewards: any;
}

export interface VIPSystem {
  points: number;
  level: number; // 0-10
  nextLevelPoints: number;
  benefits: {
    dailyGemBonus: number;
    shopDiscountPercent: number;
    extraStaminaRegen: number;
    fastForwardSpeed: number;
  };
}

export interface DiscountEvent {
  id: string;
  name: string;
  description: string;
  discountPercent: number; // Global discount for all items
  startTime: number;
  endTime: number;
  active: boolean;
  affectedCategories: string[]; // Which categories get discount
}

export interface EnhancedShopState {
  dailyShop: DailyShopState;
  weeklyShop: WeeklyShopState;
  flashSales: FlashSale[];
  bundles: BundlePack[];
  purchaseHistory: PurchaseHistory[];
  vipSystem: VIPSystem;
  discountEvents: DiscountEvent[];
  featuredItems: string[]; // Item IDs for featured section
}

// Constants
export const DAILY_SHOP_ITEM_COUNT = 6;
export const WEEKLY_SHOP_ITEM_COUNT = 8;
export const FLASH_SALE_DURATION = 2 * 60 * 60 * 1000; // 2 hours
export const MAX_PURCHASE_HISTORY = 100;
export const VIP_LEVELS = [
  { level: 0, points: 0, benefits: { dailyGemBonus: 0, shopDiscountPercent: 0, extraStaminaRegen: 0, fastForwardSpeed: 1 } },
  { level: 1, points: 100, benefits: { dailyGemBonus: 10, shopDiscountPercent: 2, extraStaminaRegen: 5, fastForwardSpeed: 1.1 } },
  { level: 2, points: 300, benefits: { dailyGemBonus: 20, shopDiscountPercent: 4, extraStaminaRegen: 10, fastForwardSpeed: 1.2 } },
  { level: 3, points: 600, benefits: { dailyGemBonus: 30, shopDiscountPercent: 6, extraStaminaRegen: 15, fastForwardSpeed: 1.3 } },
  { level: 4, points: 1000, benefits: { dailyGemBonus: 50, shopDiscountPercent: 8, extraStaminaRegen: 20, fastForwardSpeed: 1.4 } },
  { level: 5, points: 1500, benefits: { dailyGemBonus: 75, shopDiscountPercent: 10, extraStaminaRegen: 25, fastForwardSpeed: 1.5 } },
  { level: 6, points: 2200, benefits: { dailyGemBonus: 100, shopDiscountPercent: 12, extraStaminaRegen: 30, fastForwardSpeed: 1.6 } },
  { level: 7, points: 3000, benefits: { dailyGemBonus: 150, shopDiscountPercent: 15, extraStaminaRegen: 40, fastForwardSpeed: 1.8 } },
  { level: 8, points: 4000, benefits: { dailyGemBonus: 200, shopDiscountPercent: 18, extraStaminaRegen: 50, fastForwardSpeed: 2.0 } },
  { level: 9, points: 5500, benefits: { dailyGemBonus: 300, shopDiscountPercent: 20, extraStaminaRegen: 60, fastForwardSpeed: 2.5 } },
  { level: 10, points: 8000, benefits: { dailyGemBonus: 500, shopDiscountPercent: 25, extraStaminaRegen: 100, fastForwardSpeed: 3.0 } },
];

// Item templates for generating shop items
const DAILY_SHOP_TEMPLATES = [
  {
    name: 'Túi Vàng Nhỏ',
    description: 'Nhận 5,000 vàng',
    icon: '💰',
    type: 'resource',
    category: 'gold',
    rewards: { gold: 5000 },
    price: 50,
    currency: 'gems',
    rarity: 'common',
    stock: 5,
    maxPurchase: 3,
  },
  {
    name: 'Túi Vàng Lớn',
    description: 'Nhận 15,000 vàng',
    icon: '💰',
    type: 'resource',
    category: 'gold',
    rewards: { gold: 15000 },
    price: 120,
    currency: 'gems',
    rarity: 'rare',
    stock: 3,
    maxPurchase: 2,
  },
  {
    name: 'Phục Hồi Thể Lực',
    description: 'Nhận 50 thể lực',
    icon: '⚡',
    type: 'resource',
    category: 'stamina',
    rewards: { stamina: 50 },
    price: 100,
    currency: 'gems',
    rarity: 'rare',
    stock: 10,
    maxPurchase: 5,
  },
  {
    name: 'Mảnh Tướng Ngẫu Nhiên',
    description: 'Nhận 5 mảnh tướng ngẫu nhiên',
    icon: '👑',
    type: 'hero',
    category: 'hero_fragment',
    rewards: { heroFragments: 5 },
    price: 200,
    currency: 'gems',
    rarity: 'epic',
    stock: 3,
    maxPurchase: 2,
  },
  {
    name: 'Trứng Thú Cưỡi',
    description: 'Nhận 1 trứng thú cưỡi',
    icon: '🥚',
    type: 'pet',
    category: 'pet_egg',
    rewards: { petEggs: 1 },
    price: 150,
    currency: 'gems',
    rarity: 'epic',
    stock: 5,
    maxPurchase: 3,
  },
  {
    name: 'Đá Quý x100',
    description: 'Nhận 100 đá quý',
    icon: '💎',
    type: 'resource',
    category: 'gems',
    rewards: { gems: 100 },
    price: 8000,
    currency: 'gold',
    rarity: 'rare',
    stock: 2,
    maxPurchase: 1,
  },
];

const WEEKLY_SHOP_TEMPLATES = [
  {
    name: 'Kho Vàng Khổng Lồ',
    description: 'Nhận 50,000 vàng',
    icon: '💰',
    type: 'resource',
    category: 'gold',
    rewards: { gold: 50000 },
    price: 300,
    currency: 'gems',
    rarity: 'epic',
    stock: 3,
    maxPurchase: 2,
  },
  {
    name: 'Gói Thể Lực Tuần',
    description: 'Nhận 200 thể lực',
    icon: '⚡',
    type: 'resource',
    category: 'stamina',
    rewards: { stamina: 200 },
    price: 350,
    currency: 'gems',
    rarity: 'epic',
    stock: 2,
    maxPurchase: 1,
  },
  {
    name: 'Mảnh Tướng Hiếm',
    description: 'Nhận 20 mảnh tướng hiếm',
    icon: '👑',
    type: 'hero',
    category: 'hero_fragment',
    rewards: { heroFragments: 20 },
    price: 600,
    currency: 'gems',
    rarity: 'legendary',
    stock: 2,
    maxPurchase: 1,
  },
  {
    name: 'Trứng Thú Cưỡi Hiếm',
    description: 'Nhận 3 trứng thú cưỡi hiếm',
    icon: '🥚',
    type: 'pet',
    category: 'pet_egg',
    rewards: { petEggs: 3 },
    price: 400,
    currency: 'gems',
    rarity: 'legendary',
    stock: 3,
    maxPurchase: 2,
  },
  {
    name: 'Đá Quý x500',
    description: 'Nhận 500 đá quý',
    icon: '💎',
    type: 'resource',
    category: 'gems',
    rewards: { gems: 500 },
    price: 35000,
    currency: 'gold',
    rarity: 'epic',
    stock: 1,
    maxPurchase: 1,
  },
  {
    name: 'Điểm VIP x100',
    description: 'Nhận 100 điểm VIP',
    icon: '⭐',
    type: 'special',
    category: 'vip',
    rewards: { vipPoints: 100 },
    price: 500,
    currency: 'gems',
    rarity: 'legendary',
    stock: 2,
    maxPurchase: 2,
  },
];

// Initialize enhanced shop state
export function initializeEnhancedShopState(): EnhancedShopState {
  const now = Date.now();
  const today = new Date().toISOString().split('T')[0];
  
  return {
    dailyShop: {
      items: generateDailyShopItems(),
      lastRefreshDate: today,
      refreshTime: '00:00',
      nextRefreshTimestamp: getNextMidnight(),
    },
    weeklyShop: {
      items: generateWeeklyShopItems(),
      lastRefreshDate: getWeekStartDate(),
      weekNumber: getWeekNumber(new Date()),
      nextRefreshTimestamp: getNextMonday(),
    },
    flashSales: [],
    bundles: generateBundlePacks(),
    purchaseHistory: [],
    vipSystem: {
      points: 0,
      level: 0,
      nextLevelPoints: VIP_LEVELS[1].points,
      benefits: VIP_LEVELS[0].benefits,
    },
    discountEvents: [],
    featuredItems: [],
  };
}

// Generate daily shop items
function generateDailyShopItems(): ShopItem[] {
  const items: ShopItem[] = [];
  const selectedTemplates = [...DAILY_SHOP_TEMPLATES]
    .sort(() => Math.random() - 0.5)
    .slice(0, DAILY_SHOP_ITEM_COUNT);
  
  selectedTemplates.forEach((template, index) => {
    const discount = Math.random() < 0.3 ? Math.floor(Math.random() * 30) + 10 : 0; // 30% chance of 10-40% discount
    const currentPrice = Math.floor(template.price * (1 - discount / 100));
    
    items.push({
      id: `daily_${Date.now()}_${index}`,
      name: template.name,
      description: template.description,
      icon: template.icon,
      type: template.type as any,
      category: template.category as any,
      rewards: template.rewards,
      originalPrice: template.price,
      currentPrice,
      currency: template.currency as any,
      discount,
      stock: template.stock,
      maxPurchasePerPlayer: template.maxPurchase,
      purchaseCount: 0,
      rarity: template.rarity as any,
      featured: Math.random() < 0.2,
      new: Math.random() < 0.3,
      hot: discount > 20,
      bestValue: false,
    });
  });
  
  return items;
}

// Generate weekly shop items
function generateWeeklyShopItems(): ShopItem[] {
  const items: ShopItem[] = [];
  const selectedTemplates = [...WEEKLY_SHOP_TEMPLATES]
    .sort(() => Math.random() - 0.5)
    .slice(0, WEEKLY_SHOP_ITEM_COUNT);
  
  selectedTemplates.forEach((template, index) => {
    const discount = Math.random() < 0.4 ? Math.floor(Math.random() * 40) + 15 : 0; // 40% chance of 15-55% discount
    const currentPrice = Math.floor(template.price * (1 - discount / 100));
    
    items.push({
      id: `weekly_${Date.now()}_${index}`,
      name: template.name,
      description: template.description,
      icon: template.icon,
      type: template.type as any,
      category: template.category as any,
      rewards: template.rewards,
      originalPrice: template.price,
      currentPrice,
      currency: template.currency as any,
      discount,
      stock: template.stock,
      maxPurchasePerPlayer: template.maxPurchase,
      purchaseCount: 0,
      rarity: template.rarity as any,
      featured: Math.random() < 0.3,
      new: true,
      hot: discount > 30,
      bestValue: discount > 40,
    });
  });
  
  return items;
}

// Generate bundle packs
function generateBundlePacks(): BundlePack[] {
  return [
    {
      id: 'bundle_starter',
      name: 'Gói Khởi Đầu',
      description: 'Hoàn hảo cho người chơi mới',
      icon: '📦',
      tier: 'starter',
      contents: {
        gold: 10000,
        gems: 100,
        stamina: 50,
        heroFragments: 5,
        petEggs: 1,
        vipPoints: 10,
      },
      originalPrice: 200,
      currentPrice: 99,
      currency: 'gems',
      discount: 50,
      available: true,
      oneTime: true,
      purchased: false,
      featured: true,
      popular: false,
      badgeText: 'Giá Tốt Nhất',
    },
    {
      id: 'bundle_growth',
      name: 'Gói Phát Triển',
      description: 'Tăng tốc tiến độ của bạn',
      icon: '📦',
      tier: 'growth',
      contents: {
        gold: 30000,
        gems: 300,
        stamina: 150,
        heroFragments: 15,
        petEggs: 3,
        vipPoints: 30,
      },
      originalPrice: 600,
      currentPrice: 399,
      currency: 'gems',
      discount: 33,
      available: true,
      oneTime: false,
      purchased: false,
      featured: true,
      popular: true,
      badgeText: 'Phổ Biến Nhất',
    },
    {
      id: 'bundle_premium',
      name: 'Gói Cao Cấp',
      description: 'Giá trị tuyệt vời cho người chơi nghiêm túc',
      icon: '📦',
      tier: 'premium',
      contents: {
        gold: 75000,
        gems: 800,
        stamina: 400,
        heroFragments: 40,
        petEggs: 8,
        vipPoints: 100,
        bonusItems: ['Khiên Bảo Vệ 7 Ngày', 'Tăng Tốc x2 24h'],
      },
      originalPrice: 1500,
      currentPrice: 999,
      currency: 'gems',
      discount: 33,
      available: true,
      oneTime: false,
      purchased: false,
      featured: true,
      popular: false,
    },
    {
      id: 'bundle_ultimate',
      name: 'Gói Tối Thượng',
      description: 'Gói tốt nhất dành cho chúa tể',
      icon: '📦',
      tier: 'ultimate',
      contents: {
        gold: 200000,
        gems: 2000,
        stamina: 1000,
        heroFragments: 100,
        petEggs: 20,
        vipPoints: 500,
        bonusItems: ['VIP Tháng', 'Trang Phục Độc Quyền', 'Danh Hiệu Huyền Thoại'],
      },
      originalPrice: 5000,
      currentPrice: 2999,
      currency: 'gems',
      discount: 40,
      available: true,
      oneTime: true,
      purchased: false,
      featured: true,
      popular: false,
      badgeText: 'Giới Hạn',
    },
  ];
}

// Check if daily shop needs refresh
export function shouldRefreshDailyShop(state: EnhancedShopState): boolean {
  const today = new Date().toISOString().split('T')[0];
  return state.dailyShop.lastRefreshDate !== today;
}

// Refresh daily shop
export function refreshDailyShop(state: EnhancedShopState): EnhancedShopState {
  const today = new Date().toISOString().split('T')[0];
  
  return {
    ...state,
    dailyShop: {
      items: generateDailyShopItems(),
      lastRefreshDate: today,
      refreshTime: '00:00',
      nextRefreshTimestamp: getNextMidnight(),
    },
  };
}

// Check if weekly shop needs refresh
export function shouldRefreshWeeklyShop(state: EnhancedShopState): boolean {
  const currentWeek = getWeekNumber(new Date());
  return state.weeklyShop.weekNumber !== currentWeek;
}

// Refresh weekly shop
export function refreshWeeklyShop(state: EnhancedShopState): EnhancedShopState {
  return {
    ...state,
    weeklyShop: {
      items: generateWeeklyShopItems(),
      lastRefreshDate: getWeekStartDate(),
      weekNumber: getWeekNumber(new Date()),
      nextRefreshTimestamp: getNextMonday(),
    },
  };
}

// Purchase item from shop
export function purchaseShopItem(
  state: EnhancedShopState,
  itemId: string,
  shopType: 'daily' | 'weekly' | 'flash',
  playerResources: { gold: number; gems: number }
): { success: boolean; state?: EnhancedShopState; error?: string; rewards?: any } {
  let shop: DailyShopState | WeeklyShopState | FlashSale | undefined;
  let itemIndex = -1;
  
  // Find the shop and item
  if (shopType === 'daily') {
    shop = state.dailyShop;
    itemIndex = shop.items.findIndex(item => item.id === itemId);
  } else if (shopType === 'weekly') {
    shop = state.weeklyShop;
    itemIndex = shop.items.findIndex(item => item.id === itemId);
  } else if (shopType === 'flash') {
    shop = state.flashSales.find(sale => sale.active && sale.items.some(item => item.id === itemId));
    if (shop) {
      itemIndex = shop.items.findIndex(item => item.id === itemId);
    }
  }
  
  if (!shop || itemIndex === -1) {
    return { success: false, error: 'Không tìm thấy vật phẩm' };
  }
  
  const item = (shop as any).items[itemIndex];
  
  // Check purchase limit
  if (item.maxPurchasePerPlayer !== -1 && item.purchaseCount >= item.maxPurchasePerPlayer) {
    return { success: false, error: 'Đã đạt giới hạn mua' };
  }
  
  // Check stock
  if (item.stock !== -1 && item.stock <= 0) {
    return { success: false, error: 'Hết hàng' };
  }
  
  // Apply VIP discount
  const vipDiscount = state.vipSystem.benefits.shopDiscountPercent;
  const finalPrice = Math.floor(item.currentPrice * (1 - vipDiscount / 100));
  
  // Check if player can afford
  if (item.currency === 'gold' && playerResources.gold < finalPrice) {
    return { success: false, error: 'Không đủ vàng' };
  }
  if (item.currency === 'gems' && playerResources.gems < finalPrice) {
    return { success: false, error: 'Không đủ đá quý' };
  }
  
  // Process purchase
  const newState = { ...state };
  
  // Update item
  if (shopType === 'daily') {
    newState.dailyShop = {
      ...newState.dailyShop,
      items: [...newState.dailyShop.items],
    };
    newState.dailyShop.items[itemIndex] = {
      ...item,
      purchaseCount: item.purchaseCount + 1,
      stock: item.stock === -1 ? -1 : item.stock - 1,
    };
  } else if (shopType === 'weekly') {
    newState.weeklyShop = {
      ...newState.weeklyShop,
      items: [...newState.weeklyShop.items],
    };
    newState.weeklyShop.items[itemIndex] = {
      ...item,
      purchaseCount: item.purchaseCount + 1,
      stock: item.stock === -1 ? -1 : item.stock - 1,
    };
  } else if (shopType === 'flash' && shop) {
    const saleIndex = newState.flashSales.findIndex(s => s.id === (shop as FlashSale).id);
    newState.flashSales = [...newState.flashSales];
    newState.flashSales[saleIndex] = {
      ...newState.flashSales[saleIndex],
      items: [...newState.flashSales[saleIndex].items],
    };
    newState.flashSales[saleIndex].items[itemIndex] = {
      ...item,
      purchaseCount: item.purchaseCount + 1,
      stock: item.stock === -1 ? -1 : item.stock - 1,
    };
  }
  
  // Add to purchase history
  const purchase: PurchaseHistory = {
    id: `purchase_${Date.now()}`,
    itemId: item.id,
    itemName: item.name,
    itemType: shopType,
    price: finalPrice,
    currency: item.currency,
    timestamp: Date.now(),
    rewards: item.rewards,
  };
  
  newState.purchaseHistory = [purchase, ...newState.purchaseHistory].slice(0, MAX_PURCHASE_HISTORY);
  
  // Add VIP points if paid with gems
  if (item.currency === 'gems') {
    const vipPointsEarned = Math.floor(finalPrice / 10); // 1 VIP point per 10 gems spent
    newState.vipSystem = addVIPPoints(newState.vipSystem, vipPointsEarned);
  }
  
  return {
    success: true,
    state: newState,
    rewards: item.rewards,
  };
}

// Purchase bundle pack
export function purchaseBundle(
  state: EnhancedShopState,
  bundleId: string,
  playerResources: { gems: number }
): { success: boolean; state?: EnhancedShopState; error?: string; rewards?: any } {
  const bundleIndex = state.bundles.findIndex(b => b.id === bundleId);
  
  if (bundleIndex === -1) {
    return { success: false, error: 'Không tìm thấy gói' };
  }
  
  const bundle = state.bundles[bundleIndex];
  
  if (!bundle.available) {
    return { success: false, error: 'Gói không khả dụng' };
  }
  
  if (bundle.oneTime && bundle.purchased) {
    return { success: false, error: 'Đã mua gói này rồi' };
  }
  
  // Apply VIP discount
  const vipDiscount = state.vipSystem.benefits.shopDiscountPercent;
  const finalPrice = Math.floor(bundle.currentPrice * (1 - vipDiscount / 100));
  
  if (playerResources.gems < finalPrice) {
    return { success: false, error: 'Không đủ đá quý' };
  }
  
  // Process purchase
  const newState = { ...state };
  newState.bundles = [...newState.bundles];
  newState.bundles[bundleIndex] = {
    ...bundle,
    purchased: bundle.oneTime ? true : bundle.purchased,
  };
  
  // Add to purchase history
  const purchase: PurchaseHistory = {
    id: `purchase_${Date.now()}`,
    itemId: bundle.id,
    itemName: bundle.name,
    itemType: 'bundle',
    price: finalPrice,
    currency: 'gems',
    timestamp: Date.now(),
    rewards: bundle.contents,
  };
  
  newState.purchaseHistory = [purchase, ...newState.purchaseHistory].slice(0, MAX_PURCHASE_HISTORY);
  
  // Add VIP points
  const vipPointsEarned = Math.floor(finalPrice / 10) + (bundle.contents.vipPoints || 0);
  newState.vipSystem = addVIPPoints(newState.vipSystem, vipPointsEarned);
  
  return {
    success: true,
    state: newState,
    rewards: bundle.contents,
  };
}

// Add VIP points and level up
export function addVIPPoints(vipSystem: VIPSystem, points: number): VIPSystem {
  const newPoints = vipSystem.points + points;
  let newLevel = vipSystem.level;
  
  // Find new VIP level
  for (let i = VIP_LEVELS.length - 1; i >= 0; i--) {
    if (newPoints >= VIP_LEVELS[i].points) {
      newLevel = VIP_LEVELS[i].level;
      break;
    }
  }
  
  const nextLevel = VIP_LEVELS[Math.min(newLevel + 1, VIP_LEVELS.length - 1)];
  
  return {
    points: newPoints,
    level: newLevel,
    nextLevelPoints: nextLevel.points,
    benefits: VIP_LEVELS[newLevel].benefits,
  };
}

// Start a flash sale
export function startFlashSale(state: EnhancedShopState): EnhancedShopState {
  // Select 3-5 random items with heavy discounts
  const allTemplates = [...DAILY_SHOP_TEMPLATES, ...WEEKLY_SHOP_TEMPLATES];
  const selectedTemplates = allTemplates
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 3) + 3); // 3-5 items
  
  const flashItems: ShopItem[] = selectedTemplates.map((template, index) => {
    const discount = Math.floor(Math.random() * 30) + 50; // 50-80% discount
    const currentPrice = Math.floor(template.price * (1 - discount / 100));
    
    return {
      id: `flash_${Date.now()}_${index}`,
      name: template.name,
      description: template.description,
      icon: template.icon,
      type: template.type as any,
      category: template.category as any,
      rewards: template.rewards,
      originalPrice: template.price,
      currentPrice,
      currency: template.currency as any,
      discount,
      stock: Math.floor(template.stock * 1.5),
      maxPurchasePerPlayer: template.maxPurchase,
      purchaseCount: 0,
      rarity: template.rarity as any,
      featured: true,
      new: false,
      hot: true,
      bestValue: discount >= 60,
    };
  });
  
  const now = Date.now();
  const flashSale: FlashSale = {
    id: `flash_${now}`,
    title: 'Flash Sale ⚡',
    description: 'Giảm giá khủng chỉ trong 2 giờ!',
    items: flashItems,
    startTime: now,
    endTime: now + FLASH_SALE_DURATION,
    duration: FLASH_SALE_DURATION,
    active: true,
  };
  
  return {
    ...state,
    flashSales: [...state.flashSales, flashSale],
  };
}

// Update flash sales (check for expired ones)
export function updateFlashSales(state: EnhancedShopState): EnhancedShopState {
  const now = Date.now();
  const updatedSales = state.flashSales.map(sale => ({
    ...sale,
    active: sale.active && sale.endTime > now,
  }));
  
  // Remove expired sales after 1 hour
  const filteredSales = updatedSales.filter(sale => 
    sale.active || (now - sale.endTime < 60 * 60 * 1000)
  );
  
  return {
    ...state,
    flashSales: filteredSales,
  };
}

// Utility functions
function getNextMidnight(): number {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
}

function getNextMonday(): number {
  const now = new Date();
  const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday.getTime();
}

function getWeekStartDate(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday as start
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().split('T')[0];
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// Format countdown timer
export function formatCountdown(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Get rarity color
export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common': return '#9ca3af';
    case 'rare': return '#3b82f6';
    case 'epic': return '#a855f7';
    case 'legendary': return '#f59e0b';
    default: return '#6b7280';
  }
}

// Get rarity text
export function getRarityText(rarity: string): string {
  switch (rarity) {
    case 'common': return 'Thường';
    case 'rare': return 'Hiếm';
    case 'epic': return 'Sử Thi';
    case 'legendary': return 'Huyền Thoại';
    default: return 'Không Rõ';
  }
}
