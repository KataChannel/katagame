import { useGameStore } from '@/lib/gameStore';
import { Crown, Gift, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const PremiumPass = () => {
  const { player, purchasePremiumPass } = useGameStore();

  if (player.premiumPass?.active) {
    return (
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="h-8 w-8 text-yellow-300" />
            <div>
              <h3 className="text-xl font-bold">{player.premiumPass.name}</h3>
              <p className="text-purple-100">Đã Kích Hoạt</p>
            </div>
          </div>
          <Zap className="h-8 w-8 text-yellow-300 animate-pulse" />
        </div>
        
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Đặc Quyền:</h4>
          <ul className="space-y-1 text-purple-100">
            {player.premiumPass.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-2">
                <Gift className="h-4 w-4" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const passes = [
    {
      type: 'basic' as const,
      name: 'Basic Pass',
      price: 99000,
      color: 'from-blue-500 to-blue-600',
      benefits: ['+50% tài nguyên', 'Phần thưởng hàng ngày', 'Loại bỏ quảng cáo'],
    },
    {
      type: 'premium' as const,
      name: 'Premium Pass',
      price: 299000,
      color: 'from-purple-500 to-purple-600',
      benefits: ['+100% tài nguyên', 'Nông dân độc quyền', 'Tiến độ nhanh'],
    },
    {
      type: 'royal' as const,
      name: 'Royal Pass',
      price: 999000,
      color: 'from-yellow-500 to-yellow-600',
      benefits: ['+200% tài nguyên', 'Hỗ trợ VIP', 'Nội dung độc quyền'],
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-red-800 text-center mb-6">
        🎁 Premium Pass - Đặc Quyền VIP
      </h2>
      
      <div className="grid md:grid-cols-3 gap-4">
        {passes.map((pass, index) => (
          <motion.div
            key={pass.type}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${pass.color} rounded-lg p-6 text-white shadow-lg`}
          >
            <div className="text-center mb-4">
              <Crown className="h-12 w-12 mx-auto mb-2 text-yellow-300" />
              <h3 className="text-xl font-bold">{pass.name}</h3>
              <div className="text-2xl font-bold mt-2">
                {pass.price.toLocaleString('vi-VN')} ₫
              </div>
              <div className="text-sm opacity-80">30 ngày</div>
            </div>

            <div className="space-y-2 mb-6">
              {pass.benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Gift className="h-4 w-4" />
                  {benefit}
                </div>
              ))}
            </div>

            <button
              onClick={() => purchasePremiumPass(pass.type)}
              className="w-full bg-white/20 hover:bg-white/30 rounded-lg py-3 font-semibold transition-colors"
            >
              Mua Ngay
            </button>
          </motion.div>
        ))}
      </div>

      <div className="text-center text-sm text-gray-600 mt-4">
        * Premium Pass giúp bạn phát triển nhanh hơn và có trải nghiệm tốt hơn
      </div>
    </div>
  );
};

export default PremiumPass;