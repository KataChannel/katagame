/**
 * GraphQL Game API Client
 * Replaces MVP1ApiClient with GraphQL operations
 */

import apolloClient from './apolloClient';
import {
  REGISTER,
  LOGIN,
  GOOGLE_AUTH,
  GET_ME,
  GET_PLAYER,
  UPDATE_PLAYER,
  ADD_RESOURCES,
  GET_RESOURCES,
  GET_MY_RESOURCES,
  GET_MY_RESOURCE,
  GET_PROVINCES,
  GET_PROVINCE,
  GET_MY_PROVINCES,
  GET_MY_PROVINCE,
  UNLOCK_PROVINCE,
  UPGRADE_PROVINCE,
  GET_HEROES,
  GET_HERO,
  GET_MY_HEROES,
  GET_MY_HERO,
  RECRUIT_HERO,
  DEPLOY_HERO,
  LEVEL_UP_HERO,
  GET_STORIES,
  GET_STORY,
  GET_STORY_BY_DAY,
  GET_QUIZ_QUESTIONS,
  MARK_STORY_READ,
  SUBMIT_QUIZ,
  GET_MY_QUIZ_SUBMISSIONS,
  RESET_PLAYER_DATA,
  GET_ALL_RELICS,
  GET_MY_RELICS,
  CRAFT_RELIC,
  PLACE_RELIC,
  UPGRADE_SPIRAL,
  GET_CRAFTABLE_ITEMS,
  GET_MY_INVENTORY,
  CRAFT_ITEM,
  USE_ITEM,
  GET_ACTIVE_EVENTS,
  GET_MY_PARTICIPATION,
  JOIN_EVENT,
  CONTRIBUTE_TO_EVENT,
} from './graphql/queries';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// Helper to safely handle GraphQL response
function handleGraphQLResponse(data: unknown, field: string): any {
  // Check if data is null, undefined, or not an object
  if (!data || typeof data !== 'object') {
    console.error(`❌ Invalid GraphQL response: data is ${typeof data}`, { field });
    return null;
  }
  
  // Check if data is an empty object
  const dataObj = data as any;
  if (Object.keys(dataObj).length === 0) {
    console.error(`❌ Empty GraphQL response object for field: ${field}`);
    return null;
  }
  
  const result = dataObj[field];
  
  // Check if the specific field exists
  if (result === undefined) {
    console.error(`❌ GraphQL response missing field: ${field}`, { 
      field,
      availableFields: Object.keys(dataObj) 
    });
    return null;
  }
  
  return result;
}

export class GraphQLApiClient {
  private static authToken: string | null = null;

  /**
   * Set the authentication token
   */
  static setAuthToken(token: string) {
    GraphQLApiClient.authToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  /**
   * Get the authentication token
   */
  static getAuthToken(): string | null {
    if (!GraphQLApiClient.authToken && typeof window !== 'undefined') {
      GraphQLApiClient.authToken = localStorage.getItem('authToken');
    }
    return GraphQLApiClient.authToken;
  }

  /**
   * Clear authentication token
   */
  static clearAuthToken() {
    GraphQLApiClient.authToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  // ==================== AUTH ====================

  static async register(email: string, password: string, username: string): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: REGISTER,
        variables: { email, password, username },
      });

      if ((data as any).register.success && (data as any).register.token) {
        GraphQLApiClient.setAuthToken((data as any).register.token);
      }

