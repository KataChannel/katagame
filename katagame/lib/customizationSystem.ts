// Customization System - Hero skins, pet variants, themes, avatar frames

export type SkinRarity = 'default' | 'rare' | 'legendary';
export type PetVariantType = 'default' | 'fire' | 'ice' | 'nature';
export type ProvinceTheme = 'classic' | 'modern' | 'fantasy' | 'cyberpunk';
export type UITheme = 'light' | 'dark';

export interface HeroSkin {
  id: string;
  heroId: string;
  name: string;
  rarity: SkinRarity;
  description: string;
  icon: string;
  effects: {
    particleColor?: string;
    glowColor?: string;
    trailEffect?: string;
  };
  unlocked: boolean;
  unlockCost?: {
    gems?: number;
    gold?: number;
    specialCurrency?: number;
  };
  isEquipped: boolean;
}

export interface PetColorVariant {
  id: string;
  petId: string;
  name: string;
  variant: PetVariantType;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  unlocked: boolean;
  unlockCost?: {
    gems?: number;
    petEggs?: number;
  };
  isEquipped: boolean;
}

export interface ProvinceThemeConfig {
  id: string;
  name: string;
  theme: ProvinceTheme;
  description: string;
  preview: string;
  colors: {
    background: string;
    card: string;
    text: string;
    accent: string;
  };
  unlocked: boolean;
  unlockCost?: {
    gems?: number;
    gold?: number;
  };
  isActive: boolean;
}

export interface UIThemeConfig {
  id: string;
  name: string;
  theme: UITheme;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
  isActive: boolean;
}

export interface AvatarFrame {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  icon: string;
  borderStyle: string;
  borderColor: string;
  glowEffect?: string;
  unlocked: boolean;
  unlockCost?: {
    gems?: number;
    achievementPoints?: number;
  };
  isEquipped: boolean;
}

export interface CustomizationState {
  heroSkins: HeroSkin[];
  petVariants: PetColorVariant[];
  provinceThemes: ProvinceThemeConfig[];
  uiTheme: UIThemeConfig;
  avatarFrames: AvatarFrame[];
  previewMode: {
    active: boolean;
    type?: 'skin' | 'variant' | 'theme' | 'frame';
    itemId?: string;
  };
}

// Hero Skin Templates (3 per hero type)
const HERO_SKIN_TEMPLATES = [
  // Warrior Skins
  {
    heroType: 'warrior',
    skins: [
      {
        name: 'Chiến Binh Cổ Điển',
        rarity: 'default' as SkinRarity,
        description: 'Trang phục chiến binh truyền thống',
        icon: '⚔️',
        effects: { particleColor: '#ef4444', glowColor: '#dc2626' },
        cost: { gems: 0 },
      },
      {
        name: 'Chiến Binh Rồng Đỏ',
        rarity: 'rare' as SkinRarity,
        description: 'Trang phục có hình rồng lửa',
        icon: '🐉',
        effects: { particleColor: '#ff6b6b', glowColor: '#ff3838', trailEffect: 'fire' },
        cost: { gems: 500, gold: 10000 },
      },
      {
        name: 'Thiên Tướng Huyền Thoại',
        rarity: 'legendary' as SkinRarity,
        description: 'Trang phục thần thánh với sức mạnh tối thượng',
        icon: '👑',
        effects: { particleColor: '#ffd700', glowColor: '#ffed4e', trailEffect: 'divine' },
        cost: { gems: 2000, specialCurrency: 100 },
      },
    ],
  },
  // Archer Skins
  {
    heroType: 'archer',
    skins: [
      {
        name: 'Cung Thủ Cổ Điển',
        rarity: 'default' as SkinRarity,
        description: 'Trang phục cung thủ truyền thống',
        icon: '🏹',
        effects: { particleColor: '#10b981', glowColor: '#059669' },
        cost: { gems: 0 },
      },
      {
        name: 'Thợ Săn Rừng Xanh',
        rarity: 'rare' as SkinRarity,
        description: 'Trang phục của thợ săn huyền thoại',
        icon: '🌿',
        effects: { particleColor: '#4ade80', glowColor: '#22c55e', trailEffect: 'nature' },
        cost: { gems: 500, gold: 10000 },
      },
      {
        name: 'Thiên Nhãn Thần Xạ',
        rarity: 'legendary' as SkinRarity,
        description: 'Trang phục với sức mạnh thần thánh',
        icon: '💫',
        effects: { particleColor: '#60a5fa', glowColor: '#3b82f6', trailEffect: 'cosmic' },
        cost: { gems: 2000, specialCurrency: 100 },
      },
    ],
  },
  // Mage Skins
  {
    heroType: 'mage',
    skins: [
      {
        name: 'Pháp Sư Cổ Điển',
        rarity: 'default' as SkinRarity,
        description: 'Áo choàng pháp sư truyền thống',
        icon: '🔮',
        effects: { particleColor: '#8b5cf6', glowColor: '#7c3aed' },
        cost: { gems: 0 },
      },
      {
        name: 'Đạo Sư Nguyên Tố',
        rarity: 'rare' as SkinRarity,
        description: 'Sức mạnh của các nguyên tố',
        icon: '🌟',
        effects: { particleColor: '#a78bfa', glowColor: '#8b5cf6', trailEffect: 'arcane' },
        cost: { gems: 500, gold: 10000 },
      },
      {
        name: 'Đại Pháp Sư Thời Gian',
        rarity: 'legendary' as SkinRarity,
        description: 'Kiểm soát thời gian và không gian',
        icon: '⏰',
        effects: { particleColor: '#c084fc', glowColor: '#a855f7', trailEffect: 'time' },
        cost: { gems: 2000, specialCurrency: 100 },
      },
    ],
  },
];

// Pet Color Variant Templates (4 per pet type)
const PET_VARIANT_TEMPLATES = [
  {
    petType: 'dragon',
    variants: [
      {
        name: 'Rồng Truyền Thống',
        variant: 'default' as PetVariantType,
        description: 'Màu sắc rồng cổ điển',
        colors: { primary: '#ef4444', secondary: '#dc2626', accent: '#fca5a5' },
        cost: { gems: 0 },
      },
      {
        name: 'Rồng Lửa',
        variant: 'fire' as PetVariantType,
        description: 'Sức mạnh của ngọn lửa',
        colors: { primary: '#ff6b6b', secondary: '#ff3838', accent: '#ffa07a' },
        cost: { gems: 300, petEggs: 1 },
      },
      {
        name: 'Rồng Băng',
        variant: 'ice' as PetVariantType,
        description: 'Sức mạnh của băng giá',
        colors: { primary: '#60a5fa', secondary: '#3b82f6', accent: '#93c5fd' },
        cost: { gems: 300, petEggs: 1 },
      },
      {
        name: 'Rồng Rừng',
        variant: 'nature' as PetVariantType,
        description: 'Sức mạnh của thiên nhiên',
        colors: { primary: '#10b981', secondary: '#059669', accent: '#6ee7b7' },
        cost: { gems: 300, petEggs: 1 },
      },
    ],
  },
  {
    petType: 'phoenix',
    variants: [
      {
        name: 'Phượng Hoàng Truyền Thống',
        variant: 'default' as PetVariantType,
        description: 'Màu sắc phượng hoàng cổ điển',
        colors: { primary: '#f97316', secondary: '#ea580c', accent: '#fdba74' },
        cost: { gems: 0 },
      },
      {
        name: 'Phượng Hoàng Lửa',
        variant: 'fire' as PetVariantType,
        description: 'Ngọn lửa bất diệt',
        colors: { primary: '#ef4444', secondary: '#dc2626', accent: '#fca5a5' },
        cost: { gems: 300, petEggs: 1 },
      },
      {
        name: 'Phượng Hoàng Băng',
        variant: 'ice' as PetVariantType,
        description: 'Băng giá vĩnh cửu',
        colors: { primary: '#06b6d4', secondary: '#0891b2', accent: '#67e8f9' },
        cost: { gems: 300, petEggs: 1 },
      },
      {
        name: 'Phượng Hoàng Rừng',
        variant: 'nature' as PetVariantType,
        description: 'Sinh lực vô tận',
        colors: { primary: '#22c55e', secondary: '#16a34a', accent: '#86efac' },
        cost: { gems: 300, petEggs: 1 },
      },
    ],
  },
];

