import { wrapResponse } from '../../src/utils/response.wrapper'
import { getAuthService } from '../../src/services/auth.service'
import { initDatabase, getDatabase } from '../../src/services/database.service'

/**
 * API Endpoint: GET /api/v1/stories/:id/quiz
 * Get story with quiz questions
 */
export const config = {
  type: 'api',
  method: 'GET',
  path: '/api/v1/stories/:id/quiz',
  name: 'GetStoryWithQuizHandler',
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
    const storyId = request.params?.id

    if (!storyId) {
      return wrapResponse(400, {
        success: false,
        message: 'Story ID is required',
      })
    }

    // Get story
    const storyResult = await db.query(
      'SELECT id, day, title, content, lesson FROM stories WHERE id = $1',
      [storyId]
    )

    const story = storyResult?.rows?.[0]

    if (!story) {
      return wrapResponse(404, {
        success: false,
        message: 'Story not found',
      })
    }

    // Get quiz questions for this story
    const quizResult = await db.query(
      `SELECT id, story_id, question, options, correct_answer FROM quiz_questions 
       WHERE story_id = $1 
       LIMIT 3`,
      [storyId]
    )

    const questions = quizResult?.rows || []

    return wrapResponse(200, {
      success: true,
      data: {
        story: {
          ...story,
          questions: questions.map((q: any) => ({
            id: q.id,
            question: q.question,
            options: JSON.parse(q.options || '[]'),
          })),
        },
      },
      message: 'Story and quiz retrieved successfully',
    })
  } catch (error: any) {
    console.error('Error getting story with quiz:', error)
    return wrapResponse(500, {
      success: false,
      message: error.message || 'Failed to get story with quiz',
    })
  }
}
