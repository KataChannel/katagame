import { wrapResponse } from '../../src/utils/response.wrapper'
import { getDatabase, initDatabase } from '../../src/services/database.service'

const config = {
  type: 'api' as const,
  method: 'GET',
  path: '/api/v1/heroes/leaderboard',
  name: 'MVP1 Get Hero Leaderboard',
  flows: ['game-flow'],
  emits: [],
}

const handler = async (request: any) => {
  try {
    const limit = Math.min(parseInt(request.query?.limit) || 10, 100)
    const offset = Math.max(parseInt(request.query?.offset) || 0, 0)

    // Initialize database
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame'
    try {
      getDatabase()
    } catch {
      await initDatabase(databaseUrl)
    }

    const db = getDatabase()

    // Get hero leaderboard
    const result = await db.query(
      `SELECT 
        p.id,
        p.username,
        COUNT(ph.id) as total_heroes,
        AVG(ph.level) as avg_hero_level,
        MAX(ph.level) as max_hero_level,
        SUM(ph.experience) as total_experience,
        ROW_NUMBER() OVER (ORDER BY SUM(ph.experience) DESC) as rank
      FROM players p
      LEFT JOIN player_heroes ph ON p.id = ph.player_id
      GROUP BY p.id, p.username
      ORDER BY total_experience DESC NULLS LAST
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    )

    const leaderboard = result.rows.map((row: any) => ({
      rank: row.rank,
      playerId: row.id,
      username: row.username,
      totalHeroes: parseInt(row.total_heroes) || 0,
      avgHeroLevel: parseFloat(row.avg_hero_level) || 0,
      maxHeroLevel: parseInt(row.max_hero_level) || 0,
      totalExperience: parseInt(row.total_experience) || 0,
    }))

    return {
      status: 200,
      body: wrapResponse(200, {
        success: true,
        data: {
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
