'use client';

import { motion } from 'framer-motion';
import { Lock, TrendingUp } from 'lucide-react';
import type { NavigationItem } from '@/lib/navigationService';

interface LockedFeatureCardProps {
  feature: NavigationItem;
  onUpgradeClick?: () => void;
}

export function LockedFeatureCard({ feature, onUpgradeClick }: LockedFeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-dashed border-gray-300 relative overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
          backgroundSize: '20px 20px',
        }} />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center bg-white shadow-sm"
              style={{ color: feature.color }}
            >
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {feature.labelVietnamese || feature.label}
              </h3>
              <p className="text-xs text-gray-500">
                Mở khóa ở cấp {feature.unlockLevel}
              </p>
            </div>
          </div>

          {/* Unlock level badge */}
          <div 
            className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: feature.color }}
          >
            Lv {feature.unlockLevel}
          </div>
        </div>

        {/* Unlock requirement */}
        {feature.unlockRequirement && (
          <div className="mb-3 px-3 py-2 bg-white rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600">
              <span className="font-medium">Yêu cầu: </span>
              {getRequirementText(feature.unlockRequirement)}
            </p>
          </div>
        )}

        {/* Upgrade CTA */}
        <button
          onClick={onUpgradeClick}
          className="w-full px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
          style={{
            backgroundColor: `${feature.color}15`,
            color: feature.color,
          }}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Nâng Cấp Để Mở Khóa</span>
        </button>
      </div>
    </motion.div>
  );
}

// Helper to convert requirement keys to Vietnamese text
function getRequirementText(requirement: string): string {
  const requirementMap: Record<string, string> = {
    'tutorial_step_1': 'Hoàn thành hướng dẫn bước 1',
    'tutorial_step_2': 'Hoàn thành hướng dẫn bước 2',
    'tutorial_step_3': 'Hoàn thành hướng dẫn bước 3',
    'tutorial_step_4': 'Hoàn thành hướng dẫn bước 4',
    'tutorial_step_5': 'Hoàn thành hướng dẫn bước 5',
    'tutorial_step_6': 'Hoàn thành hướng dẫn bước 6',
    'has_hero': 'Tuyển mộ ít nhất 1 anh hùng',
    'achievement_hero_collector': 'Đạt thành tựu "Người Sưu Tầm Anh Hùng"',
    'tutorial_completed': 'Hoàn thành toàn bộ hướng dẫn',
  };

  return requirementMap[requirement] || requirement;
}

interface LockedFeaturesListProps {
  features: NavigationItem[];
  onUpgradeClick?: () => void;
}

export function LockedFeaturesList({ features, onUpgradeClick }: LockedFeaturesListProps) {
  if (features.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Lock className="w-5 h-5 text-gray-400" />
        <h2 className="text-lg font-bold text-gray-900">
          Tính Năng Sắp Mở Khóa
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => (
          <LockedFeatureCard
            key={feature.key}
            feature={feature}
            onUpgradeClick={onUpgradeClick}
          />
        ))}
      </div>
    </div>
  );
}
