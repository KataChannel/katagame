'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  Users,
  MessageCircle,
  Radio,
  Trophy,
  Clock,
  Send,
  UserPlus,
  Shield,
  Zap,
  Eye,
  Play,
  X,
  Check,
  Search,
  Filter,
  Gamepad2,
  Target,
  Heart,
  Flame,
  Crown,
  Star,
  AlertCircle,
  Dna,
} from 'lucide-react';
import WorldBossTab from './WorldBossTab';
import {
  getMultiplayerSystem,
  OnlineUser,
  ChatMessage,
  BattleInvite,
  LiveBattle,
  CoopMission,
  BattleReplay,
} from '@/lib/multiplayerSystem';
import { useGameStore } from '@/lib/gameStore';

type MultiplayerTab = 'online' | 'chat' | 'battles' | 'queue' | 'coop' | 'boss' | 'replays';

export default function MultiplayerTab() {
  const { player } = useGameStore();
  const [activeTab, setActiveTab] = useState<MultiplayerTab>('online');
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'global' | 'guild'>('global');
  const [battleInvites, setBattleInvites] = useState<BattleInvite[]>([]);
  const [activeBattles, setActiveBattles] = useState<LiveBattle[]>([]);
  const [selectedBattle, setSelectedBattle] = useState<LiveBattle | null>(null);
  const [queueType, setQueueType] = useState<'1v1' | '3v3' | '5v5' | 'coop'>('1v1');
  const [inQueue, setInQueue] = useState(false);
  const [queueStats, setQueueStats] = useState({ inQueue: 0, averageWaitTime: 0 });
  const [coopMissions, setCoopMissions] = useState<CoopMission[]>([]);
  const [replays, setReplays] = useState<BattleReplay[]>([]);
  const [selectedReplay, setSelectedReplay] = useState<BattleReplay | null>(null);
  const [multiplayerStats, setMultiplayerStats] = useState({
    onlineUsers: 0,
    activeBattles: 0,
    queuedPlayers: 0,
    totalReplays: 0,
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const multiplayerSystem = getMultiplayerSystem();

  // Update presence on mount
  useEffect(() => {
    if (player) {
      multiplayerSystem.updateUserPresence(
        player.id,
        player.name || 'Player',
        player.level,
        'online'
      );
    }

    // Refresh data every 3 seconds
    const interval = setInterval(() => {
      refreshData();
    }, 3000);

    return () => {
      clearInterval(interval);
      if (player) {
        multiplayerSystem.updateUserPresence(
          player.id,
          player.name || 'Player',
          player.level,
          'offline'
        );
      }
    };
  }, [player]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const refreshData = () => {
    // Online users
    setOnlineUsers(multiplayerSystem.getOnlineUsers());

    // Chat messages
    const messages = multiplayerSystem.getChatHistory(
      selectedChannel === 'guild' ? 'guild' : 'global',
      selectedChannel === 'guild' ? 'guild_1' : undefined // TODO: Use actual guild ID
    );
    setChatMessages(messages);

    // Battle invites
    if (player) {
      setBattleInvites(multiplayerSystem.getPendingInvites(player.id));
    }

    // Active battles
    setActiveBattles(multiplayerSystem.getActiveBattles());

    // Queue stats
    setQueueStats(multiplayerSystem.getQueueStatus(queueType));

    // Co-op missions
    setCoopMissions(multiplayerSystem.getAvailableCoopMissions());

    // Replays
    setReplays(multiplayerSystem.getRecentReplays());

    // Overall stats
    setMultiplayerStats(multiplayerSystem.getMultiplayerStats());
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || !player) return;

    const result = multiplayerSystem.sendChatMessage(
      player.id,
      player.name || 'Player',
      chatInput,
      selectedChannel === 'guild' ? 'guild' : 'global',
      selectedChannel === 'guild' ? 'guild_1' : undefined // TODO: Use actual guild ID
    );

    if (result.success) {
      setChatInput('');
      refreshData();
    }
  };

  const handleSendBattleInvite = (targetUserId: string, targetUsername: string) => {
    if (!player) return;

    const result = multiplayerSystem.sendBattleInvite(
      player.id,
      player.name || 'Player',
      targetUserId,
      targetUsername,
      '1v1'
    );

    if (result.success) {
      alert(`Battle invite sent to ${targetUsername}!`);
    } else {
      alert(result.error);
    }
  };

  const handleRespondToInvite = (inviteId: string, accept: boolean) => {
    const result = multiplayerSystem.respondToInvite(inviteId, accept);

    if (result.success) {
      if (accept && result.battle) {
        setSelectedBattle(result.battle);
        setActiveTab('battles');
      }
      refreshData();
    } else {
      alert(result.error);
    }
  };

  const handleJoinQueue = () => {
    if (!player) return;

    const result = multiplayerSystem.joinQueue(
      player.id,
      player.name || 'Player',
      player.level,
      1000, // TODO: Get actual rating
      queueType
    );

    if (result.success) {
      setInQueue(true);
    } else {
      alert(result.error);
    }
  };

  const handleLeaveQueue = () => {
    if (!player) return;

    multiplayerSystem.leaveQueue(player.id, queueType);
    setInQueue(false);
  };

  const handleSpectate = (battleId: string) => {
    if (!player) return;

    const result = multiplayerSystem.joinAsSpectator(battleId, player.id);
    if (result.success) {
      const battle = multiplayerSystem.getBattle(battleId);
      setSelectedBattle(battle);
      setActiveTab('battles');
    }
  };

  const getStatusColor = (status: OnlineUser['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'in-battle':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: OnlineUser['status']) => {
    switch (status) {
      case 'online':
        return 'Trực tuyến';
      case 'away':
        return 'Vắng mặt';
      case 'in-battle':
        return 'Đang đấu';
      default:
        return 'Ngoại tuyến';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 mb-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radio className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white">Multiplayer</h1>
              <p className="text-purple-100 text-sm">Chơi cùng người chơi khác</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {multiplayerStats.onlineUsers}
              </div>
              <div className="text-purple-100 text-xs">Online</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {multiplayerStats.activeBattles}
              </div>
              <div className="text-purple-100 text-xs">Trận đấu</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {multiplayerStats.queuedPlayers}
              </div>
              <div className="text-purple-100 text-xs">Đang chờ</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Battle Invites */}
      <AnimatePresence>
        {battleInvites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-yellow-500/20 border-2 border-yellow-500 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-yellow-300" />
              <h3 className="font-bold text-white">Lời mời đấu ({battleInvites.length})</h3>
            </div>

            {battleInvites.map(invite => (
              <div key={invite.id} className="bg-black/30 rounded-lg p-3 mb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">{invite.inviterName}</div>
                    <div className="text-gray-300 text-sm">
                      Mời bạn đấu {invite.battleType.toUpperCase()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespondToInvite(invite.id, true)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Chấp nhận
                    </button>
                    <button
                      onClick={() => handleRespondToInvite(invite.id, false)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Từ chối
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { id: 'online', label: 'Online', icon: Users },
          { id: 'chat', label: 'Chat', icon: MessageCircle },
          { id: 'battles', label: 'Trận đấu', icon: Swords },
          { id: 'queue', label: 'Tìm trận', icon: Search },
          { id: 'coop', label: 'Co-op', icon: Shield },
          { id: 'boss', label: 'Boss', icon: Flame },
          { id: 'replays', label: 'Xem lại', icon: Play },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as MultiplayerTab)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg scale-105'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* ONLINE USERS */}
        {activeTab === 'online' && (
          <motion.div
            key="online"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Người chơi trực tuyến ({onlineUsers.length})
              </h2>

              <div className="grid gap-3">
                {onlineUsers.map(user => (
                  <motion.div
                    key={user.userId}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-black/30 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {user.username[0].toUpperCase()}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(user.status)} rounded-full border-2 border-gray-900`} />
                      </div>

                      <div>
                        <div className="text-white font-medium">{user.username}</div>
                        <div className="text-gray-300 text-sm">Level {user.level}</div>
                        <div className="text-gray-400 text-xs">
                          {getStatusText(user.status)}
                          {user.currentActivity && ` • ${user.currentActivity}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSendBattleInvite(user.userId, user.username)}
                        disabled={user.status !== 'online'}
                        className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                      >
                        <Swords className="w-4 h-4" />
                        Thách đấu
                      </button>
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
                        <MessageCircle className="w-4 h-4" />
                        Chat
                      </button>
                    </div>
                  </motion.div>
                ))}

                {onlineUsers.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Không có người chơi nào online</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* CHAT */}
        {activeTab === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
          >
            {/* Channel selector */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setSelectedChannel('global')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  selectedChannel === 'global'
                    ? 'bg-purple-500 text-white'
                    : 'bg-black/30 text-gray-300'
                }`}
              >
                Chat Toàn Cục
              </button>
              <button
                onClick={() => setSelectedChannel('guild')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  selectedChannel === 'guild'
                    ? 'bg-purple-500 text-white'
                    : 'bg-black/30 text-gray-300'
                }`}
              >
                Chat Bang Hội
              </button>
            </div>

            {/* Messages */}
            <div className="bg-black/30 rounded-lg p-4 h-96 overflow-y-auto mb-4">
              {chatMessages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {msg.senderName[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-purple-300 font-medium text-sm">
                          {msg.senderName}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {new Date(msg.timestamp).toLocaleTimeString('vi-VN')}
                        </span>
                      </div>
                      <div className="text-white text-sm">{msg.content}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div ref={chatEndRef} />

              {chatMessages.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Chưa có tin nhắn nào</p>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-black/30 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleSendMessage}
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* BATTLES - Continued in next part */}
        {activeTab === 'battles' && (
          <motion.div
            key="battles"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">
              Trận đấu đang diễn ra ({activeBattles.length})
            </h2>

            <div className="grid gap-3">
              {activeBattles.map(battle => (
                <motion.div
                  key={battle.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-r from-red-900/50 to-blue-900/50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <span className="text-white font-bold">{battle.type.toUpperCase()}</span>
                      <span className="text-gray-300 text-sm">• Turn {battle.currentTurn}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300 text-sm">{battle.spectators.length}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Team 1 */}
                    <div className="flex-1 bg-red-500/20 rounded-lg p-3">
                      <div className="text-red-300 text-xs mb-1">Team 1</div>
                      {battle.team1.players.map(player => (
                        <div key={player.userId} className="text-white text-sm">
                          {player.username}
                        </div>
                      ))}
                    </div>

                    <Swords className="w-6 h-6 text-yellow-400" />

                    {/* Team 2 */}
                    <div className="flex-1 bg-blue-500/20 rounded-lg p-3">
                      <div className="text-blue-300 text-xs mb-1">Team 2</div>
                      {battle.team2.players.map(player => (
                        <div key={player.userId} className="text-white text-sm">
                          {player.username}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSpectate(battle.id)}
                    className="w-full mt-3 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Xem trận đấu
                  </button>
                </motion.div>
              ))}

              {activeBattles.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Swords className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Không có trận đấu nào đang diễn ra</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* QUEUE */}
        {activeTab === 'queue' && (
          <motion.div
            key="queue"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Tìm trận</h2>

            {/* Queue type selector */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {(['1v1', '3v3', '5v5', 'coop'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setQueueType(type)}
                  disabled={inQueue}
                  className={`py-3 rounded-lg font-bold transition-all ${
                    queueType === type
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : 'bg-black/30 text-gray-300 hover:bg-black/50'
                  } disabled:opacity-50`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Queue stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Đang chờ</div>
                <div className="text-white text-2xl font-bold">{queueStats.inQueue}</div>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Thời gian chờ TB</div>
                <div className="text-white text-2xl font-bold">{queueStats.averageWaitTime}s</div>
              </div>
            </div>

            {/* Queue button */}
            {!inQueue ? (
              <button
                onClick={handleJoinQueue}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 shadow-lg"
              >
                <Search className="w-6 h-6" />
                Tìm trận {queueType.toUpperCase()}
              </button>
            ) : (
              <div>
                <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin">
                      <Search className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div>
                      <div className="text-white font-bold">Đang tìm trận...</div>
                      <div className="text-yellow-300 text-sm">
                        Vui lòng đợi trong giây lát
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLeaveQueue}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2"
                >
                  <X className="w-6 h-6" />
                  Hủy tìm trận
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* CO-OP MISSIONS */}
        {activeTab === 'coop' && (
          <motion.div
            key="coop"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">
              Nhiệm vụ Co-op ({coopMissions.length})
            </h2>

            <div className="grid gap-3">
              {coopMissions.map(mission => (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-green-900/50 to-teal-900/50 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-bold text-lg">{mission.name}</h3>
                      <p className="text-gray-300 text-sm">{mission.description}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      mission.difficulty === 'easy' ? 'bg-green-500' :
                      mission.difficulty === 'normal' ? 'bg-blue-500' :
                      mission.difficulty === 'hard' ? 'bg-orange-500' :
                      'bg-red-500'
                    } text-white`}>
                      {mission.difficulty.toUpperCase()}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-3 text-sm">
                    <div className="flex items-center gap-1 text-gray-300">
                      <Users className="w-4 h-4" />
                      {mission.currentPlayers.length}/{mission.maxPlayers}
                    </div>
                    <div className="flex items-center gap-1 text-gray-300">
                      <Target className="w-4 h-4" />
                      {mission.waves} waves
                    </div>
                    <div className="flex items-center gap-1 text-gray-300">
                      <Clock className="w-4 h-4" />
                      {mission.timeLimit}s
                    </div>
                  </div>

                  <div className="bg-black/30 rounded-lg p-3 mb-3">
                    <div className="text-yellow-300 text-xs mb-1">Phần thưởng:</div>
                    <div className="flex gap-3 text-sm">
                      <span className="text-yellow-400">💰 {mission.rewards.gold}</span>
                      <span className="text-blue-400">⭐ {mission.rewards.exp}</span>
                      <span className="text-purple-400">📦 {mission.rewards.items.length} items</span>
                    </div>
                  </div>

                  <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium">
                    Tham gia nhiệm vụ
                  </button>
                </motion.div>
              ))}

              {coopMissions.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Không có nhiệm vụ Co-op nào</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* WORLD BOSS */}
        {activeTab === 'boss' && (
          <motion.div
            key="boss"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <WorldBossTab />
          </motion.div>
        )}

        {/* REPLAYS */}
        {activeTab === 'replays' && (
          <motion.div
            key="replays"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">
              Video xem lại ({replays.length})
            </h2>

            <div className="grid gap-3">
              {replays.map(replay => (
                <motion.div
                  key={replay.battleId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-black/30 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">{replay.battleType.toUpperCase()}</div>
                      <div className="text-gray-300 text-sm">
                        {replay.participants.join(' vs ')}
                      </div>
                      <div className="text-gray-400 text-xs mt-1">
                        Thời lượng: {Math.floor(replay.duration / 1000)}s •{' '}
                        {new Date(replay.timestamp).toLocaleString('vi-VN')}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedReplay(replay)}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Xem
                    </button>
                  </div>
                </motion.div>
              ))}

              {replays.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Chưa có video xem lại nào</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
