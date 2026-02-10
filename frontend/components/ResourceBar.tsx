import { Coins, Wheat, TreePine, Mountain, Flame, Scroll, Gem } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';
import { useEffect } from 'react';
import { syncPlayerFromApi } from '@/lib/hooks/useApiDataSync';
import { formatNumber } from '@/lib/utils'; // Standard formatter

const ResourceBar = () => {
  const player = useGameStore((state) => state.player);
  
  // Sync player data on mount to ensure fresh resources
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token) {
      syncPlayerFromApi().catch(err => {
        console.warn('Failed to sync player resources in ResourceBar:', err);
      });
    }
  }, []);

  // Get resources from player (either from resources field or totalResources fallback)
  const resources = player?.resources || player?.totalResources || {
    gold: 0,
    rice: 0,
    lumber: 0,
    stone: 0,
    culture: 0,
    bazan: 0,
    gems: 0,
  };

  const resourceItems = [
    { key: 'gold', icon: Coins, color: 'text-yellow-400', label: 'Vàng' },
    { key: 'rice', icon: Wheat, color: 'text-green-400', label: 'Lúa' },
    { key: 'lumber', icon: TreePine, color: 'text-amber-500', label: 'Gỗ' },
    { key: 'stone', icon: Mountain, color: 'text-gray-400', label: 'Đá' },
    { key: 'bazan', icon: Flame, color: 'text-red-500', label: 'Bazan' },
    { key: 'gems', icon: Gem, color: 'text-cyan-400', label: 'Kim Cương' },
    { key: 'culture', icon: Scroll, color: 'text-purple-400', label: 'Văn Hóa' },
  ];

  return (
    <div className="bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-2 sm:p-3 overflow-x-auto no-scrollbar">
      <div className="flex justify-between items-center gap-2 sm:gap-4 md:gap-6 min-w-max">
        {resourceItems.map(({ key, icon: Icon, color, label }, index) => {
          const value = resources[key as keyof typeof resources] || 0;
          
          return (
            <motion.div 
              key={key} 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-900 rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 border border-gray-100 dark:border-zinc-800"
              title={`${label}: ${value.toLocaleString()}`}
            >
              <div className={`p-1 rounded-md bg-white dark:bg-zinc-800 shadow-sm ${color.replace('text-', 'bg-').replace('400', '100').replace('500', '100')} bg-opacity-20`}>
                <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${color}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-gray-400 leading-none mb-0.5">{label}</span>
                <motion.div 
                  key={value}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-xs sm:text-sm font-black text-gray-900 dark:text-gray-100 leading-none"
                >
                  {formatNumber(value)}
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ResourceBar;