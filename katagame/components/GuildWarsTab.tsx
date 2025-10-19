'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  Shield,
  Flag,
  Trophy,
  Users,
  Target,
  Crown,
  Zap,
  TrendingUp,
  Clock,
  MapPin,
  Coins,
  Gem,
  Award,
  AlertCircle,
  Check,
  X,
  Plus,
  Eye,
  Flame,
  Skull,
  Heart,
  Activity,
  BarChart3,
  Gift,
  ShoppingCart,
  Handshake,
  Star,
  ChevronRight,
  Building2,
  Mountain,
  Landmark,
  Factory,
  Home as HomeIcon,
  Church,
  Anchor,
} from 'lucide-react';
import {
  getGuildWarsSystem,
  Territory,
  GuildWarDeclaration,
  SiegeBattle,
  GuildAlliance,
  GuildRanking,
  GuildShopItem,
  GuildBuff,
  GuildTreasury,
  GuildWarStats,
  GUILD_WARS_CONFIG,
  TerritoryType,
  SiegeTroopType,
} from '@/lib/guildWarsSystem';
import { useGameStore } from '@/lib/gameStore';

type GuildWarsTabType = 'map' | 'wars' | 'alliances' | 'rankings' | 'shop' | 'treasury' | 'stats';

export default function GuildWarsTab() {
  const { player } = useGameStore();
  const guildWarsSystem = getGuildWarsSystem();
  
  const [activeTab, setActiveTab] = useState<GuildWarsTabType>('map');
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [myTerritories, setMyTerritories] = useState<Territory[]>([]);
  const [activeWars, setActiveWars] = useState<GuildWarDeclaration[]>([]);
  const [myWars, setMyWars] = useState<GuildWarDeclaration[]>([]);
  const [alliances, setAlliances] = useState<GuildAlliance[]>([]);
  const [rankings, setRankings] = useState<GuildRanking[]>([]);
  const [shopItems, setShopItems] = useState<GuildShopItem[]>([]);
  const [activeBuffs, setActiveBuffs] = useState<GuildBuff[]>([]);
  const [treasury, setTreasury] = useState<GuildTreasury | null>(null);
  const [warStats, setWarStats] = useState<GuildWarStats | null>(null);
  const [myRanking, setMyRanking] = useState<GuildRanking | null>(null);
  
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [selectedWar, setSelectedWar] = useState<GuildWarDeclaration | null>(null);
  const [siegeBattle, setSiegeBattle] = useState<SiegeBattle | null>(null);
  const [showDeclareWar, setShowDeclareWar] = useState(false);
  const [showProposeAlliance, setShowProposeAlliance] = useState(false);
  
  // Placeholder guild ID (in real implementation, this would come from player's guild)
  const myGuildId = 'guild_1';
  const myGuildName = 'Dragon Warriors';

  useEffect(() => {
    refreshData();
    
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [player, myGuildId]);

  const refreshData = () => {
    if (!player) return;

    // Territories
    setTerritories(guildWarsSystem.getTerritories());
    setMyTerritories(guildWarsSystem.getGuildTerritories(myGuildId));

    // Wars
    setActiveWars(guildWarsSystem.getActiveWars());
    setMyWars(guildWarsSystem.getGuildWars(myGuildId));

    // Alliances
    setAlliances(guildWarsSystem.getAlliances(myGuildId));

    // Rankings
    setRankings(guildWarsSystem.getRankings(100));
    setMyRanking(guildWarsSystem.getGuildRanking(myGuildId));

    // Shop & Buffs
    setShopItems(guildWarsSystem.getGuildShop());
    setActiveBuffs(guildWarsSystem.getGuildBuffs(myGuildId));

    // Treasury
    setTreasury(guildWarsSystem.getTreasury(myGuildId));

    // Stats
    setWarStats(guildWarsSystem.getWarStats(myGuildId));

    // Siege battle for selected war
    if (selectedWar) {
      const battle = guildWarsSystem.getSiegeBattle(selectedWar.id);
      setSiegeBattle(battle);
    }
  };

  const handleDeclareWar = (targetTerritoryId: string) => {
    const territory = territories.find(t => t.id === targetTerritoryId);
    if (!territory) return;

    const defenderGuildId = territory.ownerGuildId || 'neutral';
    const defenderGuildName = territory.ownerGuildName || 'Neutral Forces';

    const result = guildWarsSystem.declareWar(
      myGuildId,
      myGuildName,
      defenderGuildId,
      defenderGuildName,
      targetTerritoryId
    );

    if (result.success) {
      alert('War declared! Prepare for battle!');
      refreshData();
      setShowDeclareWar(false);
    } else {
      alert(result.error);
    }
  };

  const handleJoinWar = (warId: string, side: 'attacker' | 'defender') => {
    if (!player) return;

    const result = guildWarsSystem.joinWar(warId, player.id, side);

    if (result.success) {
      alert('Joined the war!');
      refreshData();
    } else {
      alert(result.error);
    }
  };

  const handlePurchaseItem = (itemId: string) => {
    if (!player) return;

    const result = guildWarsSystem.purchaseShopItem(myGuildId, itemId, player.id);

    if (result.success) {
      alert('Item purchased!');
      refreshData();
    } else {
      alert(result.error);
    }
  };

  const getTerritoryIcon = (type: TerritoryType) => {
    switch (type) {
      case 'castle': return Crown;
      case 'fortress': return Shield;
      case 'outpost': return Flag;
      case 'mine': return Mountain;
      case 'farm': return HomeIcon;
      case 'temple': return Church;
      case 'port': return Anchor;
      default: return Building2;
    }
  };

  const getTerritoryColor = (status: string) => {
    switch (status) {
      case 'neutral': return 'bg-gray-500/20 border-gray-500';
      case 'occupied': return 'bg-green-500/20 border-green-500';
      case 'contested': return 'bg-yellow-500/20 border-yellow-500';
      case 'siege': return 'bg-red-500/20 border-red-500';
      default: return 'bg-gray-500/20 border-gray-500';
    }
  };

  const getWarStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-400';
      case 'preparation': return 'text-yellow-400';
      case 'active': return 'text-red-400';
      case 'completed': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const formatTimeRemaining = (timestamp: number) => {
    const diff = timestamp - Date.now();
    if (diff < 0) return 'Ended';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const TerritoryCard = ({ territory }: { territory: Territory }) => {
    const Icon = getTerritoryIcon(territory.type);
    const isMyTerritory = territory.ownerGuildId === myGuildId;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${getTerritoryColor(territory.status)} border-2 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all`}
        onClick={() => setSelectedTerritory(territory)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold">{territory.name}</h3>
              <p className="text-gray-300 text-xs capitalize">{territory.type}</p>
            </div>
          </div>
          {isMyTerritory && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded font-bold">
              YOUR GUILD
            </span>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Owner:</span>
            <span className="text-white font-medium">
              {territory.ownerGuildName || 'Neutral'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Level:</span>
            <span className="text-yellow-400 font-bold">{territory.level}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Defense:</span>
            <span className="text-blue-400 font-bold">{territory.defenseRating.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="text-gray-300 text-xs mb-2">Daily Generation:</div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <Coins className="w-4 h-4 text-yellow-400" />
              {territory.resourceGeneration.gold.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Gem className="w-4 h-4 text-purple-400" />
              {territory.resourceGeneration.gems}
            </span>
          </div>
        </div>

        {territory.status === 'siege' && (
          <div className="mt-3">
            <div className="flex items-center gap-2 text-red-400 text-xs font-bold animate-pulse">
              <Flame className="w-4 h-4" />
              UNDER SIEGE
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-6 mb-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Swords className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white">Guild Wars</h1>
              <p className="text-orange-100 text-sm">Chinh phục lãnh thổ và thống trị!</p>
            </div>
          </div>

          {myRanking && (
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">#{myRanking.rank}</div>
                <div className="text-orange-100 text-xs">Rank</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{myTerritories.length}</div>
                <div className="text-orange-100 text-xs">Territories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {warStats ? `${warStats.warsWon}/${warStats.totalWars}` : '0/0'}
                </div>
                <div className="text-orange-100 text-xs">W/L</div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'map', label: 'Bản Đồ', icon: MapPin },
          { id: 'wars', label: 'Chiến Tranh', icon: Swords },
          { id: 'alliances', label: 'Liên Minh', icon: Handshake },
          { id: 'rankings', label: 'Bảng Xếp Hạng', icon: Trophy },
          { id: 'shop', label: 'Cửa Hàng', icon: ShoppingCart },
          { id: 'treasury', label: 'Kho Bạc', icon: Coins },
          { id: 'stats', label: 'Thống Kê', icon: BarChart3 },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as GuildWarsTabType)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg scale-105'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* MAP TAB */}
        {activeTab === 'map' && (
          <motion.div
            key="map"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  All Territories ({territories.length})
                </h2>
                <button
                  onClick={() => setShowDeclareWar(true)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Swords className="w-5 h-5" />
                  Declare War
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {territories.slice(0, 30).map(territory => (
                  <TerritoryCard key={territory.id} territory={territory} />
                ))}
              </div>
            </div>

            {/* My Territories */}
            {myTerritories.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Your Guild's Territories ({myTerritories.length})
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myTerritories.map(territory => (
                    <TerritoryCard key={territory.id} territory={territory} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* WARS TAB */}
        {activeTab === 'wars' && (
          <motion.div
            key="wars"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Active Wars ({activeWars.length})
              </h2>

              <div className="space-y-4">
                {activeWars.map(war => (
                  <div
                    key={war.id}
                    className="bg-black/30 rounded-lg p-4 cursor-pointer hover:bg-black/40 transition-all"
                    onClick={() => setSelectedWar(war)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Swords className="w-6 h-6 text-red-400" />
                        <div>
                          <div className="text-white font-bold">
                            {war.attackerGuildName} vs {war.defenderGuildName}
                          </div>
                          <div className="text-gray-300 text-sm">
                            Territory: {territories.find(t => t.id === war.targetTerritoryId)?.name}
                          </div>
                        </div>
                      </div>
                      <div className={`font-bold uppercase text-sm ${getWarStatusColor(war.status)}`}>
                        {war.status}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-6">
                        <div>
                          <div className="text-gray-400">Attackers</div>
                          <div className="text-red-400 font-bold">{war.attackerMembers.length} joined</div>
                        </div>
                        <div>
                          <div className="text-gray-400">Defenders</div>
                          <div className="text-blue-400 font-bold">{war.defenderMembers.length} joined</div>
                        </div>
                      </div>

                      <div className="text-right">
                        {war.status === 'scheduled' && (
                          <div className="text-gray-300">
                            Starts in: {formatTimeRemaining(war.scheduledTime)}
                          </div>
                        )}
                        {war.status === 'active' && war.endTime && (
                          <div className="text-yellow-400">
                            Ends in: {formatTimeRemaining(war.endTime)}
                          </div>
                        )}
                      </div>
                    </div>

                    {war.status === 'active' && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-red-400 text-2xl font-bold">
                              {war.attackerScore.toLocaleString()}
                            </div>
                            <div className="text-gray-400 text-xs">Attacker Score</div>
                          </div>
                          <div className="text-gray-500 font-bold text-3xl">VS</div>
                          <div className="text-right">
                            <div className="text-blue-400 text-2xl font-bold">
                              {war.defenderScore.toLocaleString()}
                            </div>
                            <div className="text-gray-400 text-xs">Defender Score</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {activeWars.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Swords className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No active wars</p>
                  </div>
                )}
              </div>
            </div>

            {/* My Wars */}
            {myWars.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Your Guild's Wars ({myWars.length})
                </h2>

                <div className="space-y-3">
                  {myWars.map(war => (
                    <div key={war.id} className="bg-black/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-bold">
                            {war.attackerGuildName} vs {war.defenderGuildName}
                          </div>
                          <div className={`text-sm ${getWarStatusColor(war.status)}`}>
                            {war.status.toUpperCase()}
                          </div>
                        </div>

                        {(war.status === 'scheduled' || war.status === 'preparation') && (
                          <button
                            onClick={() => handleJoinWar(
                              war.id,
                              war.attackerGuildId === myGuildId ? 'attacker' : 'defender'
                            )}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg"
                          >
                            Join Battle
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ALLIANCES TAB */}
        {activeTab === 'alliances' && (
          <motion.div
            key="alliances"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                Alliances ({alliances.length}/{GUILD_WARS_CONFIG.MAX_ALLIANCES})
              </h2>
              <button
                onClick={() => setShowProposeAlliance(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Propose Alliance
              </button>
            </div>

            <div className="space-y-4">
              {alliances.map(alliance => (
                <div key={alliance.id} className="bg-black/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Handshake className="w-6 h-6 text-blue-400" />
                      <div>
                        <div className="text-white font-bold">
                          {alliance.guildName1} ⟷ {alliance.guildName2}
                        </div>
                        <div className="text-gray-300 text-sm">
                          {alliance.status === 'active' ? 'Active Alliance' : 'Pending'}
                        </div>
                      </div>
                    </div>
                    {alliance.status === 'active' && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Wars Together</div>
                      <div className="text-white font-bold">{alliance.allianceWarCount}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Trade Bonus</div>
                      <div className="text-green-400 font-bold">+{alliance.benefits.tradeBonus}%</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Mutual Defense</div>
                      <div className="text-white">
                        {alliance.benefits.mutualDefense ? '✓' : '✗'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Expires In</div>
                      <div className="text-yellow-400 font-bold">
                        {formatTimeRemaining(alliance.expiresAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {alliances.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Handshake className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No alliances yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* RANKINGS TAB */}
        {activeTab === 'rankings' && (
          <motion.div
            key="rankings"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">
              Guild Rankings - Season 1
            </h2>

            <div className="space-y-2">
              {rankings.slice(0, 50).map((ranking, index) => {
                const isMyGuild = ranking.guildId === myGuildId;
                const rankDiff = ranking.previousRank - ranking.rank;

                return (
                  <div
                    key={ranking.guildId}
                    className={`rounded-lg p-4 flex items-center justify-between ${
                      isMyGuild ? 'bg-purple-500/30 border-2 border-purple-500' : 'bg-black/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800' :
                        index === 2 ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {ranking.rank}
                      </div>

                      <div>
                        <div className="text-white font-bold flex items-center gap-2">
                          {ranking.guildName}
                          {isMyGuild && (
                            <span className="text-xs bg-purple-500 px-2 py-0.5 rounded">YOU</span>
                          )}
                        </div>
                        <div className="text-gray-300 text-sm">
                          {ranking.territoriesOwned} territories • {ranking.warsWon}W - {ranking.warsLost}L
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-yellow-400 font-bold text-lg">
                          {ranking.points.toLocaleString()}
                        </div>
                        <div className="text-gray-400 text-xs">Points</div>
                      </div>

                      {rankDiff !== 0 && (
                        <div className={`flex items-center gap-1 ${rankDiff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {rankDiff > 0 ? (
                            <TrendingUp className="w-5 h-5" />
                          ) : (
                            <Activity className="w-5 h-5 transform rotate-180" />
                          )}
                          <span className="font-bold">{Math.abs(rankDiff)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* SHOP TAB */}
        {activeTab === 'shop' && (
          <motion.div
            key="shop"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* Active Buffs */}
            {activeBuffs.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  Active Buffs ({activeBuffs.length}/{GUILD_WARS_CONFIG.MAX_ACTIVE_BUFFS})
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeBuffs.map(buff => (
                    <div key={buff.id} className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-yellow-400" />
                          <span className="text-white font-bold">{buff.name}</span>
                        </div>
                        <span className="text-green-400 font-bold">+{buff.value}%</span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{buff.description}</p>
                      <div className="text-yellow-400 text-xs">
                        Expires in: {formatTimeRemaining(buff.expiresAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shop Items */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Guild Shop</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shopItems.map(item => (
                  <div key={item.id} className="bg-black/30 rounded-lg p-4">
                    <div className="mb-3">
                      <h3 className="text-white font-bold">{item.name}</h3>
                      <p className="text-gray-300 text-sm mt-1">{item.description}</p>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Cost:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-purple-400 font-bold">
                            {item.cost.guildPoints.toLocaleString()} GP
                          </span>
                          {item.cost.gold && (
                            <span className="text-yellow-400 font-bold">
                              {item.cost.gold.toLocaleString()} 💰
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Required Level:</span>
                        <span className="text-white">{item.requiredGuildLevel}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handlePurchaseItem(item.id)}
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-bold"
                    >
                      Purchase
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TREASURY TAB */}
        {activeTab === 'treasury' && treasury && (
          <motion.div
            key="treasury"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6">Guild Treasury</h2>

            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="w-6 h-6 text-yellow-400" />
                  <span className="text-gray-300">Gold</span>
                </div>
                <div className="text-3xl font-bold text-yellow-400">
                  {treasury.gold.toLocaleString()}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gem className="w-6 h-6 text-purple-400" />
                  <span className="text-gray-300">Gems</span>
                </div>
                <div className="text-3xl font-bold text-purple-400">
                  {treasury.gems.toLocaleString()}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-6 h-6 text-blue-400" />
                  <span className="text-gray-300">Guild Points</span>
                </div>
                <div className="text-3xl font-bold text-blue-400">
                  {treasury.guildPoints.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-4 mb-6">
              <h3 className="text-white font-bold mb-3">Top Donors (This Week)</h3>
              <div className="space-y-2">
                {treasury.topDonors.slice(0, 5).map((donor, index) => (
                  <div key={donor.playerId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <span className="text-white">{donor.playerName}</span>
                    </div>
                    <div className="text-yellow-400 font-bold">
                      {donor.weeklyDonated.toLocaleString()} 💰
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <h3 className="text-white font-bold mb-3">Weekly Spending</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-sm">Buffs</div>
                  <div className="text-white font-bold">{treasury.weeklySpending.buffs.toLocaleString()} 💰</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Shop</div>
                  <div className="text-white font-bold">{treasury.weeklySpending.shop.toLocaleString()} 💰</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Wars</div>
                  <div className="text-white font-bold">{treasury.weeklySpending.wars.toLocaleString()} 💰</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Upgrades</div>
                  <div className="text-white font-bold">{treasury.weeklySpending.upgrades.toLocaleString()} 💰</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STATS TAB */}
        {activeTab === 'stats' && warStats && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6">War Statistics</h2>

            <div className="grid grid-cols-4 gap-6 mb-6">
              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Total Wars</div>
                <div className="text-3xl font-bold text-white">{warStats.totalWars}</div>
              </div>
              <div className="bg-green-500/20 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Wars Won</div>
                <div className="text-3xl font-bold text-green-400">{warStats.warsWon}</div>
              </div>
              <div className="bg-red-500/20 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Wars Lost</div>
                <div className="text-3xl font-bold text-red-400">{warStats.warsLost}</div>
              </div>
              <div className="bg-purple-500/20 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Win Rate</div>
                <div className="text-3xl font-bold text-purple-400">
                  {warStats.totalWars > 0
                    ? Math.round((warStats.warsWon / warStats.totalWars) * 100)
                    : 0}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Territories Conquered</div>
                <div className="text-2xl font-bold text-green-400">
                  {warStats.territoriesConquered}
                </div>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Territories Lost</div>
                <div className="text-2xl font-bold text-red-400">
                  {warStats.territoriesLost}
                </div>
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-4">
              <h3 className="text-white font-bold mb-3">MVP Players</h3>
              <div className="space-y-2">
                {warStats.mvpPlayers.slice(0, 10).map((mvp, index) => (
                  <div key={mvp.playerId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index < 3 ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white' : 'bg-gray-600 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-white">{mvp.playerName}</span>
                    </div>
                    <div className="text-yellow-400 font-bold">
                      {mvp.contributions.toLocaleString()} pts
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
