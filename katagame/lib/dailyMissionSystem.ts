// Daily Missions & Events System
// Daily quests, weekly challenges, login rewards, seasonal events

export type MissionType = 
  | 'win_battles' 
  | 'collect_gold' 
  | 'upgrade_hero' 
  | 'complete_expeditions'
  | 'challenge_boss'
  | 'win_arena'
  | 'donate_guild'
  | 'collect_resources'
  | 'level_up'
  | 'gacha_pull';

export type MissionFrequency = 'daily' | 'weekly' | 'event';
export type EventType = 'double_exp' | 'double_gold' | 'double_drop' | 'limited_shop' | 'seasonal';

// ============= TYPE DEFINITIONS =============

export interface Mission {
  id: string;
  type: MissionType;
  frequency: MissionFrequency;
  name: string;
  description: string;
  requirement: number;
  currentProgress: number;
  rewards: MissionReward[];
  claimed: boolean;
  expiresAt: number; // Timestamp
}

export interface MissionReward {
  type: 'gold' | 'gems' | 'exp' | 'hero_fragment' | 'pet_egg' | 'culture' | 'stamina';
  itemId?: string;
  itemName?: string;
  quantity: number;
}

export interface LoginDay {
  day: number;
  claimed: boolean;
  rewards: MissionReward[];
}

export interface LoginRewardState {
  currentStreak: number;
  totalDays: number;
  lastLoginDate: string; // YYYY-MM-DD format
  calendar: LoginDay[]; // 7 days
}

export interface GameEvent {
  id: string;
  type: EventType;
  name: string;
  description: string;
  startTime: number; // Timestamp
  endTime: number; // Timestamp
  isActive: boolean;
  multiplier?: number; // For double events
  rewards?: MissionReward[];
  specialShopItems?: any[]; // For limited shops
}

export interface MissionProgress {
  [missionId: string]: number;
}

export interface DailyMissionState {
  dailyMissions: Mission[];
  weeklyMissions: Mission[];
  loginRewards: LoginRewardState;
  activeEvents: GameEvent[];
  missionProgress: MissionProgress;
  lastDailyReset: number; // Timestamp
  lastWeeklyReset: number; // Timestamp
}

// ============= CONSTANTS =============

export const DAILY_MISSION_COUNT = 5;
export const WEEKLY_MISSION_COUNT = 3;
export const LOGIN_CALENDAR_DAYS = 7;

// Daily mission templates
export const DAILY_MISSION_TEMPLATES: Array<{
  type: MissionType;
  name: string;
  description: string;
  requirement: number;
  rewards: MissionReward[];
}> = [
  {
    type: 'win_battles',
    name: 'Chiến Thắng Liên Tiếp',
    description: 'Thắng 3 trận chiến đấu bất kỳ',
    requirement: 3,
    rewards: [
      { type: 'gold', quantity: 5000 },
      { type: 'exp', quantity: 500 },
    ],
  },
  {
    type: 'collect_gold',
    name: 'Nhà Giàu',
    description: 'Thu thập 10,000 vàng',
    requirement: 10000,
    rewards: [
      { type: 'gems', quantity: 50 },
      { type: 'gold', quantity: 2000 },
    ],
  },
  {
    type: 'upgrade_hero',
    name: 'Nâng Cấp Tướng',
    description: 'Nâng cấp 1 tướng lên level cao hơn',
    requirement: 1,
    rewards: [
      { type: 'hero_fragment', itemName: 'Mảnh Tướng Ngẫu Nhiên', quantity: 5 },
      { type: 'exp', quantity: 1000 },
    ],
  },
  {
    type: 'complete_expeditions',
    name: 'Thám Hiểm Viên',
    description: 'Hoàn thành 5 tầng thám hiểm',
    requirement: 5,
    rewards: [
      { type: 'stamina', quantity: 20 },
      { type: 'gold', quantity: 3000 },
    ],
  },
  {
    type: 'challenge_boss',
    name: 'Sát Thủ Boss',
    description: 'Thách đấu boss tỉnh thành 2 lần',
    requirement: 2,
    rewards: [
      { type: 'gems', quantity: 30 },
      { type: 'culture', quantity: 50 },
    ],
  },
  {
    type: 'win_arena',
    name: 'Chiến Binh Arena',
    description: 'Thắng 3 trận Arena',
    requirement: 3,
    rewards: [
      { type: 'gems', quantity: 40 },
      { type: 'gold', quantity: 5000 },
    ],
  },
  {
    type: 'donate_guild',
    name: 'Đóng Góp Guild',
    description: 'Quyên góp tài nguyên cho Guild',
    requirement: 1,
    rewards: [
      { type: 'gold', quantity: 3000 },
      { type: 'culture', quantity: 30 },
    ],
  },
  {
    type: 'gacha_pull',
    name: 'May Mắn',
    description: 'Quay gacha 1 lần',
    requirement: 1,
    rewards: [
      { type: 'gems', quantity: 20 },
      { type: 'exp', quantity: 500 },
    ],
  },
];

