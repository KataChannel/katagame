/**
 * CombatTab - Combat Encounter Selection
 * 
 * Main combat screen where players select enemies and launch battles
 */

'use client';

import { useState } from 'react';
import { Sword, Shield, Trophy, Zap, Heart } from 'lucide-react';
import { useGameStore } from '@/lib/gameStore';
import { getRandomEnemy, generateEncounter, getEnemiesByDifficulty } from '@/lib/enemiesData';
import { heroes } from '@/lib/heroesData';
import BattleField from './BattleField';
import { ElementBadge } from './ElementBadge';
import { touchTargets, mobileSpacing } from '@/lib/mobileDesignSystem';

type Difficulty = 'easy' | 'medium' | 'hard';

export default function CombatTab() {
  const { player, addNotification } = useGameStore();
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [inBattle, setInBattle] = useState(false);
  const [currentEnemies, setCurrentEnemies] = useState<any[]>([]);

  // Get available heroes (show all era 1 heroes)
  const availableHeroes = heroes.slice(0, 5);

  const handleStartBattle = () => {
    // Generate encounter based on difficulty and player level
    const enemies = generateEncounter(player.level, selectedDifficulty);
    setCurrentEnemies(enemies);
    setInBattle(true);
    
    addNotification({
      type: 'info',
      title: 'Bắt Đầu Chiến Đấu!',
      message: `Đối đầu với ${enemies.length} kẻ địch!`,
    });
  };

  const handleBattleEnd = (victory: boolean) => {
    setInBattle(false);
    
    if (victory) {
      addNotification({
        type: 'success',
        title: 'Chiến Thắng!',
        message: 'Bạn đã đánh bại kẻ địch!',
      });
    } else {
      addNotification({
        type: 'error',
        title: 'Thất Bại',
        message: 'Đội quân của bạn cần nghỉ ngơi...',
      });
    }
  };

  const handleExitBattle = () => {
    setInBattle(false);
  };

  // If in battle, show BattleField
  if (inBattle && currentEnemies.length > 0) {
    return (
      <BattleField
        heroes={availableHeroes}
        enemies={currentEnemies}
        onBattleEnd={handleBattleEnd}
        onExit={handleExitBattle}
      />
    );
  }

  // Difficulty configs
  const difficultyConfigs = {
    easy: {
      label: 'Dễ',
      color: 'from-green-500 to-green-600',
      borderColor: 'border-green-400',
      description: '1 kẻ địch, phù hợp cho người mới',
      enemies: 1,
      rewards: '50-100 💰',
    },
    medium: {
      label: 'Trung Bình',
      color: 'from-yellow-500 to-yellow-600',
      borderColor: 'border-yellow-400',
      description: '2 kẻ địch, thử thách vừa phải',
      enemies: 2,
      rewards: '100-200 💰',
    },
    hard: {
      label: 'Khó',
      color: 'from-red-500 to-red-600',
      borderColor: 'border-red-400',
      description: '3 kẻ địch, chỉ dành cho cao thủ!',
      enemies: 3,
      rewards: '200-500 💰',
    },
  };

  const selectedConfig = difficultyConfigs[selectedDifficulty];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-white/20 p-3 rounded-xl">
            <Sword className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Chiến Đấu</h1>
            <p className="text-red-100 text-sm">Bảo vệ tỉnh thành của bạn</p>
          </div>
        </div>
        
        {/* Player Stats */}
        <div className="bg-white/10 rounded-xl p-4 mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xs text-red-100">Cấp Độ</div>
            <div className="text-xl font-bold">{player.level}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-red-100">Anh Hùng</div>
            <div className="text-xl font-bold">{availableHeroes.length}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-red-100">Trận Thắng</div>
            <div className="text-xl font-bold">0</div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Difficulty Selection */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Chọn Độ Khó
          </h2>
          
          <div className="space-y-3">
            {(Object.keys(difficultyConfigs) as Difficulty[]).map((difficulty) => {
              const config = difficultyConfigs[difficulty];
              const isSelected = selectedDifficulty === difficulty;
              
              return (
                <button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`
                    w-full p-4 rounded-xl border-2 transition-all
                    ${isSelected 
                      ? `${config.borderColor} bg-white shadow-lg` 
                      : 'border-gray-200 bg-white'
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`
                          inline-block px-3 py-1 rounded-full text-sm font-bold text-white
                          bg-gradient-to-r ${config.color}
                        `}>
                          {config.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {config.enemies} kẻ địch
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {config.description}
                      </p>
                      <div className="text-xs text-gray-500">
                        Phần thưởng: {config.rewards}
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="ml-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hero Lineup Preview */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Đội Hình Anh Hùng
          </h2>
          
          <div className="bg-white rounded-xl p-4 space-y-3">
            {availableHeroes.map((hero) => (
              <div 
                key={hero.id}
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
              >
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl">
                  {hero.displayName[0]}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">{hero.displayName}</span>
                    <ElementBadge element={hero.element} size="sm" showTooltip={false} />
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      Lv.{hero.level}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{hero.title}</p>
                </div>
                
                <div className="text-right text-xs space-y-1">
                  <div className="flex items-center gap-1 text-red-600">
                    <Heart className="w-3 h-3" />
                    {hero.stats.hp}
                  </div>
                  <div className="flex items-center gap-1 text-orange-600">
                    <Sword className="w-3 h-3" />
                    {hero.stats.attack}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enemy Preview */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Kẻ Địch Tiềm Năng
          </h2>
          
          <div className="bg-white rounded-xl p-4 space-y-3">
            {getEnemiesByDifficulty(selectedDifficulty).slice(0, 3).map((enemy) => (
              <div 
                key={enemy.id}
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg"
              >
                <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white w-12 h-12 rounded-lg flex items-center justify-center text-2xl">
                  👹
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">{enemy.displayName}</span>
                    <ElementBadge element={enemy.element} size="sm" showTooltip={false} />
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                      Lv.{enemy.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {enemy.hp} HP
                    </span>
                    <span className="flex items-center gap-1">
                      <Sword className="w-3 h-3" />
                      {enemy.attack} ATK
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            <p className="text-xs text-gray-500 text-center pt-2">
              Kẻ địch ngẫu nhiên sẽ xuất hiện khi bắt đầu trận chiến
            </p>
          </div>
        </div>
      </div>

      {/* Start Battle Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
        <button
          onClick={handleStartBattle}
          className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
          style={{ minHeight: touchTargets.comfortable }}
        >
          <Sword className="w-6 h-6" />
          Bắt Đầu Chiến Đấu!
        </button>
      </div>
    </div>
  );
}