// Province Theme Templates
const PROVINCE_THEME_TEMPLATES: ProvinceThemeConfig[] = [
  {
    id: 'theme_classic',
    name: 'Cổ Điển Việt Nam',
    theme: 'classic',
    description: 'Phong cách truyền thống Việt Nam',
    preview: '🏯',
    colors: {
      background: 'from-red-50 via-yellow-50 to-orange-50',
      card: 'bg-white',
      text: 'text-gray-900',
      accent: 'text-red-600',
    },
    unlocked: true,
    isActive: true,
  },
  {
    id: 'theme_modern',
    name: 'Hiện Đại',
    theme: 'modern',
    description: 'Phong cách hiện đại, tối giản',
    preview: '🏙️',
    colors: {
      background: 'from-slate-50 via-gray-50 to-zinc-50',
      card: 'bg-white',
      text: 'text-gray-900',
      accent: 'text-blue-600',
    },
    unlocked: false,
    unlockCost: { gems: 500, gold: 20000 },
    isActive: false,
  },
  {
    id: 'theme_fantasy',
    name: 'Thần T화',
    theme: 'fantasy',
    description: 'Thế giới phép thuật và kỳ ảo',
    preview: '🔮',
    colors: {
      background: 'from-purple-900 via-pink-900 to-indigo-900',
      card: 'bg-purple-800/50',
      text: 'text-white',
      accent: 'text-pink-400',
    },
    unlocked: false,
    unlockCost: { gems: 1000, gold: 50000 },
    isActive: false,
  },
  {
    id: 'theme_cyberpunk',
    name: 'Cyberpunk',
    theme: 'cyberpunk',
    description: 'Tương lai với neon và công nghệ',
    preview: '🌃',
    colors: {
      background: 'from-slate-900 via-purple-900 to-slate-900',
      card: 'bg-slate-800/80',
      text: 'text-cyan-400',
      accent: 'text-pink-500',
    },
    unlocked: false,
    unlockCost: { gems: 1500, gold: 75000 },
    isActive: false,
  },
];

// UI Theme Templates
const UI_THEME_TEMPLATES: UIThemeConfig[] = [
  {
    id: 'ui_light',
    name: 'Sáng',
    theme: 'light',
    description: 'Giao diện sáng, dễ nhìn ban ngày',
    colors: {
      primary: '#ef4444',
      secondary: '#f59e0b',
      background: '#ffffff',
      surface: '#f3f4f6',
      text: '#111827',
      accent: '#dc2626',
    },
    isActive: true,
  },
  {
    id: 'ui_dark',
    name: 'Tối',
    theme: 'dark',
    description: 'Giao diện tối, bảo vệ mắt ban đêm',
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      background: '#111827',
      surface: '#1f2937',
      text: '#f9fafb',
      accent: '#60a5fa',
    },
    isActive: false,
  },
];

