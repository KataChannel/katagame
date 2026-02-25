'use client';

import { useQuery } from '@apollo/client/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Clock,
  Crown,
  TrendingUp,
  Star,
  CheckCircle2,
  Lock,
  ChevronRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { ERA_TIMELINE, MY_CURRENT_ERA } from '@/lib/graphql/queries';

// Types
interface EraBenefits {
  goldBonus: number;
  riceBonus: number;
  woodBonus: number;
  stoneBonus: number;
  expBonus: number;
  unlockHeroes: string[];
}

interface EraInfo {
  id: string;
  name: string;
  nameEnglish: string;
  description: string;
  emoji: string;
  color: string;
  minStories: number;
  maxStories: number;
  benefits: EraBenefits;
  landmarks: string[];
  isUnlocked: boolean;
  isCurrent: boolean;
  progressPercentage: number;
  requiredStories: number;
  remainingStories: number;
}

interface EraTimeline {
  playerId: string;
  completedStories: number;
  timeline: EraInfo[];
  currentEraIndex: number;
}

interface PlayerCurrentEra {
  playerId: string;
  currentEra: string;
  eraName: string;
  eraEmoji: string;
  completedStories: number;
  benefits: EraBenefits;
  isMaxEra: boolean;
}

export default function EraPage() {
  // Queries
  const { data: timelineData, loading: loadingTimeline } = useQuery<{ eraTimeline: EraTimeline }>(ERA_TIMELINE);
  const { data: currentEraData, loading: loadingCurrent } = useQuery<{ myCurrentEra: PlayerCurrentEra }>(MY_CURRENT_ERA);

  const timeline = timelineData?.eraTimeline;
  const currentEra = currentEraData?.myCurrentEra;

  const isLoading = loadingTimeline || loadingCurrent;

  // Era color mapping
  const getEraGradient = (color: string, isUnlocked: boolean) => {
    if (!isUnlocked) return 'from-gray-600 to-gray-800';
    switch (color) {
      case 'amber': return 'from-amber-500 to-yellow-600';
      case 'green': return 'from-green-500 to-emerald-600';
      case 'blue': return 'from-blue-500 to-cyan-600';
      case 'purple': return 'from-purple-500 to-violet-600';
      case 'red': return 'from-red-500 to-rose-600';
      case 'orange': return 'from-orange-500 to-amber-600';
      default: return 'from-indigo-500 to-purple-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-4 px-3 md:py-8 md:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <div className="flex justify-center items-center gap-3 mb-3">
            <Clock className="w-10 h-10 md:w-12 md:h-12 text-yellow-400" />
            <h1 className="text-2xl md:text-4xl font-bold text-white">
              Dòng Thời Gian
            </h1>
          </div>
          <p className="text-base md:text-xl text-purple-200">
            Khám phá lịch sử Việt Nam qua các thời kỳ
          </p>
        </motion.div>

        {/* Current Era Card */}
        {currentEra && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-md rounded-2xl p-6 mb-8 border border-yellow-400/30"
          >
            <div className="flex items-center gap-4">
              <div className="text-5xl">{currentEra.eraEmoji}</div>
              <div className="flex-1">
                <p className="text-yellow-300 text-sm">Thời kỳ hiện tại</p>
                <h2 className="text-2xl font-bold text-white">{currentEra.eraName}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <BookOpen className="w-4 h-4 text-purple-300" />
                  <span className="text-purple-200 text-sm">
                    {currentEra.completedStories} câu chuyện hoàn thành
                  </span>
                </div>
              </div>
              {currentEra.isMaxEra && (
                <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <Crown className="w-4 h-4" />
                  MAX
                </div>
              )}
            </div>

            {/* Current Era Benefits */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="bg-yellow-500/20 rounded-xl p-3 text-center">
                <p className="text-xs text-yellow-300">Vàng</p>
                <p className="text-lg font-bold text-white">+{currentEra.benefits.goldBonus}%</p>
              </div>
              <div className="bg-green-500/20 rounded-xl p-3 text-center">
                <p className="text-xs text-green-300">Lúa</p>
                <p className="text-lg font-bold text-white">+{currentEra.benefits.riceBonus}%</p>
              </div>
              <div className="bg-amber-500/20 rounded-xl p-3 text-center">
                <p className="text-xs text-amber-300">Gỗ</p>
                <p className="text-lg font-bold text-white">+{currentEra.benefits.woodBonus}%</p>
              </div>
              <div className="bg-purple-500/20 rounded-xl p-3 text-center">
                <p className="text-xs text-purple-300">EXP</p>
                <p className="text-lg font-bold text-white">+{currentEra.benefits.expBonus}%</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-white/20 transform md:-translate-x-1/2" />

          {/* Era Cards */}
          <div className="space-y-6">
            {timeline?.timeline.map((era: EraInfo, index: number) => (
              <motion.div
                key={era.id}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      era.isUnlocked
                        ? era.isCurrent
                          ? 'bg-yellow-400 animate-pulse'
                          : 'bg-green-500'
                        : 'bg-gray-600'
                    }`}
                  >
                    {era.isUnlocked ? (
                      era.isCurrent ? (
                        <Star className="w-4 h-4 text-black fill-black" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Card */}
                <div
                  className={`ml-16 md:ml-0 md:w-5/12 ${
                    index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'
                  }`}
                >
                  <div
                    className={`bg-gradient-to-br ${getEraGradient(era.color, era.isUnlocked)} rounded-2xl overflow-hidden ${
                      era.isCurrent ? 'ring-2 ring-yellow-400' : ''
                    } ${!era.isUnlocked ? 'opacity-60' : ''}`}
                  >
                    {/* Era Header */}
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{era.emoji}</span>
                          <div>
                            <h3 className="text-lg font-bold text-white">{era.name}</h3>
                            <p className="text-xs text-white/70">{era.nameEnglish}</p>
                          </div>
                        </div>
                        {era.isCurrent && (
                          <div className="bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-bold">
                            HIỆN TẠI
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-white/80 mt-3">{era.description}</p>

                      {/* Progress Bar (if not unlocked) */}
                      {!era.isUnlocked && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-white/60 mb-1">
                            <span>Tiến độ</span>
                            <span>{era.remainingStories} story còn thiếu</span>
                          </div>
                          <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-white/50"
                              style={{ width: `${era.progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Landmarks */}
                      {era.landmarks && era.landmarks.length > 0 && era.isUnlocked && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {era.landmarks.slice(0, 3).map((landmark: string, i: number) => (
                            <span
                              key={i}
                              className="text-xs bg-white/20 px-2 py-1 rounded-full text-white"
                            >
                              {landmark}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Benefits */}
                    {era.isUnlocked && (
                      <div className="bg-black/20 p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-yellow-300" />
                          <span className="text-xs text-white/80">Bonus thời kỳ</span>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <span className="bg-yellow-500/30 px-2 py-1 rounded text-yellow-200">
                            Vàng +{era.benefits.goldBonus}%
                          </span>
                          <span className="bg-green-500/30 px-2 py-1 rounded text-green-200">
                            Lúa +{era.benefits.riceBonus}%
                          </span>
                          <span className="bg-purple-500/30 px-2 py-1 rounded text-purple-200">
                            EXP +{era.benefits.expBonus}%
                          </span>
                        </div>

                        {/* Unlocked Heroes */}
                        {era.benefits.unlockHeroes && era.benefits.unlockHeroes.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-base text-yellow-300">👑</span>
                              <span className="text-xs font-semibold text-white/90">Chiêu mộ Anh Hùng:</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {era.benefits.unlockHeroes.map((heroEra, i) => (
                                <span key={i} className="text-[10px] bg-gradient-to-r from-white/10 to-white/5 border border-white/10 px-2 py-1 rounded text-white/90 font-medium">
                                  {heroEra}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats Summary */}
        {timeline && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Thống kê tiến trình
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-400">{timeline.completedStories}</p>
                <p className="text-xs text-purple-200">Story hoàn thành</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">
                  {timeline.timeline.filter((e: EraInfo) => e.isUnlocked).length}
                </p>
                <p className="text-xs text-purple-200">Thời kỳ mở khóa</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-400">
                  {timeline.timeline.length}
                </p>
                <p className="text-xs text-purple-200">Tổng thời kỳ</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">
                  {Math.round((timeline.timeline.filter((e: EraInfo) => e.isUnlocked).length / timeline.timeline.length) * 100)}%
                </p>
                <p className="text-xs text-purple-200">Hoàn thành</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
          >
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
