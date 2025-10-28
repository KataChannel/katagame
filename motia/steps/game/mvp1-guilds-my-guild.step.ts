import { wrapResponse } from '../../src/utils/response.wrapper'
import { getAuthService } from '../../src/services/auth.service'
import { getDatabase, initDatabase } from '../../src/services/database.service'

const config = {
  type: 'api' as const,
  method: 'GET',
  path: '/api/v1/guilds/my-guild',
  name: 'MVP1 Get Player Guild Info',
  flows: ['game-flow'],
  emits: [],
}

const handler = async (request: any) => {
  try {
    // Initialize database FIRST
    const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame'
    try {
      getDatabase()
    } catch {
      await initDatabase(databaseUrl)
    }

    const token = request.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return {
        status: 401,
        body: wrapResponse(401, { success: false, message: 'Unauthorized' }),
      }
    }

    const authService = getAuthService()
    const decoded = await authService.verifyToken(token)
    if (!decoded || !decoded.playerId) {
      return {
        status: 401,
        body: wrapResponse(401, { success: false, message: 'Invalid token' }),
      }
    }

    const db = getDatabase()

    // Get player's guild membership
    const memberResult = await db.query(
      `SELECT gm.guild_id, gm.rank, gm.contribution_points
      FROM guild_members gm
      WHERE gm.player_id = $1
      LIMIT 1`,
      [decoded.playerId]
    )

    if (memberResult.rows.length === 0) {
      return {
        status: 200,
        body: wrapResponse(200, {
          success: true,
          data: {
            playerId: decoded.playerId,
            guild: null,
            message: 'Player is not in a guild',
          },
        }),
      }
    }

    const guildId = memberResult.rows[0].guild_id
    const playerRank = memberResult.rows[0].rank
    const contributionPoints = memberResult.rows[0].contribution_points

    // Get guild info
    const guildResult = await db.query(
      `SELECT id, name, leader_id, level, total_power, members_count, treasury, status, description, logo_url
      FROM guilds
      WHERE id = $1`,
      [guildId]
    )

    if (guildResult.rows.length === 0) {
      return {
        status: 404,
        body: wrapResponse(404, { success: false, message: 'Guild not found' }),
      }
    }

    const guild = guildResult.rows[0]

    // Get guild members
    const membersResult = await db.query(
      `SELECT gm.player_id, p.username, gm.rank, gm.contribution_points
      FROM guild_members gm
      JOIN players p ON gm.player_id = p.id
      WHERE gm.guild_id = $1
      ORDER BY gm.rank = 'leader' DESC, gm.contribution_points DESC`,
      [guildId]
    )

    const members = membersResult.rows.map((row: any) => ({
      playerId: row.player_id,
      username: row.username,
      rank: row.rank,
      contributionPoints: row.contribution_points,
    }))

    return {
      status: 200,
      body: wrapResponse(200, {
        success: true,
        data: {
          playerId: decoded.playerId,
          guild: {
            guildId: guild.id,
            name: guild.name,
            leaderId: guild.leader_id,
            level: guild.level,
            totalPower: guild.total_power,
            membersCount: guild.members_count,
            treasury: guild.treasury,
            status: guild.status,
            description: guild.description,
            logoUrl: guild.logo_url,
          },
          playerRole: {
            rank: playerRank,
            contributionPoints,
          },
          members,
        },
      }),
    }
  } catch (error: any) {
    console.error('Error getting player guild:', error?.message || error, error?.stack || '')
    return {
      status: 500,
      body: wrapResponse(500, { success: false, message: `Internal server error: ${error?.message || 'Unknown'}` }),
    }
  }
}

export { config, handler }
