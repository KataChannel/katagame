import { Handlers } from 'motia'

/**
 * Achievement Unlock Handler
 * - Monitors player progress toward achievements
 * - Automatically unlocks achievements when conditions met
 * - Awards achievement points
 * - Tracks achievement completion
 */

export const config = {
  type: 'cron',
  cron: '*/5 * * * *', // Every 5 minutes
  name: 'AchievementUnlockProcessor',
  description:
    'Process achievement unlocks, award points, track progress',
  emits: ['achievement.unlocked', 'player.points_earned'],
  flows: ['game-flow'],
}

export const handler: Handlers['AchievementUnlockProcessor'] = async ({
  logger,
  state,
  emit,
}: any) => {
  try {
    // Get all players
    const playerKeys = await state.list('player:*')

    for (const playerKey of playerKeys) {
      const player = await state.get(playerKey)

      if (!player) continue

      // Check various achievement conditions
      const achievements = [
        {
          id: 'first_win',
          name: 'First Victory',
          condition: (p: any) => (p.battles_won || 0) >= 1,
          points: 10,
        },
        {
          id: 'level_10',
          name: 'Level 10 Reached',
          condition: (p: any) => (p.level || 1) >= 10,
          points: 50,
        },
        {
          id: 'level_50',
          name: 'Level 50 Reached',
          condition: (p: any) => (p.level || 1) >= 50,
          points: 200,
        },
        {
          id: 'rich',
          name: 'I\'m Rich',
          condition: (p: any) => (p.resources?.gold || 0) >= 100000,
          points: 100,
        },
        {
          id: 'scholar',
          name: 'Scholar',
          condition: (p: any) => (p.resources?.culture || 0) >= 1000,
          points: 75,
        },
        {
          id: 'trader',
          name: 'Trader',
          condition: (p: any) => (p.marketplace_transactions || 0) >= 10,
          points: 60,
        },
        {
          id: 'warrior',
          name: 'Warrior',
          condition: (p: any) => (p.battles_won || 0) >= 50,
          points: 150,
        },
        {
          id: 'cultural_ambassador',
          name: 'Cultural Ambassador',
          condition: (p: any) => (p.quests_completed || 0) >= 20,
          points: 120,
        },
      ]

      // Check each achievement
      for (const achievement of achievements) {
        // Check if player already has this achievement
        const achievementKey = `achievement:${player.id}:${achievement.id}`
        const existing = await state.get(achievementKey)

        if (!existing && achievement.condition(player)) {
          // Unlock achievement
          await state.set(achievementKey, {
            playerId: player.id,
            achievementId: achievement.id,
            achievementName: achievement.name,
            points: achievement.points,
            unlockedAt: Date.now(),
          })

          // Add points to player
          player.achievement_points = (player.achievement_points || 0) + achievement.points

          // Emit achievement unlocked event
          await emit({
            topic: 'achievement.unlocked',
            data: {
              playerId: player.id,
              achievementId: achievement.id,
              achievementName: achievement.name,
              points: achievement.points,
              timestamp: Date.now(),
            },
          })

          logger.info('Achievement unlocked', {
            playerId: player.id,
            achievement: achievement.name,
          })
        }
      }

      // Update player with new achievement points
      await state.set(playerKey, player)
    }
  } catch (error) {
    logger.error('Error in AchievementUnlockProcessor', {
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
