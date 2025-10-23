import { getAuthService } from '../../src/services/auth.service'
import { getPlayerService } from '../../src/services/player.service'
import { successResponse, errorResponse } from '../../src/utils/response.wrapper'

/**
 * API Endpoint: POST /api/v1/resources/trade
 * Trade resources between player and NPCs
 */
export const config = {
  type: 'api',
  method: 'POST',
  path: '/api/v1/resources/trade',
  name: 'TradeResourcesHandler',
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
    const { fromResource, toResource, amount } = request.body

    if (!fromResource || !toResource || !amount || amount <= 0) {
      return errorResponse(400, 'Invalid trade parameters')
    }

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

    // Check if player has enough resources
    const resourceValue = player.resources[fromResource as keyof typeof player.resources]
    if (!resourceValue || resourceValue < amount) {
      return errorResponse(400, 'Insufficient resources')
    }

    // Trade rates (1:1 base rate, can be adjusted)
    const tradeRate = 1.0
    const receivedAmount = Math.floor(amount * tradeRate)

    // Update resources
    const updates = {
      [fromResource]: (player.resources[fromResource as keyof typeof player.resources] || 0) - amount,
      [toResource]: (player.resources[toResource as keyof typeof player.resources] || 0) + receivedAmount,
    }

    const updated = await playerService.updateResources(decoded.playerId, updates)

    if (!updated) {
      return errorResponse(400, 'Failed to complete trade')
    }

    return successResponse({
      traded: {
        from: fromResource,
        amount: amount,
        to: toResource,
        received: receivedAmount,
      },
      totalResources: updated.resources,
    }, 'Trade completed')
  } catch (error: any) {
    console.error('Trade resources error:', error)
    return errorResponse(500, error.message || 'Failed to trade resources')
  }
}
