import { getAuthService } from '../../src/services/auth.service'
import { getPlayerService } from '../../src/services/player.service'

/**
 * API Endpoint: PUT /api/v1/players/update
 * Updates current player's profile
 */
export const config = {
  type: 'api',
  method: 'PUT',
  path: '/api/v1/players/update',
  name: 'UpdatePlayerHandler',
  flows: ['game-flow'],
  emits: [],
}

export const handler = async (request: any) => {
  try {
    const authHeader = request.headers?.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { status: 401, body: { success: false, message: 'No token provided' } }
    }

    const token = authHeader.substring(7)
    const { username } = request.body

    if (!username || username.length < 3) {
      return { status: 400, body: { success: false, message: 'Username must be at least 3 characters' } }
    }

    const authService = getAuthService()
    const playerService = getPlayerService()

    // Verify token
    const decoded = authService.verifyToken(token)
    if (!decoded) {
      return { status: 401, body: { success: false, message: 'Invalid token' } }
    }

    // Update player
    const updated = await playerService.updatePlayer(decoded.playerId, {
      username,
    })

    if (!updated) {
      return { status: 400, body: { success: false, message: 'Failed to update player' } }
    }

    return {
      status: 200,
      body: {
        success: true,
        message: 'Player updated successfully',
        data: {
          id: updated.id,
          username: updated.username,
          email: updated.email,
          level: updated.level,
          experience: updated.experience,
        },
      },
    }
  } catch (error: any) {
    console.error('Update player error:', error)
    return {
      status: 500,
      body: {
        success: false,
        message: error.message || 'Failed to update player',
      },
    }
  }
}
