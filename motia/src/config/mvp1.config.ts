/**
 * MVP1 Game Configuration
 * Comprehensive game mechanics, resource rates, rewards, and progression
 */

// ============================================================================
// RESOURCE SYSTEM - 5 ELEMENTAL (Ngũ Hành)
// ============================================================================

export const RESOURCES = {
  GOLD: {
    id: 'gold',
    name_vietnamese: 'Vàng',
    name_english: 'Gold',
    emoji: '🟡',
    element: 'metal',
    base_generation_rate: 1.0, // per 30 seconds
    base_storage_capacity: 500,
  },
  RICE: {
    id: 'rice',
    name_vietnamese: 'Lúa',
    name_english: 'Rice',
    emoji: '🟢',
    element: 'water',
    base_generation_rate: 0.8,
    base_storage_capacity: 500,
  },
  WOOD: {
    id: 'wood',
    name_vietnamese: 'Gỗ',
    name_english: 'Wood',
    emoji: '🟫',
    element: 'wood',
    base_generation_rate: 0.7,
    base_storage_capacity: 400,
  },
  STONE: {
    id: 'stone',
    name_vietnamese: 'Đá',
    name_english: 'Stone',
    emoji: '🪨',
    element: 'earth',
    base_generation_rate: 0.6,
    base_storage_capacity: 400,
  },
  BAZAN: {
    id: 'bazan',
    name_vietnamese: 'Bazơ',
    name_english: 'Bazan',
    emoji: '🔴',
    element: 'fire',
    base_generation_rate: 0.3, // rarest
    base_storage_capacity: 200,
  },
}

// ============================================================================
// INITIAL PLAYER RESOURCES
// ============================================================================

export const INITIAL_RESOURCES = {
  gold: 200,
  rice: 100,
  wood: 50,
  stone: 30,
  bazan: 10,
  gems: 1500, // Premium currency
}

// ============================================================================
// BUILDINGS SYSTEM
// ============================================================================

export const BUILDINGS = {
  FARM: {
    id: 'farm',
    name_vietnamese: 'Trang Trại',
    name_english: 'Farm',
    type: 'production',
    produces_resource: 'rice',
    base_costs: {
      gold: 50,
      rice: 0,
      wood: 20,
      stone: 10,
      bazan: 0,
    },
    construction_time_seconds: 60,
    max_level: 20,
    level_1_production: 2, // per tick
    level_1_bonus: 0,
    production_multiplier_per_level: 1.15, // 15% increase per level
  },
  MINE: {
    id: 'mine',
    name_vietnamese: 'Mỏ Khoáng',
    name_english: 'Mine',
    type: 'production',
    produces_resource: 'stone',
    base_costs: {
      gold: 100,
      rice: 0,
      wood: 50,
      stone: 0,
      bazan: 0,
    },
    construction_time_seconds: 90,
    max_level: 20,
    level_1_production: 1.5,
    level_1_bonus: 0,
    production_multiplier_per_level: 1.15,
  },
  STORAGE: {
    id: 'storage',
    name_vietnamese: 'Kho Lưu Trữ',
    name_english: 'Storage',
    type: 'utility',
    produces_resource: null,
    base_costs: {
      gold: 75,
      rice: 0,
      wood: 40,
      stone: 20,
      bazan: 0,
    },
    construction_time_seconds: 45,
    max_level: 15,
    level_1_production: 0,
    level_1_bonus: 100, // +100 storage capacity per level
    production_multiplier_per_level: 1.1,
  },
  MARKET: {
    id: 'market',
    name_vietnamese: 'Chợ',
    name_english: 'Market',
    type: 'utility',
    produces_resource: null,
    base_costs: {
      gold: 150,
      rice: 50,
      wood: 60,
      stone: 30,
      bazan: 0,
    },
    construction_time_seconds: 120,
    max_level: 10,
    level_1_production: 0,
    level_1_bonus: 5, // +5% trade rate per level
    production_multiplier_per_level: 1.05,
  },
  TEMPLE: {
    id: 'temple',
    name_vietnamese: 'Đền Thờ',
    name_english: 'Temple',
    type: 'culture',
    produces_resource: null,
    base_costs: {
      gold: 200,
      rice: 100,
      wood: 100,
      stone: 50,
      bazan: 5,
    },
    construction_time_seconds: 150,
    max_level: 10,
    level_1_production: 0,
    level_1_bonus: 10, // +10 culture points per level
    production_multiplier_per_level: 1.2,
  },
  BARRACKS: {
    id: 'barracks',
    name_vietnamese: 'Doanh Trại',
    name_english: 'Barracks',
    type: 'military',
    produces_resource: null,
    base_costs: {
      gold: 250,
      rice: 150,
      wood: 80,
      stone: 100,
      bazan: 10,
    },
    construction_time_seconds: 180,
    max_level: 10,
    level_1_production: 0,
    level_1_bonus: 5, // +5 hero attack per level
    production_multiplier_per_level: 1.15,
  },
}

