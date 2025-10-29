import { wrapResponse } from '../../src/utils/response.wrapper'
import { getAuthService } from '../../src/services/auth.service'
import { getDatabase, initDatabase } from '../../src/services/database.service'

const MVP1_CONFIG = require('../../src/config/mvp1.config').default

const config = {
  type: 'api' as const,
  method: 'POST',
  path: '/api/v1/provinces/:provinceId/upgrade/farmer',
  name: 'MVP1 Upgrade Farmer',
  flows: ['game-flow'],
  emits: [],
}

const handler = async (request: any) => {
  try {
    console.log('=== UPGRADE FARMER DEBUG ===');
    console.log('request.params:', request.params);
    console.log('typeof request.params:', typeof request.params);
    console.log('request keys:', Object.keys(request || {}).join(', '));
    
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
    console.log('🔍 Extracted provinceId:', provinceId);
    
    if (!provinceId) {
      console.error('❌ Province ID missing! request.params:', request.params);
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
      `SELECT farmer_level FROM player_provinces
      WHERE player_id = $1 AND province_id = $2`,
      [decoded.playerId, provinceId]
    )

    if (provinceResult.rows.length === 0) {
      return {
        status: 404,
        body: wrapResponse(404, { success: false, message: 'Province not found' }),
      }
    }

    const currentLevel = provinceResult.rows[0].farmer_level

    // Calculate cost
    const FARMER_CONFIG = MVP1_CONFIG.PROVINCE_CONFIG?.UPGRADES?.FARMER || {}
    const upgradeCost = (FARMER_CONFIG[`level_${currentLevel + 1}`]?.cost) || {
      gold: 500 * (currentLevel + 1),
      rice: 300 * (currentLevel + 1),
    }

    // Check resources
    const resourceResult = await db.query(
      `SELECT resource_type, amount FROM player_resources
      WHERE player_id = $1 AND resource_type IN ('gold', 'rice')`,
      [decoded.playerId]
    )

    const resources: any = {}
    resourceResult.rows.forEach((r: any) => {
      resources[r.resource_type] = parseInt(r.amount) || 0
    })

    if ((resources.gold || 0) < upgradeCost.gold || (resources.rice || 0) < upgradeCost.rice) {
      return {
        status: 400,
        body: wrapResponse(400, { success: false, message: 'Insufficient resources' }),
      }
    }

    // Begin transaction
    await db.query('BEGIN')

    try {
      // Upgrade farmer
      await db.query(
        `UPDATE player_provinces
        SET farmer_level = farmer_level + 1
        WHERE player_id = $1 AND province_id = $2`,
        [decoded.playerId, provinceId]
      )

      // Deduct cost
      await db.query(
        `UPDATE player_resources
        SET amount = amount - $1
        WHERE player_id = $2 AND resource_type = 'gold'`,
        [upgradeCost.gold, decoded.playerId]
      )

      await db.query(
        `UPDATE player_resources
        SET amount = amount - $1
        WHERE player_id = $2 AND resource_type = 'rice'`,
        [upgradeCost.rice, decoded.playerId]
      )

      await db.query('COMMIT')

      return {
        status: 200,
        body: wrapResponse(200, {
          success: true,
          data: {
            provinceId,
            farmerLevel: currentLevel + 1,
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
