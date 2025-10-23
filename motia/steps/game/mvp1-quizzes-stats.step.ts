import { wrapResponse } from '../../src/utils/response.wrapper'
import { getAuthService } from '../../src/services/auth.service'
import { getDatabase, initDatabase } from '../../src/services/database.service'

const MVP1_CONFIG = require('../../src/config/mvp1.config').default

const config = {
  type: 'api' as const,
  method: 'GET',
  path: '/api/v1/quizzes/stats',
  name: 'MVP1 Get Quiz Stats',
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

    // Get quiz statistics
    const result = await db.query(
      `SELECT 
        COUNT(*) as total_quizzes,
        SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_answers,
        ROUND(100.0 * SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) as accuracy_rate,
        SUM(gold_earned) as total_gold_earned,
        SUM(rice_earned) as total_rice_earned,
        SUM(wood_earned) as total_wood_earned,
        MAX(created_at) as last_quiz_date
      FROM player_quiz_answers
      WHERE player_id = $1`,
      [decoded.playerId]
    )

    const stats = result.rows[0] || {
      total_quizzes: 0,
      correct_answers: 0,
      accuracy_rate: 0,
      total_gold_earned: 0,
      total_rice_earned: 0,
      total_wood_earned: 0,
      last_quiz_date: null,
    }

    return {
      status: 200,
      body: wrapResponse(200, {
        success: true,
        data: {
          totalQuizzes: parseInt(stats.total_quizzes) || 0,
          correctAnswers: parseInt(stats.correct_answers) || 0,
          accuracyRate: parseFloat(stats.accuracy_rate) || 0,
          totalGoldEarned: parseInt(stats.total_gold_earned) || 0,
          totalRiceEarned: parseInt(stats.total_rice_earned) || 0,
          totalWoodEarned: parseInt(stats.total_wood_earned) || 0,
          lastQuizDate: stats.last_quiz_date,
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
