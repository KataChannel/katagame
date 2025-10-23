import { wrapResponse } from '../../src/utils/response.wrapper'
import { getAuthService } from '../../src/services/auth.service'
import { getDatabase, initDatabase } from '../../src/services/database.service'

const MVP1_CONFIG = require('../../src/config/mvp1.config').default

const config = {
  type: 'api' as const,
  method: 'GET',
  path: '/api/v1/resources/my-resources',
  name: 'MVP1 Get Player Resources',
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

    // Get player resources
    const result = await db.query(
      `SELECT resource_type, amount
      FROM player_resources
      WHERE player_id = $1`,
      [decoded.playerId]
    )

    const resources = result.rows.reduce((acc: any, row: any) => {
      acc[row.resource_type] = parseInt(row.amount) || 0
      return acc
    }, {})

    return {
      status: 200,
      body: wrapResponse(200, {
        success: true,
        data: {
          playerId: decoded.playerId,
          resources: {
            gold: resources.gold || 0,
            rice: resources.rice || 0,
            wood: resources.wood || 0,
          },
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
