import { useGameStore } from '@/lib/gameStore';
import { Crown, Star, Shield, Zap, TrendingUp, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { VIP_LEVELS } from '@/lib/enhancedShopSystem';

const VIPStatus = () => {
  const { enhancedShopState } = useGameStore();
  
  if (!enhancedShopState) return null;
  
  const { vipSystem } = enhancedShopState;
  const currentVIP = VIP_LEVELS.find(v => v.level === vipSystem.level) || VIP_LEVELS[0];
  const nextVIP = VIP_LEVELS.find(v => v.level === vipSystem.level + 1);
  const progress = nextVIP 
    ? ((vipSystem.points - currentVIP.points) / (nextVIP.points - currentVIP.points)) * 100 
    : 100;

  const benefits = [
    { icon: Star, label: 'Thưởng Đá Quý Hàng Ngày', value: `+${currentVIP.benefits.dailyGemBonus}` },
    { icon: Shield, label: 'Giảm Giá Cửa Hàng', value: `${currentVIP.benefits.shopDiscountPercent}%` },
    { icon: Zap, label: 'Hồi Thể Lực', value: `+${currentVIP.benefits.extraStaminaRegen}%` },
    { icon: TrendingUp, label: 'Tốc Độ Game', value: `x${currentVIP.benefits.fastForwardSpeed}` },
  ];

  return (
    <div className="bg-gray-900 border border-purple-500/30 rounded-xl overflow-hidden shadow-2xl">
      {/* VIP Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 p-6 border-b border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg transform -rotate-12">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-gray-900">
                VIP {vipSystem.level}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Trạng Thái VIP</h3>
              <p className="text-purple-300 text-sm">Điểm VIP: {vipSystem.points.toLocaleString()}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-1">Cấp độ hiện tại</p>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
              LEVEL {vipSystem.level}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        {nextVIP && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Tiến độ lên VIP {vipSystem.level + 1}</span>
              <span>{vipSystem.points} / {nextVIP.points}</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3 p-0.5 border border-purple-500/10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 h-full rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Benefits Grid */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4 text-gray-300">
          <Info className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium uppercase tracking-wider">Đặc quyền hiện tại</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 border border-gray-700/50 p-4 rounded-xl flex flex-col items-center text-center group hover:border-purple-500/50 transition-colors"
              >
                <div className="w-10 h-10 bg-purple-900/30 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-[10px] text-gray-400 uppercase tracking-tighter mb-1">{benefit.label}</p>
                <p className="text-lg font-bold text-white">{benefit.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-6 p-4 bg-purple-900/20 rounded-lg border border-purple-500/10">
          <p className="text-xs text-purple-200 leading-relaxed italic text-center">
            "Nạp 1,000đ nhận 1 điểm VIP. Thăng cấp VIP để mở khóa đặc quyền tối thượng và tốc độ phát triển vượt bậc!"
          </p>
        </div>
      </div>
    </div>
  );
};

export default VIPStatus;
