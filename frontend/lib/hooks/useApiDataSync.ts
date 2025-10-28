'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/lib/gameStore';
import { useAuth } from '@/lib/authContext';
import MVP1ApiClient from '@/lib/mvp1ApiClient';

/**
 * Hook để đồng bộ dữ liệu từ API vào Zustand game store
 * Chạy khi app mount và khi user login
 * 
 * Strategy: Load dữ liệu từ API server, merge vào Zustand store
 * Components tiếp tục dùng useGameStore, nhưng data sẽ từ API
 */
export const useApiDataSync = () => {
  const { player: currentPlayer } = useGameStore();
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      return; // Không sync nếu chưa login
    }

    // Set auth token cho API client
    MVP1ApiClient.setAuthToken(token);

    syncPlayerDataFromApi();
    syncGameDataFromApi();

    // Refresh data mỗi 30 giây
    const interval = setInterval(() => {
      syncPlayerDataFromApi();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, token]);

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
      if (!isAuthenticated) return;

      // Load heroes từ API
      try {
        const heroesResponse = await MVP1ApiClient.getPlayerHeroes();
        if (heroesResponse?.success && heroesResponse?.data) {
          const heroes = (heroesResponse.data as any)?.heroes || [];
          console.log('✅ Heroes from API:', heroes);
          useGameStore.setState({ heroes });
        }
      } catch (e) {
        console.warn('Failed to load heroes:', e);
      }

      // Load provinces từ API
      try {
        const provincesResponse = await MVP1ApiClient.getPlayerProvinces();
        if (provincesResponse?.success && provincesResponse?.data) {
          const provinces = (provincesResponse.data as any)?.provinces || [];
          console.log('✅ Provinces from API:', provinces);
          useGameStore.setState({ provinces });
        }
      } catch (e) {
        console.warn('Failed to load provinces:', e);
      }

      // Load resources từ API
      try {
        const resourcesResponse = await MVP1ApiClient.getPlayerResources();
        if (resourcesResponse?.success && resourcesResponse?.data) {
          const resources = (resourcesResponse.data as any)?.resources || {};
          console.log('✅ Resources from API:', resources);
          // Update player resources trong store
          useGameStore.setState((state) => ({
            player: {
              ...state.player,
              totalResources: resources,
            },
          }));
        }
      } catch (e) {
        console.warn('Failed to load resources:', e);
      }
    } catch (error) {
      console.warn('Failed to sync game data:', error);
      // Tiếp tục với existing data
    }
  };

  return {
    syncPlayerDataFromApi,
    syncGameDataFromApi,
  };
};
