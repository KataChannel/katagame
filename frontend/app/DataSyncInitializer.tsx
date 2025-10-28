'use client';

import { useApiDataSync } from '@/lib/hooks/useApiDataSync';
import React from 'react';

/**
 * Client component để initialize API data sync
 * Được wrap bên trong AuthProvider
 */
export const DataSyncInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize data sync hook
  useApiDataSync();

  return <>{children}</>;
};
