'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { SaveGameManager } from '@/lib/saveGameManager';
import { useSound } from '@/lib/soundManager';
import ResourceBar from '@/components/ResourceBar';
import ProvinceCard from '@/components/ProvinceCard';
import PlayerInfo from '@/components/PlayerInfo';
import PremiumPass from '@/components/PremiumPass';
import Shop from '@/components/Shop';
import CultureCenter from '@/components/CultureCenter';
import Achievements from '@/components/Achievements';
import SettingsPanel from '@/components/SettingsPanel';
import Tutorial from '@/components/Tutorial';
import GameLoop from '@/components/GameLoop';
import { useNotifications } from '@/components/NotificationSystem';
import { ErrorBoundary, LoadingScreen } from '@/components/UIComponents';
import { Settings, Crown, Home, ShoppingCart, Book, Trophy } from 'lucide-react';
import MobileBottomNav, { DesktopNav } from '@/components/MobileNavigation';
import MobileResourceBar from '@/components/MobileResourceBar';
import MobileProvinceCard from '@/components/MobileProvinceCard';
import CombatTab from '@/components/CombatTab';
import HeroesTab from '@/components/HeroesTab';
import PetsTab from '@/components/PetsTab';
import BattlePassTab from '@/components/BattlePassTab';
import GachaTab from '@/components/GachaTab';
import GuildTab from '@/components/GuildTab';
import ArenaTab from '@/components/ArenaTab';
import WorldMapTab from '@/components/WorldMapTab';
import DailyMissionsTab from '@/components/DailyMissionsTab';
import FriendsTab from '@/components/FriendsTab';
import EnhancedShopTab from '@/components/EnhancedShopTab';
import CustomizationTab from '@/components/CustomizationTab';
import AnalyticsTab from '@/components/AnalyticsTab';
import { ErrorBoundary as AppErrorBoundary } from '@/components/ErrorBoundary';
import { initializeStorageOptimization } from '@/lib/storageOptimization';

