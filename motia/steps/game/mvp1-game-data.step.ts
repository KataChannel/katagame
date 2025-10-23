import { wrapResponse } from '../../src/utils/response.wrapper'
import { getDatabase, initDatabase } from '../../src/services/database.service'

const MVP1_CONFIG = require('../../src/config/mvp1.config').default

const config = {
  type: 'api' as const,
  method: 'GET',
  path: '/api/v1/game-data',
  name: 'MVP1 Get Game Data',
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

    // Return full MVP1 configuration
    const gameData = {
      quiz: MVP1_CONFIG.QUIZ_CONFIG || {},
      resources: MVP1_CONFIG.RESOURCE_CONFIG || {},
      heroes: MVP1_CONFIG.HERO_CONFIG || {},
      provinces: MVP1_CONFIG.PROVINCE_CONFIG || {},
      buildings: MVP1_CONFIG.BUILDING_CONFIG || {},
    }

    return {
      status: 200,
      body: wrapResponse(200, {
        success: true,
        data: gameData,
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
