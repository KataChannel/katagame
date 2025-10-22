import { getAuthService } from '../../src/services/auth.service'
import { getPlayerService } from '../../src/services/player.service'

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
      initDatabase(databaseUrl)
    }

    const authHeader = request.headers?.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { status: 401, body: { success: false, message: 'No token provided' } }
    }

    const token = authHeader.substring(7)

    const authService = getAuthService()
    const playerService = getPlayerService()

    // Verify token
    const decoded = authService.verifyToken(token)
    if (!decoded) {
      return { status: 401, body: { success: false, message: 'Invalid token' } }
    }

    // Get player
    const player = await playerService.getPlayer(decoded.playerId)
    if (!player) {
      return { status: 404, body: { success: false, message: 'Player not found' } }
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
      return { status: 400, body: { success: false, message: 'Failed to harvest resources' } }
    }

    return {
      status: 200,
      body: {
        success: true,
        message: 'Resources harvested',
        data: {
          harvested: harvestAmount,
          totalResources: updated.resources,
        },
      },
    }
  } catch (error: any) {
    console.error('Harvest resources error:', error)
    return {
      status: 500,
      body: {
        success: false,
        message: error.message || 'Failed to harvest resources',
      },
    }
  }
}
