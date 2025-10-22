import { getPlayerService } from '../../src/services/player.service'

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
      return { status: 400, body: { success: false, message: 'Player ID is required' } }
    }

    const playerService = getPlayerService()
    const player = await playerService.getPlayer(id)

    if (!player) {
      return { status: 404, body: { success: false, message: 'Player not found' } }
    }

    return {
      status: 200,
      body: {
        success: true,
        message: 'Player profile retrieved',
        data: {
          id: player.id,
          username: player.username,
          level: player.level,
          experience: player.experience,
          joinedDate: player.created_at,
        },
      },
    }
  } catch (error: any) {
    console.error('Get player profile error:', error)
    return {
      status: 500,
      body: {
        success: false,
        message: error.message || 'Failed to get player profile',
      },
    }
  }
}
