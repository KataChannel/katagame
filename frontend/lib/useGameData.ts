/**
 * Hook for loading real MVP1 game data
 */

import { useEffect, useState } from 'react';
import MVP1ApiClient from './mvp1ApiClient';

interface GameDataState {
  stories: any[];
  quizzes: any[];
  resources: any[];
  heroes: any[];
  provinces: any[];
  gameConfig: any;
  playerResources: any;
  playerHeroes: any[];
  playerProvinces: any[];
  playerPets: any[];
  playerAchievements: any[];
  playerBattles: any[];
  playerGuild: any;
  isLoading: boolean;
  error: string | null;
}

const initialState: GameDataState = {
  stories: [],
  quizzes: [],
  resources: [],
  heroes: [],
  provinces: [],
  gameConfig: null,
  playerResources: null,
  playerHeroes: [],
  playerProvinces: [],
  playerPets: [],
  playerAchievements: [],
  playerBattles: [],
  playerGuild: null,
  isLoading: true,
  error: null,
};

/**
 * Load game data from MVP1 API
 */
export async function loadGameData(requiresAuth: boolean = true): Promise<GameDataState> {
  const state = { ...initialState };

  try {
    // Load public data (no auth required)
    const [configResult, storiesResult, resourcesResult, heroesResult, provincesResult] =
      await Promise.all([
        MVP1ApiClient.getConfig().catch(() => ({ success: false, data: null })),
        MVP1ApiClient.getStories().catch(() => ({ success: false, data: null })),
        MVP1ApiClient.getResources().catch(() => ({ success: false, data: null })),
        MVP1ApiClient.getHeroes().catch(() => ({ success: false, data: null })),
        MVP1ApiClient.getProvinces().catch(() => ({ success: false, data: null })),
      ]);

    if (configResult.success && configResult.data) {
      state.gameConfig = configResult.data;
    }

    if (storiesResult.success && storiesResult.data) {
      state.stories = Array.isArray(storiesResult.data)
        ? storiesResult.data
        : (storiesResult.data as any).stories || [];
    }

    if (resourcesResult.success && resourcesResult.data) {
      state.resources = Array.isArray(resourcesResult.data)
        ? resourcesResult.data
        : (resourcesResult.data as any).resources || [];
    }

    if (heroesResult.success && heroesResult.data) {
      state.heroes = Array.isArray(heroesResult.data)
        ? heroesResult.data
        : (heroesResult.data as any).heroes || [];
    }

    if (provincesResult.success && provincesResult.data) {
      state.provinces = Array.isArray(provincesResult.data)
        ? provincesResult.data
        : (provincesResult.data as any).provinces || [];
    }

    // Load player-specific data (requires auth)
    if (requiresAuth && MVP1ApiClient.getAuthToken()) {
      const [resourcesResult, heroesResult, provincesResult, petsResult, achievementsResult, battlesResult, guildResult] = await Promise.all([
        MVP1ApiClient.getPlayerResources().catch(() => ({ success: false, data: null })),
        MVP1ApiClient.getPlayerHeroes().catch(() => ({ success: false, data: null })),
        MVP1ApiClient.getPlayerProvinces().catch(() => ({ success: false, data: null })),
        MVP1ApiClient.getPets().catch(() => ({ success: false, data: null })),
        MVP1ApiClient.getAchievements().catch(() => ({ success: false, data: null })),
        MVP1ApiClient.getBattles().catch(() => ({ success: false, data: null })),
        MVP1ApiClient.getMyGuild().catch(() => ({ success: false, data: null })),
      ]);

      if (resourcesResult.success && resourcesResult.data) {
        state.playerResources = resourcesResult.data;
      }

      if (heroesResult.success && heroesResult.data) {
        state.playerHeroes = Array.isArray(heroesResult.data)
          ? heroesResult.data
          : (heroesResult.data as any).heroes || [];
      }

      if (provincesResult.success && provincesResult.data) {
        state.playerProvinces = Array.isArray(provincesResult.data)
          ? provincesResult.data
          : (provincesResult.data as any).provinces || [];
      }

      if (petsResult.success && petsResult.data) {
        state.playerPets = Array.isArray(petsResult.data)
          ? petsResult.data
          : (petsResult.data as any).pets || [];
      }

      if (achievementsResult.success && achievementsResult.data) {
        state.playerAchievements = Array.isArray(achievementsResult.data)
          ? achievementsResult.data
          : (achievementsResult.data as any).achievements || [];
      }

      if (battlesResult.success && battlesResult.data) {
        state.playerBattles = Array.isArray(battlesResult.data)
          ? battlesResult.data
          : (battlesResult.data as any).battles || [];
      }

      if (guildResult.success && guildResult.data) {
        state.playerGuild = guildResult.data;
      }
    }

    state.isLoading = false;
    return state;
  } catch (error) {
    state.error = error instanceof Error ? error.message : 'Failed to load game data';
    state.isLoading = false;
    return state;
  }
}

/**
 * React hook for loading game data
 */
export function useGameData() {
  const [data, setData] = useState<GameDataState>(initialState);

  useEffect(() => {
    const requiresAuth = !!MVP1ApiClient.getAuthToken();
    loadGameData(requiresAuth).then(setData);
  }, []);

  return data;
}

/**
 * Load player-specific data after authentication
 */
export async function loadPlayerData(): Promise<Partial<GameDataState>> {
  const state: Partial<GameDataState> = {};

  try {
    const [resourcesResult, heroesResult, provincesResult, statsResult, petsResult, achievementsResult, battlesResult, guildResult] = await Promise.all([
      MVP1ApiClient.getPlayerResources().catch(() => ({ success: false, data: null })),
      MVP1ApiClient.getPlayerHeroes().catch(() => ({ success: false, data: null })),
      MVP1ApiClient.getPlayerProvinces().catch(() => ({ success: false, data: null })),
      MVP1ApiClient.getQuizStats().catch(() => ({ success: false, data: null })),
      MVP1ApiClient.getPets().catch(() => ({ success: false, data: null })),
      MVP1ApiClient.getAchievements().catch(() => ({ success: false, data: null })),
      MVP1ApiClient.getBattles().catch(() => ({ success: false, data: null })),
      MVP1ApiClient.getMyGuild().catch(() => ({ success: false, data: null })),
    ]);

    if (resourcesResult.success && resourcesResult.data) {
      state.playerResources = resourcesResult.data;
    }

    if (heroesResult.success && heroesResult.data) {
      state.playerHeroes = Array.isArray(heroesResult.data)
        ? heroesResult.data
        : (heroesResult.data as any).heroes || [];
    }

    if (provincesResult.success && provincesResult.data) {
      state.playerProvinces = Array.isArray(provincesResult.data)
        ? provincesResult.data
        : (provincesResult.data as any).provinces || [];
    }

    if (petsResult.success && petsResult.data) {
      state.playerPets = Array.isArray(petsResult.data)
        ? petsResult.data
        : (petsResult.data as any).pets || [];
    }

    if (achievementsResult.success && achievementsResult.data) {
      state.playerAchievements = Array.isArray(achievementsResult.data)
        ? achievementsResult.data
        : (achievementsResult.data as any).achievements || [];
    }

    if (battlesResult.success && battlesResult.data) {
      state.playerBattles = Array.isArray(battlesResult.data)
        ? battlesResult.data
        : (battlesResult.data as any).battles || [];
    }

    if (guildResult.success && guildResult.data) {
      state.playerGuild = guildResult.data;
    }

    return state;
  } catch (error) {
    console.error('Failed to load player data:', error);
    return state;
  }
}

export default useGameData;
