import { getAuthService } from '../../src/services/auth.service'
import { getPlayerService } from '../../src/services/player.service'
import { getBattleService } from '../../src/services/battle.service'
import { getLogger } from '../../src/services/logger.service'
import { battleLimiter } from '../../src/middleware/rate-limit.middleware'

/**
 * API Endpoint: POST /api/v1/battles/start
 * Starts a new PvE battle
 */
export const config = {
  type: 'api',
  method: 'POST',
  path: '/api/v1/battles/start',
  name: 'StartBattleHandler',
  flows: ['game-flow'],
  emits: [],
}

export const handler = async (request: any) => {
  const startTime = Date.now()
  const logger = getLogger()
  const clientIp = request.headers?.['x-forwarded-for']?.split(',')[0] || request.ip || 'unknown'

  try {
    // Initialize database first
    const { initDatabase, getDatabase } = await import('../../src/services/database.service')
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame'
    try {
      getDatabase()
    } catch {
      initDatabase(databaseUrl)
    }

    const authHeader = request.headers?.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { status: 401, body: { success: false, message: 'No token provided' } }
    }

    const token = authHeader.substring(7)

    // Check rate limiting
    const rateLimitResult = battleLimiter.isLimited(request)
    if (rateLimitResult.limited) {
      logger.logSecurityEvent('Battle rate limit exceeded', { ip: clientIp })
      return {
        status: 429,
        body: {
          success: false,
          message: 'Too many battles. Please try again later.',
        },
      }
    }

    const authService = getAuthService()
    const playerService = getPlayerService()
    const battleService = getBattleService()

    // Verify token
    const decoded = authService.verifyToken(token)
    if (!decoded) {
      return { status: 401, body: { success: false, message: 'Invalid token' } }
    }

    // Get player
    const player = await playerService.getPlayer(decoded.playerId)
    if (!player) {
      return { status: 404, body: { success: false, message: 'Player not found' } }
    }

    // Create battle (player vs NPC/environment)
    // Use a fixed NPC ID for PvE battles
    const NPC_DEFENDER_ID = 'npc_enemy_1'
    
    const battle = await battleService.createBattle(
      player.id,
      NPC_DEFENDER_ID,
      'pve'
    )

    if (!battle) {
      return { status: 400, body: { success: false, message: 'Failed to create battle' } }
    }

    const duration = Date.now() - startTime
    logger.logRequest('POST', '/api/v1/battles/start', 200, duration, clientIp)

    return {
      status: 200,
      body: {
        success: true,
        message: 'Battle started',
        data: {
          battleId: battle.id,
          battleType: battle.battle_type,
          status: 'ongoing',
          createdAt: battle.created_at,
        },
      },
    }
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error('Start battle error', error)
    logger.logRequest('POST', '/api/v1/battles/start', 500, duration, clientIp)

    return {
      status: 500,
      body: {
        success: false,
        message: 'Failed to start battle',
      },
    }
  }
}