// Weekly mission templates
export const WEEKLY_MISSION_TEMPLATES: Array<{
  type: MissionType;
  name: string;
  description: string;
  requirement: number;
  rewards: MissionReward[];
}> = [
  {
    type: 'win_battles',
    name: 'Chiến Binh Tuần',
    description: 'Thắng 20 trận chiến đấu trong tuần',
    requirement: 20,
    rewards: [
      { type: 'gems', quantity: 200 },
      { type: 'gold', quantity: 20000 },
      { type: 'hero_fragment', itemName: 'Mảnh Tướng Epic', quantity: 10 },
    ],
  },
  {
    type: 'complete_expeditions',
    name: 'Nhà Thám Hiểm',
    description: 'Hoàn thành 20 tầng thám hiểm',
    requirement: 20,
    rewards: [
      { type: 'gems', quantity: 150 },
      { type: 'stamina', quantity: 50 },
      { type: 'pet_egg', itemName: 'Trứng Pet Epic', quantity: 1 },
    ],
  },
  {
    type: 'win_arena',
    name: 'Đấu Sĩ Arena',
    description: 'Thắng 10 trận Arena trong tuần',
    requirement: 10,
    rewards: [
      { type: 'gems', quantity: 180 },
      { type: 'gold', quantity: 15000 },
      { type: 'culture', quantity: 200 },
    ],
  },
];

// 7-day login rewards
export const LOGIN_REWARD_CALENDAR: MissionReward[][] = [
  // Day 1
  [
    { type: 'gold', quantity: 5000 },
    { type: 'gems', quantity: 50 },
  ],
  // Day 2
  [
    { type: 'gold', quantity: 8000 },
    { type: 'stamina', quantity: 30 },
  ],
  // Day 3
  [
    { type: 'gems', quantity: 80 },
    { type: 'hero_fragment', itemName: 'Mảnh Tướng Rare', quantity: 5 },
  ],
  // Day 4
  [
    { type: 'gold', quantity: 12000 },
    { type: 'exp', quantity: 2000 },
  ],
  // Day 5
  [
    { type: 'gems', quantity: 120 },
    { type: 'pet_egg', itemName: 'Trứng Pet Rare', quantity: 1 },
  ],
  // Day 6
  [
    { type: 'gold', quantity: 20000 },
    { type: 'culture', quantity: 100 },
  ],
  // Day 7 - Grand prize
  [
    { type: 'gems', quantity: 300 },
    { type: 'hero_fragment', itemName: 'Mảnh Tướng Epic', quantity: 10 },
    { type: 'pet_egg', itemName: 'Trứng Pet Epic', quantity: 1 },
  ],
];

