import { wrapResponse } from '../../src/utils/response.wrapper'
import { getAuthService } from '../../src/services/auth.service'
import { initDatabase, getDatabase } from '../../src/services/database.service'
import { MVP1_CONFIG } from '../../src/config/mvp1.config'

/**
 * API Endpoint: POST /api/v1/quizzes/:storyId/submit
 * Submit quiz answers and calculate rewards
 */
export const config = {
  type: 'api',
  method: 'POST',
  path: '/api/v1/quizzes/:storyId/submit',
  name: 'SubmitQuizHandler',
  flows: ['game-flow'],
  emits: [],
}

export const handler = async (request: any) => {
  try {
    // Initialize database
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame'
    try {
      getDatabase()
    } catch {
      await initDatabase(databaseUrl)
    }

    const db = getDatabase()
    const authService = getAuthService()

    // Verify token
    const authHeader = request.headers?.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return wrapResponse(401, {
        success: false,
        message: 'No token provided',
      })
    }

    const token = authHeader.substring(7)
    const decoded = authService.verifyToken(token)

    if (!decoded || !decoded.playerId) {
      return wrapResponse(401, {
        success: false,
        message: 'Invalid token',
      })
    }

    const playerId = decoded.playerId
    const storyId = request.params?.storyId
    const answers = request.body?.answers || []

    if (!storyId || !Array.isArray(answers) || answers.length === 0) {
      return wrapResponse(400, {
        success: false,
        message: 'Story ID and answers are required',
      })
    }

    await db.query('BEGIN')

    try {
      // Get quiz questions
      const quizResult = await db.query(
        `SELECT id, correct_answer FROM quiz_questions 
         WHERE story_id = $1 
         ORDER BY id ASC 
         LIMIT 3`,
        [storyId]
      )

      const questions = quizResult?.rows || []

      // Calculate score
      let correct = 0
      questions.forEach((q: any, idx: number) => {
        if (answers[idx] === q.correct_answer) {
          correct++
        }
      })

      // Calculate reward multiplier
      let multiplier = 1
      let baseReward = 500
      if (correct === 3) {
        multiplier = MVP1_CONFIG.QUIZ_CONFIG.SCORING.PERFECT.multiplier
        baseReward = MVP1_CONFIG.QUIZ_CONFIG.SCORING.PERFECT.bonus_gold
      } else if (correct === 2) {
        multiplier = MVP1_CONFIG.QUIZ_CONFIG.SCORING.GOOD.multiplier
        baseReward = MVP1_CONFIG.QUIZ_CONFIG.SCORING.GOOD.bonus_gold
      } else if (correct === 1) {
        multiplier = MVP1_CONFIG.QUIZ_CONFIG.SCORING.PARTIAL.multiplier
        baseReward = MVP1_CONFIG.QUIZ_CONFIG.SCORING.PARTIAL.bonus_gold
      }

      const totalReward = baseReward * multiplier

      // Save quiz result
      await db.query(
        `INSERT INTO player_quiz_results (player_id, story_id, correct_answers, total_questions, reward_multiplier, reward_amount)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [playerId, storyId, correct, questions.length, multiplier, totalReward]
      )

      // Update player resources
      await db.query(
        `UPDATE players SET resources = jsonb_set(resources, '{gold}', to_jsonb((CAST(resources->>'gold' AS NUMERIC) + $2)::INT))
         WHERE id = $1`,
        [playerId, totalReward]
      )

      await db.query('COMMIT')

      return wrapResponse(200, {
        success: true,
        data: {
          score: correct,
          multiplier,
          reward: totalReward,
        },
        message: 'Quiz submitted successfully',
      })
    } catch (error) {
      await db.query('ROLLBACK')
      throw error
    }
  } catch (error: any) {
    console.error('Error submitting quiz:', error)
    return wrapResponse(500, {
      success: false,
      message: error.message || 'Failed to submit quiz',
    })
  }
}
