/**
 * Province Service
 * Manages province data and player province upgrades
 */

import { Client } from 'pg'
import { MVP1_CONFIG } from '../config/mvp1.config'

export class ProvinceService {
  private dbClient: Client

  constructor(dbClient: Client) {
    this.dbClient = dbClient
  }

  /**
   * Get all provinces
   */
  async getAllProvinces(limit = 100, offset = 0) {
    try {
      const query = `
        SELECT 
          id, name, name_english, region, description,
          is_capital,
          base_gold_rate, base_rice_rate, base_wood_rate, base_stone_rate, base_bazan_rate,
          historical_eras, unlock_order, unlock_story_day
        FROM provinces
        ORDER BY id ASC
        LIMIT $1 OFFSET $2
      `
      const result = await this.dbClient.query(query, [limit, offset])
      return result.rows
    } catch (error: any) {
      throw new Error(`Failed to fetch provinces: ${error.message}`)
    }
  }

  /**
   * Get province by ID
   */
  async getProvinceById(provinceId: number) {
    try {
      const query = `
        SELECT 
          id, name, name_english, region, description,
          is_capital,
          base_gold_rate, base_rice_rate, base_wood_rate, base_stone_rate, base_bazan_rate,
          historical_eras, unlock_order, unlock_story_day
        FROM provinces
        WHERE id = $1
      `
      const result = await this.dbClient.query(query, [provinceId])
      return result.rows[0] || null
    } catch (error: any) {
      throw new Error(`Failed to fetch province: ${error.message}`)
    }
  }

  /**
   * Get player's province data
   */
  async getPlayerProvince(playerId: string, provinceId: number) {
    try {
      const query = `
        SELECT 
          pp.*,
          p.name,
          p.name_english,
          p.region,
          p.base_gold_rate,
          p.base_rice_rate,
          p.base_wood_rate,
          p.base_stone_rate,
          p.base_bazan_rate,
          h.name_vietnamese as hero_name,
          h.rarity as hero_rarity
        FROM player_provinces pp
        JOIN provinces p ON pp.province_id = p.id
        LEFT JOIN heroes h ON pp.hero_id = h.id
        WHERE pp.player_id = $1 AND pp.province_id = $2
      `
      const result = await this.dbClient.query(query, [playerId, provinceId])
      return result.rows[0] || null
    } catch (error: any) {
      throw new Error(`Failed to fetch player province: ${error.message}`)
    }
  }

  /**
   * Get all player provinces
   */
  async getPlayerProvinces(playerId: string) {
    try {
      const query = `
        SELECT 
          pp.*,
          p.name,
          p.name_english,
          p.region,
          p.is_capital,
          p.base_gold_rate,
          p.base_rice_rate,
          p.base_wood_rate,
          p.base_stone_rate,
          p.base_bazan_rate,
          h.name_vietnamese as hero_name,
          h.rarity as hero_rarity
        FROM player_provinces pp
        JOIN provinces p ON pp.province_id = p.id
        LEFT JOIN heroes h ON pp.hero_id = h.id
        WHERE pp.player_id = $1
        ORDER BY p.id ASC
      `
      const result = await this.dbClient.query(query, [playerId])
      return result.rows
    } catch (error: any) {
      throw new Error(`Failed to fetch player provinces: ${error.message}`)
    }
  }

  /**
   * Upgrade province farmer level
   */
  async upgradeFarmerLevel(playerId: string, provinceId: number) {
    try {
      await this.dbClient.query('BEGIN')

      const config = MVP1_CONFIG.PROVINCE_UPGRADES.FARMER
      const maxLevel = config.max_level

      // Get current level
      const currentQuery = `
        SELECT farmer_level FROM player_provinces
        WHERE player_id = $1 AND province_id = $2
      `
      const currentResult = await this.dbClient.query(currentQuery, [playerId, provinceId])

      if (currentResult.rows.length === 0) {
        throw new Error('Province not found for player')
      }

      const currentLevel = currentResult.rows[0].farmer_level
      const nextLevel = currentLevel + 1

      if (nextLevel > maxLevel) {
        throw new Error(`Farmer level already at maximum (${maxLevel})`)
      }

      // Calculate upgrade cost
      const goldCost = Math.floor(
        config.base_gold_cost * Math.pow(config.cost_multiplier, currentLevel - 1),
      )
      const riceCost = Math.floor(
        config.base_rice_cost * Math.pow(config.cost_multiplier, currentLevel - 1),
      )

      // Check resources
      const resourcesQuery = `SELECT resources FROM players WHERE id = $1`
      const resourcesResult = await this.dbClient.query(resourcesQuery, [playerId])
      const resources = resourcesResult.rows[0].resources

      if (resources.gold < goldCost || resources.rice < riceCost) {
        throw new Error('Insufficient resources for upgrade')
      }

      // Deduct resources
      await this.dbClient.query(
        `UPDATE players
         SET resources = jsonb_set(
           jsonb_set(
             resources,
             '{gold}',
             to_jsonb(CAST(resources->>'gold' AS INTEGER) - $1)
           ),
           '{rice}',
           to_jsonb(CAST(resources->>'rice' AS INTEGER) - $2)
         )
         WHERE id = $3`,
        [goldCost, riceCost, playerId],
      )

      // Upgrade level
      const upgradeQuery = `
        UPDATE player_provinces
        SET farmer_level = $1, updated_at = NOW()
        WHERE player_id = $2 AND province_id = $3
        RETURNING *
      `
      const upgradeResult = await this.dbClient.query(upgradeQuery, [nextLevel, playerId, provinceId])

      await this.dbClient.query('COMMIT')

      return {
        success: true,
        previous_level: currentLevel,
        new_level: nextLevel,
        upgrade_cost: {
          gold: goldCost,
          rice: riceCost,
        },
        province: upgradeResult.rows[0],
      }
    } catch (error: any) {
      await this.dbClient.query('ROLLBACK')
      throw new Error(`Failed to upgrade farmer level: ${error.message}`)
    }
  }

