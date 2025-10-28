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

    // Get player heroes - heroes deployed to player's provinces
    const result = await db.query(
      `SELECT DISTINCT
        h.id,
        h.name_english as name,
        h.rarity,
        h.base_hp as hp,
        h.base_attack as attack,
        h.base_defense as defense,
        h.base_speed as speed
      FROM heroes h
      INNER JOIN player_provinces pp ON h.id = pp.hero_id
      WHERE pp.player_id = $1
      ORDER BY h.rarity DESC, h.name_english ASC`,
      [decoded.playerId]
    )

    const heroes = result.rows.map((row: any) => ({
      heroId: row.id,
      name: row.name,
      rarity: row.rarity,
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