// Avatar Frame Templates (15 frames)
const AVATAR_FRAME_TEMPLATES: AvatarFrame[] = [
  {
    id: 'frame_default',
    name: 'Khung Cơ Bản',
    description: 'Khung avatar mặc định',
    rarity: 'common',
    icon: '⭕',
    borderStyle: 'border-2',
    borderColor: 'border-gray-400',
    unlocked: true,
    isEquipped: true,
  },
  {
    id: 'frame_bronze',
    name: 'Khung Đồng',
    description: 'Khung màu đồng cho tân binh',
    rarity: 'common',
    icon: '🥉',
    borderStyle: 'border-3',
    borderColor: 'border-yellow-700',
    unlocked: false,
    unlockCost: { gems: 100 },
    isEquipped: false,
  },
  {
    id: 'frame_silver',
    name: 'Khung Bạc',
    description: 'Khung bạc sáng bóng',
    rarity: 'rare',
    icon: '🥈',
    borderStyle: 'border-3',
    borderColor: 'border-gray-400',
    glowEffect: 'shadow-lg shadow-gray-400',
    unlocked: false,
    unlockCost: { gems: 300 },
    isEquipped: false,
  },
  {
    id: 'frame_gold',
    name: 'Khung Vàng',
    description: 'Khung vàng cao quý',
    rarity: 'rare',
    icon: '🥇',
    borderStyle: 'border-4',
    borderColor: 'border-yellow-500',
    glowEffect: 'shadow-lg shadow-yellow-500',
    unlocked: false,
    unlockCost: { gems: 500 },
    isEquipped: false,
  },
  {
    id: 'frame_dragon',
    name: 'Khung Rồng',
    description: 'Khung với hình rồng uy nghiêm',
    rarity: 'epic',
    icon: '🐉',
    borderStyle: 'border-4',
    borderColor: 'border-red-600',
    glowEffect: 'shadow-xl shadow-red-600',
    unlocked: false,
    unlockCost: { gems: 800, achievementPoints: 50 },
    isEquipped: false,
  },
  {
    id: 'frame_phoenix',
    name: 'Khung Phượng',
    description: 'Khung với hình phượng hoàng',
    rarity: 'epic',
    icon: '🦅',
    borderStyle: 'border-4',
    borderColor: 'border-orange-600',
    glowEffect: 'shadow-xl shadow-orange-600',
    unlocked: false,
    unlockCost: { gems: 800, achievementPoints: 50 },
    isEquipped: false,
  },
  {
    id: 'frame_jade',
    name: 'Khung Ngọc Bích',
    description: 'Khung ngọc quý hiếm',
    rarity: 'epic',
    icon: '💎',
    borderStyle: 'border-4',
    borderColor: 'border-emerald-600',
    glowEffect: 'shadow-xl shadow-emerald-600',
    unlocked: false,
    unlockCost: { gems: 1000, achievementPoints: 75 },
    isEquipped: false,
  },
  {
    id: 'frame_diamond',
    name: 'Khung Kim Cương',
    description: 'Khung kim cương lấp lánh',
    rarity: 'legendary',
    icon: '💠',
    borderStyle: 'border-4',
    borderColor: 'border-cyan-400',
    glowEffect: 'shadow-2xl shadow-cyan-400 animate-pulse',
    unlocked: false,
    unlockCost: { gems: 1500, achievementPoints: 100 },
    isEquipped: false,
  },
  {
    id: 'frame_rainbow',
    name: 'Khung Cầu Vồng',
    description: 'Khung với hiệu ứng cầu vồng',
    rarity: 'legendary',
    icon: '🌈',
    borderStyle: 'border-4',
    borderColor: 'border-gradient-rainbow',
    glowEffect: 'shadow-2xl shadow-purple-500 animate-pulse',
    unlocked: false,
    unlockCost: { gems: 2000, achievementPoints: 150 },
    isEquipped: false,
  },
  {
    id: 'frame_celestial',
    name: 'Khung Thiên Thể',
    description: 'Khung với sức mạnh vũ trụ',
    rarity: 'legendary',
    icon: '⭐',
    borderStyle: 'border-4',
    borderColor: 'border-purple-600',
    glowEffect: 'shadow-2xl shadow-purple-600 animate-pulse',
    unlocked: false,
    unlockCost: { gems: 2500, achievementPoints: 200 },
    isEquipped: false,
  },
  {
    id: 'frame_ancient',
    name: 'Khung Cổ Xưa',
    description: 'Khung với văn hóa cổ đại',
    rarity: 'mythic',
    icon: '🏺',
    borderStyle: 'border-4',
    borderColor: 'border-amber-700',
    glowEffect: 'shadow-2xl shadow-amber-700 animate-pulse',
    unlocked: false,
    unlockCost: { gems: 3000, achievementPoints: 300 },
    isEquipped: false,
  },
  {
    id: 'frame_divine',
    name: 'Khung Thần Thánh',
    description: 'Khung với sức mạnh thần thánh',
    rarity: 'mythic',
    icon: '👑',
    borderStyle: 'border-4',
    borderColor: 'border-yellow-400',
    glowEffect: 'shadow-2xl shadow-yellow-400 animate-pulse',
    unlocked: false,
    unlockCost: { gems: 3500, achievementPoints: 400 },
    isEquipped: false,
  },
  {
    id: 'frame_void',
    name: 'Khung Hư Không',
    description: 'Khung với sức mạnh hư không',
    rarity: 'mythic',
    icon: '🌑',
    borderStyle: 'border-4',
    borderColor: 'border-slate-900',
    glowEffect: 'shadow-2xl shadow-black animate-pulse',
    unlocked: false,
    unlockCost: { gems: 4000, achievementPoints: 500 },
    isEquipped: false,
  },
  {
    id: 'frame_infinity',
    name: 'Khung Vô Cực',
    description: 'Khung với sức mạnh vô hạn',
    rarity: 'mythic',
    icon: '♾️',
    borderStyle: 'border-4',
    borderColor: 'border-pink-600',
    glowEffect: 'shadow-2xl shadow-pink-600 animate-pulse',
    unlocked: false,
    unlockCost: { gems: 5000, achievementPoints: 750 },
    isEquipped: false,
  },
  {
    id: 'frame_legend',
    name: 'Khung Huyền Thoại',
    description: 'Khung cuối cùng cho những huyền thoại',
    rarity: 'mythic',
    icon: '🏆',
    borderStyle: 'border-4',
    borderColor: 'border-gold',
    glowEffect: 'shadow-2xl shadow-gold animate-pulse',
    unlocked: false,
    unlockCost: { gems: 10000, achievementPoints: 1000 },
    isEquipped: false,
  },
];

