'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Lock, CheckCircle, Clock, Sparkles } from 'lucide-react';
import apolloClient from '@/lib/apolloClient';
import { GET_AVAILABLE_STORIES } from '@/lib/graphql/queries';
import { StoryWithUnlockStatus } from '@/lib/types/mvp1.types';

interface StoryListProps {
  onSelectStory: (story: StoryWithUnlockStatus) => void;
}

export default function StoryList({ onSelectStory }: StoryListProps) {
  const [stories, setStories] = useState<StoryWithUnlockStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStories();
    const interval = setInterval(loadStories, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadStories = async () => {
    try {
      setLoading(true);
      const { data } = await apolloClient.query<{ availableStories: StoryWithUnlockStatus[] }>({
        query: GET_AVAILABLE_STORIES,
        fetchPolicy: 'network-only',
      });
      setStories(data?.availableStories || []);
      setError(null);
    } catch (err: any) {
      console.error('Error loading stories:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 text-center">
        <p className="text-red-400">Không thể tải danh sách truyện</p>
        <p className="text-sm text-red-300 mt-2">{error}</p>
      </div>
    );
  }

  const unlockedStories = stories.filter(s => s.isUnlocked);
  const lockedStories = stories.filter(s => !s.isUnlocked);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 border border-yellow-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-yellow-400">Câu chuyện lịch sử</h3>
            <p className="text-sm text-gray-300">
              {unlockedStories.length}/{stories.length} truyện đã mở khóa
            </p>
          </div>
          <Sparkles className="w-8 h-8 text-yellow-400" />
        </div>
      </div>

      {/* Unlocked Stories */}
      {unlockedStories.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-green-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Có thể đọc ngay
          </h4>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {unlockedStories.map((story, index) => (
              <StoryCard
                key={story.id}
                story={story}
                index={index}
                onClick={() => onSelectStory(story)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Locked Stories */}
      {lockedStories.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Sắp mở khóa
          </h4>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lockedStories.map((story, index) => (
              <LockedStoryCard
                key={story.id}
                story={story}
                index={index}
              />
            ))}
          </div>
        </div>
      )}

      {stories.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Book className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Chưa có truyện nào</p>
        </div>
      )}
    </div>
  );
}

interface StoryCardProps {
  story: StoryWithUnlockStatus;
  index: number;
  onClick: () => void;
}

function StoryCard({ story, index, onClick }: StoryCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-lg p-4 border border-blue-500/30 hover:border-blue-400/50 transition-all text-left relative overflow-hidden group"
    >
      {/* Completed Badge */}
      {story.isCompleted && (
        <div className="absolute top-2 right-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
        </div>
      )}

      {/* Day Badge */}
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-yellow-500/20 px-2 py-1 rounded text-xs font-bold text-yellow-400">
          Ngày {story.day}
        </div>
        {story.era && (
          <div className="bg-purple-500/20 px-2 py-1 rounded text-xs text-purple-300">
            {story.era}
          </div>
        )}
      </div>

      <h3 className="font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
        {story.titleVietnamese}
      </h3>

      <p className="text-sm text-gray-300 line-clamp-2 mb-3">
        {story.content.slice(0, 100)}...
      </p>

      {/* Rewards */}
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          💰 {story.baseGoldReward || 100}
        </span>
        <span className="flex items-center gap-1">
          🍚 {story.baseRiceReward || 100}
        </span>
        {!story.isCompleted && (
          <span className="text-green-400 ml-auto">🎁 x5 nếu hoàn hảo!</span>
        )}
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all" />
    </motion.button>
  );
}

interface LockedStoryCardProps {
  story: StoryWithUnlockStatus;
  index: number;
}

function LockedStoryCard({ story, index }: LockedStoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-gray-900/40 rounded-lg p-4 border border-gray-700/50 relative overflow-hidden opacity-60"
    >
      {/* Lock Icon */}
      <div className="absolute top-2 right-2">
        <Lock className="w-5 h-5 text-gray-500" />
      </div>

      {/* Day Badge */}
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-gray-700/50 px-2 py-1 rounded text-xs font-bold text-gray-400">
          Ngày {story.day}
        </div>
      </div>

      <h3 className="font-bold text-gray-400 mb-2">
        {story.titleVietnamese}
      </h3>

      {/* Countdown */}
      <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-lg p-2 mb-3">
        <Clock className="w-4 h-4 text-orange-400" />
        <span className="text-sm text-orange-300">
          Còn <span className="font-bold">{story.daysUntilUnlock}</span> ngày nữa mở khóa
        </span>
      </div>

      {/* Blurred Content */}
      <div className="text-sm text-gray-500 blur-sm select-none mb-3">
        Nội dung truyện sẽ được mở khóa sau {story.daysUntilUnlock} ngày...
      </div>

      {/* Rewards (grayed out) */}
      <div className="flex items-center gap-3 text-xs text-gray-600">
        <span>💰 ???</span>
        <span>🍚 ???</span>
      </div>
    </motion.div>
  );
}
