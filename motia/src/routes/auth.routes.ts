/**
 * Authentication API Routes for Motia Framework
 * Handles user registration, login, and token management
 */

import { getAuthService } from '../services/auth.service'
import { getPlayerService } from '../services/player.service'
import {
  createResponse,
  createErrorResponse,
  extractToken,
  verifyTokenAndCreateContext,
  Validators,
  ApiLogger,
} from '../api.utils'

const authService = getAuthService()
const playerService = getPlayerService()

/**
 * POST /auth/register
 * Register a new user with email and password
 */
export async function registerHandler(
  request: {
    username: string
    email: string
    password: string
  }
): Promise<any> {
  try {
    // Validation
    if (!request.username || !request.email || !request.password) {
      return createErrorResponse('Username, email, and password are required', 400)
    }

    if (!Validators.isValidUsername(request.username)) {
      return createErrorResponse(
        'Username must be 3-20 characters and contain only letters, numbers, and underscores',
        400
      )
    }

    if (!Validators.isValidEmail(request.email)) {
      return createErrorResponse('Invalid email format', 400)
    }

    if (!Validators.isValidPassword(request.password)) {
      return createErrorResponse(
        'Password must be at least 8 characters with uppercase, lowercase, and numbers',
        400
      )
    }

    // Check if username already exists
    const existingByUsername = await playerService.getPlayerByUsername(request.username)
    if (existingByUsername) {
      return createErrorResponse('Username already taken', 409)
    }

    // Hash password
    const passwordHash = authService.hashPassword(request.password)

    // Create new player
    const player = await playerService.createPlayer(
      request.username,
      request.email,
      passwordHash
    )

    // Generate token
    const token = authService.generateToken(player.id, player.username)

    ApiLogger.info(`Player registered: ${player.username} (${player.id})`)

    return createResponse(
      {
        token,
        playerId: player.id,
        username: player.username,
        email: player.email,
        level: player.level,
      },
      'Registration successful'
    )
  } catch (error) {
    ApiLogger.error('Registration error', error)
    return createErrorResponse(
      error instanceof Error ? error.message : 'Registration failed',
      500
    )
  }
}

/**
 * POST /auth/login
 * Login with email/username and password
 */
export async function loginHandler(
  request: {
    username?: string
    email?: string
    password: string
  }
): Promise<any> {
  try {
    const { password } = request
    const identifier = request.username || request.email

    // Validation
    if (!identifier || !password) {
      return createErrorResponse('Username/email and password are required', 400)
    }

    // Get player
    let player = null

    // Try by username first
    if (request.username) {
      player = await playerService.getPlayerByUsername(request.username)
    }

    // Try by email if not found
    if (!player && request.email) {
      const results = await playerService.getLeaderboard(1, 0)
      // Note: This is a workaround since getPlayerByEmail doesn't exist yet
      // In production, add this method to PlayerService
      player = null // TODO: Implement getPlayerByEmail
    }

    if (!player) {
      return createErrorResponse('Invalid credentials', 401)
    }

    // Verify password
    if (!player.password_hash || !authService.verifyPassword(password, player.password_hash)) {
      return createErrorResponse('Invalid credentials', 401)
    }

    // Check if player is banned
    if (player.status === 'banned') {
      return createErrorResponse('Player account is banned', 403)
    }

    // Update last login
    await playerService.updateLastLogin(player.id)

    // Generate token
    const token = authService.generateToken(player.id, player.username)

    ApiLogger.info(`Player logged in: ${player.username}`)

    return createResponse(
      {
        token,
        playerId: player.id,
        username: player.username,
        level: player.level,
        experience: player.experience,
      },
      'Login successful'
    )
  } catch (error) {
    ApiLogger.error('Login error', error)
    return createErrorResponse(error instanceof Error ? error.message : 'Login failed', 500)
  }
}

/**
 * POST /auth/google
 * Login/Register with Google OAuth
 */
export async function googleAuthHandler(
  request: {
    token: string
  }
): Promise<any> {
  try {
    const { token } = request

    if (!token) {
      return createErrorResponse('Google token is required', 400)
    }

    // Note: Google token verification would go here
    // For now, we're creating a placeholder that verifies token structure
    // In production, use google-auth-library to verify the token properly

    // Decode token (in production, verify signature)
    let payload: any
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        throw new Error('Invalid token format')
      }
      payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'))
    } catch {
      return createErrorResponse('Invalid Google token', 401)
    }

    const { sub: googleId, email, name } = payload

    if (!googleId || !email) {
      return createErrorResponse('Invalid token payload', 400)
    }

    // Check if player already exists by username or email
    let player = await playerService.getPlayerByUsername(email.split('@')[0])

    if (!player) {
      // Create new player for Google OAuth
      const baseUsername = email.split('@')[0]
      let username = baseUsername
      let counter = 1

      // Make sure username is unique
      while (await playerService.getPlayerByUsername(username)) {
        username = `${baseUsername}${counter}`
        counter++
      }

      // Create with empty password (Google OAuth users don't need password)
      const emptyPasswordHash = authService.hashPassword(Math.random().toString(36))
      player = await playerService.createPlayer(username, email, emptyPasswordHash)
    }

    // Generate JWT token
    const jwtToken = authService.generateToken(player.id, player.username)

    ApiLogger.info(`Player Google auth: ${player.username}`)

    return createResponse(
      {
        token: jwtToken,
        playerId: player.id,
        username: player.username,
        level: player.level,
        email: player.email,
      },
      'Google authentication successful'
    )
  } catch (error) {
    ApiLogger.error('Google auth error', error)
    return createErrorResponse('Google authentication failed', 500)
  }
}

/**
 * POST /auth/refresh
 * Refresh JWT token
 */
export async function refreshTokenHandler(
  request: any,
  context: {
    authHeader?: string
  }
): Promise<any> {
  try {
    const token = extractToken(context.authHeader)

    if (!token) {
      return createErrorResponse('Token is required', 401)
    }

    // Verify token
    const decoded = authService.verifyToken(token)
    if (!decoded) {
      return createErrorResponse('Invalid or expired token', 401)
    }

    // Generate new token
    const newToken = authService.generateToken(decoded.playerId, decoded.username)

    return createResponse(
      {
        token: newToken,
      },
      'Token refreshed'
    )
  } catch (error) {
    ApiLogger.error('Token refresh error', error)
    return createErrorResponse('Token refresh failed', 500)
  }
}

/**
 * GET /auth/me
 * Get current user info
 */
export async function getMeHandler(
  request: any,
  context: {
    authHeader?: string
  }
): Promise<any> {
  try {
    const token = extractToken(context.authHeader)
    const apiContext = verifyTokenAndCreateContext(token)

    if (!apiContext.isAuthenticated || !apiContext.playerId) {
      return createErrorResponse('Unauthorized', 401)
    }

    // Get player
    const player = await playerService.getPlayer(apiContext.playerId)
    if (!player) {
      return createErrorResponse('Player not found', 404)
    }

    return createResponse(
      {
        id: player.id,
        username: player.username,
        email: player.email,
        level: player.level,
        experience: player.experience,
        resources: player.resources,
        status: player.status,
        created_at: player.created_at,
        last_login: player.last_login,
      },
      'User info retrieved'
    )
  } catch (error) {
    ApiLogger.error('Get user error', error)
    return createErrorResponse('Failed to get user info', 500)
  }
}

export const authRoutes = {
  registerHandler,
  loginHandler,
  googleAuthHandler,
  refreshTokenHandler,
  getMeHandler,
}
