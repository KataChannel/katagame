'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, TrendingUp, TrendingDown, Medal, Crown, Star,
  Users, Coins, Zap, Shield, Flame, Award, ChevronUp,
  ChevronDown, Minus, Gift, Clock, BarChart3, MapPin
} from 'lucide-react';
import { 
  getLeaderboardSystem, 
  LeaderboardType, 
  TimeFrame, 
  Region, 
  LeaderboardEntry,
  PlayerProfile,
  RankTier
} from '@/lib/leaderboardSystem';
import { useGameStore } from '@/lib/gameStore';

type TabType = 'global' | 'regional' | 'profile' | 'rewards';

export default function LeaderboardTab() {
  const { player } = useGameStore();
  const [activeTab, setActiveTab] = useState<TabType>('global');
  const [selectedType, setSelectedType] = useState<LeaderboardType>('power');
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('all-time');
  const [selectedRegion, setSelectedRegion] = useState<Region>('global');
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerRank, setPlayerRank] = useState<LeaderboardEntry | undefined>();
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | undefined>();
  const [dailyRewards, setDailyRewards] = useState<any>(null);
  const [tierConfigs, setTierConfigs] = useState<any[]>([]);

  useEffect(() => {
    initializePlayer();
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [player.id, selectedType, selectedTimeFrame, selectedRegion]);

  const initializePlayer = () => {
    const system = getLeaderboardSystem();
    
    if (!system.getPlayerRanking(player.id)) {
      system.initializePlayerRanking(player.id, 'global');
    }
    
    if (!system.getPlayerProfile(player.id)) {
      system.createPlayerProfile(player.id, player.name, player.level);
    }
    
    system.updatePlayerScore(player.id, 'power', 1000);
    system.updatePlayerScore(player.id, 'wealth', 5000);
  };

  const refreshData = () => {
    const system = getLeaderboardSystem();
    
    const lb = system.getLeaderboard(selectedType, selectedTimeFrame, selectedRegion, 100);
    setLeaderboard(lb);
    
    const rank = system.getPlayerRank(player.id, selectedType, selectedTimeFrame, selectedRegion);
    setPlayerRank(rank);
    
    const profile = system.getPlayerProfile(player.id);
    setPlayerProfile(profile);
    
    const rewards = system.getDailyRewards(player.id);
    setDailyRewards(rewards);
    
    const tiers = system.getAllTierConfigs();
    setTierConfigs(tiers);
  };

  const getTierColor = (tier: RankTier) => {
    const colors: Record<RankTier, string> = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2',
      diamond: '#B9F2FF',
      master: '#FF1493',
      grandmaster: '#8B00FF',
      legend: '#FFD700',
    };
    return colors[tier];
  };

  const getTypeIcon = (type: LeaderboardType) => {
    const icons: Record<LeaderboardType, any> = {
      power: Zap,
      pvp: Trophy,
      guild: Shield,
      seasonal: Star,
      wealth: Coins,
    };
    return icons[type];
  };

  const types: { id: LeaderboardType; label: string }[] = [
    { id: 'power', label: 'Power' },
    { id: 'pvp', label: 'PvP' },
    { id: 'guild', label: 'Guild' },
    { id: 'seasonal', label: 'Seasonal' },
    { id: 'wealth', label: 'Wealth' },
  ];

  const timeFrames: { id: TimeFrame; label: string }[] = [
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'all-time', label: 'All-Time' },
  ];

  const regions: { id: Region; label: string }[] = [
    { id: 'global', label: 'Global' },
    { id: 'north', label: 'North' },
    { id: 'central', label: 'Central' },
    { id: 'south', label: 'South' },
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 via-blue-900/20 to-gray-900">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-6 h-6" />
          Leaderboards
        </h2>
        {playerRank && (
          <p className="text-blue-100 text-sm mt-1">
            Your Rank: #{playerRank.rank} • {playerRank.tier.toUpperCase()}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-4 overflow-x-auto">
        {[
          { id: 'global' as TabType, label: 'Global', icon: Trophy },
          { id: 'regional' as TabType, label: 'Regional', icon: MapPin },
          { id: 'profile' as TabType, label: 'Profile', icon: Users },
          { id: 'rewards' as TabType, label: 'Rewards', icon: Gift },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : 'bg-gray-800/50 text-gray-400'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {(activeTab === 'global' || activeTab === 'regional') && (
            <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Filters */}
              <div className="mb-4 space-y-3">
                <div className="flex gap-2 overflow-x-auto">
                  {types.map(type => {
                    const Icon = getTypeIcon(type.id);
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold whitespace-nowrap ${
                          selectedType === type.id ? 'bg-blue-500 text-white' : 'bg-gray-800/50 text-gray-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {type.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2 overflow-x-auto">
                  {timeFrames.map(tf => (
                    <button
                      key={tf.id}
                      onClick={() => setSelectedTimeFrame(tf.id)}
                      className={`px-3 py-1 rounded-lg text-sm font-bold whitespace-nowrap ${
                        selectedTimeFrame === tf.id ? 'bg-purple-500 text-white' : 'bg-gray-800/50 text-gray-400'
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>

                {activeTab === 'regional' && (
                  <div className="flex gap-2 overflow-x-auto">
                    {regions.map(reg => (
                      <button
                        key={reg.id}
                        onClick={() => setSelectedRegion(reg.id)}
                        className={`px-3 py-1 rounded-lg text-sm font-bold whitespace-nowrap ${
                          selectedRegion === reg.id ? 'bg-green-500 text-white' : 'bg-gray-800/50 text-gray-400'
                        }`}
                      >
                        {reg.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Player's Rank Card */}
              {playerRank && (
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <Crown className="w-6 h-6 text-yellow-500" />
                      </div>
                      <div>
                        <div className="text-white font-bold">YOU</div>
                        <div className="text-yellow-400 text-sm">Rank #{playerRank.rank}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{playerRank.score.toLocaleString()}</div>
                      <div className="text-sm" style={{ color: getTierColor(playerRank.tier) }}>
                        {playerRank.tier.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Leaderboard */}
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.playerId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`bg-gray-800/50 rounded-lg p-4 border-2 ${
                      entry.playerId === player.id ? 'border-yellow-500' : 'border-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        entry.rank === 1 ? 'bg-yellow-500 text-white' :
                        entry.rank === 2 ? 'bg-gray-400 text-white' :
                        entry.rank === 3 ? 'bg-orange-700 text-white' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {entry.rank <= 3 ? <Medal className="w-6 h-6" /> : `#${entry.rank}`}
                      </div>

                      {/* Player Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">{entry.playerName}</span>
                          {entry.playerId === player.id && (
                            <span className="bg-yellow-500 text-black px-2 py-0.5 rounded text-xs font-bold">YOU</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>Lv.{entry.level}</span>
                          {entry.guildName && <span>• {entry.guildName}</span>}
                        </div>
                      </div>

                      {/* Score & Tier */}
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">{entry.score.toLocaleString()}</div>
                        <div className="text-sm font-bold" style={{ color: getTierColor(entry.tier) }}>
                          {entry.tier.toUpperCase()}
                        </div>
                      </div>

                      {/* Rank Change */}
                      {entry.rankChange !== 0 && (
                        <div className={`flex items-center gap-1 text-sm font-bold ${
                          entry.rankChange > 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {entry.rankChange > 0 ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                          {Math.abs(entry.rankChange)}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && playerProfile && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {/* Stats Overview */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Player Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-white">{playerProfile.stats.totalBattles}</div>
                    <div className="text-gray-400 text-sm">Total Battles</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-400">{playerProfile.stats.winRate.toFixed(1)}%</div>
                    <div className="text-gray-400 text-sm">Win Rate</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-yellow-400">{playerProfile.stats.totalPower}</div>
                    <div className="text-gray-400 text-sm">Total Power</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-purple-400">{playerProfile.stats.achievementsUnlocked}</div>
                    <div className="text-gray-400 text-sm">Achievements</div>
                  </div>
                </div>
              </div>

              {/* Current Ranks */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Current Rankings</h3>
                <div className="space-y-3">
                  {[
                    { type: 'power' as LeaderboardType, label: 'Power', icon: Zap, rank: playerProfile.rankings.powerRank, tier: playerProfile.rankings.powerTier },
                    { type: 'pvp' as LeaderboardType, label: 'PvP', icon: Trophy, rank: playerProfile.rankings.pvpRank, tier: playerProfile.rankings.pvpTier },
                    { type: 'guild' as LeaderboardType, label: 'Guild', icon: Shield, rank: playerProfile.rankings.guildRank, tier: playerProfile.rankings.guildTier },
                    { type: 'seasonal' as LeaderboardType, label: 'Seasonal', icon: Star, rank: playerProfile.rankings.seasonalRank, tier: playerProfile.rankings.seasonalTier },
                    { type: 'wealth' as LeaderboardType, label: 'Wealth', icon: Coins, rank: playerProfile.rankings.wealthRank, tier: playerProfile.rankings.wealthTier },
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <div key={item.type} className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-gray-400" />
                          <span className="text-white font-bold">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400">#{item.rank || 'Unranked'}</span>
                          <span className="px-2 py-1 rounded text-xs font-bold" style={{ 
                            backgroundColor: `${getTierColor(item.tier)}20`,
                            color: getTierColor(item.tier)
                          }}>
                            {item.tier.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Badges */}
              {playerProfile.badges.length > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Badges</h3>
                  <div className="flex flex-wrap gap-2">
                    {playerProfile.badges.map((badge, index) => (
                      <div key={index} className="bg-purple-500/20 border border-purple-500 px-3 py-2 rounded-lg">
                        <span className="text-purple-300 font-bold">{badge}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'rewards' && (
            <motion.div key="rewards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {/* Daily Rewards */}
              {dailyRewards && (
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Gift className="w-5 h-5" />
                    Daily Tier Rewards
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-black/30 rounded-lg p-4">
                      <Coins className="w-8 h-8 text-yellow-500 mb-2" />
                      <div className="text-3xl font-bold text-yellow-500">{dailyRewards.gold.toLocaleString()}</div>
                      <div className="text-gray-300 text-sm">Gold/Day</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-4">
                      <Star className="w-8 h-8 text-cyan-400 mb-2" />
                      <div className="text-3xl font-bold text-cyan-400">{dailyRewards.gems.toLocaleString()}</div>
                      <div className="text-gray-300 text-sm">Gems/Day</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tier Info */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Rank Tiers</h3>
                <div className="space-y-3">
                  {tierConfigs.map(tier => (
                    <div key={tier.tier} className="bg-gray-900/50 rounded-lg p-4 border-2" style={{ borderColor: tier.color }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{tier.icon}</span>
                          <div>
                            <div className="font-bold text-lg" style={{ color: tier.color }}>
                              {tier.tier.toUpperCase()}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {tier.minScore.toLocaleString()} - {tier.maxScore === Infinity ? '∞' : tier.maxScore.toLocaleString()} points
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-300">
                          <Coins className="w-4 h-4 inline mr-1 text-yellow-500" />
                          {tier.rewards.dailyGold}/day
                        </div>
                        <div className="text-gray-300">
                          <Star className="w-4 h-4 inline mr-1 text-cyan-400" />
                          {tier.rewards.dailyGems}/day
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
