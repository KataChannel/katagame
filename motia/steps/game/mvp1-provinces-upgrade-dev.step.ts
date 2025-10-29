import { wrapResponse } from '../../src/utils/response.wrapper'
import { getAuthService } from '../../src/services/auth.service'
import { getDatabase, initDatabase } from '../../src/services/database.service'

const MVP1_CONFIG = require('../../src/config/mvp1.config').default

const config = {
  type: 'api' as const,
  method: 'POST',
  path: '/api/v1/provinces/:provinceId/upgrade/development',
  name: 'MVP1 Upgrade Development',
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

    const provinceId = request.params?.provinceId
    if (!provinceId) {
      return {
        status: 400,
        body: wrapResponse(400, { success: false, message: 'Province ID is required' }),
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

    // Check province ownership
    const provinceResult = await db.query(
      `SELECT development_level FROM player_provinces
      WHERE player_id = $1 AND province_id = $2`,
      [decoded.playerId, provinceId]
    )

    if (provinceResult.rows.length === 0) {
      return {
        status: 404,
        body: wrapResponse(404, { success: false, message: 'Province not found' }),
      }
    }

    const currentLevel = provinceResult.rows[0].development_level

    // Calculate cost
    const DEV_CONFIG = MVP1_CONFIG.PROVINCE_CONFIG?.UPGRADES?.DEVELOPMENT || {}
    const upgradeCost = (DEV_CONFIG[`level_${currentLevel + 1}`]?.cost) || {
      gold: 1000 * (currentLevel + 1),
      rice: 600 * (currentLevel + 1),
      wood: 500 * (currentLevel + 1),
    }

    // Check resources
    const resourceResult = await db.query(
      `SELECT resource_type, amount FROM player_resources
      WHERE player_id = $1 AND resource_type IN ('gold', 'rice', 'wood')`,
      [decoded.playerId]
    )

    const resources: any = {}
    resourceResult.rows.forEach((r: any) => {
      resources[r.resource_type] = parseInt(r.amount) || 0
    })

    if (
      (resources.gold || 0) < upgradeCost.gold ||
      (resources.rice || 0) < upgradeCost.rice ||
      (resources.wood || 0) < upgradeCost.wood
    ) {
      return {
        status: 400,
        body: wrapResponse(400, { success: false, message: 'Insufficient resources' }),
      }
    }

    // Begin transaction
    await db.query('BEGIN')

    try {
      // Upgrade development
      await db.query(
        `UPDATE player_provinces
        SET development_level = development_level + 1
        WHERE player_id = $1 AND province_id = $2`,
        [decoded.playerId, provinceId]
      )

      // Deduct cost
      for (const [resourceType, amount] of Object.entries(upgradeCost)) {
        if ((amount as number) > 0) {
          await db.query(
            `UPDATE player_resources
            SET amount = amount - $1
            WHERE player_id = $2 AND resource_type = $3`,
            [amount, decoded.playerId, resourceType]
          )
        }
      }

      await db.query('COMMIT')

      return {
        status: 200,
        body: wrapResponse(200, {
          success: true,
          data: {
            provinceId,
            developmentLevel: currentLevel + 1,
            costDeducted: upgradeCost,
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
