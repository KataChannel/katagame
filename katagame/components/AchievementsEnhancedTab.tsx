'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Award, Crown, Star, Target, Lock, Unlock, 
  TrendingUp, Filter, Search, Check, X, Flame,
  Sword, Users2, Coins, Book, Map, Shield, Zap,
  Gift, Sparkles, Clock, Medal, Flag, ChevronRight,
  Eye, EyeOff, Grid3x3, List, BarChart3, CheckCircle2
} from 'lucide-react';
import { getAchievementSystem, Achievement, Title, AchievementCategory, AchievementStats } from '@/lib/achievementSystem';
import { useGameStore } from '@/lib/gameStore';

type AchievementTabType = 'all' | 'in-progress' | 'completed' | 'titles' | 'stats' | 'milestones';

export default function AchievementsEnhancedTab() {
  const { player } = useGameStore();
  const [activeTab, setActiveTab] = useState<AchievementTabType>('all');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filteredAchievements, setFilteredAchievements] = useState<Achievement[]>([]);
  const [titles, setTitles] = useState<Title[]>([]);
  const [unlockedTitles, setUnlockedTitles] = useState<Title[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHidden, setShowHidden] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [equippedTitle, setEquippedTitle] = useState<string | undefined>();

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 3000);
    return () => clearInterval(interval);
  }, [player.id]);

  const refreshData = () => {
    const system = getAchievementSystem();
    
    // Initialize player progress if needed
    if (!system.getPlayerProgress(player.id)) {
      system.initializePlayerProgress(player.id);
    }
    
    const allAchievements = system.getAllAchievements();
    setAchievements(allAchievements);
    
    const allTitles = system.getAllTitles();
    setTitles(allTitles);
    
    const playerUnlockedTitles = system.getUnlockedTitles(player.id);
    setUnlockedTitles(playerUnlockedTitles);
    
    const playerStats = system.getPlayerStats(player.id);
    setStats(playerStats);
    
    const allMilestones = system.getMilestones();
    setMilestones(allMilestones);
    
    const progress = system.getPlayerProgress(player.id);
    setEquippedTitle(progress?.equippedTitleId);
    
    // Apply filters
    applyFilters(allAchievements);
  };

  const applyFilters = (achievementList: Achievement[]) => {
    let filtered = achievementList;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }
    
    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by tab
    const progress = getAchievementSystem().getPlayerProgress(player.id);
    if (progress) {
      if (activeTab === 'in-progress') {
        filtered = filtered.filter(a => {
          const ap = progress.achievements.get(a.id);
          return ap && !ap.isUnlocked && ap.progress > 0;
        });
      } else if (activeTab === 'completed') {
        filtered = filtered.filter(a => {
          const ap = progress.achievements.get(a.id);
          return ap && ap.isUnlocked;
        });
      }
    }
    
    // Filter hidden
    if (!showHidden) {
      filtered = filtered.filter(a => !a.isHidden && !a.isSecret);
    }
    
    setFilteredAchievements(filtered);
  };

  useEffect(() => {
    applyFilters(achievements);
  }, [selectedCategory, searchQuery, activeTab, showHidden, achievements]);

  const handleClaimReward = (achievementId: string) => {
    const system = getAchievementSystem();
    const rewards = system.claimRewards(player.id, achievementId);
    if (rewards) {
      alert(`Claimed rewards: ${rewards.gold} gold, ${rewards.gems} gems, ${rewards.exp} EXP!`);
      refreshData();
    }
  };

  const handleEquipTitle = (titleId: string) => {
    const system = getAchievementSystem();
    if (system.equipTitle(player.id, titleId)) {
      setEquippedTitle(titleId);
      alert('Title equipped successfully!');
    }
  };

  const handleClaimMilestone = (points: number) => {
    const system = getAchievementSystem();
    const rewards = system.claimMilestone(player.id, points);
    if (rewards) {
      alert(`Milestone claimed! +${rewards.gold} gold, +${rewards.gems} gems`);
      refreshData();
    }
  };

  const getCategoryIcon = (category: AchievementCategory) => {
    const icons = {
      combat: Sword,
      heroes: Crown,
      resources: Coins,
      culture: Book,
      social: Users2,
      exploration: Map,
      pvp: Trophy,
      pve: Target,
      collection: Gift,
      mastery: Star,
      seasonal: Sparkles,
      secret: Eye,
    };
    return icons[category];
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: '#9E9E9E',
      rare: '#2196F3',
      epic: '#9C27B0',
      legendary: '#FF9800',
      mythic: '#F44336',
    };
    return colors[rarity as keyof typeof colors] || '#9E9E9E';
  };

  const getRarityBg = (rarity: string) => {
    const colors = {
      common: 'bg-gray-500/10',
      rare: 'bg-blue-500/10',
      epic: 'bg-purple-500/10',
      legendary: 'bg-orange-500/10',
      mythic: 'bg-red-500/10',
    };
    return colors[rarity as keyof typeof colors] || 'bg-gray-500/10';
  };

  const getTierBadge = (tier: string) => {
    const colors = {
      bronze: 'bg-orange-700 text-orange-100',
      silver: 'bg-gray-400 text-gray-900',
      gold: 'bg-yellow-500 text-yellow-900',
      platinum: 'bg-gray-300 text-gray-800',
      diamond: 'bg-cyan-400 text-cyan-900',
    };
    return colors[tier as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const getProgressPercentage = (achievementId: string): number => {
    const progress = getAchievementSystem().getPlayerProgress(player.id);
    if (!progress) return 0;
    
    const ap = progress.achievements.get(achievementId);
    if (!ap) return 0;
    
    return (ap.progress / ap.maxProgress) * 100;
  };

  const isUnlocked = (achievementId: string): boolean => {
    const progress = getAchievementSystem().getPlayerProgress(player.id);
    if (!progress) return false;
    
    const ap = progress.achievements.get(achievementId);
    return ap?.isUnlocked || false;
  };

  const isRewardClaimed = (achievementId: string): boolean => {
    const progress = getAchievementSystem().getPlayerProgress(player.id);
    if (!progress) return false;
    
    const ap = progress.achievements.get(achievementId);
    return ap?.isRewardClaimed || false;
  };

  const tabs: { id: AchievementTabType; label: string; icon: any }[] = [
    { id: 'all', label: 'All', icon: Grid3x3 },
    { id: 'in-progress', label: 'In Progress', icon: TrendingUp },
    { id: 'completed', label: 'Completed', icon: CheckCircle2 },
    { id: 'titles', label: 'Titles', icon: Crown },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'milestones', label: 'Milestones', icon: Flag },
  ];

  const categories: { id: AchievementCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'combat', label: 'Combat' },
    { id: 'heroes', label: 'Heroes' },
    { id: 'resources', label: 'Resources' },
    { id: 'culture', label: 'Culture' },
    { id: 'social', label: 'Social' },
    { id: 'exploration', label: 'Exploration' },
    { id: 'pvp', label: 'PvP' },
    { id: 'pve', label: 'PvE' },
    { id: 'collection', label: 'Collection' },
    { id: 'mastery', label: 'Mastery' },
    { id: 'seasonal', label: 'Seasonal' },
    { id: 'secret', label: 'Secret' },
  ];

  const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
    const progress = getProgressPercentage(achievement.id);
    const unlocked = isUnlocked(achievement.id);
    const rewardClaimed = isRewardClaimed(achievement.id);
    const CategoryIcon = getCategoryIcon(achievement.category);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`relative bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border-2 transition-all hover:scale-105 ${
          unlocked ? 'border-green-500/50' : 'border-gray-700/50'
        } ${achievement.rarity === 'mythic' ? 'shadow-lg shadow-red-500/20' : ''}`}
        style={{ borderColor: unlocked ? getRarityColor(achievement.rarity) : undefined }}
      >
        {/* Rarity badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${getRarityBg(achievement.rarity)}`}
          style={{ color: getRarityColor(achievement.rarity) }}>
          {achievement.rarity.toUpperCase()}
        </div>

        {/* Icon & Title */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-12 h-12 rounded-full ${unlocked ? getRarityBg(achievement.rarity) : 'bg-gray-700'} 
            flex items-center justify-center text-2xl relative`}>
            {achievement.isHidden && !unlocked ? '?' : achievement.icon}
            {unlocked && (
              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h4 className="text-white font-bold flex items-center gap-2">
              {achievement.isHidden && !unlocked ? '???' : achievement.name}
              <CategoryIcon className="w-4 h-4 text-gray-400" />
            </h4>
            <p className="text-gray-400 text-sm mt-1">
              {achievement.isHidden && !unlocked ? 'Hidden achievement' : achievement.description}
            </p>
          </div>
        </div>

        {/* Tier Badge */}
        <div className={`inline-block px-2 py-1 rounded text-xs font-bold mb-2 ${getTierBadge(achievement.tier)}`}>
          {achievement.tier.toUpperCase()}
        </div>

        {/* Progress Bar */}
        {!unlocked && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Rewards */}
        <div className="flex items-center gap-3 text-sm mb-3">
          <div className="flex items-center gap-1">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-500 font-bold">{achievement.points}</span>
          </div>
          {achievement.rewards.gold && (
            <div className="flex items-center gap-1">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="text-gray-300">{achievement.rewards.gold.toLocaleString()}</span>
            </div>
          )}
          {achievement.rewards.gems && (
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-gray-300">{achievement.rewards.gems}</span>
            </div>
          )}
        </div>

        {/* Unlock Stats */}
        {achievement.unlockRate > 0 && (
          <div className="text-xs text-gray-500 mb-2">
            {achievement.unlockRate.toFixed(2)}% of players unlocked
          </div>
        )}

        {/* Action Button */}
        {unlocked && !rewardClaimed && (
          <button
            onClick={() => handleClaimReward(achievement.id)}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-lg font-bold
              hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            <Gift className="w-4 h-4" />
            Claim Rewards
          </button>
        )}

        {unlocked && rewardClaimed && (
          <div className="w-full bg-gray-700 text-gray-400 py-2 rounded-lg text-center font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Claimed
          </div>
        )}

        {!unlocked && progress >= 80 && (
          <div className="flex items-center gap-2 text-yellow-500 text-sm">
            <Flame className="w-4 h-4" />
            <span className="font-bold">Almost there!</span>
          </div>
        )}
      </motion.div>
    );
  };

  const TitleCard = ({ title }: { title: Title }) => {
    const isUnlocked = unlockedTitles.some(t => t.id === title.id);
    const isEquipped = equippedTitle === title.id;

    return (
      <motion.div
        layout
        className={`relative bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border-2 transition-all hover:scale-105 ${
          isEquipped ? 'border-yellow-500 shadow-lg shadow-yellow-500/20' : isUnlocked ? 'border-green-500/50' : 'border-gray-700/50'
        }`}
      >
        {isEquipped && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
            <Star className="w-3 h-3" />
            EQUIPPED
          </div>
        )}

        <div className="flex items-center gap-3 mb-3">
          <div className={`w-12 h-12 rounded-full ${isUnlocked ? getRarityBg(title.rarity) : 'bg-gray-700'} 
            flex items-center justify-center relative`}>
            <Crown className="w-6 h-6" style={{ color: isUnlocked ? title.color : '#666' }} />
            {!isUnlocked && (
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                <Lock className="w-4 h-4 text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h4 className="font-bold" style={{ color: isUnlocked ? title.color : '#999' }}>
              {title.displayName}
            </h4>
            <p className="text-gray-400 text-sm">{title.name}</p>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-3">{title.description}</p>

        <div className={`inline-block px-2 py-1 rounded text-xs font-bold mb-3 ${getRarityBg(title.rarity)}`}
          style={{ color: getRarityColor(title.rarity) }}>
          {title.rarity.toUpperCase()}
        </div>

        {title.unlockRate > 0 && (
          <div className="text-xs text-gray-500 mb-2">
            {title.unlockRate.toFixed(2)}% of players own this
          </div>
        )}

        {isUnlocked && !isEquipped && (
          <button
            onClick={() => handleEquipTitle(title.id)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-2 rounded-lg font-bold
              hover:from-purple-600 hover:to-pink-700 transition-all"
          >
            Equip Title
          </button>
        )}

        {!isUnlocked && (
          <div className="w-full bg-gray-700 text-gray-400 py-2 rounded-lg text-center font-bold flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            Locked
          </div>
        )}

        {title.isExclusive && (
          <div className="mt-2 flex items-center gap-2 text-red-400 text-xs">
            <Sparkles className="w-3 h-3" />
            <span className="font-bold">EXCLUSIVE</span>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-6 h-6" />
              Achievements
            </h2>
            {stats && (
              <p className="text-purple-100 text-sm mt-1">
                {stats.unlockedAchievements}/{stats.totalAchievements} Unlocked • {stats.totalPoints} Points
              </p>
            )}
          </div>
          
          {equippedTitle && (
            <div className="bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg">
              <div className="text-xs text-purple-200">Current Title</div>
              <div className="font-bold" style={{ color: titles.find(t => t.id === equippedTitle)?.color }}>
                {titles.find(t => t.id === equippedTitle)?.displayName}
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {stats && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-purple-100 mb-1">
              <span>Overall Progress</span>
              <span>{stats.completionRate.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                initial={{ width: 0 }}
                animate={{ width: `${stats.completionRate}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-4 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {/* All / In Progress / Completed Tabs */}
          {(activeTab === 'all' || activeTab === 'in-progress' || activeTab === 'completed') && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Filters */}
              <div className="mb-4 space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search achievements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white
                      focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap text-sm transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* View Options */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowHidden(!showHidden)}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {showHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {showHidden ? 'Hide' : 'Show'} Hidden
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400'}`}
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Achievements Grid/List */}
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-3'
              }>
                {filteredAchievements.map(achievement => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>

              {filteredAchievements.length === 0 && (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No achievements found</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Titles Tab */}
          {activeTab === 'titles' && (
            <motion.div
              key="titles"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-2">Your Titles</h3>
                <p className="text-gray-400 text-sm">
                  {unlockedTitles.length}/{titles.length} Titles Unlocked
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {titles.map(title => (
                  <TitleCard key={title.id} title={title} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && stats && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Overview */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Overview
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-white">{stats.unlockedAchievements}</div>
                    <div className="text-gray-400 text-sm">Unlocked</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-purple-400">{stats.totalPoints}</div>
                    <div className="text-gray-400 text-sm">Points</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-green-400">{stats.completionRate.toFixed(1)}%</div>
                    <div className="text-gray-400 text-sm">Completion</div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-yellow-400">{unlockedTitles.length}</div>
                    <div className="text-gray-400 text-sm">Titles</div>
                  </div>
                </div>
              </div>

              {/* Category Progress */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Category Progress</h3>
                <div className="space-y-3">
                  {Array.from(stats.categoryCompletion.entries()).map(([category, count]) => {
                    const CategoryIcon = getCategoryIcon(category);
                    const total = achievements.filter(a => a.category === category).length;
                    const percentage = (count / total) * 100;
                    
                    return (
                      <div key={category}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 text-white">
                            <CategoryIcon className="w-4 h-4" />
                            <span className="capitalize">{category}</span>
                          </div>
                          <span className="text-gray-400 text-sm">{count}/{total}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Unlocks */}
              <div className="bg-gray-800/50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Unlocks
                </h3>
                <div className="space-y-2">
                  {stats.recentUnlocks.map(achievement => (
                    <div key={achievement.id} className="flex items-center gap-3 bg-gray-900/50 rounded-lg p-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="text-white font-bold">{achievement.name}</div>
                        <div className="text-gray-400 text-sm">{achievement.description}</div>
                      </div>
                      <div className="text-yellow-500 font-bold">+{achievement.points}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Near Completion */}
              {stats.nearCompletion.length > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    Almost There!
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {stats.nearCompletion.map(achievement => (
                      <div key={achievement.id} className="bg-gray-900/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-xl">{achievement.icon}</div>
                          <div className="text-white font-bold text-sm">{achievement.name}</div>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                            style={{ width: `${getProgressPercentage(achievement.id)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Milestones Tab */}
          {activeTab === 'milestones' && (
            <motion.div
              key="milestones"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-2">Point Milestones</h3>
                <p className="text-gray-400 text-sm">
                  Earn points by unlocking achievements and claim milestone rewards
                </p>
              </div>

              <div className="space-y-4">
                {milestones.map((milestone, index) => {
                  const progress = getAchievementSystem().getPlayerProgress(player.id);
                  const isClaimed = progress?.milestoneRewards.get(milestone.points) || false;
                  const canClaim = (stats?.totalPoints || 0) >= milestone.points && !isClaimed;
                  const isLocked = (stats?.totalPoints || 0) < milestone.points;

                  return (
                    <div 
                      key={milestone.points}
                      className={`bg-gray-800/50 rounded-lg p-6 border-2 transition-all ${
                        isClaimed ? 'border-green-500/50' : canClaim ? 'border-yellow-500 shadow-lg shadow-yellow-500/20' : 'border-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            isClaimed ? 'bg-green-500/20' : canClaim ? 'bg-yellow-500/20' : 'bg-gray-700'
                          }`}>
                            <Flag className={`w-6 h-6 ${
                              isClaimed ? 'text-green-500' : canClaim ? 'text-yellow-500' : 'text-gray-500'
                            }`} />
                          </div>
                          <div>
                            <h4 className="text-white font-bold text-lg">{milestone.points} Points</h4>
                            <p className="text-gray-400 text-sm">Milestone {index + 1}</p>
                          </div>
                        </div>

                        {isClaimed && (
                          <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Claimed
                          </div>
                        )}

                        {canClaim && (
                          <button
                            onClick={() => handleClaimMilestone(milestone.points)}
                            className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-6 py-2 rounded-lg font-bold
                              hover:from-yellow-600 hover:to-orange-700 transition-all flex items-center gap-2"
                          >
                            <Gift className="w-4 h-4" />
                            Claim
                          </button>
                        )}

                        {isLocked && (
                          <div className="bg-gray-700 text-gray-400 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Locked
                          </div>
                        )}
                      </div>

                      {/* Rewards */}
                      <div className="bg-gray-900/50 rounded-lg p-4">
                        <div className="text-sm text-gray-400 mb-2">Rewards:</div>
                        <div className="flex flex-wrap gap-3">
                          <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded">
                            <Coins className="w-5 h-5 text-yellow-500" />
                            <span className="text-white font-bold">{milestone.rewards.gold.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded">
                            <Sparkles className="w-5 h-5 text-cyan-400" />
                            <span className="text-white font-bold">{milestone.rewards.gems}</span>
                          </div>
                          {milestone.rewards.titleId && (
                            <div className="flex items-center gap-2 bg-purple-900/30 px-3 py-2 rounded">
                              <Crown className="w-5 h-5 text-purple-400" />
                              <span className="text-purple-300 font-bold">Exclusive Title</span>
                            </div>
                          )}
                          {milestone.rewards.specialReward && (
                            <div className="flex items-center gap-2 bg-red-900/30 px-3 py-2 rounded">
                              <Sparkles className="w-5 h-5 text-red-400" />
                              <span className="text-red-300 font-bold">{milestone.rewards.specialReward}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
