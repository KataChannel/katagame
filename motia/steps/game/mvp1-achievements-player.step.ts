import { wrapResponse } from '../../src/utils/response.wrapper'
import { getAuthService } from '../../src/services/auth.service'
import { getDatabase, initDatabase } from '../../src/services/database.service'

const config = {
  type: 'api' as const,
  method: 'GET',
  path: '/api/v1/achievements/my-achievements',
  name: 'MVP1 Get Player Achievements',
  flows: ['game-flow'],
  emits: [],
}

const handler = async (request: any) => {
  try {
    // Initialize database FIRST
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame'
    try {
      getDatabase()
    } catch {
      await initDatabase(databaseUrl)
    }

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

    const db = getDatabase()

    // Get player achievements
    const result = await db.query(
      `SELECT 
        ua.id,
        ua.achievement_id,
        a.name,
        a.description,
        a.category,
        a.rarity,
        a.points,
        a.icon_url,
        ua.progress,
        ua.unlocked_at
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.player_id = $1
      ORDER BY ua.unlocked_at DESC`,
      [decoded.playerId]
    )

    const achievements = result.rows.map((row: any) => ({
      id: row.id,
      achievementId: row.achievement_id,
      name: row.name,
      description: row.description,
      category: row.category,
      rarity: row.rarity,
      points: row.points,
      iconUrl: row.icon_url,
      progress: row.progress,
      unlockedAt: row.unlocked_at,
      isUnlocked: row.unlocked_at !== null,
    }))

    // Calculate total points
    const totalPoints = achievements
      .filter((a: any) => a.isUnlocked)
      .reduce((sum: number, a: any) => sum + a.points, 0)

    return {
      status: 200,
      body: wrapResponse(200, {
        success: true,
        data: {
          playerId: decoded.playerId,
          achievements,
          totalAchievements: achievements.length,
          totalPoints,
          unlockedCount: achievements.filter((a: any) => a.isUnlocked).length,
        },
      }),
    }
  } catch (error: any) {
    console.error('Error getting player achievements:', error?.message || error, error?.stack || '')
    return {
      status: 500,
      body: wrapResponse(500, { success: false, message: `Internal server error: ${error?.message || 'Unknown'}` }),
    }
  }
}

export { config, handler }
