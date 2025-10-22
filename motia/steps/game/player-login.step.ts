import { Handlers } from 'motia'
import { z } from 'zod'

/**
 * Player Login Handler
 * - Records player login timestamp
 * - Awards daily login bonus (if first login of the day)
 * - Updates player last_login in database
 * - Emits daily reward event for other systems
 */

export const PayloadSchema = z.object({
  playerId: z.string().uuid(),
  timestamp: z.number().int(),
})

export type Payload = z.infer<typeof PayloadSchema>

export const config = {
  type: 'cron',
  cron: '*/5 * * * *', // Check every 5 minutes
  name: 'PlayerLoginProcessor',
  description: 'Process player logins, award daily rewards',
  emits: ['player.daily_reward_claimed', 'leaderboard.update'],
  flows: ['game-flow'],
}

export const handler: Handlers['PlayerLoginProcessor'] = async ({
  logger,
  state,
  emit,
}: any) => {
  try {
    // Get all players from state
    const playerKeys = await state.list('player:*')

    for (const playerKey of playerKeys) {
      const player = await state.get(playerKey)

      if (!player) {
        continue
      }

      const timestamp = Date.now()

      // Check if daily reward is eligible
      const lastLoginDate = player.last_login
        ? new Date(player.last_login).toDateString()
        : null
      const todayDate = new Date(timestamp).toDateString()

      const isDailyRewardEligible = lastLoginDate !== todayDate

      if (isDailyRewardEligible && player.last_login) {
        // Emit daily reward event
        await emit({
          topic: 'player.daily_reward_claimed',
          data: {
            playerId: player.id,
            rewards: {
              gold: 100,
              gems: 50,
              culture: 20,
            },
            timestamp,
          },
        })

        logger.info('Daily reward issued', {
          playerId: player.id,
          rewards: { gold: 100, gems: 50, culture: 20 },
        })
      }

      // Update last login timestamp if new login
      if (player.is_logged_in && !player.last_login) {
        const updatedPlayer = {
          ...player,
          last_login: timestamp,
        }

        await state.set(playerKey, updatedPlayer)

        // Emit leaderboard update event
        await emit({
          topic: 'leaderboard.update',
          data: {
            playerId: player.id,
            action: 'login',
            timestamp,
          },
        })

        logger.info('Player login recorded', {
          playerId: player.id,
          dailyRewardIssued: isDailyRewardEligible,
        })
      }
    }
  } catch (error) {
    logger.error('Error in PlayerLoginProcessor', {
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
