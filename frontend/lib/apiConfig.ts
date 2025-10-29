/**
 * Centralized API Configuration
 * Single source of truth for all API endpoints
 */

// Base URL from environment (NO version path)
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:11001';

// API version
const API_VERSION = 'v1';

/**
 * Get full API base URL with version
 * @returns {string} Full API base URL (e.g., http://localhost:11001/api/v1)
 */
export function getApiBaseUrl(): string {
  return `${BASE_URL}/api/${API_VERSION}`;
}

/**
 * Get base URL without version (for special endpoints)
 * @returns {string} Base URL (e.g., http://localhost:11001)
 */
export function getBaseUrl(): string {
  return BASE_URL;
}

/**
 * Build full API endpoint URL
 * @param {string} endpoint - Endpoint path (should start with /)
 * @returns {string} Full URL
 * 
 * @example
 * buildApiUrl('/heroes/my-heroes') 
 * // Returns: http://localhost:11001/api/v1/heroes/my-heroes
 */
export function buildApiUrl(endpoint: string): string {
  // Ensure endpoint starts with /
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${getApiBaseUrl()}${path}`;
}

/**
 * Build auth endpoint URL (uses /api/v1/auth/...)
 * @param {string} endpoint - Auth endpoint (e.g., 'google', 'login')
 * @returns {string} Full auth URL
 * 
 * @example
 * buildAuthUrl('google')
 * // Returns: http://localhost:11001/api/v1/auth/google
 */
export function buildAuthUrl(endpoint: string): string {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${getApiBaseUrl()}/auth${path}`;
}

/**
 * API Configuration Constants
 */
export const API_CONFIG = {
  BASE_URL,
  API_VERSION,
  FULL_BASE_URL: getApiBaseUrl(),
  ENDPOINTS: {
    // Auth
    AUTH_LOGIN: buildAuthUrl('login'),
    AUTH_REGISTER: buildAuthUrl('register'),
    AUTH_GOOGLE: buildAuthUrl('google'),
    
    // Heroes
    HEROES_MY: buildApiUrl('/heroes/my-heroes'),
    HEROES_ALL: buildApiUrl('/heroes'),
    
    // Provinces
    PROVINCES_MY: buildApiUrl('/provinces/my-provinces'),
    PROVINCES_ALL: buildApiUrl('/provinces'),
    
    // Resources
    RESOURCES_MY: buildApiUrl('/resources/my-resources'),
    
    // Navigation
    NAVIGATION_PLAYER: buildApiUrl('/navigation/player'),
    
    // Pets
    PETS_MY: buildApiUrl('/pets/my-pets'),
    
    // Achievements
    ACHIEVEMENTS_MY: buildApiUrl('/achievements/my-achievements'),
    
    // Battles
    BATTLES_MY: buildApiUrl('/battles/my-battles'),
    BATTLES_START: buildApiUrl('/battles/start'),
    
    // Guilds
    GUILDS_MY: buildApiUrl('/guilds/my-guild'),
    GUILDS_CREATE: buildApiUrl('/guilds/create'),
    GUILDS_JOIN: buildApiUrl('/guilds/join'),
    GUILDS_LEAVE: buildApiUrl('/guilds/leave'),
  }
} as const;

export default API_CONFIG;
