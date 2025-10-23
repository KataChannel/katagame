/**
 * MVP1 API Routes - v1
 * Complete REST API for MVP1 features
 */

import { Client } from 'pg'
import { StoryService } from '../services/story.service'
import { QuizService } from '../services/quiz.service'
import { ResourceService } from '../services/resource.service'
import { HeroService } from '../services/hero.service'
import { ProvinceService } from '../services/province.service'
import { MVP1_CONFIG } from '../config/mvp1.config'

let dbClient: Client

// Initialize services
const initializeServices = (client: Client) => {
  dbClient = client
}

// ============================================================================
// PLAYER ENDPOINTS
// ============================================================================

export const playerRoutes = {
  /**
   * GET /api/v1/players/profile
   * Get player profile and stats
   */
  'GET /api/v1/players/profile': async (req: any, res: any) => {
    try {
      const playerId = req.user?.id
      if (!playerId) return res.status(401).json({ error: 'Unauthorized' })

      const playerQuery = `
        SELECT 
          p.id, p.username, p.email, p.level, p.experience,
          p.resources, p.premium_pass_active, p.premium_expires_at,
          p.created_at, p.updated_at,
          ps.stories_read, ps.stories_completed, ps.quizzes_taken,
          ps.quizzes_passed, ps.perfect_quizzes, ps.heroes_collected,
          ps.culture_points, ps.learning_streak
        FROM players p
        LEFT JOIN player_stats ps ON p.id = ps.player_id
        WHERE p.id = $1
      `
      const result = await dbClient.query(playerQuery, [playerId])

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Player not found' })
      }

      res.json({
        success: true,
        player: result.rows[0],
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },

  /**
   * PUT /api/v1/players/profile
   * Update player profile
   */
  'PUT /api/v1/players/profile': async (req: any, res: any) => {
    try {
      const playerId = req.user?.id
      if (!playerId) return res.status(401).json({ error: 'Unauthorized' })

      const { username } = req.body

      const updateQuery = `
        UPDATE players
        SET username = COALESCE($1, username), updated_at = NOW()
        WHERE id = $2
        RETURNING id, username, email, level
      `
      const result = await dbClient.query(updateQuery, [username, playerId])

      res.json({
        success: true,
        player: result.rows[0],
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },
}

// ============================================================================
// STORY ENDPOINTS
// ============================================================================

export const storyRoutes = {
  /**
   * GET /api/v1/stories
   * Get all available stories with pagination
   */
  'GET /api/v1/stories': async (req: any, res: any) => {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 30, 100)
      const offset = parseInt(req.query.offset) || 0

      const storyService = new StoryService(dbClient)
      const stories = await storyService.getStories(limit, offset)

      res.json({
        success: true,
        stories,
        count: stories.length,
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },

  /**
   * GET /api/v1/stories/:day
   * Get specific story by day
   */
  'GET /api/v1/stories/:day': async (req: any, res: any) => {
    try {
      const day = parseInt(req.params.day)
      if (isNaN(day) || day < 1 || day > 365) {
        return res.status(400).json({ error: 'Invalid day parameter (1-365)' })
      }

      const storyService = new StoryService(dbClient)
      const story = await storyService.getStoryByDay(day)

      if (!story) {
        return res.status(404).json({ error: 'Story not found' })
      }

      res.json({
        success: true,
        story,
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },

  /**
   * GET /api/v1/stories/:id/quiz
   * Get story with quiz questions
   */
  'GET /api/v1/stories/:id/quiz': async (req: any, res: any) => {
    try {
      const storyId = req.params.id

      const storyService = new StoryService(dbClient)
      const story = await storyService.getStoryWithQuiz(storyId)

      if (!story) {
        return res.status(404).json({ error: 'Story not found' })
      }

      res.json({
        success: true,
        story,
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },

  /**
   * POST /api/v1/stories/:id/read
   * Track story read event
   */
  'POST /api/v1/stories/:id/read': async (req: any, res: any) => {
    try {
      const playerId = req.user?.id
      if (!playerId) return res.status(401).json({ error: 'Unauthorized' })

      const storyId = req.params.id

      const storyService = new StoryService(dbClient)
      const result = await storyService.trackStoryRead(playerId, storyId)

      res.json({
        success: true,
        message: 'Story read tracked',
        result,
      })
      return
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },
}

// ============================================================================
// QUIZ ENDPOINTS
// ============================================================================

export const quizRoutes = {
  /**
   * POST /api/v1/quizzes/:storyId/submit
   * Submit quiz answers and calculate score
   */
  'POST /api/v1/quizzes/:storyId/submit': async (req: any, res: any) => {
    try {
      const playerId = req.user?.id
      if (!playerId) return res.status(401).json({ error: 'Unauthorized' })

      const { answers } = req.body
      const storyId = req.params.storyId

      if (!Array.isArray(answers) || answers.length !== 3) {
        return res.status(400).json({ error: 'Must provide 3 answers' })
      }

      const quizService = new QuizService(dbClient)
      const result = await quizService.submitQuizAnswers(playerId, storyId, answers)

      res.json(result)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },

  /**
   * GET /api/v1/quizzes/stats
   * Get player quiz statistics
   */
  'GET /api/v1/quizzes/stats': async (req: any, res: any) => {
    try {
      const playerId = req.user?.id
      if (!playerId) return res.status(401).json({ error: 'Unauthorized' })

      const quizService = new QuizService(dbClient)
      const stats = await quizService.getPlayerQuizStats(playerId)

      res.json({
        success: true,
        stats,
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },

  /**
   * GET /api/v1/quizzes/leaderboard
   * Get global quiz leaderboard
   */
  'GET /api/v1/quizzes/leaderboard': async (req: any, res: any) => {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 100, 500)

      const quizService = new QuizService(dbClient)
      const leaderboard = await quizService.getQuizLeaderboard(limit)

      res.json({
        success: true,
        leaderboard,
        count: leaderboard.length,
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },
}

// ============================================================================
// RESOURCE ENDPOINTS
// ============================================================================

export const resourceRoutes = {
  /**
   * GET /api/v1/resources
   * Get all resource types
   */
  'GET /api/v1/resources': async (req: any, res: any) => {
    try {
      const resourceService = new ResourceService(dbClient)
      const resources = resourceService.getResources()

      res.json({
        success: true,
        resources,
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },

  /**
   * GET /api/v1/resources/my-resources
   * Get player's current resources
   */
  'GET /api/v1/resources/my-resources': async (req: any, res: any) => {
    try {
      const playerId = req.user?.id
      if (!playerId) return res.status(401).json({ error: 'Unauthorized' })

      const resourceService = new ResourceService(dbClient)
      const resources = await resourceService.getPlayerResources(playerId)

      res.json({
        success: true,
        resources,
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },

  /**
   * POST /api/v1/resources/harvest
   * Harvest resources from a province
   */
  'POST /api/v1/resources/harvest': async (req: any, res: any) => {
    try {
      const playerId = req.user?.id
      if (!playerId) return res.status(401).json({ error: 'Unauthorized' })

      const { province_id } = req.body
      if (!province_id) return res.status(400).json({ error: 'Province ID required' })

      const resourceService = new ResourceService(dbClient)
      const result = await resourceService.harvestResources(playerId, province_id)

      res.json(result)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },

  /**
   * GET /api/v1/resources/leaderboard
   * Get resource earnings leaderboard
   */
  'GET /api/v1/resources/leaderboard': async (req: any, res: any) => {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 100, 500)

      const resourceService = new ResourceService(dbClient)
      const leaderboard = await resourceService.getResourceLeaderboard(limit)

      res.json({
        success: true,
        leaderboard,
        count: leaderboard.length,
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },
}

// ============================================================================
// HERO ENDPOINTS
// ============================================================================

export const heroRoutes = {
  /**
   * GET /api/v1/heroes
   * Get all available heroes
   */
  'GET /api/v1/heroes': async (req: any, res: any) => {
    try {
      const heroService = new HeroService(dbClient)
      const heroes = await heroService.getAllHeroes()

      res.json({
        success: true,
        heroes,
        count: heroes.length,
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },

  /**
   * GET /api/v1/heroes/my-heroes
   * Get player's heroes
   */
  'GET /api/v1/heroes/my-heroes': async (req: any, res: any) => {
    try {
      const playerId = req.user?.id
      if (!playerId) return res.status(401).json({ error: 'Unauthorized' })

      const heroService = new HeroService(dbClient)
      const heroes = await heroService.getPlayerHeroes(playerId)

      res.json({
        success: true,
        heroes,
        count: heroes.length,
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },

  /**
   * POST /api/v1/heroes/recruit
   * Recruit a hero
   */
  'POST /api/v1/heroes/recruit': async (req: any, res: any) => {
    try {
      const playerId = req.user?.id
      if (!playerId) return res.status(401).json({ error: 'Unauthorized' })

      const { hero_id } = req.body
      if (!hero_id) return res.status(400).json({ error: 'Hero ID required' })

      const heroService = new HeroService(dbClient)
      const result = await heroService.recruitHero(playerId, hero_id)

      res.json(result)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },

  /**
   * POST /api/v1/heroes/deploy
   * Deploy hero to a province
   */
  'POST /api/v1/heroes/deploy': async (req: any, res: any) => {
    try {
      const playerId = req.user?.id
      if (!playerId) return res.status(401).json({ error: 'Unauthorized' })

      const { hero_id, province_id } = req.body
      if (!hero_id || !province_id) {
        return res.status(400).json({ error: 'Hero ID and Province ID required' })
      }

      const heroService = new HeroService(dbClient)
      const result = await heroService.deployHeroToProvince(playerId, hero_id, province_id)

      res.json(result)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },

  /**
   * GET /api/v1/heroes/leaderboard
   * Get hero collection leaderboard
   */
  'GET /api/v1/heroes/leaderboard': async (req: any, res: any) => {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 100, 500)

      const heroService = new HeroService(dbClient)
      const leaderboard = await heroService.getHeroLeaderboard(limit)

      res.json({
        success: true,
        leaderboard,
        count: leaderboard.length,
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },
}

// ============================================================================
// PROVINCE ENDPOINTS
// ============================================================================

export const provinceRoutes = {
  /**
   * GET /api/v1/provinces
   * Get all provinces
   */
  'GET /api/v1/provinces': async (req: any, res: any) => {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 100, 100)
      const offset = parseInt(req.query.offset) || 0

      const provinceService = new ProvinceService(dbClient)
      const provinces = await provinceService.getAllProvinces(limit, offset)

      res.json({
        success: true,
        provinces,
        count: provinces.length,
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },

  /**
   * GET /api/v1/provinces/:id
   * Get specific province
   */
  'GET /api/v1/provinces/:id': async (req: any, res: any) => {
    try {
      const provinceId = parseInt(req.params.id)
      if (isNaN(provinceId)) return res.status(400).json({ error: 'Invalid province ID' })

      const provinceService = new ProvinceService(dbClient)
      const province = await provinceService.getProvinceById(provinceId)

      if (!province) {
        return res.status(404).json({ error: 'Province not found' })
      }

      res.json({
        success: true,
        province,
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },

  /**
   * GET /api/v1/provinces/my-provinces
   * Get player's provinces
   */
  'GET /api/v1/provinces/my-provinces': async (req: any, res: any) => {
    try {
      const playerId = req.user?.id
      if (!playerId) return res.status(401).json({ error: 'Unauthorized' })

      const provinceService = new ProvinceService(dbClient)
      const provinces = await provinceService.getPlayerProvinces(playerId)

      res.json({
        success: true,
        provinces,
        count: provinces.length,
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },

  /**
   * POST /api/v1/provinces/:provinceId/upgrade/farmer
   * Upgrade farmer level
   */
  'POST /api/v1/provinces/:provinceId/upgrade/farmer': async (req: any, res: any) => {
    try {
      const playerId = req.user?.id
      if (!playerId) return res.status(401).json({ error: 'Unauthorized' })

      const provinceId = parseInt(req.params.provinceId)
      if (isNaN(provinceId)) return res.status(400).json({ error: 'Invalid province ID' })

      const provinceService = new ProvinceService(dbClient)
      const result = await provinceService.upgradeFarmerLevel(playerId, provinceId)

      res.json(result)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },

  /**
   * POST /api/v1/provinces/:provinceId/upgrade/resource
   * Upgrade resource level
   */
  'POST /api/v1/provinces/:provinceId/upgrade/resource': async (req: any, res: any) => {
    try {
      const playerId = req.user?.id
      if (!playerId) return res.status(401).json({ error: 'Unauthorized' })

      const provinceId = parseInt(req.params.provinceId)
      if (isNaN(provinceId)) return res.status(400).json({ error: 'Invalid province ID' })

      const provinceService = new ProvinceService(dbClient)
      const result = await provinceService.upgradeResourceLevel(playerId, provinceId)

      res.json(result)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },

  /**
   * POST /api/v1/provinces/:provinceId/upgrade/development
   * Upgrade development level
   */
  'POST /api/v1/provinces/:provinceId/upgrade/development': async (req: any, res: any) => {
    try {
      const playerId = req.user?.id
      if (!playerId) return res.status(401).json({ error: 'Unauthorized' })

      const provinceId = parseInt(req.params.provinceId)
      if (isNaN(provinceId)) return res.status(400).json({ error: 'Invalid province ID' })

      const provinceService = new ProvinceService(dbClient)
      const result = await provinceService.upgradeDevelopmentLevel(playerId, provinceId)

      res.json(result)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },
}

// ============================================================================
// GAME DATA ENDPOINTS
// ============================================================================

export const gameDataRoutes = {
  /**
   * GET /api/v1/game-data
   * Get all game configuration data
   */
  'GET /api/v1/game-data': async (req: any, res: any) => {
    try {
      res.json({
        success: true,
        data: {
          resources: MVP1_CONFIG.RESOURCES,
          buildings: MVP1_CONFIG.BUILDINGS,
          heroes: MVP1_CONFIG.MVP1_HEROES,
          achievements: MVP1_CONFIG.ACHIEVEMENTS,
          premium_pass: MVP1_CONFIG.PREMIUM_PASS_TIERS,
          game_balance: MVP1_CONFIG.GAME_BALANCE,
          tutorial_steps: MVP1_CONFIG.TUTORIAL_STEPS,
        },
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },

  /**
   * GET /api/v1/config
   * Get simplified game config
   */
  'GET /api/v1/config': async (req: any, res: any) => {
    try {
      res.json({
        success: true,
        config: {
          resource_names: Object.entries(MVP1_CONFIG.RESOURCES).map(([key, val]) => ({
            id: val.id,
            name: val.name_vietnamese,
            emoji: val.emoji,
          })),
          building_types: Object.keys(MVP1_CONFIG.BUILDINGS),
          max_player_level: MVP1_CONFIG.GAME_BALANCE.MAX_PLAYER_LEVEL,
          max_hero_level: MVP1_CONFIG.GAME_BALANCE.MAX_HERO_LEVEL,
        },
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },
}

// ============================================================================
// EXPORT ALL ROUTES
// ============================================================================

export const mvp1Routes = {
  ...playerRoutes,
  ...storyRoutes,
  ...quizRoutes,
  ...resourceRoutes,
  ...heroRoutes,
  ...provinceRoutes,
  ...gameDataRoutes,
}

export { initializeServices }
