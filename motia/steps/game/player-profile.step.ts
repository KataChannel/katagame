import { getAuthService } from '../../src/services/auth.service'
import { getPlayerService } from '../../src/services/player.service'

/**
 * API Endpoint: GET /api/v1/players/me
 * Gets the current player's profile
 */
export const config = {
  type: 'api',
  method: 'GET',
  path: '/api/v1/players/me',
  name: 'GetCurrentPlayerHandler',
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

    return {
      status: 200,
      body: {
        success: true,
        data: {
          id: player.id,
          username: player.username,
          email: player.email,
          level: player.level,
          experience: player.experience,
          resources: player.resources,
          status: player.status,
          created_at: player.created_at,
          last_login: player.last_login,
        },
      },
    }
  } catch (error: any) {
    console.error('Get player error:', error)
    return {
      success: false,
      message: error.message || 'Failed to get player',
      status: 500,
    }
  }
}
