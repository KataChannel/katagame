// Real-Time Multiplayer System
// Features: Live PvP, Co-op missions, Real-time chat, Presence system

export interface OnlineUser {
  userId: string;
  username: string;
  level: number;
  avatar?: string;
  status: 'online' | 'away' | 'in-battle' | 'offline';
  lastSeen: number;
  currentActivity?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId?: string; // undefined = guild/global chat
  channelType: 'global' | 'guild' | 'whisper' | 'battle';
  channelId?: string;
  content: string;
  timestamp: number;
  isRead: boolean;
}

export interface BattleInvite {
  id: string;
  inviterId: string;
  inviterName: string;
  inviteeId: string;
  inviteeName: string;
  battleType: '1v1' | '3v3' | '5v5' | 'coop';
  timestamp: number;
  expiresAt: number;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface LiveBattle {
  id: string;
  type: '1v1' | '3v3' | '5v5' | 'coop';
  team1: BattleTeam;
  team2: BattleTeam;
  spectators: string[]; // User IDs watching
  startTime: number;
  currentTurn: number;
  status: 'waiting' | 'in-progress' | 'completed';
  winner?: 'team1' | 'team2';
  battleLog: BattleLogEntry[];
}

export interface BattleTeam {
  players: BattlePlayer[];
  heroes: BattleHero[];
  totalPower: number;
  ready: boolean;
}

export interface BattlePlayer {
  userId: string;
  username: string;
  level: number;
  rating: number;
  isReady: boolean;
}

export interface BattleHero {
  heroId: string;
  name: string;
  level: number;
  currentHp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  skills: BattleSkill[];
  buffs: BattleBuff[];
  debuffs: BattleDebuff[];
  position: number; // 0-4 for 5v5
}

export interface BattleSkill {
  id: string;
  name: string;
  damage?: number;
  healing?: number;
  cooldown: number;
  currentCooldown: number;
  targetType: 'single' | 'all' | 'random' | 'self';
}

export interface BattleBuff {
  id: string;
  name: string;
  type: 'attack' | 'defense' | 'speed' | 'heal-over-time';
  value: number;
  duration: number;
  remainingTurns: number;
}

export interface BattleDebuff {
  id: string;
  name: string;
  type: 'stun' | 'poison' | 'slow' | 'weaken';
  value: number;
  duration: number;
  remainingTurns: number;
}

export interface BattleLogEntry {
  turn: number;
  actorId: string;
  actorName: string;
  action: 'attack' | 'skill' | 'heal' | 'defend' | 'buff' | 'debuff';
  targetId?: string;
  targetName?: string;
  value: number;
  critical?: boolean;
  timestamp: number;
}

export interface CoopMission {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'nightmare';
  minPlayers: number;
  maxPlayers: number;
  currentPlayers: BattlePlayer[];
  waves: number;
  currentWave: number;
  boss?: BattleHero;
  rewards: {
    gold: number;
    exp: number;
    items: { itemId: string; quantity: number }[];
  };
  timeLimit: number; // seconds
  startTime?: number;
  status: 'forming' | 'in-progress' | 'completed' | 'failed';
}

export interface MatchmakingQueue {
  queueType: '1v1' | '3v3' | '5v5' | 'coop';
  players: {
    userId: string;
    username: string;
    level: number;
    rating: number;
    queueTime: number;
  }[];
}

export interface BattleReplay {
  battleId: string;
  battleType: string;
  participants: string[];
  duration: number;
  winner: string;
  battleLog: BattleLogEntry[];
  timestamp: number;
}

// Real-time multiplayer manager class
class MultiplayerSystem {
  private onlineUsers: Map<string, OnlineUser> = new Map();
  private chatHistory: Map<string, ChatMessage[]> = new Map(); // channelId -> messages
  private activeBattles: Map<string, LiveBattle> = new Map();
  private battleInvites: Map<string, BattleInvite> = new Map();
  private matchmakingQueues: Map<string, MatchmakingQueue> = new Map();
  private coopMissions: Map<string, CoopMission> = new Map();
  private battleReplays: BattleReplay[] = [];
  private presenceTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeQueues();
    this.startMatchmakingLoop();
    this.startPresenceCleanup();
  }

  // ==================== PRESENCE SYSTEM ====================

