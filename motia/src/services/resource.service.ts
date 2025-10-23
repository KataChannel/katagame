/**
 * Resource Service
 * Handles resource generation, harvesting, and trading
 */

import { Client } from 'pg'
import { MVP1_CONFIG } from '../config/mvp1.config'

export class ResourceService {
  private dbClient: Client

  constructor(dbClient: Client) {
    this.dbClient = dbClient
  }

  /**
   * Get all resources (game config data)
   */
  getResources() {
    return Object.values(MVP1_CONFIG.RESOURCES).map((r) => ({
      id: r.id,
      name_vietnamese: r.name_vietnamese,
      name_english: r.name_english,
      emoji: r.emoji,
      element: r.element,
      base_generation_rate: r.base_generation_rate,
      base_storage_capacity: r.base_storage_capacity,
    }))
  }

  /**
   * Get player resources
   */
  async getPlayerResources(playerId: string) {
    try {
      const query = `SELECT resources FROM players WHERE id = $1`
      const result = await this.dbClient.query(query, [playerId])

      if (result.rows.length === 0) {
        return null
      }

      return result.rows[0].resources
    } catch (error: any) {
      throw new Error(`Failed to fetch player resources: ${error.message}`)
    }
  }

  /**
   * Calculate resources generated for a province
   */
  async calculateProvinceGeneration(
    playerId: string,
    provinceId: number,
    timeDeltaSeconds: number,
  ) {
    try {
      const query = `
        SELECT 
          p.base_gold_rate,
          p.base_rice_rate,
          p.base_wood_rate,
          p.base_stone_rate,
          p.base_bazan_rate,
          COALESCE(pp.farmer_level, 1) AS farmer_level,
          COALESCE(pp.resource_level, 1) AS resource_level,
          COALESCE(pp.development_level, 1) AS development_level
        FROM provinces p
        LEFT JOIN player_provinces pp ON pp.province_id = p.id AND pp.player_id = $1
        WHERE p.id = $2
      `
      const result = await this.dbClient.query(query, [playerId, provinceId])

      if (result.rows.length === 0) {
        return null
      }

      const row = result.rows[0]
      const ticksElapsed = timeDeltaSeconds / MVP1_CONFIG.GAME_BALANCE.BASE_TICK_INTERVAL_SECONDS

      // Calculate bonuses from upgrade levels
      const farmerBonus = 1 + (row.farmer_level - 1) * 0.05 // 5% per level
      const resourceBonus = 1 + (row.resource_level - 1) * 0.1 // 10% per level
      const developmentBonus = 1 + (row.development_level - 1) * 0.08 // 8% per level

      const generation = {
        gold: Math.floor(row.base_gold_rate * farmerBonus * developmentBonus * ticksElapsed),
        rice: Math.floor(row.base_rice_rate * farmerBonus * developmentBonus * ticksElapsed),
        wood: Math.floor(row.base_wood_rate * farmerBonus * developmentBonus * ticksElapsed),
        stone: Math.floor(row.base_stone_rate * farmerBonus * developmentBonus * ticksElapsed),
        bazan: Math.floor(row.base_bazan_rate * farmerBonus * developmentBonus * ticksElapsed),
      }

      return generation
    } catch (error: any) {
      throw new Error(`Failed to calculate province generation: ${error.message}`)
    }
  }

  /**
   * Harvest resources from a province
   */
  async harvestResources(playerId: string, provinceId: number) {
    try {
      await this.dbClient.query('BEGIN')

      // Check last harvest time
      const lastHarvestQuery = `
        SELECT 
          EXTRACT(EPOCH FROM (NOW() - updated_at)) AS seconds_since_harvest
        FROM player_provinces
        WHERE player_id = $1 AND province_id = $2
      `
      const lastHarvestResult = await this.dbClient.query(lastHarvestQuery, [
        playerId,
        provinceId,
      ])

      if (lastHarvestResult.rows.length === 0) {
        throw new Error('Province not found for player')
      }

      const secondsSinceHarvest = lastHarvestResult.rows[0].seconds_since_harvest || 0

      // Check cooldown (5 minutes = 300 seconds)
      if (secondsSinceHarvest < MVP1_CONFIG.DAILY_ACTIVITIES.DAILY_HARVEST_COOLDOWN_SECONDS) {
        throw new Error(
          `Harvest on cooldown. Try again in ${Math.ceil(
            MVP1_CONFIG.DAILY_ACTIVITIES.DAILY_HARVEST_COOLDOWN_SECONDS - secondsSinceHarvest,
          )} seconds`,
        )
      }

      // Calculate resources
      const generation = await this.calculateProvinceGeneration(playerId, provinceId, secondsSinceHarvest)

      if (!generation) {
        throw new Error('Failed to calculate generation')
      }

      // Update player resources
      const updateResourcesQuery = `
        UPDATE players
        SET resources = jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(
                jsonb_set(
                  resources,
                  '{gold}',
                  to_jsonb(LEAST(
                    (CAST(resources->>'gold' AS INTEGER) + $2),
                    10000
                  ))
                ),
                '{rice}',
                to_jsonb(LEAST(
                  (CAST(resources->>'rice' AS INTEGER) + $3),
                  10000
                ))
              ),
              '{wood}',
              to_jsonb(LEAST(
                (CAST(resources->>'wood' AS INTEGER) + $4),
                10000
              ))
            ),
            '{stone}',
            to_jsonb(LEAST(
              (CAST(resources->>'stone' AS INTEGER) + $5),
              10000
            ))
          ),
          '{bazan}',
          to_jsonb(LEAST(
            (CAST(resources->>'bazan' AS INTEGER) + $6),
            10000
          ))
        )
        WHERE id = $1
        RETURNING resources
      `

      const updateResult = await this.dbClient.query(updateResourcesQuery, [
        playerId,
        generation.gold,
        generation.rice,
        generation.wood,
        generation.stone,
        generation.bazan,
      ])

      // Update harvest timestamp
      await this.dbClient.query(
        `UPDATE player_provinces SET updated_at = NOW() 
         WHERE player_id = $1 AND province_id = $2`,
        [playerId, provinceId],
      )

      await this.dbClient.query('COMMIT')

      return {
        success: true,
        resources_gained: generation,
        new_total: updateResult.rows[0].resources,
      }
    } catch (error: any) {
      await this.dbClient.query('ROLLBACK')
      throw new Error(`Failed to harvest resources: ${error.message}`)
    }
  }

  /**
   * Get top resource earners (leaderboard)
   */
  async getResourceLeaderboard(limit = 100) {
    try {
      const query = `
        SELECT 
          p.username,
          ps.total_gold_earned,
          ps.total_rice_earned,
          ps.total_wood_earned,
          ps.total_stone_earned,
          ps.total_bazan_earned,
          (ps.total_gold_earned + ps.total_rice_earned + ps.total_wood_earned + 
           ps.total_stone_earned + ps.total_bazan_earned) AS total_resources
        FROM player_stats ps
        JOIN players p ON ps.player_id = p.id
        ORDER BY total_resources DESC
        LIMIT $1
      `
      const result = await this.dbClient.query(query, [limit])
      return result.rows
    } catch (error: any) {
      throw new Error(`Failed to fetch resource leaderboard: ${error.message}`)
    }
  }
}
