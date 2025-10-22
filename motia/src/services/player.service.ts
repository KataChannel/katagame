import { getDatabase } from './database.service'

/**
 * Player Data Model
 */
export interface Player {
  id: string
  username: string
  email: string
  password_hash: string
  level: number
  experience: number
  resources: {
    gold: number
    rice: number
    lumber: number
    stone: number
    culture: number
    gems: number
  }
  status: 'active' | 'inactive' | 'banned'
  region: string
  created_at: Date
  updated_at: Date
  last_login: Date | null
}

/**
 * PlayerService
 * Handles all player-related database operations
 */
export class PlayerService {
  private db = getDatabase()

  /**
   * Get player by ID
   */
  async getPlayer(playerId: string): Promise<Player | null> {
    return await this.db.getById<Player>('players', playerId)
  }

  /**
   * Get player by username
   */
  async getPlayerByUsername(username: string): Promise<Player | null> {
    const players = await this.db.getMany<Player>('players', { username })
    return players[0] || null
  }

  /**
   * Create new player
   */
  async createPlayer(
    username: string,
    email: string,
    passwordHash: string
  ): Promise<Player> {
    return await this.db.insert<Player>('players', {
      username,
      email,
      password_hash: passwordHash,
      level: 1,
      experience: 0,
      resources: {
        gold: 200,
        rice: 100,
        lumber: 50,
        stone: 30,
        culture: 20,
        gems: 1500,
      },
      status: 'active',
      region: 'global',
      created_at: new Date(),
      updated_at: new Date(),
      last_login: null,
    })
  }

  /**
   * Update player
   */
  async updatePlayer(
    playerId: string,
    data: Partial<Player>
  ): Promise<Player> {
    return await this.db.update<Player>('players', playerId, data)
  }

  /**
   * Update player resources
   */
  async updateResources(
    playerId: string,
    updates: Partial<Player['resources']>
  ): Promise<Player> {
    const player = await this.getPlayer(playerId)
    if (!player) throw new Error('Player not found')

    const updatedResources = {
      ...player.resources,
      ...updates,
    }

    return await this.updatePlayer(playerId, {
      resources: updatedResources,
    })
  }

  /**
   * Award experience
   */
  async awardExperience(playerId: string, amount: number): Promise<Player> {
    const player = await this.getPlayer(playerId)
    if (!player) throw new Error('Player not found')

    const newExperience = player.experience + amount
    let newLevel = player.level

    // Calculate new level (every 1000 exp = 1 level)
    newLevel = Math.floor(newExperience / 1000) + 1

    return await this.updatePlayer(playerId, {
      experience: newExperience,
      level: newLevel,
    })
  }

  /**
   * Update last login
   */
  async updateLastLogin(playerId: string): Promise<Player> {
    return await this.updatePlayer(playerId, {
      last_login: new Date(),
    })
  }

  /**
   * Get leaderboard (top 100 players)
   */
  async getLeaderboard(
    limit: number = 100,
    offset: number = 0
  ): Promise<Player[]> {
    return await this.db.raw<Player>(
      `
        SELECT * FROM players
        WHERE status = 'active'
        ORDER BY experience DESC
        LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    )
  }

  /**
   * Get player count
   */
  async getTotalPlayers(): Promise<number> {
    const result = await this.db.raw<{ count: number }>(
      `SELECT COUNT(*) as count FROM players WHERE status = 'active'`
    )
    return result[0]?.count || 0
  }

  /**
   * Get active players today
   */
  async getActivePlayers(): Promise<number> {
    const result = await this.db.raw<{ count: number }>(
      `
        SELECT COUNT(*) as count FROM players
        WHERE status = 'active' 
        AND last_login IS NOT NULL
        AND DATE(last_login) = CURRENT_DATE
      `
    )
    return result[0]?.count || 0
  }

  /**
   * Bulk get players by IDs
   */
  async getPlayersByIds(playerIds: string[]): Promise<Map<string, Player>> {
    if (playerIds.length === 0) return new Map()

    const placeholders = playerIds.map((_, idx) => `$${idx + 1}`).join(', ')
    const players = await this.db.raw<Player>(
      `SELECT * FROM players WHERE id IN (${placeholders})`,
      playerIds
    )

    const map = new Map<string, Player>()
    players.forEach((player) => map.set(player.id, player))
    return map
  }

  /**
   * Delete player (soft delete)
   */
  async deletePlayer(playerId: string): Promise<Player> {
    return await this.updatePlayer(playerId, {
      status: 'inactive',
    })
  }

  /**
   * Ban player
   */
  async banPlayer(playerId: string): Promise<Player> {
    return await this.updatePlayer(playerId, {
      status: 'banned',
    })
  }
}

// Export singleton
let playerService: PlayerService | null = null

export function getPlayerService(): PlayerService {
  if (!playerService) {
    playerService = new PlayerService()
  }
  return playerService
}
