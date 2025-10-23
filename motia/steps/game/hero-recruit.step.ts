import { getAuthService } from '../../src/services/auth.service'
import { getPlayerService } from '../../src/services/player.service'
import { getDatabase } from '../../src/services/database.service'
import { successResponse, errorResponse } from '../../src/utils/response.wrapper'

/**
 * API Endpoint: POST /api/v1/heroes/recruit
 * Recruit a hero for the player
 */
export const config = {
  type: 'api',
  method: 'POST',
  path: '/api/v1/heroes/recruit',
  name: 'RecruitHeroHandler',
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
    const { heroId } = request.body

    if (!heroId) {
      return errorResponse(400, 'Hero ID is required')
    }

    const authService = getAuthService()
    const playerService = getPlayerService()
    const db = getDatabase()

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

    // Get hero to recruit
    const heroResult = await db.query('SELECT * FROM heroes WHERE id = $1', [heroId])
    const hero = heroResult?.rows?.[0]

    if (!hero) {
      return errorResponse(404, 'Hero not found')
    }

    // Check if player has enough gold
    if (player.resources.gold < hero.recruit_cost) {
      return errorResponse(400, 'Insufficient gold')
    }

    // Add hero to player inventory
    const playerHeroResult = await db.insert('player_heroes', {
      player_id: player.id,
      hero_id: heroId,
      level: 1,
      experience: 0,
      recruited_at: new Date(),
    })

    if (!playerHeroResult) {
      return errorResponse(400, 'Failed to recruit hero')
    }

    // Deduct cost from player
    const newGold = player.resources.gold - hero.recruit_cost
    await playerService.updateResources(decoded.playerId, {
      gold: newGold,
    })

    return successResponse({
      heroId: hero.id,
      heroName: hero.name,
      costDeducted: hero.recruit_cost,
      remainingGold: newGold,
    }, 'Hero recruited successfully')
  } catch (error: any) {
    console.error('Recruit hero error:', error)
    return errorResponse(500, error.message || 'Failed to recruit hero')
  }
}
