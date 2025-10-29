'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/lib/gameStore';
import MVP1ApiClient from '@/lib/graphqlApiClient';

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
      if (!token) return;
      const gameDataResponse = await MVP1ApiClient.getGameData();
      if (gameDataResponse?.data) {
        console.log('Game data synced from API:', gameDataResponse.data);
      }
    } catch (error) {
      console.warn('Failed to sync player data:', error);
    }
  };

  const syncGameDataFromApi = async (token: string) => {
    try {
      if (!token) {
        console.log('Skipping data sync - no token');
        return;
      }

      console.log('Starting game data sync from API...');

      try {
        const provincesResponse = await MVP1ApiClient.getPlayerProvinces();
        console.log('Provinces API Response:', provincesResponse);
        
        if (provincesResponse?.success && provincesResponse?.data) {
          const apiProvinces = Array.isArray(provincesResponse.data) ? provincesResponse.data : [];
          console.log('Received', apiProvinces.length, 'provinces from API');
          
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
              description: 'Tinh ' + (p.province?.region || 'Unknown'),
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
          
          console.log('Transformed', transformedProvinces.length, 'provinces for frontend');
          useGameStore.setState({ provinces: transformedProvinces as any });
        } else {
          console.warn('No provinces data in API response');
          useGameStore.setState({ provinces: [] });
        }
      } catch (e: any) {
        console.error('Failed to load provinces:', e.message);
        useGameStore.setState({ provinces: [] });
      }

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
