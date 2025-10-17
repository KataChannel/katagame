'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';
import {
  battlePassRewards,
  calculateLevelFromXP,
  getLevelProgress,
  getXPForNextLevel,
  getDaysRemaining,
  formatTimeRemaining,
  formatXP,
  getAvailableRewards,
  claimReward,
  isMilestone,
  calculateTotalRewards,
  MAX_LEVEL,
} from '@/lib/battlePassSystem';
import { BattlePassProgress } from '@/lib/types';
import {
  Trophy,
  Star,
  Crown,
  Lock,
  CheckCircle,
  TrendingUp,
  Calendar,
  Zap,
  Gift,
  Sparkles,
  ChevronRight,
  X,
} from 'lucide-react';

export default function BattlePassTab() {
  const { battlePass, claimBattlePassReward, upgradeBattlePassPremium, initializeBattlePass } = useGameStore();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showRewardDetail, setShowRewardDetail] = useState<number | null>(null);

  // Initialize battle pass if not exists (for demo purposes)
  useEffect(() => {
    if (!battlePass) {
      // Initialize season 1 for testing
      initializeBattlePass(1);
    }
  }, [battlePass, initializeBattlePass]);

  if (!battlePass) {
    return (
      <div className="min-h-screen pb-24 md:pb-6 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Battle Pass Coming Soon</h2>
          <p className="text-gray-600">Season 1 will start soon. Get ready!</p>
        </div>
      </div>
    );
  }

  const currentLevel = battlePass.currentLevel;
  const progress = getLevelProgress(battlePass.totalXP);
  const xpForNext = getXPForNextLevel(currentLevel);
  const daysLeft = getDaysRemaining(battlePass);
  const availableRewards = getAvailableRewards(battlePass);

  return (
    <div className="min-h-screen pb-24 md:pb-6">
      {/* Header with Season Info */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white p-6 rounded-lg shadow-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trophy className="w-8 h-8" />
              Battle Pass
            </h1>
            <p className="text-purple-100 mt-1">Season {battlePass.seasonNumber}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <Calendar className="w-5 h-5" />
              <span className="text-lg font-semibold">{daysLeft} days left</span>
            </div>
            <p className="text-sm text-purple-100">{formatTimeRemaining(battlePass)}</p>
          </div>
        </div>

        {/* Level and Progress */}
        <div className="bg-white/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-300" />
              <span className="text-2xl font-bold">Level {currentLevel}</span>
              <span className="text-white/80">/ {MAX_LEVEL}</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/80">Next Level</div>
              <div className="font-semibold">{formatXP(xpForNext)} XP</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative h-8 bg-black/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center"
            >
              <span className="text-sm font-bold text-white drop-shadow">
                {progress}%
              </span>
            </motion.div>
          </div>
        </div>

        {/* Premium Status */}
        {!battlePass.isPremium && (
          <button
            onClick={() => setShowPremiumModal(true)}
            className="w-full mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Crown className="w-5 h-5" />
            Unlock Premium Battle Pass
            <Sparkles className="w-5 h-5" />
          </button>
        )}

        {battlePass.isPremium && (
          <div className="mt-4 bg-gradient-to-r from-yellow-400/30 to-orange-500/30 border-2 border-yellow-400 rounded-lg p-3 flex items-center gap-3">
            <Crown className="w-6 h-6 text-yellow-300" />
            <div>
              <div className="font-bold">Premium Active</div>
              <div className="text-sm text-white/80">Enjoy exclusive rewards!</div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Claim Section */}
      {(availableRewards.free.length > 0 || availableRewards.premium.length > 0) && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Gift className="w-5 h-5 text-green-600" />
            Rewards Ready to Claim
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {availableRewards.free.length > 0 && (
              <div className="bg-white rounded-lg p-3 border border-green-200">
                <div className="text-sm text-gray-600 mb-1">Free Track</div>
                <div className="text-2xl font-bold text-green-600">
                  {availableRewards.free.length}
                </div>
                <div className="text-xs text-gray-500">rewards</div>
              </div>
            )}
            {battlePass.isPremium && availableRewards.premium.length > 0 && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-300">
                <div className="text-sm text-gray-600 mb-1">Premium Track</div>
                <div className="text-2xl font-bold text-orange-600">
                  {availableRewards.premium.length}
                </div>
                <div className="text-xs text-gray-500">rewards</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rewards Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          Reward Tracks
        </h2>

        {/* Render all 50 levels */}
        {Array.from({ length: MAX_LEVEL }, (_, i) => i + 1).map((level) => (
          <RewardLevel
            key={level}
            level={level}
            battlePass={battlePass}
            onViewDetail={() => setShowRewardDetail(level)}
            onClaimReward={claimBattlePassReward}
          />
        ))}
      </div>

      {/* Premium Upgrade Modal */}
      <AnimatePresence>
        {showPremiumModal && (
          <PremiumUpgradeModal
            battlePass={battlePass}
            onClose={() => setShowPremiumModal(false)}
            onUpgrade={upgradeBattlePassPremium}
          />
        )}
      </AnimatePresence>

      {/* Reward Detail Modal */}
      <AnimatePresence>
        {showRewardDetail !== null && (
          <RewardDetailModal
            level={showRewardDetail}
            battlePass={battlePass}
            onClose={() => setShowRewardDetail(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Reward Level Component
function RewardLevel({
  level,
  battlePass,
  onViewDetail,
  onClaimReward,
}: {
  level: number;
  battlePass: BattlePassProgress;
  onViewDetail: () => void;
  onClaimReward: (level: number, trackType: 'free' | 'premium') => void;
}) {
  const isUnlocked = battlePass.currentLevel >= level;
  const isFreeClaimed = battlePass.claimedRewards.free.includes(level);
  const isPremiumClaimed = battlePass.claimedRewards.premium.includes(level);
  const milestone = isMilestone(level);

  const rewardData = battlePassRewards.find((r) => r.level === level);
  if (!rewardData) return null;

  const handleClaimFree = () => {
    if (!isUnlocked || isFreeClaimed) return;
    onClaimReward(level, 'free');
  };

  const handleClaimPremium = () => {
    if (!isUnlocked || !battlePass.isPremium || isPremiumClaimed) return;
    onClaimReward(level, 'premium');
  };

  return (
    <div
      className={`
        relative bg-white rounded-xl shadow-md overflow-hidden border-2
        ${milestone ? 'border-yellow-400' : 'border-gray-200'}
        ${!isUnlocked ? 'opacity-60' : ''}
      `}
    >
      {/* Milestone Banner */}
      {milestone && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500" />
      )}

      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Level Number */}
          <div
            className={`
              w-16 h-16 rounded-lg flex flex-col items-center justify-center font-bold
              ${milestone 
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' 
                : 'bg-gray-100 text-gray-700'
              }
            `}
          >
            <div className="text-xs opacity-80">LEVEL</div>
            <div className="text-2xl">{level}</div>
          </div>

          {/* Free Reward */}
          <div className="flex-1">
            <div className="text-xs font-semibold text-gray-600 mb-1">FREE REWARD</div>
            <RewardCard reward={rewardData.freeReward} small />
            <button
              onClick={handleClaimFree}
              disabled={!isUnlocked || isFreeClaimed}
              className={`
                mt-2 w-full py-2 rounded-lg font-medium text-sm transition-all duration-200
                ${isFreeClaimed
                  ? 'bg-green-100 text-green-700 cursor-default'
                  : isUnlocked
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isFreeClaimed ? (
                <><CheckCircle className="w-4 h-4 inline mr-1" /> Claimed</>
              ) : isUnlocked ? (
                'Claim Reward'
              ) : (
                <><Lock className="w-4 h-4 inline mr-1" /> Locked</>
              )}
            </button>
          </div>

          {/* Premium Reward */}
          <div className="flex-1">
            <div className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
              <Crown className="w-3 h-3 text-yellow-500" />
              PREMIUM REWARD
            </div>
            {rewardData.premiumReward && <RewardCard reward={rewardData.premiumReward} small premium />}
            <button
              onClick={handleClaimPremium}
              disabled={!isUnlocked || !battlePass.isPremium || isPremiumClaimed}
              className={`
                mt-2 w-full py-2 rounded-lg font-medium text-sm transition-all duration-200
                ${isPremiumClaimed
                  ? 'bg-green-100 text-green-700 cursor-default'
                  : isUnlocked && battlePass.isPremium
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isPremiumClaimed ? (
                <><CheckCircle className="w-4 h-4 inline mr-1" /> Claimed</>
              ) : battlePass.isPremium ? (
                isUnlocked ? 'Claim Reward' : <><Lock className="w-4 h-4 inline mr-1" /> Locked</>
              ) : (
                <><Crown className="w-4 h-4 inline mr-1" /> Premium Only</>
              )}
            </button>
          </div>

          {/* View Detail Button */}
          <button
            onClick={onViewDetail}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Reward Card Component
function RewardCard({
  reward,
  small = false,
  premium = false,
}: {
  reward: any;
  small?: boolean;
  premium?: boolean;
}) {
  const getRewardDisplay = () => {
    if (reward.type === 'resource') {
      const resources = reward.value;
      const entries = Object.entries(resources);
      
      return (
        <div className={`flex flex-wrap gap-2 ${small ? 'text-xs' : 'text-sm'}`}>
          {entries.map(([key, value]) => (
            <div
              key={key}
              className={`
                flex items-center gap-1 px-2 py-1 rounded-full
                ${premium ? 'bg-gradient-to-r from-yellow-100 to-orange-100' : 'bg-blue-50'}
              `}
            >
              <span>{getResourceIcon(key)}</span>
              <span className="font-semibold">{value as number}</span>
            </div>
          ))}
        </div>
      );
    } else if (reward.type === 'hero') {
      return (
        <div className={`font-semibold ${premium ? 'text-orange-600' : 'text-blue-600'}`}>
          🗡️ Hero: {getHeroName(reward.value)}
        </div>
      );
    } else if (reward.type === 'pet') {
      return (
        <div className={`font-semibold ${premium ? 'text-orange-600' : 'text-blue-600'}`}>
          ✨ Pet: {getPetName(reward.value)}
        </div>
      );
    }
    
    return <div className="text-gray-600">Mystery Reward</div>;
  };

  return <div>{getRewardDisplay()}</div>;
}

// Helper functions for reward display
function getResourceIcon(resource: string): string {
  const icons: Record<string, string> = {
    gold: '💰',
    rice: '🌾',
    lumber: '🪵',
    stone: '🪨',
    culture: '📜',
    gems: '💎',
  };
  return icons[resource] || '❓';
}

function getHeroName(id: string): string {
  const names: Record<string, string> = {
    'thanh-giong': 'Thánh Gióng',
    'lac-long-quan': 'Lạc Long Quân',
    'hai-ba-trung': 'Hai Bà Trưng',
    'ly-thuong-kiet': 'Lý Thường Kiệt',
    'son-tinh': 'Sơn Tinh',
  };
  return names[id] || id;
}

function getPetName(id: string): string {
  const names: Record<string, string> = {
    dragon: 'Rồng Thần',
    phoenix: 'Phượng Hoàng',
    turtle: 'Thần Quy',
    qilin: 'Kỳ Lân',
    tiger: 'Bạch Hổ',
    'golden-fish': 'Cá Chép Vàng',
    buffalo: 'Trâu Thần',
    crane: 'Hạc Trắng',
  };
  return names[id] || id;
}

// Premium Upgrade Modal (simplified for now)
function PremiumUpgradeModal({
  battlePass,
  onClose,
  onUpgrade,
}: {
  battlePass: BattlePassProgress;
  onClose: () => void;
  onUpgrade: () => void;
}) {
  const totalRewards = calculateTotalRewards(MAX_LEVEL, true);

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
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-12 h-12" />
            <div>
              <h2 className="text-3xl font-bold">Premium Battle Pass</h2>
              <p className="text-white/90">Unlock exclusive rewards</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-gray-700 text-lg mb-4">
              Upgrade to Premium and unlock all premium rewards for Season {battlePass.seasonNumber}!
            </p>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border-2 border-yellow-300">
              <div className="text-4xl font-bold text-orange-600 mb-1">
                💎 1,000 Gems
              </div>
              <div className="text-sm text-gray-600">One-time purchase</div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-3">Premium Benefits:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Unlock premium rewards for all {MAX_LEVEL} levels</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Get {totalRewards.heroes.length} Legendary Heroes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Get {totalRewards.pets.length} Mythical Pets</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>2x more resources than free track</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => {
              onUpgrade();
              onClose();
            }}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-4 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Crown className="w-5 h-5 inline mr-2" />
            Upgrade to Premium
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Reward Detail Modal (simplified)
function RewardDetailModal({
  level,
  battlePass,
  onClose,
}: {
  level: number;
  battlePass: BattlePassProgress;
  onClose: () => void;
}) {
  const rewardData = battlePassRewards.find((r) => r.level === level);
  if (!rewardData) return null;

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
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
      >
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold">Level {level} Rewards</h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Free Reward:</h3>
            <RewardCard reward={rewardData.freeReward} />
          </div>

          {rewardData.premiumReward && (
            <div>
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-1">
                <Crown className="w-4 h-4 text-yellow-500" />
                Premium Reward:
              </h3>
              <RewardCard reward={rewardData.premiumReward} premium />
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
