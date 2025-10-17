import { useGameStore } from '@/lib/gameStore';
import { User, Star, Trophy } from 'lucide-react';

const PlayerInfo = () => {
  const { player } = useGameStore();

  const experienceToNextLevel = ((player.level) * 100) - player.experience;
  const currentLevelExp = player.experience - ((player.level - 1) * 100);
  const progressPercentage = (currentLevelExp / 100) * 100;

  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-2">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{player.name}</h2>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-300" />
              <span className="font-semibold">Cấp {player.level}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <Trophy className="h-6 w-6 text-yellow-300 mx-auto mb-1" />
          <div className="text-sm">{player.unlockedProvinces.length}/3 tỉnh</div>
        </div>
      </div>

      {/* Experience Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Kinh Nghiệm</span>
          <span>{player.experience} XP</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          ></div>
        </div>
        <div className="text-xs text-purple-100 mt-1">
          Còn {experienceToNextLevel} XP để lên cấp
        </div>
      </div>

      {/* Premium Status */}
      {player.premiumPass?.active && (
        <div className="bg-white/10 rounded-lg p-3 border border-white/20">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold">{player.premiumPass.name} Đang Hoạt Động</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerInfo;