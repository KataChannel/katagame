/**
 * Story Service
 * Handles story retrieval, tracking, and quiz completion
 */

import { Client } from 'pg'
import { MVP1_CONFIG } from '../config/mvp1.config'

export class StoryService {
  private dbClient: Client

  constructor(dbClient: Client) {
    this.dbClient = dbClient
  }

  /**
   * Get all available stories for MVP1 (paginated)
   */
  async getStories(limit = 30, offset = 0) {
    try {
      const query = `
        SELECT 
          s.id, s.day, s.title_vietnamese, s.title_english,
          s.content, s.category, s.era, s.province_id, s.hero_id,
          s.reading_time_minutes, s.word_count,
          s.base_gold_reward, s.base_rice_reward, s.base_wood_reward,
          s.is_available, s.created_at
        FROM stories s
        WHERE s.is_available = true
        ORDER BY s.day ASC
        LIMIT $1 OFFSET $2
      `
      const result = await this.dbClient.query(query, [limit, offset])
      return result.rows
    } catch (error: any) {
      throw new Error(`Failed to fetch stories: ${error.message}`)
    }
  }

  /**
   * Get story by day
   */
  async getStoryByDay(day: number) {
    try {
      const query = `
        SELECT 
          s.id, s.day, s.title_vietnamese, s.title_english,
          s.content, s.category, s.era, s.province_id, s.hero_id,
          s.reading_time_minutes, s.word_count,
          s.base_gold_reward, s.base_rice_reward, s.base_wood_reward,
          s.is_available
        FROM stories s
        WHERE s.day = $1 AND s.is_available = true
      `
      const result = await this.dbClient.query(query, [day])
      return result.rows[0] || null
    } catch (error: any) {
      throw new Error(`Failed to fetch story by day: ${error.message}`)
    }
  }

  /**
   * Get story with quiz questions
   */
  async getStoryWithQuiz(storyId: string) {
    try {
      const storyQuery = `
        SELECT 
          s.id, s.day, s.title_vietnamese, s.title_english,
          s.content, s.category, s.era, s.province_id, s.hero_id,
          s.reading_time_minutes, s.word_count,
          s.base_gold_reward, s.base_rice_reward, s.base_wood_reward,
          s.is_available
        FROM stories s
        WHERE s.id = $1
      `
      const storyResult = await this.dbClient.query(storyQuery, [storyId])
      if (storyResult.rows.length === 0) {
        return null
      }

      const story = storyResult.rows[0]

      // Get quiz questions
      const quizQuery = `
        SELECT 
          id, story_id, question_number, question, options,
          correct_answer, difficulty, type
        FROM quiz_questions
        WHERE story_id = $1
        ORDER BY question_number ASC
      `
      const quizResult = await this.dbClient.query(quizQuery, [storyId])

      return {
        ...story,
        quiz_questions: quizResult.rows,
      }
    } catch (error: any) {
      throw new Error(`Failed to fetch story with quiz: ${error.message}`)
    }
  }

  /**
   * Track story read event
   */
  async trackStoryRead(playerId: string, storyId: string) {
    try {
      const query = `
        INSERT INTO daily_quest_progress 
        (player_id, quest_date, story_id, story_read)
        VALUES ($1, CURRENT_DATE, $2, true)
        ON CONFLICT (player_id, quest_date, story_id) 
        DO UPDATE SET story_read = true
        RETURNING *
      `
      const result = await this.dbClient.query(query, [playerId, storyId])
      return result.rows[0]
    } catch (error: any) {
      throw new Error(`Failed to track story read: ${error.message}`)
    }
  }

  /**
   * Get player's daily quest progress
   */
  async getDailyProgress(playerId: string, date: string) {
    try {
      const query = `
        SELECT *
        FROM daily_quest_progress
        WHERE player_id = $1 AND quest_date = $2
        ORDER BY created_at DESC
      `
      const result = await this.dbClient.query(query, [playerId, date])
      return result.rows
    } catch (error: any) {
      throw new Error(`Failed to fetch daily progress: ${error.message}`)
    }
  }

  /**
   * Get player story reading stats
   */
  async getPlayerStoryStats(playerId: string) {
    try {
      const query = `
        SELECT 
          stories_read,
          stories_completed,
          learning_streak,
          last_story_read_at
        FROM player_stats
        WHERE player_id = $1
      `
      const result = await this.dbClient.query(query, [playerId])
      return result.rows[0] || null
    } catch (error: any) {
      throw new Error(`Failed to fetch player story stats: ${error.message}`)
    }
  }
}
