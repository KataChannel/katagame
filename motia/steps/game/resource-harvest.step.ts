import { getAuthService } from '../../src/services/auth.service'
import { getPlayerService } from '../../src/services/player.service'
import { successResponse, errorResponse } from '../../src/utils/response.wrapper'

/**
 * API Endpoint: GET /api/v1/resources/harvest
 * Harvest resources (passive income)
 */
export const config = {
  type: 'api',
  method: 'GET',
  path: '/api/v1/resources/harvest',
  name: 'HarvestResourcesHandler',
  flows: ['game-flow'],
  emits: [],
}

export const handler = async (request: any) => {
  try {
    // Initialize database first
    const { initDatabase, getDatabase } = await import('../../src/services/database.service')
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame'
    try {
      getDatabase()
    } catch {
      await initDatabase(databaseUrl)
    }

    const authHeader = request.headers?.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(401, 'No token provided')
    }

    const token = authHeader.substring(7)

    const authService = getAuthService()
    const playerService = getPlayerService()

    // Verify token
    const decoded = authService.verifyToken(token)
    if (!decoded) {
      return errorResponse(401, 'Invalid token')
    }

    // Get player
    const player = await playerService.getPlayer(decoded.playerId)
    if (!player) {
      return errorResponse(404, 'Player not found')
    }

    // Base harvest amounts (per 10 minutes)
    const harvestAmount = {
      gold: 50,
      rice: 30,
      lumber: 20,
      stone: 25,
      culture: 10,
      gems: 2,
    }

    // Add resources to player
    const updated = await playerService.updateResources(decoded.playerId, harvestAmount)

    if (!updated) {
      return errorResponse(400, 'Failed to harvest resources')
    }

    return successResponse({
      harvested: harvestAmount,
      totalResources: updated.resources,
    }, 'Resources harvested')
  } catch (error: any) {
    console.error('Harvest resources error:', error)
    return errorResponse(500, error.message || 'Failed to harvest resources')
  }
}
