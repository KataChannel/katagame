/**
 * Passive Buffs Indicator Component
 * MVP2 Sprint 2: Province Skills
 * 
 * Hiển thị các passive buffs đang active từ province levels
 * Mobile First + Responsive design
 */

'use client';

import { motion } from 'framer-motion';
import type { PassiveBuff } from '@/lib/types/mvp1.types';

interface PassiveBuffsIndicatorProps {
  buffs: PassiveBuff[];
  variant?: 'compact' | 'detailed';
}

export default function PassiveBuffsIndicator({ 
  buffs, 
  variant = 'compact' 
}: PassiveBuffsIndicatorProps) {
  if (buffs.length === 0) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap gap-2">
        {buffs.map((buff, index) => (
          <motion.div
            key={buff.source}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-400/30 flex items-center gap-2"
          >
            <span className="text-lg">{buff.icon}</span>
            <span className="text-xs font-semibold text-green-300">
              +{buff.value}%
            </span>
          </motion.div>
        ))}
      </div>
    );
  }

  // Detailed variant
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-2xl">✨</div>
        <h3 className="text-lg font-bold text-white">
          Buff Bị Động ({buffs.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {buffs.map((buff, index) => (
          <motion.div
            key={buff.source}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-400/20 hover:border-green-400/40 transition-colors"
          >
            {/* Icon và Value */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{buff.icon}</span>
                <span className="text-2xl font-bold text-green-400">
                  +{buff.value}%
                </span>
              </div>
              <div className="px-2 py-1 bg-green-500/20 rounded text-xs text-green-300">
                Lv {buff.source.split('_').pop()}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-green-100">{buff.description}</p>

            {/* Source badge */}
            <div className="mt-2 text-xs text-green-400/60">
              {getBuffSourceLabel(buff.source)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/**
 * Helper: Get readable label for buff source
 */
function getBuffSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    FARMER_LEVEL_5: 'Nông dân cấp 5',
    FARMER_LEVEL_10: 'Nông dân cấp 10',
    FARMER_LEVEL_15: 'Nông dân cấp 15',
    RESOURCE_LEVEL_5: 'Tài nguyên cấp 5',
    RESOURCE_LEVEL_10: 'Tài nguyên cấp 10',
    RESOURCE_LEVEL_15: 'Tài nguyên cấp 15',
    DEVELOPMENT_LEVEL_5: 'Phát triển cấp 5',
    DEVELOPMENT_LEVEL_10: 'Phát triển cấp 10',
    DEVELOPMENT_LEVEL_15: 'Phát triển cấp 15',
  };

  return labels[source] || source;
}
