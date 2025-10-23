import { wrapResponse } from '../../src/utils/response.wrapper'
import { getAuthService } from '../../src/services/auth.service'
import { getDatabase, initDatabase } from '../../src/services/database.service'

const MVP1_CONFIG = require('../../src/config/mvp1.config').default

const config = {
  type: 'api' as const,
  method: 'POST',
  path: '/api/v1/resources/harvest',
  name: 'MVP1 Harvest Resources',
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

    const { resourceType } = request.body
    if (!resourceType || !['gold', 'rice', 'wood'].includes(resourceType)) {
      return {
        status: 400,
        body: wrapResponse(400, { success: false, message: 'Invalid resource type' }),
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

    // Check cooldown
    const cooldownResult = await db.query(
      `SELECT last_harvest_at FROM player_resources
      WHERE player_id = $1 AND resource_type = $2`,
      [decoded.playerId, resourceType]
    )

    if (cooldownResult.rows.length > 0) {
      const lastHarvest = new Date(cooldownResult.rows[0].last_harvest_at)
      const cooldown = MVP1_CONFIG.RESOURCE_CONFIG[resourceType]?.harvest_cooldown || 3600
      const now = new Date()
      const timeSinceHarvest = (now.getTime() - lastHarvest.getTime()) / 1000

      if (timeSinceHarvest < cooldown) {
        return {
          status: 429,
          body: wrapResponse(429, {
            success: false,
            message: `Resource on cooldown. Try again in ${Math.ceil(cooldown - timeSinceHarvest)}s`,
          }),
        }
      }
    }

    // Calculate harvest amount
    const baseAmount = MVP1_CONFIG.RESOURCE_CONFIG[resourceType]?.base_harvest || 100

    // Update resource
    await db.query(
      `INSERT INTO player_resources (player_id, resource_type, amount, last_harvest_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (player_id, resource_type) DO UPDATE
      SET amount = player_resources.amount + $3, last_harvest_at = NOW()`,
      [decoded.playerId, resourceType, baseAmount]
    )

    return {
      status: 200,
      body: wrapResponse(200, {
        success: true,
        data: {
          resourceType,
          harvestedAmount: baseAmount,
          nextHarvestAt: new Date(Date.now() + (MVP1_CONFIG.RESOURCE_CONFIG[resourceType]?.harvest_cooldown || 3600) * 1000),
        },
      }),
    }
  } catch (error) {
    return {
      status: 500,
      body: wrapResponse(500, { success: false, message: 'Internal server error' }),
    }
  }
}

export { config, handler }
