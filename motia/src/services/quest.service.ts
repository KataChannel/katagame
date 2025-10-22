import { getDatabase } from './database.service'

/**
 * Quest Data Model
 */
export interface Quest {
  id: string
  title: string
  dynasty: string
  content: string
  quiz: Array<{
    question: string
    options: string[]
    correctAnswer: number
    points: number
  }>
  culture_points: number
  difficulty: 'easy' | 'medium' | 'hard'
  created_at: Date
}

/**
 * Quest Progress Data Model
 */
export interface QuestProgress {
  id: string
  player_id: string
  quest_id: string
  score: number
  completed_at: Date
}

/**
 * QuestService
 * Handles all educational quest operations
 */
export class QuestService {
  private db = getDatabase()

  /**
   * Create a new quest
   */
  async createQuest(
    title: string,
    dynasty: string,
    content: string,
    quiz: Quest['quiz'],
    culturePoints: number,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<Quest> {
    return await this.db.insert<Quest>('educational_quests', {
      title,
      dynasty,
      content,
      quiz,
      culture_points: culturePoints,
      difficulty,
      created_at: new Date(),
    })
  }

  /**
   * Get quest by ID
   */
  async getQuest(questId: string): Promise<Quest | null> {
    return await this.db.getById<Quest>('educational_quests', questId)
  }

  /**
   * Get all quests (with filtering)
   */
  async getQuests(
    filters?: {
      dynasty?: string
      difficulty?: string
    },
    limit: number = 50,
    offset: number = 0
  ): Promise<Quest[]> {
    let query = `SELECT * FROM educational_quests WHERE 1=1`
    const params: any[] = []

    if (filters?.dynasty) {
      query += ` AND dynasty = $${params.length + 1}`
      params.push(filters.dynasty)
    }

    if (filters?.difficulty) {
      query += ` AND difficulty = $${params.length + 1}`
      params.push(filters.difficulty)
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    return await this.db.raw<Quest>(query, params)
  }

  /**
   * Get quests by dynasty
   */
  async getQuestsByDynasty(
    dynasty: string,
    limit: number = 50
  ): Promise<Quest[]> {
    return await this.db.raw<Quest>(
      `
        SELECT * FROM educational_quests
        WHERE dynasty = $1
        ORDER BY difficulty ASC, created_at DESC
        LIMIT $2
      `,
      [dynasty, limit]
    )
  }

  /**
   * Get quests by difficulty
   */
  async getQuestsByDifficulty(
    difficulty: 'easy' | 'medium' | 'hard',
    limit: number = 50
  ): Promise<Quest[]> {
    return await this.db.raw<Quest>(
      `
        SELECT * FROM educational_quests
        WHERE difficulty = $1
        ORDER BY created_at DESC
        LIMIT $2
      `,
      [difficulty, limit]
    )
  }

  /**
   * Record quest completion
   */
  async completeQuest(
    playerId: string,
    questId: string,
    score: number
  ): Promise<QuestProgress> {
    return await this.db.insert<QuestProgress>('quest_progress', {
      player_id: playerId,
      quest_id: questId,
      score,
      completed_at: new Date(),
    })
  }

  /**
   * Get player quest completion
   */
  async getPlayerQuestCompletion(
    playerId: string,
    questId: string
  ): Promise<QuestProgress | null> {
    const results = await this.db.raw<QuestProgress>(
      `
        SELECT * FROM quest_progress
        WHERE player_id = $1 AND quest_id = $2
      `,
      [playerId, questId]
    )
    return results[0] || null
  }

  /**
   * Get player completed quests
   */
  async getPlayerCompletedQuests(
    playerId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<QuestProgress[]> {
    return await this.db.raw<QuestProgress>(
      `
        SELECT * FROM quest_progress
        WHERE player_id = $1
        ORDER BY completed_at DESC
        LIMIT $2 OFFSET $3
      `,
      [playerId, limit, offset]
    )
  }

  /**
   * Get player quest count
   */
  async getPlayerCompletedQuestCount(playerId: string): Promise<number> {
    const result = await this.db.raw<{ count: number }>(
      `
        SELECT COUNT(*) as count FROM quest_progress
        WHERE player_id = $1
      `,
      [playerId]
    )
    return result[0]?.count || 0
  }

  /**
   * Get player culture earned from quests
   */
  async getPlayerCultureFromQuests(playerId: string): Promise<number> {
    const result = await this.db.raw<{ total_culture: number }>(
      `
        SELECT COALESCE(SUM(eq.culture_points * qp.score / 100), 0) as total_culture
        FROM quest_progress qp
        JOIN educational_quests eq ON qp.quest_id = eq.id
        WHERE qp.player_id = $1
      `,
      [playerId]
    )
    return result[0]?.total_culture || 0
  }

  /**
   * Get quest statistics
   */
  async getQuestStats(): Promise<{
    total_quests: number
    total_completions: number
    average_score: number
    quests_by_difficulty: Record<string, number>
  }> {
    const stats = await this.db.raw<any>(
      `
        SELECT
          COUNT(DISTINCT eq.id) as total_quests,
          COUNT(qp.id) as total_completions,
          COALESCE(AVG(qp.score), 0) as average_score
        FROM educational_quests eq
        LEFT JOIN quest_progress qp ON eq.id = qp.quest_id
      `
    )

    const byDifficulty = await this.db.raw<{
      difficulty: string
      count: number
    }>(
      `
        SELECT difficulty, COUNT(*) as count
        FROM educational_quests
        GROUP BY difficulty
      `
    )

    const difficultyMap = byDifficulty.reduce(
      (acc, row) => {
        acc[row.difficulty] = row.count
        return acc
      },
      {} as Record<string, number>
    )

    return {
      total_quests: stats[0]?.total_quests || 0,
      total_completions: stats[0]?.total_completions || 0,
      average_score: parseFloat(stats[0]?.average_score) || 0,
      quests_by_difficulty: difficultyMap,
    }
  }

  /**
   * Get most completed quests
   */
  async getMostCompletedQuests(limit: number = 10): Promise<
    Array<{
      quest_id: string
      title: string
      completion_count: number
      average_score: number
    }>
  > {
    return await this.db.raw<any>(
      `
        SELECT
          eq.id as quest_id,
          eq.title,
          COUNT(qp.id) as completion_count,
          COALESCE(AVG(qp.score), 0) as average_score
        FROM educational_quests eq
        LEFT JOIN quest_progress qp ON eq.id = qp.quest_id
        GROUP BY eq.id, eq.title
        ORDER BY completion_count DESC
        LIMIT $1
      `,
      [limit]
    )
  }
}

// Export singleton
let questService: QuestService | null = null

export function getQuestService(): QuestService {
  if (!questService) {
    questService = new QuestService()
  }
  return questService
}
