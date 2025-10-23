/**
 * Guild/Clan System for Kata Game MVP 3
 * 
 * Features:
 * - Guild creation, joining, leaving
 * - Member management (Leader, Officer, Member roles)
 * - Guild chat system
 * - Guild quests & contributions
 * - Guild wars (PvP between guilds)
 * - Guild shop with exclusive items
 * - Guild rankings & leaderboards
 * - Guild buffs & bonuses
 */

import { Resource } from './types';

// Guild Constants
export const GUILD_NAME_MIN_LENGTH = 3;
export const GUILD_NAME_MAX_LENGTH = 20;
export const GUILD_TAG_MIN_LENGTH = 2;
export const GUILD_TAG_MAX_LENGTH = 5;
export const GUILD_DESCRIPTION_MAX_LENGTH = 200;
export const GUILD_MAX_MEMBERS = 50;
export const GUILD_CREATE_COST = 1000; // gems
export const GUILD_CHAT_MESSAGE_MAX_LENGTH = 200;
export const GUILD_CHAT_HISTORY_LIMIT = 100;

// Guild Role Types
export type GuildRole = 'leader' | 'officer' | 'member';

// Guild Member Interface
export interface GuildMember {
  playerId: string;
  playerName: string;
  playerLevel: number;
  role: GuildRole;
  joinDate: number; // Unix timestamp
  lastActive: number; // Unix timestamp
  contribution: number; // Total contribution points
  weeklyContribution: number; // Resets weekly
  donatedResources: Resource;
}

// Guild Buff Interface
export interface GuildBuff {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  level: number;
  maxLevel: number;
  effect: {
    type: 'production' | 'combat' | 'xp' | 'resources';
    value: number; // Percentage bonus
  };
  cost: Resource; // Cost to upgrade
}

// Guild Quest Interface
export interface GuildQuest {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: 'combat' | 'collection' | 'donation' | 'social';
  target: number; // Target amount
  progress: number; // Current progress
  rewards: {
    resources: Resource;
    guildExp: number;
    contribution: number; // Per member who contributed
  };
  startDate: number;
  endDate: number;
  completed: boolean;
}

// Guild War Interface
export interface GuildWar {
  id: string;
  attackingGuildId: string;
  defendingGuildId: string;
  startTime: number;
  endTime: number;
  status: 'scheduled' | 'active' | 'completed';
  attackScore: number;
  defendScore: number;
  participants: {
    playerId: string;
    guildId: string;
    wins: number;
    losses: number;
    points: number;
  }[];
  rewards: {
    winner: Resource;
    loser: Resource;
  };
}

// Guild Shop Item Interface
export interface GuildShopItem {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: 'hero' | 'pet' | 'resource' | 'buff' | 'cosmetic';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  cost: number; // Contribution points
  stock: number; // -1 for unlimited
  cooldown: number; // Milliseconds before can buy again
  item: any; // The actual item data
}

// Guild Chat Message Interface
export interface GuildChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: GuildRole;
  message: string;
  timestamp: number;
  type: 'normal' | 'system' | 'announcement';
}

// Guild Interface
export interface Guild {
  id: string;
  name: string;
  tag: string; // Short guild tag (e.g., [VN])
  description: string;
  icon: string; // Icon/emblem ID
  level: number;
  exp: number;
  expToNextLevel: number;
  createdDate: number;
  leaderId: string;
  members: GuildMember[];
  maxMembers: number;
  
  // Guild Stats
  totalPower: number; // Sum of all members' power
  weeklyActivity: number; // Activity score (resets weekly)
  
  // Guild Buffs
  buffs: GuildBuff[];
  
  // Guild Resources
  treasury: Resource; // Shared guild resources
  
  // Guild Quests
  activeQuests: GuildQuest[];
  completedQuests: number;
  
  // Guild Shop
  activeShop?: GuildShopItem[];
  
  // Guild Wars
  warHistory: {
    wins: number;
    losses: number;
    draws: number;
  };
  activeWar?: GuildWar;
  
  // Guild Settings
  settings: {
    autoAccept: boolean; // Auto-accept join requests
    minLevel: number; // Minimum level to join
    language: string;
    isPublic: boolean; // Public or invite-only
    announcement: string; // Guild announcement message
  };
  
  // Guild Ranking
  rank: number;
  seasonRank: number;
}

// Guild Application Interface
export interface GuildApplication {
  id: string;
  guildId: string;
  playerId: string;
  playerName: string;
  playerLevel: number;
  message: string;
  timestamp: number;
  status: 'pending' | 'accepted' | 'rejected';
}

