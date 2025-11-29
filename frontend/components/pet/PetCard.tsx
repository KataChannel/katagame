'use client';

import { motion } from 'framer-motion';
import { 
  Heart,
  Swords,
  Shield,
  Coins,
  TrendingUp,
  Zap,
  Star,
  ChevronRight,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { PetWithBonuses, Pet } from '@/lib/types/mvp1.types';

interface PetCardProps {
  pet: PetWithBonuses | Pet;
  heroName?: string;
  isAssigned?: boolean;
  onAssign?: () => void;
  onUnassign?: () => void;
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
 * PetCard - MVP2 Sprint 3
 * Display pet information, bonuses, assign/unassign functionality
 */
export default function PetCard({ 
  pet, 
  heroName,
  isAssigned = false,
  onAssign, 
  onUnassign,
  onLevelUp,
  canLevelUp = false,
  levelUpCost
}: PetCardProps) {
  // Check if pet has bonuses
  const hasBonuses = 'bonuses' in pet;
  const bonuses = hasBonuses ? pet.bonuses : null;

  // Rarity colors
  const rarityColors: Record<string, string> = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-600',
  };

  const rarityBorderColors: Record<string, string> = {
    common: 'border-gray-300',
    rare: 'border-blue-300',
    epic: 'border-purple-300',
    legendary: 'border-yellow-300',
  };

  // Pet type emoji mapping
  const petTypeEmoji: Record<string, string> = {
    combat: '⚔️',
    resource: '🌾',
    experience: '📚',
    luck: '🍀',
    speed: '⚡',
    generic: '✨',
  };

  const petTypeNames: Record<string, string> = {
    combat: 'Chiến Đấu',
    resource: 'Tài Nguyên',
    experience: 'Kinh Nghiệm',
    luck: 'May Mắn',
    speed: 'Tốc Độ',
    generic: 'Tổng Hợp',
  };

  // Bonus display helpers
  const renderBonus = (label: string, value: number | undefined, icon: React.ReactNode, color: string) => {
    if (!value || value === 0) return null;

    return (
      <div className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-gray-100">
        <div className="flex items-center gap-2">
          <span className={color}>{icon}</span>
          <span className="text-sm text-gray-700">{label}</span>
        </div>
        <span className="font-bold text-green-600">+{value}</span>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg shadow-lg p-6
        border-2 ${rarityBorderColors[pet.rarity] || 'border-gray-200'}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl">
              {petTypeEmoji[pet.petType] || '🐾'}
            </span>
            <div>
              <h3 className="font-bold text-lg text-gray-800">{pet.name}</h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-500">
                  {petTypeNames[pet.petType] || pet.petType}
                </span>
                <span className="text-gray-300">•</span>
                <span className={`
                  font-semibold capitalize
                  ${pet.rarity === 'legendary' ? 'text-yellow-600' : ''}
                  ${pet.rarity === 'epic' ? 'text-purple-600' : ''}
                  ${pet.rarity === 'rare' ? 'text-blue-600' : ''}
                  ${pet.rarity === 'common' ? 'text-gray-600' : ''}
                `}>
                  {pet.rarity === 'legendary' && '🌟 '}
                  {pet.rarity === 'epic' && '💎 '}
                  {pet.rarity === 'rare' && '💠 '}
                  {pet.rarity}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className={`
          px-3 py-1 rounded-full bg-gradient-to-r ${rarityColors[pet.rarity] || 'from-gray-400 to-gray-600'}
          text-white font-bold text-sm
        `}>
          Cấp {pet.level || 1}
        </div>
      </div>

      {/* Assignment Status */}
      {isAssigned && heroName && (
        <div className="mb-4 bg-green-100 border border-green-300 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-800">
            <Check className="w-4 h-4" />
            <span className="text-sm font-semibold">
              Đang theo {heroName}
            </span>
          </div>
        </div>
      )}

      {/* Bonuses Display */}
      {bonuses && (
        <div className="mb-4">
          <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Chỉ Số Cộng Thêm:
          </h4>
          <div className="space-y-2">
            {renderBonus('Máu', bonuses.hp, <Heart className="w-4 h-4" />, 'text-red-600')}
            {renderBonus('Tấn Công', bonuses.attack, <Swords className="w-4 h-4" />, 'text-orange-600')}
            {renderBonus('Phòng Thủ', bonuses.defense, <Shield className="w-4 h-4" />, 'text-blue-600')}
            {renderBonus('Tốc Độ', bonuses.speed, <Zap className="w-4 h-4" />, 'text-green-600')}
            {renderBonus('Vàng', bonuses.goldBonus, <Coins className="w-4 h-4" />, 'text-yellow-600')}
            {renderBonus('Lúa', bonuses.riceBonus, <span className="w-4 h-4">🌾</span>, 'text-green-700')}
            {renderBonus('Gỗ', bonuses.woodBonus, <span className="w-4 h-4">🪵</span>, 'text-amber-700')}
            {renderBonus('Đá', bonuses.stoneBonus, <span className="w-4 h-4">🪨</span>, 'text-gray-700')}
            {renderBonus('Kinh Nghiệm', bonuses.expBonus, <TrendingUp className="w-4 h-4" />, 'text-purple-600')}
            {renderBonus('Học Tập', bonuses.learningSpeed, <span className="w-4 h-4">📚</span>, 'text-indigo-600')}
            {renderBonus('May Mắn', bonuses.luckBonus, <span className="w-4 h-4">🍀</span>, 'text-emerald-600')}
            {renderBonus('Chí Mạng', bonuses.criticalChance, <Star className="w-4 h-4" />, 'text-red-500')}
            {renderBonus('Xây Dựng', bonuses.buildingSpeed, <span className="w-4 h-4">🏗️</span>, 'text-cyan-600')}
            {renderBonus('Thu Hoạch', bonuses.harvestSpeed, <span className="w-4 h-4">🌾</span>, 'text-lime-600')}
            {renderBonus('Toàn Bộ', bonuses.allStats, <Sparkles className="w-4 h-4" />, 'text-purple-600')}
          </div>
        </div>
      )}

      {/* Bonus Description */}
      {bonuses && bonuses.description && (
        <div className="mb-4 bg-purple-100 rounded-lg p-3">
          <p className="text-xs text-purple-800">
            {bonuses.description}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {/* Assign/Unassign Button */}
        {!isAssigned && onAssign && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAssign}
            className="
              w-full py-3 rounded-lg font-bold text-sm
              bg-gradient-to-r from-blue-600 to-cyan-600 text-white
              shadow-lg hover:shadow-xl transition-all duration-200
              flex items-center justify-center gap-2
            "
          >
            <Check className="w-5 h-5" />
            <span>Gắn Vào Anh Hùng</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        )}

        {isAssigned && onUnassign && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onUnassign}
            className="
              w-full py-3 rounded-lg font-bold text-sm
              bg-gradient-to-r from-red-500 to-pink-500 text-white
              shadow-lg hover:shadow-xl transition-all duration-200
              flex items-center justify-center gap-2
            "
          >
            <X className="w-5 h-5" />
            <span>Gỡ Khỏi Anh Hùng</span>
          </motion.button>
        )}

        {/* Level Up Button */}
        {onLevelUp && pet.level && pet.level < 10 && (
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
              {canLevelUp ? 'Thăng Cấp Pet' : 'Không Đủ Tài Nguyên'}
            </span>
            {canLevelUp && levelUpCost && (
              <span className="text-xs opacity-90">
                ({Object.entries(levelUpCost).map(([key, val]) => `${val} ${key}`).join(', ')})
              </span>
            )}
          </motion.button>
        )}

        {/* Max Level */}
        {pet.level === 10 && (
          <div className="text-center py-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg">
            <div className="text-yellow-700 font-bold flex items-center justify-center gap-2">
              <Star className="w-5 h-5 fill-yellow-500 text-yellow-600" />
              <span>Pet Đã Max Cấp</span>
              <Star className="w-5 h-5 fill-yellow-500 text-yellow-600" />
            </div>
          </div>
        )}
      </div>

      {/* Pet Info Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 flex items-center justify-between">
          <span>Thu Thập: {new Date(pet.acquiredAt).toLocaleDateString('vi-VN')}</span>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Exp: {pet.experience || 0}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
