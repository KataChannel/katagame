import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gem, Zap, Star, Shield, TrendingUp, ChevronRight } from 'lucide-react';
import { useGameStore } from '@/lib/gameStore';
import PaymentModal from './PaymentModal';

const GEM_PACKS = [
  { id: 'gems_small', amount: 100, bonus: 0, price: 25000, icon: '💎', color: 'from-blue-400 to-blue-600' },
  { id: 'gems_medium', amount: 550, bonus: 50, price: 125000, icon: '💎💎', color: 'from-purple-400 to-purple-600' },
  { id: 'gems_large', amount: 1200, bonus: 200, price: 250000, icon: '💎💎💎', color: 'from-indigo-400 to-indigo-600' },
  { id: 'gems_extra', amount: 2500, bonus: 500, price: 500000, icon: '💎💎💎💎', color: 'from-pink-400 to-pink-600' },
  { id: 'gems_mega', amount: 6000, bonus: 1500, price: 1250000, icon: '⛰️', color: 'from-yellow-400 to-yellow-600' },
  { id: 'gems_ultra', amount: 13000, bonus: 4000, price: 2500000, icon: '🏛️', color: 'from-red-400 to-red-600' },
];

const GemShop = () => {
  const { purchaseGems } = useGameStore();
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPack, setSelectedPack] = useState<typeof GEM_PACKS[0] | null>(null);

  const handlePackClick = (pack: typeof GEM_PACKS[0]) => {
    setSelectedPack(pack);
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    if (selectedPack) {
      purchaseGems(selectedPack.amount + selectedPack.bonus, selectedPack.price);
      setShowPayment(false);
      setSelectedPack(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-6 rounded-xl border border-blue-500/30">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-blue-500 rounded-lg shadow-lg shadow-blue-500/50">
            <Gem className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Cửa Hàng Đá Quý</h2>
            <p className="text-blue-300 text-sm">Mua Đá Quý để mua vật phẩm hiếm, tướng và thăng tiến nhanh hơn</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        {GEM_PACKS.map((pack, index) => (
          <motion.div
            key={pack.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            onClick={() => handlePackClick(pack)}
            className="cursor-pointer group relative"
          >
            <div className={`h-full bg-gradient-to-br ${pack.color} p-0.5 rounded-2xl shadow-xl transition-all group-hover:shadow-glow`}>
              <div className="bg-gray-900 h-full rounded-2xl p-4 flex flex-col items-center justify-between gap-4 overflow-hidden relative">
                {/* Background Glow */}
                <div className={`absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br ${pack.color} blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`} />
                
                <div className="text-center">
                  <div className="text-4xl mb-2 filter drop-shadow-md group-hover:scale-110 transition-transform">
                    {pack.icon}
                  </div>
                  <h3 className="text-xl font-black text-white">{pack.amount.toLocaleString()}</h3>
                  <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">ĐÁ QUÝ</p>
                </div>

                {pack.bonus > 0 && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg animate-bounce">
                    +{pack.bonus.toLocaleString()} THƯỞNG
                  </div>
                )}

                <div className="w-full">
                   <div className="text-center mb-3">
                    <span className="text-yellow-400 font-bold text-lg">
                      {pack.price.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                  <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-blue-900/50">
                    MUA NGAY
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Monthly Pass Section */}
      <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-2xl p-6 border-2 border-yellow-500/30 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <ChevronRight className="w-32 h-32" />
        </div>
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="w-20 h-20 bg-yellow-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-yellow-500/50">
            ☀️
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Thẻ Tháng Đặc Quyền</h3>
            <p className="text-yellow-200 text-sm mt-1">Nhận ngay 300 Gems và 100 Gems mỗi ngày trong 30 ngày!</p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
              <span className="bg-black/40 text-yellow-500 text-[10px] font-bold px-2 py-1 rounded">3300 GEMS TỔNG</span>
              <span className="bg-black/40 text-yellow-500 text-[10px] font-bold px-2 py-1 rounded">X2 EXP</span>
              <span className="bg-black/40 text-yellow-500 text-[10px] font-bold px-2 py-1 rounded">HẠN CHẾ QUẢNG CÁO</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button 
              onClick={async () => {
                const { default: GraphQLApiClient } = await import('@/lib/graphqlApiClient');
                const res = await GraphQLApiClient.buyMonthlyPass();
                if (res.success) {
                  useGameStore.getState().addNotification({ type: 'success', title: 'Thành công', message: 'Kích hoạt Thẻ Tháng thành công!' });
                }
              }}
              className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black rounded-xl transition-all shadow-lg"
            >
              125,000 ₫
            </button>
            <button 
              onClick={async () => {
                const { default: GraphQLApiClient } = await import('@/lib/graphqlApiClient');
                const res = await GraphQLApiClient.claimMonthlyPassReward();
                if (res.success) {
                  useGameStore.getState().addNotification({ type: 'success', title: 'Thành công', message: 'Nhận quà Thẻ Tháng hôm nay!' });
                }
              }}
              className="text-yellow-500 text-xs font-bold hover:underline"
            >
              Nhận Quà Hàng Ngày
            </button>
          </div>
        </div>
      </div>

      {/* Special Items / Shields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-xl p-5 border border-blue-500/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h4 className="text-white font-bold">Khiên Hòa Bình (8h)</h4>
              <p className="text-xs text-gray-400">Tránh bị raid trong 8 giờ</p>
            </div>
          </div>
          <button 
            onClick={async () => {
              const { default: GraphQLApiClient } = await import('@/lib/graphqlApiClient');
              const res = await GraphQLApiClient.buyShield(8);
              if (res.success) {
                useGameStore.getState().addNotification({ type: 'success', title: 'Bảo vệ', message: 'Kích hoạt khiên 8h!' });
              }
            }}
            className="flex items-center gap-1 bg-blue-600 px-4 py-2 rounded-lg text-white font-bold text-sm"
          >
            <Gem className="w-3 h-3" />
            100
          </button>
        </div>

        <div className="bg-gray-800 rounded-xl p-5 border border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-8 h-8 text-purple-500" />
            </div>
            <div>
              <h4 className="text-white font-bold">Khiên Thần Thánh (24h)</h4>
              <p className="text-xs text-gray-400">Tránh bị raid trong 24 giờ</p>
            </div>
          </div>
          <button 
            onClick={async () => {
              const { default: GraphQLApiClient } = await import('@/lib/graphqlApiClient');
              const res = await GraphQLApiClient.buyShield(24);
              if (res.success) {
                useGameStore.getState().addNotification({ type: 'success', title: 'Bảo vệ', message: 'Kích hoạt khiên 24h!' });
              }
            }}
            className="flex items-center gap-1 bg-purple-600 px-4 py-2 rounded-lg text-white font-bold text-sm"
          >
            <Gem className="w-3 h-3" />
            250
          </button>
        </div>
      </div>

      {/* Bonus Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-900/20 rounded-full flex items-center justify-center">
            <Star className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">Điểm VIP Cực Khủng</h4>
            <p className="text-gray-400 text-xs text-balance">Nhận thêm điểm VIP tương ứng giá trị gói nạp để thăng hạng nhanh chóng.</p>
          </div>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-900/20 rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">Nhận Quà Tức Thì</h4>
            <p className="text-gray-400 text-xs">Đá quý được cộng trực tiếp vào tài khoản ngay sau khi thanh toán thành công.</p>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={handlePaymentSuccess}
        itemName={`Gói ${selectedPack?.amount} Đá Quý`}
        amount={selectedPack?.price || 0}
      />
    </div>
  );
};

export default GemShop;
