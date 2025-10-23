import { wrapResponse } from '../../src/utils/response.wrapper'
import { getAuthService } from '../../src/services/auth.service'
import { getDatabase, initDatabase } from '../../src/services/database.service'

const MVP1_CONFIG = require('../../src/config/mvp1.config').default

const config = {
  type: 'api' as const,
  method: 'POST',
  path: '/api/v1/heroes/recruit',
  name: 'MVP1 Recruit Hero',
  flows: ['game-flow'],
  emits: [],
}

const handler = async (request: any) => {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return {
        status: 401,
        body: wrapResponse(401, { success: false, message: 'Unauthorized' }),
      }
    }

    const authService = getAuthService()
    const decoded = await authService.verifyToken(token)
    if (!decoded || !decoded.playerId) {
      return {
        status: 401,
        body: wrapResponse(401, { success: false, message: 'Invalid token' }),
      }
    }

    const { heroType } = request.body
    if (!heroType) {
      return {
        status: 400,
        body: wrapResponse(400, { success: false, message: 'heroType is required' }),
      }
    }

    // Initialize database
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame'
    try {
      getDatabase()
    } catch {
      await initDatabase(databaseUrl)
    }

    const db = getDatabase()

    // Check hero config
    const heroConfig = MVP1_CONFIG.HERO_CONFIG[heroType]
    if (!heroConfig) {
      return {
        status: 400,
        body: wrapResponse(400, { success: false, message: 'Invalid hero type' }),
      }
    }

    // Check player resources
    const resourceResult = await db.query(
      `SELECT amount FROM player_resources
      WHERE player_id = $1 AND resource_type = 'gold'`,
      [decoded.playerId]
    )

    const playerGold = resourceResult.rows[0]?.amount || 0
    if (playerGold < heroConfig.recruit_cost) {
      return {
        status: 400,
        body: wrapResponse(400, {
          success: false,
          message: `Insufficient gold. Need ${heroConfig.recruit_cost}, have ${playerGold}`,
        }),
      }
    }

    // Begin transaction
    await db.query('BEGIN')

    try {
      // Create hero
      const heroResult = await db.query(
        `INSERT INTO player_heroes (player_id, hero_type, level, experience)
        VALUES ($1, $2, 1, 0)
        RETURNING id`,
        [decoded.playerId, heroType]
      )

      const heroId = heroResult.rows[0].id

      // Deduct cost
      await db.query(
        `UPDATE player_resources
        SET amount = amount - $1
        WHERE player_id = $2 AND resource_type = 'gold'`,
        [heroConfig.recruit_cost, decoded.playerId]
      )

      await db.query('COMMIT')

      return {
        status: 200,
        body: wrapResponse(200, {
          success: true,
          data: {
            heroId,
            heroType,
            level: 1,
            experience: 0,
            costDeducted: heroConfig.recruit_cost,
          },
        }),
      }
    } catch (error) {
      await db.query('ROLLBACK')
      throw error
    }
  } catch (error) {
    return {
      status: 500,
      body: wrapResponse(500, { success: false, message: 'Internal server error' }),
    }
  }
}

export { config, handler }