// Guild State Interface
export interface GuildState {
  currentGuild?: Guild;
  guildId?: string;
  myRole?: GuildRole;
  joinRequests: GuildApplication[]; // If I'm leader/officer
  myApplications: GuildApplication[]; // My pending applications
  chatMessages: GuildChatMessage[];
  unreadChatCount: number;
  lastChatCheck: number;
}

// ============================================================================
// GUILD MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Initialize guild state
 */
export function initializeGuildState(): GuildState {
  return {
    currentGuild: undefined,
    guildId: undefined,
    myRole: undefined,
    joinRequests: [],
    myApplications: [],
    chatMessages: [],
    unreadChatCount: 0,
    lastChatCheck: Date.now(),
  };
}

/**
 * Validate guild name
 */
export function validateGuildName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Tên guild không được để trống' };
  }
  
  if (name.length < GUILD_NAME_MIN_LENGTH) {
    return { valid: false, error: `Tên guild phải có ít nhất ${GUILD_NAME_MIN_LENGTH} ký tự` };
  }
  
  if (name.length > GUILD_NAME_MAX_LENGTH) {
    return { valid: false, error: `Tên guild không được dài quá ${GUILD_NAME_MAX_LENGTH} ký tự` };
  }
  
  // Check for inappropriate characters
  const validPattern = /^[a-zA-Z0-9\s\u00C0-\u1EF9]+$/; // Allow Vietnamese characters
  if (!validPattern.test(name)) {
    return { valid: false, error: 'Tên guild chỉ được chứa chữ cái, số và khoảng trắng' };
  }
  
  return { valid: true };
}

/**
 * Validate guild tag
 */
export function validateGuildTag(tag: string): { valid: boolean; error?: string } {
  if (!tag || tag.trim().length === 0) {
    return { valid: false, error: 'Tag guild không được để trống' };
  }
  
  if (tag.length < GUILD_TAG_MIN_LENGTH) {
    return { valid: false, error: `Tag guild phải có ít nhất ${GUILD_TAG_MIN_LENGTH} ký tự` };
  }
  
  if (tag.length > GUILD_TAG_MAX_LENGTH) {
    return { valid: false, error: `Tag guild không được dài quá ${GUILD_TAG_MAX_LENGTH} ký tự` };
  }
  
  // Tag should be uppercase letters and numbers only
  const validPattern = /^[A-Z0-9]+$/;
  if (!validPattern.test(tag)) {
    return { valid: false, error: 'Tag guild chỉ được chứa chữ HOA và số' };
  }
  
  return { valid: true };
}

/**
 * Create a new guild
 */
export function createGuild(
  leaderId: string,
  leaderName: string,
  leaderLevel: number,
  guildName: string,
  guildTag: string,
  description: string,
  icon: string
): Guild {
  const now = Date.now();
  
  const leader: GuildMember = {
    playerId: leaderId,
    playerName: leaderName,
    playerLevel: leaderLevel,
    role: 'leader',
    joinDate: now,
    lastActive: now,
    contribution: 0,
    weeklyContribution: 0,
    donatedResources: {
      gold: 0,
      rice: 0,
      lumber: 0,
      stone: 0,
      culture: 0,
      gems: 0,
    },
  };
  
  return {
    id: `guild_${now}_${Math.random().toString(36).substr(2, 9)}`,
    name: guildName,
    tag: guildTag,
    description,
    icon,
    level: 1,
    exp: 0,
    expToNextLevel: 1000,
    createdDate: now,
    leaderId,
    members: [leader],
    maxMembers: GUILD_MAX_MEMBERS,
    totalPower: 0,
    weeklyActivity: 0,
    buffs: initializeGuildBuffs(),
    treasury: {
      gold: 0,
      rice: 0,
      lumber: 0,
      stone: 0,
      culture: 0,
      gems: 0,
    },
    activeQuests: initializeDailyGuildQuests(),
    completedQuests: 0,
    activeShop: initializeGuildShop(),
    warHistory: {
      wins: 0,
      losses: 0,
      draws: 0,
    },
    activeWar: undefined,
    settings: {
      autoAccept: false,
      minLevel: 1,
      language: 'vi',
      isPublic: true,
      announcement: 'Chào mừng đến với guild!',
    },
    rank: 0,
    seasonRank: 0,
  };
}

/**
 * Initialize default guild buffs
 */
