import { getAuthService } from '../../src/services/auth.service'
import { getDatabase } from '../../src/services/database.service'
import { successResponse, errorResponse } from '../../src/utils/response.wrapper'

/**
 * API Endpoint: GET /api/v1/heroes/list
 * Get list of available heroes for recruitment
 */
export const config = {
  type: 'api',
  method: 'GET',
  path: '/api/v1/heroes/list',
  name: 'GetHeroesListHandler',
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
      await initDatabase(databaseUrl)
    }

    const authHeader = request.headers?.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(401, 'No token provided')
    }

    const token = authHeader.substring(7)
    const rarity = request.query?.rarity || request.body?.rarity
    const element = request.query?.element || request.body?.element

    const authService = getAuthService()
    const db = getDatabase()

    // Verify token
    const decoded = authService.verifyToken(token)
    if (!decoded) {
      return errorResponse(401, 'Invalid token')
    }

    // Get heroes - build query based on filters
    let query = 'SELECT * FROM heroes WHERE 1=1'
    const params: any[] = []

    if (rarity) {
      query += ' AND rarity = $' + (params.length + 1)
      params.push(rarity)
    }

    if (element) {
      query += ' AND element = $' + (params.length + 1)
      params.push(element)
    }

    query += ' ORDER BY rarity DESC, name ASC'

    const result = await db.query(query, params)
    const heroes = result?.rows || []

    return successResponse({
      count: heroes.length,
      heroes: heroes.map((h: any) => ({
        id: h.id,
        name: h.name,
        element: h.element,
        rarity: h.rarity,
        basePower: h.base_power,
        recruitCost: h.recruit_cost,
        description: h.description,
      })),
    }, 'Heroes retrieved')
  } catch (error: any) {
    console.error('Get heroes list error:', error)
    return errorResponse(500, error.message || 'Failed to get heroes list')
  }
}
