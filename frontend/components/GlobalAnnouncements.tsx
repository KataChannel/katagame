import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Zap, Crown, Gem, Bell } from 'lucide-react';
import { useGameStore } from '@/lib/gameStore';

const GlobalAnnouncements = () => {
  const { globalAnnouncements } = useGameStore();

  if (globalAnnouncements.length === 0) return null;

  // Show only the latest announcement
  const announcement = globalAnnouncements[globalAnnouncements.length - 1];

  const getIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <Crown className="w-5 h-5 text-yellow-400" />;
      case 'achievement': return <Bell className="w-5 h-5 text-blue-400" />;
      case 'event': return <Zap className="w-5 h-5 text-orange-400" />;
      default: return <Megaphone className="w-5 h-5 text-purple-400" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'purchase': return 'from-yellow-900/80 to-purple-900/80 border-yellow-500/50';
      case 'achievement': return 'from-blue-900/80 to-indigo-900/80 border-blue-500/50';
      case 'event': return 'from-orange-900/80 to-red-900/80 border-orange-500/50';
      default: return 'from-purple-900/80 to-pink-900/80 border-purple-500/50';
    }
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-4 pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={announcement.id}
          initial={{ y: -50, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0, scale: 0.9 }}
          className={`bg-gradient-to-r ${getBgColor(announcement.type)} backdrop-blur-md border rounded-full px-6 py-2 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center gap-4 overflow-hidden`}
        >
          <div className="flex-shrink-0 bg-black/30 p-2 rounded-full">
            {getIcon(announcement.type)}
          </div>
          
          <div className="flex-1 overflow-hidden">
            <motion.p 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              className="text-white font-bold text-sm whitespace-nowrap"
            >
              {announcement.message}
            </motion.p>
          </div>

          <div className="flex-shrink-0">
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_red]"
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default GlobalAnnouncements;
