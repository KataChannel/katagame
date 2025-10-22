import { Handlers } from 'motia'

/**
 * Achievement Unlocked Subscriber
 * - Handles achievement.unlocked events
 * - Notifies players of achievements
 * - Updates player statistics
 */

export const config = {
  type: 'subscriber',
  topic: 'achievement.unlocked',
  name: 'AchievementUnlockedSubscriber',
  description: 'Handle achievement unlock notifications',
  flows: ['game-flow'],
}

export const handler: Handlers['AchievementUnlockedSubscriber'] = async ({
  logger,
  data,
  state,
}: any) => {
  try {
    const { playerId, achievementId, achievementName, points, timestamp } = data

    // Get player
    const player = await state.get('player', playerId)
    if (!player) {
      logger.warn('Player not found for achievement unlock', { playerId })
      return
    }

    // Log achievement
    logger.info('Achievement unlocked notification', {
      playerId,
      achievementId,
      achievementName,
      points,
    })

    // Could send notification here to player
    // For now, just log it
  } catch (error) {
    logger.error('Error in AchievementUnlockedSubscriber', {
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
