'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  Swords, 
  Trophy, 
  Clock, 
  Shield, 
  Target, 
  Zap, 
  Award,
  AlertTriangle
} from 'lucide-react';
import { useGameStore } from '@/lib/gameStore';

export default function WorldBossTab() {
  const { attackWorldBossAction } = useGameStore();
  const [bossData, setBossData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAttacking, setIsAttacking] = useState(false);
  const [attackResult, setAttackResult] = useState<any>(null);

  useEffect(() => {
    fetchBossData();
    const interval = setInterval(fetchBossData, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchBossData = async () => {
    try {
      const { default: GraphQLApiClient } = await import('@/lib/graphqlApiClient');
      const response = await GraphQLApiClient.getActiveWorldBoss();
      if (response.success) {
        setBossData(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching boss data:', error);
      setLoading(false);
    }
  };

  const handleAttack = async () => {
    if (!bossData || isAttacking) return;
    
    setIsAttacking(true);
    // Simulate damage based on player power (mocked damage for now)
    const damage = Math.floor(Math.random() * 5000) + 2000;
    
    const result = await attackWorldBossAction(bossData.id, damage);
    if (result) {
      setAttackResult({
        damage,
        rewards: result.rewards || '500 Gold, 20 Gems',
        totalDamage: result.currentHp // This is update boss HP
      });
      fetchBossData();
    }
    setIsAttacking(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white/5 rounded-xl">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400">Đang tìm kiếm Boss Thế Giới...</p>
      </div>
    );
  }

  if (!bossData || bossData.currentHp <= 0) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center border-2 border-dashed border-gray-600">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-2xl font-bold text-white mb-2">Boss Đã Bị Tiêu Diệt!</h2>
        <p className="text-gray-300 mb-6">Boss thế giới hiện chưa xuất hiện. Hãy chờ đợi đợt xâm lược tiếp theo.</p>
        <div className="flex justify-center gap-4">
          <div className="bg-black/30 p-4 rounded-lg">
            <div className="text-xs text-gray-500 uppercase">Hồi sinh sau</div>
            <div className="text-xl font-bold text-yellow-500">02:45:12</div>
          </div>
        </div>
      </div>
    );
  }

  const hpPercentage = (bossData.currentHp / bossData.maxHp) * 100;

  return (
    <div className="space-y-6">
      {/* Boss Profile */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-gradient-to-b from-gray-900 via-red-900/40 to-black rounded-2xl overflow-hidden border-2 border-red-900/50 shadow-2xl"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop')] opacity-20 bg-cover bg-center mix-blend-overlay" />
        
        <div className="relative p-8 text-center pt-16">
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-8xl mb-6 filter drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]"
          >
            🐲
          </motion.div>
          
          <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter italic">
            {bossData.name || 'Thần Thú Thượng Cổ'}
          </h2>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold mb-8">
            <Flame className="w-3 h-3 fill-white" />
            WORLD BOSS
          </div>

          {/* HP Bar */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="flex justify-between items-end mb-2">
              <span className="text-red-400 font-bold text-sm">SINH MỆNH</span>
              <span className="text-white font-black">{Math.floor(bossData.currentHp).toLocaleString()} / {bossData.maxHp.toLocaleString()}</span>
            </div>
            <div className="h-4 bg-gray-800 rounded-full overflow-hidden border border-white/10 p-0.5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${hpPercentage}%` }}
                className="h-full bg-gradient-to-r from-red-600 via-red-500 to-orange-400 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.5)]"
              />
            </div>
          </div>

          {/* Boss Status */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
            <div className="bg-black/40 backdrop-blur-sm p-3 rounded-xl border border-white/5">
              <div className="text-xs text-gray-500 mb-1">Cấp Độ</div>
              <div className="text-xl font-bold text-white">Lv. 99</div>
            </div>
            <div className="bg-black/40 backdrop-blur-sm p-3 rounded-xl border border-white/5">
              <div className="text-xs text-gray-500 mb-1">Thời Gian</div>
              <div className="text-xl font-bold text-white">00:54:21</div>
            </div>
            <div className="bg-black/40 backdrop-blur-sm p-3 rounded-xl border border-white/5">
              <div className="text-xs text-gray-500 mb-1">Sát Thủ</div>
              <div className="text-xl font-bold text-white">842</div>
            </div>
          </div>

          <button
            onClick={handleAttack}
            disabled={isAttacking}
            className="group relative px-12 py-5 bg-red-600 rounded-full font-black text-white text-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-0 group-hover:opacity-100" />
            <span className="flex items-center gap-3">
              <Swords className="w-6 h-6" />
              TẤN CÔNG BOSS
            </span>
          </button>
        </div>
      </motion.div>

      {/* Rewards & Rank */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <Award className="w-6 h-6 text-yellow-500" />
            Top Sát Thương hôm nay
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map((rank) => (
              <div key={rank} className="flex items-center justify-between p-3 bg-black/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    rank === 1 ? 'bg-yellow-500 text-black' : 
                    rank === 2 ? 'bg-gray-300 text-black' : 
                    'bg-orange-600 text-white'
                  }`}>
                    {rank}
                  </div>
                  <span className="text-white font-medium">Người Chơi {rank}</span>
                </div>
                <span className="text-red-400 font-bold">{(1200000 / rank).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-blue-500" />
            Phần Thưởng Công Kích
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/30 p-4 rounded-xl text-center">
              <div className="text-2xl mb-1">💰</div>
              <div className="text-white font-bold">100k - 1M</div>
              <div className="text-gray-400 text-xs text-gray-500 uppercase">Vàng</div>
            </div>
            <div className="bg-black/30 p-4 rounded-xl text-center">
              <div className="text-2xl mb-1">💎</div>
              <div className="text-white font-bold">10 - 50</div>
              <div className="text-gray-400 text-xs text-gray-500 uppercase">Gems</div>
            </div>
            <div className="bg-black/30 p-4 rounded-xl text-center">
              <div className="text-2xl mb-1">📦</div>
              <div className="text-white font-bold">Mảnh Hồn</div>
              <div className="text-gray-400 text-xs text-gray-500 uppercase">Hiếm</div>
            </div>
            <div className="bg-black/30 p-4 rounded-xl text-center">
              <div className="text-2xl mb-1">🧧</div>
              <div className="text-white font-bold">Bùa Chú</div>
              <div className="text-gray-400 text-xs text-gray-500 uppercase">Linh Nghiệm</div>
            </div>
          </div>
        </div>
      </div>

      {/* Attack Result Modal */}
      <AnimatePresence>
        {attackResult && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setAttackResult(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-gray-900 border-2 border-red-500 p-8 rounded-3xl max-w-sm w-full text-center shadow-[0_0_50px_rgba(220,38,38,0.5)]"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-5xl mb-4">💥</div>
              <h3 className="text-2xl font-black text-white mb-2">ĐÃ TẤN CÔNG!</h3>
              <div className="text-4xl font-black text-red-500 mb-6 transition-all animate-bounce">
                -{attackResult.damage.toLocaleString()}
              </div>
              <div className="bg-black/40 rounded-xl p-4 mb-6">
                <div className="text-gray-500 text-xs uppercase mb-2">Phần thưởng nhận được</div>
                <div className="text-white font-bold">{attackResult.rewards}</div>
              </div>
              <button
                onClick={() => setAttackResult(null)}
                className="w-full py-3 bg-white text-black font-black rounded-lg hover:bg-gray-200"
              >
                XÁC NHẬN
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
