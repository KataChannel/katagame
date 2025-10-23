import { wrapResponse } from '../../src/utils/response.wrapper'
import { getAuthService } from '../../src/services/auth.service'
import { getDatabase, initDatabase } from '../../src/services/database.service'

const config = {
  type: 'api' as const,
  method: 'POST',
  path: '/api/v1/heroes/deploy',
  name: 'MVP1 Deploy Hero',
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

    const { heroId, provinceId } = request.body
    if (!heroId || !provinceId) {
      return {
        status: 400,
        body: wrapResponse(400, { success: false, message: 'heroId and provinceId are required' }),
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

    // Verify hero ownership
    const heroResult = await db.query(
      `SELECT id FROM player_heroes
      WHERE id = $1 AND player_id = $2`,
      [heroId, decoded.playerId]
    )

    if (heroResult.rows.length === 0) {
      return {
        status: 404,
        body: wrapResponse(404, { success: false, message: 'Hero not found' }),
      }
    }

    // Verify province ownership
    const provinceResult = await db.query(
      `SELECT id FROM player_provinces
      WHERE id = $1 AND player_id = $2`,
      [provinceId, decoded.playerId]
    )

    if (provinceResult.rows.length === 0) {
      return {
        status: 404,
        body: wrapResponse(404, { success: false, message: 'Province not found' }),
      }
    }

    // Deploy hero
    await db.query(
      `UPDATE player_heroes
      SET is_deployed = true, deployed_at = NOW()
      WHERE id = $1`,
      [heroId]
    )

    return {
      status: 200,
      body: wrapResponse(200, {
        success: true,
        data: {
          heroId,
          provinceId,
          deployedAt: new Date(),
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
