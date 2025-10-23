import { useGameStore } from '@/lib/gameStore';
import { Trophy, Star, Lock, Gift, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Achievements = () => {
  const { player, completeAchievement } = useGameStore();

  const achievementsData = [
    // Beginner Achievements
    {
      id: 'first-click',
      name: 'Bước Đầu Tiên',
      description: 'Thu thập tài nguyên lần đầu',
      icon: '🖱️',
      category: 'Người Mới',
      reward: { gold: 50, culture: 10 },
      requirement: { type: 'click', target: 1 },
      unlocked: true,
      progress: Math.min(player.experience, 1),
      maxProgress: 1
    },
    {
      id: 'first-farmer',
      name: 'Ông Chủ Đầu Tiên',
      description: 'Thuê nông dân đầu tiên',
      icon: '👨‍🌾',
      category: 'Người Mới',
      reward: { gold: 100, rice: 50 },
      requirement: { type: 'farmer', target: 1 },
      unlocked: true,
      progress: 0, // Would be calculated based on actual farmer count
      maxProgress: 1
    },
    {
      id: 'province-unlock',
      name: 'Nhà Thám Hiểm',
      description: 'Mở khóa tỉnh thứ 2',
      icon: '🗺️',
      category: 'Khám Phá',
      reward: { gold: 200, culture: 50 },
      requirement: { type: 'province', target: 2 },
      unlocked: true,
      progress: player.unlockedProvinces.length,
      maxProgress: 2
    },

    // Resource Achievements  
    {
      id: 'gold-collector',
      name: 'Thợ Mỏ Vàng',
      description: 'Thu thập 1,000 vàng',
      icon: '💰',
      category: 'Thu Thập',
      reward: { gold: 500, culture: 25 },
      requirement: { type: 'resource', resource: 'gold', target: 1000 },
      unlocked: true,
      progress: Math.min(player.totalResources.gold, 1000),
      maxProgress: 1000
    },
    {
      id: 'rice-farmer',
      name: 'Nông Dân Lúa',
      description: 'Thu thập 500 lúa',
      icon: '🌾',
      category: 'Thu Thập',
      reward: { rice: 200, culture: 20 },
      requirement: { type: 'resource', resource: 'rice', target: 500 },
      unlocked: true,
      progress: Math.min(player.totalResources.rice, 500),
      maxProgress: 500
    },
    {
      id: 'culture-scholar',
      name: 'Học Giả Văn Hóa',
      description: 'Thu thập 100 điểm văn hóa',
      icon: '📚',
      category: 'Văn Hóa',
      reward: { culture: 100, gold: 200 },
      requirement: { type: 'resource', resource: 'culture', target: 100 },
      unlocked: true,
      progress: Math.min(player.totalResources.culture, 100),
      maxProgress: 100
    },

    // Level Achievements
    {
      id: 'level-5',
      name: 'Nhà Lãnh Đạo',
      description: 'Đạt cấp độ 5',
      icon: '⭐',
      category: 'Cấp Độ',
      reward: { gold: 300, culture: 75 },
      requirement: { type: 'level', target: 5 },
      unlocked: true,
      progress: player.level,
      maxProgress: 5
    },
    {
      id: 'level-10',
      name: 'Bậc Thầy',
      description: 'Đạt cấp độ 10',
      icon: '🏆',
      category: 'Cấp Độ',
      reward: { gold: 1000, culture: 200 },
      requirement: { type: 'level', target: 10 },
      unlocked: player.level >= 3, // Unlock at level 3
      progress: player.level,
      maxProgress: 10
    },

    // Premium Achievements
    {
      id: 'premium-supporter',
      name: 'Người Ủng Hộ',
      description: 'Mua Premium Pass',
      icon: '👑',
      category: 'Premium',
      reward: { gold: 500, culture: 100 },
      requirement: { type: 'premium', target: 1 },
      unlocked: true,
      progress: player.premiumPass ? 1 : 0,
      maxProgress: 1
    },

    // Special Cultural Achievements
    {
      id: 'hanoi-master',
      name: 'Chúa Tể Thăng Long',
      description: 'Nâng Hà Nội lên cấp 5',
      icon: '🏛️',
      category: 'Văn Hóa',
      reward: { gold: 800, culture: 150 },
      requirement: { type: 'province-level', province: 'hanoi', target: 5 },
      unlocked: true,
      progress: 1, // Would calculate based on actual province level
      maxProgress: 5
    },
    {
      id: 'three-provinces',
      name: 'Tam Vương',
      description: 'Mở khóa cả 3 tỉnh MVP 1',
      icon: '👑',
      category: 'Khám Phá',
      reward: { gold: 1500, culture: 300 },
      requirement: { type: 'province', target: 3 },
      unlocked: true,
      progress: player.unlockedProvinces.length,
      maxProgress: 3
    }
  ];

  const categories = ['Tất Cả', 'Người Mới', 'Thu Thập', 'Văn Hóa', 'Cấp Độ', 'Khám Phá', 'Premium'];
  const [selectedCategory, setSelectedCategory] = useState('Tất Cả');

  const filteredAchievements = achievementsData.filter(achievement => 
    selectedCategory === 'Tất Cả' || achievement.category === selectedCategory
  );

  const unlockedCount = achievementsData.filter(a => a.unlocked).length;
  const completedCount = achievementsData.filter(a => a.progress >= a.maxProgress).length;

  const handleClaimReward = (achievement: any) => {
    if (achievement.progress >= achievement.maxProgress) {
      completeAchievement(achievement.id);
      // In real implementation, would add rewards to player resources
      alert(`Đã nhận phần thưởng: ${Object.entries(achievement.reward).map(([key, value]) => `${value} ${key}`).join(', ')}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-red-800 mb-2">🏆 Thành Tích</h2>
        <p className="text-gray-600">Hoàn thành thử thách và nhận phần thưởng</p>
        <div className="flex justify-center gap-4 mt-4">
          <div className="bg-blue-100 rounded-lg px-4 py-2">
            <div className="text-lg font-bold text-blue-800">{completedCount}/{unlockedCount}</div>
            <div className="text-sm text-blue-600">Đã Hoàn Thành</div>
          </div>
          <div className="bg-green-100 rounded-lg px-4 py-2">
            <div className="text-lg font-bold text-green-800">{unlockedCount}/{achievementsData.length}</div>
            <div className="text-sm text-green-600">Đã Mở Khóa</div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              selectedCategory === category
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-red-100'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement, index) => {
          const isCompleted = achievement.progress >= achievement.maxProgress;
          const isLocked = !achievement.unlocked;
          const progressPercent = Math.min((achievement.progress / achievement.maxProgress) * 100, 100);

          return (
            <motion.div
              key={achievement.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-lg p-4 border-2 shadow-lg transition-all ${
                isLocked 
                  ? 'border-gray-300 opacity-50' 
                  : isCompleted 
                    ? 'border-green-400 bg-green-50' 
                    : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`text-3xl ${isLocked ? 'grayscale' : ''}`}>
                    {isLocked ? '🔒' : achievement.icon}
                  </div>
                  <div>
                    <h3 className={`font-bold ${isLocked ? 'text-gray-500' : 'text-red-800'}`}>
                      {achievement.name}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isLocked ? 'bg-gray-200 text-gray-500' : 'bg-red-100 text-red-600'
                    }`}>
                      {achievement.category}
                    </span>
                  </div>
                </div>
                
                {isCompleted && (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                )}
              </div>

              <p className={`text-sm mb-3 ${isLocked ? 'text-gray-500' : 'text-gray-700'}`}>
                {achievement.description}
              </p>

              {/* Progress Bar */}
              {!isLocked && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Tiến độ</span>
                    <span>{achievement.progress}/{achievement.maxProgress}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isCompleted ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Rewards */}
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-gray-600 mb-1">Phần thưởng:</h4>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(achievement.reward).map(([key, value]) => (
                    <span
                      key={key}
                      className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs"
                    >
                      +{value} {key}
                    </span>
                  ))}
                </div>
              </div>

              {/* Claim Button */}
              {!isLocked && (
                <button
                  onClick={() => handleClaimReward(achievement)}
                  disabled={!isCompleted}
                  className={`w-full py-2 rounded-lg font-semibold text-sm transition-colors ${
                    isCompleted
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isCompleted ? '🎁 Nhận Thưởng' : '⏳ Chưa Hoàn Thành'}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Need to import useState
import { useState } from 'react';

export default Achievements;