import { wrapResponse } from '../../src/utils/response.wrapper'
import { getDatabase, initDatabase } from '../../src/services/database.service'

const config = {
  type: 'api' as const,
  method: 'GET',
  path: '/api/v1/provinces',
  name: 'MVP1 Get Provinces List',
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

    const db = getDatabase()

    // Get all provinces
    const result = await db.query(
      `SELECT id, name, description, region, icon
      FROM provinces
      ORDER BY id ASC`
    )

    const provinces = result.rows.map((row: any) => ({
      provinceId: row.id,
      name: row.name,
      description: row.description,
      region: row.region,
      icon: row.icon,
    }))

    return {
      status: 200,
      body: wrapResponse(200, {
        success: true,
        data: { provinces },
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
