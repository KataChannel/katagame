'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAchievements } from '@/lib/useMVP1Data';
import { Trophy, Star, Lock, Gift, Sparkles, Award, Target, Crown } from 'lucide-react';

export default function Achievements() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { achievements, isLoading, error, refreshAchievements } = useAchievements();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24 md:pb-6">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-yellow-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thành tựu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24 md:pb-6">
        <div className="text-center">
          <Award className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Lỗi: {error}</p>
          <button
            onClick={refreshAchievements}
            className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const achievementsData = achievements || [];
  const unlockedCount = achievementsData.filter((a: any) => a.unlocked || a.claimed).length;
  const totalCount = achievementsData.length;
  const completionRate = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const categories = ['all', ...Array.from(new Set(achievementsData.map((a: any) => a.category || 'general')))];

  const filteredAchievements = selectedCategory === 'all' 
    ? achievementsData 
    : achievementsData.filter((a: any) => (a.category || 'general') === selectedCategory);

  return (
    <div className="min-h-screen pb-24 md:pb-6 bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Trophy className="w-8 h-8" />
          Thành Tựu
        </h1>
        <p className="text-yellow-100">Hoàn thành nhiệm vụ để nhận phần thưởng</p>
        
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <Star className="w-6 h-6 mx-auto mb-1" />
            <div className="text-2xl font-bold">{unlockedCount}</div>
            <div className="text-xs text-yellow-100">Đã mở khóa</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <Target className="w-6 h-6 mx-auto mb-1" />
            <div className="text-2xl font-bold">{totalCount}</div>
            <div className="text-xs text-yellow-100">Tổng số</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <Crown className="w-6 h-6 mx-auto mb-1" />
            <div className="text-2xl font-bold">{completionRate}%</div>
            <div className="text-xs text-yellow-100">Hoàn thành</div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Lọc theo danh mục:</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 \${selectedCategory === category ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md scale-105' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              {getCategoryName(category)}
            </button>
          ))}
        </div>
      </div>

      {filteredAchievements.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Lock className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Chưa có thành tựu</p>
          <p className="text-sm">Hãy bắt đầu chơi để mở khóa thành tựu!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAchievements.map((achievement: any) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      )}
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: any }) {
  const isUnlocked = achievement.unlocked || achievement.claimed;
  const progress = achievement.progress || 0;
  const maxProgress = achievement.max_progress || achievement.maxProgress || 100;
  const progressPercent = Math.min((progress / maxProgress) * 100, 100);
  const isCompleted = progress >= maxProgress;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-white rounded-xl shadow-lg overflow-hidden \${isUnlocked ? 'border-2 border-yellow-400' : 'border-2 border-gray-200'} transition-all duration-200 hover:shadow-xl`}
    >
      {!isUnlocked && (
        <div className="absolute inset-0 bg-black bg-opacity-30 z-10 flex items-center justify-center">
          <Lock className="w-12 h-12 text-white opacity-75" />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-4 mb-3">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl \${isUnlocked ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-gray-200'}`}>
            {getAchievementIcon(achievement.category)}
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 mb-1">
              {achievement.name || achievement.title || 'Thành tựu'}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {achievement.description || 'Hoàn thành nhiệm vụ để nhận phần thưởng'}
            </p>
          </div>

          {achievement.rarity && (
            <div className={`px-2 py-1 rounded-full text-xs font-bold \${getRarityStyle(achievement.rarity)}`}>
              {achievement.rarity}
            </div>
          )}
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Tiến độ</span>
            <span className="font-semibold">{progress}/{maxProgress}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
              className={`h-full \${isCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-yellow-400 to-orange-500'}`}
            />
          </div>
        </div>

        {(achievement.reward_gold || achievement.reward_exp) && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-yellow-600" />
              <span className="text-xs font-semibold text-yellow-800">Phần thưởng</span>
            </div>
            <div className="flex gap-3 flex-wrap text-sm">
              {achievement.reward_gold && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-600">💰</span>
                  <span className="font-semibold">{achievement.reward_gold.toLocaleString()}</span>
                  <span className="text-gray-600">vàng</span>
                </div>
              )}
              {achievement.reward_exp && (
                <div className="flex items-center gap-1">
                  <span className="text-blue-600">⭐</span>
                  <span className="font-semibold">{achievement.reward_exp.toLocaleString()}</span>
                  <span className="text-gray-600">EXP</span>
                </div>
              )}
            </div>
          </div>
        )}

        {isCompleted && !achievement.claimed && (
          <button className="w-full mt-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg">
            <Sparkles className="w-4 h-4 inline mr-2" />
            Nhận thưởng
          </button>
        )}

        {achievement.claimed && (
          <div className="mt-3 bg-green-100 text-green-700 py-2 rounded-lg font-bold text-center border border-green-300">
            ✓ Đã hoàn thành
          </div>
        )}
      </div>
    </motion.div>
  );
}

function getCategoryName(category: string): string {
  const map: any = {
    all: '🏆 Tất cả',
    general: '📌 Chung',
    combat: '⚔️ Chiến đấu',
    economy: '💰 Kinh tế',
    exploration: '🗺️ Khám phá',
    social: '👥 Xã hội',
    collection: '📦 Sưu tập',
    story: '📖 Cốt truyện',
  };
  return map[category] || category;
}

function getAchievementIcon(category: string): string {
  const map: any = {
    general: '📌',
    combat: '⚔️',
    economy: '💰',
    exploration: '🗺️',
    social: '👥',
    collection: '📦',
    story: '📖',
  };
  return map[category] || '��';
}

function getRarityStyle(rarity: string): string {
  const map: any = {
    common: 'bg-gray-200 text-gray-700',
    rare: 'bg-blue-200 text-blue-700',
    epic: 'bg-purple-200 text-purple-700',
    legendary: 'bg-yellow-200 text-yellow-700',
  };
  return map[rarity.toLowerCase()] || 'bg-gray-200 text-gray-700';
}
