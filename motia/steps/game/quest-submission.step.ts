import { Handlers } from 'motia'

/**
 * Educational Quest Submission Handler
 * - Validate quiz answers
 * - Award culture points based on score
 * - Track quest completion progress
 * - Check for achievement unlocks
 */

export const config = {
  type: 'cron',
  cron: '*/3 * * * *', // Check every 3 minutes
  name: 'QuestSubmissionProcessor',
  description: 'Process educational quest submissions, award culture points',
  emits: ['player.culture_earned', 'achievement.check'],
  flows: ['game-flow'],
}

export const handler: Handlers['QuestSubmissionProcessor'] = async ({
  logger,
  state,
  emit,
}: any) => {
  try {
    // Get all pending quest submissions
    const submissionKeys = await state.list('quest_submission:pending:*')

    for (const submissionKey of submissionKeys) {
      const submission = await state.get(submissionKey)

      if (!submission) continue

      const { playerId, questId, answers, timestamp } = submission

      // Get quest definition
      const quest = await state.get(`quest:${questId}`)
      const player = await state.get(`player:${playerId}`)

      if (!quest || !player) {
        logger.warn('Quest or player not found', { questId, playerId })
        continue
      }

      // Validate answers and calculate score
      let score = 0
      let maxScore = 0

      if (quest.quiz && Array.isArray(quest.quiz)) {
        for (let i = 0; i < quest.quiz.length; i++) {
          const question = quest.quiz[i]
          const points = question.points || 10

          maxScore += points

          if (answers[i] === question.correctAnswer) {
            score += points
          }
        }
      }

      // Calculate percentage and culture reward
      const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0
      const cultureReward = Math.floor(
        (quest.culture_points || 100) * (percentage / 100)
      )

      // Award culture points
      player.resources = player.resources || {}
      player.resources.culture = (player.resources.culture || 0) + cultureReward

      // Track completion
      const progressKey = `progress:${playerId}:${questId}`
      await state.set(progressKey, {
        questId,
        playerId,
        score: percentage,
        cultureEarned: cultureReward,
        completedAt: timestamp,
      })

      // Update player state
      await state.set(`player:${playerId}`, player)

      // Emit culture earned event
      await emit({
        topic: 'player.culture_earned',
        data: {
          playerId,
          culturePoints: cultureReward,
          questId,
          score: percentage,
          timestamp,
        },
      })

      // Check for achievement unlocks (education-based)
      if (percentage === 100) {
        await emit({
          topic: 'achievement.check',
          data: {
            playerId,
            achievementType: 'perfect_quests',
            value: 1,
            questId,
            timestamp,
          },
        })
      }

      // Mark submission as processed
      submission.status = 'completed'
      await state.set(submissionKey, submission)

      logger.info('Quest submitted', {
        playerId,
        questId,
        score: percentage,
        cultureEarned: cultureReward,
      })
    }
  } catch (error) {
    logger.error('Error in QuestSubmissionProcessor', {
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
