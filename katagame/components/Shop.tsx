import { useGameStore } from '@/lib/gameStore';
import { ShoppingCart, Gift, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const Shop = () => {
  const { player, buyFarmer, upgradeProvince } = useGameStore();

  const shopItems = [
    {
      id: 'gold-pack-small',
      name: 'Túi Vàng Nhỏ',
      description: '1,000 vàng + 500 lúa',
      price: 19000,
      icon: '💰',
      type: 'resource-pack',
      resources: { gold: 1000, rice: 500, lumber: 0, stone: 0, culture: 100 }
    },
    {
      id: 'gold-pack-medium',
      name: 'Túi Vàng Vừa',
      description: '5,000 vàng + 2,500 lúa + 1,000 gỗ',
      price: 99000,
      icon: '💎',
      type: 'resource-pack',
      resources: { gold: 5000, rice: 2500, lumber: 1000, stone: 500, culture: 500 }
    },
    {
      id: 'gold-pack-large',
      name: 'Túi Vàng Lớn',
      description: '20,000 vàng + Bonus tất cả tài nguyên',
      price: 299000,
      icon: '🏆',
      type: 'resource-pack',
      resources: { gold: 20000, rice: 10000, lumber: 5000, stone: 2500, culture: 2000 }
    },
    {
      id: 'auto-farmer-pack',
      name: 'Đội Nông Dân Tự Động',
      description: '5 nông dân tự động cho tất cả tỉnh',
      price: 199000,
      icon: '👥',
      type: 'farmer-pack',
    },
    {
      id: 'speed-boost',
      name: 'Tăng Tốc 2x',
      description: 'Tăng tốc game 2x trong 24h',
      price: 49000,
      icon: '⚡',
      type: 'boost',
    },
    {
      id: 'cultural-boost',
      name: 'Phúc Lợi Văn Hóa',
      description: '+50% điểm văn hóa vĩnh viễn',
      price: 149000,
      icon: '🎭',
      type: 'permanent-boost',
    }
  ];

  const handlePurchase = (item: any) => {
    // In real app, this would integrate with payment gateway
    alert(`Mua ${item.name} với giá ${item.price.toLocaleString('vi-VN')} VND\nTính năng payment sẽ được tích hợp trong phiên bản tiếp theo!`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-red-800 mb-2">🛒 Cửa Hàng</h2>
        <p className="text-gray-600">Mua các vật phẩm để phát triển nhanh hơn</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shopItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg p-6 shadow-lg border-2 border-gray-200 hover:border-red-300 transition-colors"
          >
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{item.icon}</div>
              <h3 className="text-xl font-bold text-red-800">{item.name}</h3>
              <p className="text-gray-600 text-sm mt-2">{item.description}</p>
            </div>

            {item.type === 'resource-pack' && item.resources && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Nội dung gói:</h4>
                {Object.entries(item.resources).map(([key, value]) => (
                  value > 0 && (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="capitalize">{key}:</span>
                      <span className="font-semibold">+{value.toLocaleString()}</span>
                    </div>
                  )
                ))}
              </div>
            )}

            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-red-600">
                {item.price.toLocaleString('vi-VN')} ₫
              </div>
            </div>

            <button
              onClick={() => handlePurchase(item)}
              className="w-full bg-gradient-to-r from-red-500 to-yellow-500 text-white py-3 rounded-lg font-semibold hover:from-red-600 hover:to-yellow-600 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Mua Ngay
            </button>
          </motion.div>
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-yellow-800 mb-3 flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Ưu Đãi Đặc Biệt
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-yellow-300">
            <h4 className="font-semibold text-yellow-800">🎉 Ưu đãi người chơi mới</h4>
            <p className="text-yellow-700 text-sm">Giảm 50% gói đầu tiên trong 24h đầu</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-yellow-300">
            <h4 className="font-semibold text-yellow-800">💎 Tích điểm thành viên</h4>
            <p className="text-yellow-700 text-sm">Mỗi lần mua +10 điểm, đổi quà hấp dẫn</p>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>💳 Hỗ trợ thanh toán: VNPay, MoMo, Banking, Visa/Mastercard</p>
        <p>🔒 Giao dịch an toàn 100% • Hỗ trợ 24/7</p>
      </div>
    </div>
  );
};

export default Shop;