  updateUserPresence(
    userId: string,
    username: string,
    level: number,
    status: OnlineUser['status'],
    activity?: string
  ): void {
    const user: OnlineUser = {
      userId,
      username,
      level,
      status,
      lastSeen: Date.now(),
      currentActivity: activity,
    };

    this.onlineUsers.set(userId, user);

    // Clear existing timer
    const existingTimer = this.presenceTimers.get(userId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Auto-set to offline after 5 minutes of inactivity
    if (status === 'online') {
      const timer = setTimeout(() => {
        const currentUser = this.onlineUsers.get(userId);
        if (currentUser && Date.now() - currentUser.lastSeen > 300000) {
          this.updateUserPresence(userId, username, level, 'offline');
        }
      }, 300000); // 5 minutes

      this.presenceTimers.set(userId, timer);
    }
  }

  getUserPresence(userId: string): OnlineUser | null {
    return this.onlineUsers.get(userId) || null;
  }

  getOnlineUsers(limit: number = 100): OnlineUser[] {
    return Array.from(this.onlineUsers.values())
      .filter(u => u.status !== 'offline')
      .slice(0, limit);
  }

  getOnlineCount(): number {
    return Array.from(this.onlineUsers.values()).filter(
      u => u.status !== 'offline'
    ).length;
  }

  private startPresenceCleanup(): void {
    // Clean up offline users every 10 minutes
    setInterval(() => {
      const now = Date.now();
      for (const [userId, user] of this.onlineUsers.entries()) {
        // Remove users offline for more than 1 hour
        if (user.status === 'offline' && now - user.lastSeen > 3600000) {
          this.onlineUsers.delete(userId);
          const timer = this.presenceTimers.get(userId);
          if (timer) {
            clearTimeout(timer);
            this.presenceTimers.delete(userId);
          }
        }
      }
    }, 600000); // 10 minutes
  }

  // ==================== CHAT SYSTEM ====================

  sendChatMessage(
    senderId: string,
    senderName: string,
    content: string,
    channelType: ChatMessage['channelType'],
    channelId?: string,
    recipientId?: string
  ): { success: boolean; message?: ChatMessage; error?: string } {
    // Validate message
    if (!content || content.trim().length === 0) {
      return { success: false, error: 'Message cannot be empty' };
    }

    if (content.length > 500) {
      return { success: false, error: 'Message too long (max 500 characters)' };
    }

    // Create message
    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId,
      senderName,
      recipientId,
      channelType,
      channelId,
      content: content.trim(),
      timestamp: Date.now(),
      isRead: false,
    };

    // Store message
    const key = channelId || `${channelType}_${recipientId || 'global'}`;
    const messages = this.chatHistory.get(key) || [];
    messages.push(message);

    // Keep last 200 messages per channel
    if (messages.length > 200) {
      messages.shift();
    }

    this.chatHistory.set(key, messages);

    return { success: true, message };
  }

  getChatHistory(
    channelType: ChatMessage['channelType'],
    channelId?: string,
    recipientId?: string,
    limit: number = 50
  ): ChatMessage[] {
    const key = channelId || `${channelType}_${recipientId || 'global'}`;
    const messages = this.chatHistory.get(key) || [];
    return messages.slice(-limit);
  }

  markMessagesAsRead(
    channelType: ChatMessage['channelType'],
    userId: string,
    channelId?: string
  ): void {
    const key = channelId || `${channelType}_${userId}`;
    const messages = this.chatHistory.get(key) || [];

    messages.forEach(msg => {
      if (msg.recipientId === userId && !msg.isRead) {
        msg.isRead = true;
      }
    });
  }

  getUnreadCount(userId: string): number {
    let count = 0;

    for (const messages of this.chatHistory.values()) {
      count += messages.filter(
        msg => msg.recipientId === userId && !msg.isRead
      ).length;
    }

    return count;
  }

  // ==================== BATTLE INVITES ====================

  sendBattleInvite(
    inviterId: string,
    inviterName: string,
    inviteeId: string,
    inviteeName: string,
    battleType: BattleInvite['battleType']
  ): { success: boolean; invite?: BattleInvite; error?: string } {
    // Check if invitee is online
    const invitee = this.onlineUsers.get(inviteeId);
    if (!invitee || invitee.status === 'offline') {
      return { success: false, error: 'User is offline' };
    }

    if (invitee.status === 'in-battle') {
      return { success: false, error: 'User is already in a battle' };
    }

    // Check for existing pending invite
    for (const invite of this.battleInvites.values()) {
      if (
        invite.inviterId === inviterId &&
        invite.inviteeId === inviteeId &&
        invite.status === 'pending'
      ) {
        return { success: false, error: 'Invite already sent' };
      }
    }

    const invite: BattleInvite = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      inviterId,
      inviterName,
      inviteeId,
      inviteeName,
      battleType,
      timestamp: Date.now(),
      expiresAt: Date.now() + 60000, // 1 minute
      status: 'pending',
    };

