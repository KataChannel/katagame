'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/gameStore';
import {
  Swords,
  Trophy,
  Shield,
  Gift,
  Clock,
  TrendingUp,
  Award,
  Users,
  Star,
  Zap,
  ChevronRight,
  Check,
  X,
  Flame,
  Crown,
  Target,
} from 'lucide-react';
import {
  getRankDetails,
  getRankRewards,
  calculateWinRate,
  getBattlesRemaining,
  getTimeUntilReset,
  RANK_THRESHOLDS,
  type ArenaPlayer,
  type ArenaBattle,
  type ArenaShopItem,
} from '@/lib/arenaSystem';

export default function ArenaTab() {
  const {
    player,
    heroes,
    arenaState,
    initializeArena,
    getPvPOpponentsAction,
    raidOpponentAction,
    getPvPShopItemsAction,
    buyPvPShopItemAction,
    setArenaDefense,
  } = useGameStore();

  const [activeSubTab, setActiveSubTab] = useState<'battle' | 'leaderboard' | 'defense' | 'shop' | 'history'>('battle');
  const [showBattleModal, setShowBattleModal] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<ArenaPlayer | null>(null);
  const [battleResult, setBattleResult] = useState<ArenaBattle | null>(null);

  // Initialize arena if not exists
  useEffect(() => {
    if (!arenaState) {
      initializeArena();
    }
  }, [arenaState, initializeArena]);

  if (!arenaState) {
    return (
      <div className="min-h-screen pb-24 md:pb-6 flex items-center justify-center">
        <div className="text-center">
          <Swords className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Arena Loading...</h2>
          <p className="text-gray-600">Đang khởi tạo đấu trường...</p>
        </div>
      </div>
    );
  }

  const { player: arenaPlayer } = arenaState;
  const rankDetails = getRankDetails(arenaPlayer.rank);
  const rankRewards = getRankRewards(arenaPlayer.rank);
  const winRate = calculateWinRate(arenaPlayer.wins, arenaPlayer.losses);
  const battlesRemaining = getBattlesRemaining(arenaState);

  const [selectedAttackHeroes, setSelectedAttackHeroes] = useState<string[]>([]);

  // Initialize selected attack heroes with current defense team or first 3 heroes
  useEffect(() => {
    if (heroes && heroes.length > 0 && selectedAttackHeroes.length === 0) {
      const initialSelection = arenaState?.player.defenseTeam.heroIds.length ? 
        arenaState.player.defenseTeam.heroIds : 
        heroes.slice(0, 3).map(h => h.id);
      setSelectedAttackHeroes(initialSelection);
    }
  }, [heroes, arenaState]);

  const toggleAttackHero = (heroId: string) => {
    if (selectedAttackHeroes.includes(heroId)) {
      setSelectedAttackHeroes(selectedAttackHeroes.filter(id => id !== heroId));
    } else if (selectedAttackHeroes.length < 3) {
      setSelectedAttackHeroes([...selectedAttackHeroes, heroId]);
    }
  };

  const handleAttack = (opponent: any) => {
    setSelectedOpponent(opponent);
    setShowBattleModal(true);
  };

  const handleConfirmBattle = async () => {
    if (!selectedOpponent || selectedAttackHeroes.length === 0) return;
    
    // In real backend, we just need defenderId
    const result = await raidOpponentAction((selectedOpponent as any).id || (selectedOpponent as any).playerId);
    
    if (result) {
      setBattleResult({
        result: result.success ? 'win' : 'lose',
        ratingChange: result.success ? 15 : -10, // Mocked for UI
        rewardCoins: result.success ? 50 : 5,
        battleLog: [result.message, `⚔️ Attacker CP: ${result.attackerCp}`, `🛡️ Defender CP: ${result.defenderCp}`]
      } as any);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-6">
      {/* Arena Header */}
      <div className="bg-gradient-to-br from-red-600 via-orange-600 to-yellow-600 text-white p-8 rounded-b-3xl shadow-2xl mb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Swords className="w-10 h-10" />
                Đấu Trường PvP
              </h1>
              <p className="text-orange-100 mt-2">Thách đấu người chơi khác và leo rank!</p>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">Lượt đánh hôm nay</div>
              <div className="text-4xl font-bold">{battlesRemaining} / {arenaState.dailyBattlesMax}</div>
            </div>
          </div>

          {/* Player Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-sm opacity-90">Rank</div>
              <div className="text-2xl font-bold" style={{ color: rankDetails.color }}>
                {rankDetails.displayName}
              </div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-sm opacity-90">Rating</div>
              <div className="text-2xl font-bold">{arenaPlayer.rating}</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-sm opacity-90">Tỷ Lệ Thắng</div>
              <div className="text-2xl font-bold">{winRate}%</div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-sm opacity-90">Arena Coins</div>
              <div className="text-2xl font-bold">💎 {arenaState.arenaCoins}</div>
            </div>
          </div>

          {/* Win Streak */}
          {arenaPlayer.winStreak > 0 && (
            <div className="mt-4 bg-yellow-400 text-gray-900 rounded-lg p-3 flex items-center gap-2">
              <Flame className="w-5 h-5" />
              <span className="font-bold">Chuỗi thắng: {arenaPlayer.winStreak} trận!</span>
            </div>
          )}
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: 'battle' as const, label: 'Chiến Đấu', icon: Swords },
            { key: 'leaderboard' as const, label: 'Bảng Xếp Hạng', icon: Trophy },
            { key: 'defense' as const, label: 'Phòng Thủ', icon: Shield },
            { key: 'shop' as const, label: 'Cửa Hàng', icon: Gift },
            { key: 'history' as const, label: 'Lịch Sử', icon: Clock },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeSubTab === tab.key
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4">
        {activeSubTab === 'battle' && (
          <BattleTab
            arenaState={arenaState}
            onFindOpponents={async () => {
              const ops = await getPvPOpponentsAction();
              if (ops) {
                useGameStore.setState({ arenaState: { ...arenaState, matchedOpponents: ops } });
              }
            }}
            onAttack={handleAttack}
            battlesRemaining={battlesRemaining}
          />
        )}
        {activeSubTab === 'leaderboard' && (
          <LeaderboardTab arenaPlayer={arenaPlayer} />
        )}
        {activeSubTab === 'defense' && (
          <DefenseTab
            arenaPlayer={arenaPlayer}
            playerHeroes={heroes || []}
            onSetDefense={setArenaDefense}
          />
        )}
        {activeSubTab === 'shop' && (
          <ShopTab
            arenaState={arenaState}
            onPurchase={buyPvPShopItemAction}
            onLoadItems={async () => {
              const items = await getPvPShopItemsAction();
              if (items) {
                // Assuming items is an array or object
              }
            }}
          />
        )}
        {activeSubTab === 'history' && (
          <HistoryTab battleHistory={arenaState.battleHistory} />
        )}
      </div>

      {/* Battle Modal */}
      <AnimatePresence>
        {showBattleModal && selectedOpponent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBattleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            >
              {!battleResult ? (
                // Pre-battle confirmation
                <>
                  <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6 text-white rounded-t-2xl">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      <Swords className="w-8 h-8" />
                      Xác Nhận Chiến Đấu
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="text-center mb-6">
                      <div className="text-5xl mb-4">{selectedOpponent.rank === 'legend' ? '👑' : '⚔️'}</div>
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedOpponent.playerName}
                      </h4>
                      <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                        <span>Lv. {selectedOpponent.playerLevel}</span>
                        <span>•</span>
                        <span style={{ color: getRankDetails(selectedOpponent.rank).color }}>
                          {getRankDetails(selectedOpponent.rank).displayName}
                        </span>
                        <span>•</span>
                        <span>{selectedOpponent.rating} Rating</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="grid grid-cols-2 gap-4 text-center mb-4">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Sức Mạnh Đối Thủ</div>
                          <div className="text-xl font-bold text-gray-900">
                            ⚡ {selectedOpponent.defenseTeam.teamPower}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Thắng - Thua</div>
                          <div className="text-xl font-bold text-gray-900">
                            {selectedOpponent.wins} - {selectedOpponent.losses}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <div className="text-sm font-semibold text-gray-700 mb-3">Chọn đội hình tấn công (Tối đa 3):</div>
                        <div className="grid grid-cols-3 gap-2">
                          {(heroes || []).slice(0, 9).map((hero) => (
                            <button
                              key={hero.id}
                              onClick={() => toggleAttackHero(hero.id)}
                              className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center ${
                                selectedAttackHeroes.includes(hero.id)
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="text-2xl mb-1">
                                {hero.element === 'fire' ? '🔥' : hero.element === 'water' ? '💧' : hero.element === 'earth' ? '⛰️' : hero.element === 'metal' ? '⚔️' : '🌲'}
                              </div>
                              <span className="text-[10px] font-bold truncate w-full text-center">{hero.name}</span>
                              <span className="text-[10px] text-gray-500">Lv.{hero.level}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowBattleModal(false)}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleConfirmBattle}
                        className="flex-1 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-lg hover:from-red-700 hover:to-orange-700 transition-all shadow-md hover:shadow-lg"
                      >
                        <Swords className="w-5 h-5 inline mr-2" />
                        Chiến Đấu!
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                // Battle result
                <>
                  <div className={`p-6 text-white rounded-t-2xl ${
                    battleResult.result === 'win'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                      : 'bg-gradient-to-r from-gray-600 to-gray-700'
                  }`}>
                    <h3 className="text-3xl font-bold text-center">
                      {battleResult.result === 'win' ? '🎉 Chiến Thắng!' : '😔 Thất Bại'}
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <span className="text-gray-700">Rating</span>
                        <span className={`text-xl font-bold ${
                          battleResult.ratingChange > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {battleResult.ratingChange > 0 ? '+' : ''}{battleResult.ratingChange}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                        <span className="text-gray-700">Arena Coins</span>
                        <span className="text-xl font-bold text-purple-600">
                          +{battleResult.rewardCoins}
                        </span>
                      </div>
                    </div>

                    {/* Battle Log */}
                    {battleResult.battleLog && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-6 max-h-40 overflow-y-auto">
                        <div className="text-sm space-y-1">
                          {battleResult.battleLog.map((log, i) => (
                            <div key={i} className="text-gray-700">{log}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setShowBattleModal(false);
                        setBattleResult(null);
                      }}
                      className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Đóng
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Battle Tab Component
function BattleTab({
  arenaState,
  onFindOpponents,
  onAttack,
  battlesRemaining,
}: {
  arenaState: any;
  onFindOpponents: () => void;
  onAttack: (opponent: ArenaPlayer) => void;
  battlesRemaining: number;
}) {
  return (
    <div className="space-y-6">
      {/* Find Opponents Button */}
      <div className="bg-white rounded-lg p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Tìm Đối Thủ</h3>
            <p className="text-sm text-gray-600 mt-1">
              Còn {battlesRemaining} lượt đánh • Reset sau {getTimeUntilReset()}
            </p>
          </div>
          <button
            onClick={onFindOpponents}
            disabled={battlesRemaining === 0}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              battlesRemaining > 0
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700 shadow-md hover:shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Target className="w-5 h-5 inline mr-2" />
            Làm Mới
          </button>
        </div>
      </div>

      {/* Opponents List */}
      {arenaState.matchedOpponents && arenaState.matchedOpponents.length > 0 ? (
        <div className="space-y-4">
          {arenaState.matchedOpponents.map((opponent: any, index: number) => {
            const oppName = opponent.username || opponent.playerName;
            const oppLevel = opponent.level || opponent.playerLevel;
            const oppRating = opponent.reputation || opponent.rating || 1000;
            const oppCp = opponent.combatPower || (opponent.defenseTeam?.teamPower) || 0;
            
            return (
              <motion.div
                key={opponent.id || opponent.playerId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">⚔️</div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{oppName}</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                        <span>Lv. {oppLevel}</span>
                        <span>•</span>
                        <span className="font-semibold text-orange-600">
                          {oppRating} Reputation
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-500">
                          ⚡ {oppCp} Combat Power
                        </span>
                      </div>
                    </div>
                  </div>
  
                  <button
                    onClick={() => onAttack(opponent)}
                    disabled={battlesRemaining === 0}
                    className={`px-6 py-3 rounded-lg font-bold transition-all ${
                      battlesRemaining > 0
                        ? 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Swords className="w-5 h-5 inline mr-2" />
                    Tấn Công
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <Target className="w-24 h-24 mx-auto text-gray-300 mb-6" />
          <h3 className="text-2xl font-bold text-gray-700 mb-2">Chưa có đối thủ</h3>
          <p className="text-gray-600 mb-6">Nhấn "Làm Mới" để tìm đối thủ!</p>
        </div>
      )}
    </div>
  );
}

// Leaderboard Tab Component
function LeaderboardTab({ arenaPlayer }: { arenaPlayer: ArenaPlayer }) {
  // Mock leaderboard data - in production this would come from server
  const [leaderboard, setLeaderboard] = useState<ArenaPlayer[]>([]);
  const [filterRank, setFilterRank] = useState<'all' | 'legend' | 'diamond' | 'platinum'>('all');

  useEffect(() => {
    // Generate mock leaderboard
    const mockLeaderboard: ArenaPlayer[] = [];
    for (let i = 0; i < 50; i++) {
      const rating = 3000 - (i * 30);
      const playerRank = rating >= 3000 ? 'legend' :
                        rating >= 2500 ? 'diamond' :
                        rating >= 2000 ? 'platinum' :
                        rating >= 1500 ? 'gold' :
                        rating >= 1000 ? 'silver' : 'bronze';
      
      mockLeaderboard.push({
        playerId: `player-${i}`,
        playerName: i === 0 ? arenaPlayer.playerName : `Người Chơi ${i}`,
        playerLevel: Math.floor(40 + Math.random() * 20),
        rating,
        rank: playerRank,
        wins: Math.floor(100 + Math.random() * 400),
        losses: Math.floor(50 + Math.random() * 200),
        winStreak: Math.floor(Math.random() * 15),
        highestRating: rating + Math.floor(Math.random() * 200),
        defenseTeam: { heroIds: [], teamPower: 4000 + Math.floor(Math.random() * 2000) },
        lastBattleTime: Date.now(),
      });
    }
    setLeaderboard(mockLeaderboard);
  }, [arenaPlayer]);

  const filteredLeaderboard = filterRank === 'all'
    ? leaderboard
    : leaderboard.filter(p => p.rank === filterRank);

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="bg-white rounded-lg p-4 shadow-md">
        <div className="flex gap-2 overflow-x-auto">
          {(['all', 'legend', 'diamond', 'platinum'] as const).map((rank) => (
            <button
              key={rank}
              onClick={() => setFilterRank(rank)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                filterRank === rank
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {rank === 'all' ? 'Tất Cả' : RANK_THRESHOLDS[rank].displayName}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Hạng</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Người Chơi</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Rating</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">W - L</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Rank</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLeaderboard.slice(0, 100).map((player, index) => (
                <tr
                  key={player.playerId}
                  className={player.playerId === arenaPlayer.playerId ? 'bg-yellow-50' : ''}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {index === 0 && <span className="text-2xl">🥇</span>}
                      {index === 1 && <span className="text-2xl">🥈</span>}
                      {index === 2 && <span className="text-2xl">🥉</span>}
                      <span className="text-lg font-bold text-gray-900">#{index + 1}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{player.playerName}</div>
                    <div className="text-sm text-gray-600">Lv. {player.playerLevel}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-lg font-bold text-gray-900">{player.rating}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <span className="text-green-600 font-semibold">{player.wins}</span>
                      {' - '}
                      <span className="text-red-600 font-semibold">{player.losses}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="px-3 py-1 rounded-full text-sm font-semibold"
                      style={{
                        backgroundColor: `${getRankDetails(player.rank as any).color}20`,
                        color: getRankDetails(player.rank as any).color,
                      }}
                    >
                      {getRankDetails(player.rank as any).displayName}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Defense Tab Component  
function DefenseTab({
  arenaPlayer,
  playerHeroes,
  onSetDefense,
}: {
  arenaPlayer: ArenaPlayer;
  playerHeroes: any[];
  onSetDefense: (heroIds: string[]) => void;
}) {
  const [selectedHeroes, setSelectedHeroes] = useState<string[]>(arenaPlayer.defenseTeam.heroIds);

  const toggleHero = (heroId: string) => {
    if (selectedHeroes.includes(heroId)) {
      setSelectedHeroes(selectedHeroes.filter(id => id !== heroId));
    } else if (selectedHeroes.length < 3) {
      setSelectedHeroes([...selectedHeroes, heroId]);
    }
  };

  const handleSave = () => {
    onSetDefense(selectedHeroes);
  };

  return (
    <div className="space-y-6">
      {/* Current Defense */}
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Đội Hình Phòng Thủ</h3>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[0, 1, 2].map((slot) => {
            const heroId = selectedHeroes[slot];
            const hero = playerHeroes.find(h => h.id === heroId);
            
            return (
              <div
                key={slot}
                className={`aspect-square rounded-lg border-2 flex items-center justify-center ${
                  hero ? 'border-red-500 bg-red-50' : 'border-dashed border-gray-300 bg-gray-50'
                }`}
              >
                {hero ? (
                  <div className="text-center">
                    <div className="text-4xl mb-2">{hero.element === 'fire' ? '🔥' : hero.element === 'water' ? '💧' : hero.element === 'earth' ? '🌿' : '⚡'}</div>
                    <div className="font-bold text-sm">{hero.name}</div>
                    <div className="text-xs text-gray-600">Lv. {hero.level}</div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-center">
                    <Users className="w-12 h-12 mx-auto mb-2" />
                    <div className="text-sm">Trống</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm text-gray-600">Sức Mạnh Đội</div>
            <div className="text-2xl font-bold text-red-600">
              ⚡ {arenaPlayer.defenseTeam.teamPower}
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={selectedHeroes.length === 0}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              selectedHeroes.length > 0
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Check className="w-5 h-5 inline mr-2" />
            Lưu Đội Hình
          </button>
        </div>
      </div>

      {/* Hero Selection */}
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Chọn Heroes (Tối đa 3)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {playerHeroes.map((hero) => (
            <motion.div
              key={hero.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleHero(hero.id)}
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedHeroes.includes(hero.id)
                  ? 'border-red-500 bg-red-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {selectedHeroes.includes(hero.id) && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
              )}
              <div className="text-center">
                <div className="text-3xl mb-2">{hero.element === 'fire' ? '🔥' : hero.element === 'water' ? '💧' : hero.element === 'earth' ? '🌿' : '⚡'}</div>
                <div className="font-bold text-sm">{hero.name}</div>
                <div className="text-xs text-gray-600">Lv. {hero.level}</div>
                <div className="text-xs text-gray-500 mt-1">⚡ {hero.stats.attack + hero.stats.defense + hero.stats.hp}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Shop Tab Component
function ShopTab({
  arenaState,
  onPurchase,
  onLoadItems,
}: {
  arenaState: any;
  onPurchase: (itemId: string) => void;
  onLoadItems?: () => void;
}) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Coins Balance */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-90">Arena Coins Của Bạn</div>
            <div className="text-4xl font-bold mt-1">💎 {arenaState.arenaCoins}</div>
          </div>
          <Gift className="w-16 h-16 opacity-50" />
        </div>
      </div>

      {/* Shop Items */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {arenaState.shopItems.map((item: ArenaShopItem) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -5 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className={`bg-gradient-to-r ${getRarityColor(item.rarity)} p-4 text-white`}>
              <div className="text-center">
                <div className="text-4xl mb-2">
                  {item.type === 'hero' ? '👑' :
                   item.type === 'pet' ? '🐉' :
                   item.type === 'skin' ? '🎨' : '💰'}
                </div>
                <h3 className="font-bold">{item.displayName}</h3>
              </div>
            </div>

            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">{item.description}</p>

              {item.stock !== -1 && (
                <div className="text-xs text-gray-500 mb-3">
                  Còn lại: <span className="font-semibold">{item.stock}</span>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">Giá</span>
                <span className="text-xl font-bold text-purple-600">💎 {item.cost}</span>
              </div>

              <button
                onClick={() => onPurchase(item.id)}
                disabled={item.stock === 0 || arenaState.arenaCoins < item.cost}
                className={`w-full py-3 font-bold rounded-lg transition-all ${
                  item.stock === 0 || arenaState.arenaCoins < item.cost
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-md hover:shadow-lg'
                }`}
              >
                {item.stock === 0 ? 'Hết Hàng' : arenaState.arenaCoins < item.cost ? 'Không Đủ Coins' : 'Mua Ngay'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// History Tab Component
function HistoryTab({ battleHistory }: { battleHistory: ArenaBattle[] }) {
  if (battleHistory.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-12 text-center">
        <Clock className="w-24 h-24 mx-auto text-gray-300 mb-6" />
        <h3 className="text-2xl font-bold text-gray-700 mb-2">Chưa có lịch sử</h3>
        <p className="text-gray-600">Bắt đầu chiến đấu để xem lịch sử!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {battleHistory.map((battle) => (
        <div key={battle.id} className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-2xl ${battle.result === 'win' ? '🎉' : '😔'}`} />
                <div>
                  <div className="font-bold text-lg text-gray-900">
                    vs {battle.defenderName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(battle.timestamp).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-gray-600">Rating: </span>
                  <span className={`font-bold ${
                    battle.ratingChange > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {battle.ratingChange > 0 ? '+' : ''}{battle.ratingChange}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Coins: </span>
                  <span className="font-bold text-purple-600">+{battle.rewardCoins}</span>
                </div>
              </div>
            </div>

            <span className={`px-4 py-2 rounded-lg font-bold ${
              battle.result === 'win'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {battle.result === 'win' ? 'THẮNG' : 'THUA'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