export function initializeGuildBuffs(): GuildBuff[] {
  return [
    {
      id: 'buff_production',
      name: 'production_boost',
      displayName: 'Tăng Sản Xuất',
      description: 'Tăng tốc độ sản xuất tài nguyên',
      icon: '⚡',
      level: 0,
      maxLevel: 10,
      effect: {
        type: 'production',
        value: 0, // 5% per level
      },
      cost: {
        gold: 1000,
        rice: 500,
        lumber: 500,
        stone: 500,
        culture: 100,
      },
    },
    {
      id: 'buff_combat',
      name: 'combat_boost',
      displayName: 'Tăng Sức Mạnh',
      description: 'Tăng sức mạnh chiến đấu',
      icon: '⚔️',
      level: 0,
      maxLevel: 10,
      effect: {
        type: 'combat',
        value: 0, // 5% per level
      },
      cost: {
        gold: 1500,
        rice: 500,
        lumber: 500,
        stone: 500,
        culture: 150,
      },
    },
    {
      id: 'buff_xp',
      name: 'xp_boost',
      displayName: 'Tăng Kinh Nghiệm',
      description: 'Tăng lượng XP nhận được',
      icon: '📚',
      level: 0,
      maxLevel: 10,
      effect: {
        type: 'xp',
        value: 0, // 5% per level
      },
      cost: {
        gold: 1000,
        rice: 300,
        lumber: 300,
        stone: 300,
        culture: 200,
      },
    },
  ];
}

/**
 * Add member to guild
 */
export function addMemberToGuild(
  guild: Guild,
  playerId: string,
  playerName: string,
  playerLevel: number
): Guild {
  if (guild.members.length >= guild.maxMembers) {
    throw new Error('Guild đã đầy');
  }
  
  const newMember: GuildMember = {
    playerId,
    playerName,
    playerLevel,
    role: 'member',
    joinDate: Date.now(),
    lastActive: Date.now(),
    contribution: 0,
    weeklyContribution: 0,
    donatedResources: {
      gold: 0,
      rice: 0,
      lumber: 0,
      stone: 0,
      culture: 0,
      gems: 0,
    },
  };
  
  return {
    ...guild,
    members: [...guild.members, newMember],
  };
}

/**
 * Remove member from guild
 */
export function removeMemberFromGuild(guild: Guild, playerId: string): Guild {
  // Cannot remove leader
  if (guild.leaderId === playerId) {
    throw new Error('Không thể xóa leader khỏi guild');
  }
  
  return {
    ...guild,
    members: guild.members.filter(m => m.playerId !== playerId),
  };
}

/**
 * Promote member
 */
export function promoteMember(guild: Guild, playerId: string, newRole: GuildRole): Guild {
  // Cannot promote leader
  if (playerId === guild.leaderId && newRole !== 'leader') {
    throw new Error('Không thể thay đổi role của leader');
  }
  
  return {
    ...guild,
    members: guild.members.map(m =>
      m.playerId === playerId ? { ...m, role: newRole } : m
    ),
  };
}

/**
 * Transfer leadership
 */
export function transferLeadership(guild: Guild, newLeaderId: string): Guild {
  const newLeader = guild.members.find(m => m.playerId === newLeaderId);
  if (!newLeader) {
    throw new Error('Member không tồn tại');
  }
  
  return {
    ...guild,
    leaderId: newLeaderId,
    members: guild.members.map(m => {
      if (m.playerId === newLeaderId) {
        return { ...m, role: 'leader' };
      }
      if (m.playerId === guild.leaderId) {
        return { ...m, role: 'member' };
      }
      return m;
    }),
  };
}

/**
 * Donate resources to guild
 */
