import { getAuthService } from '../../src/services/auth.service'
import { getBattleService } from '../../src/services/battle.service'
import { getPlayerService } from '../../src/services/player.service'
import { successResponse, errorResponse } from '../../src/utils/response.wrapper'

/**
 * API Endpoint: POST /api/v1/battles/resolve
 * Completes a battle and awards rewards
 */
export const config = {
  type: 'api',
  method: 'POST',
  path: '/api/v1/battles/resolve',
  name: 'ResolveBattleHandler',
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
    const { battleId, result = 'attacker_win' } = request.body

    if (!battleId) {
      return errorResponse(400, 'Battle ID is required')
    }

    const authService = getAuthService()
    const battleService = getBattleService()
    const playerService = getPlayerService()

    // Verify token
    const decoded = authService.verifyToken(token)
    if (!decoded) {
      return errorResponse(401, 'Invalid token')
    }

    // Get battle
    const battle = await battleService.getBattle(battleId)
    if (!battle) {
      return errorResponse(404, 'Battle not found')
    }

    // Verify it's the player's battle
    if (battle.attacker_id !== decoded.playerId) {
      return errorResponse(403, 'Unauthorized')
    }

    // Calculate rewards based on result
    let attackerReward = { exp: 50, gold: 100, rating: 25 }
    let defenderReward = { exp: 25, gold: 50, rating: 10 }

    if (result === 'defender_win') {
      ;[attackerReward, defenderReward] = [defenderReward, attackerReward]
    } else if (result === 'draw') {
      attackerReward = { exp: 35, gold: 75, rating: 15 }
      defenderReward = { exp: 35, gold: 75, rating: 15 }
    }

    // Update battle result
    const updated = await battleService.updateBattle(
      battleId,
      result,
      attackerReward,
      defenderReward,
      300 // 5 minute battle duration
    )

    if (!updated) {
      return errorResponse(400, 'Failed to resolve battle')
    }

    // Award rewards to attacker (player)
    const playerRewards = result === 'defender_win' ? defenderReward : attackerReward
    await playerService.awardExperience(decoded.playerId, playerRewards.exp)
    await playerService.updateResources(decoded.playerId, {
      gold: (await playerService.getPlayer(decoded.playerId))?.resources.gold! + playerRewards.gold,
    })

    return successResponse({
      battleId: updated.id,
      result: updated.result,
      rewards: {
        exp: playerRewards.exp,
        gold: playerRewards.gold,
        rating: playerRewards.rating,
      },
    }, 'Battle resolved')
  } catch (error: any) {
    console.error('Resolve battle error:', error)
    return errorResponse(500, error.message || 'Failed to resolve battle')
  }
}
