import { Handlers } from 'motia'

/**
 * Leaderboard Update Handler (Cron Job)
 * - Runs weekly to update rankings
 * - Calculates player power/rating scores
 * - Generates ranked lists
 * - Updates regional leaderboards
 */

export const config = {
  type: 'cron',
  cron: '0 0 * * 0', // Weekly on Sunday at midnight
  name: 'LeaderboardUpdateCron',
  description:
    'Weekly leaderboard update, calculate rankings, distribute rewards',
  emits: ['leaderboard.updated', 'season.rewards_distributed'],
  flows: ['game-flow'],
}

export const handler: Handlers['LeaderboardUpdateCron'] = async ({
  logger,
  state,
  emit,
}: any) => {
  try {
    const timestamp = Date.now()

    // Get all players
    const playerKeys = await state.list('player:*')
    const players: any[] = []

    for (const playerKey of playerKeys) {
      const player = await state.get(playerKey)
      if (player) {
        players.push(player)
      }
    }

    // Sort by experience (power)
    const sorted = players.sort((a, b) => (b.experience || 0) - (a.experience || 0))

    // Update leaderboard positions
    for (let i = 0; i < sorted.length; i++) {
      const entry = {
        playerId: sorted[i].id,
        playerName: sorted[i].username,
        rank: i + 1,
        score: sorted[i].experience || 0,
        level: sorted[i].level || 1,
        updated: timestamp,
      }

      await state.set(`leaderboard:rank:${sorted[i].id}`, entry)
    }

    // Create top 10 summary
    const topPlayers = sorted.slice(0, 10).map((p, idx) => ({
      rank: idx + 1,
      name: p.username,
      experience: p.experience || 0,
      level: p.level || 1,
    }))

    // Store leaderboard snapshot
    await state.set(`leaderboard:snapshot:${new Date().toISOString()}`, {
      topPlayers,
      totalPlayers: players.length,
      timestamp,
    })

    // Emit leaderboard updated event
    await emit({
      topic: 'leaderboard.updated',
      data: {
        totalPlayers: players.length,
        topPlayers,
        timestamp,
      },
    })

    // Distribute weekly rewards to top 10
    const rewardTiers = [
      { rank: 1, gold: 5000, gems: 500 },
      { rank: 2, gold: 3000, gems: 300 },
      { rank: 3, gold: 2000, gems: 200 },
      { rank: 4, gold: 1000, gems: 100 },
      { rank: 5, gold: 800, gems: 80 },
      { rank: 6, gold: 600, gems: 60 },
      { rank: 7, gold: 400, gems: 40 },
      { rank: 8, gold: 300, gems: 30 },
      { rank: 9, gold: 200, gems: 20 },
      { rank: 10, gold: 100, gems: 10 },
    ]

    for (const tier of rewardTiers) {
      if (tier.rank <= sorted.length) {
        const player = sorted[tier.rank - 1]
        player.resources.gold = (player.resources.gold || 0) + tier.gold
        player.resources.gems = (player.resources.gems || 0) + tier.gems

        await state.set(`player:${player.id}`, player)

        await emit({
          topic: 'season.rewards_distributed',
          data: {
            playerId: player.id,
            rank: tier.rank,
            rewards: {
              gold: tier.gold,
              gems: tier.gems,
            },
            timestamp,
          },
        })
      }
    }

    logger.info('Leaderboard updated', {
      totalPlayers: players.length,
      topPlayer: sorted[0]?.username,
    })
  } catch (error) {
    logger.error('Error in LeaderboardUpdateCron', {
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
