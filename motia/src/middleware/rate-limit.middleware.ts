/**
 * Rate Limiting Middleware
 * Prevents abuse by limiting requests per IP address
 */

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
  keyGenerator?: (request: any) => string
}

interface ClientRequest {
  count: number
  resetTime: number
}

class RateLimitMiddleware {
  private clients: Map<string, ClientRequest> = new Map()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = {
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config,
    }

    // Cleanup old entries every minute
    setInterval(() => this.cleanup(), 60000)
  }

  /**
   * Get client IP from request
   */
  private getClientIp(request: any): string {
    return (
      request.headers?.['x-forwarded-for']?.split(',')[0] ||
      request.headers?.['x-real-ip'] ||
      request.ip ||
      'unknown'
    )
  }

  /**
   * Get rate limit key for client
   */
  private getKey(request: any): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(request)
    }
    return this.getClientIp(request)
  }

  /**
   * Check if request should be rate limited
   */
  isLimited(request: any): { limited: boolean; retryAfter?: number } {
    const key = this.getKey(request)
    const now = Date.now()
    const client = this.clients.get(key)

    // First request from this client
    if (!client) {
      this.clients.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      })
      return { limited: false }
    }

    // Check if window has expired
    if (now > client.resetTime) {
      this.clients.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs,
      })
      return { limited: false }
    }

    // Increment counter
    client.count++

    // Check if limit exceeded
    if (client.count > this.config.maxRequests) {
      const retryAfter = Math.ceil((client.resetTime - now) / 1000)
      return { limited: true, retryAfter }
    }

    return { limited: false }
  }

  /**
   * Get remaining requests for client
   */
  getRemaining(request: any): { remaining: number; resetTime: number } {
    const key = this.getKey(request)
    const client = this.clients.get(key)
    const now = Date.now()

    if (!client || now > client.resetTime) {
      return {
        remaining: this.config.maxRequests,
        resetTime: now + this.config.windowMs,
      }
    }

    return {
      remaining: Math.max(0, this.config.maxRequests - client.count),
      resetTime: client.resetTime,
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, client] of this.clients.entries()) {
      if (now > client.resetTime) {
        this.clients.delete(key)
      }
    }
  }
}

/**
 * Create middleware instances for different rate limits
 */
const generalLimiter = new RateLimitMiddleware({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
})

const authLimiter = new RateLimitMiddleware({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 attempts per minute
})

const battleLimiter = new RateLimitMiddleware({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 50, // 50 battles per minute
})

export { RateLimitMiddleware, generalLimiter, authLimiter, battleLimiter }
