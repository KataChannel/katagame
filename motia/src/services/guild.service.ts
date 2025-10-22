import { getDatabase } from './database.service'

/**
 * Guild Data Model
 */
export interface Guild {
  id: string
  name: string
  leader_id: string
  total_power: number
  members_count: number
  treasury: {
    gold: number
    gems: number
  }
  created_at: Date
}

/**
 * Guild Member Data Model
 */
export interface GuildMember {
  id: string
  guild_id: string
  player_id: string
  rank: 'leader' | 'officer' | 'member'
  joined_at: Date
}

/**
 * GuildService
 * Handles all guild operations
 */
export class GuildService {
  private db = getDatabase()

  /**
   * Create a new guild
   */
  async createGuild(
    name: string,
    leaderId: string
  ): Promise<Guild> {
    return await this.db.insert<Guild>('guilds', {
      name,
      leader_id: leaderId,
      total_power: 0,
      members_count: 1,
      treasury: {
        gold: 0,
        gems: 0,
      },
      created_at: new Date(),
    })
  }

  /**
   * Get guild by ID
   */
  async getGuild(guildId: string): Promise<Guild | null> {
    return await this.db.getById<Guild>('guilds', guildId)
  }

  /**
   * Get guild by name
   */
  async getGuildByName(name: string): Promise<Guild | null> {
    const guilds = await this.db.getMany<Guild>('guilds', { name })
    return guilds[0] || null
  }

  /**
   * Get all guilds (paginated)
   */
  async getAllGuilds(
    limit: number = 50,
    offset: number = 0
  ): Promise<Guild[]> {
    return await this.db.raw<Guild>(
      `
        SELECT * FROM guilds
        ORDER BY members_count DESC
        LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    )
  }

  /**
   * Update guild
   */
  async updateGuild(
    guildId: string,
    data: Partial<Guild>
  ): Promise<Guild> {
    return await this.db.update<Guild>('guilds', guildId, data)
  }

  /**
   * Add member to guild
   */
  async addMember(
    guildId: string,
    playerId: string,
    rank: 'member' | 'officer' = 'member'
  ): Promise<GuildMember> {
    const guild = await this.getGuild(guildId)
    if (!guild) throw new Error('Guild not found')

    // Add member
    const member = await this.db.insert<GuildMember>('guild_members', {
      guild_id: guildId,
      player_id: playerId,
      rank,
      joined_at: new Date(),
    })

    // Update guild member count
    await this.updateGuild(guildId, {
      members_count: guild.members_count + 1,
    })

    return member
  }

  /**
   * Remove member from guild
   */
  async removeMember(
    guildId: string,
    playerId: string
  ): Promise<boolean> {
    const guild = await this.getGuild(guildId)
    if (!guild) throw new Error('Guild not found')

    const deleted = await this.db.delete('guild_members', playerId)

    if (deleted) {
      // Update guild member count
      await this.updateGuild(guildId, {
        members_count: Math.max(0, guild.members_count - 1),
      })
    }

    return deleted
  }

  /**
   * Get guild members
   */
  async getGuildMembers(guildId: string): Promise<GuildMember[]> {
    return await this.db.getMany<GuildMember>('guild_members', { guild_id: guildId })
  }

  /**
   * Get player guild membership
   */
  async getPlayerGuild(playerId: string): Promise<Guild | null> {
    const members = await this.db.raw<GuildMember>(
      `
        SELECT * FROM guild_members
        WHERE player_id = $1
      `,
      [playerId]
    )

    if (members.length === 0) return null

    return await this.getGuild(members[0].guild_id)
  }

  /**
   * Get guild member info
   */
  async getGuildMember(
    guildId: string,
    playerId: string
  ): Promise<GuildMember | null> {
    const members = await this.db.raw<GuildMember>(
      `
        SELECT * FROM guild_members
        WHERE guild_id = $1 AND player_id = $2
      `,
      [guildId, playerId]
    )
    return members[0] || null
  }

  /**
   * Update guild member rank
   */
  async updateMemberRank(
    guildId: string,
    playerId: string,
    rank: 'member' | 'officer' | 'leader'
  ): Promise<GuildMember> {
    return await this.db.update<GuildMember>(
      'guild_members',
      playerId,
      { rank }
    )
  }

  /**
   * Update guild power
   */
  async updateGuildPower(guildId: string): Promise<Guild> {
    const guild = await this.getGuild(guildId)
    if (!guild) throw new Error('Guild not found')

    // Calculate total power from all members
    const result = await this.db.raw<{ total_power: number }>(
      `
        SELECT COALESCE(SUM(p.experience), 0) as total_power
        FROM guild_members gm
        JOIN players p ON gm.player_id = p.id
        WHERE gm.guild_id = $1
      `,
      [guildId]
    )

    const totalPower = result[0]?.total_power || 0

    return await this.updateGuild(guildId, {
      total_power: totalPower,
    })
  }

  /**
   * Deposit to guild treasury
   */
  async depositToTreasury(
    guildId: string,
    gold: number,
    gems: number = 0
  ): Promise<Guild> {
    const guild = await this.getGuild(guildId)
    if (!guild) throw new Error('Guild not found')

    const updatedTreasury = {
      gold: (guild.treasury?.gold || 0) + gold,
      gems: (guild.treasury?.gems || 0) + gems,
    }

    return await this.updateGuild(guildId, {
      treasury: updatedTreasury,
    })
  }

  /**
   * Withdraw from guild treasury
   */
  async withdrawFromTreasury(
    guildId: string,
    gold: number,
    gems: number = 0
  ): Promise<Guild> {
    const guild = await this.getGuild(guildId)
    if (!guild) throw new Error('Guild not found')

    const currentGold = guild.treasury?.gold || 0
    const currentGems = guild.treasury?.gems || 0

    if (currentGold < gold || currentGems < gems) {
      throw new Error('Insufficient treasury funds')
    }

    const updatedTreasury = {
      gold: currentGold - gold,
      gems: currentGems - gems,
    }

    return await this.updateGuild(guildId, {
      treasury: updatedTreasury,
    })
  }

  /**
   * Get top guilds by member count
   */
  async getTopGuilds(limit: number = 10): Promise<Guild[]> {
    return await this.db.raw<Guild>(
      `
        SELECT * FROM guilds
        ORDER BY members_count DESC
        LIMIT $1
      `,
      [limit]
    )
  }

  /**
   * Get top guilds by power
   */
  async getTopGuildsByPower(limit: number = 10): Promise<Guild[]> {
    return await this.db.raw<Guild>(
      `
        SELECT * FROM guilds
        ORDER BY total_power DESC
        LIMIT $1
      `,
      [limit]
    )
  }

  /**
   * Delete guild
   */
  async deleteGuild(guildId: string): Promise<boolean> {
    return await this.db.delete('guilds', guildId)
  }
}

// Export singleton
let guildService: GuildService | null = null

export function getGuildService(): GuildService {
  if (!guildService) {
    guildService = new GuildService()
  }
  return guildService
}
