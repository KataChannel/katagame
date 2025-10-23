import { wrapResponse } from '../../src/utils/response.wrapper'
import { getDatabase, initDatabase } from '../../src/services/database.service'

const MVP1_CONFIG = require('../../src/config/mvp1.config').default

const config = {
  type: 'api' as const,
  method: 'GET',
  path: '/api/v1/heroes',
  name: 'MVP1 Get Heroes List',
  flows: ['game-flow'],
  emits: [],
}

const handler = async (request: any) => {
  try {
    // Initialize database
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame'
    try {
      getDatabase()
    } catch {
      await initDatabase(databaseUrl)
    }

    // Return hero definitions from config
    const heroes = Object.entries(MVP1_CONFIG.HERO_CONFIG || {}).map(([key, value]: [string, any]) => ({
      id: value.id,
      name: value.name,
      type: value.type,
      rarity: value.rarity,
      icon: value.icon,
      description: value.description,
      basePower: value.base_power,
      recruitCost: value.recruit_cost,
      skills: value.skills || [],
    }))

    return {
      status: 200,
      body: wrapResponse(200, {
        success: true,
        data: { heroes },
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
