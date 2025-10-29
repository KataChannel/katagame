'use client';

import { useState, useCallback, useEffect } from 'react';
import MVP1ApiClient from '../graphqlApiClient';

/**
 * Hook for fetching heroes
 */
export function useHeroes() {
  const [heroes, setHeroes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeroes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await MVP1ApiClient.getHeroes();
        if (response.success) {
          setHeroes((response.data as any)?.heroes || []);
        } else {
          setError(response.message || 'Failed to load heroes');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Error fetching heroes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroes();
  }, []);

  return { heroes, loading, error, refetch: () => {} };
}

/**
 * Hook for fetching player heroes
 */
export function usePlayerHeroes() {
  const [heroes, setHeroes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerHeroes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await MVP1ApiClient.getPlayerHeroes();
        if (response.success) {
          setHeroes((response.data as any)?.heroes || []);
        } else {
          setError(response.message || 'Failed to load player heroes');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Error fetching player heroes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerHeroes();
  }, []);

  return { heroes, loading, error };
}

/**
 * Hook for fetching provinces
 */
export function useProvinces() {
  const [provinces, setProvinces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await MVP1ApiClient.getProvinces();
        if (response.success) {
          setProvinces((response.data as any)?.provinces || []);
        } else {
          setError(response.message || 'Failed to load provinces');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Error fetching provinces:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProvinces();
  }, []);

  return { provinces, loading, error };
}

/**
 * Hook for fetching player provinces
 */
export function usePlayerProvinces() {
  const [provinces, setProvinces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerProvinces = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await MVP1ApiClient.getPlayerProvinces();
        if (response.success) {
          setProvinces((response.data as any)?.provinces || []);
        } else {
          setError(response.message || 'Failed to load player provinces');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Error fetching player provinces:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerProvinces();
  }, []);

  return { provinces, loading, error };
}

/**
 * Hook for fetching stories
 */
export function useStories(page: number = 1, limit: number = 10) {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page, limit, total: 0 });

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await MVP1ApiClient.getStories(page, limit);
        if (response.success) {
          setStories((response.data as any)?.stories || []);
          setPagination({
            page: (response.data as any)?.page || page,
            limit: (response.data as any)?.limit || limit,
            total: (response.data as any)?.total || 0,
          });
        } else {
          setError(response.message || 'Failed to load stories');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Error fetching stories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [page, limit]);

  return { stories, loading, error, pagination };
}

/**
 * Hook for fetching resources
 */
export function useResources() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await MVP1ApiClient.getResources();
        if (response.success) {
          setResources((response.data as any)?.resources || []);
        } else {
          setError(response.message || 'Failed to load resources');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Error fetching resources:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  return { resources, loading, error };
}

/**
 * Hook for fetching player resources
 */
export function usePlayerResources() {
  const [playerResources, setPlayerResources] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerResources = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await MVP1ApiClient.getPlayerResources();
        if (response.success) {
          setPlayerResources(response.data);
        } else {
          setError(response.message || 'Failed to load player resources');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Error fetching player resources:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerResources();
  }, []);

  return { playerResources, loading, error };
}

/**
 * Hook for fetching quiz leaderboard
 */
export function useQuizLeaderboard(limit: number = 10, offset: number = 0) {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await MVP1ApiClient.getQuizLeaderboard(limit, offset);
        if (response.success) {
          setLeaderboard((response.data as any)?.leaderboard || []);
        } else {
          setError(response.message || 'Failed to load leaderboard');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [limit, offset]);

  return { leaderboard, loading, error };
}

/**
 * Hook for fetching resource leaderboard
 */
export function useResourceLeaderboard(
  type: string = 'gold',
  limit: number = 10,
  offset: number = 0
) {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await MVP1ApiClient.getResourceLeaderboard(type, limit, offset);
        if (response.success) {
          setLeaderboard((response.data as any)?.leaderboard || []);
        } else {
          setError(response.message || 'Failed to load leaderboard');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [type, limit, offset]);

  return { leaderboard, loading, error };
}

/**
 * Hook for fetching hero leaderboard
 */
export function useHeroLeaderboard(limit: number = 10, offset: number = 0) {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await MVP1ApiClient.getHeroLeaderboard(limit, offset);
        if (response.success) {
          setLeaderboard((response.data as any)?.leaderboard || []);
        } else {
          setError(response.message || 'Failed to load leaderboard');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [limit, offset]);

  return { leaderboard, loading, error };
}

/**
 * Hook for fetching game data
 */
export function useGameData() {
  const [gameData, setGameData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await MVP1ApiClient.getGameData();
        if (response.success) {
          setGameData(response.data);
        } else {
          setError(response.message || 'Failed to load game data');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Error fetching game data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, []);

  return { gameData, loading, error };
}

/**
 * Hook for action mutations (recruit hero, harvest, etc)
 */
export function useGameAction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recruitHero = useCallback(async (heroType: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await MVP1ApiClient.recruitHero(heroType);
      if (!response.success) {
        setError(response.message || 'Failed to recruit hero');
      }
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const harvestResources = useCallback(async (resourceType: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await MVP1ApiClient.harvestResources(resourceType);
      if (!response.success) {
        setError(response.message || 'Failed to harvest resources');
      }
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deployHero = useCallback(async (heroId: string, provinceId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await MVP1ApiClient.deployHero(heroId, parseInt(provinceId));
      if (!response.success) {
        setError(response.message || 'Failed to deploy hero');
      }
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    recruitHero,
    harvestResources,
    deployHero,
  };
}
