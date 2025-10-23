import { wrapResponse } from '../../src/utils/response.wrapper'
import { getDatabase, initDatabase } from '../../src/services/database.service'

const config = {
  type: 'api' as const,
  method: 'GET',
  path: '/api/v1/provinces/:id',
  name: 'MVP1 Get Province Detail',
  flows: ['game-flow'],
  emits: [],
}

const handler = async (request: any) => {
  try {
    const provinceId = request.params?.id
    if (!provinceId) {
      return {
        status: 400,
        body: wrapResponse(400, { success: false, message: 'Province ID is required' }),
      }
    }

    // Initialize database
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame'
    try {
      getDatabase()
    } catch {
      await initDatabase(databaseUrl)
    }

    const db = getDatabase()

    // Get province details
    const result = await db.query(
      `SELECT id, name, description, region, icon, base_gold, base_rice, base_wood
      FROM provinces
      WHERE id = $1`,
      [provinceId]
    )

    if (result.rows.length === 0) {
      return {
        status: 404,
        body: wrapResponse(404, { success: false, message: 'Province not found' }),
      }
    }

    const province = result.rows[0]

    return {
      status: 200,
      body: wrapResponse(200, {
        success: true,
        data: {
          provinceId: province.id,
          name: province.name,
          description: province.description,
          region: province.region,
          icon: province.icon,
          baseProduction: {
            gold: parseInt(province.base_gold) || 0,
            rice: parseInt(province.base_rice) || 0,
            wood: parseInt(province.base_wood) || 0,
          },
        },
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