// ============================================================================
// PROVINCE UPGRADE SYSTEM
// ============================================================================

export const PROVINCE_UPGRADES = {
  FARMER: {
    name: 'Farmer Level',
    name_vietnamese: 'Cấp Nông Dân',
    max_level: 20,
    base_gold_cost: 100,
    base_rice_cost: 50,
    cost_multiplier: 1.15,
    bonus_per_level: 5, // +5% resource generation
  },
  RESOURCE: {
    name: 'Resource Level',
    name_vietnamese: 'Cấp Tài Nguyên',
    max_level: 10,
    base_gold_cost: 200,
    base_rice_cost: 100,
    cost_multiplier: 1.2,
    bonus_per_level: 10, // +10% specific resource generation
  },
  DEVELOPMENT: {
    name: 'Development Level',
    name_vietnamese: 'Cấp Phát Triển',
    max_level: 15,
    base_gold_cost: 150,
    base_rice_cost: 75,
    cost_multiplier: 1.18,
    bonus_per_level: 8, // +8% overall province development
  },
}

// ============================================================================
// HEROES SYSTEM - MVP1 (5 Heroes Available)
// ============================================================================

export const MVP1_HEROES = {
  HUNG_VUONG_I: {
    id: '6d2e1f33-8a4c-4e5b-9f1a-2c3d4e5f6a7b',
    name_vietnamese: 'Hùng Vương I',
    name_english: 'Hung Vuong I',
    era: 'Ancient Era',
    rarity: 'rare',
    role: 'Founder',
    base_stats: {
      hp: 150,
      attack: 15,
      defense: 12,
      speed: 10,
    },
    bonus_type: 'Population Growth',
    bonus_value: 20,
    pet_name: 'Dragon of Prosperity',
    pet_emoji: '🐉',
    pet_bonus: 15,
  },
  LY_THAI_TO: {
    id: '7e3f2a44-9b5d-5f6c-0a2b-3d4e5f6a7b8c',
    name_vietnamese: 'Lý Thái Tổ',
    name_english: 'Ly Thai To',
    era: 'Early Dynasty',
    rarity: 'rare',
    role: 'Founder',
    base_stats: {
      hp: 140,
      attack: 18,
      defense: 14,
      speed: 12,
    },
    bonus_type: 'Gold Generation',
    bonus_value: 25,
    pet_name: 'Phoenix of Thang Long',
    pet_emoji: '🔥',
    pet_bonus: 18,
  },
  LY_THANH_TONG: {
    id: '8f4a3b55-0c6e-6a7d-1b3c-4e5f6a7b8c9d',
    name_vietnamese: 'Lý Thánh Tông',
    name_english: 'Ly Thanh Tong',
    era: 'Flourishing Era',
    rarity: 'epic',
    role: 'Scholar',
    base_stats: {
      hp: 130,
      attack: 12,
      defense: 15,
      speed: 14,
    },
    bonus_type: 'Cultural Development',
    bonus_value: 30,
    pet_name: 'Wise Turtle',
    pet_emoji: '🐢',
    pet_bonus: 20,
  },
  TRAN_HUNG_DAO: {
    id: '9a5b4c66-1d7f-7b8e-2c4d-5f6a7b8c9d0e',
    name_vietnamese: 'Trần Hưng Đạo',
    name_english: 'Tran Hung Dao',
    era: 'Resistance Era',
    rarity: 'legendary',
    role: 'Warrior',
    base_stats: {
      hp: 180,
      attack: 25,
      defense: 20,
      speed: 16,
    },
    bonus_type: 'Combat Power',
    bonus_value: 40,
    pet_name: 'War Eagle',
    pet_emoji: '🦅',
    pet_bonus: 25,
  },
  MODERN_LEADER: {
    id: '0b6c5d77-2e8a-8c9f-3d5e-6a7b8c9d0e1f',
    name_vietnamese: 'Lãnh Đạo Hiện Đại',
    name_english: 'Modern Leader',
    era: 'Modern Era',
    rarity: 'epic',
    role: 'Administrator',
    base_stats: {
      hp: 120,
      attack: 14,
      defense: 16,
      speed: 18,
    },
    bonus_type: 'Administrative Efficiency',
    bonus_value: 35,
    pet_name: 'Smart Fox',
    pet_emoji: '🦊',
    pet_bonus: 22,
  },
}

