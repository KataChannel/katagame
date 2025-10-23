'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, MessageCircle, Gift, TrendingUp, Search,
  Check, X, Send, Clock, Heart, Star, Award, MapPin,
  ChevronRight, Circle, MessageSquare, UserCheck, UserMinus,
  Mail, Package, Sparkles
} from 'lucide-react';
import { useGameStore } from '@/lib/gameStore';
import {
  getOnlineStatusColor,
  getOnlineStatusText,
  getGiftIcon,
  getGiftName,
  getTotalPendingGifts,
  getReceivedFriendRequests,
  getSentFriendRequests,
  getAcceptedFriends,
  canSendGiftToFriend,
  type Friend,
  type FriendRequest,
  type ChatMessage,
  type DailyGift,
  type GiftType,
} from '@/lib/friendSystem';

type SubTab = 'friends' | 'requests' | 'chat' | 'gifts' | 'leaderboard';

export default function FriendsTab() {
  const {
    player,
    friendSystemState,
    initializeFriendSystem,
    sendFriendRequestAction,
    acceptFriendRequestAction,
    declineFriendRequestAction,
    removeFriendAction,
    sendChatMessageAction,
    sendGiftAction,
    claimGiftAction,
    claimAllGiftsAction,
  } = useGameStore();

  const [activeSubTab, setActiveSubTab] = useState<SubTab>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [selectedGiftType, setSelectedGiftType] = useState<GiftType>('gold');
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  // Initialize friend system
  useEffect(() => {
    if (!friendSystemState) {
      initializeFriendSystem();
    }
  }, [friendSystemState, initializeFriendSystem]);

  if (!friendSystemState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-pink-900">
        <div className="text-center">
          <Users className="w-16 h-16 mx-auto text-white animate-pulse" />
          <p className="mt-4 text-xl text-white">Đang Tải Bạn Bè...</p>
        </div>
      </div>
    );
  }

  const acceptedFriends = getAcceptedFriends(friendSystemState);
  const receivedRequests = getReceivedFriendRequests(friendSystemState, player.id);
  const sentRequests = getSentFriendRequests(friendSystemState, player.id);
  const totalUnreadMessages = friendSystemState.conversations.reduce((sum: number, c: any) => sum + c.unreadCount, 0);
  const totalPendingGifts = getTotalPendingGifts(friendSystemState);

  const handleSendRequest = (toPlayerId: string) => {
    sendFriendRequestAction(toPlayerId, 'Hãy kết bạn với tôi!');
  };

  const handleAcceptRequest = (requestId: string) => {
    acceptFriendRequestAction(requestId);
  };

  const handleDeclineRequest = (requestId: string) => {
    declineFriendRequestAction(requestId);
  };

  const handleRemoveFriend = () => {
    if (selectedFriend) {
      removeFriendAction(selectedFriend.id);
      setSelectedFriend(null);
      setShowRemoveModal(false);
    }
  };

  const handleSendMessage = () => {
    if (selectedFriend && chatMessage.trim()) {
      sendChatMessageAction(selectedFriend.playerId, chatMessage);
      setChatMessage('');
    }
  };

  const handleSendGift = () => {
    if (selectedFriend) {
      sendGiftAction(selectedFriend.id, selectedGiftType, 'Quà tặng từ bạn bè!');
      setShowGiftModal(false);
    }
  };

  const handleClaimGift = (giftId: string) => {
    claimGiftAction(giftId);
  };

  const handleClaimAllGifts = () => {
    claimAllGiftsAction();
  };

  const subNavItems = [
    { key: 'friends' as SubTab, label: 'Bạn Bè', icon: Users, count: acceptedFriends.length },
    { key: 'requests' as SubTab, label: 'Lời Mời', icon: UserPlus, count: receivedRequests.length },
    { key: 'chat' as SubTab, label: 'Trò Chuyện', icon: MessageCircle, count: totalUnreadMessages },
    { key: 'gifts' as SubTab, label: 'Quà Tặng', icon: Gift, count: totalPendingGifts },
    { key: 'leaderboard' as SubTab, label: 'Bảng Xếp Hạng', icon: TrendingUp, count: 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-800 to-pink-900 pb-24">
      {/* Remove Friend Modal */}
      <AnimatePresence>
        {showRemoveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-gray-900 rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Xóa Bạn Bè?</h3>
                <p className="text-gray-300 mb-6">
                  Bạn có chắc chắn muốn xóa <span className="font-bold text-white">{selectedFriend?.playerName}</span> khỏi danh sách bạn bè?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowRemoveModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleRemoveFriend}
                    className="flex-1 px-4 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-all"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Gift Modal */}
      <AnimatePresence>
        {showGiftModal && selectedFriend && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-gray-900 rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 bg-gradient-to-r from-pink-600 to-purple-600">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Gift className="w-6 h-6" />
                  Tặng Quà Cho {selectedFriend.playerName}
                </h3>
              </div>

              <div className="p-6">
                <p className="text-gray-300 mb-4">Chọn loại quà tặng:</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {(['gold', 'gems', 'stamina', 'hero_fragment', 'pet_egg'] as GiftType[]).map((giftType) => (
                    <button
                      key={giftType}
                      onClick={() => setSelectedGiftType(giftType)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedGiftType === giftType
                          ? 'border-pink-500 bg-pink-900/50'
                          : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <div className="text-4xl mb-2">{getGiftIcon(giftType)}</div>
                      <p className="text-white font-medium text-sm">{getGiftName(giftType)}</p>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowGiftModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSendGift}
                    disabled={!canSendGiftToFriend(selectedFriend)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tặng Quà
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Bạn Bè & Xã Hội</h2>
              <p className="text-purple-100 text-sm">{acceptedFriends.length}/50 bạn bè</p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
            <Users className="w-4 h-4 mx-auto mb-1 text-blue-300" />
            <p className="text-lg font-bold text-white">{acceptedFriends.length}</p>
            <p className="text-xs text-gray-200">Bạn Bè</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
            <MessageCircle className="w-4 h-4 mx-auto mb-1 text-green-300" />
            <p className="text-lg font-bold text-white">{totalUnreadMessages}</p>
            <p className="text-xs text-gray-200">Tin Nhắn</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
            <Gift className="w-4 h-4 mx-auto mb-1 text-pink-300" />
            <p className="text-lg font-bold text-white">{totalPendingGifts}</p>
            <p className="text-xs text-gray-200">Quà Tặng</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
            <UserPlus className="w-4 h-4 mx-auto mb-1 text-yellow-300" />
            <p className="text-lg font-bold text-white">{receivedRequests.length}</p>
            <p className="text-xs text-gray-200">Lời Mời</p>
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex overflow-x-auto bg-gray-800/50 backdrop-blur-sm px-4 py-3 gap-2">
        {subNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSubTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveSubTab(item.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all relative ${
                isActive
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
              {item.count > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeSubTab === 'friends' && (
          <FriendsListSubTab
            friends={acceptedFriends}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectFriend={setSelectedFriend}
            onSendGift={(friend: Friend) => {
              setSelectedFriend(friend);
              setShowGiftModal(true);
            }}
            onRemoveFriend={(friend: Friend) => {
              setSelectedFriend(friend);
              setShowRemoveModal(true);
            }}
            onSendRequest={handleSendRequest}
          />
        )}

        {activeSubTab === 'requests' && (
          <RequestsSubTab
            receivedRequests={receivedRequests}
            sentRequests={sentRequests}
            onAccept={handleAcceptRequest}
            onDecline={handleDeclineRequest}
          />
        )}

        {activeSubTab === 'chat' && (
          <ChatSubTab
            conversations={friendSystemState.conversations}
            selectedFriend={selectedFriend}
            onSelectFriend={setSelectedFriend}
            message={chatMessage}
            setMessage={setChatMessage}
            onSendMessage={handleSendMessage}
            currentPlayerId={player.id}
          />
        )}

        {activeSubTab === 'gifts' && (
          <GiftsSubTab
            pendingGifts={friendSystemState.pendingGifts}
            sentGifts={friendSystemState.sentGifts}
            onClaimGift={handleClaimGift}
            onClaimAll={handleClaimAllGifts}
          />
        )}

        {activeSubTab === 'leaderboard' && (
          <LeaderboardSubTab
            leaderboard={friendSystemState.leaderboard}
            currentPlayer={player}
          />
        )}
      </div>
    </div>
  );
}

// ============= SUB COMPONENTS =============

function FriendsListSubTab({
  friends,
  searchQuery,
  setSearchQuery,
  onSelectFriend,
  onSendGift,
  onRemoveFriend,
  onSendRequest,
}: any) {
  const filteredFriends = friends.filter((f: Friend) =>
    f.playerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bạn bè..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Friends List */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-400" />
          Danh Sách Bạn Bè ({filteredFriends.length})
        </h3>

        {filteredFriends.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">Chưa có bạn bè nào</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFriends.map((friend: Friend) => (
              <motion.div
                key={friend.id}
                className="p-4 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-all"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {friend.playerName[0].toUpperCase()}
                      </div>
                      <div
                        className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-700"
                        style={{ backgroundColor: getOnlineStatusColor(friend.onlineStatus) }}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-bold">{friend.playerName}</h4>
                      <p className="text-sm text-gray-300">
                        Level {friend.playerLevel} • {friend.playerPower.toLocaleString()} Power
                      </p>
                      <p className="text-xs text-gray-400">
                        {getOnlineStatusText(friend.onlineStatus, friend.lastOnline)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onSendGift(friend)}
                      disabled={!canSendGiftToFriend(friend)}
                      className="p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Tặng quà"
                    >
                      <Gift className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onSelectFriend(friend)}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                      title="Nhắn tin"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onRemoveFriend(friend)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                      title="Xóa bạn"
                    >
                      <UserMinus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RequestsSubTab({ receivedRequests, sentRequests, onAccept, onDecline }: any) {
  return (
    <div className="space-y-3">
      {/* Received Requests */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Mail className="w-6 h-6 text-green-400" />
          Lời Mời Nhận ({receivedRequests.length})
        </h3>

        {receivedRequests.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="w-12 h-12 mx-auto text-gray-600 mb-2" />
            <p className="text-gray-400">Chưa có lời mời nào</p>
          </div>
        ) : (
          <div className="space-y-2">
            {receivedRequests.map((request: FriendRequest) => (
              <div key={request.id} className="p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-bold">{request.fromPlayerName}</h4>
                    <p className="text-sm text-gray-300">
                      Level {request.fromPlayerLevel} • {request.fromPlayerPower.toLocaleString()} Power
                    </p>
                    {request.message && (
                      <p className="text-sm text-gray-400 mt-1">"{request.message}"</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onAccept(request.id)}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDecline(request.id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sent Requests */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Send className="w-6 h-6 text-blue-400" />
          Lời Mời Đã Gửi ({sentRequests.length})
        </h3>

        {sentRequests.length === 0 ? (
          <div className="text-center py-8">
            <Send className="w-12 h-12 mx-auto text-gray-600 mb-2" />
            <p className="text-gray-400">Chưa gửi lời mời nào</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sentRequests.map((request: FriendRequest) => (
              <div key={request.id} className="p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-bold">{request.fromPlayerName}</h4>
                    <p className="text-sm text-gray-400">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Đang chờ phản hồi...
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatSubTab({ conversations, selectedFriend, onSelectFriend, message, setMessage, onSendMessage, currentPlayerId }: any) {
  if (!selectedFriend) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">Chọn bạn bè để trò chuyện</p>
        </div>
      </div>
    );
  }

  const conversation = conversations.find((c: any) => c.friendId === selectedFriend.playerId);
  const messages = conversation?.messages || [];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="flex items-center gap-3">
          <button onClick={() => onSelectFriend(null)} className="p-2 hover:bg-white/10 rounded-lg">
            <ChevronRight className="w-5 h-5 text-white rotate-180" />
          </button>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
            {selectedFriend.playerName[0].toUpperCase()}
          </div>
          <div>
            <h4 className="text-white font-bold">{selectedFriend.playerName}</h4>
            <p className="text-xs text-gray-200">
              {getOnlineStatusText(selectedFriend.onlineStatus, selectedFriend.lastOnline)}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 h-96 overflow-y-auto space-y-2">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-600 mb-2" />
            <p className="text-gray-400">Chưa có tin nhắn nào</p>
          </div>
        ) : (
          messages.map((msg: ChatMessage) => {
            const isOwn = msg.fromPlayerId === currentPlayerId;
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    isOwn ? 'bg-purple-500 text-white' : 'bg-gray-700 text-white'
                  }`}
                >
                  <p>{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-gray-900/50 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
            className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            maxLength={200}
          />
          <button
            onClick={onSendMessage}
            disabled={!message.trim()}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function GiftsSubTab({ pendingGifts, sentGifts, onClaimGift, onClaimAll }: any) {
  return (
    <div className="space-y-3">
      {/* Pending Gifts */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-pink-400" />
            Quà Nhận ({pendingGifts.filter((g: DailyGift) => !g.claimed).length})
          </h3>
          {pendingGifts.length > 0 && (
            <button
              onClick={onClaimAll}
              className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              Nhận Tất Cả
            </button>
          )}
        </div>

        {pendingGifts.filter((g: DailyGift) => !g.claimed).length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 mx-auto text-gray-600 mb-2" />
            <p className="text-gray-400">Chưa có quà nào</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingGifts.filter((g: DailyGift) => !g.claimed).map((gift: DailyGift) => (
              <div key={gift.id} className="p-4 bg-gradient-to-r from-pink-900/50 to-purple-900/50 rounded-lg border border-pink-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{getGiftIcon(gift.giftType)}</div>
                    <div>
                      <h4 className="text-white font-bold">Từ: {gift.fromPlayerName}</h4>
                      <p className="text-sm text-gray-300">
                        {getGiftName(gift.giftType)} ×{gift.quantity}
                      </p>
                      {gift.message && (
                        <p className="text-xs text-gray-400 mt-1">"{gift.message}"</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onClaimGift(gift.id)}
                    className="px-4 py-2 bg-pink-500 text-white font-bold rounded-lg hover:bg-pink-600 transition-all"
                  >
                    Nhận
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sent Gifts */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Send className="w-6 h-6 text-blue-400" />
          Quà Đã Gửi ({sentGifts.length})
        </h3>

        {sentGifts.length === 0 ? (
          <div className="text-center py-8">
            <Send className="w-12 h-12 mx-auto text-gray-600 mb-2" />
            <p className="text-gray-400">Chưa gửi quà nào hôm nay</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sentGifts.map((gift: DailyGift) => (
              <div key={gift.id} className="p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getGiftIcon(gift.giftType)}</div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Đến: {gift.fromPlayerName}</p>
                    <p className="text-sm text-gray-400">
                      {getGiftName(gift.giftType)} ×{gift.quantity}
                    </p>
                  </div>
                  <Check className="w-5 h-5 text-green-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LeaderboardSubTab({ leaderboard, currentPlayer }: any) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-yellow-400" />
        Bảng Xếp Hạng Bạn Bè
      </h3>

      {leaderboard.length === 0 ? (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">Chưa có dữ liệu xếp hạng</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry: any, index: number) => (
            <motion.div
              key={entry.playerId}
              className={`p-4 rounded-lg ${
                index < 3
                  ? 'bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border border-yellow-500/30'
                  : 'bg-gray-700/50'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold" style={{ minWidth: '40px' }}>
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && <span className="text-gray-400">#{index + 1}</span>}
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-bold">{entry.playerName}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <span>Lv.{entry.playerLevel}</span>
                    <span>⚔️ {entry.playerPower.toLocaleString()}</span>
                    {entry.guildName && <span>🛡️ {entry.guildName}</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
