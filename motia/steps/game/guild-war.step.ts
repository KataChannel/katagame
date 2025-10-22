import { Handlers } from 'motia'

/**
 * Guild War Processing Handler
 * - Process guild territorial wars
 * - Calculate war outcomes based on guild power
 * - Award territory and resources
 * - Update leaderboards
 */

export const config = {
  type: 'cron',
  cron: '0 */6 * * *', // Every 6 hours
  name: 'GuildWarProcessor',
  description: 'Process guild wars, update territory control, award rewards',
  emits: ['guild.territory_captured', 'guild.war_ended', 'player.gold_changed'],
  flows: ['game-flow'],
}

export const handler: Handlers['GuildWarProcessor'] = async ({
  logger,
  state,
  emit,
}: any) => {
  try {
    // Get all active guild wars
    const wars = await state.getGroup('war:active')

    for (const war of wars) {
      if (!war) continue

      const { attackerGuildId, defenderGuildId, provinceId, timestamp } = war

      // Get guilds and province
      const attacker = await state.get('guild', attackerGuildId)
      const defender = await state.get('guild', defenderGuildId)
      const province = await state.get('province', provinceId)

      if (!attacker || !defender || !province) {
        logger.warn('War participants not found', {
          attackerGuildId,
          defenderGuildId,
          provinceId,
        })
        continue
      }

      // Determine winner (attacker needs 20% power advantage)
      const powerRatio = attacker.total_power / defender.total_power
      const attackerWins = powerRatio > 1.2 // Attacker needs 20% advantage

      if (attackerWins) {
        // Territory captured
        province.controlled_by = attackerGuildId
        province.control_since = timestamp

        // Award treasury
        const reward = {
          gold: 10000,
          guildCoins: 500,
        }

        attacker.treasury = attacker.treasury || {}
        attacker.treasury.gold = (attacker.treasury.gold || 0) + reward.gold
        attacker.treasury.guildCoins = (attacker.treasury.guildCoins || 0) + reward.guildCoins

        await emit({
          topic: 'guild.territory_captured',
          data: {
            guildId: attackerGuildId,
            provinceId,
            territory: province.name,
            reward,
            timestamp,
          },
        })

        logger.info('Territory captured', {
          guildId: attackerGuildId,
          territory: province.name,
        })
      } else {
        // Territory defended
        const reward = {
          gold: 5000,
          guildCoins: 250,
        }

        defender.treasury = defender.treasury || {}
        defender.treasury.gold = (defender.treasury.gold || 0) + reward.gold
        defender.treasury.guildCoins = (defender.treasury.guildCoins || 0) + reward.guildCoins

        logger.info('Territory defended', {
          guildId: defenderGuildId,
          territory: province.name,
        })
      }

      // Update states
      await state.set('province', provinceId, province)
      await state.set('guild', attackerGuildId, attacker)
      await state.set('guild', defenderGuildId, defender)

      // Emit war ended event
      await emit({
        topic: 'guild.war_ended',
        data: {
          warId: war.id,
          attacker: attackerGuildId,
          defender: defenderGuildId,
          winner: attackerWins ? attackerGuildId : defenderGuildId,
          provinceId,
          timestamp,
        },
      })

      // Mark war as completed
      war.status = 'completed'
      await state.set('war:active', war.id, war)
    }
  } catch (error) {
    logger.error('Error in GuildWarProcessor', {
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
