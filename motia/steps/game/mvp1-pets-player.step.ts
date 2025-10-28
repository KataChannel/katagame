import { wrapResponse } from '../../src/utils/response.wrapper'
import { getAuthService } from '../../src/services/auth.service'
import { getDatabase, initDatabase } from '../../src/services/database.service'

const config = {
  type: 'api' as const,
  method: 'GET',
  path: '/api/v1/pets/my-pets',
  name: 'MVP1 Get Player Pets',
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

    // Get player pets
    const result = await db.query(
      `SELECT id, name, pet_type, rarity, level, experience, acquired_at
      FROM pets
      WHERE player_id = $1
      ORDER BY acquired_at DESC`,
      [decoded.playerId]
    )

    const pets = result.rows.map((row: any) => ({
      petId: row.id,
      name: row.name,
      type: row.pet_type,
      rarity: row.rarity,
      level: row.level,
      experience: row.experience,
      acquiredAt: row.acquired_at,
    }))

    return {
      status: 200,
      body: wrapResponse(200, {
        success: true,
        data: {
          playerId: decoded.playerId,
          pets,
          totalPets: pets.length,
        },
      }),
    }
  } catch (error: any) {
    console.error('Error getting player pets:', error?.message || error, error?.stack || '')
    return {
      status: 500,
      body: wrapResponse(500, { success: false, message: `Internal server error: ${error?.message || 'Unknown'}` }),
    }
  }
}

export { config, handler }