// Preset events
export const PRESET_EVENTS: Omit<GameEvent, 'id' | 'isActive'>[] = [
  {
    type: 'double_exp',
    name: 'EXP Gấp Đôi',
    description: 'Nhận gấp đôi kinh nghiệm từ mọi hoạt động!',
    startTime: 0, // Set dynamically
    endTime: 0,
    multiplier: 2,
  },
  {
    type: 'double_gold',
    name: 'Vàng Gấp Đôi',
    description: 'Thu thập gấp đôi số vàng từ mọi nguồn!',
    startTime: 0,
    endTime: 0,
    multiplier: 2,
  },
  {
    type: 'double_drop',
    name: 'Drop Rate Gấp Đôi',
    description: 'Tỷ lệ rơi đồ từ boss và thám hiểm tăng 2 lần!',
    startTime: 0,
    endTime: 0,
    multiplier: 2,
  },
  {
    type: 'seasonal',
    name: 'Sự Kiện Tết',
    description: 'Chào mừng Tết Nguyên Đán! Nhận quà đặc biệt mỗi ngày.',
    startTime: 0,
    endTime: 0,
    rewards: [
      { type: 'gems', quantity: 500 },
      { type: 'gold', quantity: 50000 },
      { type: 'hero_fragment', itemName: 'Mảnh Tướng Legendary', quantity: 20 },
    ],
  },
];

// ============= INITIALIZATION FUNCTIONS =============

export function initializeDailyMissionState(): DailyMissionState {
  const now = Date.now();
  
  return {
    dailyMissions: generateDailyMissions(now),
    weeklyMissions: generateWeeklyMissions(now),
    loginRewards: initializeLoginRewards(),
    activeEvents: [],
    missionProgress: {},
    lastDailyReset: now,
    lastWeeklyReset: now,
  };
}

function generateDailyMissions(currentTime: number): Mission[] {
  // Randomly select 5 daily missions
  const shuffled = [...DAILY_MISSION_TEMPLATES].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, DAILY_MISSION_COUNT);
  
  // Reset time is midnight (00:00) of next day
  const tomorrow = new Date(currentTime);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const expiresAt = tomorrow.getTime();
  
  return selected.map((template, index) => ({
    id: `daily_${Date.now()}_${index}`,
    type: template.type,
    frequency: 'daily',
    name: template.name,
    description: template.description,
    requirement: template.requirement,
    currentProgress: 0,
    rewards: template.rewards,
    claimed: false,
    expiresAt,
  }));
}

function generateWeeklyMissions(currentTime: number): Mission[] {
  // All weekly missions are active
  const selected = WEEKLY_MISSION_TEMPLATES;
  
  // Reset time is Monday 00:00
  const nextMonday = new Date(currentTime);
  const daysUntilMonday = (8 - nextMonday.getDay()) % 7 || 7;
  nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);
  const expiresAt = nextMonday.getTime();
  
  return selected.map((template, index) => ({
    id: `weekly_${Date.now()}_${index}`,
    type: template.type,
    frequency: 'weekly',
    name: template.name,
    description: template.description,
    requirement: template.requirement,
    currentProgress: 0,
    rewards: template.rewards,
    claimed: false,
    expiresAt,
  }));
}

function initializeLoginRewards(): LoginRewardState {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  
  return {
    currentStreak: 0,
    totalDays: 0,
    lastLoginDate: todayString,
    calendar: LOGIN_REWARD_CALENDAR.map((rewards, index) => ({
      day: index + 1,
      claimed: false,
      rewards,
    })),
  };
}

// ============= MISSION PROGRESS FUNCTIONS =============

export function updateMissionProgress(
  state: DailyMissionState,
  missionType: MissionType,
  amount: number = 1
): DailyMissionState {
  const updatedDailyMissions = state.dailyMissions.map((mission) => {
    if (mission.type === missionType && !mission.claimed) {
      const newProgress = Math.min(mission.currentProgress + amount, mission.requirement);
      return { ...mission, currentProgress: newProgress };
    }
    return mission;
  });
  
  const updatedWeeklyMissions = state.weeklyMissions.map((mission) => {
    if (mission.type === missionType && !mission.claimed) {
      const newProgress = Math.min(mission.currentProgress + amount, mission.requirement);
      return { ...mission, currentProgress: newProgress };
    }
    return mission;
  });
  
  return {
    ...state,
    dailyMissions: updatedDailyMissions,
    weeklyMissions: updatedWeeklyMissions,
  };
}

export function canClaimMission(mission: Mission): boolean {
  return mission.currentProgress >= mission.requirement && !mission.claimed;
}

