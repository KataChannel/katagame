'use client';

import { useGameStore } from '@/lib/gameStore';
import PlayerInfo from '@/components/PlayerInfo';
import ProvinceCard from '@/components/ProvinceCard';
import MobileProvinceCard from '@/components/MobileProvinceCard';
import Tutorial from '@/components/Tutorial';
import { useState, useEffect } from 'react';

export default function GameDashboard() {
  const { player, provinces, tutorial, completeTutorial } = useGameStore();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Show tutorial for new players
    if (!tutorial.completed && player.level === 1 && player.experience === 0) {
      setTimeout(() => setShowTutorial(true), 1000);
    }
  }, [tutorial.completed, player.level, player.experience]);

  return (
    <div className="space-y-6">
      <PlayerInfo />

      {/* Provinces */}
      <div>
        <h2 className="text-2xl font-bold text-red-800 mb-4 text-center">
          🗺️ Các Tỉnh Thành Việt Nam
        </h2>
        
        {provinces.length === 0 ? (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 text-center">
            <p className="text-lg text-yellow-800 mb-2">🔄 Đang tải dữ liệu tỉnh thành...</p>
            <p className="text-sm text-yellow-600">Nếu bạn là người chơi mới, hãy đợi vài giây để hệ thống khởi tạo.</p>
          </div>
        ) : (
          <>
            <div className="md:hidden space-y-4">
              {provinces.map((province, index) => (
                <MobileProvinceCard key={province.id || `province-${index}`} province={province} />
              ))}
            </div>
            <div className="hidden md:grid lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {provinces.map((province, index) => (
                <ProvinceCard key={province.id || `province-${index}`} province={province} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Game Instructions */}
      <div className="bg-white rounded-lg p-6 border-2 border-yellow-200 shadow-lg">
        <h3 className="text-xl font-bold text-red-800 mb-4">📜 Hướng Dẫn Nhanh</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h4 className="font-semibold mb-2">🖱️ Click Farming:</h4>
            <ul className="space-y-1">
              <li>• Click vào tài nguyên để thu thập</li>
              <li>• Mỗi click tăng 1-3 tài nguyên</li>
              <li>• Tỉnh cấp cao = thu thập nhiều hơn</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">👥 Nông Dân:</h4>
            <ul className="space-y-1">
              <li>• Thuê nông dân để tự động thu thập</li>
              <li>• Nông dân tự động hiệu quả hơn</li>
              <li>• Nâng cấp để tăng hiệu suất</li>
            </ul>
          </div>
        </div>
      </div>

      {showTutorial && (
        <Tutorial onComplete={completeTutorial} />
      )}
    </div>
  );
}
