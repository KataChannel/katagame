'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGameStore } from '@/lib/gameStore';
import { touchTargets, mobileSpacing, animations } from '@/lib/mobileDesignSystem';
import { formatNumber } from '@/lib/utils'; // Standard formatter

const RESOURCE_ICONS = {
  gold: '💰',
  rice: '🌾',
  lumber: '🪵',
  stone: '🪨',
  bazan: '🌋',
  culture: '📚',
  gems: '💎',
};

const RESOURCE_COLORS = {
  gold: 'from-yellow-400 to-yellow-600',
  rice: 'from-green-400 to-green-600',
  lumber: 'from-amber-400 to-amber-600',
  stone: 'from-gray-400 to-gray-600',
  bazan: 'from-red-500 to-orange-600',
  culture: 'from-purple-400 to-purple-600',
  gems: 'from-cyan-400 to-blue-500',
};

const RESOURCE_LABELS = {
  gold: 'Vàng',
  rice: 'Lúa',
  lumber: 'Gỗ',
  stone: 'Đá',
  bazan: 'Đất Đỏ',
  culture: 'Văn Hóa',
  gems: 'Kim Cương',
};

export default function MobileResourceBar() {
  const { player, provinces } = useGameStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get resources
  const playerResources = player?.resources || player?.totalResources || {
    gold: 0,
    rice: 0,
    lumber: 0,
    stone: 0,
    bazan: 0,
    culture: 0,
    gems: 0,
  };

  // Calculate per second
  const calculateResourcesPerSecond = () => {
    const perSecond: typeof playerResources = {
      gold: 0,
      rice: 0,
      lumber: 0,
      stone: 0,
      bazan: 0,
      culture: 0,
      gems: 0,
    };
    
    provinces.forEach(province => {
      if (province.unlocked && province.resourcesPerSecond) {
        perSecond.gold += province.resourcesPerSecond.gold || 0;
        perSecond.rice += province.resourcesPerSecond.rice || 0;
        perSecond.lumber += province.resourcesPerSecond.lumber || 0;
        perSecond.stone += province.resourcesPerSecond.stone || 0;
        perSecond.bazan += province.resourcesPerSecond.bazan || 0;
        perSecond.culture += province.resourcesPerSecond.culture || 0;
      }
    });
    
    return perSecond;
  };

  const resourcesPerSecond = calculateResourcesPerSecond();
  const resourceEntries = Object.entries(playerResources) as [keyof typeof RESOURCE_ICONS, number][];
  const visibleResource = resourceEntries[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % resourceEntries.length);
    if ('vibrate' in navigator) navigator.vibrate(5);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + resourceEntries.length) % resourceEntries.length);
    if ('vibrate' in navigator) navigator.vibrate(5);
  };

  // Mobile View Only (Since Desktop uses ResourceBar.tsx)
  return (
    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 shadow-sm">
      <div className="relative py-2 px-1">
        
        {/* Navigation - Left */}
        <button
          onClick={handlePrev}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-zinc-800 rounded-full p-1.5 shadow-sm border border-gray-100 dark:border-zinc-700 active:scale-90 transition-transform"
          aria-label="Previous"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Navigation - Right */}
        <button
          onClick={handleNext}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-zinc-800 rounded-full p-1.5 shadow-sm border border-gray-100 dark:border-zinc-700 active:scale-90 transition-transform"
          aria-label="Next"
        >
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>

        {/* Carousel Content */}
        <div className="overflow-hidden mx-10">
          <AnimatePresence mode="wait">
            {visibleResource && (
              <motion.div
                key={visibleResource[0]}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                   <div className="text-2xl drop-shadow-sm filter">{RESOURCE_ICONS[visibleResource[0]]}</div>
                   <div className="flex flex-col">
                     <span className="text-[10px] font-bold uppercase text-gray-400 dark:text-zinc-500 tracking-wider">
                       {RESOURCE_LABELS[visibleResource[0]]}
                     </span>
                     <div className="flex items-baseline gap-2">
                       <span className="text-lg font-black text-gray-900 dark:text-white tabular-nums tracking-tight leading-none">
                         {formatNumber(visibleResource[1])}
                       </span>
                       {(resourcesPerSecond[visibleResource[0]] || 0) > 0 && (
                         <span className="text-[10px] font-semibold text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded-full">
                           +{formatNumber(resourcesPerSecond[visibleResource[0]] || 0)}/s
                         </span>
                       )}
                     </div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1 mt-1.5">
          {resourceEntries.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-gray-800 dark:bg-white w-3'
                  : 'bg-gray-200 dark:bg-zinc-700 w-1'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
