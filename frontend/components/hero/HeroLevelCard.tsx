'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Heart, 
  Swords, 
  Shield, 
  Zap,
  Star,
  AlertCircle
} from 'lucide-react';
import { PlayerHeroWithStats } from '@/lib/types/mvp1.types';

interface HeroLevelCardProps {
  hero: PlayerHeroWithStats;
  onLevelUp?: () => void;
  canLevelUp?: boolean;
  levelUpCost?: {
    gold?: number;
    rice?: number;
    wood?: number;
    stone?: number;
  };
}

/**
 * HeroLevelCard - MVP2 Sprint 3
 * Displays hero level, stats, exp progress with Vietnamese UI
 */
export default function HeroLevelCard({ 
  hero, 
  onLevelUp, 
  canLevelUp = false,
  levelUpCost 
}: HeroLevelCardProps) {
  const { stats, expForNextLevel, expProgress, level } = hero;
  const isMaxLevel = level >= 5;
  const expPercentage = expForNextLevel > 0 ? (expProgress / expForNextLevel) * 100 : 100;

  // Stat icons
  const statIcons = {
    hp: <Heart className="w-4 h-4" />,
    attack: <Swords className="w-4 h-4" />,
    defense: <Shield className="w-4 h-4" />,
    speed: <Zap className="w-4 h-4" />,
  };

  // Stat colors
  const statColors = {
    hp: 'text-red-600',
    attack: 'text-orange-600',
    defense: 'text-blue-600',
    speed: 'text-green-600',
  };

  // Stat names in Vietnamese
  const statNames = {
    hp: 'Máu',
    attack: 'Tấn Công',
    defense: 'Phòng Thủ',
    speed: 'Tốc Độ',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow-lg p-6"
    >
      {/* Header - Level Display */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full font-bold text-sm flex items-center gap-1">
            <Star className="w-4 h-4" />
            Cấp {level || 1}
          </div>
          {!isMaxLevel && (
            <span className="text-xs text-gray-500">→ Cấp {(level || 1) + 1}</span>
          )}
          {isMaxLevel && (
            <span className="text-xs text-purple-600 font-semibold">✨ Max</span>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Sức Mạnh</div>
          <div className="text-lg font-bold text-purple-700">
            {stats.hp + stats.attack + stats.defense + stats.speed}
          </div>
        </div>
      </div>

      {/* Experience Progress Bar */}
      {!isMaxLevel && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Kinh Nghiệm
            </span>
            <span className="font-semibold">
              {expProgress}/{expForNextLevel}
            </span>
          </div>
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${expPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow">
              {Math.round(expPercentage)}%
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {(['hp', 'attack', 'defense', 'speed'] as const).map((statKey) => {
          const currentValue = stats[statKey];
          const baseValue = stats[`base${statKey.charAt(0).toUpperCase() + statKey.slice(1)}` as keyof typeof stats];
          const isBuffed = baseValue && currentValue > baseValue;

          return (
            <div
              key={statKey}
              className="bg-white rounded-lg p-3 border-2 border-gray-100 hover:border-purple-200 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={statColors[statKey]}>
                  {statIcons[statKey]}
                </span>
                <span className="text-xs font-medium text-gray-600">
                  {statNames[statKey]}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-gray-800">
                  {currentValue}
                </span>
                {isBuffed && baseValue && (
                  <span className="text-xs text-green-600 font-semibold">
                    (+{currentValue - baseValue})
                  </span>
                )}
              </div>
              {baseValue && (
                <div className="text-xs text-gray-400 mt-0.5">
                  Gốc: {baseValue}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Level Info Card */}
      <div className="bg-purple-100 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-purple-600 mt-0.5" />
          <div className="text-xs text-purple-800">
            <p className="font-semibold mb-1">Tăng trưởng theo cấp:</p>
            <p>Mỗi cấp tăng <span className="font-bold">+20%</span> chỉ số gốc</p>
            <p className="text-purple-600 mt-1">
              Cấp 1: 100% → Cấp 5: 180%
            </p>
          </div>
        </div>
      </div>

      {/* Level Up Button */}
      {!isMaxLevel && onLevelUp && (
        <motion.button
          whileHover={{ scale: canLevelUp ? 1.02 : 1 }}
          whileTap={{ scale: canLevelUp ? 0.98 : 1 }}
          onClick={onLevelUp}
          disabled={!canLevelUp}
          className={`
            w-full py-3 rounded-lg font-bold text-sm
            transition-all duration-200 flex items-center justify-center gap-2
            ${canLevelUp
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <Star className="w-5 h-5" />
          <span>
            {canLevelUp ? 'Thăng Cấp' : 'Cần Thêm Kinh Nghiệm'}
          </span>
          {canLevelUp && levelUpCost && (
            <span className="text-xs opacity-90">
              ({Object.entries(levelUpCost).map(([key, val]) => `${val} ${key}`).join(', ')})
            </span>
          )}
        </motion.button>
      )}

      {/* Max Level Message */}
      {isMaxLevel && (
        <div className="text-center py-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg">
          <div className="text-yellow-700 font-bold flex items-center justify-center gap-2">
            <Star className="w-5 h-5 fill-yellow-500 text-yellow-600" />
            <span>Đã Đạt Cấp Tối Đa</span>
            <Star className="w-5 h-5 fill-yellow-500 text-yellow-600" />
          </div>
        </div>
      )}
    </motion.div>
  );
}
