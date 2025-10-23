import { wrapResponse } from '../../src/utils/response.wrapper'
import { initDatabase, getDatabase } from '../../src/services/database.service'

/**
 * API Endpoint: GET /api/v1/stories
 * Get list of all stories with pagination
 */
export const config = {
  type: 'api',
  method: 'GET',
  path: '/api/v1/stories',
  name: 'GetStoriesListHandler',
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

    // Get pagination parameters
    const page = parseInt(request.query?.page || '1')
    const limit = parseInt(request.query?.limit || '10')
    const offset = (page - 1) * limit

    // Get stories from database
    const result = await db.query(
      `SELECT id, day, title, content, lesson, quiz_questions FROM stories 
       ORDER BY day ASC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    )

    const stories = result?.rows || []

    // Get total count
    const countResult = await db.query('SELECT COUNT(*) as count FROM stories')
    const total = parseInt(countResult?.rows?.[0]?.count || '0')

    return wrapResponse(200, {
      success: true,
      data: {
        stories,
        pagination: {
          page,
          limit,
          total,
        },
      },
      message: 'Stories retrieved successfully',
    })
  } catch (error: any) {
    console.error('Error getting stories:', error)
    return wrapResponse(500, {
      success: false,
      message: error.message || 'Failed to get stories',
    })
  }
}