// ============================================================================
// BATTLE SYSTEM
// ============================================================================

export const BATTLE_CONFIG = {
  AUTO_ATTACK_DAMAGE_MIN_MULTIPLIER: 0.8,
  AUTO_ATTACK_DAMAGE_MAX_MULTIPLIER: 1.2,
  CRITICAL_CHANCE: 0.15, // 15%
  CRITICAL_DAMAGE_MULTIPLIER: 1.5,
  DODGE_CHANCE: 0.1, // 10%
  BASE_BATTLE_DURATION_SECONDS: 30,
  REWARDS: {
    VICTORY: {
      gold: 100,
      experience: 50,
    },
    DEFEAT: {
      gold: 25,
      experience: 10,
    },
  },
}

// ============================================================================
// STORY & QUIZ SYSTEM
// ============================================================================

export const STORY_CONFIG = {
  TOTAL_MVP1_STORIES: 30,
  DAILY_STORY_LIMIT: 1, // One story per day
  READING_TIME_MINUTES: {
    MIN: 5,
    MAX: 10,
    AVERAGE: 7,
  },
}

export const QUIZ_CONFIG = {
  QUESTIONS_PER_STORY: 3,
  DIFFICULTY_LEVELS: ['easy', 'medium', 'hard'],
  QUESTION_TYPES: ['comprehension', 'context', 'application'],
  SCORING: {
    PERFECT: {
      correct_answers: 3,
      multiplier: 5,
      bonus_gold: 250,
      bonus_rice: 250,
      bonus_wood: 125,
    },
    GOOD: {
      correct_answers: 2,
      multiplier: 3,
      bonus_gold: 150,
      bonus_rice: 150,
      bonus_wood: 75,
    },
    PARTIAL: {
      correct_answers: 1,
      multiplier: 2,
      bonus_gold: 100,
      bonus_rice: 100,
      bonus_wood: 50,
    },
    LEARNING: {
      correct_answers: 0,
      multiplier: 1,
      bonus_gold: 100,
      bonus_rice: 100,
      bonus_wood: 50,
    },
  },
}

export const STORY_REWARDS_BASE = {
  gold: 100,
  rice: 100,
  wood: 50,
  stone: 25,
}

// ============================================================================
// ACHIEVEMENT SYSTEM
// ============================================================================

