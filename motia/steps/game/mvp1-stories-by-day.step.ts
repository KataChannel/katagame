import { wrapResponse } from '../../src/utils/response.wrapper'
import { initDatabase, getDatabase } from '../../src/services/database.service'

/**
 * API Endpoint: GET /api/v1/stories/:day
 * Get story for specific day
 */
export const config = {
  type: 'api',
  method: 'GET',
  path: '/api/v1/stories/:day',
  name: 'GetStoryByDayHandler',
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
    const day = parseInt(request.params?.day || '1')

    if (day < 1 || day > 30) {
      return wrapResponse(400, {
        success: false,
        message: 'Day must be between 1 and 30',
      })
    }

    // Get story by day
    const result = await db.query(
      'SELECT id, day, title, content, lesson, quiz_questions FROM stories WHERE day = $1',
      [day]
    )

    const story = result?.rows?.[0]

    if (!story) {
      return wrapResponse(404, {
        success: false,
        message: 'Story not found',
      })
    }

    return wrapResponse(200, {
      success: true,
      data: { story },
      message: 'Story retrieved successfully',
    })
  } catch (error: any) {
    console.error('Error getting story:', error)
    return wrapResponse(500, {
      success: false,
      message: error.message || 'Failed to get story',
    })
  }
}
