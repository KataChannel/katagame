import { getAuthService } from '../../src/services/auth.service'
import { successResponse, errorResponse } from '../../src/utils/response.wrapper'

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
      return errorResponse(401, 'No token provided')
    }

    const token = authHeader.substring(7)
    const authService = getAuthService()

    // Verify current token
    const decoded = authService.verifyToken(token)

    if (!decoded) {
      return errorResponse(401, 'Invalid token')
    }

    // Generate new token
    const newToken = authService.generateToken(decoded.playerId, decoded.username)

    return successResponse({
      token: newToken,
    }, 'Token refreshed successfully')
  } catch (error: any) {
    console.error('Refresh token error:', error)
    return errorResponse(500, error.message || 'Token refresh failed')
  }
}
