/**
 * Mobile-First Design System
 * Dành cho Đất Việt Truyền Thuyết MVP 2
 */

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const touchTargets = {
  minimum: 48, // px - Minimum tap target size
  comfortable: 56, // px - Comfortable tap target
  large: 64, // px - Large tap target for primary actions
  spacing: 8, // px - Minimum spacing between targets
} as const;

export const mobileSpacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem',  // 8px
  md: '1rem',    // 16px
  lg: '1.5rem',  // 24px
  xl: '2rem',    // 32px
  '2xl': '3rem', // 48px
} as const;

export const mobileTypography = {
  // Mobile-optimized font sizes
  xs: '0.75rem',   // 12px
  sm: '0.875rem',  // 14px
  base: '1rem',    // 16px (body text)
  lg: '1.125rem',  // 18px
  xl: '1.25rem',   // 20px
  '2xl': '1.5rem', // 24px (h3)
  '3xl': '1.875rem', // 30px (h2)
  '4xl': '2.25rem',  // 36px (h1)
} as const;

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
} as const;

export const animations = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  pageTransition: '350ms',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
} as const;

// Mobile gesture thresholds
export const gestures = {
  swipeThreshold: 50, // px - Minimum distance for swipe
  swipeVelocity: 0.3, // Minimum velocity for swipe
  longPressDelay: 500, // ms - Delay for long press
  doubleTapDelay: 300, // ms - Max time between taps
} as const;

// Layout configurations
export const layouts = {
  mobile: {
    maxWidth: '100%',
    padding: mobileSpacing.md,
    cardGap: mobileSpacing.sm,
  },
  tablet: {
    maxWidth: '768px',
    padding: mobileSpacing.lg,
    cardGap: mobileSpacing.md,
  },
  desktop: {
    maxWidth: '1280px',
    padding: mobileSpacing.xl,
    cardGap: mobileSpacing.lg,
  },
} as const;

// Color palette (Vietnamese theme)
export const colors = {
  primary: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Primary red
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  secondary: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24', // Gold/Yellow
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  success: {
    500: '#10b981',
    600: '#059669',
  },
  error: {
    500: '#ef4444',
    600: '#dc2626',
  },
  warning: {
    500: '#f59e0b',
    600: '#d97706',
  },
  info: {
    500: '#3b82f6',
    600: '#2563eb',
  },
} as const;

// Component variants for mobile
export const componentSizes = {
  button: {
    sm: {
      height: touchTargets.minimum,
      padding: `${mobileSpacing.sm} ${mobileSpacing.md}`,
      fontSize: mobileTypography.sm,
    },
    md: {
      height: touchTargets.comfortable,
      padding: `${mobileSpacing.md} ${mobileSpacing.lg}`,
      fontSize: mobileTypography.base,
    },
    lg: {
      height: touchTargets.large,
      padding: `${mobileSpacing.lg} ${mobileSpacing.xl}`,
      fontSize: mobileTypography.lg,
    },
  },
  card: {
    padding: mobileSpacing.md,
    borderRadius: '0.75rem', // 12px
    minHeight: touchTargets.large,
  },
  input: {
    height: touchTargets.comfortable,
    padding: mobileSpacing.md,
    fontSize: mobileTypography.base,
    borderRadius: '0.5rem', // 8px
  },
} as const;

// Utility functions
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < parseInt(breakpoints.md);
};

export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  const width = window.innerWidth;
  return width >= parseInt(breakpoints.md) && width < parseInt(breakpoints.lg);
};

export const isDesktop = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= parseInt(breakpoints.lg);
};

export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  if (isDesktop()) return 'desktop';
  if (isTablet()) return 'tablet';
  return 'mobile';
};

// Haptic feedback (for mobile devices)
export const hapticFeedback = {
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 10, 30]);
    }
  },
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 10, 10]);
    }
  },
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }
  },
} as const;

export default {
  breakpoints,
  touchTargets,
  mobileSpacing,
  mobileTypography,
  zIndex,
  animations,
  shadows,
  gestures,
  layouts,
  colors,
  componentSizes,
  isMobile,
  isTablet,
  isDesktop,
  getDeviceType,
  hapticFeedback,
};
