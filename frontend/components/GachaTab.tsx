'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';
import {
  SINGLE_PULL_COST,
  TEN_PULL_COST,
  PITY_COUNTER_MAX,
  PullResult,
  GachaItem,
  Rarity,
  getRarityColor,
  getRarityGradient,
  getRarityNameVi,
  getGachaStatistics,
  isDailyFreePullAvailable,
  getTimeUntilNextFreePull,
  formatTimeRemaining,
} from '@/lib/gachaSystem';
import {
  Sparkles,
  Zap,
  Gift,
  Star,
  Crown,
  TrendingUp,
  Clock,
  History,
  X,
  ChevronRight,
  Gem,
  Award,
} from 'lucide-react';

export default function GachaTab() {
  const { player, gacha, pullHeroGacha, lastGachaResults, initializeGacha } = useGameStore();
  const [showPullResult, setShowPullResult] = useState<any[] | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [timeUntilFree, setTimeUntilFree] = useState(0);

  // Initialize gacha if not exists
  useEffect(() => {
    if (!gacha) {
      initializeGacha();
    }
  }, [gacha, initializeGacha]);

  // Update free pull countdown
  useEffect(() => {
    if (!gacha) return;

    const updateCountdown = () => {
      const ms = getTimeUntilNextFreePull(gacha);
      setTimeUntilFree(ms);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [gacha]);

  if (!gacha) {
    return (
      <div className="min-h-screen pb-24 md:pb-6 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Gacha Loading...</h2>
          <p className="text-gray-600">Initializing gacha system...</p>
        </div>
      </div>
    );
  }

  const gems = player.totalResources.gems || 0;
  const canAffordSingle = gems >= SINGLE_PULL_COST;
  const canAffordTen = gems >= TEN_PULL_COST;
  const freePullAvailable = isDailyFreePullAvailable(gacha);
  const stats = getGachaStatistics(gacha);

  const handleSinglePull = async () => {
    setIsPulling(true);
    // Simulate pull animation delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const results = await pullHeroGacha(1);
    if (results) {
      setShowPullResult(results);
    }
    setIsPulling(false);
  };

  const handleTenPull = async () => {
    setIsPulling(true);
    // Simulate pull animation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const results = await pullHeroGacha(10);
    if (results) {
      setShowPullResult(results);
    }
    setIsPulling(false);
  };

  const handleFreePull = async () => {
    /* 
    if (!freePullAvailable || isPulling) return;
    
    setIsPulling(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = performDailyFreePull();
    if (result) {
      setShowPullResult([result]);
    }
    setIsPulling(false);
    */
    useGameStore.getState().addNotification({ type: 'info', title: 'Thông báo', message: 'Tính năng Free Pull đang được cập nhật.' });
  };

  return (
    <div className="min-h-screen pb-24 md:pb-6">
      {/* Header with Gem Balance */}
      <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white p-6 rounded-lg shadow-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="w-8 h-8" />
              Gacha
            </h1>
            <p className="text-purple-100 mt-1">Triệu hồi anh hùng & thú cưng</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <Gem className="w-6 h-6 text-yellow-300" />
              <span className="text-3xl font-bold">{gems}</span>
            </div>
            <p className="text-sm text-purple-100">Gems</p>
          </div>
        </div>

        {/* Pity Counter */}
        <div className="bg-white/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Pity Counter</span>
            <span className="text-lg font-bold">
              {gacha.pityCounter} / {PITY_COUNTER_MAX}
            </span>
          </div>
          <div className="relative h-3 bg-black/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(gacha.pityCounter / PITY_COUNTER_MAX) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 to-orange-500"
            />
          </div>
          <p className="text-xs text-white/80 mt-2">
            {PITY_COUNTER_MAX - gacha.pityCounter} pulls until guaranteed legendary
          </p>
        </div>
      </div>

      {/* Pull Buttons */}
      <div className="grid gap-4 mb-6">
        {/* Daily Free Pull */}
        <motion.button
          whileHover={freePullAvailable && !isPulling ? { scale: 1.02 } : {}}
          whileTap={freePullAvailable && !isPulling ? { scale: 0.98 } : {}}
          onClick={handleFreePull}
          disabled={!freePullAvailable || isPulling}
          className={`
            relative overflow-hidden rounded-xl p-6 shadow-lg transition-all duration-200
            ${freePullAvailable && !isPulling
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-xl cursor-pointer'
              : 'bg-gray-300 cursor-not-allowed'
            }
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gift className="w-8 h-8 text-white" />
              <div className="text-left">
                <div className="text-xl font-bold text-white">Daily Free Pull</div>
                <div className="text-sm text-white/90">
                  {freePullAvailable ? 'Available now!' : `Resets in ${formatTimeRemaining(timeUntilFree)}`}
                </div>
              </div>
            </div>
            {freePullAvailable && (
              <div className="text-white">
                <ChevronRight className="w-8 h-8" />
              </div>
            )}
          </div>
          {freePullAvailable && (
            <motion.div
              className="absolute inset-0 bg-white/20"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </motion.button>

        {/* Single Pull */}
        <motion.button
          whileHover={canAffordSingle && !isPulling ? { scale: 1.02 } : {}}
          whileTap={canAffordSingle && !isPulling ? { scale: 0.98 } : {}}
          onClick={handleSinglePull}
          disabled={!canAffordSingle || isPulling}
          className={`
            rounded-xl p-6 shadow-lg transition-all duration-200
            ${canAffordSingle && !isPulling
              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:shadow-xl cursor-pointer'
              : 'bg-gray-300 cursor-not-allowed'
            }
          `}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-white" />
              <div className="text-left">
                <div className="text-xl font-bold text-white">Single Pull</div>
                <div className="text-sm text-white/90">Standard summon</div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-white">
                <Gem className="w-5 h-5 text-yellow-300" />
                <span className="text-2xl font-bold">{SINGLE_PULL_COST}</span>
              </div>
            </div>
          </div>
        </motion.button>

        {/* 10-Pull */}
        <motion.button
          whileHover={canAffordTen && !isPulling ? { scale: 1.02 } : {}}
          whileTap={canAffordTen && !isPulling ? { scale: 0.98 } : {}}
          onClick={handleTenPull}
          disabled={!canAffordTen || isPulling}
          className={`
            relative overflow-hidden rounded-xl p-6 shadow-lg transition-all duration-200
            ${canAffordTen && !isPulling
              ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:shadow-xl cursor-pointer'
              : 'bg-gray-300 cursor-not-allowed'
            }
          `}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-white" />
              <div className="text-left">
                <div className="text-xl font-bold text-white">10-Pull</div>
                <div className="text-sm text-white/90">Guaranteed rare or higher!</div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-white">
                <Gem className="w-5 h-5 text-yellow-300" />
                <span className="text-2xl font-bold">{TEN_PULL_COST}</span>
              </div>
              <div className="text-xs text-white/80">Save 100 gems!</div>
            </div>
          </div>
          {canAffordTen && (
            <div className="flex items-center gap-1 text-white/90">
              <Star className="w-4 h-4" />
              <span className="text-xs">10% discount</span>
            </div>
          )}
        </motion.button>
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            Gacha Statistics
          </h2>
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            <History className="w-5 h-5" />
            View History
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.totalPulls}</div>
            <div className="text-sm text-gray-600">Total Pulls</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border-2 border-yellow-300">
            <div className="text-2xl font-bold text-orange-600">{stats.legendaryPulls}</div>
            <div className="text-sm text-gray-600">Legendary</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.epicPulls}</div>
            <div className="text-sm text-gray-600">Epic</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.rarePulls}</div>
            <div className="text-sm text-gray-600">Rare</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Legendary Rate</div>
            <div className="text-lg font-bold text-gray-900">{stats.legendaryRate.toFixed(2)}%</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Total Spent</div>
            <div className="flex items-center gap-1">
              <Gem className="w-4 h-4 text-purple-600" />
              <span className="text-lg font-bold text-gray-900">{stats.totalGemsSpent}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rates Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" />
          Drop Rates
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">🌟 Legendary</span>
            <span className="font-semibold text-yellow-600">5%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">💜 Epic</span>
            <span className="font-semibold text-purple-600">15%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">💙 Rare</span>
            <span className="font-semibold text-blue-600">30%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">⚪ Common</span>
            <span className="font-semibold text-gray-600">50%</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-gray-700">
            ⭐ <strong>Pity System:</strong> Guaranteed legendary after {PITY_COUNTER_MAX} pulls without one
          </p>
          <p className="text-xs text-gray-700 mt-1">
            🎁 <strong>10-Pull Bonus:</strong> At least 1 rare or higher guaranteed
          </p>
        </div>
      </div>

      {/* Pull Result Modal */}
      <AnimatePresence>
        {showPullResult && (
          <PullResultModal
            results={showPullResult}
            onClose={() => setShowPullResult(null)}
          />
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && gacha && (
          <HistoryModal
            gacha={gacha}
            onClose={() => setShowHistory(false)}
          />
        )}
      </AnimatePresence>

      {/* Pulling Animation Overlay */}
      <AnimatePresence>
        {isPulling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-24 h-24 text-yellow-400 mx-auto" />
              </motion.div>
              <p className="text-white text-2xl font-bold mt-4">Summoning...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Pull Result Modal Component
function PullResultModal({
  results,
  onClose,
}: {
  results: any[];
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentResult = results[currentIndex];
  const isMultiPull = results.length > 1;

  const handleNext = () => {
    if (currentIndex < results.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
      onClick={isMultiPull ? undefined : onClose}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotateY: -90 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        exit={{ scale: 0.5, opacity: 0, rotateY: 90 }}
        transition={{ type: 'spring', duration: 0.5 }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-lg w-full"
      >
        <GachaRevealCard result={currentResult} onNext={handleNext} isLast={currentIndex === results.length - 1} />
        
        {isMultiPull && (
          <div className="text-center mt-4">
            <span className="text-white text-sm">
              {currentIndex + 1} / {results.length}
            </span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// Gacha Reveal Card
function GachaRevealCard({
  result,
  onNext,
  isLast,
}: {
  result: any;
  onNext: () => void;
  isLast: boolean;
}) {
  const { hero, isDuplicate, reward } = result;
  
  // Map backend rarity to frontend rarity string
  const rarity = (hero.rarity || 'common').toLowerCase() as Rarity;
  const gradient = getRarityGradient(rarity);
  const rarityName = getRarityNameVi(rarity);

  const displayItem = {
    displayName: hero.nameVietnamese || hero.name,
    description: hero.description || 'Anh hùng hào kiệt đất Việt.',
    type: 'hero',
    rarity: rarity
  };

  return (
    <motion.div
      className={`relative bg-gradient-to-br ${gradient} p-1 rounded-2xl shadow-2xl`}
    >
      {/* Particle effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1, repeat: 2 }}
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full ${
              displayItem.rarity === 'legendary' ? 'bg-yellow-300' :
              displayItem.rarity === 'epic' ? 'bg-purple-400' :
              displayItem.rarity === 'rare' ? 'bg-blue-400' : 'bg-gray-400'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100],
              opacity: [1, 0],
            }}
            transition={{
              duration: 1,
              delay: i * 0.05,
            }}
          />
        ))}
      </motion.div>

      <div className="bg-white rounded-xl p-8">
        {/* Rarity Badge */}
        <div className="text-center mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${gradient} text-white font-bold`}
          >
            {rarityName}
          </motion.div>
          {displayItem.rarity === 'legendary' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="mt-2 inline-block px-3 py-1 rounded-full bg-red-500 text-white text-sm font-bold"
            >
              🎯 TRIỆU HỒI ĐẶC BIỆT!
            </motion.div>
          )}
        </div>

        {/* Item Display */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">
            {displayItem.rarity === 'legendary' ? '🏮' :
             displayItem.rarity === 'epic' ? '🗡️' :
             displayItem.rarity === 'rare' ? '🛡️' : '🚶'}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{displayItem.displayName}</h3>
          <p className="text-gray-600 text-sm mb-4">{displayItem.description}</p>
          
          {isDuplicate && (
            <div className="inline-flex flex-col items-center gap-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                <History className="w-4 h-4" />
                TRÙNG LẶP
              </div>
              {reward && <p className="text-xs text-orange-600 font-bold">Chuyển thành: {reward}</p>}
            </div>
          )}
          {!isDuplicate && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <Star className="w-4 h-4" />
              MỚI!
            </div>
          )}
        </motion.div>

        {/* Next Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onNext}
          className={`w-full mt-6 py-3 rounded-lg font-bold text-white bg-gradient-to-r ${gradient} hover:opacity-90 transition-opacity`}
        >
          {isLast ? 'Close' : 'Next →'}
        </motion.button>
      </div>
    </motion.div>
  );
}

// History Modal
function HistoryModal({
  gacha,
  onClose,
}: {
  gacha: import('@/lib/gachaSystem').GachaState;
  onClose: () => void;
}) {
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
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="w-6 h-6" />
            Pull History
          </h2>
          <p className="text-purple-100 text-sm mt-1">Last {gacha.pullHistory.length} pulls</p>
        </div>

        {/* History List */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {gacha.pullHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No pull history yet</p>
              <p className="text-sm">Start summoning to see your history!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {gacha.pullHistory.map((entry, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {new Date(entry.timestamp).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.pullType === 'free' ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">FREE</span>
                      ) : (
                        <div className="flex items-center gap-1 text-sm">
                          <Gem className="w-4 h-4 text-purple-600" />
                          <span className="font-semibold">{entry.gemsCost}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {entry.items.map((result, i) => (
                      <div
                        key={i}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          result.item.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-700' :
                          result.item.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                          result.item.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {result.item.displayName}
                        {result.isNew && ' ✨'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
