'use client';

import { motion } from 'framer-motion';
import { Home, Crown, ShoppingCart, Book, Trophy, Settings } from 'lucide-react';
import { touchTargets, colors, zIndex, animations } from '@/lib/mobileDesignSystem';

interface MobileBottomNavProps {
  activeTab: 'game' | 'premium' | 'shop' | 'culture' | 'achievements' | 'settings';
  onTabChange: (tab: 'game' | 'premium' | 'shop' | 'culture' | 'achievements' | 'settings') => void;
  className?: string;
}

const navItems = [
  { key: 'game', label: 'Game', icon: Home, color: colors.primary[500] },
  { key: 'premium', label: 'VIP', icon: Crown, color: colors.secondary[500] },
  { key: 'shop', label: 'Shop', icon: ShoppingCart, color: colors.primary[600] },
  { key: 'culture', label: 'Văn Hóa', icon: Book, color: colors.info[500] },
  { key: 'achievements', label: 'Thành Tích', icon: Trophy, color: colors.warning[500] },
] as const;

export default function MobileBottomNav({ activeTab, onTabChange, className = '' }: MobileBottomNavProps) {
  const handleTabClick = (tab: typeof activeTab) => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    onTabChange(tab);
  };

  return (
    <>
      {/* Bottom Navigation Bar - Mobile only */}
      <nav 
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg safe-area-pb ${className}`}
        style={{ 
          zIndex: zIndex.fixed,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
      >
        <div className="flex items-center justify-around h-16 max-w-screen-xl mx-auto px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;

            return (
              <button
                key={item.key}
                onClick={() => handleTabClick(item.key as typeof activeTab)}
                className="flex flex-col items-center justify-center flex-1 relative"
                style={{
                  minWidth: touchTargets.minimum,
                  minHeight: touchTargets.minimum,
                }}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg"
                    style={{
                      backgroundColor: `${item.color}10`,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}

                {/* Icon */}
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    color: isActive ? item.color : '#6b7280',
                  }}
                  transition={{ duration: parseFloat(animations.fast) / 1000 }}
                  className="relative z-10"
                >
                  <Icon 
                    className={`w-6 h-6 ${isActive ? 'stroke-2' : 'stroke-1.5'}`}
                    strokeWidth={isActive ? 2.5 : 1.5}
                  />
                </motion.div>

                {/* Label */}
                <motion.span
                  animate={{
                    color: isActive ? item.color : '#6b7280',
                    fontWeight: isActive ? 600 : 400,
                  }}
                  className="text-xs mt-0.5 relative z-10"
                  transition={{ duration: parseFloat(animations.fast) / 1000 }}
                >
                  {item.label}
                </motion.span>

                {/* Notification badge (example) */}
                {item.key === 'shop' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1/4 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center z-20"
                  >
                    •
                  </motion.div>
                )}
              </button>
            );
          })}

          {/* Settings button (separate) */}
          <button
            onClick={() => handleTabClick('settings')}
            className="flex flex-col items-center justify-center flex-1 relative"
            style={{
              minWidth: touchTargets.minimum,
              minHeight: touchTargets.minimum,
            }}
            aria-label="Cài đặt"
          >
            {activeTab === 'settings' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-lg bg-gray-100"
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 30,
                }}
              />
            )}
            <motion.div
              animate={{
                scale: activeTab === 'settings' ? 1.1 : 1,
                color: activeTab === 'settings' ? '#374151' : '#6b7280',
                rotate: activeTab === 'settings' ? 90 : 0,
              }}
              transition={{ duration: parseFloat(animations.normal) / 1000 }}
              className="relative z-10"
            >
              <Settings className="w-6 h-6" />
            </motion.div>
            <motion.span
              animate={{
                color: activeTab === 'settings' ? '#374151' : '#6b7280',
                fontWeight: activeTab === 'settings' ? 600 : 400,
              }}
              className="text-xs mt-0.5 relative z-10"
            >
              Cài Đặt
            </motion.span>
          </button>
        </div>
      </nav>

      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="h-16" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
    </>
  );
}

// Desktop Navigation (Horizontal tabs) - Hidden on mobile
export function DesktopNav({ activeTab, onTabChange, className = '' }: MobileBottomNavProps) {
  return (
    <nav className={`hidden md:block bg-white shadow-sm border-b ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex space-x-4 lg:space-x-6 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;

            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key as typeof activeTab)}
                className={`
                  flex items-center gap-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap
                  ${isActive 
                    ? 'border-red-600 text-red-600' 
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => onTabChange('settings')}
            className={`
              flex items-center gap-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap
              ${activeTab === 'settings'
                ? 'border-gray-600 text-gray-900' 
                : 'border-transparent text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <Settings className="h-5 w-5" />
            <span className="font-medium">Cài Đặt</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
