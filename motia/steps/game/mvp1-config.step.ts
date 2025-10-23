import { wrapResponse } from '../../src/utils/response.wrapper'
import { getDatabase, initDatabase } from '../../src/services/database.service'

const MVP1_CONFIG = require('../../src/config/mvp1.config').default

const config = {
  type: 'api' as const,
  method: 'GET',
  path: '/api/v1/config',
  name: 'MVP1 Get Config',
  flows: ['game-flow'],
  emits: [],
}

const handler = async (request: any) => {
  try {
    // Initialize database (no auth needed)
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame'
    try {
      getDatabase()
    } catch {
      await initDatabase(databaseUrl)
    }

    // Return simplified configuration
    const config = {
      version: '1.0.0',
      quizPerDay: MVP1_CONFIG.QUIZ_CONFIG?.quizzes_per_day || 10,
      maxHeroes: MVP1_CONFIG.HERO_CONFIG?.max_heroes || 5,
      maxProvinces: MVP1_CONFIG.PROVINCE_CONFIG?.max_provinces || 10,
      resourceTypes: ['gold', 'rice', 'wood'],
      gameStarted: MVP1_CONFIG.START_DATE || new Date('2024-01-01'),
    }

    return {
      status: 200,
      body: wrapResponse(200, {
        success: true,
        data: config,
      }),
    }
  } catch (error) {
    return {
      status: 500,
      body: wrapResponse(500, { success: false, message: 'Internal server error' }),
    }
  }
}

export { config, handler }
