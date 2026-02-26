/**
 * MVP1 Game API Client
 * Handles all communication with MVP1 backend endpoints
 */

import { getBaseUrl } from './apiConfig';

// Base URL without /api/v1 suffix (we add it in request method)
const API_BASE_URL = getBaseUrl();

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export class MVP1ApiClient {
  private static authToken: string | null = null;

  /**
   * Set the authentication token
   */
  static setAuthToken(token: string) {
    MVP1ApiClient.authToken = token;
    localStorage.setItem('authToken', token);
  }

  /**
   * Get the authentication token
   */
  static getAuthToken(): string | null {
    if (!MVP1ApiClient.authToken) {
      MVP1ApiClient.authToken = localStorage.getItem('authToken');
    }
    return MVP1ApiClient.authToken;
  }

  /**
   * Make an API request
   */
  private static async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    body?: any,
    requiresAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      const token = MVP1ApiClient.getAuthToken();
      if (!token) {
        throw new Error('Authentication token required');
      }
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
      console.log(response);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data?.body?.message || data.message || `API Error: ${response.status}`);
      }

      // Handle API response wrapper format: { status, body: { success, data, message } }
      if (data?.body) {
        return {
          success: data.body.success,
          data: data.body.data,
          message: data.body.message,
        };
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // ==================== STORIES ====================

  /**
   * Get all stories with pagination
   */
  static async getStories(page: number = 1, limit: number = 10) {
    return MVP1ApiClient.request(
      'GET',
      `/stories?page=${page}&limit=${limit}`,
      undefined,
      false
    );
  }

  /**
   * Get stories for a specific day
   */
  static async getStoriesByDay(day: number) {
    return MVP1ApiClient.request('GET', `/stories/${day}`, undefined, false);
  }

  /**
   * Get quiz for a story
   */
  static async getStoryQuiz(storyId: string) {
    return MVP1ApiClient.request('GET', `/stories/${storyId}/quiz`, undefined, false);
  }

  /**
   * Mark a story as read
   */
  static async markStoryRead(storyId: string) {
    return MVP1ApiClient.request('POST', `/stories/${storyId}/read`, {}, true);
  }

  // ==================== QUIZZES ====================

  /**
   * Submit quiz answers
   */
  static async submitQuiz(
    storyId: string,
    answers: { questionId: string; selectedOption: number }[]
  ) {
    return MVP1ApiClient.request('POST', `/quizzes/${storyId}/submit`, { answers }, true);
  }

  /**
   * Get player quiz statistics
   */
  static async getQuizStats() {
    return MVP1ApiClient.request('GET', '/quizzes/stats', undefined, true);
  }

  /**
   * Get quiz leaderboard
   */
  static async getQuizLeaderboard(limit: number = 10, offset: number = 0) {
    return MVP1ApiClient.request(
      'GET',
      `/quizzes/leaderboard?limit=${limit}&offset=${offset}`,
      undefined,
      false
    );
  }

  // ==================== RESOURCES ====================

  /**
   * Get resource definitions
   */
  static async getResources() {
    return MVP1ApiClient.request('GET', '/resources', undefined, false);
  }

  /**
   * Get player resources
   */
  static async getPlayerResources() {
    return MVP1ApiClient.request('GET', '/resources/my-resources', undefined, true);
  }

  /**
   * Harvest resources
   */
  static async harvestResources(resourceType: string) {
    return MVP1ApiClient.request('POST', '/resources/harvest', { resourceType }, true);
  }

  /**
   * Get resource leaderboard
   */
  static async getResourceLeaderboard(
    type: string = 'gold',
    limit: number = 10,
    offset: number = 0
  ) {
    return MVP1ApiClient.request(
      'GET',
      `/resources/leaderboard?type=${type}&limit=${limit}&offset=${offset}`,
      undefined,
      false
    );
  }

  // ==================== HEROES ====================

  /**
   * Get all heroes
   */
  static async getHeroes() {
    return MVP1ApiClient.request('GET', '/heroes', undefined, false);
  }

  /**
   * Get player heroes
   */
  static async getPlayerHeroes() {
    return MVP1ApiClient.request('GET', '/heroes/my-heroes', undefined, true);
  }

  /**
   * Recruit a hero
   */
  static async recruitHero(heroType: string) {
    return MVP1ApiClient.request('POST', '/heroes/recruit', { heroType }, true);
  }

  /**
   * Deploy hero to province
   */
  static async deployHero(heroId: string, provinceId: string) {
    return MVP1ApiClient.request('POST', '/heroes/deploy', { heroId, provinceId }, true);
  }

  /**
   * Get hero leaderboard
   */
  static async getHeroLeaderboard(limit: number = 10, offset: number = 0) {
    return MVP1ApiClient.request(
      'GET',
      `/heroes/leaderboard?limit=${limit}&offset=${offset}`,
      undefined,
      false
    );
  }

  // ==================== PROVINCES ====================

  /**
   * Get all provinces
   */
  static async getProvinces() {
    return MVP1ApiClient.request('GET', '/provinces', undefined, false);
  }

  /**
   * Get province details
   */
  static async getProvinceDetail(provinceId: string) {
    return MVP1ApiClient.request('GET', `/provinces/${provinceId}`, undefined, false);
  }

  /**
   * Get player provinces
   */
  static async getPlayerProvinces() {
    return MVP1ApiClient.request('GET', '/provinces/my-provinces', undefined, true);
  }

  /**
   * Upgrade farmer level
   */
  static async upgradeFarmer(provinceId: string) {
    return MVP1ApiClient.request(
      'POST',
      `/provinces/${provinceId}/upgrade/farmer`,
      {},
      true
    );
  }

  /**
   * Upgrade resource production
   */
  static async upgradeResource(provinceId: string) {
    return MVP1ApiClient.request(
      'POST',
      `/provinces/${provinceId}/upgrade/resource`,
      {},
      true
    );
  }

  /**
   * Upgrade development level
   */
  static async upgradeDevelopment(provinceId: string) {
    return MVP1ApiClient.request(
      'POST',
      `/provinces/${provinceId}/upgrade/development`,
      {},
      true
    );
  }

  // ==================== GAME DATA ====================

  /**
   * Get full game configuration
   */
  static async getGameData() {
    return MVP1ApiClient.request('GET', '/game-data', undefined, false);
  }

  /**
   * Get simplified game config
   */
  static async getConfig() {
    return MVP1ApiClient.request('GET', '/config', undefined, false);
  }

  // ==================== PETS ====================

  /**
   * Get player's pets
   */
  static async getPets() {
    return MVP1ApiClient.request('GET', '/pets/my-pets', undefined, true);
  }

  // ==================== ACHIEVEMENTS ====================

  /**
   * Get player's achievements
   */
  static async getAchievements() {
    return MVP1ApiClient.request('GET', '/achievements/my-achievements', undefined, true);
  }

  // ==================== BATTLES ====================

  /**
   * Get player's battle history
   */
  static async getBattles() {
    return MVP1ApiClient.request('GET', '/battles/my-battles', undefined, true);
  }

  /**
   * Start a new battle
   */
  static async startBattle(opponentId: string, battleType: string = 'pvp') {
    return MVP1ApiClient.request('POST', '/battles/start', { opponentId, battleType }, true);
  }

  // ==================== GUILDS ====================

  /**
   * Get player's guild information
   */
  static async getMyGuild() {
    return MVP1ApiClient.request('GET', '/guilds/my-guild', undefined, true);
  }

  /**
   * Create a new guild
   */
  static async createGuild(name: string, description?: string) {
    return MVP1ApiClient.request('POST', '/guilds/create', { name, description }, true);
  }

  /**
   * Join a guild
   */
  static async joinGuild(guildId: string) {
    return MVP1ApiClient.request('POST', '/guilds/join', { guildId }, true);
  }

  /**
   * Leave current guild
   */
  static async leaveGuild() {
    return MVP1ApiClient.request('POST', '/guilds/leave', {}, true);
  }

  // ==================== NAVIGATION ====================

  /**
   * Get player navigation items based on level and progress
   */
  static async getPlayerNavigation() {
    return MVP1ApiClient.request('GET', '/navigation/player', undefined, true);
  }

  // ==================== AUTHENTICATION ====================

  /**
   * Login with email and password
   */
  static async login(email: string, password: string) {
    return MVP1ApiClient.request('POST', '/auth/login', { email, password }, false);
  }

  /**
   * Register a new user
   */
  static async register(email: string, password: string, username: string) {
    return MVP1ApiClient.request('POST', '/auth/register', { email, password, username }, false);
  }

  /**
   * Google OAuth authentication
   */
  static async googleAuth(credential: string) {
    return MVP1ApiClient.request('POST', '/auth/google', { credential }, false);
  }
}

export default MVP1ApiClient;