export function donateToGuild(
  guild: Guild,
  playerId: string,
  resources: Resource
): { guild: Guild; contribution: number } {
  const member = guild.members.find(m => m.playerId === playerId);
  if (!member) {
    throw new Error('Bạn không phải thành viên của guild này');
  }
  
  // Calculate contribution points (simplified: 1 gold = 1 point)
  const contributionPoints =
    (resources.gold || 0) +
    (resources.rice || 0) * 0.8 +
    (resources.lumber || 0) * 0.8 +
    (resources.stone || 0) * 0.8 +
    (resources.culture || 0) * 2 +
    (resources.gems || 0) * 10;
  
  // Update guild treasury
  const newTreasury: Resource = {
    gold: guild.treasury.gold + (resources.gold || 0),
    rice: guild.treasury.rice + (resources.rice || 0),
    lumber: guild.treasury.lumber + (resources.lumber || 0),
    stone: guild.treasury.stone + (resources.stone || 0),
    culture: guild.treasury.culture + (resources.culture || 0),
    gems: guild.treasury.gems ? guild.treasury.gems + (resources.gems || 0) : (resources.gems || 0),
  };
  
  // Update member contribution
  const updatedMembers = guild.members.map(m => {
    if (m.playerId === playerId) {
      return {
        ...m,
        contribution: m.contribution + contributionPoints,
        weeklyContribution: m.weeklyContribution + contributionPoints,
        donatedResources: {
          gold: m.donatedResources.gold + (resources.gold || 0),
          rice: m.donatedResources.rice + (resources.rice || 0),
          lumber: m.donatedResources.lumber + (resources.lumber || 0),
          stone: m.donatedResources.stone + (resources.stone || 0),
          culture: m.donatedResources.culture + (resources.culture || 0),
          gems: (m.donatedResources.gems || 0) + (resources.gems || 0),
        },
      };
    }
    return m;
  });
  
  return {
    guild: {
      ...guild,
      treasury: newTreasury,
      members: updatedMembers,
    },
    contribution: contributionPoints,
  };
}

/**
 * Upgrade guild buff
 */
export function upgradeGuildBuff(guild: Guild, buffId: string): Guild {
  const buff = guild.buffs.find(b => b.id === buffId);
  if (!buff) {
    throw new Error('Buff không tồn tại');
  }
  
  if (buff.level >= buff.maxLevel) {
    throw new Error('Buff đã đạt cấp tối đa');
  }
  
  // Check if guild has enough resources
  const canAfford =
    guild.treasury.gold >= buff.cost.gold &&
    guild.treasury.rice >= buff.cost.rice &&
    guild.treasury.lumber >= buff.cost.lumber &&
    guild.treasury.stone >= buff.cost.stone &&
    guild.treasury.culture >= buff.cost.culture;
  
  if (!canAfford) {
    throw new Error('Guild không đủ tài nguyên để nâng cấp buff');
  }
  
  // Deduct resources
  const newTreasury: Resource = {
    gold: guild.treasury.gold - buff.cost.gold,
    rice: guild.treasury.rice - buff.cost.rice,
    lumber: guild.treasury.lumber - buff.cost.lumber,
    stone: guild.treasury.stone - buff.cost.stone,
    culture: guild.treasury.culture - buff.cost.culture,
    gems: guild.treasury.gems || 0,
  };
  
  // Upgrade buff
  const updatedBuffs = guild.buffs.map(b => {
    if (b.id === buffId) {
      const newLevel = b.level + 1;
      return {
        ...b,
        level: newLevel,
        effect: {
          ...b.effect,
          value: newLevel * 5, // 5% per level
        },
        cost: {
          gold: Math.floor(b.cost.gold * 1.5),
          rice: Math.floor(b.cost.rice * 1.5),
          lumber: Math.floor(b.cost.lumber * 1.5),
          stone: Math.floor(b.cost.stone * 1.5),
          culture: Math.floor(b.cost.culture * 1.5),
        },
      };
    }
    return b;
  });
  
  return {
    ...guild,
    treasury: newTreasury,
    buffs: updatedBuffs,
  };
}

/**
 * Add guild XP
 */
export function addGuildExp(guild: Guild, exp: number): Guild {
  let newExp = guild.exp + exp;
  let newLevel = guild.level;
  let newExpToNext = guild.expToNextLevel;
  
  // Level up if enough exp
  while (newExp >= newExpToNext) {
    newExp -= newExpToNext;
    newLevel += 1;
    newExpToNext = calculateGuildExpForNextLevel(newLevel);
  }
  
  return {
    ...guild,
    level: newLevel,
    exp: newExp,
    expToNextLevel: newExpToNext,
    maxMembers: calculateMaxMembers(newLevel),
  };
}

/**
 * Calculate guild exp for next level
 */
export function calculateGuildExpForNextLevel(level: number): number {
  return Math.floor(1000 * Math.pow(1.2, level - 1));
}

/**
 * Calculate max members based on guild level
 */
export function calculateMaxMembers(guildLevel: number): number {
  return Math.min(GUILD_MAX_MEMBERS, 20 + guildLevel * 2);
}

/**
 * Send guild chat message
 */
export function createGuildChatMessage(
  senderId: string,
  senderName: string,
  senderRole: GuildRole,
  message: string,
  type: 'normal' | 'system' | 'announcement' = 'normal'
): GuildChatMessage {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    senderId,
    senderName,
    senderRole,
    message: message.substring(0, GUILD_CHAT_MESSAGE_MAX_LENGTH),
    timestamp: Date.now(),
    type,
  };
}

