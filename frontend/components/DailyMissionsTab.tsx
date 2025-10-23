'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Gift, Trophy, Star, CheckCircle, Clock, TrendingUp,
  Award, Sparkles, Target, Flame, Zap, AlertCircle, ChevronRight,
  Users, Coins, Crown
} from 'lucide-react';
import { useGameStore } from '@/lib/gameStore';
import {
  canClaimMission,
  getMissionProgress,
  getTimeUntilExpiry,
  getRewardIcon,
  getTotalDailyProgress,
  getTotalWeeklyProgress,
  type Mission,
  type LoginDay,
  type GameEvent,
  type MissionReward,
} from '@/lib/dailyMissionSystem';

type SubTab = 'daily' | 'weekly' | 'login' | 'events';

export default function DailyMissionsTab() {
  const {
    player,
    dailyMissionState,
    initializeDailyMissions,
    claimMissionReward,
    claimDailyLoginReward,
  } = useGameStore();

  const [activeSubTab, setActiveSubTab] = useState<SubTab>('daily');
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [claimedRewards, setClaimedRewards] = useState<MissionReward[]>([]);

  // Initialize missions
  useEffect(() => {
    if (!dailyMissionState) {
      initializeDailyMissions();
    }
  }, [dailyMissionState, initializeDailyMissions]);

  if (!dailyMissionState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900">
        <div className="text-center">
          <Gift className="w-16 h-16 mx-auto text-white animate-pulse" />
          <p className="mt-4 text-xl text-white">Đang Tải Nhiệm Vụ...</p>
        </div>
      </div>
    );
  }

  const dailyProgress = getTotalDailyProgress(dailyMissionState.dailyMissions);
  const weeklyProgress = getTotalWeeklyProgress(dailyMissionState.weeklyMissions);
  const loginStreak = dailyMissionState.loginRewards.currentStreak;
  const activeEvents = dailyMissionState.activeEvents.filter((e: GameEvent) => e.isActive);

  const handleClaimMission = (missionId: string) => {
    const result = claimMissionReward(missionId);
    if (result.success && result.rewards) {
      setClaimedRewards(result.rewards);
      setShowRewardModal(true);
    }
  };

  const handleClaimLogin = (dayNumber: number) => {
    const result = claimDailyLoginReward(dayNumber);
    if (result.success && result.rewards) {
      setClaimedRewards(result.rewards);
      setShowRewardModal(true);
    }
  };

  const subNavItems = [
    { key: 'daily' as SubTab, label: 'Hàng Ngày', icon: Target },
    { key: 'weekly' as SubTab, label: 'Hàng Tuần', icon: Trophy },
    { key: 'login' as SubTab, label: 'Điểm Danh', icon: Calendar },
    { key: 'events' as SubTab, label: 'Sự Kiện', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 pb-24">
      {/* Reward Modal */}
      <AnimatePresence>
        {showRewardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-gray-900 rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 text-center bg-gradient-to-r from-yellow-500 to-orange-600">
                <div className="text-6xl mb-2">🎉</div>
                <h3 className="text-2xl font-bold text-white">Nhận Thưởng!</h3>
              </div>

              <div className="p-6">
                <p className="text-gray-300 mb-4">Phần Thưởng Đã Nhận:</p>
                <div className="space-y-2">
                  {claimedRewards.map((reward, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{getRewardIcon(reward.type)}</span>
                        <span className="text-white font-medium">
                          {reward.itemName || reward.type}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-yellow-400">
                        ×{reward.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setShowRewardModal(false);
                    setClaimedRewards([]);
                  }}
                  className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Nhiệm Vụ & Sự Kiện</h2>
              <p className="text-purple-100 text-sm">Hoàn thành nhiệm vụ nhận thưởng</p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <Target className="w-5 h-5 mx-auto mb-1 text-yellow-300" />
            <p className="text-2xl font-bold text-white">{dailyProgress}%</p>
            <p className="text-xs text-gray-200">Hằng Ngày</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <Trophy className="w-5 h-5 mx-auto mb-1 text-purple-300" />
            <p className="text-2xl font-bold text-white">{weeklyProgress}%</p>
            <p className="text-xs text-gray-200">Hằng Tuần</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
            <Flame className="w-5 h-5 mx-auto mb-1 text-orange-300" />
            <p className="text-2xl font-bold text-white">{loginStreak}</p>
            <p className="text-xs text-gray-200">Streak</p>
          </div>
        </div>

        {/* Active Events Banner */}
        {activeEvents.length > 0 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400 rounded-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <p className="text-white font-semibold">
                {activeEvents.length} Sự Kiện Đang Diễn Ra!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sub Navigation */}
      <div className="flex overflow-x-auto bg-gray-800/50 backdrop-blur-sm px-4 py-3 gap-2">
        {subNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSubTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveSubTab(item.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeSubTab === 'daily' && (
          <DailyMissionsSubTab
            missions={dailyMissionState.dailyMissions}
            onClaimMission={handleClaimMission}
          />
        )}

        {activeSubTab === 'weekly' && (
          <WeeklyMissionsSubTab
            missions={dailyMissionState.weeklyMissions}
            onClaimMission={handleClaimMission}
          />
        )}

        {activeSubTab === 'login' && (
          <LoginRewardsSubTab
            loginRewards={dailyMissionState.loginRewards}
            onClaimReward={handleClaimLogin}
          />
        )}

        {activeSubTab === 'events' && (
          <EventsSubTab events={dailyMissionState.activeEvents} />
        )}
      </div>
    </div>
  );
}

// ============= SUB COMPONENTS =============

function DailyMissionsSubTab({
  missions,
  onClaimMission,
}: {
  missions: Mission[];
  onClaimMission: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-yellow-400" />
          Nhiệm Vụ Hàng Ngày
        </h3>

        {missions.map((mission) => {
          const progress = getMissionProgress(mission);
          const canClaim = canClaimMission(mission);
          const timeLeft = getTimeUntilExpiry(mission.expiresAt);

          return (
            <motion.div
              key={mission.id}
              className={`p-4 rounded-lg mb-3 transition-all ${
                mission.claimed
                  ? 'bg-gray-700/50 opacity-60'
                  : 'bg-gradient-to-r from-purple-900/50 to-blue-900/50 hover:from-purple-800/50 hover:to-blue-800/50'
              }`}
              whileHover={{ scale: mission.claimed ? 1 : 1.02 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white mb-1">{mission.name}</h4>
                  <p className="text-sm text-gray-300">{mission.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-400">{timeLeft}</span>
                  </div>
                </div>
                {mission.claimed && (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300">
                    {mission.currentProgress} / {mission.requirement}
                  </span>
                  <span className="text-sm font-bold text-white">{progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Rewards */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  {mission.rewards.map((reward, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-800/50 rounded-lg"
                    >
                      <span className="text-lg">{getRewardIcon(reward.type)}</span>
                      <span className="text-sm text-white font-medium">
                        {reward.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onClaimMission(mission.id)}
                  disabled={!canClaim || mission.claimed}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    canClaim && !mission.claimed
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {mission.claimed ? 'Đã Nhận' : canClaim ? 'Nhận Thưởng' : 'Chưa Xong'}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function WeeklyMissionsSubTab({
  missions,
  onClaimMission,
}: {
  missions: Mission[];
  onClaimMission: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-purple-400" />
          Nhiệm Vụ Hàng Tuần
        </h3>

        {missions.map((mission) => {
          const progress = getMissionProgress(mission);
          const canClaim = canClaimMission(mission);
          const timeLeft = getTimeUntilExpiry(mission.expiresAt);

          return (
            <motion.div
              key={mission.id}
              className={`p-4 rounded-lg mb-3 transition-all ${
                mission.claimed
                  ? 'bg-gray-700/50 opacity-60'
                  : 'bg-gradient-to-r from-purple-900/50 to-pink-900/50 hover:from-purple-800/50 hover:to-pink-800/50'
              }`}
              whileHover={{ scale: mission.claimed ? 1 : 1.02 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    <h4 className="text-lg font-bold text-white">{mission.name}</h4>
                  </div>
                  <p className="text-sm text-gray-300">{mission.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-400">Reset: {timeLeft}</span>
                  </div>
                </div>
                {mission.claimed && (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                )}
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-300">
                    {mission.currentProgress} / {mission.requirement}
                  </span>
                  <span className="text-sm font-bold text-white">{progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Rewards */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {mission.rewards.map((reward, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 px-3 py-1 bg-purple-900/50 rounded-lg border border-purple-500/30"
                    >
                      <span className="text-xl">{getRewardIcon(reward.type)}</span>
                      <span className="text-sm text-white font-bold">
                        {reward.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => onClaimMission(mission.id)}
                  disabled={!canClaim || mission.claimed}
                  className={`px-6 py-2 rounded-lg font-bold transition-all ${
                    canClaim && !mission.claimed
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 shadow-lg'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {mission.claimed ? 'Đã Nhận' : canClaim ? 'Nhận Thưởng' : 'Chưa Xong'}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function LoginRewardsSubTab({
  loginRewards,
  onClaimReward,
}: {
  loginRewards: any;
  onClaimReward: (day: number) => void;
}) {
  const currentDay = loginRewards.currentStreak || 1;

  return (
    <div className="space-y-3">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-400" />
          Điểm Danh 7 Ngày
        </h3>
        <p className="text-gray-300 text-sm mb-4">
          Điểm danh mỗi ngày để nhận thưởng. Ngày 7 có phần thưởng đặc biệt!
        </p>

        {/* Streak Info */}
        <div className="mb-4 p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-400 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flame className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-white font-bold text-lg">Streak: {loginRewards.currentStreak} ngày</p>
                <p className="text-gray-300 text-sm">Tổng: {loginRewards.totalDays} ngày</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-400">{currentDay}/7</p>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {loginRewards.calendar.map((day: LoginDay) => {
            const isCurrent = day.day === currentDay;
            const isPast = day.day < currentDay;
            const isFuture = day.day > currentDay;

            return (
              <motion.button
                key={day.day}
                onClick={() => isCurrent && !day.claimed && onClaimReward(day.day)}
                disabled={!isCurrent || day.claimed}
                className={`p-3 rounded-lg text-center transition-all ${
                  day.claimed
                    ? 'bg-green-900/50 border-2 border-green-500'
                    : isCurrent
                    ? 'bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg ring-2 ring-yellow-300 cursor-pointer'
                    : isPast
                    ? 'bg-gray-700/50'
                    : 'bg-gray-800/50 opacity-50'
                }`}
                whileHover={isCurrent && !day.claimed ? { scale: 1.05 } : {}}
                whileTap={isCurrent && !day.claimed ? { scale: 0.95 } : {}}
              >
                <p className="text-xs text-gray-300 mb-1">Ngày</p>
                <p className="text-2xl font-bold text-white">{day.day}</p>
                {day.claimed && (
                  <CheckCircle className="w-5 h-5 mx-auto mt-1 text-green-400" />
                )}
                {day.day === 7 && (
                  <Crown className="w-5 h-5 mx-auto mt-1 text-yellow-400" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Today's Rewards */}
        {loginRewards.calendar[currentDay - 1] && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg">
            <h4 className="text-white font-bold mb-3">Phần Thưởng Ngày {currentDay}:</h4>
            <div className="flex flex-wrap gap-2">
              {loginRewards.calendar[currentDay - 1].rewards.map((reward: MissionReward, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg"
                >
                  <span className="text-2xl">{getRewardIcon(reward.type)}</span>
                  <div>
                    <p className="text-white font-medium">{reward.itemName || reward.type}</p>
                    <p className="text-yellow-400 font-bold">×{reward.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EventsSubTab({ events }: { events: GameEvent[] }) {
  const now = Date.now();
  const activeEvents = events.filter((e) => e.isActive && now <= e.endTime);
  const upcomingEvents = events.filter((e) => !e.isActive && now < e.startTime);

  return (
    <div className="space-y-4">
      {/* Active Events */}
      {activeEvents.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            Sự Kiện Đang Diễn Ra
          </h3>

          {activeEvents.map((event) => {
            const timeLeft = getTimeUntilExpiry(event.endTime);

            return (
              <motion.div
                key={event.id}
                className="p-4 rounded-lg mb-3 bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-2 border-yellow-500"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-400" />
                      {event.name}
                    </h4>
                    <p className="text-sm text-gray-300">{event.description}</p>
                  </div>
                </div>

                {event.multiplier && (
                  <div className="mb-3 p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                    <p className="text-yellow-300 font-bold text-lg text-center">
                      ×{event.multiplier} Bonus!
                    </p>
                  </div>
                )}

                {event.rewards && event.rewards.length > 0 && (
                  <div className="mb-3">
                    <p className="text-gray-300 text-sm mb-2">Phần Thưởng:</p>
                    <div className="flex flex-wrap gap-2">
                      {event.rewards.map((reward, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg"
                        >
                          <span className="text-xl">{getRewardIcon(reward.type)}</span>
                          <span className="text-white font-bold">×{reward.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">Còn lại: {timeLeft}</span>
                  </div>
                  <span className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full">
                    ĐANG DIỄN RA
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-400" />
            Sự Kiện Sắp Diễn Ra
          </h3>

          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="p-4 rounded-lg mb-3 bg-gray-700/50 opacity-75"
            >
              <h4 className="text-lg font-bold text-white mb-1">{event.name}</h4>
              <p className="text-sm text-gray-300">{event.description}</p>
              <div className="mt-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">
                  Bắt đầu: {new Date(event.startTime).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {activeEvents.length === 0 && upcomingEvents.length === 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 text-center">
          <Sparkles className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">Chưa có sự kiện nào</p>
          <p className="text-gray-500 text-sm mt-2">Hãy quay lại sau!</p>
        </div>
      )}
    </div>
  );
}
