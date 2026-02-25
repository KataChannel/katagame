'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Info, Gavel, MapPin, X } from 'lucide-react';

interface Relic {
  id: string;
  name: string;
  description: string;
  era: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isOwned: boolean;
  placedAt?: string; // Province name if placed
  auraType?: string;
  auraValue?: number;
}

interface RelicShowcaseProps {
  relics: Relic[];
  onCraft: (relicId: string) => void;
  onPlace: (relicId: string) => void;
}

export default function RelicShowcase({ relics, onCraft, onPlace }: RelicShowcaseProps) {
  const [selectedRelic, setSelectedRelic] = useState<Relic | null>(null);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]';
      case 'epic': return 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]';
      case 'rare': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getPedestalStyle = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-yellow-900/20 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]';
      case 'epic': return 'bg-purple-900/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]';
      case 'rare': return 'bg-blue-900/20 border-blue-500/50';
      default: return 'bg-gray-800/50 border-gray-700';
    }
  };

  return (
    <div className="relative min-h-[600px] p-6 rounded-xl bg-[url('/assets/images/wood-pattern.png')] bg-cover bg-no-repeat overflow-hidden border-4 border-yellow-900/50 shadow-2xl">
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10">
        <h2 className="text-3xl font-serif text-center text-yellow-500 mb-8 tracking-widest uppercase border-b border-white/10 pb-4">
          🏛️ Bảo Tàng Cổ Vật
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {relics.map((relic, index) => (
            <motion.div
              key={relic.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedRelic(relic)}
              className={`relative cursor-pointer aspect-square rounded-full flex items-center justify-center border-2 transition-all group ${getPedestalStyle(relic.rarity)}`}
            >
              {/* Relic Icon Placeholder - Replace with actual images later */}
              <div className={`text-4xl ${relic.isOwned ? 'opacity-100' : 'opacity-30 grayscale'}`}>
                {/* Dynamically assign emoji based on name keyword provided by seed data */}
                {relic.name.includes('Trống') ? '🥁' :
                 relic.name.includes('Nỏ') ? '🏹' :
                 relic.name.includes('Ấn') ? '📜' :
                 relic.name.includes('Kiếm') ? '⚔️' :
                 relic.name.includes('Đỉnh') ? '🏺' : '💎'}
              </div>

              {/* Status Indicator */}
              {relic.isOwned ? (
                <div className="absolute -bottom-2 px-2 py-0.5 bg-green-900/90 text-green-400 text-[10px] rounded border border-green-500/50 uppercase font-bold tracking-wider">
                  Đã sở hữu
                </div>
              ) : (
                <div className="absolute -bottom-2 px-2 py-0.5 bg-gray-900/90 text-gray-500 text-[10px] rounded border border-gray-700 uppercase font-bold tracking-wider">
                  Chưa có
                </div>
              )}

              {/* Placed Status */}
              {relic.placedAt && (
                <div className="absolute -top-2 right-0 bg-red-900 text-red-200 text-[10px] px-1.5 py-0.5 rounded-full border border-red-500 flex items-center gap-1 shadow-lg z-10">
                  <MapPin size={8} /> {relic.placedAt}
                </div>
              )}

              {/* Shine Effect */}
              {relic.rarity === 'legendary' && (
                 <div className="absolute inset-0 rounded-full bg-yellow-400/10 animate-pulse" />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRelic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border-2 border-yellow-700/50 w-full max-w-md rounded-2xl p-6 relative shadow-2xl"
            >
              <button
                onClick={() => setSelectedRelic(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-6">
                <div className="text-6xl mb-4 animate-bounce">
                  {selectedRelic.name.includes('Trống') ? '🥁' :
                   selectedRelic.name.includes('Nỏ') ? '🏹' :
                   selectedRelic.name.includes('Ấn') ? '📜' :
                   selectedRelic.name.includes('Kiếm') ? '⚔️' :
                   selectedRelic.name.includes('Đỉnh') ? '🏺' : '💎'}
                </div>
                <h3 className={`text-2xl font-bold ${getRarityColor(selectedRelic.rarity)} uppercase tracking-wide`}>
                  {selectedRelic.name}
                </h3>
                <p className="text-yellow-600/80 text-sm font-serif italic mt-1">
                  Thời kỳ: {selectedRelic.era || 'Không xác định'}
                </p>
              </div>

              <div className="bg-black/30 p-4 rounded-lg mb-6 border border-white/5">
                <p className="text-gray-300 text-sm leading-relaxed text-center">
                  "{selectedRelic.description}"
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm text-gray-400 border-b border-white/10 pb-2">
                  <span>✨ Hiệu ứng:</span>
                  <span className="text-green-400 font-bold">
                    +{Math.round((selectedRelic.auraValue || 0) * 100)}% {selectedRelic.auraType === 'production_all' ? 'Sản lượng' : 'Sức mạnh'}
                  </span>
                </div>
                
                {selectedRelic.isOwned ? (
                  selectedRelic.placedAt ? (
                    <div className="w-full py-3 bg-gray-800 text-gray-400 rounded-lg font-bold text-center border border-gray-700 flex items-center justify-center gap-2">
                      <MapPin size={18} /> Đã đặt tại {selectedRelic.placedAt}
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        onPlace(selectedRelic.id);
                        setSelectedRelic(null);
                      }}
                      className="w-full py-3 bg-red-700 hover:bg-red-600 text-white rounded-lg font-bold transition-colors border border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2"
                    >
                      <MapPin size={18} /> Đặt vào lãnh địa
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => {
                      onCraft(selectedRelic.id);
                      setSelectedRelic(null);
                    }}
                    className="w-full py-3 bg-yellow-700 hover:bg-yellow-600 text-white rounded-lg font-bold transition-colors border border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)] flex items-center justify-center gap-2"
                  >
                    <Gavel size={18} /> Chế tác (Triệu hồi)
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
