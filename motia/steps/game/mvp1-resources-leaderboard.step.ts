import { wrapResponse } from '../../src/utils/response.wrapper'
import { getDatabase, initDatabase } from '../../src/services/database.service'

const config = {
  type: 'api' as const,
  method: 'GET',
  path: '/api/v1/resources/leaderboard',
  name: 'MVP1 Get Resource Leaderboard',
  flows: ['game-flow'],
  emits: [],
}

const handler = async (request: any) => {
  try {
    const limit = Math.min(parseInt(request.query?.limit) || 10, 100)
    const offset = Math.max(parseInt(request.query?.offset) || 0, 0)
    const resourceType = request.query?.type || 'gold'

    if (!['gold', 'rice', 'wood'].includes(resourceType)) {
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

    // Get resource leaderboard
    const result = await db.query(
      `SELECT 
        p.id,
        p.username,
        pr.amount,
        ROW_NUMBER() OVER (ORDER BY pr.amount DESC) as rank
      FROM players p
      LEFT JOIN player_resources pr ON p.id = pr.player_id AND pr.resource_type = $1
      ORDER BY pr.amount DESC NULLS LAST
      LIMIT $2 OFFSET $3`,
      [resourceType, limit, offset]
    )

    const leaderboard = result.rows.map((row: any) => ({
      rank: row.rank,
      playerId: row.id,
      username: row.username,
      amount: parseInt(row.amount) || 0,
    }))

    return {
      status: 200,
      body: wrapResponse(200, {
        success: true,
        data: {
          resourceType,
          leaderboard,
          pagination: {
            limit,
            offset,
            total: leaderboard.length,
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