// Initialize customization state
export function initializeCustomizationState(): CustomizationState {
  return {
    heroSkins: [],
    petVariants: [],
    provinceThemes: PROVINCE_THEME_TEMPLATES,
    uiTheme: UI_THEME_TEMPLATES[0], // Default to light theme
    avatarFrames: AVATAR_FRAME_TEMPLATES,
    previewMode: {
      active: false,
    },
  };
}

// Generate hero skins for a specific hero
export function generateHeroSkins(heroId: string, heroType: string): HeroSkin[] {
  const template = HERO_SKIN_TEMPLATES.find(t => t.heroType === heroType);
  if (!template) return [];

  return template.skins.map((skin, index) => ({
    id: `skin_${heroId}_${index}`,
    heroId,
    name: skin.name,
    rarity: skin.rarity,
    description: skin.description,
    icon: skin.icon,
    effects: skin.effects,
    unlocked: skin.rarity === 'default',
    unlockCost: skin.cost.gems === 0 ? undefined : skin.cost,
    isEquipped: skin.rarity === 'default',
  }));
}

// Generate pet variants for a specific pet
export function generatePetVariants(petId: string, petType: string): PetColorVariant[] {
  const template = PET_VARIANT_TEMPLATES.find(t => t.petType === petType);
  if (!template) return [];

  return template.variants.map((variant, index) => ({
    id: `variant_${petId}_${index}`,
    petId,
    name: variant.name,
    variant: variant.variant,
    description: variant.description,
    colors: variant.colors,
    unlocked: variant.variant === 'default',
    unlockCost: variant.cost.gems === 0 ? undefined : variant.cost,
    isEquipped: variant.variant === 'default',
  }));
}

// Unlock hero skin
export function unlockHeroSkin(
  state: CustomizationState,
  skinId: string,
  playerResources: { gems: number; gold: number }
): { success: boolean; state?: CustomizationState; error?: string; cost?: any } {
  const skinIndex = state.heroSkins.findIndex(s => s.id === skinId);
  if (skinIndex === -1) {
    return { success: false, error: 'Không tìm thấy trang phục' };
  }

  const skin = state.heroSkins[skinIndex];
  if (skin.unlocked) {
    return { success: false, error: 'Trang phục đã được mở khóa' };
  }

  if (!skin.unlockCost) {
    return { success: false, error: 'Trang phục không thể mở khóa' };
  }

  // Check if player can afford
  if (skin.unlockCost.gems && playerResources.gems < skin.unlockCost.gems) {
    return { success: false, error: 'Không đủ đá quý' };
  }
  if (skin.unlockCost.gold && playerResources.gold < skin.unlockCost.gold) {
    return { success: false, error: 'Không đủ vàng' };
  }

  // Unlock skin
  const newState = { ...state };
  newState.heroSkins = [...state.heroSkins];
  newState.heroSkins[skinIndex] = { ...skin, unlocked: true };

  return { 
    success: true, 
    state: newState,
    cost: skin.unlockCost
  };
}

