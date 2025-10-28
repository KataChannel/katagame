import { wrapResponse } from '../../src/utils/response.wrapper'
import { getAuthService } from '../../src/services/auth.service'
import { getNavigationService } from '../../src/services/navigation.service'

const config = {
  type: 'api' as const,
  method: 'GET',
  path: '/api/v1/navigation/player',
  name: 'MVP1 Get Player Navigation',
  flows: ['game-flow'],
  emits: [],
}

const handler = async (request: any) => {
  try {
    // Get auth token from headers
    const authHeader = request.headers?.authorization || request.headers?.Authorization
    
    // Extract and verify auth token
    const token = request.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return {
        status: 401,
        body: wrapResponse(401, { success: false, message: 'Unauthorized - No token provided' }),
      }
    }

    const authService = getAuthService()
    const decoded = await authService.verifyToken(token)
    if (!decoded || !decoded.playerId) {
      return {
        status: 401,
        body: wrapResponse(401, { success: false, message: 'Unauthorized - Invalid token' }),
      }
    }

    const playerId = decoded.playerId
    const navigationService = getNavigationService()
    
    // Get player navigation items
    const navigationItems = await navigationService.getPlayerNavigation(playerId)
    
    // Get locked features (for preview)
    const lockedFeatures = await navigationService.getLockedFeatures(playerId)
    
    return {
      status: 200,
      body: wrapResponse(200, {
        success: true,
        data: {
          playerId,
          navigation: navigationItems,
          locked: lockedFeatures,
          totalUnlocked: navigationItems.length,
          totalLocked: lockedFeatures.length,
        },
      }),
    }
  } catch (error: any) {
    console.error('Error getting player navigation:', error?.message || error)
    return {
      status: 500,
      body: wrapResponse(500, { success: false, message: 'Internal server error' }),
    }
  }
}

export { config, handler }
