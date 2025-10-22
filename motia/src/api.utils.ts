import { getAuthService } from './services/auth.service'
import { getConfig } from './config'

/**
 * API Response Wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: number
}

/**
 * API Request Context
 */
export interface ApiContext {
  playerId?: string
  username?: string
  isAuthenticated: boolean
}

/**
 * Create API response
 */
export function createResponse<T>(
  data: T,
  message?: string
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: Date.now(),
  }
}

/**
 * Create error response
 */
export function createErrorResponse(
  error: string,
  code: number = 400
): { response: ApiResponse; code: number } {
  return {
    response: {
      success: false,
      error,
      timestamp: Date.now(),
    },
    code,
  }
}

/**
 * Extract and verify JWT token from Authorization header
 */
export function extractToken(authHeader?: string): string | null {
  if (!authHeader) return null
  const [scheme, token] = authHeader.split(' ')
  return scheme === 'Bearer' ? token : null
}

/**
 * Verify token and create context
 */
export function verifyTokenAndCreateContext(
  token: string | null
): ApiContext {
  if (!token) {
    return { isAuthenticated: false }
  }

  const authService = getAuthService()
  const decoded = authService.verifyToken(token)

  if (!decoded) {
    return { isAuthenticated: false }
  }

  return {
    playerId: decoded.playerId,
    username: decoded.username,
    isAuthenticated: true,
  }
}

/**
 * Require authentication middleware
 */
export function requireAuth(context: ApiContext): boolean {
  return context.isAuthenticated
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private config = getConfig()
  private requests: Map<string, number[]> = new Map()

  isLimited(key: string): boolean {
    const now = Date.now()
    const windowStart = now - this.config.rateLimit.windowMs

    const requests = this.requests.get(key) || []
    const recentRequests = requests.filter((t) => t > windowStart)

    if (recentRequests.length >= this.config.rateLimit.maxRequests) {
      return true
    }

    recentRequests.push(now)
    this.requests.set(key, recentRequests)

    // Cleanup old entries
    if (recentRequests.length === this.config.rateLimit.maxRequests) {
      // Remove entry after window expires
      setTimeout(() => {
        this.requests.delete(key)
      }, this.config.rateLimit.windowMs)
    }

    return false
  }
}

/**
 * Validation utilities
 */
export const Validators = {
  isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(id)
  },

  isValidUsername(username: string): boolean {
    return username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username)
  },

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  isValidPassword(password: string): boolean {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
    return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password)
  },
}

/**
 * Logging utility
 */
export const ApiLogger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || '')
  },

  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '')
  },

  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || '')
  },

  debug: (message: string, data?: any) => {
    if (getConfig().logging.level === 'debug') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data || '')
    }
  },
}