// Equip hero skin
export function equipHeroSkin(
  state: CustomizationState,
  skinId: string
): { success: boolean; state?: CustomizationState; error?: string } {
  const skin = state.heroSkins.find(s => s.id === skinId);
  if (!skin) {
    return { success: false, error: 'Không tìm thấy trang phục' };
  }

  if (!skin.unlocked) {
    return { success: false, error: 'Trang phục chưa được mở khóa' };
  }

  // Unequip all skins for this hero, then equip the selected one
  const newState = { ...state };
  newState.heroSkins = state.heroSkins.map(s =>
    s.heroId === skin.heroId
      ? { ...s, isEquipped: s.id === skinId }
      : s
  );

  return { success: true, state: newState };
}

// Unlock pet variant
export function unlockPetVariant(
  state: CustomizationState,
  variantId: string,
  playerResources: { gems: number; petEggs: number }
): { success: boolean; state?: CustomizationState; error?: string; cost?: any } {
  const variantIndex = state.petVariants.findIndex(v => v.id === variantId);
  if (variantIndex === -1) {
    return { success: false, error: 'Không tìm thấy màu sắc' };
  }

  const variant = state.petVariants[variantIndex];
  if (variant.unlocked) {
    return { success: false, error: 'Màu sắc đã được mở khóa' };
  }

  if (!variant.unlockCost) {
    return { success: false, error: 'Màu sắc không thể mở khóa' };
  }

  // Check if player can afford
  if (variant.unlockCost.gems && playerResources.gems < variant.unlockCost.gems) {
    return { success: false, error: 'Không đủ đá quý' };
  }
  if (variant.unlockCost.petEggs && playerResources.petEggs < variant.unlockCost.petEggs) {
    return { success: false, error: 'Không đủ trứng thú cưỡi' };
  }

  // Unlock variant
  const newState = { ...state };
  newState.petVariants = [...state.petVariants];
  newState.petVariants[variantIndex] = { ...variant, unlocked: true };

  return { 
    success: true, 
    state: newState,
    cost: variant.unlockCost
  };
}

// Equip pet variant
export function equipPetVariant(
  state: CustomizationState,
  variantId: string
): { success: boolean; state?: CustomizationState; error?: string } {
  const variant = state.petVariants.find(v => v.id === variantId);
  if (!variant) {
    return { success: false, error: 'Không tìm thấy màu sắc' };
  }

  if (!variant.unlocked) {
    return { success: false, error: 'Màu sắc chưa được mở khóa' };
  }

  // Unequip all variants for this pet, then equip the selected one
  const newState = { ...state };
  newState.petVariants = state.petVariants.map(v =>
    v.petId === variant.petId
      ? { ...v, isEquipped: v.id === variantId }
      : v
  );

  return { success: true, state: newState };
}

// Unlock province theme
export function unlockProvinceTheme(
  state: CustomizationState,
  themeId: string,
  playerResources: { gems: number; gold: number }
): { success: boolean; state?: CustomizationState; error?: string; cost?: any } {
  const themeIndex = state.provinceThemes.findIndex(t => t.id === themeId);
  if (themeIndex === -1) {
    return { success: false, error: 'Không tìm thấy chủ đề' };
  }

  const theme = state.provinceThemes[themeIndex];
  if (theme.unlocked) {
    return { success: false, error: 'Chủ đề đã được mở khóa' };
  }

  if (!theme.unlockCost) {
    return { success: false, error: 'Chủ đề không thể mở khóa' };
  }

  // Check if player can afford
  if (theme.unlockCost.gems && playerResources.gems < theme.unlockCost.gems) {
    return { success: false, error: 'Không đủ đá quý' };
  }
  if (theme.unlockCost.gold && playerResources.gold < theme.unlockCost.gold) {
    return { success: false, error: 'Không đủ vàng' };
  }

  // Unlock theme
  const newState = { ...state };
  newState.provinceThemes = [...state.provinceThemes];
  newState.provinceThemes[themeIndex] = { ...theme, unlocked: true };

  return { 
    success: true, 
    state: newState,
    cost: theme.unlockCost
  };
}