      return {
        success: (data as any).register.success,
        data: (data as any).register,
        message: (data as any).register.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Registration failed',
      };
    }
  }

  static async login(email: string, password: string): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: LOGIN,
        variables: { email, password },
      });

      if ((data as any).login.success && (data as any).login.token) {
        GraphQLApiClient.setAuthToken((data as any).login.token);
      }

      return {
        success: (data as any).login.success,
        data: (data as any).login,
        message: (data as any).login.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Login failed',
      };
    }
  }

  static async logout(): Promise<ApiResponse> {
    GraphQLApiClient.clearAuthToken();
    await apolloClient.clearStore();
    return { success: true };
  }

  // ==================== PLAYER ====================

  static async getMe(): Promise<ApiResponse> {
    try {
      const result = await apolloClient.query({
        query: GET_ME,
      });

      const data = result.data as any;
      const errors = (result as any).errors;

      // Check if data is empty or me is null/undefined
      if (!data || !data.me) {
        console.warn('⚠️ getMe returned empty data:', { data, errors });
        return {
          success: false,
          message: errors?.[0]?.message || 'No player data returned',
          data: null,
        };
      }

      return {
        success: true,
        data: data.me,
      };
    } catch (error: any) {
      console.error('❌ getMe error:', error);
      return {
        success: false,
        message: error.message || 'Failed to get player data',
        data: null,
      };
    }
  }

  static async getPlayer(id: string): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.query({
        query: GET_PLAYER,
        variables: { id },
      });

      return {
        success: true,
        data: (data as any).player,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async updatePlayer(updateData: any): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_PLAYER,
        variables: { data: updateData },
      });

      return {
        success: true,
        data: (data as any).updatePlayer,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async addResources(resources: {
    gold?: number;
    rice?: number;
    lumber?: number;
    stone?: number;
    bazan?: number;
  }): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: ADD_RESOURCES,
        variables: resources,
      });

      return {
        success: (data as any).addResources.success,
        message: (data as any).addResources.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // ==================== RESOURCES ====================

  static async getResources(): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.query({
        query: GET_RESOURCES,
      });

      return {
        success: true,
        data: (data as any).resources,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async getPlayerResources(): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.query({
        query: GET_MY_RESOURCES,
      });

      return {
        success: true,
        data: (data as any).myResources,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async getPlayerResource(resourceType: string): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.query({
        query: GET_MY_RESOURCE,
        variables: { resourceType },
      });

      return {
        success: true,
        data: (data as any).myResource,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // ==================== PROVINCES ====================

  static async getProvinces(where?: any, pagination?: any): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.query({
        query: GET_PROVINCES,
        variables: { where, pagination },
      });

      return {
        success: true,
        data: (data as any).provinces,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async getProvince(id: number): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.query({
        query: GET_PROVINCE,
        variables: { id },
      });

      return {
        success: true,
        data: (data as any).province,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async getPlayerProvinces(where?: any): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.query({
        query: GET_MY_PROVINCES,
        variables: { where },
      });

      return {
        success: true,
        data: (data as any).myProvinces,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async getPlayerProvince(provinceId: number): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.query({
        query: GET_MY_PROVINCE,
        variables: { provinceId },
      });

      return {
        success: true,
        data: (data as any).myProvince,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async unlockProvince(provinceId: number, heroId?: string): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: UNLOCK_PROVINCE,
        variables: {
          input: { provinceId, heroId },
        },
        refetchQueries: [
          { query: GET_MY_PROVINCES },
          { query: GET_MY_RESOURCES },
        ],
        awaitRefetchQueries: true,
      });

      const result = handleGraphQLResponse(data, 'unlockProvince');
      
      if (!result) {
        return {
          success: false,
          message: 'Invalid response from server',
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      console.error('❌ unlockProvince error:', error);
      return {
        success: false,
        message: error.message || 'Failed to unlock province',
      };
    }
  }

  static async upgradeProvince(provinceId: number, upgradeType: string): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPGRADE_PROVINCE,
        variables: {
          input: { provinceId, upgradeType },
        },
        // Refetch queries to update cache
        refetchQueries: [
          { query: GET_ME },
          { query: GET_MY_PROVINCES },
          { query: GET_MY_PROVINCE, variables: { provinceId } },
          { query: GET_MY_RESOURCES },
        ],
        // Update cache immediately for better UX
        awaitRefetchQueries: true,
      });

      // Safely extract response data
      const result = handleGraphQLResponse(data, 'upgradeProvince');
      
      if (!result) {
        return {
          success: false,
          message: 'Invalid response from server',
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      console.error('❌ upgradeProvince error:', error);
      return {
        success: false,
        message: error.message || 'Failed to upgrade province',
      };
    }
  }

  // ==================== HEROES ====================

  static async getHeroes(where?: any, pagination?: any): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.query({
        query: GET_HEROES,
        variables: { where, pagination },
      });

      return {
        success: true,
        data: (data as any).heroes,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async getHero(id: string): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.query({
        query: GET_HERO,
        variables: { id },
      });

      return {
        success: true,
        data: (data as any).hero,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async getPlayerHeroes(where?: any): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.query({
        query: GET_MY_HEROES,
        variables: { where },
      });

      return {
        success: true,
        data: (data as any).myHeroes,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async getPlayerHero(heroId: string): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.query({
        query: GET_MY_HERO,
        variables: { heroId },
      });

      return {
        success: true,
        data: (data as any).myHero,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async recruitHero(heroId: string): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: RECRUIT_HERO,
        variables: {
          input: { heroId },
        },
        refetchQueries: [
          { query: GET_MY_HEROES },
          { query: GET_MY_RESOURCES },
        ],
        awaitRefetchQueries: true,
      });

      const result = handleGraphQLResponse(data, 'recruitHero');
      
      if (!result) {
        return {
          success: false,
          message: 'Invalid response from server',
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      console.error('❌ recruitHero error:', error);
      return {
        success: false,
        message: error.message || 'Failed to recruit hero',
      };
    }
  }

  static async deployHero(heroId: string, provinceId: number): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: DEPLOY_HERO,
        variables: {
          input: { heroId, provinceId },
        },
        refetchQueries: [
          { query: GET_MY_HEROES },
          { query: GET_MY_PROVINCES },
          { query: GET_MY_PROVINCE, variables: { provinceId } },
        ],
        awaitRefetchQueries: true,
      });

      const result = handleGraphQLResponse(data, 'deployHero');
      
      if (!result) {
        return {
          success: false,
          message: 'Invalid response from server',
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      console.error('❌ deployHero error:', error);
      return {
        success: false,
        message: error.message || 'Failed to deploy hero',
      };
    }
  }

  static async levelUpHero(playerHeroId: string): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: LEVEL_UP_HERO,
        variables: {
          input: { playerHeroId },
        },
        refetchQueries: [
          { query: GET_MY_HEROES },
          { query: GET_MY_RESOURCES },
        ],
        awaitRefetchQueries: true,
      });

      const result = handleGraphQLResponse(data, 'levelUpHero');
      
      if (!result) {
        return {
          success: false,
          message: 'Invalid response from server',
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      console.error('❌ levelUpHero error:', error);
      return {
        success: false,
        message: error.message || 'Failed to level up hero',
      };
    }
  }

  // ==================== STORIES ====================

  static async getStories(where?: any, pagination?: any): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.query({
        query: GET_STORIES,
        variables: { where, pagination },
      });

      return {
        success: true,
        data: (data as any).stories,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async getStory(id: string): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.query({
        query: GET_STORY,
        variables: { id },
      });

      return {
        success: true,
        data: (data as any).story,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async getStoryByDay(day: number): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.query({
        query: GET_STORY_BY_DAY,
        variables: { day },
      });

      return {
        success: true,
        data: (data as any).storyByDay,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async getQuizQuestions(storyId: string): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.query({
        query: GET_QUIZ_QUESTIONS,
        variables: { storyId },
      });

      return {
        success: true,
        data: (data as any).quizQuestions,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async markStoryRead(storyId: string): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: MARK_STORY_READ,
        variables: {
          input: { storyId },
        },
        refetchQueries: [
          { query: GET_ME },
          { query: GET_STORIES },
        ],
        awaitRefetchQueries: true,
      });

      const result = handleGraphQLResponse(data, 'markStoryRead');
      
      if (!result) {
        return {
          success: false,
          message: 'Invalid response from server',
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      console.error('❌ markStoryRead error:', error);
      return {
        success: false,
        message: error.message || 'Failed to mark story as read',
      };
    }
  }

  static async submitQuiz(
    storyId: string,
    answers: Array<{ questionNumber: number; selectedAnswer: number }>,
    timeTaken?: number
  ): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: SUBMIT_QUIZ,
        variables: {
          input: { storyId, answers, timeTaken },
        },
        refetchQueries: [
          { query: GET_MY_QUIZ_SUBMISSIONS },
          { query: GET_MY_RESOURCES },
          { query: GET_ME },
        ],
        awaitRefetchQueries: true,
      });

      const result = handleGraphQLResponse(data, 'submitQuiz');
      
      if (!result) {
        return {
          success: false,
          message: 'Invalid response from server',
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      console.error('❌ submitQuiz error:', error);
      return {
        success: false,
        message: error.message || 'Failed to submit quiz',
      };
    }
  }

  static async getQuizStats(): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.query({
        query: GET_MY_QUIZ_SUBMISSIONS,
      });

      return {
        success: true,
        data: (data as any).myQuizSubmissions,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // ==================== PLACEHOLDER METHODS (Not implemented in backend yet) ====================

  static async getPets(): Promise<ApiResponse> {
    return { success: true, data: [] };
  }

  static async getAchievements(): Promise<ApiResponse> {
    return { success: true, data: [] };
  }

  static async getBattles(): Promise<ApiResponse> {
    return { success: true, data: [] };
  }

  static async getMyGuild(): Promise<ApiResponse> {
    return { success: true, data: null };
  }

  static async getConfig(): Promise<ApiResponse> {
    return {
      success: true,
      data: {
        gameVersion: '2.0.0-graphql',
        apiType: 'GraphQL',
      },
    };
  }

  // ==================== STUB METHODS (Not implemented in GraphQL yet) ====================

  static async upgradeFarmer(provinceId: string): Promise<ApiResponse> {
    // Use upgradeProvince with type FARMER
    return this.upgradeProvince(parseInt(provinceId), 'FARMER');
  }

  static async upgradeResource(provinceId: string): Promise<ApiResponse> {
    // Use upgradeProvince with type RESOURCE
    return this.upgradeProvince(parseInt(provinceId), 'RESOURCE');
  }

  static async upgradeDevelopment(provinceId: string): Promise<ApiResponse> {
    // Use upgradeProvince with type DEVELOPMENT
    return this.upgradeProvince(parseInt(provinceId), 'DEVELOPMENT');
  }

  static async startBattle(opponentId: string, battleType: string): Promise<ApiResponse> {
    return {
      success: false,
      message: 'Battle system not implemented in GraphQL backend yet',
    };
  }

  static async createGuild(name: string, description?: string): Promise<ApiResponse> {
    return {
      success: false,
      message: 'Guild system not implemented in GraphQL backend yet',
    };
  }

  static async joinGuild(guildId: string): Promise<ApiResponse> {
    return {
      success: false,
      message: 'Guild system not implemented in GraphQL backend yet',
    };
  }

  static async leaveGuild(): Promise<ApiResponse> {
    return {
      success: false,
      message: 'Guild system not implemented in GraphQL backend yet',
    };
  }

  static async googleAuth(credential: string): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: GOOGLE_AUTH,
        variables: { credential },
      });

      if ((data as any).googleAuth.success && (data as any).googleAuth.token) {
        GraphQLApiClient.setAuthToken((data as any).googleAuth.token);
      }

      return {
        success: (data as any).googleAuth.success,
        data: (data as any).googleAuth,
        message: (data as any).googleAuth.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Google authentication failed',
      };
    }
  }

  static async getPlayerNavigation(): Promise<ApiResponse> {
    // Return current player state
    return this.getMe();
  }

  static async getQuizLeaderboard(limit = 10, offset = 0): Promise<ApiResponse> {
    return {
      success: false,
      message: 'Leaderboard not implemented in GraphQL backend yet',
    };
  }

  static async getResourceLeaderboard(type: string, limit = 10, offset = 0): Promise<ApiResponse> {
    return {
      success: false,
      message: 'Leaderboard not implemented in GraphQL backend yet',
    };
  }

  static async getHeroLeaderboard(limit = 10, offset = 0): Promise<ApiResponse> {
    return {
      success: false,
      message: 'Leaderboard not implemented in GraphQL backend yet',
    };
  }

  static async getGameData(): Promise<ApiResponse> {
    // Return combined game data
    return this.getMe();
  }

  static async harvestResources(resourceType: string): Promise<ApiResponse> {
    return {
      success: false,
      message: 'Resource harvesting not implemented in GraphQL backend yet',
    };
  }

  // ==================== PLAYER DATA MANAGEMENT ====================

  /**
   * Reset player data on server (DELETE ALL PROGRESS)
   * This will:
   * - Delete all player provinces
   * - Delete all player heroes
   * - Reset player resources to initial values
   * - Reset player level to 1
   * - Keep account but delete game progress
   * 
   * NOTE: Does NOT refetch queries to avoid showing stale data.
   * The page should be reloaded after this operation.
   */
  static async resetPlayerData(): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: RESET_PLAYER_DATA,
        // DO NOT refetchQueries - we will reload the page instead
        // This prevents showing stale cached data
      });

      const result = handleGraphQLResponse(data, 'resetPlayerData');
      
      if (!result) {
        return {
          success: false,
          message: 'Invalid response from server',
        };
      }

      // Important: Clear Apollo cache immediately after reset
      await apolloClient.clearStore();

      return {
        success: result.success || true,
        message: result.message || 'Player data reset successfully',
      };
    } catch (error: any) {
      console.error('❌ resetPlayerData error:', error);
      return {
        success: false,
        message: error.message || 'Failed to reset player data',
      };
    }
  }

  // ==================== RELICS ====================

  static async getAllRelics(): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.query({
        query: GET_ALL_RELICS,
      });

      return {
        success: true,
        data: (data as any).allRelics,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async getMyRelics(): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.query({
        query: GET_MY_RELICS,
      });

      return {
        success: true,
        data: (data as any).myRelics,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async craftRelic(relicId: string): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: CRAFT_RELIC,
        variables: { relicId },
        refetchQueries: [{ query: GET_MY_RELICS }, { query: GET_MY_RESOURCES }],
        awaitRefetchQueries: true,
      });

      return {
        success: true,
        data: (data as any).craftRelic,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async placeRelic(playerRelicId: string, provinceId: number): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: PLACE_RELIC,
        variables: { playerRelicId, provinceId },
        refetchQueries: [{ query: GET_MY_RELICS }, { query: GET_MY_PROVINCES }],
        awaitRefetchQueries: true,
      });

      return {
        success: true,
        data: (data as any).placeRelic,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async upgradeSpiral(provinceId: number): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPGRADE_SPIRAL,
        variables: { provinceId },
        refetchQueries: [
          { query: GET_MY_PROVINCES },
          { query: GET_ME },
          { query: GET_MY_RESOURCES },
        ],
        awaitRefetchQueries: true,
      });

      return {
        success: true,
        data: (data as any).upgradeSpiral,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async getCraftableItems(): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.query({
        query: GET_CRAFTABLE_ITEMS,
      });

      return {
        success: true,
        data: (data as any).craftableItems,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async getMyInventory(): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.query({
        query: GET_MY_INVENTORY,
        fetchPolicy: 'network-only',
      });

      return {
        success: true,
        data: (data as any).myInventory,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async craftItem(itemId: string): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: CRAFT_ITEM,
        variables: { itemId },
        refetchQueries: [
          { query: GET_MY_INVENTORY },
          { query: GET_MY_RESOURCES },
          { query: GET_ME },
        ],
        awaitRefetchQueries: true,
      });

      return {
        success: true,
        data: (data as any).craftItem,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async useItem(itemId: string): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: USE_ITEM,
        variables: { itemId },
        refetchQueries: [
          { query: GET_MY_INVENTORY },
          { query: GET_ME },
        ],
        awaitRefetchQueries: true,
      });

      return {
        success: true,
        data: (data as any).useItem,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  static async getActiveEvents(): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.query({ query: GET_ACTIVE_EVENTS });
      return { success: true, data: (data as any).activeEvents };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async getMyParticipation(eventId: string): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.query({
        query: GET_MY_PARTICIPATION,
        variables: { eventId },
        fetchPolicy: 'network-only',
      });
      return { success: true, data: (data as any).myParticipation };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async joinEvent(eventId: string, choice: string): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: JOIN_EVENT,
        variables: { eventId, choice },
        refetchQueries: [{ query: GET_ME }],
      });
      return { success: true, data: (data as any).joinEvent };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  static async contributeToEvent(eventId: string, amount: number): Promise<ApiResponse> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: CONTRIBUTE_TO_EVENT,
        variables: { eventId, amount },
        refetchQueries: [
          { query: GET_MY_RESOURCES },
          { query: GET_ME },
        ],
      });
      return { success: true, data: (data as any).contributeToEvent };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }
}

export default GraphQLApiClient;

// Alias for backward compatibility - can drop-in replace MVP1ApiClient
export { GraphQLApiClient as MVP1ApiClient };
