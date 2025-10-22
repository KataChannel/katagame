import { getAuthService } from '../../src/services/auth.service'
import { getDatabase } from '../../src/services/database.service'

/**
 * API Endpoint: GET /api/v1/achievements/list
 * Get player's achievements and progress
 */
export const config = {
  type: 'api',
  method: 'GET',
  path: '/api/v1/achievements/list',
  name: 'GetAchievementsHandler',
  flows: ['game-flow'],
  emits: [],
}

export const handler = async (request: any) => {
  try {
    // Initialize database first
    const { initDatabase, getDatabase } = await import('../../src/services/database.service')
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame'
    try {
      getDatabase()
    } catch {
      initDatabase(databaseUrl)
    }

    const authHeader = request.headers?.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { status: 401, body: { success: false, message: 'No token provided' } }
    }

    const token = authHeader.substring(7)

    const authService = getAuthService()
    const db = getDatabase()

    // Verify token
    const decoded = authService.verifyToken(token)
    if (!decoded) {
      return { status: 401, body: { success: false, message: 'Invalid token' } }
    }

    // Get player achievements
    const achievementsResult = await db.query(
      `SELECT pa.* FROM player_achievements pa 
       WHERE pa.player_id = $1 
       ORDER BY pa.unlocked_at DESC`,
      [decoded.playerId]
    )

    const achievements = achievementsResult?.rows || []

    // Get achievement definitions for unlocked ones
    const unlockedAchievements = achievements.filter((a: any) => a.unlocked_at)
    const totalUnlocked = unlockedAchievements.length
    const totalAchievements = achievements.length

    return {
      status: 200,
      body: {
        success: true,
        message: 'Achievements retrieved',
        data: {
          summary: {
            total: totalAchievements,
            unlocked: totalUnlocked,
            locked: totalAchievements - totalUnlocked,
            progress: totalAchievements > 0 ? Math.round((totalUnlocked / totalAchievements) * 100) : 0,
          },
          achievements: achievements.map((a: any) => ({
            id: a.id,
            name: a.name,
            description: a.description,
            icon: a.icon,
            rewards: a.rewards,
            progress: a.progress,
            maxProgress: a.max_progress,
            unlocked: !!a.unlocked_at,
            unlockedAt: a.unlocked_at,
          })),
        },
      },
    }
  } catch (error: any) {
    console.error('Get achievements error:', error)
    return {
      status: 500,
      body: {
        success: false,
        message: error.message || 'Failed to get achievements',
      },
    }
  }
}