export const ACHIEVEMENTS = {
  FIRST_WEEK_LEARNER: {
    id: 'first_week_learner',
    name: 'First Week Learner',
    name_vietnamese: 'Học Viên Tuần Đầu',
    description: 'Read 7 stories in first week',
    reward_gold: 500,
    reward_gems: 50,
    threshold: 7,
  },
  MONTH_LEARNER: {
    id: 'month_learner',
    name: 'Month Learner',
    name_vietnamese: 'Học Viên Một Tháng',
    description: 'Read 30 stories in first month',
    reward_gold: 2000,
    reward_gems: 200,
    resource_bonus: 0.1, // +10% resource generation
    threshold: 30,
  },
  PERFECT_QUIZ_MASTER: {
    id: 'perfect_quiz_master',
    name: 'Perfect Quiz Master',
    name_vietnamese: 'Bậc Thầy Quiz Hoàn Hảo',
    description: 'Get 3 perfect quiz scores',
    reward_gold: 1000,
    reward_gems: 100,
    threshold: 3,
  },
  BUILDER: {
    id: 'builder',
    name: 'Builder',
    name_vietnamese: 'Nhà Xây Dựng',
    description: 'Build 5 buildings',
    reward_gold: 750,
    reward_gems: 75,
    threshold: 5,
  },
  HERO_COLLECTOR: {
    id: 'hero_collector',
    name: 'Hero Collector',
    name_vietnamese: 'Người Thu Thập Anh Hùng',
    description: 'Collect all 5 MVP1 heroes',
    reward_gold: 2000,
    reward_gems: 300,
    unlock_feature: 'hero_gacha', // Unlock advanced hero recruitment
    threshold: 5,
  },
}

// ============================================================================
// PREMIUM PASS SYSTEM
// ============================================================================

export const PREMIUM_PASS_TIERS = {
  BASIC: {
    id: 'basic',
    name_vietnamese: 'Gói Cơ Bản',
    price_gems: 99,
    price_usd: 0.99,
    duration_days: 30,
    benefits: {
      daily_bonus_gold: 50,
      daily_bonus_gems: 5,
      storage_capacity_bonus: 0.2, // +20%
      generation_speed_bonus: 0.1, // +10%
      ad_free: false,
    },
  },
  STANDARD: {
    id: 'standard',
    name_vietnamese: 'Gói Tiêu Chuẩn',
    price_gems: 299,
    price_usd: 2.99,
    duration_days: 30,
    benefits: {
      daily_bonus_gold: 150,
      daily_bonus_gems: 15,
      storage_capacity_bonus: 0.5, // +50%
      generation_speed_bonus: 0.25, // +25%
      ad_free: true,
      daily_free_roll: 1,
    },
  },
  PREMIUM: {
    id: 'premium',
    name_vietnamese: 'Gói Cao Cấp',
    price_gems: 699,
    price_usd: 6.99,
    duration_days: 30,
    benefits: {
      daily_bonus_gold: 300,
      daily_bonus_gems: 30,
      storage_capacity_bonus: 1.0, // +100%
      generation_speed_bonus: 0.5, // +50%
      ad_free: true,
      daily_free_roll: 3,
      skip_build_time: true,
      priority_support: true,
    },
  },
}

// ============================================================================
// DAILY GAMEPLAY LOOP
// ============================================================================

export const DAILY_ACTIVITIES = {
  LOGIN_BONUS: {
    day_1: { gold: 100, gems: 10 },
    day_3: { gold: 200, gems: 20 },
    day_5: { gold: 300, gems: 30 },
    day_7: { gold: 500, gems: 50, special_item: true },
  },
  DAILY_HARVEST_COOLDOWN_SECONDS: 300, // 5 minutes
  DAILY_BATTLE_LIMIT: 10,
  DAILY_STORY_LIMIT: 1,
}

// ============================================================================
// PROGRESSION TIERS (Hidden Milestones)
// ============================================================================

export const PROGRESSION_TIERS = [
  {
    tier: 1,
    name: 'Novice Farmer',
    name_vietnamese: 'Nông Dân Mới Vào',
    min_level: 1,
    max_level: 5,
    resource_bonus: 1.0,
  },
  {
    tier: 2,
    name: 'Experienced Farmer',
    name_vietnamese: 'Nông Dân Có Kinh Nghiệm',
    min_level: 6,
    max_level: 15,
    resource_bonus: 1.1,
  },
  {
    tier: 3,
    name: 'Master Farmer',
    name_vietnamese: 'Bậc Thầy Nông Dân',
    min_level: 16,
    max_level: 30,
    resource_bonus: 1.25,
  },
  {
    tier: 4,
    name: 'Legend Farmer',
    name_vietnamese: 'Nhà Nông Huyền Thoại',
    min_level: 31,
    max_level: 99,
    resource_bonus: 1.5,
  },
]

