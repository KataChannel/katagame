import { wrapResponse } from '../../src/utils/response.wrapper'
import { getAuthService } from '../../src/services/auth.service'
import { getDatabase, initDatabase } from '../../src/services/database.service'

const config = {
  type: 'api' as const,
  method: 'GET',
  path: '/api/v1/heroes/my-heroes',
  name: 'MVP1 Get Player Heroes',
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

    // Get player heroes
    const result = await db.query(
      `SELECT id, name, rarity, element, level, experience, hp, attack, defense, speed
      FROM heroes
      WHERE player_id = $1
      ORDER BY level DESC, experience DESC`,
      [decoded.playerId]
    )

    const heroes = result.rows.map((row: any) => ({
      heroId: row.id,
      name: row.name,
      rarity: row.rarity,
      element: row.element,
      level: row.level,
      experience: row.experience,
      hp: row.hp,
      attack: row.attack,
      defense: row.defense,
      speed: row.speed,
    }))

    return {
      status: 200,
      body: wrapResponse(200, {
        success: true,
        data: {
          playerId: decoded.playerId,
          heroes,
          totalHeroes: heroes.length,
        },
      }),
    }
  } catch (error: any) {
    console.error('Error getting player heroes:', error?.message || error, error?.stack || '')
    return {
      status: 500,
      body: wrapResponse(500, { success: false, message: `Internal server error: ${error?.message || 'Unknown'}` }),
    }
  }
}

export { config, handler }
