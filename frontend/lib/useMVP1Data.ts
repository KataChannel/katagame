/**
 * useMVP1Data - Unified hook for accessing real MVP1 game data
 * This hook provides a clean interface to all MVP1 API data with proper typing
 */

import { useEffect, useState, useCallback } from 'react';
import MVP1ApiClient from './graphqlApiClient';
import type { MVP1GameData, Pet, Achievement, Battle, Guild } from './types/mvp1.types';

interface UseMVP1DataOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

/**
 * Main hook for accessing MVP1 game data
 */
export function useMVP1Data(options: UseMVP1DataOptions = {}) {
  const { autoRefresh = false, refreshInterval = 30000 } = options;
  
  const [data, setData] = useState<MVP1GameData>({
    stories: [],
    resources: [],
    heroes: [],
    provinces: [],
    gameConfig: null as any,
    playerResources: undefined,
    playerHeroes: [],
    playerProvinces: [],
    playerPets: [],
    playerAchievements: [],
    playerBattles: [],
    playerGuild: undefined,
    quizStats: undefined,
    isLoading: true,
    error: null,
  });

  /**
   * Load all game data
   */
  const loadData = useCallback(async () => {
    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const isAuthenticated = !!MVP1ApiClient.getAuthToken();

      // Load public data (parallel)
      const [configRes, storiesRes, resourcesRes, heroesRes, provincesRes] = await Promise.allSettled([
        MVP1ApiClient.getConfig(),
        MVP1ApiClient.getStories(),
        MVP1ApiClient.getResources(),
        MVP1ApiClient.getHeroes(),
        MVP1ApiClient.getProvinces(),
      ]);

      // Load player data if authenticated (parallel)
      let playerData: any = {};
      if (isAuthenticated) {
        const [
          playerResourcesRes,
          playerHeroesRes,
          playerProvincesRes,
          playerPetsRes,
          playerAchievementsRes,
          playerBattlesRes,
          playerGuildRes,
          quizStatsRes,
        ] = await Promise.allSettled([
          MVP1ApiClient.getPlayerResources(),
          MVP1ApiClient.getPlayerHeroes(),
          MVP1ApiClient.getPlayerProvinces(),
          MVP1ApiClient.getPets(),
          MVP1ApiClient.getAchievements(),
          MVP1ApiClient.getBattles(),
          MVP1ApiClient.getMyGuild(),
          MVP1ApiClient.getQuizStats(),
        ]);

        playerData = {
          playerResources: playerResourcesRes.status === 'fulfilled' ? playerResourcesRes.value.data : undefined,
          playerHeroes: playerHeroesRes.status === 'fulfilled' ? ((playerHeroesRes.value as any).data?.heroes || (playerHeroesRes.value as any).data || []) : [],
          playerProvinces: playerProvincesRes.status === 'fulfilled' ? ((playerProvincesRes.value as any).data?.provinces || (playerProvincesRes.value as any).data || []) : [],
          playerPets: playerPetsRes.status === 'fulfilled' ? ((playerPetsRes.value as any).data?.pets || (playerPetsRes.value as any).data || []) : [],
          playerAchievements: playerAchievementsRes.status === 'fulfilled' ? ((playerAchievementsRes.value as any).data?.achievements || (playerAchievementsRes.value as any).data || []) : [],
          playerBattles: playerBattlesRes.status === 'fulfilled' ? ((playerBattlesRes.value as any).data?.battles || (playerBattlesRes.value as any).data || []) : [],
          playerGuild: playerGuildRes.status === 'fulfilled' ? (playerGuildRes.value as any).data : undefined,
          quizStats: quizStatsRes.status === 'fulfilled' ? (quizStatsRes.value as any).data : undefined,
        };
      }

      setData({
        gameConfig: configRes.status === 'fulfilled' ? (configRes.value as any).data : null,
        stories: storiesRes.status === 'fulfilled' ? ((storiesRes.value as any).data?.stories || (storiesRes.value as any).data || []) : [],
        resources: resourcesRes.status === 'fulfilled' ? ((resourcesRes.value as any).data?.resources || (resourcesRes.value as any).data || []) : [],
        heroes: heroesRes.status === 'fulfilled' ? ((heroesRes.value as any).data?.heroes || (heroesRes.value as any).data || []) : [],
        provinces: provincesRes.status === 'fulfilled' ? ((provincesRes.value as any).data?.provinces || (provincesRes.value as any).data || []) : [],
        ...playerData,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setData(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load game data',
      }));
    }
  }, []);

  /**
   * Refresh specific data type
   */
  const refresh = useCallback(async (dataType?: keyof MVP1GameData) => {
    if (!dataType) {
      return loadData();
    }

    try {
      let result: any;
      
      switch (dataType) {
        case 'playerPets':
          result = await MVP1ApiClient.getPets();
          setData(prev => ({ ...prev, playerPets: result.data?.pets || result.data || [] }));
          break;
        case 'playerAchievements':
          result = await MVP1ApiClient.getAchievements();
          setData(prev => ({ ...prev, playerAchievements: result.data?.achievements || result.data || [] }));
          break;
        case 'playerBattles':
          result = await MVP1ApiClient.getBattles();
          setData(prev => ({ ...prev, playerBattles: result.data?.battles || result.data || [] }));
          break;
        case 'playerGuild':
          result = await MVP1ApiClient.getMyGuild();
          setData(prev => ({ ...prev, playerGuild: result.data }));
          break;
        case 'playerResources':
          result = await MVP1ApiClient.getPlayerResources();
          setData(prev => ({ ...prev, playerResources: result.data }));
          break;
        case 'playerHeroes':
          result = await MVP1ApiClient.getPlayerHeroes();
          setData(prev => ({ ...prev, playerHeroes: result.data?.heroes || result.data || [] }));
          break;
        case 'playerProvinces':
          result = await MVP1ApiClient.getPlayerProvinces();
          setData(prev => ({ ...prev, playerProvinces: result.data?.provinces || result.data || [] }));
          break;
        default:
          console.warn(`Refresh not implemented for: ${dataType}`);
      }
    } catch (error) {
      console.error(`Failed to refresh ${dataType}:`, error);
    }
  }, [loadData]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(loadData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadData]);

  return {
    ...data,
    refresh,
    reload: loadData,
  };
}

