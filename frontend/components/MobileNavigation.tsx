'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Crown, ShoppingCart, Book, Trophy, Settings, Swords, Users as UsersIcon, 
  Sparkles, Gem, Shield, Map, Target, UserPlus, Palette, BarChart3, Radio, Store, 
  Heart, Clock, Menu, X, MoreHorizontal, ChevronRight, Hammer, Droplets
} from 'lucide-react';
import { touchTargets, animations, zIndex } from '@/lib/mobileDesignSystem';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getPlayerNavigation, DEFAULT_NAVIGATION, type NavigationItem } from '@/lib/navigationService';
import { cn } from '@/lib/utils';

// ... (existing imports and interfaces)

interface MobileBottomNavProps {
  activeTab?: string; // Optional, can use pathname derivation
  onTabChange?: (tab: string) => void;
  className?: string;
  token?: string; 
}

// Icon mapping
const iconMap: Record<string, any> = {
  Home, Crown, ShoppingCart, Book, Trophy, Settings, Swords, UsersIcon, 
  Sparkles, Gem, Shield, Map, Target, UserPlus, Palette, BarChart3, Radio, 
  Store, Heart, Clock, Hammer, Droplets
};

export default function MobileBottomNav({ className = '', token }: MobileBottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [navItems, setNavItems] = useState<NavigationItem[]>(DEFAULT_NAVIGATION);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Derive active tab from pathname
  const activeTab = pathname === '/' ? 'home' : pathname.replace('/', '');

  useEffect(() => {
    if (token) {
      getPlayerNavigation(token)
        .then((response) => {
          if (response.success && response.data.navigation) {
            setNavItems(response.data.navigation);
          }
        })
        .catch(console.error);
    }
  }, [token]);

  const handleTabClick = (tab: string) => {
    if (tab === 'more') {
      setIsMoreOpen(true);
      return;
    }
    
    setIsMoreOpen(false); // Close drawer if open
    router.push(`/${tab}`);
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  // Filter items
  const regularNavItems = navItems.filter(item => item.key !== 'settings');
  const settingsItem = navItems.find(item => item.key === 'settings');

  // Logic: Show max 4 items, then "More"
  const MAX_VISIBLE = 4;
  const mainItems = regularNavItems.slice(0, MAX_VISIBLE);
  const moreItems = regularNavItems.slice(MAX_VISIBLE);

  // If we have settings, add it to 'more' items or keep it separate? 
  // For 'New York' style, settings often lives in the 'More' menu or top profile.
  // We'll add settings to the More menu for consistency.
  if (settingsItem) {
    moreItems.push(settingsItem);
  }

  return (
    <>
      <nav 
        className={cn(
          "md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-gray-200 dark:border-zinc-800 safe-area-pb z-[50]", 
          className
        )}
      >
        <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto px-2">
          {mainItems.map((item) => {
            const IconComponent = iconMap[item.icon] || Home;
            const isActive = activeTab === item.key;

            return (
              <NavButton
                key={item.key}
                item={item}
                isActive={isActive}
                onClick={() => handleTabClick(item.key)}
                icon={IconComponent}
              />
            );
          })}

          {/* More Button */}
          <button
            onClick={() => handleTabClick('more')}
            className="flex flex-col items-center justify-center flex-1 relative active:scale-95 transition-transform"
            style={{ minHeight: touchTargets.minimum }}
          >
            <div className={cn(
              "p-1 rounded-xl transition-colors",
              isMoreOpen ? "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white" : "text-gray-500 dark:text-zinc-400"
            )}>
              <MoreHorizontal className="w-6 h-6" />
            </div>
            <span className={cn(
               "text-[10px] mt-1 font-medium",
               isMoreOpen ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-zinc-400"
            )}>
              Thêm
            </span>
          </button>
        </div>
      </nav>

      {/* More Drawer Overlay */}
      <AnimatePresence>
        {isMoreOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] md:hidden"
            />
            
            {/* Drawer Content */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 rounded-t-[2rem] z-[60] md:hidden max-h-[85vh] overflow-y-auto"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 5rem)' }} // Add padding for bottom nav
            >
              <div className="p-4">
                <div className="w-12 h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full mx-auto mb-6" />
                
                <h3 className="text-lg font-bold mb-4 px-2 dark:text-white">Menu Mở Rộng</h3>
                
                <div className="grid grid-cols-4 gap-4">
                  {moreItems.map((item) => {
                    const IconComponent = iconMap[item.icon] || Home;
                    const isActive = activeTab === item.key;
                    
                    return (
                      <button
                        key={item.key}
                        onClick={() => handleTabClick(item.key)}
                        className="flex flex-col items-center gap-2"
                      >
                         <div className={cn(
                           "w-14 h-14 rounded-2xl flex items-center justify-center transition-all border",
                           isActive 
                             ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 shadow-sm" 
                             : "bg-gray-50 dark:bg-zinc-800 border-gray-100 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-700"
                         )}>
                           <IconComponent className="w-6 h-6" />
                         </div>
                         <span className="text-xs text-center font-medium text-gray-700 dark:text-zinc-300 line-clamp-2 max-w-[4rem]">
                           {item.labelVietnamese || item.label}
                         </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16 md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
    </>
  );
}

const NavButton = ({ item, isActive, onClick, icon: Icon }: any) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center flex-1 relative active:scale-95 transition-transform"
    style={{ minHeight: touchTargets.minimum }}
  >
    <div className="relative">
      <motion.div
        animate={{
          color: isActive ? '#dc2626' : '#6b7280', // Red-600 vs Gray-500
        }}
        className={cn(
          "transition-colors duration-200",
          isActive ? "dark:text-red-500" : "dark:text-zinc-500"
        )}
      >
        <Icon className={cn("w-6 h-6", isActive && "fill-current opacity-20")} strokeWidth={isActive ? 2.5 : 2} />
        {isActive && <Icon className="w-6 h-6 absolute inset-0 text-red-600 dark:text-red-500" strokeWidth={2.5} />}
      </motion.div>
      
      {isActive && (
        <motion.div
          layoutId="nav-dot"
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-600 rounded-full"
        />
      )}
    </div>
    
    <span className={cn(
      "text-[10px] mt-1 font-medium transition-colors duration-200",
      isActive ? "text-red-600 dark:text-red-500 font-bold" : "text-gray-500 dark:text-zinc-500"
    )}>
      {item.labelVietnamese || item.label}
    </span>
  </button>
);

// Desktop Navigation
export function DesktopNav({ className = '', token }: MobileBottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [navItems, setNavItems] = useState<NavigationItem[]>(DEFAULT_NAVIGATION);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const activeTab = pathname === '/' ? 'home' : pathname.replace('/', '');

  useEffect(() => {
    if (token) {
      getPlayerNavigation(token).then((res) => {
        if (res.success && res.data.navigation) setNavItems(res.data.navigation);
      });
    }
  }, [token]);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [navItems]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const regularNavItems = navItems.filter(item => item.key !== 'settings');
  const settingsItem = navItems.find(item => item.key === 'settings');

  return (
    <nav className={cn("hidden md:block bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 relative group", className)}>
      <div className="container mx-auto px-4 relative">
        
        {/* Left Arrow */}
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white dark:from-zinc-950 to-transparent z-10 flex items-center pl-2 transition-opacity duration-300 pointer-events-none",
          showLeftArrow ? "opacity-100" : "opacity-0"
        )}>
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 shadow-md border border-gray-100 dark:border-zinc-700 flex items-center justify-center text-gray-600 dark:text-zinc-300 pointer-events-auto hover:scale-110 transition-transform"
            aria-label="Scroll Left"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
        </div>

        {/* Right Arrow */}
        <div className={cn(
          "absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white dark:from-zinc-950 to-transparent z-10 flex items-center justify-end pr-2 transition-opacity duration-300 pointer-events-none",
          showRightArrow ? "opacity-100" : "opacity-0"
        )}>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-white dark:bg-zinc-800 shadow-md border border-gray-100 dark:border-zinc-700 flex items-center justify-center text-gray-600 dark:text-zinc-300 pointer-events-auto hover:scale-110 transition-transform"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex items-center gap-1 overflow-x-auto no-scrollbar py-3 scroll-smooth"
        >
          {regularNavItems.map((item) => {
            const IconComponent = iconMap[item.icon] || Home;
            const isActive = activeTab === item.key;

            return (
              <button
                key={item.key}
                onClick={() => router.push(`/${item.key}`)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap select-none flex-shrink-0",
                  isActive
                    ? "bg-gray-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                    : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-zinc-200"
                )}
              >
                <IconComponent className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
                {item.labelVietnamese || item.label}
              </button>
            );
          })}

          <div className="w-px h-6 bg-gray-200 dark:bg-zinc-800 mx-2 flex-shrink-0" />

          {/* Settings at the end */}
          {settingsItem && (
             <button
                onClick={() => router.push('/settings')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap select-none flex-shrink-0",
                  activeTab === 'settings'
                    ? "bg-gray-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                    : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                )}
              >
                <Settings className="w-4 h-4" />
                {settingsItem.labelVietnamese}
              </button>
          )}
        </div>
      </div>
    </nav>
  );
}
