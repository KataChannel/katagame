import { getPlayerService } from '../../src/services/player.service'
import { successResponse, errorResponse } from '../../src/utils/response.wrapper'

/**
 * API Endpoint: GET /api/v1/players/:id/profile
 * Gets public player profile
 */
export const config = {
  type: 'api',
  method: 'GET',
  path: '/api/v1/players/:id/profile',
  name: 'GetPlayerProfileHandler',
  flows: ['game-flow'],
  emits: [],
}

export const handler = async (request: any) => {
  try {
    const { id } = request.params

    if (!id) {
      return errorResponse(400, 'Player ID is required')
    }

    const playerService = getPlayerService()
    const player = await playerService.getPlayer(id)

    if (!player) {
      return errorResponse(404, 'Player not found')
    }

    return successResponse({
      id: player.id,
      username: player.username,
      level: player.level,
      experience: player.experience,
      joinedDate: player.created_at,
    }, 'Player profile retrieved')
  } catch (error: any) {
    console.error('Get player profile error:', error)
    return errorResponse(500, error.message || 'Failed to get player profile')
  }
}
