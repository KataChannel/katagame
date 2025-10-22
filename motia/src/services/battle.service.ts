import { getDatabase } from './database.service'

/**
 * Battle Data Model
 */
export interface Battle {
  id: string
  attacker_id: string
  defender_id: string
  battle_type: 'pvp' | 'pve' | 'guild_war'
  result: 'attacker_win' | 'defender_win' | 'draw'
  attacker_reward: {
    exp: number
    gold: number
    rating: number
  }
  defender_reward: {
    exp: number
    gold: number
    rating: number
  }
  duration: number
  created_at: Date
}

/**
 * BattleService
 * Handles all battle-related operations
 */
export class BattleService {
  private db = getDatabase()

  /**
   * Create a new battle record
   */
  async createBattle(
    attackerId: string,
    defenderId: string,
    battleType: 'pvp' | 'pve' | 'guild_war' = 'pvp'
  ): Promise<Battle> {
    return await this.db.insert<Battle>('battles', {
      attacker_id: attackerId,
      defender_id: defenderId,
      battle_type: battleType,
      result: 'draw', // Will be updated
      attacker_reward: { exp: 0, gold: 0, rating: 0 },
      defender_reward: { exp: 0, gold: 0, rating: 0 },
      duration: 0,
      created_at: new Date(),
    })
  }

  /**
   * Get battle by ID
   */
  async getBattle(battleId: string): Promise<Battle | null> {
    return await this.db.getById<Battle>('battles', battleId)
  }

  /**
   * Get battles by attacker
   */
  async getBattlesByAttacker(
    attackerId: string,
    limit: number = 50
  ): Promise<Battle[]> {
    return await this.db.raw<Battle>(
      `
        SELECT * FROM battles
        WHERE attacker_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `,
      [attackerId, limit]
    )
  }

  /**
   * Get battles by defender
   */
  async getBattlesByDefender(
    defenderId: string,
    limit: number = 50
  ): Promise<Battle[]> {
    return await this.db.raw<Battle>(
      `
        SELECT * FROM battles
        WHERE defender_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `,
      [defenderId, limit]
    )
  }

  /**
   * Get battles between two players
   */
  async getBattlesBetweenPlayers(
    playerId1: string,
    playerId2: string,
    limit: number = 20
  ): Promise<Battle[]> {
    return await this.db.raw<Battle>(
      `
        SELECT * FROM battles
        WHERE (attacker_id = $1 AND defender_id = $2)
          OR (attacker_id = $2 AND defender_id = $1)
        ORDER BY created_at DESC
        LIMIT $3
      `,
      [playerId1, playerId2, limit]
    )
  }

  /**
   * Update battle with result
   */
  async updateBattle(
    battleId: string,
    result: Battle['result'],
    attackerReward: Battle['attacker_reward'],
    defenderReward: Battle['defender_reward'],
    duration: number
  ): Promise<Battle> {
    return await this.db.update<Battle>('battles', battleId, {
      result,
      attacker_reward: attackerReward,
      defender_reward: defenderReward,
      duration,
    })
  }

  /**
   * Get player win count
   */
  async getPlayerWins(playerId: string): Promise<number> {
    const result = await this.db.raw<{ count: number }>(
      `
        SELECT COUNT(*) as count FROM battles
        WHERE attacker_id = $1 AND result = 'attacker_win'
          OR defender_id = $1 AND result = 'defender_win'
      `,
      [playerId]
    )
    return result[0]?.count || 0
  }

  /**
   * Get player battle count
   */
  async getPlayerBattleCount(playerId: string): Promise<number> {
    const result = await this.db.raw<{ count: number }>(
      `
        SELECT COUNT(*) as count FROM battles
        WHERE attacker_id = $1 OR defender_id = $1
      `,
      [playerId]
    )
    return result[0]?.count || 0
  }

  /**
   * Get recent battles (for activity feed)
   */
  async getRecentBattles(limit: number = 20): Promise<Battle[]> {
    return await this.db.raw<Battle>(
      `
        SELECT * FROM battles
        ORDER BY created_at DESC
        LIMIT $1
      `,
      [limit]
    )
  }

  /**
   * Get total battles today
   */
  async getTotalBattlesToday(): Promise<number> {
    const result = await this.db.raw<{ count: number }>(
      `
        SELECT COUNT(*) as count FROM battles
        WHERE DATE(created_at) = CURRENT_DATE
      `
    )
    return result[0]?.count || 0
  }
}

// Export singleton
let battleService: BattleService | null = null

export function getBattleService(): BattleService {
  if (!battleService) {
    battleService = new BattleService()
  }
  return battleService
}