// ============================================================================
// GAME BALANCE CONSTANTS
// ============================================================================

export const GAME_BALANCE = {
  // Resource generation (per 30 seconds, applied with building bonuses)
  BASE_TICK_INTERVAL_SECONDS: 30,

  // Experience system
  BASE_EXP_PER_BATTLE: 10,
  BASE_EXP_PER_STORY: 25,
  BASE_EXP_PER_QUIZ_PERFECT: 50,
  EXP_TO_LEVEL_MULTIPLIER: 100, // Level 2 = 100 exp, Level 3 = 200 exp, etc.

  // Level caps
  MAX_PLAYER_LEVEL: 99,
  MAX_HERO_LEVEL: 5,

  // Building construction
  CONSTRUCTION_QUEUE_LIMIT: 3,
  CONSTRUCTION_SPEEDUP_COST_PER_SECOND: 1, // 1 gem per second

  // Storage limits
  BASE_STORAGE_CAPACITY: 500,
  MAX_STORAGE_CAPACITY: 10000,

  // Premium currency conversion
  GEMS_TO_GOLD_RATE: 10, // 1 gem = 10 gold (rough exchange rate)
  GEMS_TO_RESOURCES_RATE: 100, // Cost multiplier for direct purchase

  // Session timeout
  SESSION_TIMEOUT_MINUTES: 60,
  AUTO_SAVE_INTERVAL_SECONDS: 60,
}

// ============================================================================
// TUTORIAL PROGRESSION (6 Steps Minimum)
// ============================================================================

export const TUTORIAL_STEPS = [
  {
    step: 1,
    title_vietnamese: 'Chào Mừng Đến Lâu Đài Việt',
    description: 'Learn about your province and resources',
    actions: ['view_province', 'collect_initial_resources'],
  },
  {
    step: 2,
    title_vietnamese: 'Xây Dựng Trang Trại Đầu Tiên',
    description: 'Build your first farm to generate rice',
    actions: ['build_farm'],
  },
  {
    step: 3,
    title_vietnamese: 'Nâng Cấp Tài Nguyên',
    description: 'Upgrade your farmer level for better generation',
    actions: ['upgrade_farmer_level'],
  },
  {
    step: 4,
    title_vietnamese: 'Tuyển Dụng Anh Hùng',
    description: 'Recruit your first hero to aid your province',
    actions: ['recruit_hero'],
  },
  {
    step: 5,
    title_vietnamese: 'Đọc Câu Chuyện Lịch Sử',
    description: 'Read the first historical story about Vietnam',
    actions: ['read_story'],
  },
  {
    step: 6,
    title_vietnamese: 'Trả Lời Câu Hỏi',
    description: 'Complete the quiz to test your knowledge and earn rewards',
    actions: ['complete_quiz'],
  },
]

// ============================================================================
// API RESPONSE CODES
// ============================================================================

export const API_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
}

// ============================================================================
// EXPORT ALL CONFIG
// ============================================================================

export const MVP1_CONFIG = {
  RESOURCES,
  INITIAL_RESOURCES,
  BUILDINGS,
  PROVINCE_UPGRADES,
  MVP1_HEROES,
  BATTLE_CONFIG,
  STORY_CONFIG,
  QUIZ_CONFIG,
  STORY_REWARDS_BASE,
  ACHIEVEMENTS,
  PREMIUM_PASS_TIERS,
  DAILY_ACTIVITIES,
  PROGRESSION_TIERS,
  GAME_BALANCE,
  TUTORIAL_STEPS,
  API_CODES,
}

export default MVP1_CONFIG