/**
 * Hook specifically for pets data
 */
export function usePets() {
  const { playerPets, isLoading, error, refresh } = useMVP1Data();
  
  return {
    pets: playerPets || [],
    isLoading,
    error,
    refreshPets: () => refresh('playerPets'),
  };
}

/**
 * Hook specifically for achievements data
 */
export function useAchievements() {
  const { playerAchievements, isLoading, error, refresh } = useMVP1Data();
  
  return {
    achievements: playerAchievements || [],
    isLoading,
    error,
    refreshAchievements: () => refresh('playerAchievements'),
  };
}

/**
 * Hook specifically for battles data
 */
export function useBattles() {
  const { playerBattles, isLoading, error, refresh } = useMVP1Data();
  
  const startBattle = useCallback(async (opponentId: string, battleType: string = 'pvp') => {
    try {
      const result = await MVP1ApiClient.startBattle(opponentId, battleType);
      // Refresh battles after starting new one
      await refresh('playerBattles');
      return result;
    } catch (error) {
      throw error;
    }
  }, [refresh]);

  return {
    battles: playerBattles || [],
    isLoading,
    error,
    startBattle,
    refreshBattles: () => refresh('playerBattles'),
  };
}

/**
 * Hook specifically for guild data
 */
export function useGuild() {
  const { playerGuild, isLoading, error, refresh } = useMVP1Data();
  
  const createGuild = useCallback(async (name: string, description?: string) => {
    try {
      const result = await MVP1ApiClient.createGuild(name, description);
      await refresh('playerGuild');
      return result;
    } catch (error) {
      throw error;
    }
  }, [refresh]);

  const joinGuild = useCallback(async (guildId: string) => {
    try {
      const result = await MVP1ApiClient.joinGuild(guildId);
      await refresh('playerGuild');
      return result;
    } catch (error) {
      throw error;
    }
  }, [refresh]);

  const leaveGuild = useCallback(async () => {
    try {
      const result = await MVP1ApiClient.leaveGuild();
      await refresh('playerGuild');
      return result;
    } catch (error) {
      throw error;
    }
  }, [refresh]);

  return {
    guild: playerGuild,
    isLoading,
    error,
    createGuild,
    joinGuild,
    leaveGuild,
    refreshGuild: () => refresh('playerGuild'),
  };
}

export default useMVP1Data;
