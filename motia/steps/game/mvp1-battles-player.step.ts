import { wrapResponse } from '../../src/utils/response.wrapper'
import { getAuthService } from '../../src/services/auth.service'
import { getDatabase, initDatabase } from '../../src/services/database.service'

const config = {
  type: 'api' as const,
  method: 'GET',
  path: '/api/v1/battles/my-battles',
  name: 'MVP1 Get Player Battle History',
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

    // Get player battle history (as attacker or defender)
    const result = await db.query(
      `SELECT 
        b.id,
        b.attacker_id,
        b.defender_id,
        COALESCE(pa.username, 'Unknown') as attacker_username,
        COALESCE(pd.username, 'Unknown') as defender_username,
        b.battle_type,
        b.result,
        b.duration_seconds,
        b.attacker_reward,
        b.defender_reward,
        b.created_at
      FROM battles b
      LEFT JOIN players pa ON b.attacker_id = pa.id
      LEFT JOIN players pd ON b.defender_id = pd.id
      WHERE b.attacker_id = $1 OR b.defender_id = $1
      ORDER BY b.created_at DESC
      LIMIT 50`,
      [decoded.playerId]
    )

    const battles = result.rows.map((row: any) => {
      const isAttacker = row.attacker_id === decoded.playerId
      const opponent = isAttacker ? row.defender_username : row.attacker_username
      const opponentId = isAttacker ? row.defender_id : row.attacker_id
      
      return {
        battleId: row.id,
        battleType: row.battle_type,
        opponent,
        opponentId,
        isAttacker,
        result: row.result,
        yourResult: isAttacker 
          ? (row.result === 'attacker_win' ? 'win' : row.result === 'draw' ? 'draw' : 'loss')
          : (row.result === 'defender_win' ? 'win' : row.result === 'draw' ? 'draw' : 'loss'),
        durationSeconds: row.duration_seconds,
        reward: isAttacker ? row.attacker_reward : row.defender_reward,
        createdAt: row.created_at,
      }
    })

    // Calculate statistics
    const wins = battles.filter((b: any) => b.yourResult === 'win').length
    const losses = battles.filter((b: any) => b.yourResult === 'loss').length
    const draws = battles.filter((b: any) => b.yourResult === 'draw').length

    return {
      status: 200,
      body: wrapResponse(200, {
        success: true,
        data: {
          playerId: decoded.playerId,
          battles,
          statistics: {
            totalBattles: battles.length,
            wins,
            losses,
            draws,
            winRate: battles.length > 0 ? ((wins / battles.length) * 100).toFixed(1) + '%' : '0%',
          },
        },
      }),
    }
  } catch (error: any) {
    console.error('Error getting player battles:', error?.message || error, error?.stack || '')
    return {
      status: 500,
      body: wrapResponse(500, { success: false, message: `Internal server error: ${error?.message || 'Unknown'}` }),
    }
  }
}

export { config, handler }
