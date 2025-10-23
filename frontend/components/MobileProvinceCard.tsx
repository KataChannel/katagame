'use client';

import { motion } from 'framer-motion';
import { Lock, Users, TrendingUp, ChevronRight, Sparkles } from 'lucide-react';
import { useGameStore } from '@/lib/gameStore';
import { Province } from '@/lib/types';
import { touchTargets, mobileSpacing, animations, colors, mobileTypography } from '@/lib/mobileDesignSystem';
import { ElementBadge } from './ElementBadge';
import { getProvinceElementSummary } from '@/lib/elementSystem';
import { useState } from 'react';

interface MobileProvinceCardProps {
  province: Province;
  className?: string;
}

export default function MobileProvinceCard({ province, className = '' }: MobileProvinceCardProps) {
  const { player, unlockProvince, upgradeProvince, buyFarmer } = useGameStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const canUnlock = !province.unlocked && player.totalResources.gold >= 200;
  const canUpgrade = province.unlocked && player.totalResources.gold >= (province.level + 1) * 100;
  const canHireFarmer = province.unlocked && player.totalResources.gold >= 50;
  
  // Get element summary for bonuses
  const elementSummary = province.element ? getProvinceElementSummary(province) : null;

  const handleUnlock = () => {
    if (canUnlock) {
      unlockProvince(province.id);
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([30, 10, 30]);
      }
    }
  };

  const handleUpgrade = () => {
    if (canUpgrade) {
      upgradeProvince(province.id);
      if ('vibrate' in navigator) {
        navigator.vibrate(15);
      }
    }
  };

  const handleHireFarmer = () => {
    if (canHireFarmer) {
      buyFarmer(province.id, 'auto');
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  };

  // Locked province
  if (!province.unlocked) {
    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 ${className}`}
        style={{ minHeight: touchTargets.large * 2 }}
      >
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5" />
        
        <div className="relative p-4 flex flex-col items-center justify-center text-center h-full">
          {/* Lock Icon */}
          <div className="bg-gray-300 rounded-full p-4 mb-3">
            <Lock className="w-8 h-8 text-gray-500" />
          </div>

          {/* Province Name */}
          <h3 className="text-lg font-bold text-gray-700 mb-2">
            {province.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {province.description}
          </p>

          {/* Unlock Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleUnlock}
            disabled={!canUnlock}
            className={`
              w-full px-6 py-3 rounded-lg font-semibold text-white
              flex items-center justify-center gap-2
              transition-all duration-200
              ${canUnlock 
                ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg active:shadow-md' 
                : 'bg-gray-400 cursor-not-allowed'
              }
            `}
            style={{ minHeight: touchTargets.comfortable }}
          >
            <Sparkles className="w-5 h-5" />
            <span>Mở Khóa: 200 💰</span>
          </motion.button>

          {!canUnlock && (
            <p className="text-xs text-red-600 mt-2">
              Còn thiếu {200 - player.totalResources.gold} vàng
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  // Unlocked province
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-xl bg-white border-2 ${
        province.level >= 5 ? 'border-yellow-400 shadow-yellow-200' : 'border-red-200'
      } shadow-lg ${className}`}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-yellow-50 to-orange-50 opacity-50" />
      
      {/* Premium Badge */}
      {province.level >= 5 && (
        <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md z-10">
          <Sparkles className="w-3 h-3" />
          <span>MAX</span>
        </div>
      )}

      <div className="relative p-4">
        {/* Header - Always visible */}
        <div 
          onClick={toggleExpand}
          className="flex items-start justify-between mb-3 cursor-pointer"
          style={{ minHeight: touchTargets.comfortable }}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 
                className="font-bold text-gray-900"
                style={{ fontSize: mobileTypography.lg }}
              >
                {province.displayName}
              </h3>
              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                Cấp {province.level}
              </span>
              {/* Element Badge */}
              {province.element && (
                <ElementBadge 
                  element={province.element} 
                  size="sm" 
                  showTooltip={true}
                />
              )}
            </div>
            <p className="text-sm text-gray-600 line-clamp-1">
              {province.description}
            </p>
            {/* Element Production Bonus */}
            {elementSummary && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-yellow-600 font-semibold">
                  ⚡ +{((elementSummary.productionBonus - 1) * 100).toFixed(0)}% {elementSummary.resourceType}
                </span>
              </div>
            )}
          </div>

          {/* Expand Icon */}
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="ml-2"
          >
            <ChevronRight className="w-6 h-6 text-gray-400" />
          </motion.div>
        </div>

        {/* Resources Preview - Always visible */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {Object.entries(province.resourcesPerSecond).slice(0, 3).map(([key, value]) => {
            const icons: Record<string, string> = {
              gold: '💰',
              rice: '🌾',
              lumber: '🪵',
              stone: '🪨',
              culture: '📚',
            };
            return (
              <div 
                key={key}
                className="bg-white/80 rounded-lg p-2 text-center backdrop-blur-sm"
              >
                <div className="text-lg mb-0.5">{icons[key]}</div>
                <div className="text-xs font-semibold text-gray-900">
                  +{(value as number).toFixed(1)}/s
                </div>
              </div>
            );
          })}
        </div>

        {/* Expanded Content */}
        <motion.div
          initial={false}
          animate={{
            height: isExpanded ? 'auto' : 0,
            opacity: isExpanded ? 1 : 0,
          }}
          transition={{
            duration: parseFloat(animations.normal) / 1000,
            ease: 'easeInOut',
          }}
          className="overflow-hidden"
        >
          <div className="space-y-3 pt-3 border-t border-gray-200">
            {/* All Resources */}
            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2">
                Tài Nguyên Mỗi Giây:
              </h4>
              <div className="grid grid-cols-5 gap-1">
                {Object.entries(province.resourcesPerSecond).map(([key, value]) => {
                  const icons: Record<string, string> = {
                    gold: '💰',
                    rice: '🌾',
                    lumber: '🪵',
                    stone: '🪨',
                    culture: '📚',
                  };
                  return (
                    <div 
                      key={key}
                      className="bg-gray-50 rounded p-1.5 text-center"
                    >
                      <div className="text-base">{icons[key]}</div>
                      <div className="text-[10px] font-semibold text-gray-800">
                        +{(value as number).toFixed(1)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Farmers */}
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">
                    Nông Dân
                  </span>
                </div>
                <span className="text-lg font-bold text-blue-700">
                  {province.farmers.length}
                </span>
              </div>
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleHireFarmer}
                disabled={!canHireFarmer}
                className={`
                  w-full px-4 py-2 rounded-lg font-semibold text-sm
                  flex items-center justify-center gap-2
                  transition-all duration-200
                  ${canHireFarmer
                    ? 'bg-blue-500 text-white active:bg-blue-600 shadow-md active:shadow-sm'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
                style={{ minHeight: touchTargets.comfortable }}
              >
                <Users className="w-4 h-4" />
                <span>Thuê: 50 💰</span>
              </motion.button>
            </div>

            {/* Upgrade */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleUpgrade}
              disabled={!canUpgrade}
              className={`
                w-full px-6 py-3 rounded-lg font-semibold
                flex items-center justify-center gap-2
                transition-all duration-200
                ${canUpgrade
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg active:shadow-md'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
              style={{ minHeight: touchTargets.comfortable }}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Nâng Cấp: {(province.level + 1) * 100} 💰</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Action Button (when collapsed) */}
        {!isExpanded && (
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleHireFarmer}
              disabled={!canHireFarmer}
              className={`
                px-3 py-2 rounded-lg font-semibold text-sm
                flex items-center justify-center gap-1
                ${canHireFarmer
                  ? 'bg-blue-500 text-white active:bg-blue-600'
                  : 'bg-gray-200 text-gray-400'
                }
              `}
              style={{ minHeight: touchTargets.comfortable }}
            >
              <Users className="w-4 h-4" />
              <span>Thuê ND</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleUpgrade}
              disabled={!canUpgrade}
              className={`
                px-3 py-2 rounded-lg font-semibold text-sm
                flex items-center justify-center gap-1
                ${canUpgrade
                  ? 'bg-red-500 text-white active:bg-red-600'
                  : 'bg-gray-200 text-gray-400'
                }
              `}
              style={{ minHeight: touchTargets.comfortable }}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Nâng Cấp</span>
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
