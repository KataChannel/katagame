/**
 * Province Active Skill Card Component
 * MVP2 Sprint 2: Province Skills
 * 
 * Hiển thị active skill với cooldown timer và activation button
 * Mobile First + Responsive design
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, Lock } from 'lucide-react';
import type { ActiveSkill, SkillCooldownStatus } from '@/lib/types/mvp1.types';

interface ProvinceSkillCardProps {
  skill: ActiveSkill | null;
  cooldown: SkillCooldownStatus | null;
  developmentLevel: number;
  onUseSkill: () => void;
  loading?: boolean;
}

export default function ProvinceSkillCard({
  skill,
  cooldown,
  developmentLevel,
  onUseSkill,
  loading = false,
}: ProvinceSkillCardProps) {
  const [remainingTime, setRemainingTime] = useState(cooldown?.remainingSeconds || 0);

  // Update countdown timer every second
  useEffect(() => {
    if (!cooldown?.isOnCooldown) return;

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown?.isOnCooldown]);

  // Skill not unlocked yet
  if (!skill) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-gray-500/10 to-gray-600/10 rounded-2xl p-6 border-2 border-gray-600/30"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl bg-gray-600/20 flex items-center justify-center">
            <Lock className="w-8 h-8 text-gray-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-400">Kỹ Năng Chủ Động</h3>
            <p className="text-sm text-gray-500">Chưa mở khóa</p>
          </div>
        </div>

        <div className="bg-gray-600/10 rounded-xl p-4 border border-gray-600/20">
          <p className="text-gray-400 text-sm mb-2">
            📊 Yêu cầu: <span className="font-bold">Phát triển cấp 10</span>
          </p>
          <p className="text-gray-500 text-xs">
            Hiện tại: Cấp {developmentLevel}
          </p>
          {developmentLevel < 10 && (
            <p className="text-yellow-400 text-xs mt-2">
              ⚡ Còn {10 - developmentLevel} cấp nữa!
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  // Format remaining time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}p ${secs}s`;
    }
    return `${minutes}p ${secs}s`;
  };

  const isOnCooldown = cooldown?.isOnCooldown && remainingTime > 0;
  const canUse = !isOnCooldown && !loading;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`rounded-2xl p-6 border-2 ${
        isOnCooldown
          ? 'bg-gradient-to-br from-gray-500/10 to-gray-600/10 border-gray-600/30'
          : 'bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-400/30'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <motion.div
          animate={
            canUse
              ? {
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0],
                }
              : {}
          }
          transition={{ repeat: canUse ? Infinity : 0, duration: 2 }}
          className={`w-16 h-16 rounded-xl flex items-center justify-center text-4xl ${
            isOnCooldown
              ? 'bg-gray-600/20 grayscale'
              : 'bg-gradient-to-br from-orange-500/30 to-red-500/30'
          }`}
        >
          {skill.icon}
        </motion.div>

        <div className="flex-1">
          <h3 className={`text-xl font-bold ${isOnCooldown ? 'text-gray-400' : 'text-white'}`}>
            {skill.name}
          </h3>
          <p className={`text-sm ${isOnCooldown ? 'text-gray-500' : 'text-orange-300'}`}>
            Kỹ năng chủ động
          </p>
        </div>

        {/* Multiplier Badge */}
        <div className={`px-3 py-2 rounded-xl font-bold text-2xl ${
          isOnCooldown
            ? 'bg-gray-600/20 text-gray-500'
            : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
        }`}>
          x{skill.multiplier}
        </div>
      </div>

      {/* Description */}
      <p className={`mb-4 text-sm ${isOnCooldown ? 'text-gray-400' : 'text-purple-100'}`}>
        {skill.description}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className={`rounded-xl p-3 ${
          isOnCooldown ? 'bg-gray-600/10' : 'bg-orange-500/10'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <Zap className={`w-4 h-4 ${isOnCooldown ? 'text-gray-500' : 'text-orange-400'}`} />
            <span className={`text-xs ${isOnCooldown ? 'text-gray-500' : 'text-orange-300'}`}>
              Thời gian hiệu lực
            </span>
          </div>
          <p className={`font-bold ${isOnCooldown ? 'text-gray-400' : 'text-white'}`}>
            {skill.duration_hours} giờ
          </p>
        </div>

        <div className={`rounded-xl p-3 ${
          isOnCooldown ? 'bg-gray-600/10' : 'bg-orange-500/10'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <Clock className={`w-4 h-4 ${isOnCooldown ? 'text-gray-500' : 'text-orange-400'}`} />
            <span className={`text-xs ${isOnCooldown ? 'text-gray-500' : 'text-orange-300'}`}>
              Hồi chiêu
            </span>
          </div>
          <p className={`font-bold ${isOnCooldown ? 'text-gray-400' : 'text-white'}`}>
            {skill.cooldown_hours} giờ
          </p>
        </div>
      </div>

      {/* Cooldown Timer */}
      {isOnCooldown && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-600/20 rounded-xl p-4 mb-4 border border-gray-600/30"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400 animate-pulse" />
              <span className="text-sm text-gray-300">Đang hồi chiêu...</span>
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-400 text-center">
            {formatTime(remainingTime)}
          </div>
          
          {/* Progress bar */}
          <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
              initial={{ width: '100%' }}
              animate={{
                width: `${((skill.cooldown_hours * 3600 - remainingTime) / (skill.cooldown_hours * 3600)) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      )}

      {/* Action Button */}
      <motion.button
        whileHover={canUse ? { scale: 1.02 } : {}}
        whileTap={canUse ? { scale: 0.98 } : {}}
        onClick={onUseSkill}
        disabled={!canUse}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
          canUse
            ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/50'
            : 'bg-gray-600/20 text-gray-500 cursor-not-allowed'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            Đang kích hoạt...
          </div>
        ) : isOnCooldown ? (
          `Hồi chiêu: ${formatTime(remainingTime)}`
        ) : (
          `🔥 Kích Hoạt x${skill.multiplier}`
        )}
      </motion.button>
    </motion.div>
  );
}
