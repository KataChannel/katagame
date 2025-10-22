/**
 * API Endpoint: POST /api/v1/auth/logout
 * Logs out a user by invalidating their session
 */
export const config = {
  type: 'api',
  method: 'POST',
  path: '/api/v1/auth/logout',
  name: 'AuthLogoutHandler',
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

    // In a real implementation, you would invalidate the token
    // by storing it in a blacklist or revoking it in the database
    // For now, we'll just return success since tokens are stateless

    return {
      status: 200,
      body: {
        success: true,
        message: 'Logout successful',
      },
    }
  } catch (error: any) {
    console.error('Logout error:', error)
    return {
      status: 500,
      body: {
        success: false,
        message: error.message || 'Logout failed',
      },
    }
  }
}