/**
 * Get member role color
 */
export function getRoleColor(role: GuildRole): string {
  switch (role) {
    case 'leader':
      return '#FFD700'; // Gold
    case 'officer':
      return '#9333EA'; // Purple
    case 'member':
      return '#3B82F6'; // Blue
  }
}

/**
 * Get member role name in Vietnamese
 */
export function getRoleNameVi(role: GuildRole): string {
  switch (role) {
    case 'leader':
      return 'Hội Trưởng';
    case 'officer':
      return 'Quản Lý';
    case 'member':
      return 'Thành Viên';
  }
}

/**
 * Format guild member count
 */
export function formatMemberCount(guild: Guild): string {
  return `${guild.members.length}/${guild.maxMembers}`;
}

/**
 * Check if player can manage guild (leader or officer)
 */
export function canManageGuild(role?: GuildRole): boolean {
  return role === 'leader' || role === 'officer';
}

/**
 * Check if player is leader
 */
export function isGuildLeader(role?: GuildRole): boolean {
  return role === 'leader';
}

/**
 * Get guild buff tooltip
 */
export function getBuffTooltip(buff: GuildBuff): string {
  const effectText = `+${buff.effect.value}%`;
  const costText = `Gold: ${buff.cost.gold}, Rice: ${buff.cost.rice}, Lumber: ${buff.cost.lumber}, Stone: ${buff.cost.stone}, Culture: ${buff.cost.culture}`;
  
  return `${buff.displayName}\nLevel: ${buff.level}/${buff.maxLevel}\nEffect: ${effectText}\nCost to upgrade: ${costText}`;
}

/**
 * Sort guild members by contribution
 */
export function sortMembersByContribution(members: GuildMember[]): GuildMember[] {
  return [...members].sort((a, b) => b.contribution - a.contribution);
}

/**
 * Get top contributors
 */
export function getTopContributors(guild: Guild, limit: number = 10): GuildMember[] {
  return sortMembersByContribution(guild.members).slice(0, limit);
}

// ============================================================================
// GUILD WARS SYSTEM
// ============================================================================

/**
 * Create a new guild war
 */
export function createGuildWar(
  attackingGuildId: string,
  defendingGuildId: string,
  durationHours: number = 72
): GuildWar {
  const now = Date.now();
  const endTime = now + durationHours * 60 * 60 * 1000;
  
  return {
    id: `war_${now}_${Math.random().toString(36).substr(2, 9)}`,
    attackingGuildId,
    defendingGuildId,
    startTime: now,
    endTime,
    status: 'active',
    attackScore: 0,
    defendScore: 0,
    participants: [],
    rewards: {
      winner: {
        gold: 50000,
        rice: 30000,
        lumber: 30000,
        stone: 30000,
        culture: 5000,
        gems: 500,
      },
      loser: {
        gold: 20000,
        rice: 10000,
        lumber: 10000,
        stone: 10000,
        culture: 2000,
        gems: 100,
      },
    },
  };
}

/**
 * Record a battle in guild war
 */
export function recordGuildWarBattle(
  war: GuildWar,
  playerId: string,
  guildId: string,
  won: boolean,
  points: number
): GuildWar {
  // Update participant stats
  const existingParticipant = war.participants.find(p => p.playerId === playerId);
  
  let updatedParticipants;
  if (existingParticipant) {
    updatedParticipants = war.participants.map(p =>
      p.playerId === playerId
        ? {
            ...p,
            wins: p.wins + (won ? 1 : 0),
            losses: p.losses + (won ? 0 : 1),
            points: p.points + points,
          }
        : p
    );
  } else {
    updatedParticipants = [
      ...war.participants,
      {
        playerId,
        guildId,
        wins: won ? 1 : 0,
        losses: won ? 0 : 1,
        points,
      },
    ];
  }
  
  // Update guild scores
  const isAttacker = guildId === war.attackingGuildId;
  
  return {
    ...war,
    attackScore: isAttacker ? war.attackScore + points : war.attackScore,
    defendScore: !isAttacker ? war.defendScore + points : war.defendScore,
    participants: updatedParticipants,
  };
}

/**
 * End guild war and determine winner
 */
export function endGuildWar(war: GuildWar): GuildWar {
  const status: 'completed' = 'completed';
  
  return {
    ...war,
    status,
    endTime: Date.now(),
  };
}

/**
 * Get guild war winner
 */