export function claimMissionRewards(
  state: DailyMissionState,
  missionId: string
): { success: boolean; state?: DailyMissionState; rewards?: MissionReward[]; error?: string } {
  // Find mission in daily or weekly
  const dailyIndex = state.dailyMissions.findIndex((m) => m.id === missionId);
  const weeklyIndex = state.weeklyMissions.findIndex((m) => m.id === missionId);
  
  if (dailyIndex === -1 && weeklyIndex === -1) {
    return { success: false, error: 'Nhiệm vụ không tồn tại!' };
  }
  
  const mission = dailyIndex >= 0 ? state.dailyMissions[dailyIndex] : state.weeklyMissions[weeklyIndex];
  
  if (mission.claimed) {
    return { success: false, error: 'Đã nhận thưởng rồi!' };
  }
  
  if (!canClaimMission(mission)) {
    return { success: false, error: 'Chưa hoàn thành nhiệm vụ!' };
  }
  
  // Mark as claimed
  if (dailyIndex >= 0) {
    const updatedDailyMissions = [...state.dailyMissions];
    updatedDailyMissions[dailyIndex] = { ...mission, claimed: true };
    
    return {
      success: true,
      state: { ...state, dailyMissions: updatedDailyMissions },
      rewards: mission.rewards,
    };
  } else {
    const updatedWeeklyMissions = [...state.weeklyMissions];
    updatedWeeklyMissions[weeklyIndex] = { ...mission, claimed: true };
    
    return {
      success: true,
      state: { ...state, weeklyMissions: updatedWeeklyMissions },
      rewards: mission.rewards,
    };
  }
}

// ============= LOGIN REWARD FUNCTIONS =============

