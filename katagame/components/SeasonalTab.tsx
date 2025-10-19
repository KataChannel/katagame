'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Star,
  Crown,
  Sparkles,
  Gift,
  Lock,
  Unlock,
  Zap,
  Calendar,
  Target,
  TrendingUp,
  Award,
  Gem,
  Coins,
  Clock,
  Users,
  Flame,
  CheckCircle,
  ChevronRight,
  ShoppingCart,
  BarChart3,
  Flag,
  Heart,
  Shield,
  Swords,
  Home,
  Music,
  Palette,
  Image as ImageIcon,
} from 'lucide-react';
import {
  getSeasonalSystem,
  Season,
  BattlePassLevel,
  PlayerBattlePass,
  BattlePassReward,
  SeasonalQuest,
  SeasonalEvent,
  SeasonalLeaderboard,
  LimitedCosmetic,
  SEASONAL_CONFIG,
} from '@/lib/seasonalSystem';
import { useGameStore } from '@/lib/gameStore';

type SeasonalTabType = 'battle-pass' | 'quests' | 'events' | 'leaderboard' | 'cosmetics' | 'stats';

export default function SeasonalTab() {
  const { player } = useGameStore();
  const seasonalSystem = getSeasonalSystem();
  
  const [activeTab, setActiveTab] = useState<SeasonalTabType>('battle-pass');
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [battlePassLevels, setBattlePassLevels] = useState<BattlePassLevel[]>([]);
  const [playerProgress, setPlayerProgress] = useState<PlayerBattlePass | null>(null);
  const [activeQuests, setActiveQuests] = useState<SeasonalQuest[]>([]);
  const [activeEvents, setActiveEvents] = useState<SeasonalEvent[]>([]);
  const [leaderboard, setLeaderboard] = useState<SeasonalLeaderboard | null>(null);
  const [cosmetics, setCosmetics] = useState<LimitedCosmetic[]>([]);
  const [seasonStats, setSeasonStats] = useState<any>(null);
  
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [showPremiumPurchase, setShowPremiumPurchase] = useState(false);
  const [showLevelBoost, setShowLevelBoost] = useState(false);

  useEffect(() => {
    if (!player) return;
    
    // Initialize player progress
    const season = seasonalSystem.getCurrentSeason();
    if (season) {
      let progress = seasonalSystem.getPlayerProgress(player.id);
      if (!progress) {
        progress = seasonalSystem.initializePlayerBattlePass(player.id, season.id);
      }
      setPlayerProgress(progress);
    }
    
    refreshData();
    const interval = setInterval(refreshData, 3000);
    return () => clearInterval(interval);
  }, [player]);

  const refreshData = () => {
    if (!player) return;

    const season = seasonalSystem.getCurrentSeason();
    setCurrentSeason(season);

    if (season) {
      // Get battle pass levels
      const levels = (seasonalSystem as any).battlePassLevels.get(season.id) || [];
      setBattlePassLevels(levels);

      // Get player progress
      const progress = seasonalSystem.getPlayerProgress(player.id);
      setPlayerProgress(progress);

      // Get quests
      setActiveQuests(seasonalSystem.getActiveQuests(season.id));

      // Get events
      setActiveEvents(seasonalSystem.getActiveEvents(season.id));

      // Get leaderboard
      const lb = seasonalSystem.getLeaderboard(season.id, 'battle_pass_xp');
      setLeaderboard(lb);

      // Get cosmetics
      setCosmetics(seasonalSystem.getLimitedCosmetics(season.id));

      // Get stats
      const stats = seasonalSystem.getSeasonStats(season.id);
      setSeasonStats(stats);
    }
  };

  const handlePurchasePremium = () => {
    if (!player) return;

    const result = seasonalSystem.purchasePremium(player.id);
    if (result.success) {
      alert('Premium Battle Pass activated! 🎉');
      refreshData();
      setShowPremiumPurchase(false);
    } else {
      alert(result.error);
    }
  };

  const handleClaimReward = (level: number) => {
    if (!player) return;

    const result = seasonalSystem.claimRewards(player.id, level);
    if (result.success && result.rewards) {
      alert(`Claimed ${result.rewards.length} reward(s)!`);
      refreshData();
    } else {
      alert(result.error);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-orange-400';
      case 'mythic': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/20';
      case 'rare': return 'bg-blue-500/20';
      case 'epic': return 'bg-purple-500/20';
      case 'legendary': return 'bg-orange-500/20';
      case 'mythic': return 'bg-red-500/20';
      default: return 'bg-gray-500/20';
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'hero': return Users;
      case 'skin': return Palette;
      case 'emote': return Music;
      case 'banner': return Flag;
      case 'title': return Award;
      case 'currency': return Coins;
      case 'booster': return Zap;
      case 'chest': return Gift;
      case 'exclusive': return Crown;
      default: return Star;
    }
  };

  const formatTimeRemaining = (endDate: number) => {
    const diff = endDate - Date.now();
    if (diff < 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${days}d ${hours}h`;
  };

  const calculateProgress = () => {
    if (!playerProgress || battlePassLevels.length === 0) return 0;
    
    const currentLevelData = battlePassLevels[playerProgress.currentLevel - 1];
    if (!currentLevelData) return 0;
    
    const nextLevelData = battlePassLevels[playerProgress.currentLevel];
    if (!nextLevelData) return 100;
    
    const xpInCurrentLevel = playerProgress.currentXp - currentLevelData.cumulativeXp;
    const xpNeededForNext = currentLevelData.xpRequired;
    
    return Math.min((xpInCurrentLevel / xpNeededForNext) * 100, 100);
  };

  const RewardCard = ({ reward, claimed }: { reward: BattlePassReward; claimed: boolean }) => {
    const Icon = getRewardIcon(reward.type);
    
    return (
      <div className={`${getRarityBg(reward.rarity)} rounded-lg p-3 relative ${claimed ? 'opacity-50' : ''}`}>
        {claimed && (
          <div className="absolute top-1 right-1">
            <CheckCircle className="w-5 h-5 text-green-400 fill-current" />
          </div>
        )}
        
        <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <Icon className="w-7 h-7 text-white" />
        </div>
        
        <div className="text-center">
          <div className={`text-xs font-bold ${getRarityColor(reward.rarity)}`}>
            {reward.name}
          </div>
          {reward.quantity > 1 && (
            <div className="text-gray-300 text-xs">x{reward.quantity}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      {/* Season Header */}
      {currentSeason && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 mb-6 shadow-2xl"
          style={{ backgroundColor: currentSeason.backgroundColor }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-white" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white">{currentSeason.name}</h1>
                  <span className="bg-white/20 text-white text-xs px-2 py-1 rounded">
                    Season {currentSeason.number}
                  </span>
                </div>
                <p className="text-orange-100 text-sm">{currentSeason.theme}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {playerProgress?.currentLevel || 1}
                </div>
                <div className="text-orange-100 text-xs">Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {formatTimeRemaining(currentSeason.endDate)}
                </div>
                <div className="text-orange-100 text-xs">Time Left</div>
              </div>
              {playerProgress?.hasPremium && (
                <div className="flex items-center gap-2 bg-yellow-400/20 px-3 py-2 rounded-lg">
                  <Crown className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-yellow-400 font-bold text-sm">PREMIUM</span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {playerProgress && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-white text-sm mb-2">
                <span>Level {playerProgress.currentLevel}</span>
                <span>
                  {playerProgress.currentXp.toLocaleString()} / {' '}
                  {battlePassLevels[playerProgress.currentLevel]?.cumulativeXp.toLocaleString() || '0'} XP
                </span>
              </div>
              <div className="h-4 bg-black/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${calculateProgress()}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                />
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'battle-pass', label: 'Battle Pass', icon: Trophy },
          { id: 'quests', label: 'Quests', icon: Target },
          { id: 'events', label: 'Events', icon: Calendar },
          { id: 'leaderboard', label: 'Leaderboard', icon: TrendingUp },
          { id: 'cosmetics', label: 'Cosmetics', icon: Sparkles },
          { id: 'stats', label: 'Stats', icon: BarChart3 },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SeasonalTabType)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105'
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
        {/* BATTLE PASS TAB */}
        {activeTab === 'battle-pass' && (
          <motion.div
            key="battle-pass"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* Premium CTA */}
            {playerProgress && !playerProgress.hasPremium && (
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 mb-6 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Crown className="w-12 h-12 text-white fill-current" />
                    <div>
                      <h2 className="text-2xl font-bold text-white">Upgrade to Premium!</h2>
                      <p className="text-white/90">
                        +50% XP • Instant Rewards • Exclusive Cosmetics
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPremiumPurchase(true)}
                    className="bg-white text-orange-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-orange-50 transition-all"
                  >
                    {SEASONAL_CONFIG.PREMIUM_COST_GEMS} 💎
                  </button>
                </div>
              </div>
            )}

            {/* Battle Pass Levels */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Battle Pass Rewards</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLevelBoost(true)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Zap className="w-5 h-5" />
                    Buy Levels
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {battlePassLevels.slice(0, 20).map(level => {
                  const isUnlocked = playerProgress && playerProgress.currentLevel >= level.level;
                  const isCurrent = playerProgress?.currentLevel === level.level;
                  const freeClaimed = playerProgress?.claimedFreeRewards.has(level.level);
                  const premiumClaimed = playerProgress?.claimedPremiumRewards.has(level.level);

                  return (
                    <div
                      key={level.level}
                      className={`rounded-xl p-4 border-2 transition-all ${
                        isCurrent
                          ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500'
                          : isUnlocked
                          ? 'bg-green-500/10 border-green-500/50'
                          : 'bg-black/30 border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-2xl ${
                          level.specialMilestone
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white'
                            : isUnlocked
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-600 text-gray-300'
                        }`}>
                          {level.level}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-bold">Level {level.level}</span>
                            {level.specialMilestone && (
                              <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded font-bold flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current" />
                                MILESTONE
                              </span>
                            )}
                          </div>
                          <div className="text-gray-300 text-sm">
                            {level.xpRequired.toLocaleString()} XP Required
                          </div>
                        </div>

                        {isUnlocked && (
                          <button
                            onClick={() => handleClaimReward(level.level)}
                            disabled={freeClaimed && (premiumClaimed || !playerProgress?.hasPremium)}
                            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold"
                          >
                            {freeClaimed && premiumClaimed ? 'Claimed' : 'Claim'}
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Free Rewards */}
                        <div>
                          <div className="text-gray-400 text-xs mb-2 flex items-center gap-1">
                            <Gift className="w-4 h-4" />
                            Free Rewards
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {level.freeRewards.map(reward => (
                              <RewardCard key={reward.id} reward={reward} claimed={!!freeClaimed} />
                            ))}
                            {level.freeRewards.length === 0 && (
                              <div className="text-gray-500 text-xs col-span-3 text-center py-4">
                                No free rewards
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Premium Rewards */}
                        <div className={!playerProgress?.hasPremium ? 'opacity-50' : ''}>
                          <div className="text-yellow-400 text-xs mb-2 flex items-center gap-1">
                            <Crown className="w-4 h-4 fill-current" />
                            Premium Rewards
                          </div>
                          <div className="grid grid-cols-3 gap-2 relative">
                            {!playerProgress?.hasPremium && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                                <Lock className="w-8 h-8 text-white" />
                              </div>
                            )}
                            {level.premiumRewards.map(reward => (
                              <RewardCard key={reward.id} reward={reward} claimed={!!premiumClaimed} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* QUESTS TAB */}
        {activeTab === 'quests' && (
          <motion.div
            key="quests"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">
              Daily Quests ({activeQuests.filter(q => q.type === 'daily').length})
            </h2>

            <div className="space-y-4">
              {activeQuests.map(quest => {
                const progressPercent = quest.objectives.length > 0
                  ? (quest.objectives.filter(o => o.completed).length / quest.objectives.length) * 100
                  : 0;

                return (
                  <div key={quest.id} className="bg-black/30 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-white font-bold flex items-center gap-2">
                          {quest.title}
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            quest.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                            quest.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            quest.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' :
                            'bg-purple-500/20 text-purple-400'
                          }`}>
                            {quest.difficulty.toUpperCase()}
                          </span>
                        </h3>
                        <p className="text-gray-300 text-sm mt-1">{quest.description}</p>
                      </div>

                      <div className="text-right">
                        <div className="text-yellow-400 font-bold">+{quest.xpReward} XP</div>
                        <div className="text-blue-400 text-sm">+{quest.seasonPointsReward} SP</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {quest.objectives.map((obj, index) => (
                        <div key={index}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-300">{obj.description}</span>
                            <span className="text-white font-bold">
                              {obj.current} / {obj.target}
                            </span>
                          </div>
                          <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-400 to-blue-400 rounded-full"
                              style={{ width: `${(obj.current / obj.target) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {quest.isCompleted && (
                      <div className="mt-3 flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-5 h-5 fill-current" />
                        <span className="font-bold">Completed!</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {activeQuests.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No active quests</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* EVENTS TAB */}
        {activeTab === 'events' && (
          <motion.div
            key="events"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">
              Special Events ({activeEvents.length})
            </h2>

            <div className="grid gap-4">
              {activeEvents.map(event => (
                <div key={event.id} className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border-2 border-purple-500">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Flame className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{event.name}</h3>
                        <p className="text-purple-200">{event.theme}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-yellow-400 font-bold">
                        {formatTimeRemaining(event.endTime)}
                      </div>
                      <div className="text-purple-200 text-sm">Time Left</div>
                    </div>
                  </div>

                  <p className="text-white mb-4">{event.description}</p>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-black/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-yellow-400">
                        {event.bonusMultipliers.xp}x
                      </div>
                      <div className="text-gray-300 text-sm">XP Boost</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {event.bonusMultipliers.gold}x
                      </div>
                      <div className="text-gray-300 text-sm">Gold Boost</div>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {event.totalParticipants}
                      </div>
                      <div className="text-gray-300 text-sm">Participants</div>
                    </div>
                  </div>

                  <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-bold hover:from-purple-600 hover:to-pink-600">
                    Join Event
                  </button>
                </div>
              ))}

              {activeEvents.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No active events</p>
                  <p className="text-sm mt-2">Check back soon for special seasonal events!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && leaderboard && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">
              Season Leaderboard - Top 100
            </h2>

            <div className="space-y-2">
              {leaderboard.entries.slice(0, 50).map((entry, index) => {
                const isPlayer = entry.playerId === player?.id;

                return (
                  <div
                    key={entry.playerId}
                    className={`rounded-lg p-4 flex items-center justify-between ${
                      isPlayer ? 'bg-purple-500/30 border-2 border-purple-500' : 'bg-black/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800' :
                        index === 2 ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {entry.rank}
                      </div>

                      <div>
                        <div className="text-white font-bold flex items-center gap-2">
                          {entry.playerName}
                          {isPlayer && (
                            <span className="text-xs bg-purple-500 px-2 py-0.5 rounded">YOU</span>
                          )}
                          {entry.hasPremium && (
                            <Crown className="w-4 h-4 text-yellow-400 fill-current" />
                          )}
                        </div>
                        <div className="text-gray-300 text-sm">Level {entry.level}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-yellow-400 font-bold text-lg">
                        {entry.score.toLocaleString()}
                      </div>
                      <div className="text-gray-400 text-xs">Total XP</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* COSMETICS TAB */}
        {activeTab === 'cosmetics' && (
          <motion.div
            key="cosmetics"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">
              Limited Cosmetics
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cosmetics.map(cosmetic => (
                <div key={cosmetic.id} className={`${getRarityBg(cosmetic.rarity)} rounded-xl p-4 border-2 ${
                  cosmetic.rarity === 'legendary' ? 'border-orange-500' : 'border-white/10'
                }`}>
                  <div className="w-full h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mb-3 flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-bold ${getRarityColor(cosmetic.rarity)}`}>
                        {cosmetic.name}
                      </h3>
                      {cosmetic.exclusive && (
                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                          EXCLUSIVE
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{cosmetic.description}</p>

                    {cosmetic.battlePassLevel && (
                      <div className="text-yellow-400 text-sm">
                        Unlock at Level {cosmetic.battlePassLevel}
                      </div>
                    )}

                    {cosmetic.purchasable && cosmetic.cost && (
                      <button className="w-full mt-3 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-bold">
                        Buy - {cosmetic.cost} 💎
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* STATS TAB */}
        {activeTab === 'stats' && seasonStats && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6">Season Statistics</h2>

            <div className="grid grid-cols-4 gap-6 mb-6">
              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Total Players</div>
                <div className="text-3xl font-bold text-white">{seasonStats.totalPlayers}</div>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Premium Owners</div>
                <div className="text-3xl font-bold text-yellow-400">{seasonStats.premiumOwners}</div>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Avg Level</div>
                <div className="text-3xl font-bold text-green-400">
                  {Math.floor(seasonStats.averageLevel)}
                </div>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Max Level</div>
                <div className="text-3xl font-bold text-purple-400">{seasonStats.maxLevelReached}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-3">Level Milestones</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white">Level 50 Reached</span>
                    <span className="text-green-400 font-bold">{seasonStats.level50Reached}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">Level 100 Reached</span>
                    <span className="text-purple-400 font-bold">{seasonStats.level100Reached}</span>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-3">Conversion Rate</div>
                <div className="text-3xl font-bold text-yellow-400">
                  {seasonStats.premiumConversionRate.toFixed(1)}%
                </div>
                <div className="text-gray-300 text-sm mt-2">
                  Free to Premium conversion
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
