/**
 * Quiz Service
 * Handles quiz scoring, rewards, and tracking
 */

import { Client } from 'pg'
import { MVP1_CONFIG } from '../config/mvp1.config'

export class QuizService {
  private dbClient: Client

  constructor(dbClient: Client) {
    this.dbClient = dbClient
  }

  /**
   * Get quiz questions for a story
   */
  async getQuizQuestions(storyId: string) {
    try {
      const query = `
        SELECT 
          id, story_id, question_number, question, options,
          correct_answer, difficulty, type
        FROM quiz_questions
        WHERE story_id = $1
        ORDER BY question_number ASC
      `
      const result = await this.dbClient.query(query, [storyId])
      return result.rows
    } catch (error: any) {
      throw new Error(`Failed to fetch quiz questions: ${error.message}`)
    }
  }

  /**
   * Calculate quiz score and rewards
   */
  calculateQuizRewards(correctAnswers: number) {
    const scoring = MVP1_CONFIG.QUIZ_CONFIG.SCORING

    let tier
    switch (correctAnswers) {
      case 3:
        tier = scoring.PERFECT
        break
      case 2:
        tier = scoring.GOOD
        break
      case 1:
        tier = scoring.PARTIAL
        break
      default:
        tier = scoring.LEARNING
    }

    return {
      correct_answers: correctAnswers,
      multiplier: tier.multiplier,
      rewards: {
        gold: MVP1_CONFIG.STORY_REWARDS_BASE.gold * tier.multiplier,
        rice: MVP1_CONFIG.STORY_REWARDS_BASE.rice * tier.multiplier,
        wood: MVP1_CONFIG.STORY_REWARDS_BASE.wood * tier.multiplier,
      },
      bonus: {
        gold: tier.bonus_gold,
        rice: tier.bonus_rice,
        wood: tier.bonus_wood,
      },
    }
  }

  /**
   * Submit quiz answers and calculate results
   */
  async submitQuizAnswers(
    playerId: string,
    storyId: string,
    answers: number[], // Array of selected option indices
  ) {
    try {
      // Get quiz questions
      const questionsResult = await this.dbClient.query(
        `SELECT id, question_number, correct_answer FROM quiz_questions 
         WHERE story_id = $1 ORDER BY question_number ASC`,
        [storyId],
      )

      const questions = questionsResult.rows
      let correctCount = 0

      // Calculate correct answers
      for (let i = 0; i < questions.length; i++) {
        if (answers[i] === questions[i].correct_answer) {
          correctCount++
        }
      }

      // Calculate rewards
      const rewards = this.calculateQuizRewards(correctCount)

      // Update player stats and resources
      await this.dbClient.query('BEGIN')

      // Update daily quest progress
      await this.dbClient.query(
        `UPDATE daily_quest_progress 
         SET quiz_attempted = true, quiz_score = $1
         WHERE player_id = $2 AND quest_date = CURRENT_DATE AND story_id = $3`,
        [correctCount, playerId, storyId],
      )

      // Update player stats
      const statsQuery = `
        UPDATE player_stats
        SET 
          quizzes_taken = quizzes_taken + 1,
          quizzes_passed = quizzes_passed + CASE WHEN $1 >= 2 THEN 1 ELSE 0 END,
          perfect_quizzes = perfect_quizzes + CASE WHEN $1 = 3 THEN 1 ELSE 0 END
        WHERE player_id = $2
        RETURNING *
      `
      const statsResult = await this.dbClient.query(statsQuery, [
        correctCount,
        playerId,
      ])

      // Update player resources
      const totalGold = rewards.rewards.gold + rewards.bonus.gold
      const totalRice = rewards.rewards.rice + rewards.bonus.rice
      const totalWood = rewards.rewards.wood + rewards.bonus.wood

      await this.dbClient.query(
        `UPDATE players
         SET resources = jsonb_set(
           jsonb_set(
             jsonb_set(
               resources,
               '{gold}',
               to_jsonb((CAST(resources->>'gold' AS INTEGER) + $1))
             ),
             '{rice}',
             to_jsonb((CAST(resources->>'rice' AS INTEGER) + $2))
           ),
           '{wood}',
           to_jsonb((CAST(resources->>'wood' AS INTEGER) + $3))
         )
         WHERE id = $4`,
        [totalGold, totalRice, totalWood, playerId],
      )

      await this.dbClient.query('COMMIT')

      return {
        success: true,
        quiz_result: {
          correct_answers: correctCount,
          total_questions: questions.length,
          score_percentage: Math.round((correctCount / questions.length) * 100),
        },
        rewards: {
          ...rewards.rewards,
          bonus: rewards.bonus,
          multiplier: rewards.multiplier,
        },
        player_stats: statsResult.rows[0],
      }
    } catch (error: any) {
      await this.dbClient.query('ROLLBACK')
      throw new Error(`Failed to submit quiz answers: ${error.message}`)
    }
  }

  /**
   * Get player quiz statistics
   */
  async getPlayerQuizStats(playerId: string) {
    try {
      const query = `
        SELECT 
          quizzes_taken,
          quizzes_passed,
          perfect_quizzes,
          CASE 
            WHEN quizzes_taken > 0 
            THEN ROUND((quizzes_passed::NUMERIC / quizzes_taken) * 100, 1)
            ELSE 0
          END AS pass_rate
        FROM player_stats
        WHERE player_id = $1
      `
      const result = await this.dbClient.query(query, [playerId])
      return result.rows[0] || null
    } catch (error: any) {
      throw new Error(`Failed to fetch player quiz stats: ${error.message}`)
    }
  }

  /**
   * Get leaderboard by quiz performance
   */
  async getQuizLeaderboard(limit = 100) {
    try {
      const query = `
        SELECT 
          p.username,
          ps.quizzes_taken,
          ps.perfect_quizzes,
          ROUND((ps.quizzes_passed::NUMERIC / ps.quizzes_taken) * 100, 1) AS pass_rate,
          ROUND((ps.perfect_quizzes::NUMERIC / NULLIF(ps.quizzes_taken, 0)) * 100, 1) AS perfect_rate
        FROM player_stats ps
        JOIN players p ON ps.player_id = p.id
        WHERE ps.quizzes_taken > 0
        ORDER BY ps.perfect_quizzes DESC, ps.quizzes_passed DESC
        LIMIT $1
      `
      const result = await this.dbClient.query(query, [limit])
      return result.rows
    } catch (error: any) {
      throw new Error(`Failed to fetch quiz leaderboard: ${error.message}`)
    }
  }
}