export function checkLoginReward(
  state: DailyMissionState
): { shouldClaim: boolean; state?: DailyMissionState; dayNumber?: number } {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  const lastLogin = state.loginRewards.lastLoginDate;
  
  // Already claimed today
  if (lastLogin === todayString) {
    return { shouldClaim: false };
  }
  
  // Check if consecutive day
  const lastLoginDate = new Date(lastLogin);
  const dayDiff = Math.floor((today.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let newStreak = state.loginRewards.currentStreak;
  
  if (dayDiff === 1) {
    // Consecutive day
    newStreak = (newStreak % LOGIN_CALENDAR_DAYS) + 1;
  } else if (dayDiff > 1) {
    // Streak broken, start over
    newStreak = 1;
    // Reset calendar
    const resetCalendar = state.loginRewards.calendar.map((day) => ({
      ...day,
      claimed: false,
    }));
    
    return {
      shouldClaim: true,
      dayNumber: newStreak,
      state: {
        ...state,
        loginRewards: {
          ...state.loginRewards,
          currentStreak: newStreak,
          totalDays: state.loginRewards.totalDays + 1,
          lastLoginDate: todayString,
          calendar: resetCalendar,
        },
      },
    };
  }
  
  return {
    shouldClaim: true,
    dayNumber: newStreak,
    state: {
      ...state,
      loginRewards: {
        ...state.loginRewards,
        currentStreak: newStreak,
        totalDays: state.loginRewards.totalDays + 1,
        lastLoginDate: todayString,
      },
    },
  };
}

export function claimLoginReward(
  state: DailyMissionState,
  dayNumber: number
): { success: boolean; state?: DailyMissionState; rewards?: MissionReward[]; error?: string } {
  if (dayNumber < 1 || dayNumber > LOGIN_CALENDAR_DAYS) {
    return { success: false, error: 'Ngày không hợp lệ!' };
  }
  
  const dayIndex = dayNumber - 1;
  const day = state.loginRewards.calendar[dayIndex];
  
  if (day.claimed) {
    return { success: false, error: 'Đã nhận thưởng rồi!' };
  }
  
  // Mark day as claimed
  const updatedCalendar = [...state.loginRewards.calendar];
  updatedCalendar[dayIndex] = { ...day, claimed: true };
  
  return {
    success: true,
    state: {
      ...state,
      loginRewards: {
        ...state.loginRewards,
        calendar: updatedCalendar,
      },
    },
    rewards: day.rewards,
  };
}

// ============= DAILY/WEEKLY RESET FUNCTIONS =============

export function shouldResetDaily(lastReset: number): boolean {
  const now = new Date();
  const lastResetDate = new Date(lastReset);
  
  // Check if it's a different day
  return now.toDateString() !== lastResetDate.toDateString();
}

export function shouldResetWeekly(lastReset: number): boolean {
  const now = new Date();
  const lastResetDate = new Date(lastReset);
  
  // Check if it's a different week AND it's Monday
  const isMonday = now.getDay() === 1;
  const daysSinceReset = Math.floor((now.getTime() - lastResetDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return isMonday && daysSinceReset >= 7;
}

export function resetDailyMissions(state: DailyMissionState): DailyMissionState {
  const now = Date.now();
  
  return {
    ...state,
    dailyMissions: generateDailyMissions(now),
    lastDailyReset: now,
  };
}

export function resetWeeklyMissions(state: DailyMissionState): DailyMissionState {
  const now = Date.now();
  
  return {
    ...state,
    weeklyMissions: generateWeeklyMissions(now),
    lastWeeklyReset: now,
  };
}

// ============= EVENT MANAGEMENT FUNCTIONS =============

export function createEvent(
  type: EventType,
  durationHours: number = 24
): GameEvent {
  const now = Date.now();
  const endTime = now + durationHours * 60 * 60 * 1000;
  
  const template = PRESET_EVENTS.find((e) => e.type === type);
  if (!template) {
    throw new Error('Invalid event type');
  }
  
  return {
    ...template,
    id: `event_${type}_${now}`,
    startTime: now,
    endTime,
    isActive: true,
  };
}

export function updateEvents(state: DailyMissionState): DailyMissionState {
  const now = Date.now();
  
  // Filter out expired events
  const activeEvents = state.activeEvents.filter((event) => {
    if (now > event.endTime) {
      return false;
    }
    return true;
  });
  
  // Update isActive status
  const updatedEvents = activeEvents.map((event) => ({
    ...event,
    isActive: now >= event.startTime && now <= event.endTime,
  }));
  
  return {
    ...state,
    activeEvents: updatedEvents,
  };
}

export function addEvent(
  state: DailyMissionState,
  event: GameEvent
): DailyMissionState {
  return {
    ...state,
    activeEvents: [...state.activeEvents, event],
  };
}

export function getActiveEvents(state: DailyMissionState): GameEvent[] {
  const now = Date.now();
  return state.activeEvents.filter(
    (event) => event.isActive && now >= event.startTime && now <= event.endTime
  );
}

export function getEventMultiplier(
  state: DailyMissionState,
  eventType: EventType
): number {
  const activeEvent = getActiveEvents(state).find((e) => e.type === eventType);
  return activeEvent?.multiplier || 1;
}

// ============= UTILITY FUNCTIONS =============

export function getMissionProgress(mission: Mission): number {
  return Math.floor((mission.currentProgress / mission.requirement) * 100);
}

export function getTimeUntilExpiry(expiresAt: number): string {
  const now = Date.now();
  const diff = expiresAt - now;
  
  if (diff <= 0) {
    return 'Đã hết hạn';
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} ngày`;
  }
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  return `${minutes}m`;
}

export function getRewardIcon(type: string): string {
  switch (type) {
    case 'gold': return '💰';
    case 'gems': return '💎';
    case 'exp': return '⭐';
    case 'hero_fragment': return '👑';
    case 'pet_egg': return '🥚';
    case 'culture': return '🏛️';
    case 'stamina': return '⚡';
    default: return '🎁';
  }
}

export function getTotalDailyProgress(missions: Mission[]): number {
  const completed = missions.filter((m) => m.claimed).length;
  return Math.floor((completed / missions.length) * 100);
}

export function getTotalWeeklyProgress(missions: Mission[]): number {
  const completed = missions.filter((m) => m.claimed).length;
  return Math.floor((completed / missions.length) * 100);
}

export function canClaimAllDaily(missions: Mission[]): boolean {
  return missions.some((m) => canClaimMission(m));
}

export function canClaimAllWeekly(missions: Mission[]): boolean {
  return missions.some((m) => canClaimMission(m));
}
