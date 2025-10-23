import { getAuthService } from '../../src/services/auth.service'
import { getPlayerService } from '../../src/services/player.service'
import { getDatabase } from '../../src/services/database.service'
import { successResponse, errorResponse } from '../../src/utils/response.wrapper'

/**
 * API Endpoint: POST /api/v1/save-game/sync
 * Sync and backup player game progress to cloud
 */
export const config = {
  type: 'api',
  method: 'POST',
  path: '/api/v1/save-game/sync',
  name: 'SyncSaveGameHandler',
  flows: ['game-flow'],
  emits: [],
}

export const handler = async (request: any) => {
  try {
    const authHeader = request.headers?.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(401, 'No token provided')
    }

    const token = authHeader.substring(7)
    const { gameData } = request.body

    if (!gameData) {
      return errorResponse(400, 'Game data is required')
    }

    const authService = getAuthService()
    const playerService = getPlayerService()
    const db = getDatabase()

    // Verify token
    const decoded = authService.verifyToken(token)
    if (!decoded) {
      return errorResponse(401, 'Invalid token')
    }

    // Get player
    const player = await playerService.getPlayer(decoded.playerId)
    if (!player) {
      return errorResponse(404, 'Player not found')
    }

    // Save game data to database
    const saveData = {
      player_id: player.id,
      checkpoint: gameData.checkpoint || 0,
      data: JSON.stringify(gameData),
      saved_at: new Date(),
    }

    // Check if save already exists for today
    const existingSaveResult = await db.query(
      `SELECT * FROM player_save_games 
       WHERE player_id = $1 
       AND DATE(saved_at) = CURRENT_DATE
       ORDER BY saved_at DESC LIMIT 1`,
      [player.id]
    )

    let saved = null

    if (existingSaveResult?.rows?.length > 0) {
      // Update existing save using raw query (since we're filtering by player_id, not id)
      const updateQuery = `
        UPDATE player_save_games 
        SET saved_at = $2, data = $3, checkpoint = $4, updated_at = NOW()
        WHERE player_id = $1
        RETURNING *
      `
      const updateResult = await db.query(updateQuery, [
        player.id,
        new Date(),
        saveData.data,
        saveData.checkpoint,
      ])
      saved = updateResult?.rows?.[0]
    } else {
      // Create new save
      saved = await db.insert('player_save_games', saveData)
    }

    if (!saved) {
      return errorResponse(400, 'Failed to save game')
    }

    return successResponse({
      playerId: player.id,
      checkpoint: gameData.checkpoint || 0,
      savedAt: new Date().toISOString(),
      backup: {
        location: 'cloud',
        status: 'synced',
      },
    }, 'Game saved successfully')
  } catch (error: any) {
    console.error('Save game sync error:', error)
    return errorResponse(500, error.message || 'Failed to sync game save')
  }
}
