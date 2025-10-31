'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGameStore } from '@/lib/gameStore';
import { touchTargets, mobileSpacing, animations } from '@/lib/mobileDesignSystem';

const RESOURCE_ICONS = {
  gold: '💰',
  rice: '🌾',
  lumber: '🪵',
  stone: '🪨',
  culture: '📚',
};

const RESOURCE_COLORS = {
  gold: 'from-yellow-400 to-yellow-600',
  rice: 'from-green-400 to-green-600',
  lumber: 'from-brown-400 to-brown-600',
  stone: 'from-gray-400 to-gray-600',
  culture: 'from-purple-400 to-purple-600',
};

const RESOURCE_LABELS = {
  gold: 'Vàng',
  rice: 'Lúa',
  lumber: 'Gỗ',
  stone: 'Đá',
  culture: 'Văn Hóa',
};

export default function MobileResourceBar() {
  const { player, provinces } = useGameStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Get resources from player (either from resources field or totalResources fallback)
  const playerResources = player?.resources || player?.totalResources || {
    gold: 0,
    rice: 0,
    lumber: 0,
    stone: 0,
    culture: 0,
  };

  // Calculate total resources per second from all unlocked provinces
  const calculateResourcesPerSecond = () => {
    const perSecond: typeof playerResources = {
      gold: 0,
      rice: 0,
      lumber: 0,
      stone: 0,
      culture: 0,
    };
    
    provinces.forEach(province => {
      if (province.unlocked) {
        perSecond.gold += province.resourcesPerSecond.gold;
        perSecond.rice += province.resourcesPerSecond.rice;
        perSecond.lumber += province.resourcesPerSecond.lumber;
        perSecond.stone += province.resourcesPerSecond.stone;
        perSecond.culture += province.resourcesPerSecond.culture;
      }
    });
    
    return perSecond;
  };

  const resourcesPerSecond = calculateResourcesPerSecond();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const resourceEntries = Object.entries(playerResources) as [keyof typeof RESOURCE_ICONS, number][];
  const visibleResources = isMobile ? [resourceEntries[currentIndex]] : resourceEntries;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % resourceEntries.length);
    if ('vibrate' in navigator) navigator.vibrate(5);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + resourceEntries.length) % resourceEntries.length);
    if ('vibrate' in navigator) navigator.vibrate(5);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return Math.floor(num).toString();
  };

  // Desktop view (grid layout)
  if (!isMobile) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-yellow-50 border-y border-red-200 py-3">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-5 gap-3">
            {resourceEntries.map(([resourceType, amount]) => (
              <ResourceCard
                key={resourceType}
                resourceType={resourceType}
                amount={amount}
                perSecond={resourcesPerSecond[resourceType] || 0}
                formatNumber={formatNumber}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Mobile view (carousel)
  return (
    <div className="bg-gradient-to-r from-red-50 to-yellow-50 border-y border-red-200">
      <div className="relative py-3 px-4">
        {/* Navigation buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md"
          style={{ minWidth: touchTargets.minimum / 2, minHeight: touchTargets.minimum / 2 }}
          aria-label="Tài nguyên trước"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md"
          style={{ minWidth: touchTargets.minimum / 2, minHeight: touchTargets.minimum / 2 }}
          aria-label="Tài nguyên tiếp"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>

        {/* Resource carousel */}
        <div className="overflow-hidden mx-8">
          <AnimatePresence mode="wait">
            {visibleResources.map(([resourceType, amount]) => (
              <motion.div
                key={resourceType}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: parseFloat(animations.fast) / 1000 }}
              >
                <ResourceCard
                  resourceType={resourceType}
                  amount={amount}
                  perSecond={resourcesPerSecond[resourceType] || 0}
                  formatNumber={formatNumber}
                  isMobile
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-1.5 mt-2">
          {resourceEntries.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                if ('vibrate' in navigator) navigator.vibrate(5);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-red-600 w-4'
                  : 'bg-gray-300'
              }`}
              aria-label={`Chuyển đến tài nguyên ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ResourceCardProps {
  resourceType: keyof typeof RESOURCE_ICONS;
  amount: number;
  perSecond: number;
  formatNumber: (num: number) => string;
  isMobile?: boolean;
}

function ResourceCard({ resourceType, amount, perSecond, formatNumber, isMobile }: ResourceCardProps) {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-sm overflow-hidden
        ${isMobile ? 'p-4' : 'p-3'}
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{RESOURCE_ICONS[resourceType]}</span>
        <span className={`text-sm font-semibold ${isMobile ? 'text-base' : ''}`}>
          {RESOURCE_LABELS[resourceType]}
        </span>
      </div>

      {/* Amount */}
      <div className={`font-bold ${isMobile ? 'text-2xl' : 'text-xl'} text-gray-900 mb-1`}>
        {formatNumber(amount)}
      </div>

      {/* Per second */}
      {perSecond > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1"
        >
          <div className={`bg-gradient-to-r ${RESOURCE_COLORS[resourceType]} rounded-full px-2 py-0.5`}>
            <span className="text-white text-xs font-semibold">
              +{formatNumber(perSecond)}/s
            </span>
          </div>
        </motion.div>
      )}

      {/* Progress bar (visual indicator) */}
      <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-to-r ${RESOURCE_COLORS[resourceType]}`}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>
    </div>
  );
}

// Compact version for in-game display
export function CompactResourceBar() {
  const { player } = useGameStore();

  const formatCompact = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return Math.floor(num).toString();
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 px-1">
      {(Object.entries(player.totalResources) as [keyof typeof RESOURCE_ICONS, number][]).map(([resourceType, amount]) => (
        <div
          key={resourceType}
          className="flex items-center gap-1 bg-white/90 rounded-full px-2 py-1 shadow-sm whitespace-nowrap"
          style={{ minHeight: touchTargets.minimum / 1.5 }}
        >
          <span className="text-sm">{RESOURCE_ICONS[resourceType]}</span>
          <span className="text-xs font-semibold text-gray-900">
            {formatCompact(amount)}
          </span>
        </div>
      ))}
    </div>
  );
}
