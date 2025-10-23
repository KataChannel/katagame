import { wrapResponse } from '../../src/utils/response.wrapper'
import { getDatabase, initDatabase } from '../../src/services/database.service'

const MVP1_CONFIG = require('../../src/config/mvp1.config').default

const config = {
  type: 'api' as const,
  method: 'GET',
  path: '/api/v1/resources',
  name: 'MVP1 Get Resources List',
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

    // Return resource definitions from config
    const resources = Object.entries(MVP1_CONFIG.RESOURCE_CONFIG).map(([key, value]: [string, any]) => ({
      id: value.id,
      name: value.name,
      type: value.type,
      icon: value.icon,
      description: value.description,
      baseHarvestAmount: value.base_harvest,
      harvestCooldown: value.harvest_cooldown,
      maxStorage: value.max_storage,
    }))

    return {
      status: 200,
      body: wrapResponse(200, {
        success: true,
        data: { resources },
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
