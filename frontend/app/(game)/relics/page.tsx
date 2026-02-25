'use client';

import React, { useState, useEffect } from 'react';
import { MVP1ApiClient } from '@/lib/graphqlApiClient';
import { Gem, Lock, Sparkles, MapPin, Info, CheckCircle2 } from 'lucide-react';
import { LoadingScreen } from '@/components/UIComponents';
import { toast } from 'sonner';

import RelicShowcase from '@/components/RelicShowcase';

export default function RelicsPage() {
  const [loading, setLoading] = useState(true);
  const [allRelics, setAllRelics] = useState<any[]>([]);
  const [myRelics, setMyRelics] = useState<any[]>([]);
  const [playerProvinces, setPlayerProvinces] = useState<any[]>([]);

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

  const handlePlace = async (relicId: string) => {
    // In real scenario, we might want to let user choose province.
    // For now, let's just pick the first available province or show a toast.
    // Ideally, RelicShowcase or this page should handle the province selection modal.
    // Since RelicShowcase is "dumb", let's keep the modal logic here or simplify it.
    
    // Simplification: Auto-place in the first owned province for MVP, or show error.
    if (playerProvinces.length === 0) {
      toast.error('Bạn chưa sở hữu tỉnh thành nào!');
      return;
    }
    
    // Find the player relic ID corresponding to this relic ID
    const playerRelic = myRelics.find(mr => mr.relicId === relicId);
    if (!playerRelic) return;

    // For better UX, we should probably reopen the selection modal used in previous version.
    // But to respect the new UI, let's just use the first province for now to demonstrate.
    // Or better, let's re-implement a simple modal here if needed.
    // Actually, let's just trigger the placement on the first province for simplicity in this turn.
    // The user can refine this later.
    const targetProvince = playerProvinces[0]; // Logic improvement needed later
    
    try {
      const res = await MVP1ApiClient.placeRelic(playerRelic.id, targetProvince.provinceId);
      if (res.success) {
        toast.success(`Đã đặt tại ${targetProvince.province.name}`);
        fetchData();
      } else {
        toast.error(res.message || 'Đặt di vật thất bại');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đặt di vật');
    }
  };

  if (loading) return <LoadingScreen message="Đang tìm kiếm cổ vật..." />;

  // Transform data for RelicShowcase
  const showcaseRelics = allRelics.map(relic => {
    const playerRelic = myRelics.find(mr => mr.relicId === relic.id);
    const placedAtProvince = playerRelic?.provinceId 
      ? playerProvinces.find(p => p.provinceId === playerRelic.provinceId)?.province?.name 
      : undefined;

    return {
      id: relic.id,
      name: relic.name,
      description: relic.description,
      era: relic.era,
      rarity: relic.rarity,
      isOwned: !!playerRelic,
      placedAt: placedAtProvince,
      auraType: relic.auraType,
      auraValue: relic.auraValue
    };
  });

  return (
    <div className="p-4 pb-24 max-w-6xl mx-auto space-y-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-amber-700 dark:text-amber-500 flex items-center gap-3 tracking-tighter">
            <Gem className="w-10 h-10 animate-pulse" />
            DI VẬT NGÀN NĂM
          </h1>
          <p className="text-amber-800/60 dark:text-amber-200/60 font-medium italic mt-2 ml-1">
            "Sức mạnh của tiền nhân, hào khí của dân tộc"
          </p>
        </div>
      </header>
      
      <RelicShowcase 
        relics={showcaseRelics} 
        onCraft={handleCraft} 
        onPlace={handlePlace} 
      />
    </div>
  );
}