export default function Game() {
  const [activeTab, setActiveTab] = useState<'game' | 'premium' | 'shop' | 'culture' | 'achievements' | 'settings' | 'combat' | 'heroes' | 'pets' | 'battlepass' | 'gacha' | 'guild' | 'arena' | 'worldmap' | 'missions' | 'friends' | 'enhancedshop' | 'customization' | 'analytics'>('game');
  const [showTutorial, setShowTutorial] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { 
    player, 
    provinces, 
    gameSpeed, 
    setGameSpeed, 
    tutorial, 
    completeTutorial, 
    notifications,
    checkAndResetMissions,
    checkAndResetFriendGifts,
    checkAndRefreshShops,
  } = useGameStore();
  const { NotificationComponent } = useNotifications();

  useEffect(() => {
    // Simulate loading time and initialize game
    const initGame = async () => {
      // Simulate loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsLoading(false);
      
      // Show tutorial for new players
      if (!tutorial.completed && player.level === 1 && player.experience === 0) {
        setTimeout(() => setShowTutorial(true), 500);
      }
      
      // Check and reset missions on app start
      checkAndResetMissions();
      
      // Check and reset friend gifts
      checkAndResetFriendGifts();
      
      // Check and refresh shops
      checkAndRefreshShops();
      initializeStorageOptimization();
    };
    
    initGame();
  }, [tutorial.completed, player.level, player.experience, checkAndResetMissions]);

  const handleCompleteTutorial = () => {
    completeTutorial();
    setShowTutorial(false);
  };

  if (isLoading) {
    return <LoadingScreen message="Khởi tạo thế giới Đất Việt..." />;
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-yellow-50 to-orange-50">
      <GameLoop />
      
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-yellow-500 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-white/20 rounded-full p-1.5 sm:p-2">
                <Home className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold">Đất Việt Truyền Thuyết</h1>
                <p className="text-red-100 text-xs sm:text-sm hidden sm:block">MVP 1: Khởi Nguồn Đất Việt</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Game Speed Control */}
              <div className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2">
                <span className="text-sm">Tốc độ:</span>
                <select
                  value={gameSpeed}
                  onChange={(e) => setGameSpeed(Number(e.target.value))}
                  className="bg-transparent border-none text-white font-semibold"
                >
                  <option value={0.5} className="text-black">0.5x</option>
                  <option value={1} className="text-black">1x</option>
                  <option value={2} className="text-black">2x</option>
                  <option value={5} className="text-black">5x</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation - Desktop only, mobile uses bottom bar */}
      <DesktopNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 sm:py-6">
        {activeTab === 'game' && (
          <div className="space-y-6 pb-24 md:pb-6">
            {/* Player Info & Resources - Mobile optimized */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <PlayerInfo />
              {/* Mobile: Use swipeable carousel, Desktop: Use grid */}
              <div className="md:hidden">
                <MobileResourceBar />
              </div>
              <div className="hidden md:block">
                <ResourceBar resources={player.totalResources} />
              </div>
            </div>

            {/* Provinces */}
            <div>
              <h2 className="text-2xl font-bold text-red-800 mb-4 text-center">
                🗺️ Các Tỉnh Thành Việt Nam
              </h2>
              {/* Mobile: Vertical stack with swipeable cards */}
              <div className="md:hidden space-y-4">
                {provinces.map((province) => (
                  <MobileProvinceCard key={province.id} province={province} />
                ))}
              </div>
              {/* Desktop: Grid layout */}
              <div className="hidden md:grid lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {provinces.map((province) => (
                  <ProvinceCard key={province.id} province={province} />
                ))}
              </div>
            </div>

            {/* Game Instructions */}
            <div className="bg-white rounded-lg p-6 border-2 border-yellow-200 shadow-lg">
              <h3 className="text-xl font-bold text-red-800 mb-4">📜 Hướng Dẫn Chơi</h3>
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
                <div>
                  <h4 className="font-semibold mb-2">🏛️ Tỉnh Thành:</h4>
                  <ul className="space-y-1">
                    <li>• Mở khóa tỉnh mới với 200 vàng</li>
                    <li>• Nâng cấp tỉnh để tăng sản lượng</li>
                    <li>• Mỗi tỉnh có đặc sản riêng</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">👑 Premium:</h4>
                  <ul className="space-y-1">
                    <li>• Premium Pass tăng tốc phát triển</li>
                    <li>• Nhiều đặc quyền và phần thưởng</li>
                    <li>• Hỗ trợ phát triển game Việt Nam</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'premium' && <PremiumPass />}
        
        {activeTab === 'shop' && <Shop />}
        
        {activeTab === 'combat' && <CombatTab />}
        
        {activeTab === 'heroes' && <HeroesTab />}
        
        {activeTab === 'pets' && <PetsTab />}
        
        {activeTab === 'battlepass' && <BattlePassTab />}
        
        {activeTab === 'gacha' && <GachaTab />}
        
        {activeTab === 'guild' && <GuildTab />}
        
        {activeTab === 'arena' && <ArenaTab />}
        
        {activeTab === 'worldmap' && <WorldMapTab />}
        {activeTab === 'missions' && <DailyMissionsTab />}
        {activeTab === 'friends' && <FriendsTab />}
        {activeTab === 'enhancedshop' && <EnhancedShopTab />}
        {activeTab === 'customization' && <CustomizationTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        
        {activeTab === 'culture' && <CultureCenter />}
        
        {activeTab === 'achievements' && <Achievements />}

        {activeTab === 'settings' && <SettingsPanel />}
      </main>

      {/* Footer - Hide on mobile to avoid conflict with bottom nav */}
      <footer className="bg-red-800 text-white text-center py-4 mt-12 hidden md:block">
        <p className="text-sm">
          🇻🇳 Tự hào phát triển game văn hóa Việt Nam • 
          <span className="font-semibold"> Đất Việt Truyền Thuyết </span>• 
          MVP 1 Beta
        </p>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tutorial Modal */}
      {showTutorial && (
        <Tutorial onComplete={handleCompleteTutorial} />
      )}
      
      {/* Notifications */}
      <NotificationComponent />
      </div>
    </ErrorBoundary>
  );
}