/**
 * Game Initialization API Routes
 * Handles player initialization with default resources, heroes, and stories
 */

import { Client } from 'pg'

// Database connection
const dbClient = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:11003/katagame',
})

// Initialize database connection
dbClient.connect().catch((err) => console.error('Database connection failed:', err))

// Routes definition for Motia framework
export const initRoutes = {
  /**
   * Initialize New Player
   * POST /api/init/player
   */
  'POST /api/init/player': async (req: any, res: any) => {
    try {
      const { username, email } = req.body

      if (!username || !email) {
        return res.status(400).json({ error: 'Username and email required' })
      }

      await dbClient.query('BEGIN')

      // Create player
      const playerRes = await dbClient.query(
        `INSERT INTO players (username, email, resources, created_at)
         VALUES ($1, $2, $3, NOW())
         RETURNING id, username, resources`,
        [
          username,
          email,
          JSON.stringify({
            gold: 200,
            rice: 100,
            wood: 50,
            stone: 30,
            bazan: 10,
            gems: 1500,
          }),
        ],
      )

      const playerId = playerRes.rows[0].id

      // Create player stats
      await dbClient.query(
        `INSERT INTO player_stats (player_id) VALUES ($1)`,
        [playerId],
      )

      // Unlock Hanoi province (starting province)
      const hanoiRes = await dbClient.query(
        'SELECT id FROM provinces WHERE id = 1 LIMIT 1'
      )

      if (hanoiRes.rows.length > 0) {
        await dbClient.query(
          `INSERT INTO player_provinces (player_id, province_id, farmer_level, resource_level, development_level)
           VALUES ($1, $2, 1, 1, 1)`,
          [playerId, 1],
        )
      }

      // Unlock first 5 heroes (MVP1 heroes)
      const mvp1HeroIds = [
        'hero_hung_vuong_i',
        'hero_ly_thai_to',
        'hero_ly_thanh_tong',
        'hero_tran_hung_dao',
        'hero_modern_leader',
      ]

      for (const heroId of mvp1HeroIds) {
        await dbClient.query(
          `INSERT INTO heroes (player_id, name, rarity)
           VALUES ($1, $2, 'common')
           ON CONFLICT DO NOTHING`,
          [playerId, heroId],
        )
      }

      await dbClient.query('COMMIT')

      res.json({
        success: true,
        player: {
          id: playerId,
          username: playerRes.rows[0].username,
          resources: playerRes.rows[0].resources,
        },
        message: 'Player initialized successfully',
      })
    } catch (error: any) {
      await dbClient.query('ROLLBACK')
      console.error('Error initializing player:', error)
      res.status(500).json({ error: error.message })
    }
  },

  /**
   * Get Player Init Status
   * GET /api/init/player/:playerId
   */
  'GET /api/init/player/:playerId': async (req: any, res: any) => {
    try {
      const { playerId } = req.params

      const playerRes = await dbClient.query(
        `SELECT 
          id, username, email, level, resources,
          premium_pass_active, created_at
         FROM players
         WHERE id = $1`,
        [playerId],
      )

      if (playerRes.rows.length === 0) {
        return res.status(404).json({ error: 'Player not found' })
      }

      const player = playerRes.rows[0]

      // Get player stats
      const statsRes = await dbClient.query(
        `SELECT * FROM player_stats WHERE player_id = $1`,
        [playerId],
      )

      // Get unlocked provinces
      const provincesRes = await dbClient.query(
        `SELECT 
          pp.province_id, p.name, p.name_english,
          pp.farmer_level, pp.resource_level, pp.development_level
         FROM player_provinces pp
         JOIN provinces p ON pp.province_id = p.id
         WHERE pp.player_id = $1`,
        [playerId],
      )

      // Get heroes
      const heroesRes = await dbClient.query(
        `SELECT 
          h.id, h.name, h.rarity, h.level
         FROM heroes h
         WHERE h.player_id = $1`,
        [playerId],
      )

      res.json({
        player: {
          id: player.id,
          username: player.username,
          level: player.level,
          resources: player.resources,
        },
        stats: statsRes.rows[0] || {},
        provinces: provincesRes.rows,
        heroes: heroesRes.rows,
      })
    } catch (error: any) {
      console.error('Error getting init status:', error)
      res.status(500).json({ error: error.message })
    }
  },

  /**
   * Get Game Initialization Data
   * GET /api/init/game-data
   */
  'GET /api/init/game-data': async (req: any, res: any) => {
    try {
      // Get provinces
      const provincesRes = await dbClient.query(
        `SELECT id, name, name_english, region, historical_eras, 
                base_gold_rate, base_rice_rate, base_wood_rate, base_stone_rate, base_bazan_rate,
                unlock_order
         FROM provinces
         ORDER BY unlock_order ASC LIMIT 10`,
      )

      // Get resources
      const resourcesRes = await dbClient.query(
        `SELECT id, name_vietnamese, name_english, emoji, element_type, 
                base_generation_rate, base_storage_capacity
         FROM resources
         ORDER BY element_type ASC`,
      )

      // Get buildings
      const buildingsRes = await dbClient.query(
        `SELECT id, name_vietnamese, name_english, building_type,
                base_gold_cost, base_rice_cost, base_wood_cost, base_stone_cost,
                construction_time_seconds, max_level
         FROM buildings
         ORDER BY building_type ASC`,
      )

      // Get MVP1 heroes (available)
      const heroesRes = await dbClient.query(
        `SELECT id, name_vietnamese, name_english, era, rarity, role,
                bonus_type, bonus_value, pet_name, pet_emoji
         FROM heroes
         WHERE is_available = true
         ORDER BY rarity DESC`,
      )

      res.json({
        provinces: provincesRes.rows,
        resources: resourcesRes.rows,
        buildings: buildingsRes.rows,
        heroes: heroesRes.rows,
        counts: {
          provinces: provincesRes.rows.length,
          resources: resourcesRes.rows.length,
          buildings: buildingsRes.rows.length,
          heroes: heroesRes.rows.length,
        },
      })
    } catch (error: any) {
      console.error('Error getting game data:', error)
      res.status(500).json({ error: error.message })
    }
  },

  /**
   * Get Stories & Quizzes
   * GET /api/init/stories?day=1
   */
  'GET /api/init/stories': async (req: any, res: any) => {
    try {
      const day = req.query.day || 1

      // Get story
      const storyRes = await dbClient.query(
        `SELECT id, day, title_vietnamese, title_english, content,
                category, era, province_id, reading_time_minutes,
                base_gold_reward, base_rice_reward, base_wood_reward
         FROM stories
         WHERE day = $1`,
        [day],
      )

      if (storyRes.rows.length === 0) {
        return res.status(404).json({ error: 'Story not found' })
      }

      const story = storyRes.rows[0]

      // Get quiz questions
      const quizRes = await dbClient.query(
        `SELECT id, question_number, question, options, correct_answer,
                difficulty, type
         FROM quiz_questions
         WHERE story_id = $1
         ORDER BY question_number ASC`,
        [story.id],
      )

      res.json({
        story,
        quiz: quizRes.rows,
      })
    } catch (error: any) {
      console.error('Error getting story:', error)
      res.status(500).json({ error: error.message })
    }
  },
}

export default initRoutes
