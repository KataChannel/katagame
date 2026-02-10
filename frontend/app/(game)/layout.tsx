'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { initializeStorageOptimization } from '@/lib/storageOptimization';
import { useNotifications } from '@/components/NotificationSystem';
import GameLoop from '@/components/GameLoop';
import { Home } from 'lucide-react';
import MobileBottomNav, { DesktopNav } from '@/components/MobileNavigation';
import MobileResourceBar from '@/components/MobileResourceBar';
import ResourceBar from '@/components/ResourceBar';
import GlobalAnnouncements from '@/components/GlobalAnnouncements';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingScreen } from '@/components/UIComponents';
import { useAuth } from '@/lib/authContext';
import { useRouter, usePathname } from 'next/navigation';
import MVP1ApiClient from '@/lib/graphqlApiClient';

import { Toaster } from 'sonner';

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  
  const { 
    player,
    gameSpeed, 
    setGameSpeed, 
    checkAndResetMissions,
    checkAndResetFriendGifts,
    checkAndRefreshShops,
  } = useGameStore();
  const { NotificationComponent } = useNotifications();

  // Handle authentication redirect
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const initGame = async () => {
      if (token) {
        MVP1ApiClient.setAuthToken(token);
      }
      
      // Initial loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
      
      // Maintenance tasks
      checkAndResetMissions();
      checkAndResetFriendGifts();
      checkAndRefreshShops();
      initializeStorageOptimization();
    };
    
    if (isAuthenticated) {
      initGame();
    } else {
      setIsLoading(false);
    }
  }, [token, isAuthenticated, checkAndResetMissions, checkAndResetFriendGifts, checkAndRefreshShops]);

  if (isLoading) {
    return <LoadingScreen message="Đang khởi tạo linh hồn Đất Việt..." />;
  }

  if (!isAuthenticated) return null;

  // Map pathname to active tab for navigation highlight
  const activeTab = pathname.split('/').pop() || 'game';

  const handleTabChange = (tab: string) => {
    router.push(`/${tab}`);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-foreground font-sans antialiased pb-20 md:pb-0 selection:bg-red-100 selection:text-red-900">
        <GameLoop />
        <Toaster position="top-center" richColors closeButton />
        
        {/* Header - Minimalist New York Style */}
        <header className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-zinc-800 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center gap-3 cursor-pointer group" 
                onClick={() => router.push('/game')}
              >
                <div className="bg-red-600 rounded-lg p-2 text-white shadow-sm group-hover:bg-red-700 transition-colors">
                  <Home className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Đất Việt <span className="text-red-600">Truyền Thuyết</span>
                  </h1>
                  <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-widest hidden sm:block">
                    MVP 4.0 • Di Sản Ngàn Năm
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 sm:gap-6">
                {/* Game Speed - Refined UI */}
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-full px-3 py-1.5 sm:px-4">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Speed</span>
                  <select
                    value={gameSpeed}
                    onChange={(e) => setGameSpeed(Number(e.target.value))}
                    className="bg-transparent border-none text-gray-900 dark:text-white font-bold text-xs focus:ring-0 cursor-pointer"
                  >
                    <option value={0.5} className="dark:bg-zinc-900">0.5x</option>
                    <option value={1} className="dark:bg-zinc-900">1x</option>
                    <option value={2} className="dark:bg-zinc-900">2x</option>
                    <option value={5} className="dark:bg-zinc-900">5x</option>
                  </select>
                </div>

                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center justify-center text-gray-500 hover:text-red-600 font-medium text-sm transition-colors"
                >
                  Đăng Xuất
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Global Resource Bar (Shared) - Refined spacing */}
        <div className="sticky top-[64px] sm:top-[80px] z-40 bg-[#fafafa]/80 dark:bg-[#09090b]/80 backdrop-blur-sm border-b border-gray-100/50 dark:border-zinc-800/50">
          <div className="container mx-auto px-4 py-2">
             <div className="md:hidden">
                <MobileResourceBar />
              </div>
              <div className="hidden md:block">
                <ResourceBar />
              </div>
          </div>
        </div>

        {/* Navigation - Integrating New York Style Nav */}
        <DesktopNav 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          token={token || undefined}
        />

        {/* Main Content Area with Fade-in Animation */}
        <main className="container mx-auto px-4 py-4 sm:py-8 animate-in fade-in duration-500">
          {children}
        </main>

        {/* Mobile Navigation */}
        <MobileBottomNav 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          token={token || undefined}
        />

        <GlobalAnnouncements />
        <NotificationComponent />
      </div>
    </ErrorBoundary>
  );
}
