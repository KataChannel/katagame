import { Handlers } from 'motia'

/**
 * Player Points Earned Subscriber
 * - Handles player.points_earned events
 * - Updates player achievement points
 * - Tracks achievements progress
 */

export const config = {
  type: 'subscriber',
  topic: 'player.points_earned',
  name: 'PlayerPointsEarnedSubscriber',
  description: 'Handle player points earned events',
  flows: ['game-flow'],
}

export const handler: Handlers['PlayerPointsEarnedSubscriber'] = async ({
  logger,
  data,
  state,
}: any) => {
  try {
    const { playerId, points, reason, timestamp } = data

    // Get player
    const player = await state.get('player', playerId)
    if (!player) {
      logger.warn('Player not found for points earned', { playerId })
      return
    }

    // Update achievement points
    player.achievement_points = (player.achievement_points || 0) + points

    // Save updated player
    await state.set('player', playerId, player)

    logger.info('Player points earned', {
      playerId,
      points,
      reason,
      totalPoints: player.achievement_points,
    })
  } catch (error) {
    logger.error('Error in PlayerPointsEarnedSubscriber', {
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
