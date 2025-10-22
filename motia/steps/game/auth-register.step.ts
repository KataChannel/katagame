import { Handlers } from 'motia'
import { Validators, ApiLogger } from '../../src/api.utils'

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
    // Initialize database if not already initialized
    const { initDatabase } = await import('../../src/services/database.service')
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame'
    initDatabase(databaseUrl)
    
    // Lazy load services to avoid initialization issues
    const { getAuthService } = await import('../../src/services/auth.service')
    const { getPlayerService } = await import('../../src/services/player.service')
    
    const authService = getAuthService()
    const playerService = getPlayerService()
    
    const body = request.body || request
    const { username, email, password } = body

    // Validation
    if (!username || !email || !password) {
      return {
        status: 400,
        body: {
          success: false,
          message: 'Username, email, and password are required',
          data: null,
        },
      }
    }

    if (!Validators.isValidUsername(username)) {
      return {
        status: 400,
        body: {
          success: false,
          message: 'Username must be 3-20 characters and contain only letters, numbers, and underscores',
          data: null,
        },
      }
    }

    if (!Validators.isValidEmail(email)) {
      return {
        status: 400,
        body: {
          success: false,
          message: 'Invalid email format',
          data: null,
        },
      }
    }

    if (!Validators.isValidPassword(password)) {
      return {
        status: 400,
        body: {
          success: false,
          message: 'Password must be at least 8 characters with uppercase, lowercase, and numbers',
          data: null,
        },
      }
    }

    // Check if username already exists
    const existingByUsername = await playerService.getPlayerByUsername(username)
    if (existingByUsername) {
      return {
        status: 409,
        body: {
          success: false,
          message: 'Username already taken',
          data: null,
        },
      }
    }

    // Check if email already exists
    const existingByEmail = await playerService.getPlayerByEmail(email)
    if (existingByEmail) {
      return {
        status: 409,
        body: {
          success: false,
          message: 'Email already registered',
          data: null,
        },
      }
    }

    // Hash password
    const passwordHash = authService.hashPassword(password)

    // Create new player
    const player = await playerService.createPlayer(username, email, passwordHash)

    // Generate token
    const token = authService.generateToken(player.id, player.username)

    ApiLogger.info(`Player registered: ${player.username} (${player.id})`)

    return {
      status: 201,
      body: {
        success: true,
        message: 'Registration successful',
        data: {
          token,
          playerId: player.id,
          username: player.username,
          email: player.email,
          level: player.level,
        },
      },
    }
  } catch (error) {
    ApiLogger.error('Registration error', error)
    return {
      status: 500,
      body: {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
        data: null,
      },
    }
  }
}
