'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';
import { Resource } from '@/lib/types';
import {
  Guild,
  GuildMember,
  GuildBuff,
  GuildChatMessage,
  GUILD_CREATE_COST,
  GUILD_MAX_MEMBERS,
  validateGuildName,
  validateGuildTag,
  formatMemberCount,
  getRoleColor,
  getRoleNameVi,
  canManageGuild,
  isGuildLeader,
  getBuffTooltip,
  getTopContributors,
} from '@/lib/guildSystem';
import {
  Users,
  Crown,
  Shield,
  Settings,
  MessageSquare,
  Trophy,
  Gift,
  Zap,
  TrendingUp,
  UserPlus,
  LogOut,
  X,
  Send,
  Star,
  Award,
  Swords,
  ChevronRight,
  Info,
  Edit,
  Check,
  AlertCircle,
} from 'lucide-react';

export default function GuildTab() {
  const {
    player,
    guildState,
    initializeGuild,
    createNewGuild,
    leaveGuild,
    donateToGuild,
    upgradeGuildBuff,
    purchaseFromGuildShop,
    claimGuildQuest,
    startGuildWar,
  } = useGameStore();
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'members' | 'chat' | 'buffs' | 'shop' | 'quests' | 'wars'>('info');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);

  // Initialize guild state if not exists
  useEffect(() => {
    if (!guildState) {
      initializeGuild();
    }
  }, [guildState, initializeGuild]);

  if (!guildState) {
    return (
      <div className="min-h-screen pb-24 md:pb-6 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Đang Tải Bộ Lạc...</h2>
          <p className="text-gray-600">Đang khởi tạo hệ thống bộ lạc...</p>
        </div>
      </div>
    );
  }

  // No guild - show join/create screen
  if (!guildState.currentGuild) {
    return (
      <div className="min-h-screen pb-24 md:pb-6">
        <NoGuildScreen onCreateClick={() => setShowCreateModal(true)} />
        
        <AnimatePresence>
          {showCreateModal && (
            <CreateGuildModal onClose={() => setShowCreateModal(false)} />
          )}
        </AnimatePresence>
      </div>
    );
  }

  const guild = guildState.currentGuild;
  const myRole = guildState.myRole;

  return (
    <div className="min-h-screen pb-24 md:pb-6">
      {/* Guild Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-6 rounded-lg shadow-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-5xl">{guild.icon}</div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{guild.name}</h1>
                <span className="px-2 py-1 bg-white/20 rounded text-sm font-mono">[{guild.tag}]</span>
              </div>
              <p className="text-purple-100 text-sm mt-1">{guild.description}</p>
            </div>
          </div>
          
          {myRole && (
            <div className="text-right">
              <div
                className="px-3 py-1 rounded-full text-sm font-semibold"
                style={{ backgroundColor: getRoleColor(myRole) + '30', color: getRoleColor(myRole) }}
              >
                {getRoleNameVi(myRole)}
              </div>
            </div>
          )}
        </div>

        {/* Guild Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{guild.level}</div>
            <div className="text-xs text-white/80">Cấp Độ</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{formatMemberCount(guild)}</div>
            <div className="text-xs text-white/80">Thành Viên</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">#{guild.rank || '---'}</div>
            <div className="text-xs text-white/80">Xếp Hạng</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{guild.warHistory.wins}</div>
            <div className="text-xs text-white/80">Chiến Thắng</div>
          </div>
        </div>

        {/* Guild XP Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span>Guild XP</span>
            <span>{guild.exp} / {guild.expToNextLevel}</span>
          </div>
          <div className="h-3 bg-black/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(guild.exp / guild.expToNextLevel) * 100}%` }}
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: 'info', label: 'Thông Tin', icon: Info },
          { key: 'members', label: 'Thành Viên', icon: Users },
          { key: 'quests', label: 'Nhiệm Vụ', icon: Star, badge: guild.activeQuests.filter(q => q.completed).length },
          { key: 'wars', label: 'Chiến Tranh', icon: Swords, badge: guild.activeWar ? 1 : 0 },
          { key: 'buffs', label: 'Buff', icon: Zap },
          { key: 'shop', label: 'Cửa Hàng', icon: Gift },
          { key: 'chat', label: 'Trò Chuyện', icon: MessageSquare, badge: guildState.unreadChatCount },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key as any)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors relative
                ${isActive
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeSubTab === 'info' && <GuildInfoTab guild={guild} myRole={myRole} onDonate={() => setShowDonateModal(true)} />}
      {activeSubTab === 'members' && <GuildMembersTab guild={guild} myRole={myRole} />}
      {activeSubTab === 'quests' && <GuildQuestsTab guild={guild} onClaimQuest={claimGuildQuest} />}
      {activeSubTab === 'wars' && <GuildWarsTab guild={guild} myRole={myRole} onStartWar={startGuildWar} />}
      {activeSubTab === 'buffs' && <GuildBuffsTab guild={guild} myRole={myRole} onUpgradeBuff={upgradeGuildBuff} />}
      {activeSubTab === 'shop' && <GuildShopTab guild={guild} onPurchase={purchaseFromGuildShop} />}
      {activeSubTab === 'chat' && <GuildChatTab guild={guild} />}

      {/* Donate Modal */}
      <AnimatePresence>
        {showDonateModal && (
          <DonateModal
            onClose={() => setShowDonateModal(false)}
            onDonate={donateToGuild}
            playerResources={player.totalResources}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// No Guild Screen
function NoGuildScreen({ onCreateClick }: { onCreateClick: () => void }) {
  const [showGuildList, setShowGuildList] = useState(false);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white p-12 rounded-lg shadow-lg text-center mb-8">
        <Users className="w-24 h-24 mx-auto mb-6 opacity-90" />
        <h1 className="text-4xl font-bold mb-4">Gia Nhập Bộ Lạc</h1>
        <p className="text-xl text-purple-100 mb-8">
          Hợp tác cùng người chơi khác, xây dựng liên minh và nhận phần thưởng độc quyền!
        </p>

        <div className="flex gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCreateClick}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl"
          >
            <Crown className="w-6 h-6" />
            Lập Bộ Lạc Mới
            <span className="ml-2 text-sm opacity-90">(💎 {GUILD_CREATE_COST})</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowGuildList(true)}
            className="flex items-center gap-2 px-8 py-4 bg-white text-purple-600 font-bold rounded-lg shadow-lg hover:shadow-xl"
          >
            <UserPlus className="w-6 h-6" />
            Tìm Bộ Lạc
          </motion.button>
        </div>
      </div>

      {/* Benefits */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-md text-center">
          <div className="text-5xl mb-4">🤝</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Hợp Tác</h3>
          <p className="text-gray-600">Chơi cùng bạn bè và người chơi khác trên toàn quốc</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-md text-center">
          <div className="text-5xl mb-4">⚡</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Buff Mạnh</h3>
          <p className="text-gray-600">Nhận buff sản xuất, chiến đấu và kinh nghiệm</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-md text-center">
          <div className="text-5xl mb-4">🎁</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Phần Thưởng</h3>
          <p className="text-gray-600">Cửa hàng guild với vật phẩm độc quyền</p>
        </div>
      </div>

      {/* Guild List Modal */}
      <AnimatePresence>
        {showGuildList && (
          <GuildListModal onClose={() => setShowGuildList(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// Guild Info Tab
function GuildInfoTab({ guild, myRole, onDonate }: { guild: Guild; myRole?: import('@/lib/guildSystem').GuildRole; onDonate?: () => void }) {
  return (
    <div className="space-y-6">
      {/* Announcement */}
      {guild.settings.announcement && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">📢 Thông Báo Bộ Lạc</h3>
              <p className="text-gray-700">{guild.settings.announcement}</p>
            </div>
          </div>
        </div>
      )}

      {/* Treasury */}
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-purple-600" />
          Kho Báu Bộ Lạc
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600">{guild.treasury.gold}</div>
            <div className="text-sm text-gray-600">💰 Gold</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{guild.treasury.rice}</div>
            <div className="text-sm text-gray-600">🌾 Rice</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{guild.treasury.culture}</div>
            <div className="text-sm text-gray-600">📜 Culture</div>
          </div>
        </div>

        <button
          onClick={onDonate}
          className="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
        >
          <Gift className="w-5 h-5 inline mr-2" />
          Quyên Góp Tài Nguyên
        </button>
      </div>

      {/* Top Contributors */}
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-yellow-600" />
          Top Đóng Góp
        </h3>
        <div className="space-y-3">
          {getTopContributors(guild, 5).map((member, index) => (
            <div key={member.playerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-yellow-400 text-white' :
                  index === 1 ? 'bg-gray-300 text-gray-700' :
                  index === 2 ? 'bg-orange-400 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{member.playerName}</div>
                  <div className="text-sm text-gray-600">{getRoleNameVi(member.role)}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-purple-600">{member.contribution}</div>
                <div className="text-xs text-gray-500">điểm</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* War History */}
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Swords className="w-6 h-6 text-red-600" />
          Lịch Sử Chiến Tranh
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{guild.warHistory.wins}</div>
            <div className="text-sm text-gray-600">Thắng</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600">{guild.warHistory.losses}</div>
            <div className="text-sm text-gray-600">Thua</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-600">{guild.warHistory.draws}</div>
            <div className="text-sm text-gray-600">Hòa</div>
          </div>
        </div>
      </div>

      {/* Leave Guild Button */}
      {!isGuildLeader(myRole) && (
        <button className="w-full py-3 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2">
          <LogOut className="w-5 h-5" />
          Rời Bộ Lạc
        </button>
      )}
    </div>
  );
}

// Guild Members Tab
function GuildMembersTab({ guild, myRole }: { guild: Guild; myRole?: import('@/lib/guildSystem').GuildRole }) {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900">
          Danh Sách Thành Viên ({formatMemberCount(guild)})
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {guild.members.map((member) => (
            <div key={member.playerId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                  {member.playerName[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{member.playerName}</span>
                    {member.role === 'leader' && <Crown className="w-4 h-4 text-yellow-500" />}
                    {member.role === 'officer' && <Shield className="w-4 h-4 text-purple-500" />}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>Lv. {member.playerLevel}</span>
                    <span>•</span>
                    <span style={{ color: getRoleColor(member.role) }}>
                      {getRoleNameVi(member.role)}
                    </span>
                    <span>•</span>
                    <span>{member.contribution} điểm</span>
                  </div>
                </div>
              </div>

              {canManageGuild(myRole) && member.playerId !== guild.leaderId && (
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Guild Chat Tab
function GuildChatTab({ guild }: { guild: Guild }) {
  const [message, setMessage] = useState('');

  return (
    <div className="bg-white rounded-lg shadow-md h-[600px] flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900">Trò Chuyện Bộ Lạc</h3>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="text-center text-gray-500 text-sm py-4">
          Chào mừng đến với trò chuyện bộ lạc! 💬
        </div>
        {/* Messages will be rendered here */}
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            maxLength={200}
          />
          <button className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
            <Send className="w-5 h-5" />
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}

// Guild Buffs Tab
function GuildBuffsTab({ guild, myRole, onUpgradeBuff }: { guild: Guild; myRole?: import('@/lib/guildSystem').GuildRole; onUpgradeBuff?: (buffId: string) => void }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {guild.buffs.map((buff) => (
        <div key={buff.id} className="bg-white rounded-lg p-6 shadow-md">
          <div className="text-center mb-4">
            <div className="text-5xl mb-2">{buff.icon}</div>
            <h3 className="text-lg font-bold text-gray-900">{buff.displayName}</h3>
            <p className="text-sm text-gray-600 mt-1">{buff.description}</p>
          </div>

          {/* Level Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Cấp độ</span>
              <span className="font-semibold">{buff.level} / {buff.maxLevel}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-600"
                style={{ width: `${(buff.level / buff.maxLevel) * 100}%` }}
              />
            </div>
          </div>

          {/* Effect */}
          <div className="bg-purple-50 rounded-lg p-3 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">+{buff.effect.value}%</div>
              <div className="text-xs text-gray-600">Hiệu Ứng</div>
            </div>
          </div>

          {/* Upgrade Cost */}
          {buff.level < buff.maxLevel && (
            <>
              <div className="text-xs text-gray-600 mb-2">Chi phí nâng cấp:</div>
              <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                <div className="bg-gray-50 p-2 rounded text-center">
                  <div className="font-semibold">💰 {buff.cost.gold}</div>
                </div>
                <div className="bg-gray-50 p-2 rounded text-center">
                  <div className="font-semibold">📜 {buff.cost.culture}</div>
                </div>
              </div>

              <button
                onClick={() => onUpgradeBuff?.(buff.id)}
                disabled={!canManageGuild(myRole)}
                className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                  canManageGuild(myRole)
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Zap className="w-4 h-4 inline mr-1" />
                Nâng Cấp
              </button>
            </>
          )}

          {buff.level >= buff.maxLevel && (
            <div className="bg-green-50 text-green-700 text-center py-2 rounded-lg font-semibold">
              <Check className="w-4 h-4 inline mr-1" />
              Đã Tối Đa
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Create Guild Modal
function CreateGuildModal({ onClose }: { onClose: () => void }) {
  const { player, createNewGuild } = useGameStore();
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🏰');
  const [errors, setErrors] = useState<{ name?: string; tag?: string }>({});

  const icons = ['🏰', '⚔️', '🛡️', '👑', '🦅', '🐉', '⚡', '🔥', '🌟', '💎', '🏆', '🎯'];

  const handleCreate = () => {
    const nameValidation = validateGuildName(name);
    const tagValidation = validateGuildTag(tag.toUpperCase());

    if (!nameValidation.valid || !tagValidation.valid) {
      setErrors({
        name: nameValidation.error,
        tag: tagValidation.error,
      });
      return;
    }

    const gems = player.totalResources.gems || 0;
    if (gems < GUILD_CREATE_COST) {
      alert(`Không đủ gems! Cần ${GUILD_CREATE_COST} gems để tạo guild.`);
      return;
    }

    createNewGuild(name, tag.toUpperCase(), description, icon);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Crown className="w-8 h-8" />
            Tạo Bộ Lạc Mới
          </h2>
          <p className="text-purple-100 mt-1">Chi phí: 💎 {GUILD_CREATE_COST} Gems</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Biểu Tượng</label>
            <div className="grid grid-cols-6 gap-3">
              {icons.map((i) => (
                <button
                  key={i}
                  onClick={() => setIcon(i)}
                  className={`text-4xl p-3 rounded-lg transition-all ${
                    icon === i
                      ? 'bg-purple-100 ring-2 ring-purple-600 scale-110'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tên Bộ Lạc <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="Ví dụ: Lạc Việt Warriors"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
              }`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            <p className="text-gray-500 text-xs mt-1">{name.length}/20 ký tự</p>
          </div>

          {/* Tag */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ký Hiệu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value.toUpperCase())}
              maxLength={5}
              placeholder="VN"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 font-mono ${
                errors.tag ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
              }`}
            />
            {errors.tag && <p className="text-red-500 text-sm mt-1">{errors.tag}</p>}
            <p className="text-gray-500 text-xs mt-1">{tag.length}/5 ký tự (CHỮ HOA, SỐ)</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mô Tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="Mô tả ngắn về bộ lạc của bạn..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            <p className="text-gray-500 text-xs mt-1">{description.length}/200 ký tự</p>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreate}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            Lập Bộ Lạc Ngay
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Guild List Modal (placeholder)
function GuildListModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-3xl font-bold">Tìm Guild</h2>
        </div>

        <div className="p-12 text-center">
          <Users className="w-24 h-24 mx-auto text-gray-300 mb-6" />
          <h3 className="text-2xl font-bold text-gray-700 mb-2">Đang phát triển</h3>
          <p className="text-gray-600">Danh sách bộ lạc sẽ có sớm!</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Guild Quests Tab
function GuildQuestsTab({ guild, onClaimQuest }: { guild: Guild; onClaimQuest: (questId: string) => void }) {
  const getDailyQuests = () => guild.activeQuests.filter(q => q.id.startsWith('daily'));
  const getWeeklyQuests = () => guild.activeQuests.filter(q => q.id.startsWith('weekly'));

  const getQuestProgress = (quest: import('@/lib/guildSystem').GuildQuest) => {
    return Math.floor((quest.progress / quest.target) * 100);
  };

  const formatTimeRemaining = (endDate: number) => {
    const now = Date.now();
    const remaining = endDate - now;
    
    if (remaining <= 0) return 'Đã hết hạn';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} ngày`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const QuestCard = ({ quest }: { quest: import('@/lib/guildSystem').GuildQuest }) => {
    const progress = getQuestProgress(quest);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg p-6 shadow-md border-l-4 border-purple-500"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900">{quest.displayName}</h3>
              {quest.completed && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  <Check className="w-3 h-3 inline mr-1" />
                  Hoàn thành
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{quest.description}</p>
          </div>
          <div className="text-right ml-4">
            <div className="text-sm text-gray-500 mb-1">Còn lại</div>
            <div className="text-sm font-semibold text-purple-600">{formatTimeRemaining(quest.endDate)}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-700">Tiến độ</span>
            <span className="font-semibold text-gray-900">{quest.progress} / {quest.target}</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`h-full ${
                quest.completed
                  ? 'bg-gradient-to-r from-green-400 to-green-600'
                  : 'bg-gradient-to-r from-purple-400 to-indigo-600'
              }`}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">{progress}% hoàn thành</div>
        </div>

        {/* Rewards */}
        <div className="bg-purple-50 rounded-lg p-4 mb-4">
          <div className="text-sm font-semibold text-purple-900 mb-2">🎁 Phần Thưởng</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="font-bold text-yellow-600">💰 {quest.rewards.resources.gold}</div>
              <div className="text-gray-600">Gold</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-purple-600">📜 {quest.rewards.resources.culture}</div>
              <div className="text-gray-600">Culture</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-600">✨ {quest.rewards.guildExp}</div>
              <div className="text-gray-600">Guild XP</div>
            </div>
          </div>
          <div className="text-center mt-2 pt-2 border-t border-purple-200">
            <span className="text-sm font-semibold text-purple-700">
              +{quest.rewards.contribution} điểm đóng góp/thành viên
            </span>
          </div>
        </div>

        {/* Claim Button */}
        {quest.completed ? (
          <button
            onClick={() => onClaimQuest(quest.id)}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
          >
            <Gift className="w-5 h-5 inline mr-2" />
            Nhận Thưởng
          </button>
        ) : (
          <div className="w-full py-3 bg-gray-100 text-gray-400 font-semibold text-center rounded-lg">
            Chưa hoàn thành
          </div>
        )}
      </motion.div>
    );
  };

  const dailyQuests = getDailyQuests();
  const weeklyQuests = getWeeklyQuests();

  return (
    <div className="space-y-8">
      {/* Daily Quests */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl">☀️</div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nhiệm Vụ Hàng Ngày</h2>
            <p className="text-sm text-gray-600">Reset mỗi ngày lúc 00:00</p>
          </div>
        </div>
        <div className="grid gap-4">
          {dailyQuests.length > 0 ? (
            dailyQuests.map(quest => <QuestCard key={quest.id} quest={quest} />)
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Star className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">Không có nhiệm vụ hàng ngày</p>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Quests */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl">🏆</div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Nhiệm Vụ Hàng Tuần</h2>
            <p className="text-sm text-gray-600">Reset mỗi tuần vào Chủ Nhật</p>
          </div>
        </div>
        <div className="grid gap-4">
          {weeklyQuests.length > 0 ? (
            weeklyQuests.map(quest => <QuestCard key={quest.id} quest={quest} />)
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">Không có nhiệm vụ hàng tuần</p>
            </div>
          )}
        </div>
      </div>

      {/* Quest Stats */}
      <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg p-6">
        <h3 className="text-lg font-bold text-purple-900 mb-4">📊 Thống Kê Nhiệm Vụ</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{guild.activeQuests.length}</div>
            <div className="text-sm text-gray-600">Đang hoạt động</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-600">
              {guild.activeQuests.filter(q => q.completed).length}
            </div>
            <div className="text-sm text-gray-600">Đã hoàn thành</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{guild.completedQuests}</div>
            <div className="text-sm text-gray-600">Tổng cộng</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Guild Wars Tab
function GuildWarsTab({
  guild,
  myRole,
  onStartWar,
}: {
  guild: Guild;
  myRole?: import('@/lib/guildSystem').GuildRole;
  onStartWar: (opponentId: string) => void;
}) {
  const [showStartWarModal, setShowStartWarModal] = useState(false);

  const formatWarTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getWarTimeRemaining = () => {
    if (!guild.activeWar) return 0;
    const now = Date.now();
    return Math.max(0, guild.activeWar.endTime - now);
  };

  return (
    <div className="space-y-6">
      {/* Active War */}
      {guild.activeWar ? (
        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Swords className="w-8 h-8" />
              Chiến Tranh Đang Diễn Ra
            </h2>
            <div className="text-right">
              <div className="text-sm opacity-90">Còn lại</div>
              <div className="text-2xl font-bold">{formatWarTime(getWarTimeRemaining())}</div>
            </div>
          </div>

          {/* Score Display */}
          <div className="grid grid-cols-3 gap-4 items-center mb-6">
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{guild.activeWar.attackScore}</div>
              <div className="text-sm opacity-90 mt-1">Guild của bạn</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold">VS</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{guild.activeWar.defendScore}</div>
              <div className="text-sm opacity-90 mt-1">Đối thủ</div>
            </div>
          </div>

          {/* Participants */}
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="font-bold mb-3">⚔️ Tham Gia ({guild.activeWar.participants.length} người)</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {guild.activeWar.participants.slice(0, 10).map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>Thành viên #{i + 1}</span>
                  <span className="font-semibold">
                    {p.wins}W - {p.losses}L ({p.points} điểm)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <Swords className="w-24 h-24 mx-auto text-gray-300 mb-6" />
          <h3 className="text-2xl font-bold text-gray-700 mb-2">Không có chiến tranh</h3>
          <p className="text-gray-600 mb-6">Guild chưa tham gia chiến tranh nào</p>
          
          {myRole === 'leader' && (
            <button
              onClick={() => setShowStartWarModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-lg hover:from-red-700 hover:to-orange-700 transition-all shadow-md hover:shadow-lg"
            >
              <Swords className="w-5 h-5 inline mr-2" />
              Bắt Đầu Chiến Tranh
            </button>
          )}
        </div>
      )}

      {/* War History */}
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-yellow-600" />
          Lịch Sử Chiến Tranh
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{guild.warHistory.wins}</div>
            <div className="text-sm text-gray-600 mt-1">Thắng</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600">{guild.warHistory.losses}</div>
            <div className="text-sm text-gray-600 mt-1">Thua</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-600">{guild.warHistory.draws}</div>
            <div className="text-sm text-gray-600 mt-1">Hòa</div>
          </div>
        </div>
      </div>

      {/* Rewards Info */}
      <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-6">
        <h3 className="text-lg font-bold text-orange-900 mb-4">🎁 Phần Thưởng Chiến Tranh</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="font-bold text-green-700 mb-2">🏆 Chiến Thắng</div>
            <div className="text-sm space-y-1">
              <div>💰 50,000 Gold</div>
              <div>🌾 30,000 Tài Nguyên</div>
              <div>📜 5,000 Culture</div>
              <div>💎 500 Gems</div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="font-bold text-gray-700 mb-2">🥈 Thua Cuộc</div>
            <div className="text-sm space-y-1">
              <div>💰 20,000 Gold</div>
              <div>🌾 10,000 Tài Nguyên</div>
              <div>📜 2,000 Culture</div>
              <div>💎 100 Gems</div>
            </div>
          </div>
        </div>
      </div>

      {/* Start War Modal */}
      <AnimatePresence>
        {showStartWarModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowStartWarModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Bắt Đầu Chiến Tranh</h3>
              <p className="text-gray-600 mb-6">
                Chức năng matchmaking đang được phát triển. Sẽ có sớm!
              </p>
              <button
                onClick={() => setShowStartWarModal(false)}
                className="w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors"
              >
                Đóng
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Guild Shop Tab
function GuildShopTab({ guild, onPurchase }: { guild: Guild; onPurchase: (itemId: string) => void }) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Player Contribution */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-90">Điểm Đóng Góp Của Bạn</div>
            <div className="text-4xl font-bold mt-1">
              {guild.members.find(m => m.playerId === 'current-player')?.contribution || 0}
            </div>
          </div>
          <Gift className="w-16 h-16 opacity-50" />
        </div>
      </div>

      {/* Shop Items Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guild.activeShop?.map(item => (
          <motion.div
            key={item.id}
            whileHover={{ y: -5 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            {/* Item Header with Gradient */}
            <div className={`bg-gradient-to-r ${getRarityColor(item.rarity)} p-4 text-white`}>
              <div className="text-center">
                <div className="text-4xl mb-2">
                  {item.type === 'hero' ? '👑' :
                   item.type === 'pet' ? '🐉' :
                   item.type === 'resource' ? '💰' :
                   item.type === 'buff' ? '⚡' : '🎁'}
                </div>
                <h3 className="font-bold">{item.displayName}</h3>
              </div>
            </div>

            {/* Item Body */}
            <div className="p-4">
              <div className={`inline-block px-2 py-1 ${getRarityBadge(item.rarity)} text-xs font-semibold rounded-full mb-3`}>
                {item.rarity.toUpperCase()}
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{item.description}</p>

              {/* Stock */}
              {item.stock !== -1 && (
                <div className="text-xs text-gray-500 mb-3">
                  Còn lại: <span className="font-semibold">{item.stock}</span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Giá</span>
                <span className="text-xl font-bold text-purple-600">{item.cost} điểm</span>
              </div>

              {/* Purchase Button */}
              <button
                onClick={() => onPurchase(item.id)}
                disabled={item.stock === 0}
                className={`w-full py-3 font-bold rounded-lg transition-all ${
                  item.stock === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
                }`}
              >
                {item.stock === 0 ? 'Hết Hàng' : 'Mua Ngay'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {(!guild.activeShop || guild.activeShop.length === 0) && (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <Gift className="w-24 h-24 mx-auto text-gray-300 mb-6" />
          <h3 className="text-2xl font-bold text-gray-700 mb-2">Cửa hàng đang cập nhật</h3>
          <p className="text-gray-600">Vật phẩm mới sẽ có sớm!</p>
        </div>
      )}
    </div>
  );
}

// Donate Modal
function DonateModal({
  onClose,
  onDonate,
  playerResources,
}: {
  onClose: () => void;
  onDonate: (resources: Resource) => void;
  playerResources: Resource;
}) {
  const [donations, setDonations] = useState({
    gold: 0,
    rice: 0,
    lumber: 0,
    stone: 0,
    culture: 0,
    bazan: 0,
  });

  const calculateContribution = () => {
    return (
      donations.gold +
      donations.rice * 0.8 +
      donations.lumber * 0.8 +
      donations.stone * 0.8 +
      donations.culture * 2
    );
  };

  const handleDonate = () => {
    onDonate({
      gold: donations.gold,
      rice: donations.rice,
      lumber: donations.lumber,
      stone: donations.stone,
      culture: donations.culture,
      bazan: donations.bazan,
      gems: 0,
    });
    onClose();
  };

  const setMax = (type: keyof typeof donations) => {
    setDonations(prev => ({
      ...prev,
      [type]: playerResources[type],
    }));
  };

  const ResourceInput = ({
    label,
    type,
    emoji,
    max,
  }: {
    label: string;
    type: keyof typeof donations;
    emoji: string;
    max: number;
  }) => (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-gray-700">
          {emoji} {label}
        </label>
        <span className="text-xs text-gray-500">Có: {max.toLocaleString()}</span>
      </div>
      <div className="flex gap-2">
        <input
          type="number"
          min="0"
          max={max}
          value={donations[type]}
          onChange={(e) => {
            const value = Math.min(Math.max(0, parseInt(e.target.value) || 0), max);
            setDonations(prev => ({ ...prev, [type]: value }));
          }}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={() => setMax(type)}
          className="px-4 py-2 bg-purple-100 text-purple-700 font-semibold rounded-lg hover:bg-purple-200 transition-colors"
        >
          Max
        </button>
      </div>
    </div>
  );

  const totalDonation = Object.values(donations).reduce((sum, val) => sum + val, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Gift className="w-8 h-8" />
            Quyên Góp Bộ Lạc
          </h2>
          <p className="text-purple-100 mt-1">Đóng góp tài nguyên để phát triển bộ lạc</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <ResourceInput label="Gold" type="gold" emoji="💰" max={playerResources.gold} />
          <ResourceInput label="Rice" type="rice" emoji="🌾" max={playerResources.rice} />
          <ResourceInput label="Lumber" type="lumber" emoji="🪵" max={playerResources.lumber} />
          <ResourceInput label="Stone" type="stone" emoji="🪨" max={playerResources.stone} />
          <ResourceInput label="Culture" type="culture" emoji="📜" max={playerResources.culture} />

          {/* Contribution Preview */}
          <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-purple-700 mb-1">Điểm đóng góp nhận được</div>
                <div className="text-4xl font-bold text-purple-900">
                  +{Math.floor(calculateContribution()).toLocaleString()}
                </div>
              </div>
              <TrendingUp className="w-16 h-16 text-purple-400" />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleDonate}
              disabled={totalDonation === 0}
              className={`flex-1 py-3 font-bold rounded-lg transition-all ${
                totalDonation === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
              }`}
            >
              <Gift className="w-5 h-5 inline mr-2" />
              Quyên Góp
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
