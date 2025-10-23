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

    // Initialize database
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame'
    try {
      getDatabase()
    } catch {
      await initDatabase(databaseUrl)
    }

    const db = getDatabase()

    // Get player provinces
    const result = await db.query(
      `SELECT 
        pp.id,
        pp.province_id,
        p.name,
        p.region,
        pp.farmer_level,
        pp.resource_level,
        pp.development_level,
        pp.created_at
      FROM player_provinces pp
      JOIN provinces p ON pp.province_id = p.id
      WHERE pp.player_id = $1
      ORDER BY pp.created_at ASC`,
      [decoded.playerId]
    )

    const provinces = result.rows.map((row: any) => ({
      playerProvinceId: row.id,
      provinceId: row.province_id,
      name: row.name,
      region: row.region,
      farmerLevel: row.farmer_level,
      resourceLevel: row.resource_level,
      developmentLevel: row.development_level,
      createdAt: row.created_at,
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
  } catch (error) {
    return {
      status: 500,
      body: wrapResponse(500, { success: false, message: 'Internal server error' }),
    }
  }
}

export { config, handler }
