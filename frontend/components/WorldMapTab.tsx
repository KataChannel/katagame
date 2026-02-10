'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map as MapIcon, Swords, Trophy, Gift, Clock, Zap, Star, ChevronRight,
  ChevronLeft, Target, Award, Flame, Droplet, Mountain, Shield,
  Leaf, Lock, CheckCircle, Play, Pause, RotateCw, TrendingUp,
  Package, Sparkles, Crown, AlertCircle, List
} from 'lucide-react';
import InteractiveVietnamMap from './InteractiveVietnamMap';
import { useGameStore } from '@/lib/gameStore';
import {
  updateStamina,
  formatStaminaTime,
  getTimeUntilFullStamina,
  getRarityColor,
  getRarityGradient,
  calculateLootValue,
  getExpeditionProgress,
  type WorldProvince,
  type ProvinceBoss,
  type Expedition,
  type ExpeditionRun,
  type LootDrop,
  type BossDifficulty,
} from '@/lib/worldMapSystem';

type SubTab = 'map' | 'expeditions' | 'bosses' | 'loot';

export default function WorldMapTab() {
  const {
    player,
    heroes = [],
    worldMapState,
    initializeWorldMap,
    travelToProvince: onTravelToProvince,
    challengeBoss: onChallengeBoss,
    startExpedition: onStartExpedition,
    completeExpedition: onCompleteExpedition,
  } = useGameStore();

  const [activeSubTab, setActiveSubTab] = useState<SubTab>('map');
  const [selectedProvince, setSelectedProvince] = useState<WorldProvince | null>(null);
  const [selectedExpedition, setSelectedExpedition] = useState<Expedition | null>(null);
  const [selectedHeroes, setSelectedHeroes] = useState<string[]>([]);
  const [autoMode, setAutoMode] = useState(false);
  const [showBattleModal, setShowBattleModal] = useState(false);
  const [battleResult, setBattleResult] = useState<{
    type: 'boss' | 'expedition';
    result: 'victory' | 'defeat';
    rewards: LootDrop[];
  } | null>(null);

  // Initialize world map
  useEffect(() => {
    if (!worldMapState) {
      initializeWorldMap();
    }
  }, [worldMapState, initializeWorldMap]);

  // Update stamina every minute
  useEffect(() => {
    const interval = setInterval(() => {
      if (worldMapState) {
        const updatedStamina = updateStamina(worldMapState.stamina);
        // Would need a method to update just stamina
      }
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [worldMapState]);

  if (!worldMapState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900">
        <div className="text-center">
          <MapIcon className="w-16 h-16 mx-auto text-white animate-pulse" />
          <p className="mt-4 text-xl text-white">Đang Tải Bản Đồ...</p>
        </div>
      </div>
    );
  }

  const stamina = updateStamina(worldMapState.stamina);
  const staminaPercent = (stamina.current / stamina.max) * 100;
  const timeUntilFull = getTimeUntilFullStamina(stamina);
  const expeditionProgress = getExpeditionProgress(worldMapState);

  const currentProvince = worldMapState.provinces.find(
    (p: any) => p.id === worldMapState.currentProvince
  );

  const getElementIcon = (element: string) => {
    switch (element) {
      case 'fire': return <Flame className="w-4 h-4" />;
      case 'water': return <Droplet className="w-4 h-4" />;
      case 'earth': return <Mountain className="w-4 h-4" />;
      case 'metal': return <Shield className="w-4 h-4" />;
      case 'wood': return <Leaf className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getElementEmoji = (element: string) => {
    switch (element) {
      case 'fire': return '🔥';
      case 'water': return '💧';
      case 'earth': return '⛰️';
      case 'metal': return '⚔️';
      case 'wood': return '🌲';
      default: return '⭐';
    }
  };

  const getDifficultyColor = (difficulty: BossDifficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'normal': return 'text-blue-400';
      case 'hard': return 'text-orange-400';
      case 'nightmare': return 'text-red-400';
    }
  };

  const handleProvinceClick = (province: WorldProvince) => {
    if (province.status === 'locked') {
      // Show unlock requirements
      return;
    }
    setSelectedProvince(province);
    onTravelToProvince(province.id);
  };

  const handleBossChallenge = (boss: ProvinceBoss) => {
    if (selectedHeroes.length === 0) {
      // Show error - need to select heroes
      return;
    }

    const heroObjects = heroes.filter((h: any) => selectedHeroes.includes(h.id));
    const result = onChallengeBoss(selectedProvince!.id, heroObjects);

    if (result.success) {
      setBattleResult({
        type: 'boss',
        result: result.result!,
        rewards: result.rewards || [],
      });
      setShowBattleModal(true);
    }
  };

  const handleStartExpedition = () => {
    if (!selectedExpedition || selectedHeroes.length === 0) {
      return;
    }

    const heroObjects = heroes.filter((h: any) => selectedHeroes.includes(h.id));
    const result = onStartExpedition(selectedExpedition.floor, heroObjects, autoMode);

    if (result.success) {
      // Expedition started - auto-complete after delay if auto mode
      if (autoMode) {
        setTimeout(() => {
          handleCompleteExpedition();
        }, 3000); // 3 seconds for demo
      }
    }
  };

  const handleCompleteExpedition = () => {
    const heroObjects = heroes.filter((h: any) => selectedHeroes.includes(h.id));
    const result = onCompleteExpedition(heroObjects);

    if (result.success) {
      setBattleResult({
        type: 'expedition',
        result: result.result!,
        rewards: result.rewards || [],
      });
      setShowBattleModal(true);
      setSelectedExpedition(null);
    }
  };

  const toggleHeroSelection = (heroId: string) => {
    if (selectedHeroes.includes(heroId)) {
      setSelectedHeroes(selectedHeroes.filter((id) => id !== heroId));
    } else if (selectedHeroes.length < 3) {
      setSelectedHeroes([...selectedHeroes, heroId]);
    }
  };

  const subNavItems = [
    { key: 'map' as SubTab, label: 'Bản Đồ', icon: MapIcon },
    { key: 'expeditions' as SubTab, label: 'Thám Hiểm', icon: Swords },
    { key: 'bosses' as SubTab, label: 'Boss', icon: Trophy },
    { key: 'loot' as SubTab, label: 'Phần Thưởng', icon: Gift },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900 pb-24">
      {/* Battle Result Modal */}
      <AnimatePresence>
        {showBattleModal && battleResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-gray-900 rounded-xl shadow-2xl overflow-hidden"
            >
              <div
                className={`p-6 text-center ${
                  battleResult.result === 'victory'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                    : 'bg-gradient-to-r from-gray-600 to-gray-700'
                }`}
              >
                <div className="text-6xl mb-2">
                  {battleResult.result === 'victory' ? '🎉' : '😔'}
                </div>
                <h3 className="text-2xl font-bold text-white">
                  {battleResult.result === 'victory' ? 'Chiến Thắng!' : 'Thất Bại'}
                </h3>
              </div>

              <div className="p-6">
                {battleResult.rewards.length > 0 ? (
                  <>
                    <p className="text-gray-300 mb-4">Phần Thưởng Nhận Được:</p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {battleResult.rewards.map((loot, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRarityGradient(
                                loot.rarity
                              )} flex items-center justify-center`}
                            >
                              <span className="text-lg">{getRewardEmoji(loot.type)}</span>
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {loot.itemName || loot.type}
                              </p>
                              <p className="text-xs text-gray-400 capitalize">{loot.rarity}</p>
                            </div>
                          </div>
                          <p className="text-lg font-bold text-white">×{loot.quantity}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-400 text-center py-4">Không nhận được phần thưởng</p>
                )}

                <button
                  onClick={() => {
                    setShowBattleModal(false);
                    setBattleResult(null);
                  }}
                  className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <MapIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Bản Đồ Việt Nam</h2>
              <p className="text-green-100 text-sm">
                {currentProvince ? currentProvince.name : '63 Tỉnh Thành'}
              </p>
            </div>
          </div>
        </div>

        {/* Stamina Bar */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-300" />
              <span className="text-white font-semibold">Stamina</span>
            </div>
            <span className="text-white font-bold">
              {stamina.current} / {stamina.max}
            </span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${staminaPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          {stamina.current < stamina.max && (
            <p className="text-xs text-gray-200 mt-2 text-center">
              <Clock className="w-3 h-3 inline mr-1" />
              Đầy trong {formatStaminaTime(timeUntilFull)}
            </p>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-300" />
            <p className="text-2xl font-bold text-white">
              {worldMapState.completedProvinces.length}
            </p>
            <p className="text-xs text-gray-200">Tỉnh Hoàn Thành</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-300" />
            <p className="text-2xl font-bold text-white">
              {Object.keys(worldMapState.bossVictories).length}
            </p>
            <p className="text-xs text-gray-200">Boss Đánh Bại</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-blue-300" />
            <p className="text-2xl font-bold text-white">{expeditionProgress}%</p>
            <p className="text-xs text-gray-200">Tiến Độ Thám Hiểm</p>
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeSubTab === 'map' && (
          <MapTab
            provinces={worldMapState.provinces}
            currentProvince={worldMapState.currentProvince}
            onProvinceClick={handleProvinceClick}
            getElementEmoji={getElementEmoji}
          />
        )}

        {activeSubTab === 'expeditions' && (
          <ExpeditionsTab
            expeditions={worldMapState.expeditions}
            currentExpedition={worldMapState.currentExpedition}
            stamina={stamina}
            heroes={heroes}
            selectedHeroes={selectedHeroes}
            autoMode={autoMode}
            onToggleHero={toggleHeroSelection}
            onToggleAutoMode={() => setAutoMode(!autoMode)}
            onSelectExpedition={setSelectedExpedition}
            selectedExpedition={selectedExpedition}
            onStartExpedition={handleStartExpedition}
            onCompleteExpedition={handleCompleteExpedition}
            getElementEmoji={getElementEmoji}
          />
        )}

        {activeSubTab === 'bosses' && (
          <BossesTab
            provinces={worldMapState.provinces}
            bossVictories={worldMapState.bossVictories}
            stamina={stamina}
            heroes={heroes}
            selectedHeroes={selectedHeroes}
            onToggleHero={toggleHeroSelection}
            onChallengeBoss={handleBossChallenge}
            selectedProvince={selectedProvince}
            onSelectProvince={setSelectedProvince}
            getElementEmoji={getElementEmoji}
            getDifficultyColor={getDifficultyColor}
          />
        )}

        {activeSubTab === 'loot' && (
          <LootTab
            totalLoot={worldMapState.totalLoot}
            expeditionHistory={worldMapState.expeditionHistory}
          />
        )}
      </div>
    </div>
  );
}

// ============= SUB COMPONENTS =============

function MapTab({
  provinces,
  currentProvince,
  onProvinceClick,
  getElementEmoji,
}: {
  provinces: WorldProvince[];
  currentProvince: string | null;
  onProvinceClick: (province: WorldProvince) => void;
  getElementEmoji: (element: string) => string;
}) {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  return (
    <div className="space-y-4">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <MapIcon className="w-6 h-6 text-green-400" />
            Bản Đồ Việt Nam
          </h3>
          
          <div className="flex bg-gray-700/50 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'map' ? 'bg-green-500 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <MapIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'list' ? 'bg-green-500 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {viewMode === 'map' ? (
          <InteractiveVietnamMap
            provinces={provinces}
            currentProvince={currentProvince}
            onProvinceClick={onProvinceClick}
            getElementEmoji={getElementEmoji}
          />
        ) : (
          /* Scrollable province list showing all 63 provinces */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {provinces.slice(0, 63).map((province) => (
              <motion.button
                key={province.id}
                onClick={() => onProvinceClick(province)}
                className={`p-4 rounded-lg text-left transition-all ${
                  province.id === currentProvince
                    ? 'bg-green-500 text-white shadow-lg ring-2 ring-green-300'
                    : province.status === 'completed'
                    ? 'bg-blue-900/50 text-white hover:bg-blue-800/50'
                    : province.status === 'unlocked'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-800/50 text-gray-500'
                }`}
                whileHover={{ scale: province.status !== 'locked' ? 1.02 : 1 }}
                whileTap={{ scale: province.status !== 'locked' ? 0.98 : 1 }}
                disabled={province.status === 'locked'}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{getElementEmoji(province.element)}</span>
                  {province.status === 'locked' && <Lock className="w-4 h-4" />}
                  {province.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-300" />}
                </div>
                <p className="font-semibold">{province.name}</p>
                <p className="text-xs opacity-75">Cấp {province.level}</p>
              </motion.button>
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
            <p className="text-gray-300 text-sm text-center">
              <CheckCircle className="w-4 h-4 inline mr-2 text-green-400" />
              Đã hiển thị đầy đủ 63 tỉnh thành Việt Nam.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ExpeditionsTab({
  expeditions,
  currentExpedition,
  stamina,
  heroes,
  selectedHeroes,
  autoMode,
  onToggleHero,
  onToggleAutoMode,
  onSelectExpedition,
  selectedExpedition,
  onStartExpedition,
  onCompleteExpedition,
  getElementEmoji,
}: any) {
  return (
    <div className="space-y-4">
      {/* Floor Selection */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Swords className="w-6 h-6 text-red-400" />
          Chọn Tầng Thám Hiểm (1-50)
        </h3>

        <div className="grid grid-cols-5 gap-2 mb-4">
          {expeditions.slice(0, 50).map((exp: Expedition) => (
            <button
              key={exp.id}
              onClick={() => onSelectExpedition(exp)}
              className={`p-3 rounded-lg text-center transition-all ${
                selectedExpedition?.id === exp.id
                  ? 'bg-green-500 text-white ring-2 ring-green-300'
                  : exp.completed
                  ? 'bg-blue-900/50 text-white hover:bg-blue-800/50'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              <p className="font-bold text-lg">{exp.floor}</p>
              {exp.floor % 10 === 0 && <Crown className="w-4 h-4 mx-auto text-yellow-300" />}
            </button>
          ))}
        </div>

        {selectedExpedition && (
          <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
            <h4 className="text-lg font-bold text-white mb-3">{selectedExpedition.name}</h4>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <p className="text-gray-400 text-sm">Sức Mạnh Đề Xuất</p>
                <p className="text-white font-bold">{selectedExpedition.recommendedPower}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Stamina</p>
                <p className="text-white font-bold">{selectedExpedition.staminaCost}</p>
              </div>
            </div>

            {/* Auto Mode Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg mb-4">
              <span className="text-white font-medium">Chế Độ Tự Động</span>
              <button
                onClick={onToggleAutoMode}
                className={`w-14 h-7 rounded-full transition-colors ${
                  autoMode ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <motion.div
                  className="w-6 h-6 bg-white rounded-full shadow-lg"
                  animate={{ x: autoMode ? 28 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            <button
              onClick={onStartExpedition}
              disabled={selectedHeroes.length === 0 || stamina.current < selectedExpedition.staminaCost}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentExpedition ? (
                <span className="flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" /> Đang Thám Hiểm...
                </span>
              ) : (
                'Bắt Đầu Thám Hiểm'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Hero Selection */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
        <h3 className="text-lg font-bold text-white mb-3">Chọn Tướng (Tối Đa 3)</h3>
        <div className="grid grid-cols-3 gap-3">
          {heroes.slice(0, 12).map((hero: any) => (
            <button
              key={hero.id}
              onClick={() => onToggleHero(hero.id)}
              className={`p-3 rounded-lg transition-all ${
                selectedHeroes.includes(hero.id)
                  ? 'bg-green-500 text-white ring-2 ring-green-300'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              <span className="text-2xl">{getElementEmoji(hero.element)}</span>
              <p className="text-sm font-medium mt-1">{hero.name}</p>
              <p className="text-xs opacity-75">Lv.{hero.level}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function BossesTab({
  provinces,
  bossVictories,
  stamina,
  heroes,
  selectedHeroes,
  onToggleHero,
  onChallengeBoss,
  selectedProvince,
  onSelectProvince,
  getElementEmoji,
  getDifficultyColor,
}: any) {
  const provincesWithBosses = provinces.filter((p: WorldProvince) => p.boss && p.status !== 'locked');

  return (
    <div className="space-y-4">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          Boss Tỉnh Thành
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {provincesWithBosses.slice(0, 12).map((province: WorldProvince) => {
            const boss = province.boss!;
            const victories = bossVictories[boss.id] || 0;
            const isFirstClear = victories === 0;

            return (
              <motion.button
                key={province.id}
                onClick={() => onSelectProvince(province)}
                className={`p-4 rounded-lg text-left transition-all ${
                  selectedProvince?.id === province.id
                    ? 'bg-red-500 text-white ring-2 ring-red-300'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">{getElementEmoji(boss.element)}</span>
                  {isFirstClear && <Sparkles className="w-5 h-5 text-yellow-300" />}
                </div>
                <p className="font-bold text-lg">{boss.name}</p>
                <p className="text-sm opacity-75">{province.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className={`text-xs font-medium ${getDifficultyColor(boss.difficulty)}`}>
                    {boss.difficulty.toUpperCase()}
                  </p>
                  <p className="text-xs">Lv.{boss.level}</p>
                </div>
                <p className="text-xs text-gray-300 mt-2">
                  <Trophy className="w-3 h-3 inline mr-1" />
                  {victories} Lần Thắng
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {selectedProvince && selectedProvince.boss && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
          <h3 className="text-lg font-bold text-white mb-3">Thách Đấu Boss</h3>
          <div className="p-4 bg-gray-700/50 rounded-lg mb-4">
            <p className="text-white font-bold text-xl mb-2">{selectedProvince.boss.name}</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-gray-400 text-sm">HP</p>
                <p className="text-white font-bold">{selectedProvince.boss.hp}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Tấn Công</p>
                <p className="text-white font-bold">{selectedProvince.boss.attack}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Phòng Thủ</p>
                <p className="text-white font-bold">{selectedProvince.boss.defense}</p>
              </div>
            </div>
          </div>

          {/* Hero Selection */}
          <div className="mb-4">
            <h4 className="text-white font-medium mb-2">Chọn Tướng (Tối Đa 3)</h4>
            <div className="grid grid-cols-3 gap-2">
              {heroes.slice(0, 9).map((hero: any) => (
                <button
                  key={hero.id}
                  onClick={() => onToggleHero(hero.id)}
                  className={`p-3 rounded-lg transition-all ${
                    selectedHeroes.includes(hero.id)
                      ? 'bg-red-500 text-white ring-2 ring-red-300'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  <span className="text-2xl">{getElementEmoji(hero.element)}</span>
                  <p className="text-xs mt-1">{hero.name}</p>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onChallengeBoss(selectedProvince.boss)}
            disabled={
              selectedHeroes.length === 0 || stamina.current < selectedProvince.boss.staminaCost
            }
            className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white font-bold rounded-lg hover:from-red-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Thách Đấu ({selectedProvince.boss.staminaCost} Stamina)
          </button>
        </div>
      )}
    </div>
  );
}

function LootTab({ totalLoot, expeditionHistory }: any) {
  const lootItems = Object.entries(totalLoot);

  return (
    <div className="space-y-4">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Gift className="w-6 h-6 text-purple-400" />
          Tổng Phần Thưởng
        </h3>

        {lootItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {lootItems.map(([itemId, quantity]) => (
              <div key={itemId} className="p-4 bg-gray-700 rounded-lg">
                <p className="text-white font-medium">{itemId}</p>
                <p className="text-2xl font-bold text-green-400">×{quantity as number}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400">Chưa có phần thưởng</p>
          </div>
        )}
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
        <h3 className="text-xl font-bold text-white mb-4">Lịch Sử Thám Hiểm</h3>

        {expeditionHistory.length > 0 ? (
          <div className="space-y-2">
            {expeditionHistory.slice(0, 20).map((run: ExpeditionRun) => (
              <div key={run.startTime} className="p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-white font-medium">Tầng {run.floor}</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      run.result === 'victory'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-600 text-gray-200'
                    }`}
                  >
                    {run.result === 'victory' ? 'THẮNG' : 'THUA'}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 text-sm">
                  <span className="text-yellow-300">+{run.gold} Vàng</span>
                  <span className="text-blue-300">+{run.experience} EXP</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto text-gray-600 mb-3" />
            <p className="text-gray-400">Chưa có lịch sử</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getRewardEmoji(type: string): string {
  switch (type) {
    case 'hero_fragment':
      return '👑';
    case 'pet_egg':
      return '🥚';
    case 'gold':
      return '💰';
    case 'gems':
      return '💎';
    case 'exp_book':
      return '📚';
    case 'culture':
      return '🏛️';
    case 'skin':
      return '🎨';
    case 'equipment':
      return '⚔️';
    default:
      return '🎁';
  }
}
