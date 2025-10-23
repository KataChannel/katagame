/**
 * Hero Service
 * Manages hero recruitment, leveling, and team management
 */

import { Client } from 'pg'
import { MVP1_CONFIG } from '../config/mvp1.config'

export class HeroService {
  private dbClient: Client

  constructor(dbClient: Client) {
    this.dbClient = dbClient
  }

  /**
   * Get MVP1 available heroes
   */
  getAvailableHeroes() {
    return Object.values(MVP1_CONFIG.MVP1_HEROES)
  }

  /**
   * Get all MVP1 heroes with details
   */
  async getAllHeroes() {
    try {
      const query = `
        SELECT 
          id, name_vietnamese, name_english, era, rarity, role,
          base_hp, base_attack, base_defense, base_speed,
          bonus_type, bonus_value, pet_name, pet_emoji, pet_bonus,
          is_available
        FROM heroes
        WHERE is_available = true
        ORDER BY rarity DESC, name_vietnamese ASC
      `
      const result = await this.dbClient.query(query)
      return result.rows
    } catch (error: any) {
      throw new Error(`Failed to fetch heroes: ${error.message}`)
    }
  }

  /**
   * Get player's heroes
   */
  async getPlayerHeroes(playerId: string) {
    try {
      const query = `
        SELECT 
          h.id,
          h.name_vietnamese,
          h.name_english,
          h.era,
          h.rarity,
          h.role,
          h.base_hp,
          h.base_attack,
          h.base_defense,
          h.base_speed,
          h.bonus_type,
          h.bonus_value,
          h.pet_name,
          h.pet_emoji,
          h.pet_bonus,
          pp.hero_id IS NOT NULL AS is_deployed
        FROM heroes h
        LEFT JOIN player_provinces pp ON pp.hero_id = h.id
        WHERE h.is_available = true
        ORDER BY h.rarity DESC
      `
      const result = await this.dbClient.query(query)
      return result.rows
    } catch (error: any) {
      throw new Error(`Failed to fetch player heroes: ${error.message}`)
    }
  }

  /**
   * Recruit a hero for a player
   */
  async recruitHero(playerId: string, heroId: string) {
    try {
      await this.dbClient.query('BEGIN')

      // Get hero details
      const heroQuery = `SELECT * FROM heroes WHERE id = $1`
      const heroResult = await this.dbClient.query(heroQuery, [heroId])

      if (heroResult.rows.length === 0) {
        throw new Error('Hero not found')
      }

      const hero = heroResult.rows[0]

      // For MVP1, heroes are free to recruit (no cost)
      // Check if player already has this hero
      const existingQuery = `
        SELECT COUNT(*) as count
        FROM player_provinces
        WHERE hero_id = $1 AND player_id = $2
      `
      const existingResult = await this.dbClient.query(existingQuery, [heroId, playerId])

      if (existingResult.rows[0].count > 0) {
        throw new Error('Player already has this hero deployed')
      }

      // Recruit hero (in MVP1, we just mark availability, no separate table needed)
      const recruitQuery = `
        INSERT INTO player_provinces (player_id, province_id, hero_id)
        SELECT $1, p.id, $2
        FROM provinces p
        WHERE p.id = (SELECT MIN(id) FROM provinces WHERE id = 1) -- Deploy to first province
        LIMIT 1
        RETURNING *
      `
      const recruitResult = await this.dbClient.query(recruitQuery, [playerId, heroId])

      // Update player stats
      await this.dbClient.query(
        `UPDATE player_stats
         SET heroes_collected = heroes_collected + 1
         WHERE player_id = $1`,
        [playerId],
      )

      await this.dbClient.query('COMMIT')

      return {
        success: true,
        hero: hero,
        message: `Recruited ${hero.name_vietnamese} successfully!`,
      }
    } catch (error: any) {
      await this.dbClient.query('ROLLBACK')
      throw new Error(`Failed to recruit hero: ${error.message}`)
    }
  }

  /**
   * Deploy hero to a province
   */
  async deployHeroToProvince(playerId: string, heroId: string, provinceId: number) {
    try {
      await this.dbClient.query('BEGIN')

      // Check if player owns the province
      const provinceCheckQuery = `
        SELECT * FROM player_provinces
        WHERE player_id = $1 AND province_id = $2
      `
      const provinceCheckResult = await this.dbClient.query(provinceCheckQuery, [
        playerId,
        provinceId,
      ])

      if (provinceCheckResult.rows.length === 0) {
        throw new Error('Player does not own this province')
      }

      // Update deployment
      const deployQuery = `
        UPDATE player_provinces
        SET hero_id = $1
        WHERE player_id = $2 AND province_id = $3
        RETURNING *
      `
      const deployResult = await this.dbClient.query(deployQuery, [heroId, playerId, provinceId])

      await this.dbClient.query('COMMIT')

      return {
        success: true,
        deployment: deployResult.rows[0],
        message: 'Hero deployed successfully!',
      }
    } catch (error: any) {
      await this.dbClient.query('ROLLBACK')
      throw new Error(`Failed to deploy hero: ${error.message}`)
    }
  }

  /**
   * Calculate hero combat stats
   */
  calculateHeroStats(baseHero: any, level: number = 1) {
    // MVP1: Simple linear scaling
    const statMultiplier = 1 + (level - 1) * 0.2 // 20% per level

    return {
      level,
      hp: Math.floor(baseHero.base_hp * statMultiplier),
      attack: Math.floor(baseHero.base_attack * statMultiplier),
      defense: Math.floor(baseHero.base_defense * statMultiplier),
      speed: Math.floor(baseHero.base_speed * statMultiplier),
      bonus_value: Math.floor(baseHero.bonus_value * statMultiplier),
    }
  }

  /**
   * Get hero leaderboard
   */
  async getHeroLeaderboard(limit = 100) {
    try {
      const query = `
        SELECT 
          p.username,
          ps.heroes_collected,
          ps.heroes_leveled_up,
          COUNT(DISTINCT pp.hero_id) AS heroes_deployed
        FROM player_stats ps
        JOIN players p ON ps.player_id = p.id
        LEFT JOIN player_provinces pp ON pp.player_id = ps.player_id AND pp.hero_id IS NOT NULL
        GROUP BY ps.player_id, p.username, ps.heroes_collected, ps.heroes_leveled_up
        ORDER BY ps.heroes_collected DESC
        LIMIT $1
      `
      const result = await this.dbClient.query(query, [limit])
      return result.rows
    } catch (error: any) {
      throw new Error(`Failed to fetch hero leaderboard: ${error.message}`)
    }
  }
}
