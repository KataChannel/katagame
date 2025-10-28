import { wrapResponse } from '../../src/utils/response.wrapper'
import { getAuthService } from '../../src/services/auth.service'
import { getDatabase, initDatabase } from '../../src/services/database.service'

const config = {
  type: 'api' as const,
  method: 'GET',
  path: '/api/v1/provinces/my-provinces',
  name: 'MVP1 Get Player Provinces',
  flows: ['game-flow'],
  emits: [],
}

const handler = async (request: any) => {
  try {
    // Initialize database FIRST
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame'
    try {
      getDatabase()
    } catch {
      await initDatabase(databaseUrl)
    }

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

    const db = getDatabase()

    // Get player provinces
    const result = await db.query(
      `SELECT 
        pp.id,
        pp.province_id,
        p.name,
        pp.level,
        pp.max_level,
        pp.resources,
        p.base_gold_rate,
        p.base_culture_rate,
        pp.discovered_at
      FROM player_provinces pp
      JOIN provinces p ON pp.province_id = p.id
      WHERE pp.player_id = $1
      ORDER BY pp.discovered_at ASC`,
      [decoded.playerId]
    )

    const provinces = result.rows.map((row: any) => ({
      playerProvinceId: row.id,
      provinceId: row.province_id,
      name: row.name,
      level: row.level,
      maxLevel: row.max_level,
      resources: row.resources,
      baseGoldRate: row.base_gold_rate,
      baseCultureRate: row.base_culture_rate,
      discoveredAt: row.discovered_at,
    }))

    return {
      status: 200,
      body: wrapResponse(200, {
        success: true,
        data: {
          playerId: decoded.playerId,
          provinces,
          totalProvinces: provinces.length,
        },
      }),
    }
  } catch (error: any) {
    console.error('Error getting player provinces:', error?.message || error, error?.stack || '')
    return {
      status: 500,
      body: wrapResponse(500, { success: false, message: `Internal server error: ${error?.message || 'Unknown'}` }),
    }
  }
}

export { config, handler }
