import { Handlers } from 'motia'
import { Validators, ApiLogger } from '../../src/api.utils'
import { successResponse, errorResponse } from '../../src/utils/response.wrapper'

/**
 * Authentication API Routes
 * POST /api/v1/auth/register - Register new user
 * POST /api/v1/auth/login - Login user
 * POST /api/v1/auth/google - Google OAuth
 */

export const config = {
  type: 'api',
  method: 'POST',
  path: '/api/v1/auth/register',
  name: 'AuthRegisterHandler',
  description: 'Register a new user',
  flows: ['game-flow'],
  emits: [],
}

export const handler: Handlers['AuthRegisterHandler'] = async (
  request: any
): Promise<any> => {
  try {
    // Initialize database first
    try {
      const { initDatabase } = await import('../../src/services/database.service')
      const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame'
      await initDatabase(databaseUrl)
    } catch (dbError) {
      ApiLogger.error('Database initialization error', dbError)
      return errorResponse(500, 'Database initialization failed')
    }
    
    // Lazy load services to avoid initialization issues
    let authService: any
    let playerService: any
    
    try {
      const { getAuthService } = await import('../../src/services/auth.service')
      const { getPlayerService } = await import('../../src/services/player.service')
      
      authService = getAuthService()
      playerService = getPlayerService()
    } catch (serviceError) {
      ApiLogger.error('Service initialization error', serviceError)
      return errorResponse(500, 'Service initialization failed')
    }
    
    const body = request.body || request
    const { username, email, password } = body

    // Validation
    if (!username || !email || !password) {
      return errorResponse(400, 'Username, email, and password are required')
    }

    if (!Validators.isValidUsername(username)) {
      return errorResponse(400, 'Username must be 3-20 characters and contain only letters, numbers, and underscores')
    }

    if (!Validators.isValidEmail(email)) {
      return errorResponse(400, 'Invalid email format')
    }

    if (!Validators.isValidPassword(password)) {
      return errorResponse(400, 'Password must be at least 8 characters with uppercase, lowercase, and numbers')
    }

    // Check if username already exists
    const existingByUsername = await playerService.getPlayerByUsername(username)
    if (existingByUsername) {
      return errorResponse(409, 'Username already taken')
    }

    // Check if email already exists
    const existingByEmail = await playerService.getPlayerByEmail(email)
    if (existingByEmail) {
      return errorResponse(409, 'Email already registered')
    }

    // Hash password
    const passwordHash = authService.hashPassword(password)

    // Create new player
    const player = await playerService.createPlayer(username, email, passwordHash)

    // Generate token
    const token = authService.generateToken(player.id, player.username)

    ApiLogger.info(`Player registered: ${player.username} (${player.id})`)

    return successResponse({
      token,
      playerId: player.id,
      username: player.username,
      email: player.email,
      level: player.level,
    }, 'Registration successful')
  } catch (error) {
    ApiLogger.error('Registration error', error)
    return errorResponse(500, error instanceof Error ? error.message : 'Registration failed')
  }
}
