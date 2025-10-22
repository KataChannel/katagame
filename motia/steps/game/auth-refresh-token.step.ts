import { getAuthService } from '../../src/services/auth.service'

/**
 * API Endpoint: POST /api/v1/auth/refresh-token
 * Refreshes the authentication token
 */
export const config = {
  type: 'api',
  method: 'POST',
  path: '/api/v1/auth/refresh-token',
  name: 'AuthRefreshTokenHandler',
  flows: ['game-flow'],
  emits: [],
}

export const handler = async (request: any) => {
  try {
    const authHeader = request.headers?.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { status: 401, body: { success: false, message: 'No token provided' } }
    }

    const token = authHeader.substring(7)
    const authService = getAuthService()

    // Verify current token
    const decoded = authService.verifyToken(token)

    if (!decoded) {
      return { status: 401, body: { success: false, message: 'Invalid token' } }
    }

    // Generate new token
    const newToken = authService.generateToken(decoded.playerId, decoded.username)

    return {
      status: 200,
      body: {
        success: true,
        message: 'Token refreshed',
        data: {
          token: newToken,
        },
      },
    }
  } catch (error: any) {
    console.error('Refresh token error:', error)
    return {
      status: 500,
      body: {
        success: false,
        message: error.message || 'Token refresh failed',
      },
    }
  }
}
