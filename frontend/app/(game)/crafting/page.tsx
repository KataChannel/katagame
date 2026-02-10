'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hammer, 
  Package, 
  Zap, 
  Flame, 
  Leaf, 
  Star,
  Info,
  CheckCircle2,
  Lock,
  ChevronRight
} from 'lucide-react';
import GraphQLApiClient from '@/lib/graphqlApiClient';
import { toast } from 'sonner';

export default function CraftingPage() {
  const [loading, setLoading] = useState(true);
  const [craftableItems, setCraftableItems] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [player, setPlayer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'craft' | 'inventory'>('craft');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [craftRes, invRes, meRes] = await Promise.all([
        GraphQLApiClient.getCraftableItems(),
        GraphQLApiClient.getMyInventory(),
        GraphQLApiClient.getMe(),
      ]);

      if (craftRes.success) setCraftableItems(craftRes.data);
      if (invRes.success) setInventory(invRes.data);
      if (meRes.success) setPlayer(meRes.data);
    } catch (error) {
      console.error('Error fetching crafting data:', error);
      toast.error('Không thể tải dữ liệu chế tác');
    } finally {
      setLoading(false);
    }
  };

  const handleCraft = async (itemId: string) => {
    const res = await GraphQLApiClient.craftItem(itemId);
    if (res.success) {
      toast.success('Chế tác thành công!');
      fetchData();
    } else {
      toast.error(res.message || 'Không đủ tài nguyên');
    }
  };

  const handleUse = async (itemId: string) => {
    const res = await GraphQLApiClient.useItem(itemId);
    if (res.success) {
      toast.success('Vật phẩm đã được sử dụng!');
      fetchData();
    } else {
      toast.error(res.message || 'Lỗi khi sử dụng vật phẩm');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full mx-auto mb-4"
          />
          <p className="text-amber-200/60 font-medium font-serif italic">Đang chuẩn bị lò rèn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-24">
      {/* Hero Header */}
      <div className="relative h-64 overflow-hidden bg-[url('https://images.unsplash.com/photo-1534073828943-f801091bb18c?q=80&w=2000')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/80 to-slate-950"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent animate-pulse"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 h-full flex flex-col justify-end pb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-2 text-orange-400 font-bold tracking-widest uppercase text-sm">
              <Hammer className="w-5 h-5" />
              Era 1: Ancient Vietnam
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-2 font-serif">
              LÒ RÈN <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">ÂU LẠC</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-lg font-medium leading-relaxed">
              Tận dụng tinh hoa của đất trời để chế tác những vật phẩm huyền thoại, giúp tăng cường thể lực và vận may.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8">
        {/* Stats & Navigation */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
          <div className="flex gap-4 p-1 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl w-full md:w-auto">
            <button
              onClick={() => setActiveTab('craft')}
              className={`flex-1 md:w-40 py-3 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'craft'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Hammer className="w-4 h-4" />
              CHẾ TÁC
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex-1 md:w-40 py-3 px-6 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'inventory'
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Package className="w-4 h-4" />
              KHO ĐỒ
            </button>
          </div>

          <div className="flex gap-6 items-center bg-slate-900/40 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
             <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Thể Lực</div>
                <div className="text-xl font-black text-white">{player?.stamina || 0} / {player?.maxStamina || 100}</div>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'craft' ? (
            <motion.div
              key="craft-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {craftableItems.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -4 }}
                  className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 relative overflow-hidden group backdrop-blur-sm"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Star className="w-24 h-24 text-orange-400" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-500/20 to-amber-600/20 rounded-2xl flex items-center justify-center text-4xl border border-orange-500/30">
                        {item.id === 'banh_chung' ? '🍱' : '🏐'}
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border ${
                        item.rarity === 'rare' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                      }`}>
                        {item.rarity}
                      </div>
                    </div>

                    <h3 className="text-3xl font-black mb-2 text-white font-serif">{item.nameVietnamese}</h3>
                    <p className="text-slate-400 mb-8 leading-relaxed font-medium">{item.description}</p>

                    <div className="space-y-4 mb-8">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Hiệu quả:</h4>
                      <div className="grid grid-cols-1 gap-3">
                        {item.staminaRestore > 0 && (
                          <div className="flex items-center gap-2 text-sm font-bold text-green-400 bg-green-400/10 p-2 rounded-lg border border-green-400/20">
                            <Zap className="w-4 h-4" />
                            +{item.staminaRestore} Thể lực
                          </div>
                        )}
                        {item.luckBonus > 0 && (
                          <div className="flex items-center gap-2 text-sm font-bold text-yellow-400 bg-yellow-400/10 p-2 rounded-lg border border-yellow-400/20">
                            <Star className="w-4 h-4" />
                            +{item.luckBonus} May mắn
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Nguyên liệu cần thiết:</h4>
                      <div className="flex flex-wrap gap-4">
                         <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                            <span className="text-xl">🌾</span>
                            <span className="font-bold text-slate-200">{item.baseRiceCost.toLocaleString()}</span>
                         </div>
                         {item.baseBronzeCost > 0 && (
                           <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                              <span className="text-xl">💰</span>
                              <span className="font-bold text-slate-200">{item.baseBronzeCost.toLocaleString()}</span>
                           </div>
                         )}
                         {item.baseWoodCost > 0 && (
                           <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                              <span className="text-xl">🪵</span>
                              <span className="font-bold text-slate-200">{item.baseWoodCost.toLocaleString()}</span>
                           </div>
                         )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCraft(item.id)}
                      className="w-full mt-8 py-5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-500/20 transition-all active:scale-[0.98]"
                    >
                      CHẾ TÁC NGAY
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="inventory-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {inventory.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {inventory.map((pi) => (
                    <motion.div
                      key={pi.id}
                      className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-sm"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center text-3xl">
                          {pi.itemId === 'banh_chung' ? '🍱' : '🏐'}
                        </div>
                        <div className="px-3 py-1 bg-orange-500/10 text-orange-400 rounded-lg text-sm font-black">
                          x{pi.quantity}
                        </div>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-1">{pi.item.nameVietnamese}</h4>
                      <p className="text-slate-500 text-sm mb-6">{pi.item.description}</p>
                      
                      <button
                        onClick={() => handleUse(pi.itemId)}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10"
                      >
                        SỬ DỤNG
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-white/10">
                  <Package className="w-16 h-16 mx-auto text-slate-700 mb-4" />
                  <h3 className="text-xl font-bold text-slate-400">Kho đồ trống</h3>
                  <p className="text-slate-600">Hãy bắt đầu chế tác vật phẩm đầu tiên!</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
