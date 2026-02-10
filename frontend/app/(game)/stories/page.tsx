/**
 * Stories Page - Danh sách câu chuyện lịch sử
 * MVP2 Sprint 1: Daily Story Unlock System
 * 
 * Features:
 * - Hiển thị danh sách stories với trạng thái mở khóa
 * - Đếm ngược thời gian đến khi unlock story tiếp theo
 * - Click vào story đã unlock để đọc và làm quiz
 */

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Book, Award, Flame } from 'lucide-react';
import StoryList from '@/components/stories/StoryList';

export default function StoriesPage() {
  const [playerStats, setPlayerStats] = useState({
    perfectStreak: 0,
    totalStories: 0,
    totalQuizzes: 0,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center items-center gap-3 mb-4">
            <Book className="w-12 h-12 text-yellow-400" />
            <h1 className="text-4xl font-bold text-white">
              Câu Chuyện Lịch Sử
            </h1>
          </div>
          <p className="text-xl text-purple-200">
            Khám phá lịch sử Việt Nam qua các câu chuyện hấp dẫn
          </p>
          <p className="text-sm text-purple-300 mt-2">
            Mỗi ngày mở khóa 1 câu chuyện mới 🎯
          </p>
        </motion.div>

        {/* Player Stats Bar */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Perfect Streak */}
            <div className="flex items-center gap-3">
              <Flame className="w-8 h-8 text-orange-400" />
              <div>
                <p className="text-sm text-purple-200">Chuỗi Hoàn Hảo</p>
                <p className="text-2xl font-bold text-white">
                  {playerStats.perfectStreak} lần
                </p>
              </div>
            </div>

            {/* Total Stories */}
            <div className="flex items-center gap-3">
              <Book className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-sm text-purple-200">Stories Đã Đọc</p>
                <p className="text-2xl font-bold text-white">
                  {playerStats.totalStories}
                </p>
              </div>
            </div>

            {/* Total Quizzes */}
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-sm text-purple-200">Quiz Đã Làm</p>
                <p className="text-2xl font-bold text-white">
                  {playerStats.totalQuizzes}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Story List Component */}
        <StoryList 
          onSelectStory={(story: any) => {
            window.location.href = `/stories/${story.id}`;
          }}
        />

        {/* Info Box */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border-2 border-yellow-400/50"
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl">🎁</div>
            <div>
              <h3 className="text-xl font-bold text-yellow-300 mb-2">
                Mẹo: Trả lời đúng 100% = x5 phần thưởng!
              </h3>
              <p className="text-purple-100">
                Nếu bạn trả lời đúng tất cả câu hỏi trong quiz, bạn sẽ nhận được{' '}
                <span className="font-bold text-yellow-300">gấp 5 lần</span> phần thưởng vàng, kinh nghiệm và tài nguyên!
                Chuỗi hoàn hảo của bạn cũng sẽ tăng thêm 🔥
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