// Activate province theme
export function activateProvinceTheme(
  state: CustomizationState,
  themeId: string
): { success: boolean; state?: CustomizationState; error?: string } {
  const theme = state.provinceThemes.find(t => t.id === themeId);
  if (!theme) {
    return { success: false, error: 'Không tìm thấy chủ đề' };
  }

  if (!theme.unlocked) {
    return { success: false, error: 'Chủ đề chưa được mở khóa' };
  }

  // Deactivate all themes, then activate the selected one
  const newState = { ...state };
  newState.provinceThemes = state.provinceThemes.map(t => ({
    ...t,
    isActive: t.id === themeId,
  }));

  return { success: true, state: newState };
}

// Switch UI theme
export function switchUITheme(
  state: CustomizationState,
  themeType: UITheme
): { success: boolean; state?: CustomizationState; error?: string } {
  const theme = UI_THEME_TEMPLATES.find(t => t.theme === themeType);
  if (!theme) {
    return { success: false, error: 'Không tìm thấy giao diện' };
  }

  return {
    success: true,
    state: {
      ...state,
      uiTheme: theme,
    },
  };
}

// Unlock avatar frame
export function unlockAvatarFrame(
  state: CustomizationState,
  frameId: string,
  playerResources: { gems: number; achievementPoints: number }
): { success: boolean; state?: CustomizationState; error?: string; cost?: any } {
  const frameIndex = state.avatarFrames.findIndex(f => f.id === frameId);
  if (frameIndex === -1) {
    return { success: false, error: 'Không tìm thấy khung avatar' };
  }

  const frame = state.avatarFrames[frameIndex];
  if (frame.unlocked) {
    return { success: false, error: 'Khung đã được mở khóa' };
  }

  if (!frame.unlockCost) {
    return { success: false, error: 'Khung không thể mở khóa' };
  }

  // Check if player can afford
  if (frame.unlockCost.gems && playerResources.gems < frame.unlockCost.gems) {
    return { success: false, error: 'Không đủ đá quý' };
  }
  if (frame.unlockCost.achievementPoints && playerResources.achievementPoints < frame.unlockCost.achievementPoints) {
    return { success: false, error: 'Không đủ điểm thành tích' };
  }

  // Unlock frame
  const newState = { ...state };
  newState.avatarFrames = [...state.avatarFrames];
  newState.avatarFrames[frameIndex] = { ...frame, unlocked: true };

  return { 
    success: true, 
    state: newState,
    cost: frame.unlockCost
  };
}

// Equip avatar frame
export function equipAvatarFrame(
  state: CustomizationState,
  frameId: string
): { success: boolean; state?: CustomizationState; error?: string } {
  const frame = state.avatarFrames.find(f => f.id === frameId);
  if (!frame) {
    return { success: false, error: 'Không tìm thấy khung avatar' };
  }

  if (!frame.unlocked) {
    return { success: false, error: 'Khung chưa được mở khóa' };
  }

  // Unequip all frames, then equip the selected one
  const newState = { ...state };
  newState.avatarFrames = state.avatarFrames.map(f => ({
    ...f,
    isEquipped: f.id === frameId,
  }));

  return { success: true, state: newState };
}

// Start preview mode
export function startPreview(
  state: CustomizationState,
  type: 'skin' | 'variant' | 'theme' | 'frame',
  itemId: string
): { success: boolean; state?: CustomizationState } {
  return {
    success: true,
    state: {
      ...state,
      previewMode: {
        active: true,
        type,
        itemId,
      },
    },
  };
}

// End preview mode
export function endPreview(state: CustomizationState): { success: boolean; state?: CustomizationState } {
  return {
    success: true,
    state: {
      ...state,
      previewMode: {
        active: false,
      },
    },
  };
}

// Get rarity color
export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common': return '#9ca3af';
    case 'rare': return '#3b82f6';
    case 'epic': return '#a855f7';
    case 'legendary': return '#f59e0b';
    case 'mythic': return '#ec4899';
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
    case 'mythic': return 'Thần Thoại';
    default: return 'Không Rõ';
  }
}
