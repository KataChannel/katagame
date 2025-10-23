import { getAuthService } from '../../src/services/auth.service'
import { getPlayerService } from '../../src/services/player.service'
import { successResponse, errorResponse } from '../../src/utils/response.wrapper'

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
      return errorResponse(401, 'No token provided')
    }

    const token = authHeader.substring(7)
    const { username } = request.body

    if (!username || username.length < 3) {
      return errorResponse(400, 'Username must be at least 3 characters')
    }

    const authService = getAuthService()
    const playerService = getPlayerService()

    // Verify token
    const decoded = authService.verifyToken(token)
    if (!decoded) {
      return errorResponse(401, 'Invalid token')
    }

    // Update player
    const updated = await playerService.updatePlayer(decoded.playerId, {
      username,
    })

    if (!updated) {
      return errorResponse(400, 'Failed to update player')
    }

    return successResponse({
      id: updated.id,
      username: updated.username,
      email: updated.email,
      level: updated.level,
      experience: updated.experience,
    }, 'Player updated successfully')
  } catch (error: any) {
    console.error('Update player error:', error)
    return errorResponse(500, error.message || 'Failed to update player')
  }
}
