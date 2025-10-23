import { wrapResponse } from '../../src/utils/response.wrapper'
import { getDatabase, initDatabase } from '../../src/services/database.service'

const config = {
  type: 'api' as const,
  method: 'GET',
  path: '/api/v1/quizzes/leaderboard',
  name: 'MVP1 Get Quiz Leaderboard',
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

    // Get top scorers
    const result = await db.query(
      `SELECT 
        p.id,
        p.username,
        COUNT(DISTINCT pqa.story_id) as quizzes_completed,
        SUM(CASE WHEN pqa.is_correct THEN 1 ELSE 0 END) as correct_answers,
        ROUND(100.0 * SUM(CASE WHEN pqa.is_correct THEN 1 ELSE 0 END) / NULLIF(COUNT(DISTINCT pqa.story_id), 0), 2) as accuracy_rate,
        SUM(pqa.gold_earned) as total_gold,
        SUM(pqa.rice_earned) as total_rice,
        SUM(pqa.wood_earned) as total_wood,
        ROW_NUMBER() OVER (ORDER BY SUM(pqa.gold_earned) DESC) as rank
      FROM players p
      LEFT JOIN player_quiz_answers pqa ON p.id = pqa.player_id
      GROUP BY p.id, p.username
      ORDER BY total_gold DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    )

    const leaderboard = result.rows.map((row: any) => ({
      rank: row.rank,
      playerId: row.id,
      username: row.username,
      quizzesCompleted: row.quizzes_completed || 0,
      correctAnswers: row.correct_answers || 0,
      accuracyRate: parseFloat(row.accuracy_rate) || 0,
      totalGold: parseInt(row.total_gold) || 0,
      totalRice: parseInt(row.total_rice) || 0,
      totalWood: parseInt(row.total_wood) || 0,
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
