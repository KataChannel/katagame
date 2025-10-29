'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/gameStore';
import MVP1ApiClient from '@/lib/graphqlApiClient';

/**
 * Hook để đồng bộ dữ liệu từ API vào Zustand game store
 * Chạy khi app mount và khi user login
 * 
 * Strategy: Load dữ liệu từ API server, merge vào Zustand store
 * Components tiếp tục dùng useGameStore, nhưng data sẽ từ API
 */
export const useApiDataSync = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check localStorage for auth token
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      MVP1ApiClient.setAuthToken(storedToken);
      
      console.log('🔐 Auth token found, syncing data...');
      syncPlayerDataFromApi();
      syncGameDataFromApi();
    } else {
      console.log('⏸️ No auth token, skipping sync');
    }

    // Listen for localStorage changes (login/logout)
    const handleStorageChange = () => {
      const newToken = localStorage.getItem('authToken');
      if (newToken) {
        setToken(newToken);
        setIsAuthenticated(true);
        MVP1ApiClient.setAuthToken(newToken);
        syncGameDataFromApi();
      } else {
        setToken(null);
        setIsAuthenticated(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Refresh data mỗi 30 giây
    const interval = setInterval(() => {
      if (isAuthenticated) {
        syncPlayerDataFromApi();
      }
    }, 30000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const syncPlayerDataFromApi = async () => {
    try {
      if (!isAuthenticated) return;

      // Load game data từ API (bao gồm player info + resources)
      const gameDataResponse = await MVP1ApiClient.getGameData();
      if (gameDataResponse?.data) {
        const apiData = gameDataResponse.data;
        console.log('✅ Game data synced from API:', apiData);
        
        // Data này có thể được sử dụng bởi components
        // Hiện tại in ra để verify API working
      }
    } catch (error) {
      console.warn('Failed to sync player data:', error);
      // Tiếp tục với existing data, không crash
    }
  };

  const syncGameDataFromApi = async () => {
    try {
      if (!isAuthenticated) {
        console.log('⏸️ Skipping data sync - not authenticated');
        return;
      }

      console.log('🔄 Starting game data sync from API...');

      // Load provinces từ API (CRITICAL - This is what users see!)
      try {
        const provincesResponse = await MVP1ApiClient.getPlayerProvinces();
        console.log('📦 Provinces API Response:', provincesResponse);
        
        if (provincesResponse?.success && provincesResponse?.data) {
          // Data is directly in provincesResponse.data (array of provinces)
          const apiProvinces = Array.isArray(provincesResponse.data) 
            ? provincesResponse.data 
            : [];
          
          console.log('✅ Received', apiProvinces.length, 'provinces from API');
          
          // Transform API provinces to match frontend Province type
          const transformedProvinces = apiProvinces.map((p: any) => ({
            id: String(p.provinceId || p.province?.id || p.id),
            name: p.province?.name || 'Unknown Province',
            displayName: p.province?.name || 'Unknown Province',
            description: `Tỉnh ${p.province?.region || 'Unknown'}`,
            unlocked: true, // These provinces are already unlocked from API
            level: p.farmerLevel || 1,
            maxLevel: 10,
            resources: {
              gold: 0,
              rice: 0,
              lumber: 0,
              stone: 0,
              culture: 0,
              bazan: 0,
            },
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
            region: (p.province?.region?.toLowerCase() || 'north') as 'north' | 'central' | 'south',
            // Additional data from API
            farmerLevel: p.farmerLevel || 1,
            resourceLevel: p.resourceLevel || 1,
            developmentLevel: p.developmentLevel || 1,
          }));
          
          console.log('🗺️ Transformed provinces for frontend:', transformedProvinces);
          useGameStore.setState({ provinces: transformedProvinces });
        } else {
          console.warn('⚠️ No provinces data in API response:', provincesResponse);
          // Set empty array nếu không có data
          useGameStore.setState({ provinces: [] });
        }
      } catch (e) {
        console.error('❌ Failed to load provinces:', e);
        // Set empty array on error
        useGameStore.setState({ provinces: [] });
      }

      // Load heroes từ API
      try {
        const heroesResponse = await MVP1ApiClient.getPlayerHeroes();
        if (heroesResponse?.success && heroesResponse?.data) {
          const heroes = (heroesResponse.data as any)?.heroes || [];
          console.log('✅ Synced', heroes.length, 'heroes from API');
          useGameStore.setState({ heroes });
        }
      } catch (e) {
        console.warn('⚠️ Failed to load heroes:', e);
      }

      // Load resources từ API
      try {
        const resourcesResponse = await MVP1ApiClient.getPlayerResources();
        if (resourcesResponse?.success && resourcesResponse?.data) {
          const resources = (resourcesResponse.data as any)?.resources || {};
          console.log('✅ Synced resources from API:', resources);
          // Update player resources trong store
          useGameStore.setState((state) => ({
            player: {
              ...state.player,
              totalResources: resources,
            },
          }));
        }
      } catch (e) {
        console.warn('⚠️ Failed to load resources:', e);
      }

      console.log('✅ Game data sync completed');
    } catch (error) {
      console.error('❌ Failed to sync game data:', error);
      // Tiếp tục với existing data
    }
  };

  return {
    syncPlayerDataFromApi,
    syncGameDataFromApi,
  };
};
