'use client';

import React, { useState, useEffect } from 'react';
import { MVP1ApiClient } from '@/lib/graphqlApiClient';
import { Gem, Lock, Sparkles, MapPin, Info, CheckCircle2 } from 'lucide-react';
import { LoadingScreen } from '@/components/UIComponents';
import { toast } from 'sonner';

export default function RelicsPage() {
  const [loading, setLoading] = useState(true);
  const [allRelics, setAllRelics] = useState<any[]>([]);
  const [myRelics, setMyRelics] = useState<any[]>([]);
  const [playerProvinces, setPlayerProvinces] = useState<any[]>([]);
  const [selectedRelic, setSelectedRelic] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [relicsRes, myRelicsRes, provincesRes] = await Promise.all([
        MVP1ApiClient.getAllRelics(),
        MVP1ApiClient.getMyRelics(),
        MVP1ApiClient.getPlayerProvinces(),
      ]);

      if (relicsRes.success) setAllRelics(relicsRes.data);
      if (myRelicsRes.success) setMyRelics(myRelicsRes.data);
      if (provincesRes.success) setPlayerProvinces(provincesRes.data);
    } catch (error) {
      console.error('Error fetching relic data:', error);
      toast.error('Không thể tải dữ liệu di vật');
    } finally {
      setLoading(false);
    }
  };

  const isRelicOwned = (relicId: string) => {
    return myRelics.some(mr => mr.relicId === relicId);
  };

  const getPlayerRelic = (relicId: string) => {
    return myRelics.find(mr => mr.relicId === relicId);
  };

  const handleCraft = async (relicId: string) => {
    try {
      const res = await MVP1ApiClient.craftRelic(relicId);
      if (res.success) {
        toast.success('Chế tác di vật thành công!');
        fetchData();
      } else {
        toast.error(res.message || 'Chế tác thất bại');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi chế tác');
    }
  };

  const handlePlace = async (playerRelicId: string, provinceId: number) => {
    try {
      const res = await MVP1ApiClient.placeRelic(playerRelicId, provinceId);
      if (res.success) {
        toast.success('Đã đặt di vật tại tỉnh thành!');
        fetchData();
        setSelectedRelic(null);
      } else {
        toast.error(res.message || 'Đặt di vật thất bại');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đặt di vật');
    }
  };

  if (loading) return <LoadingScreen message="Đang tìm kiếm cổ vật..." />;

  return (
    <div className="p-4 pb-24 max-w-4xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Gem className="text-amber-500 w-8 h-8" />
            Di Vật Cổ
          </h1>
          <p className="text-gray-500 text-sm mt-1">Sưu tầm và kích hoạt sức mạnh từ ngàn xưa</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allRelics.map((relic) => {
          const owned = isRelicOwned(relic.id);
          const pr = getPlayerRelic(relic.id);
          const provinceName = pr?.provinceId ? playerProvinces.find(p => p.provinceId === pr.provinceId)?.province?.name : null;

          return (
            <div 
              key={relic.id}
              className={`relative overflow-hidden group bg-white dark:bg-zinc-900 border ${owned ? 'border-amber-200 dark:border-amber-900/30 ring-1 ring-amber-500/10' : 'border-gray-200 dark:border-zinc-800'} rounded-3xl p-6 transition-all hover:shadow-xl`}
            >
              {owned && (
                <div className="absolute top-4 right-4 text-amber-500">
                  <CheckCircle2 className="w-6 h-6 fill-amber-50" />
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${owned ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600' : 'bg-gray-100 dark:bg-zinc-800 text-gray-400'}`}>
                  <Sparkles className="w-8 h-8" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg dark:text-white leading-tight">
                      {relic.name}
                    </h3>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${relic.rarity === 'legendary' ? 'bg-amber-100 text-amber-600' : 'bg-purple-100 text-purple-600'}`}>
                      {relic.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 line-clamp-2">
                    {relic.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-3 flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1.5 font-medium">
                    <Info className="w-4 h-4" /> Hiệu Ứng:
                  </span>
                  <span className="font-bold text-red-600">
                    +{Math.round(relic.auraValue * 100)}% {relic.auraType === 'production_all' ? 'Tài Nguyên' : 'Phòng Thủ'}
                  </span>
                </div>

                {owned ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs font-bold px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl">
                      <MapPin className="w-3 h-3" />
                      {provinceName ? `Đang đặt tại: ${provinceName}` : 'Chưa được đặt'}
                    </div>
                    {!provinceName && (
                      <button 
                        onClick={() => setSelectedRelic(pr)}
                        className="w-full bg-red-600 text-white font-bold py-2.5 rounded-2xl text-sm transition-all active:scale-95 shadow-lg shadow-red-200 dark:shadow-red-900/20"
                      >
                        Đặt Di Vật
                      </button>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={() => handleCraft(relic.id)}
                    className="w-full bg-zinc-900 dark:bg-white dark:text-black text-white font-bold py-3 rounded-2xl text-sm transition-all active:scale-95"
                  >
                    Chế Tác (Lễ Vật)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Place Relic Dialog */}
      {selectedRelic && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl p-6 animate-in slide-in-from-bottom-20 duration-500">
            <h2 className="text-xl font-black mb-1 dark:text-white">Chọn Tỉnh Thành</h2>
            <p className="text-sm text-gray-500 mb-6 font-medium">Chọn vùng đất bạn muốn ban phước lành của di vật</p>
            
            <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {playerProvinces.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handlePlace(selectedRelic.id, p.provinceId)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl border border-transparent hover:border-red-100 transition-all text-left group"
                >
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white block group-hover:text-red-700">{p.province.name}</span>
                    <span className="text-[10px] uppercase tracking-wider font-black text-gray-400">{p.province.region}</span>
                  </div>
                  <MapPin className="text-gray-300 group-hover:text-red-500 w-5 h-5" />
                </button>
              ))}
            </div>

            <button 
              onClick={() => setSelectedRelic(null)}
              className="w-full mt-6 py-4 text-gray-500 font-bold hover:text-gray-900 transition-colors uppercase text-xs tracking-widest"
            >
              Hủy Bỏ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
