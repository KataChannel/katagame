import { getPlayerService } from '../../src/services/player.service'
import { getAuthService } from '../../src/services/auth.service'
import { getLogger } from '../../src/services/logger.service'
import { authLimiter } from '../../src/middleware/rate-limit.middleware'
import { InputValidator, validationRules } from '../../src/middleware/validate.middleware'
import { successResponse, errorResponse } from '../../src/utils/response.wrapper'

/**
 * API Endpoint: POST /api/v1/auth/login
 * Logs in a user with email and password
 */
export const config = {
  type: 'api',
  method: 'POST',
  path: '/api/v1/auth/login',
  name: 'AuthLoginHandler',
  flows: ['game-flow'],
  emits: [],
}

export const handler = async (request: any) => {
  const startTime = Date.now()
  const logger = getLogger()
  const clientIp = request.headers?.['x-forwarded-for']?.split(',')[0] || request.ip || 'unknown'

  try {
    // Initialize database first
    try {
      const { initDatabase } = await import('../../src/services/database.service')
      const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame'
      await initDatabase(databaseUrl)
    } catch (dbError) {
      logger.error('Database initialization error', dbError)
      return errorResponse(500, 'Database initialization failed')
    }

    const { email, password } = request.body

    // Check rate limiting
    const rateLimitResult = authLimiter.isLimited(request)
    if (rateLimitResult.limited) {
      logger.logSecurityEvent('Rate limit exceeded', { email, ip: clientIp, endpoint: '/auth/login' })
      return errorResponse(429, 'Too many login attempts. Please try again later.')
    }

    // Validate input
    const validationErrors = InputValidator.validate(request.body, validationRules.login)
    if (validationErrors.length > 0) {
      logger.debug('Login validation failed', { email, errors: validationErrors, ip: clientIp })
      return errorResponse(400, 'Validation failed', { errors: validationErrors })
    }

    // Sanitize email
    const sanitizedEmail = InputValidator.sanitizeString(email).toLowerCase()

    const authService = getAuthService()
    const playerService = getPlayerService()

    // Get player by email
    const player = await playerService.getPlayerByEmail(sanitizedEmail)

    if (!player) {
      logger.logSecurityEvent('Failed login attempt - player not found', { email: sanitizedEmail, ip: clientIp })
      return errorResponse(401, 'Invalid credentials')
    }

    // Verify password
    const passwordValid = authService.verifyPassword(password, player.password_hash)

    if (!passwordValid) {
      logger.logSecurityEvent('Failed login attempt - invalid password', { playerId: player.id, ip: clientIp })
      return errorResponse(401, 'Invalid credentials')
    }

    // Update last login
    await playerService.updateLastLogin(player.id)

    // Generate token
    const token = authService.generateToken(player.id, player.username)

    const duration = Date.now() - startTime
    logger.logRequest('POST', '/api/v1/auth/login', 200, duration, clientIp)

    return successResponse({
      token,
      playerId: player.id,
      username: player.username,
      email: player.email,
      level: player.level,
      gold: player.resources?.gold || 0,
      gems: player.resources?.gems || 0,
    }, 'Login successful')
  } catch (error: any) {
    const duration = Date.now() - startTime
    logger.error('Login error', error)
    logger.logRequest('POST', '/api/v1/auth/login', 500, duration, clientIp)
    return errorResponse(500, 'Login failed')
  }
}
