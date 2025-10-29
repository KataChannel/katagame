'use client';

import { motion } from 'framer-motion';
import { useBattles } from '@/lib/useMVP1Data';
import { Swords, Trophy, Skull, Clock, Target, TrendingUp, Award } from 'lucide-react';

export default function BattleHistoryTab() {
  const { battles, isLoading, error, refreshBattles } = useBattles();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24 md:pb-6">
        <div className="text-center">
          <Swords className="w-16 h-16 text-red-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Đang tải lịch sử chiến đấu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-24 md:pb-6">
        <div className="text-center">
          <Award className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">Lỗi: {error}</p>
          <button
            onClick={refreshBattles}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const battlesData = battles || [];
  const wins = battlesData.filter((b: any) => b.result === 'victory' || b.won).length;
  const losses = battlesData.filter((b: any) => b.result === 'defeat' || !b.won).length;
  const winRate = battlesData.length > 0 ? Math.round((wins / battlesData.length) * 100) : 0;

  return (
    <div className="min-h-screen pb-24 md:pb-6 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
          <Swords className="w-8 h-8" />
          Lịch Sử Chiến Đấu
        </h1>
        <p className="text-red-100">Xem lại các trận chiến của bạn</p>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-1" />
            <div className="text-2xl font-bold">{wins}</div>
            <div className="text-xs text-red-100">Thắng</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <Skull className="w-6 h-6 mx-auto mb-1" />
            <div className="text-2xl font-bold">{losses}</div>
            <div className="text-xs text-red-100">Thua</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-1" />
            <div className="text-2xl font-bold">{winRate}%</div>
            <div className="text-xs text-red-100">Tỷ lệ thắng</div>
          </div>
        </div>
      </div>

      {battlesData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Chưa có trận chiến nào</p>
          <p className="text-sm">Hãy bắt đầu chiến đấu để tạo lịch sử!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {battlesData.map((battle: any, index: number) => (
            <BattleCard key={battle.id || index} battle={battle} />
          ))}
        </div>
      )}
    </div>
  );
}

function BattleCard({ battle }: { battle: any }) {
  const isVictory = battle.result === 'victory' || battle.won;
  const battleDate = new Date(battle.created_at || battle.createdAt || Date.now());

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 ${
        isVictory ? 'border-green-400' : 'border-red-400'
      }`}
    >
      <div className={`p-1 ${isVictory ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-orange-600'}`} />
      
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {isVictory ? (
              <Trophy className="w-10 h-10 text-green-500" />
            ) : (
              <Skull className="w-10 h-10 text-red-500" />
            )}
            <div>
              <h3 className={`text-xl font-bold ${isVictory ? 'text-green-700' : 'text-red-700'}`}>
                {isVictory ? 'Chiến Thắng!' : 'Thất Bại'}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                {battleDate.toLocaleDateString('vi-VN')} {battleDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {battle.battle_type && (
            <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-700">
              {getBattleType(battle.battle_type)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-blue-800 mb-2">Đội của bạn</h4>
            <div className="text-sm text-gray-700">
              {battle.player_heroes ? (
                Array.isArray(battle.player_heroes) ? (
                  battle.player_heroes.map((hero: any, i: number) => (
                    <div key={i} className="truncate">• {hero.name || hero}</div>
                  ))
                ) : (
                  <div>{battle.player_heroes}</div>
                )
              ) : (
                <div className="text-gray-400">Không có thông tin</div>
              )}
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-red-800 mb-2">Đối thủ</h4>
            <div className="text-sm text-gray-700">
              {battle.opponent_name ? (
                <div className="font-semibold">{battle.opponent_name}</div>
              ) : battle.enemy_heroes ? (
                Array.isArray(battle.enemy_heroes) ? (
                  battle.enemy_heroes.map((enemy: any, i: number) => (
                    <div key={i} className="truncate">• {enemy.name || enemy}</div>
                  ))
                ) : (
                  <div>{battle.enemy_heroes}</div>
                )
              ) : (
                <div className="text-gray-400">Không có thông tin</div>
              )}
            </div>
          </div>
        </div>

        {(battle.gold_earned || battle.exp_earned || battle.rewards) && (
          <div className="mt-4 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
            <h4 className="text-xs font-semibold text-yellow-800 mb-2">Phần thưởng</h4>
            <div className="flex gap-4 text-sm">
              {battle.gold_earned && (
                <div className="flex items-center gap-1">
                  <span className="text-yellow-600">💰</span>
                  <span className="font-semibold">{battle.gold_earned.toLocaleString()}</span>
                  <span className="text-gray-600">vàng</span>
                </div>
              )}
              {battle.exp_earned && (
                <div className="flex items-center gap-1">
                  <span className="text-blue-600">⭐</span>
                  <span className="font-semibold">{battle.exp_earned.toLocaleString()}</span>
                  <span className="text-gray-600">EXP</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function getBattleType(type: string): string {
  const types: any = {
    pvp: 'PvP',
    pve: 'PvE',
    boss: 'Boss',
    arena: 'Arena',
    guild_war: 'Guild War',
  };
  return types[type] || type;
}
