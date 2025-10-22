import * as crypto from 'crypto'
import { getPlayerService } from './player.service'

/**
 * AuthenticationService
 * Handles user authentication and JWT token management
 */
export class AuthenticationService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-prod'
  private readonly JWT_EXPIRY = process.env.JWT_EXPIRY || '24h'
  private readonly SALT_ROUNDS = 10

  private playerService = getPlayerService()

  /**
   * Hash a password
   */
  hashPassword(password: string): string {
    const salt = crypto.randomBytes(this.SALT_ROUNDS).toString('hex')
    const hash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
      .toString('hex')
    return `${salt}$${hash}`
  }

  /**
   * Verify password
   */
  verifyPassword(password: string, hash: string): boolean {
    const [salt, originalHash] = hash.split('$')
    const newHash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
      .toString('hex')
    return newHash === originalHash
  }

  /**
   * Generate JWT token
   */
  generateToken(playerId: string, username: string): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    }

    const payload = {
      playerId,
      username,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
    }

    const headerEncoded = this.base64UrlEncode(JSON.stringify(header))
    const payloadEncoded = this.base64UrlEncode(JSON.stringify(payload))

    const signature = crypto
      .createHmac('sha256', this.JWT_SECRET)
      .update(`${headerEncoded}.${payloadEncoded}`)
      .digest('hex')

    const signatureEncoded = this.base64UrlEncode(signature)

    return `${headerEncoded}.${payloadEncoded}.${signatureEncoded}`
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): { playerId: string; username: string } | null {
    try {
      const [headerEncoded, payloadEncoded, signatureEncoded] = token.split('.')

      // Verify signature
      const signature = crypto
        .createHmac('sha256', this.JWT_SECRET)
        .update(`${headerEncoded}.${payloadEncoded}`)
        .digest('hex')

      const expectedSignature = this.base64UrlEncode(signature)

      if (signatureEncoded !== expectedSignature) {
        return null
      }

      // Decode payload
      const payload = JSON.parse(
        Buffer.from(payloadEncoded, 'base64').toString('utf-8')
      )

      // Check expiration
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return null
      }

      return {
        playerId: payload.playerId,
        username: payload.username,
      }
    } catch {
      return null
    }
  }

  /**
   * Register new player
   */
  async register(
    username: string,
    email: string,
    password: string
  ): Promise<{ token: string; playerId: string }> {
    // Check if user already exists
    const existing = await this.playerService.getPlayerByUsername(username)
    if (existing) {
      throw new Error('Username already taken')
    }

    // Hash password
    const passwordHash = this.hashPassword(password)

    // Create player
    const player = await this.playerService.createPlayer(
      username,
      email,
      passwordHash
    )

    // Generate token
    const token = this.generateToken(player.id, player.username)

    return { token, playerId: player.id }
  }

  /**
   * Login player
   */
  async login(
    username: string,
    password: string
  ): Promise<{ token: string; playerId: string }> {
    // Get player
    const player = await this.playerService.getPlayerByUsername(username)
    if (!player) {
      throw new Error('Invalid credentials')
    }

    // Verify password
    if (!this.verifyPassword(password, player.password_hash)) {
      throw new Error('Invalid credentials')
    }

    // Check if player is banned
    if (player.status === 'banned') {
      throw new Error('Player account is banned')
    }

    // Update last login
    await this.playerService.updateLastLogin(player.id)

    // Generate token
    const token = this.generateToken(player.id, player.username)

    return { token, playerId: player.id }
  }

  /**
   * Refresh token
   */
  refreshToken(token: string): string | null {
    const decoded = this.verifyToken(token)
    if (!decoded) return null

    return this.generateToken(decoded.playerId, decoded.username)
  }

  /**
   * Validate token
   */
  validateToken(token: string): boolean {
    return this.verifyToken(token) !== null
  }

  /**
   * Helper: Base64 URL encode
   */
  private base64UrlEncode(str: string | Buffer): string {
    const buffer = typeof str === 'string' ? Buffer.from(str, 'utf-8') : str
    return buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  /**
   * Helper: Base64 URL decode
   */
  private base64UrlDecode(str: string): string {
    let padded = str + '=='.substring(0, (4 - (str.length % 4)) % 4)
    return Buffer.from(
      padded.replace(/\-/g, '+').replace(/_/g, '/'),
      'base64'
    ).toString('utf-8')
  }
}

// Export singleton
let authService: AuthenticationService | null = null

export function getAuthService(): AuthenticationService {
  if (!authService) {
    authService = new AuthenticationService()
  }
  return authService
}
