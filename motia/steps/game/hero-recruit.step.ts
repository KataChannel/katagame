import { getAuthService } from '../../src/services/auth.service'
import { getPlayerService } from '../../src/services/player.service'
import { getDatabase } from '../../src/services/database.service'

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
      return { status: 401, body: { success: false, message: 'No token provided' } }
    }

    const token = authHeader.substring(7)
    const { heroId } = request.body

    if (!heroId) {
      return { status: 400, body: { success: false, message: 'Hero ID is required' } }
    }

    const authService = getAuthService()
    const playerService = getPlayerService()
    const db = getDatabase()

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

    // Get hero to recruit
    const heroResult = await db.query('SELECT * FROM heroes WHERE id = $1', [heroId])
    const hero = heroResult?.rows?.[0]

    if (!hero) {
      return { status: 404, body: { success: false, message: 'Hero not found' } }
    }

    // Check if player has enough gold
    if (player.resources.gold < hero.recruit_cost) {
      return { status: 400, body: { success: false, message: 'Insufficient gold' } }
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
      return { status: 400, body: { success: false, message: 'Failed to recruit hero' } }
    }

    // Deduct cost from player
    const newGold = player.resources.gold - hero.recruit_cost
    await playerService.updateResources(decoded.playerId, {
      gold: newGold,
    })

    return {
      status: 200,
      body: {
        success: true,
        message: 'Hero recruited successfully',
        data: {
          heroId: hero.id,
          heroName: hero.name,
          costDeducted: hero.recruit_cost,
          remainingGold: newGold,
        },
      },
    }
  } catch (error: any) {
    console.error('Recruit hero error:', error)
    return {
      status: 500,
      body: {
        success: false,
        message: error.message || 'Failed to recruit hero',
      },
    }
  }
}