  /**
   * Upgrade province resource level
   */
  async upgradeResourceLevel(playerId: string, provinceId: number) {
    try {
      await this.dbClient.query('BEGIN')

      const config = MVP1_CONFIG.PROVINCE_UPGRADES.RESOURCE
      const maxLevel = config.max_level

      const currentQuery = `
        SELECT resource_level FROM player_provinces
        WHERE player_id = $1 AND province_id = $2
      `
      const currentResult = await this.dbClient.query(currentQuery, [playerId, provinceId])

      if (currentResult.rows.length === 0) {
        throw new Error('Province not found for player')
      }

      const currentLevel = currentResult.rows[0].resource_level
      const nextLevel = currentLevel + 1

      if (nextLevel > maxLevel) {
        throw new Error(`Resource level already at maximum (${maxLevel})`)
      }

      const goldCost = Math.floor(
        config.base_gold_cost * Math.pow(config.cost_multiplier, currentLevel - 1),
      )
      const riceCost = Math.floor(
        config.base_rice_cost * Math.pow(config.cost_multiplier, currentLevel - 1),
      )

      // Check resources and deduct
      const resourcesQuery = `SELECT resources FROM players WHERE id = $1`
      const resourcesResult = await this.dbClient.query(resourcesQuery, [playerId])
      const resources = resourcesResult.rows[0].resources

      if (resources.gold < goldCost || resources.rice < riceCost) {
        throw new Error('Insufficient resources for upgrade')
      }

      await this.dbClient.query(
        `UPDATE players
         SET resources = jsonb_set(
           jsonb_set(
             resources,
             '{gold}',
             to_jsonb(CAST(resources->>'gold' AS INTEGER) - $1)
           ),
           '{rice}',
           to_jsonb(CAST(resources->>'rice' AS INTEGER) - $2)
         )
         WHERE id = $3`,
        [goldCost, riceCost, playerId],
      )

      const upgradeQuery = `
        UPDATE player_provinces
        SET resource_level = $1, updated_at = NOW()
        WHERE player_id = $2 AND province_id = $3
        RETURNING *
      `
      const upgradeResult = await this.dbClient.query(upgradeQuery, [nextLevel, playerId, provinceId])

      await this.dbClient.query('COMMIT')

      return {
        success: true,
        previous_level: currentLevel,
        new_level: nextLevel,
        upgrade_cost: { gold: goldCost, rice: riceCost },
        province: upgradeResult.rows[0],
      }
    } catch (error: any) {
      await this.dbClient.query('ROLLBACK')
      throw new Error(`Failed to upgrade resource level: ${error.message}`)
    }
  }

  /**
   * Upgrade province development level
   */
  async upgradeDevelopmentLevel(playerId: string, provinceId: number) {
    try {
      await this.dbClient.query('BEGIN')

      const config = MVP1_CONFIG.PROVINCE_UPGRADES.DEVELOPMENT
      const maxLevel = config.max_level

      const currentQuery = `
        SELECT development_level FROM player_provinces
        WHERE player_id = $1 AND province_id = $2
      `
      const currentResult = await this.dbClient.query(currentQuery, [playerId, provinceId])

      if (currentResult.rows.length === 0) {
        throw new Error('Province not found for player')
      }

      const currentLevel = currentResult.rows[0].development_level
      const nextLevel = currentLevel + 1

      if (nextLevel > maxLevel) {
        throw new Error(`Development level already at maximum (${maxLevel})`)
      }

      const goldCost = Math.floor(
        config.base_gold_cost * Math.pow(config.cost_multiplier, currentLevel - 1),
      )
      const riceCost = Math.floor(
        config.base_rice_cost * Math.pow(config.cost_multiplier, currentLevel - 1),
      )

      // Check resources and deduct
      const resourcesQuery = `SELECT resources FROM players WHERE id = $1`
      const resourcesResult = await this.dbClient.query(resourcesQuery, [playerId])
      const resources = resourcesResult.rows[0].resources

      if (resources.gold < goldCost || resources.rice < riceCost) {
        throw new Error('Insufficient resources for upgrade')
      }

      await this.dbClient.query(
        `UPDATE players
         SET resources = jsonb_set(
           jsonb_set(
             resources,
             '{gold}',
             to_jsonb(CAST(resources->>'gold' AS INTEGER) - $1)
           ),
           '{rice}',
           to_jsonb(CAST(resources->>'rice' AS INTEGER) - $2)
         )
         WHERE id = $3`,
        [goldCost, riceCost, playerId],
      )

      const upgradeQuery = `
        UPDATE player_provinces
        SET development_level = $1, updated_at = NOW()
        WHERE player_id = $2 AND province_id = $3
        RETURNING *
      `
      const upgradeResult = await this.dbClient.query(upgradeQuery, [nextLevel, playerId, provinceId])

      await this.dbClient.query('COMMIT')

      return {
        success: true,
        previous_level: currentLevel,
        new_level: nextLevel,
        upgrade_cost: { gold: goldCost, rice: riceCost },
        province: upgradeResult.rows[0],
      }
    } catch (error: any) {
      await this.dbClient.query('ROLLBACK')
      throw new Error(`Failed to upgrade development level: ${error.message}`)
    }
  }
}
