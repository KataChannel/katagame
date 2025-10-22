import { Handlers } from 'motia'
import { z } from 'zod'

/**
 * Battle Resolution Handler
 * Process battle results:
 * - Calculate rewards based on winner
 * - Update player experience
 * - Update leaderboard rankings
 * - Emit achievement unlock checks
 */

export const BattlePayloadSchema = z.object({
  attackerId: z.string().uuid(),
  defenderId: z.string().uuid(),
  result: z.enum(['attacker_win', 'defender_win', 'draw']),
  battleLog: z.record(z.any()).optional(),
  timestamp: z.number().int(),
})

export type BattlePayload = z.infer<typeof BattlePayloadSchema>

export const config = {
  type: 'cron',
  cron: '*/2 * * * *', // Check every 2 minutes
  name: 'BattleResolutionProcessor',
  description: 'Process battle results, award exp/gold, update leaderboard',
  emits: ['player.exp_gained', 'leaderboard.score_update', 'achievement.check'],
  flows: ['game-flow'],
}

export const handler: Handlers['BattleResolutionProcessor'] = async ({
  logger,
  state,
  emit,
}: any) => {
  try {
    // Get all pending battles from state
    const battles = await state.getGroup('battle:pending')

    for (const battle of battles) {
      if (!battle) continue

      const { attackerId, defenderId, result, timestamp } = battle

      // Get both players
      const attacker = await state.get('player', attackerId)
      const defender = await state.get('player', defenderId)

      if (!attacker || !defender) {
        logger.warn('Player not found in battle resolution', {
          attackerId,
          defenderId,
        })
        continue
      }

      // Determine rewards
      let attackerReward = { exp: 0, gold: 0, rating: 0 }
      let defenderReward = { exp: 0, gold: 0, rating: 0 }

      if (result === 'attacker_win') {
        attackerReward = { exp: 200, gold: 500, rating: 50 }
        defenderReward = { exp: 100, gold: 0, rating: -20 }
      } else if (result === 'defender_win') {
        attackerReward = { exp: 50, gold: 0, rating: -20 }
        defenderReward = { exp: 150, gold: 300, rating: 30 }
      } else {
        // Draw
        attackerReward = { exp: 75, gold: 100, rating: 0 }
        defenderReward = { exp: 75, gold: 100, rating: 0 }
      }

      // Update player states
      attacker.experience = (attacker.experience || 0) + attackerReward.exp
      attacker.resources.gold = (attacker.resources?.gold || 0) + attackerReward.gold

      defender.experience = (defender.experience || 0) + defenderReward.exp
      defender.resources.gold = (defender.resources?.gold || 0) + defenderReward.gold

      await state.set(`player:${attackerId}`, attacker)
      await state.set(`player:${defenderId}`, defender)

      // Emit rewards
      await emit({
        topic: 'player.exp_gained',
        data: {
          playerId: attackerId,
          exp: attackerReward.exp,
          source: 'battle',
          timestamp,
        },
      })

      await emit({
        topic: 'player.exp_gained',
        data: {
          playerId: defenderId,
          exp: defenderReward.exp,
          source: 'battle',
          timestamp,
        },
      })

      // Emit leaderboard updates
      await emit({
        topic: 'leaderboard.score_update',
        data: {
          playerId: attackerId,
          scoreChange: attackerReward.rating,
          boardType: 'pvp',
          timestamp,
        },
      })

      await emit({
        topic: 'leaderboard.score_update',
        data: {
          playerId: defenderId,
          scoreChange: defenderReward.rating,
          boardType: 'pvp',
          timestamp,
        },
      })

      // Check for achievement unlocks
      await emit({
        topic: 'achievement.check',
        data: {
          playerId: attackerId,
          achievementType: 'battles_won',
          value: result === 'attacker_win' ? 1 : 0,
          timestamp,
        },
      })

      // Mark battle as processed
      battle.status = 'completed'
      await state.set('battle:pending', battle.id, battle)

      logger.info('Battle resolved', {
        attacker: attackerId,
        defender: defenderId,
        winner: result,
        attackerReward,
        defenderReward,
      })
    }
  } catch (error) {
    logger.error('Error in BattleResolutionProcessor', {
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
