// ============= FRIENDS & SOCIAL SYSTEM =============
// MVP 3 Feature: Friend management, chat, gifts, leaderboards
// Features:
// - Friend list management (max 50 friends)
// - Add/remove/accept friend requests
// - Online status indicators
// - 1-on-1 private chat (message history 100)
// - Daily gift system (send/receive resources)
// - Visit friend provinces (help production)
// - Friend leaderboard (level, power, achievements)

import { v4 as uuidv4 } from 'uuid';

// ============= TYPE DEFINITIONS =============

export type FriendStatus = 'pending_sent' | 'pending_received' | 'accepted' | 'blocked';
export type OnlineStatus = 'online' | 'away' | 'offline';
export type GiftType = 'gold' | 'gems' | 'stamina' | 'hero_fragment' | 'pet_egg';

export interface Friend {
  id: string;
  playerId: string;
  playerName: string;
  playerLevel: number;
  playerPower: number;
  playerAvatar?: string;
  status: FriendStatus;
  onlineStatus: OnlineStatus;
  lastOnline: number; // Timestamp
  addedDate: number; // Timestamp
  totalGifts: number; // Total gifts exchanged
  canSendGift: boolean; // Daily gift available
  canReceiveGift: boolean;
}

export interface FriendRequest {
  id: string;
  fromPlayerId: string;
  fromPlayerName: string;
  fromPlayerLevel: number;
  fromPlayerPower: number;
  toPlayerId: string;
  sentDate: number; // Timestamp
  expiresAt: number; // Timestamp (7 days)
  message?: string;
}

