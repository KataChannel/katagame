/**
 * Database Initialization Utility
 * Provides consistent database initialization for all API endpoints
 */

import { ApiLogger } from '../api.utils'
import { errorResponse } from './response.wrapper'

/**
 * Initialize database with proper error handling
 * Returns error response if database init fails, null if successful
 */
export async function ensureDatabaseInitialized(): Promise<any> {
  try {
    const { initDatabase } = await import('../services/database.service')
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame'
    await initDatabase(databaseUrl)
    return null // success
  } catch (dbError) {
    ApiLogger.error('Database initialization error', dbError)
    return errorResponse(500, 'Database initialization failed')
  }
}

/**
 * Initialize services after database is ready
 * Returns { authService, playerService } on success or { error } on failure
 */
export async function initializeServices(): Promise<{ authService?: any; playerService?: any; error?: any }> {
  try {
    const { getAuthService } = await import('../services/auth.service')
    const { getPlayerService } = await import('../services/player.service')

    return {
      authService: getAuthService(),
      playerService: getPlayerService(),
    }
  } catch (serviceError) {
    ApiLogger.error('Service initialization error', serviceError)
    return {
      error: errorResponse(500, 'Service initialization failed'),
    }
  }
}

/**
 * Complete database and service initialization
 * Returns error response if either step fails, otherwise returns initialized services
 */
export async function initializeDatabaseAndServices(): Promise<{
  authService?: any
  playerService?: any
  error?: any
}> {
  // Step 1: Initialize database
  const dbError = await ensureDatabaseInitialized()
  if (dbError) {
    return { error: dbError }
  }

  // Step 2: Initialize services
  return await initializeServices()
}
