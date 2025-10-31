'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/lib/gameStore';
import MVP1ApiClient from '@/lib/graphqlApiClient';

/**
 * Sync provinces data từ API vào Zustand store
 * Export để có thể gọi từ components sau khi mutations
 */
export const syncProvincesFromApi = async () => {
  try {
    const provincesResponse = await MVP1ApiClient.getPlayerProvinces();
    console.log('🔄 Syncing provinces from API:', provincesResponse);
    
    if (provincesResponse?.success && provincesResponse?.data) {
      const apiProvinces = Array.isArray(provincesResponse.data) ? provincesResponse.data : [];
      console.log('📦 Received', apiProvinces.length, 'provinces from API');
      
      const transformedProvinces = apiProvinces.map((p: any) => {
        const provinceId = p.provinceId || p.province?.id;
        if (!provinceId) {
          console.warn('Province missing provinceId, skipping:', p);
          return null;
        }

        return {
          id: String(provinceId),
          provinceId: provinceId,
          name: p.province?.name || 'Unknown',
          displayName: p.province?.name || 'Unknown',
          description: 'Tỉnh ' + (p.province?.region || 'Unknown'),
          unlocked: true,
          level: p.farmerLevel || 1,
          maxLevel: 10,
          resources: { gold: 0, rice: 0, lumber: 0, stone: 0, culture: 0, bazan: 0 },
          resourcesPerSecond: {
            gold: (p.resourceLevel || 1) * 10,
            rice: (p.resourceLevel || 1) * 10,
            lumber: (p.resourceLevel || 1) * 5,
            stone: (p.resourceLevel || 1) * 5,
            culture: (p.developmentLevel || 1) * 2,
            bazan: 0,
          },
          specialties: [],
          culturalBonus: '',
          farmers: [],
          buildings: [],
          region: (p.province?.region?.toLowerCase() || 'north'),
          farmerLevel: p.farmerLevel || 1,
          resourceLevel: p.resourceLevel || 1,
          developmentLevel: p.developmentLevel || 1,
        };
      }).filter(Boolean);
      
      console.log('✅ Transformed', transformedProvinces.length, 'provinces, updating Zustand store');
      useGameStore.setState({ provinces: transformedProvinces as any });
      return transformedProvinces;
    } else {
      console.warn('No provinces data in API response');
      return [];
    }
  } catch (error) {
    console.error('❌ Failed to sync provinces:', error);
    return [];
  }
};

/**
 * Sync player data (including resources) từ API
 * Export để components có thể gọi sau mutations
 */
export const syncPlayerFromApi = async () => {
  try {
    const meResponse = await MVP1ApiClient.getMe();
    if (meResponse?.success && meResponse?.data) {
      const playerData = meResponse.data;
      console.log('✅ Player data synced:', playerData);
      
      useGameStore.setState((state) => ({
        player: {
          ...state.player,
          ...playerData,
          resources: playerData.resources || state.player.resources,
          totalResources: playerData.resources || state.player.totalResources,
        },
      }));
      
      return playerData;
    }
    return null;
  } catch (error) {
    console.error('❌ Failed to sync player:', error);
    return null;
  }
};

export const useApiDataSync = () => {
  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    if (storedToken) {
      console.log('Auth token found, syncing data...');
      MVP1ApiClient.setAuthToken(storedToken);
      syncPlayerDataFromApi(storedToken);
      syncGameDataFromApi(storedToken);
    } else {
      console.log('No auth token, skipping sync');
    }

    const handleStorageChange = () => {
      const newToken = localStorage.getItem('authToken');
      if (newToken) {
        console.log('Token changed, re-syncing...');
        MVP1ApiClient.setAuthToken(newToken);
        syncGameDataFromApi(newToken);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const interval = setInterval(() => {
      const currentToken = localStorage.getItem('authToken');
      if (currentToken) {
        syncPlayerDataFromApi(currentToken);
      }
    }, 30000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const syncPlayerDataFromApi = async (token: string) => {
    try {
      if (!token) {
        console.log('⏸️ Skipping player data sync - no token');
        return;
      }
      
      // Sync player data including resources
      const meResponse = await MVP1ApiClient.getMe();
      
      if (!meResponse) {
        console.warn('⚠️ getMe returned undefined response');
        return;
      }

      if (!meResponse.success) {
        console.warn('⚠️ getMe failed:', meResponse.message);
        return;
      }

      if (!meResponse.data) {
        console.warn('⚠️ getMe returned no data');
        return;
      }

      const playerData = meResponse.data;
      console.log('✅ Player data synced from API:', playerData);
      
      useGameStore.setState((state) => ({
        player: {
          ...state.player,
          ...playerData,
          resources: playerData.resources || state.player.resources,
          totalResources: playerData.resources || state.player.totalResources,
        },
      }));
    } catch (error) {
      console.warn('⚠️ Failed to sync player data:', error);
    }
  };

  const syncGameDataFromApi = async (token: string) => {
    try {
      if (!token) {
        console.log('Skipping data sync - no token');
        return;
      }

      console.log('Starting game data sync from API...');

      // Use the shared sync function
      await syncProvincesFromApi();

      try {
        const heroesResponse = await MVP1ApiClient.getPlayerHeroes();
        if (heroesResponse?.success && heroesResponse?.data) {
          const heroes = (heroesResponse.data as any)?.heroes || [];
          console.log('Synced', heroes.length, 'heroes from API');
          useGameStore.setState({ heroes });
        }
      } catch (e) {
        console.warn('Failed to load heroes:', e);
      }

      try {
        const resourcesResponse = await MVP1ApiClient.getPlayerResources();
        if (resourcesResponse?.success && resourcesResponse?.data) {
          const resources = (resourcesResponse.data as any)?.resources || {};
          console.log('Synced resources from API');
          useGameStore.setState((state) => ({
            player: { ...state.player, totalResources: resources },
          }));
        }
      } catch (e) {
        console.warn('Failed to load resources:', e);
      }

      console.log('Game data sync completed');
    } catch (error: any) {
      console.error('Failed to sync game data:', error.message);
    }
  };

  return { syncPlayerDataFromApi, syncGameDataFromApi };
};