export function getGuildWarWinner(war: GuildWar): string | null {
  if (war.status !== 'completed') return null;
  
  if (war.attackScore > war.defendScore) return war.attackingGuildId;
  if (war.defendScore > war.attackScore) return war.defendingGuildId;
  return null; // Draw
}

/**
 * Check if guild war is active
 */
export function isGuildWarActive(war: GuildWar): boolean {
  const now = Date.now();
  return war.status === 'active' && now >= war.startTime && now < war.endTime;
}

/**
 * Get time remaining in guild war (milliseconds)
 */
export function getGuildWarTimeRemaining(war: GuildWar): number {
  if (war.status !== 'active') return 0;
  const now = Date.now();
  return Math.max(0, war.endTime - now);
}

/**
 * Format war time remaining
 */
export function formatWarTimeRemaining(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

// ============================================================================
// GUILD SHOP SYSTEM
// ============================================================================

/**
 * Initialize guild shop items
 */
export function initializeGuildShop(): GuildShopItem[] {
  return [
    // Hero Fragments
    {
      id: 'hero_fragment_common',
      name: 'hero_fragment_common',
      displayName: 'Mảnh Tướng Thường',
      description: 'Mảnh tướng phẩm chất Thường',
      type: 'hero',
      rarity: 'common',
      cost: 50,
      stock: -1, // Unlimited
      cooldown: 0,
      item: { type: 'hero_fragment', rarity: 'common', amount: 1 },
    },
    {
      id: 'hero_fragment_rare',
      name: 'hero_fragment_rare',
      displayName: 'Mảnh Tướng Hiếm',
      description: 'Mảnh tướng phẩm chất Hiếm',
      type: 'hero',
      rarity: 'rare',
      cost: 200,
      stock: -1,
      cooldown: 0,
      item: { type: 'hero_fragment', rarity: 'rare', amount: 1 },
    },
    {
      id: 'hero_fragment_epic',
      name: 'hero_fragment_epic',
      displayName: 'Mảnh Tướng Sử Thi',
      description: 'Mảnh tướng phẩm chất Sử Thi',
      type: 'hero',
      rarity: 'epic',
      cost: 500,
      stock: -1,
      cooldown: 0,
      item: { type: 'hero_fragment', rarity: 'epic', amount: 1 },
    },
    {
      id: 'hero_fragment_legendary',
      name: 'hero_fragment_legendary',
      displayName: 'Mảnh Tướng Huyền Thoại',
      description: 'Mảnh tướng phẩm chất Huyền Thoại',
      type: 'hero',
      rarity: 'legendary',
      cost: 1500,
      stock: 5, // Limited per week
      cooldown: 7 * 24 * 60 * 60 * 1000, // 7 days
      item: { type: 'hero_fragment', rarity: 'legendary', amount: 1 },
    },
    
    // Pet Items
    {
      id: 'pet_egg_rare',
      name: 'pet_egg_rare',
      displayName: 'Trứng Pet Hiếm',
      description: 'Trứng pet phẩm chất Hiếm',
      type: 'pet',
      rarity: 'rare',
      cost: 300,
      stock: -1,
      cooldown: 0,
      item: { type: 'pet_egg', rarity: 'rare' },
    },
    {
      id: 'pet_egg_epic',
      name: 'pet_egg_epic',
      displayName: 'Trứng Pet Sử Thi',
      description: 'Trứng pet phẩm chất Sử Thi',
      type: 'pet',
      rarity: 'epic',
      cost: 800,
      stock: -1,
      cooldown: 0,
      item: { type: 'pet_egg', rarity: 'epic' },
    },
    
    // Resource Bundles
    {
      id: 'resource_bundle_gold',
      name: 'resource_bundle_gold',
      displayName: 'Gói Vàng Lớn',
      description: '50,000 vàng',
      type: 'resource',
      rarity: 'common',
      cost: 100,
      stock: -1,
      cooldown: 0,
      item: { type: 'resource', resourceType: 'gold', amount: 50000 },
    },
    {
      id: 'resource_bundle_rice',
      name: 'resource_bundle_rice',
      displayName: 'Gói Gạo Lớn',
      description: '30,000 gạo',
      type: 'resource',
      rarity: 'common',
      cost: 80,
      stock: -1,
      cooldown: 0,
      item: { type: 'resource', resourceType: 'rice', amount: 30000 },
    },
    {
      id: 'resource_bundle_culture',
      name: 'resource_bundle_culture',
      displayName: 'Gói Văn Hóa',
      description: '5,000 văn hóa',
      type: 'resource',
      rarity: 'rare',
      cost: 150,
      stock: -1,
      cooldown: 0,
      item: { type: 'resource', resourceType: 'culture', amount: 5000 },
    },
    
    // Buffs
    {
      id: 'buff_production_boost',
      name: 'buff_production_boost',
      displayName: 'Buff Sản Xuất 24h',
      description: '+20% sản xuất trong 24 giờ',
      type: 'buff',
      rarity: 'epic',
      cost: 500,
      stock: -1,
      cooldown: 24 * 60 * 60 * 1000, // 24 hours
      item: { type: 'buff', buffType: 'production', duration: 24 * 60 * 60 * 1000, value: 20 },
    },
    
    // Exclusive Guild Items
    {
      id: 'guild_exclusive_hero',
      name: 'guild_exclusive_hero',
      displayName: 'Tướng Độc Quyền Guild',
      description: 'Tướng huyền thoại chỉ có trong Guild Shop',
      type: 'hero',
      rarity: 'legendary',
      cost: 5000,
      stock: 1, // One per guild member
      cooldown: 30 * 24 * 60 * 60 * 1000, // 30 days
      item: { type: 'exclusive_hero', heroId: 'guild_champion' },
    },
  ];
}

/**
 * Purchase item from guild shop
 */
export function purchaseGuildShopItem(
  guild: Guild,
  member: GuildMember,
  itemId: string
): { success: boolean; error?: string; updatedGuild?: Guild; updatedMember?: GuildMember } {
  const item = guild.activeShop?.find(i => i.id === itemId);
  
  if (!item) {
    return { success: false, error: 'Vật phẩm không tồn tại' };
  }
  
  // Check if member has enough contribution points
  if (member.contribution < item.cost) {
    return { success: false, error: 'Không đủ điểm đóng góp' };
  }
  
  // Check stock
  if (item.stock === 0) {
    return { success: false, error: 'Vật phẩm đã hết hàng' };
  }
  
  // Deduct contribution points
  const updatedMember: GuildMember = {
    ...member,
    contribution: member.contribution - item.cost,
  };
  
  // Update stock
  const updatedShop = guild.activeShop?.map(i =>
    i.id === itemId && i.stock > 0
      ? { ...i, stock: i.stock - 1 }
      : i
  );
  
  const updatedGuild: Guild = {
    ...guild,
    activeShop: updatedShop,
    members: guild.members.map(m =>
      m.playerId === member.playerId ? updatedMember : m
    ),
  };
  
  return { success: true, updatedGuild, updatedMember };
}

// ============================================================================
// GUILD QUESTS SYSTEM
// ============================================================================

/**
 * Initialize daily guild quests
 */
export function initializeDailyGuildQuests(): GuildQuest[] {
  const now = Date.now();
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  return [
    {
      id: 'daily_combat_wins',
      name: 'daily_combat_wins',
      displayName: 'Chiến Thắng Hàng Ngày',
      description: 'Tổng cộng 50 trận thắng trong guild',
      type: 'combat',
      target: 50,
      progress: 0,
      rewards: {
        resources: { gold: 10000, rice: 5000, lumber: 5000, stone: 5000, culture: 1000, gems: 0 },
        guildExp: 500,
        contribution: 10,
      },
      startDate: now,
      endDate: endOfDay.getTime(),
      completed: false,
    },
    {
      id: 'daily_resource_collection',
      name: 'daily_resource_collection',
      displayName: 'Thu Thập Tài Nguyên',
      description: 'Thu thập tổng cộng 100,000 tài nguyên',
      type: 'collection',
      target: 100000,
      progress: 0,
      rewards: {
        resources: { gold: 8000, rice: 4000, lumber: 4000, stone: 4000, culture: 800, gems: 0 },
        guildExp: 400,
        contribution: 8,
      },
      startDate: now,
      endDate: endOfDay.getTime(),
      completed: false,
    },
    {
      id: 'daily_donations',
      name: 'daily_donations',
      displayName: 'Quyên Góp Guild',
      description: '20 thành viên quyên góp tài nguyên',
      type: 'donation',
      target: 20,
      progress: 0,
      rewards: {
        resources: { gold: 15000, rice: 7000, lumber: 7000, stone: 7000, culture: 1500, gems: 0 },
        guildExp: 600,
        contribution: 15,
      },
      startDate: now,
      endDate: endOfDay.getTime(),
      completed: false,
    },
  ];
}

/**
 * Initialize weekly guild quests
 */
export function initializeWeeklyGuildQuests(): GuildQuest[] {
  const now = Date.now();
  const endOfWeek = new Date();
  endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
  endOfWeek.setHours(23, 59, 59, 999);
  
  return [
    {
      id: 'weekly_guild_wars',
      name: 'weekly_guild_wars',
      displayName: 'Chiến Tranh Guild',
      description: 'Thắng 3 trận Guild War',
      type: 'combat',
      target: 3,
      progress: 0,
      rewards: {
        resources: { gold: 50000, rice: 25000, lumber: 25000, stone: 25000, culture: 5000, gems: 100 },
        guildExp: 2000,
        contribution: 50,
      },
      startDate: now,
      endDate: endOfWeek.getTime(),
      completed: false,
    },
    {
      id: 'weekly_buff_upgrades',
      name: 'weekly_buff_upgrades',
      displayName: 'Nâng Cấp Buff',
      description: 'Nâng cấp 5 buff guild',
      type: 'social',
      target: 5,
      progress: 0,
      rewards: {
        resources: { gold: 40000, rice: 20000, lumber: 20000, stone: 20000, culture: 4000, gems: 50 },
        guildExp: 1500,
        contribution: 40,
      },
      startDate: now,
      endDate: endOfWeek.getTime(),
      completed: false,
    },
    {
      id: 'weekly_activity',
      name: 'weekly_activity',
      displayName: 'Hoạt Động Tích Cực',
      description: '80% thành viên đăng nhập mỗi ngày',
      type: 'social',
      target: 1,
      progress: 0,
      rewards: {
        resources: { gold: 60000, rice: 30000, lumber: 30000, stone: 30000, culture: 6000, gems: 150 },
        guildExp: 2500,
        contribution: 60,
      },
      startDate: now,
      endDate: endOfWeek.getTime(),
      completed: false,
    },
  ];
}

/**
 * Update guild quest progress
 */
export function updateGuildQuestProgress(
  guild: Guild,
  questId: string,
  progressAmount: number
): Guild {
  const updatedQuests = guild.activeQuests.map(quest => {
    if (quest.id === questId && !quest.completed) {
      const newProgress = Math.min(quest.progress + progressAmount, quest.target);
      const isCompleted = newProgress >= quest.target;
      
      return {
        ...quest,
        progress: newProgress,
        completed: isCompleted,
      };
    }
    return quest;
  });
  
  return {
    ...guild,
    activeQuests: updatedQuests,
  };
}

/**
 * Claim guild quest rewards
 */
export function claimGuildQuestRewards(
  guild: Guild,
  questId: string
): { success: boolean; error?: string; updatedGuild?: Guild } {
  const quest = guild.activeQuests.find(q => q.id === questId);
  
  if (!quest) {
    return { success: false, error: 'Nhiệm vụ không tồn tại' };
  }
  
  if (!quest.completed) {
    return { success: false, error: 'Nhiệm vụ chưa hoàn thành' };
  }
  
  // Add rewards to guild treasury
  const updatedTreasury: Resource = {
    gold: guild.treasury.gold + quest.rewards.resources.gold,
    rice: guild.treasury.rice + quest.rewards.resources.rice,
    lumber: guild.treasury.lumber + quest.rewards.resources.lumber,
    stone: guild.treasury.stone + quest.rewards.resources.stone,
    culture: guild.treasury.culture + quest.rewards.resources.culture,
    gems: (guild.treasury.gems || 0) + (quest.rewards.resources.gems || 0),
  };
  
  // Add guild exp
  const updatedGuild = addGuildExp(
    {
      ...guild,
      treasury: updatedTreasury,
      completedQuests: guild.completedQuests + 1,
      activeQuests: guild.activeQuests.filter(q => q.id !== questId),
    },
    quest.rewards.guildExp
  );
  
  // Note: Contribution rewards should be distributed to all members who contributed
  // This would be handled in the gameStore
  
  return { success: true, updatedGuild };
}

/**
 * Check if quests need to be refreshed
 */
export function shouldRefreshQuests(quests: GuildQuest[]): boolean {
  const now = Date.now();
  return quests.some(quest => now > quest.endDate);
}

/**
 * Get quest progress percentage
 */
export function getQuestProgressPercentage(quest: GuildQuest): number {
  return Math.floor((quest.progress / quest.target) * 100);
}

/**
 * Format quest time remaining
 */
export function formatQuestTimeRemaining(quest: GuildQuest): string {
  const now = Date.now();
  const remaining = quest.endDate - now;
  
  if (remaining <= 0) return 'Đã hết hạn';
  
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} ngày`;
  }
  
  return `${hours}h ${minutes}m`;
}