    this.battleInvites.set(invite.id, invite);

    // Auto-expire after 1 minute
    setTimeout(() => {
      const currentInvite = this.battleInvites.get(invite.id);
      if (currentInvite && currentInvite.status === 'pending') {
        currentInvite.status = 'expired';
      }
    }, 60000);

    return { success: true, invite };
  }

  respondToInvite(
    inviteId: string,
    accept: boolean
  ): { success: boolean; battle?: LiveBattle; error?: string } {
    const invite = this.battleInvites.get(inviteId);

    if (!invite) {
      return { success: false, error: 'Invite not found' };
    }

    if (invite.status !== 'pending') {
      return { success: false, error: 'Invite is no longer valid' };
    }

    if (Date.now() > invite.expiresAt) {
      invite.status = 'expired';
      return { success: false, error: 'Invite has expired' };
    }

    if (accept) {
      invite.status = 'accepted';

      // Create battle
      const battle = this.createBattle(
        [invite.inviterId, invite.inviteeId],
        invite.battleType
      );

      if (!battle.success) {
        return { success: false, error: battle.error };
      }

      return { success: true, battle: battle.battle };
    } else {
      invite.status = 'declined';
      return { success: true };
    }
  }

  getPendingInvites(userId: string): BattleInvite[] {
    return Array.from(this.battleInvites.values()).filter(
      invite =>
        invite.inviteeId === userId &&
        invite.status === 'pending' &&
        Date.now() < invite.expiresAt
    );
  }

  // ==================== MATCHMAKING ====================

  private initializeQueues(): void {
    this.matchmakingQueues.set('1v1', { queueType: '1v1', players: [] });
    this.matchmakingQueues.set('3v3', { queueType: '3v3', players: [] });
    this.matchmakingQueues.set('5v5', { queueType: '5v5', players: [] });
    this.matchmakingQueues.set('coop', { queueType: 'coop', players: [] });
  }

  joinQueue(
    userId: string,
    username: string,
    level: number,
    rating: number,
    queueType: '1v1' | '3v3' | '5v5' | 'coop'
  ): { success: boolean; queuePosition?: number; error?: string } {
    const queue = this.matchmakingQueues.get(queueType);
    if (!queue) {
      return { success: false, error: 'Invalid queue type' };
    }

    // Check if already in queue
    if (queue.players.some(p => p.userId === userId)) {
      return { success: false, error: 'Already in queue' };
    }

    // Check if in battle
    const user = this.onlineUsers.get(userId);
    if (user && user.status === 'in-battle') {
      return { success: false, error: 'Cannot join queue while in battle' };
    }

    queue.players.push({
      userId,
      username,
      level,
      rating,
      queueTime: Date.now(),
    });

    this.updateUserPresence(userId, username, level, 'online', `In ${queueType} queue`);

    return { success: true, queuePosition: queue.players.length };
  }

  leaveQueue(userId: string, queueType: string): { success: boolean } {
    const queue = this.matchmakingQueues.get(queueType);
    if (!queue) {
      return { success: false };
    }

    const index = queue.players.findIndex(p => p.userId === userId);
    if (index !== -1) {
      queue.players.splice(index, 1);
    }

    return { success: true };
  }

  getQueueStatus(queueType: string): { inQueue: number; averageWaitTime: number } {
    const queue = this.matchmakingQueues.get(queueType);
    if (!queue) {
      return { inQueue: 0, averageWaitTime: 0 };
    }

    const now = Date.now();
    const waitTimes = queue.players.map(p => now - p.queueTime);
    const avgWait = waitTimes.length > 0
      ? waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length
      : 0;

    return {
      inQueue: queue.players.length,
      averageWaitTime: Math.round(avgWait / 1000), // seconds
    };
  }

  private startMatchmakingLoop(): void {
    // Try to create matches every 5 seconds
    setInterval(() => {
      this.tryMatchmaking();
    }, 5000);
  }

  private tryMatchmaking(): void {
    // 1v1 matchmaking
    this.tryMatch1v1();

    // 3v3 matchmaking
    this.tryMatchTeam('3v3', 3);

    // 5v5 matchmaking
    this.tryMatchTeam('5v5', 5);

    // Co-op matchmaking
    this.tryMatchCoop();
  }

  private tryMatch1v1(): void {
    const queue = this.matchmakingQueues.get('1v1');
    if (!queue || queue.players.length < 2) return;

    // Sort by rating for fair matches
    queue.players.sort((a, b) => a.rating - b.rating);

    while (queue.players.length >= 2) {
      const player1 = queue.players.shift()!;
      const player2 = queue.players.shift()!;

      // Check rating difference (max 500 rating gap)
      if (Math.abs(player1.rating - player2.rating) <= 500) {
        this.createBattle([player1.userId, player2.userId], '1v1');
      } else {
        // Put back in queue if rating gap too large
        queue.players.unshift(player2, player1);
        break;
      }
    }
  }

  private tryMatchTeam(queueType: '3v3' | '5v5', teamSize: number): void {
    const queue = this.matchmakingQueues.get(queueType);
    if (!queue || queue.players.length < teamSize * 2) return;

    // Sort by rating
    queue.players.sort((a, b) => a.rating - b.rating);

    while (queue.players.length >= teamSize * 2) {
      const team1Players = queue.players.splice(0, teamSize);
      const team2Players = queue.players.splice(0, teamSize);

      const team1AvgRating =
        team1Players.reduce((sum, p) => sum + p.rating, 0) / teamSize;
      const team2AvgRating =
        team2Players.reduce((sum, p) => sum + p.rating, 0) / teamSize;

      // Check team rating balance
      if (Math.abs(team1AvgRating - team2AvgRating) <= 300) {
        const allPlayers = [
          ...team1Players.map(p => p.userId),
          ...team2Players.map(p => p.userId),
        ];
        this.createBattle(allPlayers, queueType);
      } else {
        // Put back in queue
        queue.players.unshift(...team2Players, ...team1Players);
        break;
      }
    }
  }

  private tryMatchCoop(): void {
    const queue = this.matchmakingQueues.get('coop');
    if (!queue || queue.players.length < 2) return;

    // Find or create co-op mission
    let mission = Array.from(this.coopMissions.values()).find(
      m => m.status === 'forming' && m.currentPlayers.length < m.maxPlayers
    );

    if (!mission) {
      // Create new mission
      mission = this.createCoopMission();
    }

    // Add players to mission
    while (
      queue.players.length > 0 &&
      mission.currentPlayers.length < mission.maxPlayers
    ) {
      const player = queue.players.shift()!;
      mission.currentPlayers.push({
        userId: player.userId,
        username: player.username,
        level: player.level,
        rating: player.rating,
        isReady: false,
      });
    }

    // Start mission if enough players
    if (mission.currentPlayers.length >= mission.minPlayers) {
      this.startCoopMission(mission.id);
    }
  }

  // ==================== BATTLE SYSTEM ====================

  private createBattle(
    playerIds: string[],
    battleType: '1v1' | '3v3' | '5v5' | 'coop'
  ): { success: boolean; battle?: LiveBattle; error?: string } {
    const battleId = `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Determine team size
    const teamSize = battleType === '1v1' ? 1 : battleType === '3v3' ? 3 : 5;

    // Split players into teams
    const team1PlayerIds = playerIds.slice(0, teamSize);
    const team2PlayerIds = playerIds.slice(teamSize, teamSize * 2);

    // Create teams with mock heroes (in real game, fetch from player data)
    const team1: BattleTeam = {
      players: team1PlayerIds.map(id => {
        const user = this.onlineUsers.get(id);
        return {
          userId: id,
          username: user?.username || 'Unknown',
          level: user?.level || 1,
          rating: 1000,
          isReady: false,
        };
      }),
      heroes: [],
      totalPower: 0,
      ready: false,
    };

    const team2: BattleTeam = {
      players: team2PlayerIds.map(id => {
        const user = this.onlineUsers.get(id);
        return {
          userId: id,
          username: user?.username || 'Unknown',
          level: user?.level || 1,
          rating: 1000,
          isReady: false,
        };
      }),
      heroes: [],
      totalPower: 0,
      ready: false,
    };

    const battle: LiveBattle = {
      id: battleId,
      type: battleType,
      team1,
      team2,
      spectators: [],
      startTime: Date.now(),
      currentTurn: 0,
      status: 'waiting',
      battleLog: [],
    };

    this.activeBattles.set(battleId, battle);

    // Update player statuses
    [...team1PlayerIds, ...team2PlayerIds].forEach(id => {
      const user = this.onlineUsers.get(id);
      if (user) {
        this.updateUserPresence(id, user.username, user.level, 'in-battle', `Battle ${battleId}`);
      }
    });

    return { success: true, battle };
  }

  getBattle(battleId: string): LiveBattle | null {
    return this.activeBattles.get(battleId) || null;
  }

  getActiveBattles(limit: number = 20): LiveBattle[] {
    return Array.from(this.activeBattles.values())
      .filter(b => b.status !== 'completed')
      .slice(0, limit);
  }

  joinAsSpectator(battleId: string, userId: string): { success: boolean; error?: string } {
    const battle = this.activeBattles.get(battleId);
    if (!battle) {
      return { success: false, error: 'Battle not found' };
    }

    if (battle.spectators.includes(userId)) {
      return { success: false, error: 'Already spectating' };
    }

    battle.spectators.push(userId);
    return { success: true };
  }

  leaveSpectator(battleId: string, userId: string): void {
    const battle = this.activeBattles.get(battleId);
    if (battle) {
      battle.spectators = battle.spectators.filter(id => id !== userId);
    }
  }

  // ==================== CO-OP MISSIONS ====================

  private createCoopMission(): CoopMission {
    const missionId = `coop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const mission: CoopMission = {
      id: missionId,
      name: 'Defend the Village',
      description: 'Waves of enemies are attacking! Defend the village!',
      difficulty: 'normal',
      minPlayers: 2,
      maxPlayers: 5,
      currentPlayers: [],
      waves: 5,
      currentWave: 0,
      rewards: {
        gold: 10000,
        exp: 5000,
        items: [{ itemId: 'chest_silver', quantity: 1 }],
      },
      timeLimit: 300, // 5 minutes
      status: 'forming',
    };

    this.coopMissions.set(missionId, mission);
    return mission;
  }

  getCoopMission(missionId: string): CoopMission | null {
    return this.coopMissions.get(missionId) || null;
  }

  getAvailableCoopMissions(): CoopMission[] {
    return Array.from(this.coopMissions.values()).filter(
      m => m.status === 'forming' && m.currentPlayers.length < m.maxPlayers
    );
  }

  private startCoopMission(missionId: string): void {
    const mission = this.coopMissions.get(missionId);
    if (!mission) return;

    mission.status = 'in-progress';
    mission.startTime = Date.now();
    mission.currentWave = 1;

    // Update player statuses
    mission.currentPlayers.forEach(player => {
      const user = this.onlineUsers.get(player.userId);
      if (user) {
        this.updateUserPresence(
          player.userId,
          player.username,
          player.level,
          'in-battle',
          `Co-op: ${mission.name}`
        );
      }
    });
  }

  // ==================== BATTLE REPLAYS ====================

  saveBattleReplay(battle: LiveBattle): void {
    const replay: BattleReplay = {
      battleId: battle.id,
      battleType: battle.type,
      participants: [
        ...battle.team1.players.map(p => p.username),
        ...battle.team2.players.map(p => p.username),
      ],
      duration: Date.now() - battle.startTime,
      winner: battle.winner || 'draw',
      battleLog: battle.battleLog,
      timestamp: Date.now(),
    };

    this.battleReplays.unshift(replay);

    // Keep last 100 replays
    if (this.battleReplays.length > 100) {
      this.battleReplays.pop();
    }
  }

  getBattleReplay(battleId: string): BattleReplay | null {
    return this.battleReplays.find(r => r.battleId === battleId) || null;
  }

  getRecentReplays(limit: number = 20): BattleReplay[] {
    return this.battleReplays.slice(0, limit);
  }

  // ==================== STATISTICS ====================

  getMultiplayerStats(): {
    onlineUsers: number;
    activeBattles: number;
    queuedPlayers: number;
    totalReplays: number;
  } {
    let queuedPlayers = 0;
    for (const queue of this.matchmakingQueues.values()) {
      queuedPlayers += queue.players.length;
    }

    return {
      onlineUsers: this.getOnlineCount(),
      activeBattles: Array.from(this.activeBattles.values()).filter(
        b => b.status !== 'completed'
      ).length,
      queuedPlayers,
      totalReplays: this.battleReplays.length,
    };
  }
}

// Singleton instance
let multiplayerSystemInstance: MultiplayerSystem | null = null;

export const getMultiplayerSystem = (): MultiplayerSystem => {
  if (!multiplayerSystemInstance) {
    multiplayerSystemInstance = new MultiplayerSystem();
  }
  return multiplayerSystemInstance;
};

export default MultiplayerSystem;
