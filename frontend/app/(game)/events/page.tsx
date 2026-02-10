'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Waves, 
  Mountain, 
  Trophy, 
  Users, 
  Clock, 
  ArrowRight,
  ShieldAlert,
  Droplets,
  Coins,
  History,
  Zap
} from 'lucide-react';
import GraphQLApiClient from '@/lib/graphqlApiClient';
import { toast } from 'sonner';

export default function EventsPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [participation, setParticipation] = useState<any>(null);
  const [player, setPlayer] = useState<any>(null);
  const [contributeAmount, setContributeAmount] = useState(100);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const meRes = await GraphQLApiClient.getMe();
      if (meRes.success) setPlayer(meRes.data);

      const res = await GraphQLApiClient.getActiveEvents();
      if (res.success && res.data.length > 0) {
        setEvents(res.data);
        const partRes = await GraphQLApiClient.getMyParticipation(res.data[0].id);
        if (partRes.success) setParticipation(partRes.data);
      }
    } catch (error) {
      toast.error('Không thể tải dữ liệu sự kiện');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (eventId: string, choice: string) => {
    const res = await GraphQLApiClient.joinEvent(eventId, choice);
    if (res.success) {
      toast.success(`Bạn đã gia nhập phe ${choice === 'SON_TINH' ? 'Sơn Tinh' : 'Thủy Tinh'}!`);
      fetchEvents();
    } else {
      toast.error(res.message);
    }
  };

  const handleContribute = async (eventId: string) => {
    const res = await GraphQLApiClient.contributeToEvent(eventId, contributeAmount);
    if (res.success) {
      toast.success('Đóng góp thành công!');
      fetchEvents();
    } else {
      toast.error(res.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-amber-500 font-serif text-2xl"
        >
          Đang xem thiên tượng...
        </motion.div>
      </div>
    );
  }

  const activeEvent = events[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-24 overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.1),transparent)]"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_80%_80%,rgba(124,58,237,0.05),transparent)]"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10 pt-12">
        <header className="mb-12">
           <div className="flex items-center gap-3 mb-4 text-amber-500 font-bold tracking-widest uppercase text-sm">
            <History className="w-5 h-5" />
            Huyền Thoại Era 1
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 font-serif leading-tight">
            ĐẠI CHIẾN <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-orange-400 animate-gradient">
              SƠN TINH - THỦY TINH
            </span>
          </h1>
          <p className="text-slate-400 max-w-2xl text-lg font-medium">
            Khi nước lũ dâng cao, vận mệnh của trăm họ nằm trong tay bạn. Bạn sẽ chọn phe Sơn Tinh vững chãi như núi rừng, hay Thủy Tinh mạnh mẽ như đại dương?
          </p>
        </header>

        {!activeEvent ? (
          <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-20 text-center backdrop-blur-xl">
             <ShieldAlert className="w-20 h-20 mx-auto text-slate-700 mb-6" />
             <h2 className="text-3xl font-bold text-slate-400">Yên bình tạm thời</h2>
             <p className="text-slate-500 max-w-md mx-auto mt-2 italic">Hiện tại chưa có biến động lớn về thiên tượng. Hãy tích trữ tài nguyên chuẩn bị cho mùa lũ tới.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Event Main Info */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden backdrop-blur-xl group">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-1000"></div>
                
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center gap-4 mb-8">
                    <div className="flex items-center gap-2 bg-blue-500/20 px-4 py-2 rounded-full border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-widest">
                      <Droplets className="w-4 h-4" />
                      Mùa Lũ Đang Tới
                    </div>
                    <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full border border-white/5 text-slate-400 text-xs font-bold">
                      <Clock className="w-4 h-4" />
                      Kết thúc sau 5 ngày
                    </div>
                  </div>

                  {!participation ? (
                    <div className="space-y-12">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {activeEvent.metadata?.choices?.map((choice: any) => (
                          <motion.button
                            key={choice.key}
                            whileHover={{ scale: 1.02, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleJoin(activeEvent.id, choice.key)}
                            className={`p-8 rounded-[2rem] border transition-all text-left relative overflow-hidden group ${
                              choice.key === 'SON_TINH' 
                                ? 'bg-orange-500/10 border-orange-500/20 hover:border-orange-500/50' 
                                : 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/50'
                            }`}
                          >
                            <div className={`p-4 rounded-2xl mb-6 inline-flex ${
                              choice.key === 'SON_TINH' ? 'bg-orange-500/20' : 'bg-blue-500/20'
                            }`}>
                              {choice.key === 'SON_TINH' ? <Mountain className="w-8 h-8 text-orange-400" /> : <Waves className="w-8 h-8 text-blue-400" />}
                            </div>
                            <h3 className={`text-2xl font-black mb-2 ${
                              choice.key === 'SON_TINH' ? 'text-orange-400' : 'text-blue-400'
                            }`}>{choice.label}</h3>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed">{choice.description}</p>
                            
                            <div className="mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-all">
                              Gia nhập ngay <ArrowRight className="w-4 h-4" />
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-10">
                      <div className="flex flex-col md:flex-row items-center gap-8 bg-white/5 p-8 rounded-3xl border border-white/5">
                        <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-4xl shadow-2xl ${
                           participation.choice === 'SON_TINH' ? 'bg-orange-500 shadow-orange-500/20' : 'bg-blue-500 shadow-blue-500/20'
                        }`}>
                           {participation.choice === 'SON_TINH' ? '⛰️' : '🌊'}
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-500 uppercase tracking-widest mb-1">Bạn đã chọn theo phe</div>
                          <div className={`text-4xl font-black ${
                            participation.choice === 'SON_TINH' ? 'text-orange-400' : 'text-blue-400'
                          }`}>
                            {participation.choice === 'SON_TINH' ? 'SƠN TINH' : 'THỦY TINH'}
                          </div>
                        </div>
                        <div className="md:ml-auto text-center md:text-right">
                           <div className="text-sm font-black text-slate-500 uppercase tracking-widest mb-1">Cống hiến</div>
                           <div className="text-4xl font-black text-white">{participation.contributionPoints.toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="bg-slate-900/60 p-8 rounded-3xl border border-white/5">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="text-xl font-bold flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-500" />
                            Đóng góp nguồn lực
                          </h3>
                          <div className="text-xs font-black text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/5 uppercase tracking-widest">
                            Tài nguyên: {participation.choice === 'SON_TINH' ? 'Đá' : 'Lúa'}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                          {[100, 500, 1000, 5000].map(amount => (
                            <button
                              key={amount}
                              onClick={() => setContributeAmount(amount)}
                              className={`py-4 rounded-2xl font-bold transition-all border ${
                                contributeAmount === amount 
                                  ? 'bg-amber-500 text-slate-950 border-amber-500' 
                                  : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/10'
                              }`}
                            >
                              {amount.toLocaleString()}
                            </button>
                          ))}
                        </div>

                        <button 
                          onClick={() => handleContribute(activeEvent.id)}
                          className={`w-full py-6 rounded-2xl font-black text-xl shadow-2xl transition-all active:scale-[0.98] ${
                            participation.choice === 'SON_TINH' 
                              ? 'bg-orange-500 hover:bg-orange-400 shadow-orange-500/20' 
                              : 'bg-blue-500 hover:bg-blue-400 shadow-blue-500/20'
                          }`}
                        >
                           XÁC NHẬN ĐÓNG GÓP
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar info */}
            <div className="space-y-8">
              <div className="bg-slate-900/40 border border-white/5 rounded-[2rem] p-8 backdrop-blur-xl">
                 <h3 className="text-lg font-black mb-6 uppercase tracking-widest text-slate-500">Tiến độ thế giới</h3>
                 <div className="space-y-6">
                    <div>
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-sm font-bold text-orange-400">Sơn Tinh</span>
                        <span className="text-xs text-slate-500 font-bold uppercase">45%</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-sm font-bold text-blue-400">Thủy Tinh</span>
                        <span className="text-xs text-slate-500 font-bold uppercase">55%</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: '55%' }}></div>
                      </div>
                    </div>
                 </div>

                 <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      <div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Phần thưởng phe thắng</div>
                        <div className="text-sm font-bold text-white">+20% Sản lượng Rice/Stone (Vĩnh viễn)</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Người tham gia</div>
                        <div className="text-sm font-bold text-white">1,248 Bộ lạc</div>
                      </div>
                    </div>
                 </div>
              </div>

               <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-[2rem] p-8">
                 <h3 className="text-lg font-black mb-4 uppercase text-amber-500">Mẹo Thiên Tượng</h3>
                 <p className="text-sm text-amber-200/60 leading-relaxed font-medium">
                   Tỉnh thành có **Trống Đồng Đông Sơn** sẽ nhận được gấp đôi điểm cống hiến cho phe Sơn Tinh. Đừng quên trang bị di vật quý trước khi hành động!
                 </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
