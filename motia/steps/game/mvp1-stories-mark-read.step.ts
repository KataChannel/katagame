import { wrapResponse } from '../../src/utils/response.wrapper'
import { getAuthService } from '../../src/services/auth.service'
import { initDatabase, getDatabase } from '../../src/services/database.service'

/**
 * API Endpoint: POST /api/v1/stories/:id/read
 * Mark story as read
 */
export const config = {
  type: 'api',
  method: 'POST',
  path: '/api/v1/stories/:id/read',
  name: 'MarkStoryReadHandler',
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
    const storyId = request.params?.id

    if (!storyId) {
      return wrapResponse(400, {
        success: false,
        message: 'Story ID is required',
      })
    }

    // Mark story as read
    await db.query('BEGIN')

    // Check if already read
    const existResult = await db.query(
      'SELECT id FROM player_stories WHERE player_id = $1 AND story_id = $2',
      [playerId, storyId]
    )

    if (existResult?.rows?.length === 0) {
      await db.query(
        `INSERT INTO player_stories (player_id, story_id, read_at) 
         VALUES ($1, $2, NOW())`,
        [playerId, storyId]
      )
    }

    await db.query('COMMIT')

    return wrapResponse(200, {
      success: true,
      message: 'Story marked as read',
    })
  } catch (error: any) {
    console.error('Error marking story read:', error)
    return wrapResponse(500, {
      success: false,
      message: error.message || 'Failed to mark story as read',
    })
  }
}
