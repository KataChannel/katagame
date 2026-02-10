'use client';

import { useQuery } from '@apollo/client/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import WuXingCycle from '@/components/synergy/WuXingCycle';
import EraTimeline from '@/components/synergy/EraTimeline';
import { WU_XING_CYCLE, ERA_TIMELINE } from '@/lib/graphql/queries';
import { WuXingCycleData, EraTimeline as EraTimelineType } from '@/lib/types/mvp1.types';

/**
 * Synergy Page - MVP2 Sprint 4
 * Integration page for Wu Xing Cycle and Era Timeline
 */
export default function SynergyPage() {
  const router = useRouter();

  // Query Wu Xing cycle data
  const { 
    data: cycleData, 
    loading: cycleLoading, 
    error: cycleError 
  } = useQuery(WU_XING_CYCLE);

  // Query Era timeline data
  const { 
    data: timelineData, 
    loading: timelineLoading, 
    error: timelineError 
  } = useQuery(ERA_TIMELINE);

  // Loading state
  if (cycleLoading || timelineLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (cycleError || timelineError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center text-red-600 max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Lỗi tải dữ liệu</p>
          <p className="text-sm mt-2">
            {cycleError?.message || timelineError?.message}
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Quay Lại
          </button>
        </div>
      </div>
    );
  }

  const cycle: WuXingCycleData = cycleData?.wuXingCycle;
  const timeline: EraTimelineType = timelineData?.eraTimeline;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 pb-24 md:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-purple-100 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="text-5xl">☯️</div>
            <div>
              <h1 className="text-3xl font-bold">Tương Sinh & Lịch Sử</h1>
              <p className="text-purple-100 text-sm mt-1">
                Hệ thống Ngũ Hành và Tiến trình các thời kỳ lịch sử
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-purple-700 rounded-lg p-3">
              <div className="text-xs text-purple-200">Chu Kỳ Ngũ Hành</div>
              <div className="text-2xl font-bold">{Math.round(cycle?.cycleCompletion || 0)}%</div>
            </div>
            <div className="bg-purple-700 rounded-lg p-3">
              <div className="text-xs text-purple-200">Thưởng Tài Nguyên</div>
              <div className="text-2xl font-bold">+{cycle?.totalBonus || 0}%</div>
            </div>
            <div className="bg-purple-700 rounded-lg p-3">
              <div className="text-xs text-purple-200">Câu Chuyện</div>
              <div className="text-2xl font-bold">{timeline?.completedStories || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Wu Xing Cycle Section */}
        {cycle && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <WuXingCycle cycleData={cycle} />
          </motion.section>
        )}

        {/* Era Timeline Section */}
        {timeline && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <EraTimeline timelineData={timeline} />
          </motion.section>
        )}

        {/* Combined Benefits Summary */}
        {cycle && timeline && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg shadow-lg p-6 border-2 border-yellow-400"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              🎁 Tổng Hợp Lợi Ích
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Wu Xing Benefits */}
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                  ☯️ Ngũ Hành
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tương sinh hoạt động:</span>
                    <span className="font-bold text-green-600">
                      {cycle.activeSynergies.length}/5
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thưởng sản xuất:</span>
                    <span className="font-bold text-green-600">
                      +{cycle.totalBonus}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hoàn thành chu kỳ:</span>
                    <span className="font-bold text-green-600">
                      {Math.round(cycle.cycleCompletion)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Era Benefits */}
              <div className="bg-white rounded-lg p-4">
                <h3 className="font-bold text-purple-700 mb-3 flex items-center gap-2">
                  🏛️ Thời Kỳ Hiện Tại
                </h3>
                <div className="space-y-2 text-sm">
                  {timeline.timeline[timeline.currentEraIndex] && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Era:</span>
                        <span className="font-bold text-purple-600">
                          {timeline.timeline[timeline.currentEraIndex].emoji}{' '}
                          {timeline.timeline[timeline.currentEraIndex].name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thưởng vàng:</span>
                        <span className="font-bold text-yellow-600">
                          +{timeline.timeline[timeline.currentEraIndex].benefits.goldBonus}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thưởng exp:</span>
                        <span className="font-bold text-purple-600">
                          +{timeline.timeline[timeline.currentEraIndex].benefits.expBonus}%
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Total Combined Bonus */}
            <div className="mt-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg p-4 text-center">
              <div className="text-sm font-semibold text-yellow-900 mb-1">
                Tổng Lợi Ích Cộng Dồn
              </div>
              <div className="text-3xl font-bold text-white">
                +{cycle.totalBonus + (timeline.timeline[timeline.currentEraIndex]?.benefits.goldBonus || 0)}%
              </div>
              <div className="text-xs text-yellow-100 mt-1">
                Sản xuất tài nguyên và kinh nghiệm
              </div>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
