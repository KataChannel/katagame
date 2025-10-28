'use client';

import { motion } from 'framer-motion';
import { Home, Crown, ShoppingCart, Book, Trophy, Settings, Swords, Users as UsersIcon, Sparkles, Gem, Shield, Map, Target, UserPlus, Palette, BarChart3, Radio, Store } from 'lucide-react';
import { touchTargets, colors, zIndex, animations } from '@/lib/mobileDesignSystem';
import { useState, useEffect } from 'react';
import { getPlayerNavigation, DEFAULT_NAVIGATION, type NavigationItem } from '@/lib/navigationService';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
  token?: string; // JWT token for authentication
}

// Icon mapping
const iconMap: Record<string, any> = {
  Home,
  Crown,
  ShoppingCart,
  Book,
  Trophy,
  Settings,
  Swords,
  UsersIcon,
  Sparkles,
  Gem,
  Shield,
  Map,
  Target,
  UserPlus,
  Palette,
  BarChart3,
  Radio,
  Store,
};

export default function MobileBottomNav({ activeTab, onTabChange, className = '', token }: MobileBottomNavProps) {
  const [navItems, setNavItems] = useState<NavigationItem[]>(DEFAULT_NAVIGATION);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch navigation items from API
  useEffect(() => {
    if (token) {
      getPlayerNavigation(token)
        .then((response) => {
          if (response.success && response.data.navigation) {
            setNavItems(response.data.navigation);
          }
        })
        .catch((error) => {
          console.error('Failed to load navigation:', error);
          // Keep using DEFAULT_NAVIGATION on error
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // No token, use default navigation
      setIsLoading(false);
    }
  }, [token]);

  const handleTabClick = (tab: string) => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    onTabChange(tab);
  };

  // Separate settings from regular nav items
  const regularNavItems = navItems.filter(item => item.key !== 'settings');
  const settingsItem = navItems.find(item => item.key === 'settings');

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
          {regularNavItems.map((item) => {
            const IconComponent = iconMap[item.icon] || Home;
            const isActive = activeTab === item.key;

            return (
              <button
                key={item.key}
                onClick={() => handleTabClick(item.key)}
                className="flex flex-col items-center justify-center flex-1 relative"
                style={{
                  minWidth: touchTargets.minimum,
                  minHeight: touchTargets.minimum,
                }}
                aria-label={item.labelVietnamese || item.label}
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
                  <IconComponent 
                    className="w-6 h-6"
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
                  {item.labelVietnamese || item.label}
                </motion.span>
              </button>
            );
          })}

          {/* Settings button (always shown if available) */}
          {settingsItem && (
            <button
              onClick={() => handleTabClick('settings')}
              className="flex flex-col items-center justify-center flex-1 relative"
              style={{
                minWidth: touchTargets.minimum,
                minHeight: touchTargets.minimum,
              }}
              aria-label={settingsItem.labelVietnamese}
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
                {settingsItem.labelVietnamese}
              </motion.span>
            </button>
          )}
        </div>
      </nav>

      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="h-16" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
    </>
  );
}

// Desktop Navigation (Horizontal tabs) - Hidden on mobile
export function DesktopNav({ activeTab, onTabChange, className = '', token }: MobileBottomNavProps) {
  const [navItems, setNavItems] = useState<NavigationItem[]>(DEFAULT_NAVIGATION);

  // Fetch navigation items from API
  useEffect(() => {
    if (token) {
      getPlayerNavigation(token)
        .then((response) => {
          if (response.success && response.data.navigation) {
            setNavItems(response.data.navigation);
          }
        })
        .catch((error) => {
          console.error('Failed to load navigation:', error);
        });
    }
  }, [token]);

  const regularNavItems = navItems.filter(item => item.key !== 'settings');
  const settingsItem = navItems.find(item => item.key === 'settings');

  return (
    <nav className={`hidden md:block bg-white shadow-sm border-b ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex space-x-4 lg:space-x-6 overflow-x-auto">
          {regularNavItems.map((item) => {
            const IconComponent = iconMap[item.icon] || Home;
            const isActive = activeTab === item.key;

            return (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
                className={`
                  flex items-center gap-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap
                  ${isActive 
                    ? `border-[${item.color}] text-[${item.color}]`
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                  }
                `}
                style={isActive ? { borderColor: item.color, color: item.color } : {}}
              >
                <IconComponent className="h-5 w-5" />
                <span className="font-medium">{item.labelVietnamese || item.label}</span>
              </button>
            );
          })}
          {settingsItem && (
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
              <span className="font-medium">{settingsItem.labelVietnamese}</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
