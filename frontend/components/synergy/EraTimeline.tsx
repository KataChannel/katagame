'use client';

import { motion } from 'framer-motion';
import { Check, Lock, TrendingUp, Star, Award } from 'lucide-react';
import { EraTimeline as EraTimelineType } from '@/lib/types/mvp1.types';

interface EraTimelineProps {
  timelineData: EraTimelineType;
}

/**
 * EraTimeline Component - MVP2 Sprint 4
 * Horizontal timeline showing historical eras progression
 * Ancient → Medieval → Modern → Future
 */
export default function EraTimeline({ timelineData }: EraTimelineProps) {
  const { timeline, completedStories, currentEraIndex } = timelineData;

  return (
    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          🏛️ Tiến Trình Lịch Sử
        </h2>
        <p className="text-sm text-gray-600">
          Hoàn thành câu chuyện để mở khóa các thời kỳ mới
        </p>
        
        {/* Overall Progress */}
        <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-600">Câu chuyện đã hoàn thành</div>
            <div className="text-2xl font-bold text-purple-600">{completedStories}</div>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedStories / 100) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500"
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-0 right-0 top-20 h-1 bg-gray-200 md:block hidden" />
        <div 
          className="absolute left-0 top-20 h-1 bg-gradient-to-r from-purple-500 to-blue-500 md:block hidden"
          style={{ width: `${(currentEraIndex / (timeline.length - 1)) * 100}%` }}
        />

        {/* Era Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {timeline.map((era, index) => {
            const isCompleted = index < currentEraIndex;
            const isPast = index < currentEraIndex;
            const isCurrent = era.isCurrent;
            const isFuture = index > currentEraIndex;

            return (
              <motion.div
                key={era.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                {/* Era Card */}
                <div
                  className={`
                    relative rounded-lg p-5 border-2 transition-all duration-300
                    ${isCurrent 
                      ? 'bg-white border-purple-500 shadow-xl ring-4 ring-purple-200' 
                      : era.isUnlocked
                      ? 'bg-white border-gray-300 shadow-md hover:shadow-lg'
                      : 'bg-gray-100 border-gray-300 opacity-60'
                    }
                  `}
                  style={{ borderColor: era.isUnlocked ? era.color : '#D1D5DB' }}
                >
                  {/* Era Badge */}
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div
                      className={`
                        w-14 h-14 rounded-full flex items-center justify-center text-3xl
                        border-4 border-white shadow-lg
                        ${era.isUnlocked ? 'bg-gradient-to-br' : 'bg-gray-300'}
                      `}
                      style={{
                        background: era.isUnlocked ? `linear-gradient(135deg, ${era.color}, ${era.color}dd)` : undefined,
                      }}
                    >
                      {era.emoji}
                    </div>
                  </div>

                  {/* Status Icon */}
                  <div className="absolute -top-2 -right-2">
                    {isCompleted && (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                    {isCurrent && (
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center animate-pulse">
                        <Star className="w-5 h-5 text-white fill-white" />
                      </div>
                    )}
                    {isFuture && !era.isUnlocked && (
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
                        <Lock className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Era Info */}
                  <div className="mt-8 text-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{era.name}</h3>
                    <p className="text-xs text-gray-500">{era.nameEnglish}</p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{era.description}</p>
                  </div>

                  {/* Progress Bar (for current era) */}
                  {isCurrent && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Tiến độ</span>
                        <span className="font-semibold">{Math.round(era.progressPercentage)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${era.progressPercentage}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${era.color}, ${era.color}cc)` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Unlock Requirements */}
                  {!era.isUnlocked && (
                    <div className="bg-gray-200 rounded-lg p-3 mb-3">
                      <div className="text-xs text-gray-600 mb-1">Yêu cầu mở khóa:</div>
                      <div className="font-bold text-gray-800">
                        {era.requiredStories} câu chuyện
                      </div>
                      <div className="text-xs text-red-600 mt-1">
                        Còn {era.remainingStories} câu chuyện
                      </div>
                    </div>
                  )}

                  {/* Benefits */}
                  {era.isUnlocked && (
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-3 mb-3">
                      <div className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Lợi ích:
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {era.benefits.goldBonus > 0 && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-yellow-600" />
                            <span>+{era.benefits.goldBonus}% Vàng</span>
                          </div>
                        )}
                        {era.benefits.riceBonus > 0 && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-green-600" />
                            <span>+{era.benefits.riceBonus}% Lúa</span>
                          </div>
                        )}
                        {era.benefits.expBonus > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-purple-600" />
                            <span>+{era.benefits.expBonus}% Exp</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Landmarks */}
                  {era.landmarks && era.landmarks.length > 0 && (
                    <div className="border-t border-gray-200 pt-3">
                      <div className="text-xs font-bold text-gray-700 mb-2">Sự kiện nổi bật:</div>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {era.landmarks.slice(0, 3).map((landmark, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-purple-500 mt-0.5">•</span>
                            <span>{landmark}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Connection Line (mobile) */}
                {index < timeline.length - 1 && (
                  <div className="md:hidden flex justify-center my-4">
                    <div className="w-1 h-8 bg-gray-300" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-100 border border-blue-300 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-2">Cách mở khóa thời kỳ mới:</p>
            <ul className="text-xs space-y-1">
              <li>• Hoàn thành câu chuyện hàng ngày và trả lời đúng trắc nghiệm</li>
              <li>• Mỗi thời kỳ mở khóa tăng % sản xuất tài nguyên và kinh nghiệm</li>
              <li>• Thời kỳ mới mở khóa anh hùng và tính năng đặc biệt</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
