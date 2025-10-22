import { getAuthService } from '../../src/services/auth.service'
import { getBattleService } from '../../src/services/battle.service'
import { getPlayerService } from '../../src/services/player.service'

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
      return { status: 401, body: { success: false, message: 'No token provided' } }
    }

    const token = authHeader.substring(7)
    const { battleId, result = 'attacker_win' } = request.body

    if (!battleId) {
      return { status: 400, body: { success: false, message: 'Battle ID is required' } }
    }

    const authService = getAuthService()
    const battleService = getBattleService()
    const playerService = getPlayerService()

    // Verify token
    const decoded = authService.verifyToken(token)
    if (!decoded) {
      return { status: 401, body: { success: false, message: 'Invalid token' } }
    }

    // Get battle
    const battle = await battleService.getBattle(battleId)
    if (!battle) {
      return { status: 404, body: { success: false, message: 'Battle not found' } }
    }

    // Verify it's the player's battle
    if (battle.attacker_id !== decoded.playerId) {
      return { status: 403, body: { success: false, message: 'Unauthorized' } }
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
      return { status: 400, body: { success: false, message: 'Failed to resolve battle' } }
    }

    // Award rewards to attacker (player)
    const playerRewards = result === 'defender_win' ? defenderReward : attackerReward
    await playerService.awardExperience(decoded.playerId, playerRewards.exp)
    await playerService.updateResources(decoded.playerId, {
      gold: (await playerService.getPlayer(decoded.playerId))?.resources.gold! + playerRewards.gold,
    })

    return {
      status: 200,
      body: {
        success: true,
        message: 'Battle resolved',
        data: {
          battleId: updated.id,
          result: updated.result,
          rewards: {
            exp: playerRewards.exp,
            gold: playerRewards.gold,
            rating: playerRewards.rating,
          },
        },
      },
    }
  } catch (error: any) {
    console.error('Resolve battle error:', error)
    return {
      status: 500,
      body: {
        success: false,
        message: error.message || 'Failed to resolve battle',
      },
    }
  }
}
