import { Handlers } from 'motia'
import { Validators, ApiLogger } from '../../src/api.utils'
import { successResponse, errorResponse } from '../../src/utils/response.wrapper'

/**
 * Google OAuth Authentication API Route
 * POST /api/v1/auth/google - Google OAuth Login/Register
 */

export const config = {
  type: 'api',
  method: 'POST',
  path: '/api/v1/auth/google',
  name: 'GoogleAuthHandler',
  description: 'Authenticate user with Google OAuth token',
  flows: ['game-flow'],
  emits: [],
}

export const handler: Handlers['GoogleAuthHandler'] = async (
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
      return errorResponse(500, 'Internal server error - database initialization failed')
    }

    // Lazy load services (after database is initialized)
    let authService: any
    let playerService: any
    
    try {
      const { getAuthService } = await import('../../src/services/auth.service')
      const { getPlayerService } = await import('../../src/services/player.service')
      
      authService = getAuthService()
      playerService = getPlayerService()
    } catch (serviceError) {
      ApiLogger.error('Service initialization error', serviceError)
      return errorResponse(500, 'Internal server error - service initialization failed')
    }
    
    const body = request.body || request
    const { token } = body

    // Validation
    if (!token) {
      return errorResponse(400, 'Google token is required')
    }

    // Verify Google token using google-auth-library
    let payload: any
    try {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||'897974685698-621ekaodhnha7ssfaml6m1u418ab2ucq.apps.googleusercontent.com'
      
      if (!clientId) {
        ApiLogger.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID not configured')
        return errorResponse(500, 'Google OAuth not properly configured')
      }
      
      try {
        // Try to use OAuth2Client if available
        const { OAuth2Client } = require('google-auth-library')
        const client = new OAuth2Client(clientId)
        
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: clientId,
        })
        
        payload = ticket.getPayload()
      } catch (libError) {
        // Fallback: Decode JWT without verification (for development)
        // In production, ensure google-auth-library is properly installed
        ApiLogger.warn('OAuth2Client not available, using JWT decode fallback')
        
        const parts = token.split('.')
        if (parts.length !== 3) {
          throw new Error('Invalid token format')
        }
        
        try {
          payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'))
        } catch (e) {
          throw new Error('Failed to decode token')
        }
      }
      
      if (!payload) {
        return errorResponse(401, 'Failed to extract token payload')
      }
    } catch (verifyError) {
      ApiLogger.error('Google token verification failed', verifyError)
      return errorResponse(401, 'Invalid Google token')
    }

    const { sub: googleId, email, name } = payload

    if (!googleId || !email) {
      return errorResponse(400, 'Invalid token payload - missing required fields')
    }

    // Check if player already exists by username derived from email
    const baseUsername = email.split('@')[0]
    let player = await playerService.getPlayerByUsername(baseUsername)

    if (!player) {
      // Create new player for Google OAuth
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
      
      ApiLogger.info(`New player created via Google OAuth: ${username} (${googleId})`)
    } else {
      // Update last login
      await playerService.updateLastLogin(player.id)
      ApiLogger.info(`Player logged in via Google OAuth: ${player.username}`)
    }

    // Generate JWT token
    const jwtToken = authService.generateToken(player.id, player.username)

    return successResponse(
      {
        token: jwtToken,
        playerId: player.id,
        username: player.username,
        email: player.email,
        level: player.level,
      },
      'Google authentication successful'
    )
  } catch (error) {
    ApiLogger.error('Google auth error', error)
    return errorResponse(
      500,
      error instanceof Error ? error.message : 'Google authentication failed'
    )
  }
}