export interface ChatMessage {
  id: string;
  fromPlayerId: string;
  fromPlayerName: string;
  toPlayerId: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface ChatConversation {
  friendId: string;
  friendName: string;
  messages: ChatMessage[];
  unreadCount: number;
  lastMessageTime: number;
}

export interface DailyGift {
  id: string;
  fromPlayerId: string;
  fromPlayerName: string;
  toPlayerId: string;
  giftType: GiftType;
  quantity: number;
  message?: string;
  sentDate: number; // Timestamp
  claimed: boolean;
  claimedDate?: number;
}

export interface FriendVisit {
  id: string;
  visitorId: string;
  visitorName: string;
  hostId: string;
  provinceId: string;
  helpType: 'production' | 'defense' | 'speedup';
  bonus: number; // Percentage bonus (e.g., 10 for 10%)
  timestamp: number;
  duration: number; // In minutes
}

export interface FriendLeaderboardEntry {
  playerId: string;
  playerName: string;
  playerLevel: number;
  playerPower: number;
  totalAchievements: number;
  guildName?: string;
  arenaRank?: number;
  rank: number;
}

export interface FriendSystemState {
  friends: Friend[];
  friendRequests: FriendRequest[]; // Both sent and received
  conversations: ChatConversation[];
  pendingGifts: DailyGift[]; // Gifts to claim
  sentGifts: DailyGift[]; // Gifts sent today
  visits: FriendVisit[]; // Active visits from friends
  leaderboard: FriendLeaderboardEntry[];
  lastGiftReset: number; // Timestamp for daily reset
  searchResults: Friend[]; // Search results cache
}

// ============= CONSTANTS =============

export const MAX_FRIENDS = 50;
export const MAX_PENDING_REQUESTS = 20;
export const MAX_CHAT_HISTORY = 100;
export const MAX_MESSAGE_LENGTH = 200;
export const FRIEND_REQUEST_EXPIRY_DAYS = 7;
export const GIFT_COOLDOWN_HOURS = 24;
export const VISIT_DURATION_MINUTES = 60;
export const VISIT_BONUS_PERCENT = 10;

// Gift rewards
export const GIFT_REWARDS: Record<GiftType, { name: string; icon: string; baseQuantity: number }> = {
  gold: { name: 'Vàng', icon: '💰', baseQuantity: 1000 },
  gems: { name: 'Gems', icon: '💎', baseQuantity: 10 },
  stamina: { name: 'Thể Lực', icon: '⚡', baseQuantity: 20 },
  hero_fragment: { name: 'Mảnh Tướng', icon: '👑', baseQuantity: 3 },
  pet_egg: { name: 'Trứng Pet', icon: '🥚', baseQuantity: 1 },
};

// ============= INITIALIZATION =============

export function initializeFriendSystemState(): FriendSystemState {
  return {
    friends: [],
    friendRequests: [],
    conversations: [],
    pendingGifts: [],
    sentGifts: [],
    visits: [],
    leaderboard: [],
    lastGiftReset: Date.now(),
    searchResults: [],
  };
}

// ============= FRIEND MANAGEMENT =============

export function canAddMoreFriends(state: FriendSystemState): boolean {
  const acceptedFriends = state.friends.filter(f => f.status === 'accepted');
  return acceptedFriends.length < MAX_FRIENDS;
}

export function canSendMoreRequests(state: FriendSystemState, currentPlayerId: string): boolean {
  const sentRequests = state.friendRequests.filter(
    r => r.fromPlayerId === currentPlayerId && Date.now() < r.expiresAt
  );
  return sentRequests.length < MAX_PENDING_REQUESTS;
}

export function sendFriendRequest(
  state: FriendSystemState,
  fromPlayerId: string,
  fromPlayerName: string,
  fromPlayerLevel: number,
  fromPlayerPower: number,
  toPlayerId: string,
  message?: string
): { success: boolean; state?: FriendSystemState; error?: string } {
  // Check if already friends
  const existingFriend = state.friends.find(
    f => f.playerId === toPlayerId && f.status === 'accepted'
  );
  if (existingFriend) {
    return { success: false, error: 'Đã là bạn bè!' };
  }

  // Check if request already exists
  const existingRequest = state.friendRequests.find(
    r => (r.fromPlayerId === fromPlayerId && r.toPlayerId === toPlayerId) ||
         (r.fromPlayerId === toPlayerId && r.toPlayerId === fromPlayerId)
  );
  if (existingRequest) {
    return { success: false, error: 'Đã gửi lời mời kết bạn!' };
  }

  // Check limits
  if (!canSendMoreRequests(state, fromPlayerId)) {
    return { success: false, error: `Tối đa ${MAX_PENDING_REQUESTS} lời mời đang chờ!` };
  }

  const newRequest: FriendRequest = {
    id: uuidv4(),
    fromPlayerId,
    fromPlayerName,
    fromPlayerLevel,
    fromPlayerPower,
    toPlayerId,
    sentDate: Date.now(),
    expiresAt: Date.now() + (FRIEND_REQUEST_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
    message,
  };

  return {
    success: true,
    state: {
      ...state,
      friendRequests: [...state.friendRequests, newRequest],
    },
  };
}

export function acceptFriendRequest(
  state: FriendSystemState,
  requestId: string,
  currentPlayerId: string
): { success: boolean; state?: FriendSystemState; error?: string } {
  const request = state.friendRequests.find(r => r.id === requestId);
  
  if (!request) {
    return { success: false, error: 'Không tìm thấy lời mời!' };
  }

  if (request.toPlayerId !== currentPlayerId) {
    return { success: false, error: 'Lời mời không hợp lệ!' };
  }

  if (Date.now() > request.expiresAt) {
    return { success: false, error: 'Lời mời đã hết hạn!' };
  }

  if (!canAddMoreFriends(state)) {
    return { success: false, error: `Đã đạt tối đa ${MAX_FRIENDS} bạn bè!` };
  }

  // Create friend entry for both players
  const newFriend: Friend = {
    id: uuidv4(),
    playerId: request.fromPlayerId,
    playerName: request.fromPlayerName,
    playerLevel: request.fromPlayerLevel,
    playerPower: request.fromPlayerPower,
    status: 'accepted',
    onlineStatus: 'offline',
    lastOnline: Date.now(),
    addedDate: Date.now(),
    totalGifts: 0,
    canSendGift: true,
    canReceiveGift: true,
  };

  // Initialize chat conversation
  const newConversation: ChatConversation = {
    friendId: request.fromPlayerId,
    friendName: request.fromPlayerName,
    messages: [],
    unreadCount: 0,
    lastMessageTime: Date.now(),
  };

  return {
    success: true,
    state: {
      ...state,
      friends: [...state.friends, newFriend],
      friendRequests: state.friendRequests.filter(r => r.id !== requestId),
      conversations: [...state.conversations, newConversation],
    },
  };
}

export function declineFriendRequest(
  state: FriendSystemState,
  requestId: string
): { success: boolean; state?: FriendSystemState; error?: string } {
  const request = state.friendRequests.find(r => r.id === requestId);
  
  if (!request) {
    return { success: false, error: 'Không tìm thấy lời mời!' };
  }

  return {
    success: true,
    state: {
      ...state,
      friendRequests: state.friendRequests.filter(r => r.id !== requestId),
    },
  };
}

export function removeFriend(
  state: FriendSystemState,
  friendId: string
): { success: boolean; state?: FriendSystemState; error?: string } {
  const friend = state.friends.find(f => f.id === friendId);
  
  if (!friend) {
    return { success: false, error: 'Không tìm thấy bạn bè!' };
  }

  return {
    success: true,
    state: {
      ...state,
      friends: state.friends.filter(f => f.id !== friendId),
      conversations: state.conversations.filter(c => c.friendId !== friend.playerId),
    },
  };
}

// ============= CHAT SYSTEM =============

export function sendChatMessage(
  state: FriendSystemState,
  fromPlayerId: string,
  fromPlayerName: string,
  toPlayerId: string,
  message: string
): { success: boolean; state?: FriendSystemState; error?: string } {
  if (message.length > MAX_MESSAGE_LENGTH) {
    return { success: false, error: `Tin nhắn tối đa ${MAX_MESSAGE_LENGTH} ký tự!` };
  }

  // Check if friends
  const friend = state.friends.find(
    f => f.playerId === toPlayerId && f.status === 'accepted'
  );
  if (!friend) {
    return { success: false, error: 'Chỉ có thể chat với bạn bè!' };
  }

  const newMessage: ChatMessage = {
    id: uuidv4(),
    fromPlayerId,
    fromPlayerName,
    toPlayerId,
    message,
    timestamp: Date.now(),
    read: false,
  };

  // Find or create conversation
  let conversations = [...state.conversations];
  const existingConvIndex = conversations.findIndex(c => c.friendId === toPlayerId);

  if (existingConvIndex >= 0) {
    const conv = conversations[existingConvIndex];
    const messages = [...conv.messages, newMessage];
    
    // Keep only last 100 messages
    if (messages.length > MAX_CHAT_HISTORY) {
      messages.shift();
    }

    conversations[existingConvIndex] = {
      ...conv,
      messages,
      lastMessageTime: Date.now(),
    };
  } else {
    conversations.push({
      friendId: toPlayerId,
      friendName: friend.playerName,
      messages: [newMessage],
      unreadCount: 0,
      lastMessageTime: Date.now(),
    });
  }

  return {
    success: true,
    state: {
      ...state,
      conversations,
    },
  };
}

export function markMessagesAsRead(
  state: FriendSystemState,
  friendId: string
): FriendSystemState {
  const conversations = state.conversations.map(conv => {
    if (conv.friendId === friendId) {
      return {
        ...conv,
        messages: conv.messages.map(msg => ({ ...msg, read: true })),
        unreadCount: 0,
      };
    }
    return conv;
  });

  return {
    ...state,
    conversations,
  };
}

export function getTotalUnreadMessages(state: FriendSystemState): number {
  return state.conversations.reduce((total, conv) => total + conv.unreadCount, 0);
}

// ============= GIFT SYSTEM =============

export function shouldResetGifts(lastReset: number): boolean {
  const now = new Date();
  const lastResetDate = new Date(lastReset);
  
  return now.toDateString() !== lastResetDate.toDateString();
}

export function resetDailyGifts(state: FriendSystemState): FriendSystemState {
  return {
    ...state,
    friends: state.friends.map(f => ({
      ...f,
      canSendGift: true,
      canReceiveGift: true,
    })),
    sentGifts: [],
    lastGiftReset: Date.now(),
  };
}

export function sendGiftToFriend(
  state: FriendSystemState,
  fromPlayerId: string,
  fromPlayerName: string,
  friendId: string,
  giftType: GiftType,
  message?: string
): { success: boolean; state?: FriendSystemState; error?: string } {
  const friend = state.friends.find(f => f.id === friendId);
  
  if (!friend) {
    return { success: false, error: 'Không tìm thấy bạn bè!' };
  }

  if (friend.status !== 'accepted') {
    return { success: false, error: 'Chỉ có thể tặng quà cho bạn bè!' };
  }

  if (!friend.canSendGift) {
    return { success: false, error: 'Đã tặng quà cho bạn này hôm nay!' };
  }

  const giftInfo = GIFT_REWARDS[giftType];
  const newGift: DailyGift = {
    id: uuidv4(),
    fromPlayerId,
    fromPlayerName,
    toPlayerId: friend.playerId,
    giftType,
    quantity: giftInfo.baseQuantity,
    message,
    sentDate: Date.now(),
    claimed: false,
  };

  return {
    success: true,
    state: {
      ...state,
      friends: state.friends.map(f =>
        f.id === friendId ? { ...f, canSendGift: false } : f
      ),
      sentGifts: [...state.sentGifts, newGift],
    },
  };
}

export function claimGift(
  state: FriendSystemState,
  giftId: string
): { success: boolean; state?: FriendSystemState; gift?: DailyGift; error?: string } {
  const gift = state.pendingGifts.find(g => g.id === giftId);
  
  if (!gift) {
    return { success: false, error: 'Không tìm thấy quà!' };
  }

  if (gift.claimed) {
    return { success: false, error: 'Quà đã được nhận!' };
  }

  const claimedGift = {
    ...gift,
    claimed: true,
    claimedDate: Date.now(),
  };

  // Update friend's total gifts
  const friends = state.friends.map(f => {
    if (f.playerId === gift.fromPlayerId) {
      return { ...f, totalGifts: f.totalGifts + 1 };
    }
    return f;
  });

  return {
    success: true,
    state: {
      ...state,
      pendingGifts: state.pendingGifts.filter(g => g.id !== giftId),
      friends,
    },
    gift: claimedGift,
  };
}

export function claimAllGifts(
  state: FriendSystemState
): { success: boolean; state?: FriendSystemState; gifts?: DailyGift[]; error?: string } {
  if (state.pendingGifts.length === 0) {
    return { success: false, error: 'Không có quà để nhận!' };
  }

  const claimedGifts = state.pendingGifts.map(g => ({
    ...g,
    claimed: true,
    claimedDate: Date.now(),
  }));

  // Update friend's total gifts
  const giftCounts = new Map<string, number>();
  state.pendingGifts.forEach(g => {
    giftCounts.set(g.fromPlayerId, (giftCounts.get(g.fromPlayerId) || 0) + 1);
  });

  const friends = state.friends.map(f => {
    const count = giftCounts.get(f.playerId) || 0;
    return count > 0 ? { ...f, totalGifts: f.totalGifts + count } : f;
  });

  return {
    success: true,
    state: {
      ...state,
      pendingGifts: [],
      friends,
    },
    gifts: claimedGifts,
  };
}

// ============= VISIT SYSTEM =============

export function visitFriendProvince(
  state: FriendSystemState,
  visitorId: string,
  visitorName: string,
  friendId: string,
  provinceId: string,
  helpType: 'production' | 'defense' | 'speedup'
): { success: boolean; state?: FriendSystemState; visit?: FriendVisit; error?: string } {
  const friend = state.friends.find(f => f.id === friendId);
  
  if (!friend) {
    return { success: false, error: 'Không tìm thấy bạn bè!' };
  }

  if (friend.status !== 'accepted') {
    return { success: false, error: 'Chỉ có thể viếng thăm bạn bè!' };
  }

  // Check if already visiting this province
  const existingVisit = state.visits.find(
    v => v.visitorId === visitorId && v.provinceId === provinceId && 
         Date.now() < v.timestamp + (v.duration * 60 * 1000)
  );
  
  if (existingVisit) {
    return { success: false, error: 'Đã viếng thăm tỉnh này!' };
  }

  const newVisit: FriendVisit = {
    id: uuidv4(),
    visitorId,
    visitorName,
    hostId: friend.playerId,
    provinceId,
    helpType,
    bonus: VISIT_BONUS_PERCENT,
    timestamp: Date.now(),
    duration: VISIT_DURATION_MINUTES,
  };

  return {
    success: true,
    state: {
      ...state,
      visits: [...state.visits, newVisit],
    },
    visit: newVisit,
  };
}

export function getActiveVisits(state: FriendSystemState, provinceId: string): FriendVisit[] {
  const now = Date.now();
  return state.visits.filter(
    v => v.provinceId === provinceId && now < v.timestamp + (v.duration * 60 * 1000)
  );
}

export function cleanupExpiredVisits(state: FriendSystemState): FriendSystemState {
  const now = Date.now();
  return {
    ...state,
    visits: state.visits.filter(v => now < v.timestamp + (v.duration * 60 * 1000)),
  };
}

// ============= LEADERBOARD =============

export function updateFriendLeaderboard(
  state: FriendSystemState,
  friends: Friend[],
  currentPlayerData: { level: number; power: number; achievements: number; guildName?: string; arenaRank?: number }
): FriendSystemState {
  const entries: FriendLeaderboardEntry[] = friends
    .filter(f => f.status === 'accepted')
    .map(f => ({
      playerId: f.playerId,
      playerName: f.playerName,
      playerLevel: f.playerLevel,
      playerPower: f.playerPower,
      totalAchievements: 0, // Would be fetched from actual player data
      rank: 0,
    }))
    .sort((a, b) => {
      // Sort by power first, then level
      if (b.playerPower !== a.playerPower) {
        return b.playerPower - a.playerPower;
      }
      return b.playerLevel - a.playerLevel;
    })
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  return {
    ...state,
    leaderboard: entries,
  };
}

// ============= SEARCH & DISCOVERY =============

export function searchPlayersByName(
  allPlayers: any[], // Would be from server/database
  searchQuery: string,
  currentPlayerId: string,
  currentFriends: Friend[]
): Friend[] {
  const query = searchQuery.toLowerCase().trim();
  
  if (query.length < 2) {
    return [];
  }

  const friendIds = new Set(currentFriends.map(f => f.playerId));

  return allPlayers
    .filter(p => 
      p.id !== currentPlayerId &&
      !friendIds.has(p.id) &&
      p.name.toLowerCase().includes(query)
    )
    .slice(0, 20) // Limit to 20 results
    .map(p => ({
      id: p.id,
      playerId: p.id,
      playerName: p.name,
      playerLevel: p.level || 1,
      playerPower: p.power || 0,
      status: 'pending_sent' as FriendStatus,
      onlineStatus: 'offline' as OnlineStatus,
      lastOnline: Date.now(),
      addedDate: 0,
      totalGifts: 0,
      canSendGift: false,
      canReceiveGift: false,
    }));
}

// ============= UTILITY FUNCTIONS =============

export function getOnlineStatusColor(status: OnlineStatus): string {
  switch (status) {
    case 'online': return '#10b981'; // green
    case 'away': return '#f59e0b'; // orange
    case 'offline': return '#6b7280'; // gray
  }
}

export function getOnlineStatusText(status: OnlineStatus, lastOnline: number): string {
  if (status === 'online') return 'Đang hoạt động';
  if (status === 'away') return 'Vắng mặt';
  
  const now = Date.now();
  const diff = now - lastOnline;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return 'Hơn 1 tuần trước';
}

export function getGiftIcon(giftType: GiftType): string {
  return GIFT_REWARDS[giftType].icon;
}

export function getGiftName(giftType: GiftType): string {
  return GIFT_REWARDS[giftType].name;
}

export function getTotalPendingGifts(state: FriendSystemState): number {
  return state.pendingGifts.filter(g => !g.claimed).length;
}

export function getReceivedFriendRequests(state: FriendSystemState, currentPlayerId: string): FriendRequest[] {
  return state.friendRequests.filter(r => r.toPlayerId === currentPlayerId && Date.now() < r.expiresAt);
}

export function getSentFriendRequests(state: FriendSystemState, currentPlayerId: string): FriendRequest[] {
  return state.friendRequests.filter(r => r.fromPlayerId === currentPlayerId && Date.now() < r.expiresAt);
}

export function getAcceptedFriends(state: FriendSystemState): Friend[] {
  return state.friends.filter(f => f.status === 'accepted');
}

export function canSendGiftToFriend(friend: Friend): boolean {
  return friend.status === 'accepted' && friend.canSendGift;
}
